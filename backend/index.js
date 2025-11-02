// LOVE THEOREM BACKEND - WITH FILE UPLOAD SUPPORT
const express = require("express");
const cors = require("cors");
const multer = require("multer");

console.log("🚀 Starting Love Theorem Backend...");

const app = express();
const upload = multer(); // memory storage

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

// File upload analyze endpoint
app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    console.log("✅ Analyze endpoint called");
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "NO_FILE",
        message: "No file uploaded"
      });
    }

    const file = req.file;
    console.log(`📁 File received: ${file.originalname}, Size: ${file.size} bytes`);

    // Check file type
    const isTxt = file.originalname.toLowerCase().endsWith('.txt');
    const isZip = file.originalname.toLowerCase().endsWith('.zip');
    
    if (!isTxt && !isZip) {
      return res.status(400).json({
        success: false,
        error: "INVALID_FILE_TYPE",
        message: "Please upload a .txt or .zip file"
      });
    }

    // For now, return a success response without actual processing
    res.json({
      success: true,
      message: `File '${file.originalname}' received successfully!`,
      fileType: isZip ? 'zip' : 'txt',
      fileSize: file.size,
      loveScore: Math.floor(Math.random() * 30) + 70, // Random score 70-99
      participants: ["User A", "User B"],
      counts: { totalMessages: 150 },
      participants: ["You", "Your Partner"]
    });

  } catch (error) {
    console.error("💥 Analyze error:", error);
    res.status(500).json({
      success: false,
      error: "PROCESSING_ERROR",
      message: error.message
    });
  }
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
  console.log(`✅ File uploads ready!`);
}).on('error', (err) => {
  console.error('💥 SERVER STARTUP FAILED:', err);
  process.exit(1);
});

console.log("✅ Backend setup complete - waiting for requests...");
