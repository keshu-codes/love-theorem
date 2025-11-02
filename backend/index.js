// SIMPLE WORKING BACKEND - Love Theorem
const express = require("express");
const cors = require("cors");

console.log("🚀 Starting Love Theorem Backend...");

const app = express();

// Basic CORS
app.use(cors());

// Basic JSON parsing
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  console.log("✅ Root route called");
  res.json({ 
    status: "OK", 
    message: "Love Theorem Backend is running!",
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/api/health", (req, res) => {
  console.log("✅ Health check called");
  res.json({ 
    status: "healthy", 
    service: "Love Theorem API",
    timestamp: new Date().toISOString()
  });
});

// Simple analyze endpoint
app.post("/api/analyze", (req, res) => {
  console.log("✅ Analyze endpoint called");
  res.json({
    success: true,
    message: "Backend is working! Ready for file uploads.",
    loveScore: 85,
    participants: ["User1", "User2"],
    counts: { totalMessages: 100 }
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error("💥 Error:", error);
  res.status(500).json({
    success: false,
    error: "SERVER_ERROR",
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.url);
  res.status(404).json({
    success: false,
    error: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 Server successfully started on port ${PORT}`);
  console.log(`✅ Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`✅ Ready for requests!`);
}).on('error', (err) => {
  console.error('💥 SERVER STARTUP FAILED:', err);
  process.exit(1);
});

console.log("✅ Backend setup complete - waiting for requests...");
