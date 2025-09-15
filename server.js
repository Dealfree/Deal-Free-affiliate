const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// File to store data
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Load Data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], ads: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save Data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== Signup =====
app.post("/signup", (req, res) => {
  let data = loadData();
  let { name, email, password, easypaisa } = req.body;

  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already registered" });
  }

  let code = "DF" + Math.floor(1000 + Math.random() * 9000);
  let assignedAd = data.ads[Math.floor(Math.random() * data.ads.length)] || null;

  let newUser = { name, email, password, easypaisa, code, isAdmin: false, notifications: [], ad: assignedAd };
  data.users.push(newUser);
  saveData(data);

  res.json({ success: true, code });
});

// ===== Login =====
app.post("/login", (req, res) => {
  let data = loadData();
  let { email, password } = req.body;

  let user = data.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ success: true, user });
});

// ===== Get Dashboard Data =====
app.get("/dashboard/:email", (req, res) => {
  let data = loadData();
  let user = data.users.find(u => u.email === req.params.email);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user, ads: data.ads, users: data.users });
});

// ===== Admin: Add Ad =====
app.post("/ads", (req, res) => {
  let data = loadData();
  let { link, desc } = req.body;
  data.ads.push({ link, desc });
  saveData(data);
  res.json({ success: true });
});

// ===== Admin: Remove Ad =====
app.delete("/ads/:index", (req, res) => {
  let data = loadData();
  let index = parseInt(req.params.index);
  if (index >= 0 && index < data.ads.length) {
    data.ads.splice(index, 1);
    saveData(data);
    return res.json({ success: true });
  }
  res.status(400).json({ error: "Invalid index" });
});

// ===== Admin: Send Notification =====
app.post("/notify", (req, res) => {
  let data = loadData();
  let { email, msg } = req.body;

  let user = data.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.notifications.push(msg);
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
