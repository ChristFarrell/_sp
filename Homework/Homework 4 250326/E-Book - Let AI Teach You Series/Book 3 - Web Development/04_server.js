/**
 * Book 3: Web Development
 * Express.js Backend - Chapter 7
 */

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory database
const users = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" }
];

const posts = [];

// GET all users
app.get("/api/users", (req, res) => {
    res.json({ success: true, count: users.length, data: users });
});

// GET single user
app.get("/api/users/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, data: user });
});

// POST create user
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, error: "Name and email required" });
    }
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.status(201).json({ success: true, data: newUser });
});

// PUT update user
app.put("/api/users/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
    }
    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    res.json({ success: true, data: user });
});

// DELETE user
app.delete("/api/users/:id", (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, error: "User not found" });
    }
    users.splice(index, 1);
    res.json({ success: true, message: "User deleted" });
});

// Posts API
app.get("/api/posts", (req, res) => {
    res.json({ success: true, count: posts.length, data: posts });
});

app.post("/api/posts", (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, error: "Title and content required" });
    }
    const newPost = { id: posts.length + 1, title, content, createdAt: new Date() };
    posts.push(newPost);
    res.status(201).json({ success: true, data: newPost });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints: GET/POST /api/users, GET/POST /api/posts`);
});

module.exports = app;
