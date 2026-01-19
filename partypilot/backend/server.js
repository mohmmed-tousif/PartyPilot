// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const path = require("path");
const compression = require("compression");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/authMiddleware");

// Security middleware
const {
  corsOptions,
  limiter,
  authLimiter,
  paymentLimiter,
  helmetConfig,
  mongoSanitize,
  xssClean,
  hpp,
  trustProxy
} = require("./middleware/security");

// Connect to Database
connectDB();

const app = express();

// Trust proxy
trustProxy(app);

// --- Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  },
});

// Security Middleware (temporarily simplified for debugging)
// app.use(helmetConfig);
// app.use(corsOptions);
app.use(mongoSanitize);
// app.use(xssClean);
// app.use(hpp);

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser (except for webhook routes)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Rate limiting (temporarily disabled for debugging)
// app.use('/api/', limiter);

// Serve static frontend files
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// Make 'io' accessible to controllers
// This allows us to emit events from our route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV 
  });
});

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/partner", require("./routes/partnerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// --- Serve Frontend ---
// Serve specific HTML pages for different user types
app.get("/admin/dashboard.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "admin", "dashboard.html"));
});

app.get("/admin/login.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "admin", "login.html"));
});

app.get("/customer/dashboard.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "customer", "dashboard.html"));
});

app.get("/partner/dashboard.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "partner", "dashboard.html"));
});

// Catch all other routes and serve the main index.html
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
