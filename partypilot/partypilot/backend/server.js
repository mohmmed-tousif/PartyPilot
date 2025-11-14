// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const path = require("path");
const { notFound, errorHandler } = require("./middleware/authMiddleware"); // Simple error handlers

// Connect to Database
connectDB();

const app = express();

// --- Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
  },
});

// Middleware
app.use(express.json()); // Body parser

// Serve static frontend files
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Make 'io' accessible to controllers
// This allows us to emit events from our route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/partner", require("./routes/partnerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// --- Serve Frontend ---
// This catches all other routes and serves the main index.html
// This is for a Single Page Application (SPA) feel
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Socket.IO Real-time Logic ---
global.io = io; // Make it globally accessible (simplified approach)

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Example: Admin joins a specific room to get all updates
  socket.on("joinAdminRoom", () => {
    socket.join("adminRoom");
    console.log(`Admin ${socket.id} joined adminRoom`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
