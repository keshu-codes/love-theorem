// Love Theorem Backend - Optimized with ZIP Support
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

console.log("🚀 Starting Love Theorem Backend...");

const app = express();
const upload = multer(); // memory storage

// Enhanced CORS
app.use(cors({
  origin: [
    "https://love-theorem-frontend.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ========== SIMPLIFIED FILE PROCESSING ==========
function extractTextFromZip(zipBuffer) {
  try {
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    
    // Find first .txt file
    const txtFile = entries.find(entry => 
      !entry.isDirectory && entry.entryName.toLowerCase().endsWith('.txt')
    );

    if (!txtFile) {
      throw new Error('No .txt file found in ZIP');
    }

    const textContent = txtFile.getData().toString('utf8');
    
    if (!textContent || textContent.trim().length === 0) {
      throw new Error('Text file in ZIP is empty');
    }

    console.log(`✅ Extracted ${textContent.length} chars from ZIP`);
    return textContent;
  } catch (error) {
    console.error('❌ ZIP extraction failed:', error.message);
    throw new Error(`ZIP processing failed: ${error.message}`);
  }
}

function validateFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file uploaded');
    return { errors };
  }

  const isTxt = file.originalname.toLowerCase().endsWith('.txt');
  const isZip = file.originalname.toLowerCase().endsWith('.zip');

  if (!isTxt && !isZip) {
    errors.push('Please upload .txt or .zip files only');
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  if (file.size > 100 * 1024 * 1024) { // 100MB max
    errors.push('File too large (max 100MB)');
  }

  return { errors, isTxt, isZip };
}

// ========== CORE ANALYSIS (SIMPLIFIED) ==========
function analyzeChat(text) {
  console.log("Starting chat analysis...");

  const messages = parseMessages(text);
  console.log(`Parsed ${messages.length} messages`);

  if (messages.length < 10) {
    throw new Error('Not enough messages found (min 10 required)');
  }

  // Count messages per participant
  const counts = {};
  messages.forEach(msg => {
    counts[msg.sender] = (counts[msg.sender] || 0) + 1;
  });

  const participants = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  
  if (participants.length < 2) {
    throw new Error('Need at least 2 participants');
  }

  const [personA, personB] = participants;
  const totalMessages = messages.length;

  // Calculate basic metrics
  const messageRatio = Math.min(counts[personA], counts[personB]) / totalMessages;
  const emojiCount = (text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || []).length;
  const emojiRatio = emojiCount / totalMessages;

  // Calculate love score (simplified)
  const baseScore = 50;
  const balanceScore = messageRatio > 0.4 ? 20 : messageRatio > 0.3 ? 10 : 0;
  const emojiScore = emojiRatio > 0.2 ? 15 : emojiRatio > 0.1 ? 10 : 5;
  const consistencyScore = messages.length > 100 ? 15 : 10;
  
  const rawScore = baseScore + balanceScore + emojiScore + consistencyScore;
  const loveScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    participants: [personA, personB],
    counts: { 
      [personA]: counts[personA], 
      [personB]: counts[personB], 
      totalMessages 
    },
    loveScore,
    metrics: {
      messageRatio: Math.round(messageRatio * 100) / 100,
      emojiCount,
      emojiRatio: Math.round(emojiRatio * 100) / 100,
    },
    insights: {
      relationshipStory: `With a Love Score of ${loveScore}%, your conversation shows ${
        loveScore > 80 ? 'excellent' : loveScore > 60 ? 'good' : 'developing'
      } connection patterns.`,
      strengths: [
        balanceScore > 0 && "Good message balance",
        emojiScore > 10 && "Expressive communication",
        consistencyScore > 10 && "Consistent engagement"
      ].filter(Boolean)
    }
  };
}

// ========== MESSAGE PARSER ==========
function parseMessages(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];
  const pattern = /^(\d{1,2}\/\d{1,2}\/\d{4}),\s+(\d{1,2}:\d{2}\s?(?:am|pm)?)\s*-\s*(.+?):\s(.*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(pattern);
    if (match) {
      const [, dateStr, timeStr, sender, message] = match;
      
      // Skip system messages
      if (sender.includes("Messages and calls are end-to-end encrypted")) {
        continue;
      }

      const timestamp = parseWhatsAppDate(dateStr, timeStr);
      if (timestamp) {
        messages.push({ 
          timestamp, 
          sender: sender.trim(), 
          text: message.trim() 
        });
      }
    }
  }

  return messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

function parseWhatsAppDate(dateStr, timeStr) {
  try {
    const [day, month, year] = dateStr.split('/').map(Number);
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s?(am|pm)?/i);
    
    if (!timeMatch) return null;

    let [, hours, minutes, period] = timeMatch;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Handle 12-hour format
    if (period) {
      const periodLower = period.toLowerCase();
      if (periodLower === 'pm' && hours < 12) hours += 12;
      if (periodLower === 'am' && hours === 12) hours = 0;
    }

    const date = new Date(year, month - 1, day, hours, minutes);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Date parse error:', error);
    return null;
  }
}

// ========== API ROUTES ==========
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Love Theorem Backend is running!",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    service: "Love Theorem API",
    timestamp: new Date().toISOString()
  });
});

// MAIN ANALYSIS ENDPOINT
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    console.log("📨 Analyze request received");

    // Validate file
    const { errors, isTxt, isZip } = validateFile(req.file);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_FAILED",
        message: errors.join(', ')
      });
    }

    let textContent;
    const file = req.file;

    // Process file based on type
    if (isZip) {
      console.log("🔍 Processing ZIP file...");
      textContent = extractTextFromZip(file.buffer);
    } else {
      console.log("🔍 Processing TXT file...");
      textContent = file.buffer.toString('utf8');
    }

    // Validate text content
    if (!textContent || textContent.trim().length < 100) {
      return res.status(400).json({
        success: false,
        error: "INVALID_CONTENT",
        message: "File doesn't contain enough readable text"
      });
    }

    // Perform analysis
    console.log("🔍 Analyzing chat content...");
    const analysisResult = analyzeChat(textContent);

    // Success response
    res.json({
      success: true,
      ...analysisResult,
      fileType: isZip ? 'zip' : 'txt',
      originalFilename: file.originalname
    });

  } catch (error) {
    console.error("❌ Analysis failed:", error.message);
    
    let statusCode = 400;
    let errorType = "ANALYSIS_ERROR";
    
    if (error.message.includes('ZIP processing failed')) {
      errorType = "ZIP_ERROR";
    } else if (error.message.includes('Not enough messages')) {
      errorType = "INSUFFICIENT_DATA";
    }

    res.status(statusCode).json({
      success: false,
      error: errorType,
      message: error.message
    });
  }
});

// ========== ERROR HANDLING ==========
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Route not found'
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 Server running on port ${PORT}`);
  console.log(`✅ Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`✅ Ready for file uploads!`);
}).on('error', (err) => {
  console.error('💥 Server failed to start:', err);
  process.exit(1);
});
