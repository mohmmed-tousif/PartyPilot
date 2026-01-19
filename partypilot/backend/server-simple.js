// Quick test script to verify packages API
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const path = require("path");

connectDB();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Make io accessible
app.use((req, res, next) => {
  req.io = { to: () => ({ emit: () => {} }) }; // Mock io
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/partner", require("./routes/partnerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve HTML
app.get("/customer/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "customer", "dashboard.html"));
});

app.get("/partner/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "partner", "dashboard.html"));
});

app.get("/admin/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "admin", "dashboard.html"));
});

app.get("/admin/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "admin", "login.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Packages API: http://localhost:${PORT}/api/admin/packages`);
});
