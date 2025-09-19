const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "static"))); // serve /static/ images
app.use(express.static(path.join(__dirname, "templates"))); // serve login.html

// Load users from JSON
const getUsers = () => {
  const data = fs.readFileSync("users.json");
  return JSON.parse(data);
};

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "login.html"));
});

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.json({ status: "success", message: "Login successful!", role: user.role });
  } else {
    res.json({ status: "fail", message: "Invalid credentials." });
  }
});

// Register API
app.post("/register", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.json({ status: "error", message: "Fill all fields." });
  }

  let users = getUsers();
  if (users.find((u) => u.username === username)) {
    return res.json({ status: "error", message: "Username already exists!" });
  }

  users.push({ username, password, role });
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ status: "success", message: "User registered successfully!" });
});

// Home route
app.get("/home", (req, res) => {
  res.send("<h1>Welcome to Home Page</h1>");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
