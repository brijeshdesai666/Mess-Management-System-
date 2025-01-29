const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.json());

// Load student and admin data from JSON file
const dataPath = path.join(__dirname, "data", "students.json");
let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Serve student dashboard
app.get("/student-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "student-dashboard.html"));
});

// Serve admin dashboard
app.get("/admin-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-dashboard.html"));
});

// Login route for students
app.post("/login/student", (req, res) => {
  const { username, password } = req.body;
  const student = data.students.find(
    (s) => s.username === username && s.password === password
  );

  if (student) {
    res.json({ success: true, redirect: "/student-dashboard.html" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Login route for admin
app.post("/login/admin", (req, res) => {
  const { username, password } = req.body;
  if (username === data.admin.username && password === data.admin.password) {
    res.json({ success: true, redirect: "/admin-dashboard.html" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});