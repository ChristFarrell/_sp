"""
app.py — Flask web server for FileManager via FUSE

Architecture:
  Browser → Flask (app.py) → fuse_bridge.py → /mnt/windows-e (FUSE)
                                              → fuse_client (binary, C)
                                              → fs_server.exe (Windows, C)
                                              → Drive E:\

No more direct access to 'E:\\' or os.path here.
All filesystem operations are delegated to fuse_bridge.

"""

import os
import json
import time
import smtplib
import logging
import secrets
import mimetypes

from dotenv import load_dotenv, set_key
load_dotenv()   # read .env before anything else

# ── Auto-generate SECRET_KEY if not in .env ───────────────────
_ENV_FILE = os.path.join(os.path.dirname(__file__), '.env')
if not os.environ.get('SECRET_KEY'):
    _new_key = secrets.token_hex(32)
    os.environ['SECRET_KEY'] = _new_key
    # Write to .env so it persists across restarts
    try:
        set_key(_ENV_FILE, 'SECRET_KEY', _new_key)
        print(f"[app.py] SECRET_KEY generated and saved to .env")
    except Exception:
        print(f"[app.py] SECRET_KEY generated (could not write to .env)")

from flask import (Flask, render_template, request, jsonify,
                   send_file, redirect, url_for, flash, session,
                   Response, stream_with_context)
from flask_login import (LoginManager, UserMixin, login_user,
                         logout_user, login_required, current_user)
from flask_wtf.csrf import CSRFProtect, CSRFError
from werkzeug.utils import secure_filename
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

import fuse_bridge as fs   # all file operations go through here

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    filename='audit.log', level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)

def log_event(action, detail='', status='OK'):
    try:
        ip   = request.remote_addr or 'unknown'
        user = current_user.username \
               if current_user and current_user.is_authenticated else 'anonymous'
    except Exception:
        ip = user = 'unknown'
    logging.info(
        f"user={user} | ip={ip} | action={action} | detail={detail} | status={status}"
    )

# ═══════════════════════════════════════════════════════════════
# ⚙️  CONFIGURATION — all sensitive values from .env
# ═══════════════════════════════════════════════════════════════
GMAIL_SENDER   = os.environ['GMAIL_SENDER']        # e.g. you@gmail.com
GMAIL_APP_PASS = os.environ['GMAIL_APP_PASS']      # Gmail App Password
EMAIL_RECEIVER = os.environ['EMAIL_RECEIVER']      # OTP recipient

SESSION_LIFETIME_MINUTES = 60
MAX_LOGIN_ATTEMPTS       = 5
LOCKOUT_MINUTES          = 15
OTP_EXPIRE_SECONDS       = 300
# ═══════════════════════════════════════════════════════════════

app = Flask(__name__)
# SECRET_KEY must be a fixed (static) value so sessions don't expire on restart.
# Generate once: python3 -c "import secrets; print(secrets.token_hex(32))"
# then store in .env as SECRET_KEY=<value>
app.secret_key = os.environ['SECRET_KEY']   # guaranteed set above
csrf = CSRFProtect(app)

USERS_FILE     = 'users.json'
login_manager  = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_attempts: dict = {}


# ── CSRF error handler ────────────────────────────────────────
@app.errorhandler(CSRFError)
def handle_csrf(e):
    flash('Invalid request (CSRF). Please try again.', 'error')
    return redirect(url_for('login')), 400


# ── User model ───────────────────────────────────────────────
class User(UserMixin):
    def __init__(self, uid, username):
        self.id       = uid
        self.username = username


def load_users() -> dict:
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return {}


def save_users(u: dict) -> None:
    with open(USERS_FILE, 'w') as f:
        json.dump(u, f, indent=4)


if not os.path.exists(USERS_FILE):
    save_users({"1": {"username": "admin", "email": EMAIL_RECEIVER}})


@login_manager.user_loader
def load_user(uid):
    users = load_users()
    if uid in users:
        return User(uid, users[uid]['username'])
    return None


# ── Rate limiting ─────────────────────────────────────────────
def get_ip() -> str:
    return request.headers.get('X-Forwarded-For', request.remote_addr)


def check_rate_limit(ip: str) -> tuple[bool, int]:
    now = time.time()
    rec = login_attempts.get(ip, {'attempts': 0, 'locked_until': 0})
    if rec['locked_until'] > now:
        return False, int(rec['locked_until'] - now)
    if rec['locked_until'] and rec['locked_until'] <= now:
        login_attempts[ip] = {'attempts': 0, 'locked_until': 0}
    return True, 0


def record_fail(ip: str) -> None:
    now = time.time()
    rec = login_attempts.get(ip, {'attempts': 0, 'locked_until': 0})
    rec['attempts'] += 1
    if rec['attempts'] >= MAX_LOGIN_ATTEMPTS:
        rec['locked_until'] = now + LOCKOUT_MINUTES * 60
    login_attempts[ip] = rec


def reset_attempts(ip: str) -> None:
    login_attempts.pop(ip, None)


# ── OTP helpers ───────────────────────────────────────────────
def mask_email(email: str) -> str:
    try:
        local, domain = email.split('@', 1)
        return local[0] + '*' * (len(local) - 1) + '@' + domain
    except Exception:
        return '****@****.***'


def generate_otp() -> str:
    # secrets.randbelow() is a CSPRNG — cannot be predicted like random.randint()
    return f"{secrets.randbelow(900000) + 100000}"


def send_otp_email(otp: str, username: str) -> bool:
    try:
        msg            = MIMEMultipart('alternative')
        msg['Subject'] = f'🔐 FileManager Login Code: {otp}'
        msg['From']    = GMAIL_SENDER
        msg['To']      = EMAIL_RECEIVER
        html = f"""
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;
                    background:#faf8f5;border-radius:18px;overflow:hidden;
                    border:1px solid #e8dfd4;box-shadow:0 20px 60px rgba(93,64,55,.12);">
          <div style="height:4px;background:linear-gradient(90deg,#a1887f,#5d4037,#8d6e63);"></div>
          <div style="background:linear-gradient(135deg,#5d4037 0%,#8d6e63 100%);padding:28px 32px;">
            <h2 style="margin:0;color:#fff;font-family:'Georgia',serif;font-size:22px;">🗄️ FileManager</h2>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.75);font-size:13px;">Secure Access via Tailscale + FUSE</p>
          </div>
          <div style="padding:32px;background:#ffffff;color:#3e2723;">
            <p style="margin:0 0 6px;font-size:15px;">Hello <strong style="color:#5d4037;">{username}</strong>,</p>
            <p style="margin:0 0 24px;color:#795548;font-size:14px;">Use the code below to sign in:</p>
            <div style="background:#faf8f5;border:2px solid #e8dfd4;border-radius:12px;
                        padding:28px;text-align:center;margin-bottom:24px;">
              <div style="font-size:46px;font-weight:700;letter-spacing:16px;color:#5d4037;
                          font-family:'Courier New',monospace;">{otp}</div>
              <p style="margin:14px 0 0;color:#795548;font-size:12px;">
                ⏱️ Valid for <strong style="color:#d32f2f;">5 minutes</strong></p>
            </div>
            <p style="color:#795548;font-size:13px;">If this wasn't you, please ignore this email.</p>
          </div>
          <div style="background:#faf8f5;padding:14px 32px;border-top:1px solid #e8dfd4;">
            <p style="margin:0;color:#a1887f;font-size:11px;">Automated message — please do not reply.</p>
          </div>
        </div>"""
        msg.attach(MIMEText(html, 'html'))
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
            s.login(GMAIL_SENDER, GMAIL_APP_PASS)
            s.sendmail(GMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        log_event('OTP_SENT', f'to={EMAIL_RECEIVER}')
        return True
    except Exception as e:
        log_event('OTP_FAIL', str(e), 'ERROR')
        return False


# ── Session timeout ───────────────────────────────────────────
@app.before_request
def enforce_session():
    if current_user and current_user.is_authenticated:
        last = session.get('last_active')
        if last and datetime.utcnow() - datetime.fromisoformat(last) \
                > timedelta(minutes=SESSION_LIFETIME_MINUTES):
            logout_user()
            session.clear()
            flash('Session expired. Please log in again.', 'error')
            return redirect(url_for('login'))
        session['last_active'] = datetime.utcnow().isoformat()


# ═══════════════════════════════════════════════════════════════
# Auth routes
# ═══════════════════════════════════════════════════════════════

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        ip       = get_ip()
        ok, wait = check_rate_limit(ip)
        if not ok:
            flash(f'Too many attempts. Please wait {wait} seconds.', 'error')
            return redirect(url_for('login'))

        username = request.form.get('username', '').strip()
        users    = load_users()
        matched  = next(
            ((uid, d) for uid, d in users.items() if d['username'] == username),
            None
        )

        if not matched:
            record_fail(ip)
            flash('Username not found.', 'error')
            return redirect(url_for('login'))

        uid, udata = matched
        otp        = generate_otp()
        session.update({
            'pending_user_id':  uid,
            'pending_otp':      otp,
            'otp_expires':      (datetime.utcnow() + timedelta(seconds=OTP_EXPIRE_SECONDS)).isoformat(),
            'pending_ip':       ip,
            'pending_username': username,
        })

        if not send_otp_email(otp, username):
            flash('Failed to send email. Check GMAIL_APP_PASS in .env.', 'error')
            return redirect(url_for('login'))

        flash(f'OTP code sent to {mask_email(EMAIL_RECEIVER)} — valid for 5 minutes.', 'success')
        return redirect(url_for('verify_otp'))

    return render_template('login.html')


@app.route('/verify-otp', methods=['GET', 'POST'])
def verify_otp():
    if not session.get('pending_user_id'):
        return redirect(url_for('login'))

    if request.method == 'POST':
        code    = request.form.get('code', '').strip()
        ip      = session.get('pending_ip', get_ip())
        uid     = session.get('pending_user_id')
        saved   = session.get('pending_otp')
        expires = session.get('otp_expires')

        if datetime.utcnow() > datetime.fromisoformat(expires):
            session.clear()
            flash('OTP code expired. Please log in again.', 'error')
            return redirect(url_for('login'))

        if code != saved:
            record_fail(ip)
            flash('Incorrect OTP code.', 'error')
            return redirect(url_for('verify_otp'))

        users = load_users()
        user  = User(uid, users[uid]['username'])
        login_user(user)
        for k in ('pending_user_id', 'pending_otp', 'otp_expires',
                  'pending_ip', 'pending_username'):
            session.pop(k, None)
        session['last_active'] = datetime.utcnow().isoformat()
        reset_attempts(ip)
        log_event('LOGIN_OK', f'username={user.username}')
        return redirect(url_for('index'))

    return render_template(
        'verify_otp.html',
        email_hint=mask_email(EMAIL_RECEIVER),
        username=session.get('pending_username', ''),
    )


@app.route('/resend-otp')
def resend_otp():
    uid = session.get('pending_user_id')
    if not uid:
        return redirect(url_for('login'))
    users    = load_users()
    username = users.get(uid, {}).get('username', '')
    otp      = generate_otp()
    session['pending_otp']  = otp
    session['otp_expires']  = (datetime.utcnow() + timedelta(seconds=OTP_EXPIRE_SECONDS)).isoformat()
    ok = send_otp_email(otp, username)
    flash('New OTP code sent!' if ok else 'Failed to resend code.', 'success' if ok else 'error')
    return redirect(url_for('verify_otp'))


@app.route('/logout')
@login_required
def logout():
    log_event('LOGOUT')
    logout_user()
    session.clear()
    return redirect(url_for('login'))


# ═══════════════════════════════════════════════════════════════
# Main page
# ═══════════════════════════════════════════════════════════════

@app.route('/')
@login_required
def index():
    mounted = fs.fuse_is_mounted()
    return render_template('index.html',
                           username=current_user.username,
                           fuse_mounted=mounted)


# ═══════════════════════════════════════════════════════════════
# Filesystem API — all through fuse_bridge
# ═══════════════════════════════════════════════════════════════

@app.route('/api/browse')
@login_required
def browse():
    rel = request.args.get('path', '')
    if not fs.is_safe_path(rel) and rel != '':
        return jsonify({'error': 'Invalid path'}), 403
    try:
        items  = fs.fuse_listdir(rel)
        parent = fs.parent_path(rel)
        return jsonify({
            'items':        items,
            'current_path': rel,
            'parent_path':  parent,
            'fuse_root':    fs.FUSE_MOUNT,
        })
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    except NotADirectoryError:
        return jsonify({'error': 'Not a directory'}), 400
    except FileNotFoundError:
        return jsonify({'error': 'Directory not found'}), 404
    except OSError as e:
        log_event('BROWSE_ERR', str(e), 'ERROR')
        if not fs.fuse_is_mounted():
            return jsonify({'error': 'FUSE mount is not active. Run fuse_client first.'}), 503
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload', methods=['POST'])
@login_required
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    rel  = request.form.get('path', '')
    if not file.filename:
        return jsonify({'error': 'Filename is empty'}), 400
    if not fs.is_safe_path(rel) and rel != '':
        return jsonify({'error': 'Invalid path'}), 403
    if not fs.allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    filename = secure_filename(file.filename)
    try:
        saved = fs.fuse_save(file, rel, filename)
        log_event('UPLOAD', f'file={filename} path={rel}')
        return jsonify({'success': True, 'message': f'File {filename} uploaded successfully!', 'filename': filename})
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    except NotADirectoryError:
        return jsonify({'error': 'Destination directory not found'}), 404
    except OSError as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download')
@login_required
def download():
    """
    Download file with chunked streaming.
    Does not load the entire file into RAM — safe for GB-sized files.
    """
    rel = request.args.get('path', '')
    if not fs.is_safe_path(rel):
        return jsonify({'error': 'Invalid path'}), 403
    try:
        full = fs.fuse_full_path(rel)
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    if not os.path.exists(full) or os.path.isdir(full):
        return jsonify({'error': 'File not found'}), 404

    filename  = os.path.basename(full)
    file_size = fs.fuse_file_size(rel)
    mime      = fs.mime_for(filename) or \
                mimetypes.guess_type(filename)[0] or \
                'application/octet-stream'

    log_event('DOWNLOAD', f'file={rel}')

    def generate():
        yield from fs.fuse_stream(rel)

    resp = Response(
        stream_with_context(generate()),
        status=200,
        mimetype=mime,
        headers={
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Length':      str(file_size),
            'Accept-Ranges':       'bytes',
        }
    )
    return resp


@app.route('/api/preview')
@login_required
def preview():
    """
    Serve file for preview / inline playback.

    Supports HTTP Range requests so that:
    - Video/audio can be seeked without full buffering
    - Browser sends 'Range: bytes=X-Y' header → we respond with 206
    - Text/PDF files are served normally (200)
    """
    rel = request.args.get('path', '')
    if not fs.is_safe_path(rel):
        return jsonify({'error': 'Invalid path'}), 403
    try:
        full = fs.fuse_full_path(rel)
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    if not os.path.exists(full) or os.path.isdir(full):
        return jsonify({'error': 'File not found'}), 404

    filename  = os.path.basename(full)
    file_size = fs.fuse_file_size(rel)
    mime      = fs.mime_for(filename) or \
                mimetypes.guess_type(filename)[0] or \
                'application/octet-stream'

    range_header = request.headers.get('Range')

    # ── Partial content (Range request) ── browser seeking video/audio
    if range_header:
        try:
            # Parse "bytes=START-END"
            byte_range = range_header.replace('bytes=', '').strip()
            parts      = byte_range.split('-')
            start      = int(parts[0]) if parts[0] else 0
            end        = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
        except (ValueError, IndexError):
            return Response('Invalid Range header', status=416)

        # Clamp to file boundaries
        start  = max(0, min(start, file_size - 1))
        end    = max(start, min(end, file_size - 1))
        length = end - start + 1

        log_event('PREVIEW_RANGE', f'file={rel} bytes={start}-{end}')

        def generate_range():
            yield from fs.fuse_stream(rel, start=start, length=length)

        return Response(
            stream_with_context(generate_range()),
            status=206,
            mimetype=mime,
            headers={
                'Content-Range':  f'bytes {start}-{end}/{file_size}',
                'Content-Length': str(length),
                'Accept-Ranges':  'bytes',
            }
        )

    # ── Full file ── normal preview (PDF, image, text, etc.)
    log_event('PREVIEW', f'file={rel}')

    def generate_full():
        yield from fs.fuse_stream(rel)

    return Response(
        stream_with_context(generate_full()),
        status=200,
        mimetype=mime,
        headers={
            'Content-Length':      str(file_size),
            'Accept-Ranges':       'bytes',
            'Content-Disposition': f'inline; filename="{filename}"',
        }
    )


@app.route('/api/delete', methods=['POST'])
@login_required
def delete():
    data = request.get_json()
    rel  = data.get('path', '')
    if not fs.is_safe_path(rel):
        return jsonify({'error': 'Invalid path'}), 403
    try:
        if fs.fuse_is_dir(rel):
            fs.fuse_rmdir(rel)
        else:
            fs.fuse_unlink(rel)
        log_event('DELETE', f'path={rel}')
        return jsonify({'success': True, 'message': 'Deleted successfully'})
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except OSError as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/create_folder', methods=['POST'])
@login_required
def create_folder():
    data = request.get_json()
    rel  = data.get('path', '')
    name = secure_filename(data.get('folder_name', '').strip())
    if not name or (not fs.is_safe_path(rel) and rel != ''):
        return jsonify({'error': 'Invalid input'}), 400
    try:
        fs.fuse_mkdir(os.path.join(rel, name).replace('\\', '/'))
        log_event('CREATE_FOLDER', f'folder={name} path={rel}')
        return jsonify({'success': True, 'message': f'Folder "{name}" created successfully'})
    except FileExistsError:
        return jsonify({'error': 'Folder already exists'}), 400
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    except OSError as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/rename', methods=['POST'])
@login_required
def rename():
    data     = request.get_json()
    rel_old  = data.get('path', '')
    new_name = secure_filename(data.get('new_name', '').strip())
    if not fs.is_safe_path(rel_old) or not new_name:
        return jsonify({'error': 'Invalid input'}), 400

    parent  = fs.parent_path(rel_old) or ''
    rel_new = os.path.join(parent, new_name).replace('\\', '/').lstrip('/')
    try:
        fs.fuse_rename(rel_old, rel_new)
        log_event('RENAME', f'{rel_old} -> {rel_new}')
        return jsonify({'success': True, 'message': f'Renamed to "{new_name}"'})
    except FileExistsError:
        return jsonify({'error': 'Name already in use'}), 400
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    except OSError as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/copy', methods=['POST'])
@login_required
def copy_item():
    import shutil
    data     = request.get_json()
    src      = data.get('src', '')
    dest_dir = data.get('dest_dir', '')    # destination folder (rel path)
    new_name = secure_filename(data.get('new_name', '').strip())

    if not fs.is_safe_path(src) or not new_name:
        return jsonify({'error': 'Invalid input'}), 400
    if dest_dir and not fs.is_safe_path(dest_dir):
        return jsonify({'error': 'Invalid destination'}), 400

    try:
        src_full  = fs.fuse_full_path(src)
        dest_full = fs.fuse_full_path(dest_dir) if dest_dir else fs.fuse_full_path('')
        if not os.path.exists(src_full):
            return jsonify({'error': 'Source not found'}), 404
        dest_path = os.path.join(dest_full, new_name)
        if os.path.exists(dest_path):
            return jsonify({'error': f'"{new_name}" already exists at destination'}), 400
        if os.path.isdir(src_full):
            shutil.copytree(src_full, dest_path)
        else:
            shutil.copy2(src_full, dest_path)
        log_event('COPY', f'src={src} dest={dest_path}')
        return jsonify({'success': True, 'message': f'"{new_name}" copied successfully!'})
    except PermissionError:
        return jsonify({'error': 'Access denied'}), 403
    except OSError as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/storage')
@login_required
def storage():
    """Disk usage info — fetched via FUSE statvfs → Windows Drive E:."""
    try:
        return jsonify(fs.fuse_statvfs())
    except OSError as e:
        if not fs.fuse_is_mounted():
            return jsonify({'error': 'FUSE is not active'}), 503
        return jsonify({'error': str(e)}), 500


@app.route('/api/fuse_status')
@login_required
def fuse_status():
    """Health-check endpoint: is the FUSE mount active?"""
    mounted = fs.fuse_is_mounted()
    return jsonify({
        'mounted':    mounted,
        'mount_path': fs.FUSE_MOUNT,
    }), 200 if mounted else 503


# ── Security headers ──────────────────────────────────────────
@app.after_request
def security_headers(r):
    r.headers['X-Frame-Options']        = 'DENY'
    r.headers['X-Content-Type-Options'] = 'nosniff'
    r.headers['Referrer-Policy']        = 'same-origin'
    # CSP: allow media from same origin (for video/audio preview)
    r.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "media-src 'self'; "
        "img-src 'self' data:; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline';"
    )
    return r


if __name__ == '__main__':
    if not fs.fuse_is_mounted():
        print(f"[WARNING] FUSE mount is not active at {fs.FUSE_MOUNT}.")
        print(f"          Run: ./fuse_client {fs.FUSE_MOUNT} -o server=<TAILSCALE_IP>")
    app.run(host='0.0.0.0', port=5000, debug=False)