"""
bank_simulation.py
==================
Simulates 100,000 deposits and 100,000 withdrawals by the same person
using threads, demonstrating race conditions and how a Mutex (Lock) fixes them.

Run:
    python bank_simulation.py
"""

import threading
import time


# ─────────────────────────────────────────────
#  Bank Account
# ─────────────────────────────────────────────

class BankAccount:
    def __init__(self, owner: str, initial_balance: float = 0.0):
        self.owner = owner
        self.balance = initial_balance
        self._lock = threading.Lock()

    # ── Thread-UNSAFE operations ──────────────
    def deposit_unsafe(self, amount: float):
        """No lock: susceptible to race conditions."""
        current = self.balance
        # Simulate a tiny processing delay that exposes the race window
        current += amount
        self.balance = current

    def withdraw_unsafe(self, amount: float):
        current = self.balance
        current -= amount
        self.balance = current

    # ── Thread-SAFE operations ────────────────
    def deposit_safe(self, amount: float):
        with self._lock:
            self.balance += amount

    def withdraw_safe(self, amount: float):
        with self._lock:
            self.balance -= amount


# ─────────────────────────────────────────────
#  Worker functions
# ─────────────────────────────────────────────

def run_deposits(account: BankAccount, n: int, amount: float, safe: bool):
    for _ in range(n):
        if safe:
            account.deposit_safe(amount)
        else:
            account.deposit_unsafe(amount)


def run_withdrawals(account: BankAccount, n: int, amount: float, safe: bool):
    for _ in range(n):
        if safe:
            account.withdraw_safe(amount)
        else:
            account.withdraw_unsafe(amount)


# ─────────────────────────────────────────────
#  Experiment runner
# ─────────────────────────────────────────────

def run_experiment(label: str, safe: bool,
                   ops: int = 100_000,
                   deposit_amount: float = 100.0,
                   withdraw_amount: float = 100.0,
                   initial_balance: float = 0.0):
    """
    Each experiment:
      • Starts with `initial_balance`
      • Spawns one thread doing `ops` deposits of `deposit_amount`
      • Spawns one thread doing `ops` withdrawals of `withdraw_amount`
      • Expected final balance = initial_balance + ops*deposit - ops*withdraw
    """
    expected = initial_balance + ops * deposit_amount - ops * withdraw_amount

    account = BankAccount("Alice", initial_balance)

    t_deposit = threading.Thread(
        target=run_deposits,
        args=(account, ops, deposit_amount, safe)
    )
    t_withdraw = threading.Thread(
        target=run_withdrawals,
        args=(account, ops, withdraw_amount, safe)
    )

    start = time.perf_counter()
    t_deposit.start()
    t_withdraw.start()
    t_deposit.join()
    t_withdraw.join()
    elapsed = time.perf_counter() - start

    actual = account.balance
    ok = abs(actual - expected) < 0.01   # floating-point tolerance

    print(f"\n{'='*55}")
    print(f"  {label}")
    print(f"{'='*55}")
    print(f"  Operations     : {ops:,} deposits + {ops:,} withdrawals")
    print(f"  Amount each    : ${deposit_amount:.2f} deposit / ${withdraw_amount:.2f} withdrawal")
    print(f"  Initial balance: ${initial_balance:,.2f}")
    print(f"  Expected final : ${expected:,.2f}")
    print(f"  Actual final   : ${actual:,.2f}")
    print(f"  Difference     : ${actual - expected:,.2f}")
    print(f"  Result         : {'✅ CORRECT' if ok else '❌ WRONG (race condition!)'}")
    print(f"  Time elapsed   : {elapsed:.3f}s")


# ─────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "━"*55)
    print("  Bank Account Thread-Safety Demonstration")
    print("  Same person: 100,000 deposits & 100,000 withdrawals")
    print("━"*55)

    # Demo 1 – WITHOUT mutex (expect wrong answer)
    run_experiment(
        label="Demo 1: WITHOUT Mutex (race condition expected)",
        safe=False,
        ops=100_000,
        deposit_amount=1.0,
        withdraw_amount=1.0,
        initial_balance=0.0
    )

    # Demo 2 – WITH mutex (expect correct answer)
    run_experiment(
        label="Demo 2: WITH Mutex (correct answer guaranteed)",
        safe=True,
        ops=100_000,
        deposit_amount=1.0,
        withdraw_amount=1.0,
        initial_balance=0.0
    )

    print("\n" + "━"*55)
    print("  Explanation")
    print("━"*55)
    print("""
  Race condition occurs when two threads read the same
  balance value before either has written its result back.
  Both then overwrite the balance, and one update is lost.

  A Mutex (threading.Lock) forces only one thread at a time
  into the critical section, making every update atomic and
  ensuring the final balance is always correct.
""")
