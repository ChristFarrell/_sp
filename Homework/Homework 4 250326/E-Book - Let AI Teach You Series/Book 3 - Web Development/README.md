# Book 3: Web Development with AI

*Build modern, responsive websites with AI as your development partner*

---

## Table of Contents

1. [Web Development Fundamentals](#fundamentals)
2. [HTML5 Deep Dive](#html)
3. [CSS3 & Modern Styling](#css)
4. [Responsive Design](#responsive)
5. [CSS Frameworks](#frameworks)
6. [JavaScript Frameworks](#js-frameworks)
7. [Backend Basics](#backend)
8. [Deployment](#deployment)
9. [AI-Powered Workflow](#ai-workflow)

---

<a name="fundamentals"></a>
## Chapter 1: Web Development Fundamentals

### The Web Stack
```
┌─────────────────────────────────────┐
│            FRONTEND                 │
│  (HTML, CSS, JavaScript, React)     │
├─────────────────────────────────────┤
│            BACKEND                  │
│  (Node.js, Python, Database)        │
├─────────────────────────────────────┤
│            DEPLOYMENT               │
│  (Vercel, Netlify, AWS)            │
└─────────────────────────────────────┘
```

### How the Web Works
1. User types a URL in browser
2. Browser sends request to server
3. Server processes request
4. Server sends back HTML, CSS, JS files
5. Browser renders the page
6. JavaScript adds interactivity

### Your Development Environment
```bash
# Recommended tools
- VS Code (code editor)
- Chrome DevTools (debugging)
- Git (version control)
- Node.js (JavaScript runtime)
- npm/yarn (package managers)
```

**AI Tip:** Ask "What are the best VS Code extensions for web development?"

---

<a name="html"></a>
## Chapter 2: HTML5 Deep Dive

### Semantic HTML
```html
<!-- Non-semantic -->
<div class="header">...</div>
<div class="nav">...</div>

<!-- Semantic (better!) -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<footer>...</footer>
```

### Forms & Validation
```html
<form id="signupForm" novalidate>
    <input type="email" id="email" name="email" required>
    <input type="password" id="password" name="password" required minlength="8">
    <button type="submit">Sign Up</button>
</form>
```

---

<a name="css"></a>
## Chapter 3: CSS3 & Modern Styling

### CSS Variables (Custom Properties)
```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --spacing: 1rem;
    --border-radius: 8px;
}

.button {
    background-color: var(--primary-color);
    padding: var(--spacing);
    border-radius: var(--border-radius);
}
```

### Flexbox Layout
```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}
```

### Grid Layout
```css
.dashboard {
    display: grid;
    grid-template-columns: 250px 1fr 300px;
    gap: 1rem;
}

@media (max-width: 768px) {
    .dashboard {
        grid-template-columns: 1fr;
    }
}
```

---

<a name="responsive"></a>
## Chapter 4: Responsive Design

### Mobile-First Approach
```css
/* Base styles (mobile) */
.container {
    width: 100%;
    padding: 0 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        max-width: 720px;
        margin: 0 auto;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 960px;
    }
}
```

### Responsive Typography
```css
.heading {
    font-size: clamp(1.5rem, 5vw, 3rem);
}
```

---

<a name="frameworks"></a>
## Chapter 5: CSS Frameworks

### Tailwind CSS Classes Example
```html
<div class="min-h-screen bg-gray-100 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Dashboard
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-md p-6">
            Content
        </div>
    </div>
</div>
```

---

<a name="js-frameworks"></a>
## Chapter 6: JavaScript Frameworks

### React Setup
```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

### React Component
```jsx
import { useState, useEffect } from "react";

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetch(`https://api.example.com/users/${userId}`)
            .then(res => res.json())
            .then(data => setUser(data));
    }, [userId]);
    
    if (!user) return <div>Loading...</div>;
    
    return (
        <div className="profile">
            <h2>{user.name}</h2>
            <p>{user.bio}</p>
        </div>
    );
}
```

---

<a name="backend"></a>
## Chapter 7: Backend Basics

### Express.js Server
```javascript
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// GET all users
app.get("/api/users", (req, res) => {
    res.json(users);
});

// POST create user
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

<a name="deployment"></a>
## Chapter 8: Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

<a name="ai-workflow"></a>
## Chapter 9: AI-Powered Workflow

### AI Development Workflow
```
1. Plan → Ask AI: "Help me design a [type] app"
2. Structure → Ask AI: "Create a folder structure for [project]"
3. Implement → Ask AI: "Write the [component/function]"
4. Debug → Ask AI: "Fix this error: [paste error]"
5. Optimize → Ask AI: "Improve performance of [code]"
```

### Essential AI Prompts

| Task | Prompt |
|------|--------|
| Generate component | "Create a responsive navbar component" |
| API integration | "Write fetch code to call [API]" |
| Styling help | "Create a modern card design with hover effects" |
| Debug | "I'm getting [error]. Here's the code: [paste]" |

---

## Mini Projects

1. **Weather Dashboard** - Fetch and display weather data
2. **Blog with Comments** - CRUD for posts and comments
3. **E-commerce Store** - Product catalog with cart

---

*You're now a full-stack developer! The web is your canvas.*
