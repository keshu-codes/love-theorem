// Love Theorem Backend (Express + Multer) - WITH USER PRIVACY & ZIP SUPPORT & ENHANCED ERROR HANDLING
// Upload WhatsApp .txt export or .zip containing .txt and compute Love Theorem score

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const upload = multer(); // memory storage
const app = express();
app.use(cors());
app.use(express.json());

// ========== ENHANCED USER-BASED STORAGE ==========
const DATA_FILE = path.join(__dirname, "userAnalyses.json");

// Enhanced storage with user separation
let userAnalyses = {};

// Load existing data
if (fs.existsSync(DATA_FILE)) {
  try {
    userAnalyses = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    console.log("✅ Loaded user analyses from file");
  } catch (e) {
    console.error("❌ Error loading user analyses:", e);
    userAnalyses = {};
  }
}

// Generate unique user ID
function generateUserId() {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// Save to file
function saveUserAnalyses() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(userAnalyses, null, 2));
    console.log("💾 Saved user analyses to file");
  } catch (e) {
    console.error("❌ Error saving user analyses:", e);
  }
}

// ========== ENHANCED ZIP FILE PROCESSING WITH DETAILED ERROR HANDLING ==========
function extractTextFromZip(zipBuffer, originalFilename) {
  try {
    console.log(`📦 Processing ZIP file: ${originalFilename}`);

    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    console.log(`📦 ZIP contains ${zipEntries.length} entries`);

    if (zipEntries.length === 0) {
      throw new Error(
        "ZIP file is empty. Please check if the file was downloaded correctly."
      );
    }

    // Log all entries for debugging
    console.log("📁 ZIP contents:");
    zipEntries.forEach((entry, index) => {
      console.log(
        `  ${index + 1}. ${entry.entryName} (${
          entry.isDirectory ? "DIR" : "FILE"
        })`
      );
    });

    // Look for .txt files in the ZIP
    const txtFiles = zipEntries.filter((entry) => {
      const entryName = entry.entryName.toLowerCase();
      return !entry.isDirectory && entryName.endsWith(".txt");
    });

    console.log(`📄 Found ${txtFiles.length} .txt file(s) in ZIP`);

    if (txtFiles.length === 0) {
      const fileExtensions = [
        ...new Set(
          zipEntries
            .filter((entry) => !entry.isDirectory)
            .map((entry) => {
              const ext = path.extname(entry.entryName).toLowerCase();
              return ext || "no extension";
            })
        ),
      ];

      throw new Error(
        `No .txt files found in the ZIP archive. ` +
          `Found file types: ${fileExtensions.join(", ")}. ` +
          `Please make sure your WhatsApp export contains a .txt file.`
      );
    }

    // Use the first .txt file found
    const txtFile = txtFiles[0];
    const fileSize = txtFile.getData().length;

    console.log(`📄 Using text file: ${txtFile.entryName} (${fileSize} bytes)`);

    if (fileSize === 0) {
      throw new Error(
        `The .txt file "${txtFile.entryName}" in the ZIP archive is empty. Please export a valid WhatsApp chat.`
      );
    }

    if (fileSize > 50 * 1024 * 1024) {
      // 50MB limit for individual text files
      throw new Error(
        `The .txt file "${txtFile.entryName}" is too large (${(
          fileSize /
          1024 /
          1024
        ).toFixed(2)}MB). Maximum allowed size is 50MB.`
      );
    }

    const textContent = txtFile.getData().toString("utf8");

    if (!textContent || textContent.trim().length === 0) {
      throw new Error(
        `The .txt file "${txtFile.entryName}" contains no readable text. Please check the file encoding.`
      );
    }

    // Check if it looks like a WhatsApp chat
    const firstFewLines = textContent.split("\n").slice(0, 5).join("\n");
    const whatsAppPattern =
      /\d{1,2}\/\d{1,2}\/\d{4},\s+\d{1,2}:\d{2}\s*(?:am|pm)?\s*-\s*.+?:/i;

    if (!whatsAppPattern.test(firstFewLines)) {
      console.warn(
        "⚠️ File may not be a standard WhatsApp export. First few lines:",
        firstFewLines.substring(0, 200)
      );
      // We don't throw here, just warn, as we'll try to parse it anyway
    }

    console.log(
      `✅ Successfully extracted text from ZIP: ${textContent.length} characters`
    );
    return textContent;
  } catch (error) {
    console.error("❌ ZIP extraction failed:", error);

    if (
      error.message.includes("Not a zip file") ||
      error.message.includes("Corrupted zip")
    ) {
      throw new Error(
        "The file appears to be corrupted or not a valid ZIP file. Please try exporting again from WhatsApp."
      );
    }

    throw new Error(`Failed to process ZIP file: ${error.message}`);
  }
}

// ========== ENHANCED FILE VALIDATION ==========
function validateUploadedFile(file) {
  const errors = [];
  const warnings = [];

  // Basic file checks
  if (!file) {
    errors.push("No file was uploaded.");
    return { errors, warnings };
  }

  console.log(
    `🔍 Validating file: ${file.originalname}, type: ${file.mimetype}, size: ${file.size} bytes`
  );

  // File size checks
  if (file.size === 0) {
    errors.push("The uploaded file is completely empty (0 bytes).");
  }

  const isTxtFile =
    file.originalname.toLowerCase().endsWith(".txt") ||
    file.mimetype === "text/plain";
  const isZipFile =
    file.originalname.toLowerCase().endsWith(".zip") ||
    file.mimetype === "application/zip";

  // File type validation
  if (!isTxtFile && !isZipFile) {
    const detectedType = file.mimetype || "unknown";
    errors.push(
      `Unsupported file type. ` +
        `File "${file.originalname}" appears to be ${detectedType}. ` +
        `Please upload a .txt file or .zip file containing .txt files.`
    );
  }

  // Size limits
  if (isTxtFile && file.size > 50 * 1024 * 1024) {
    // 50MB for txt
    errors.push(
      `Text file is too large (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB). Maximum allowed size is 50MB.`
    );
  }

  if (isZipFile && file.size > 100 * 1024 * 1024) {
    // 100MB for zip
    errors.push(
      `ZIP file is too large (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB). Maximum allowed size is 100MB.`
    );
  }

  // Check for common user mistakes in filenames
  if (file.originalname.toLowerCase().includes("whatsapp")) {
    if (file.originalname.toLowerCase().includes("with media") && isZipFile) {
      warnings.push(
        'You uploaded a ZIP file from "WhatsApp with media" export. The media files will be ignored, only the chat text will be analyzed.'
      );
    }
  } else {
    warnings.push(
      'The filename doesn\'t contain "whatsapp". Make sure this is a valid WhatsApp chat export.'
    );
  }

  return { errors, warnings, isTxtFile, isZipFile };
}

// ========== HEALTH CHECK ROUTES ==========
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Love Theorem Backend is running!",
    timestamp: new Date().toISOString(),
    features: [
      "txt-file-analysis",
      "zip-file-support",
      "user-privacy",
      "enhanced-error-handling",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Love Theorem API",
    timestamp: new Date().toISOString(),
  });
});

// ========== ENHANCED API ROUTE WITH COMPREHENSIVE ERROR HANDLING ==========
app.post("/api/analyze", upload.single("file"), (req, res) => {
  console.log("📤 File upload received");

  try {
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        error: "NO_FILE_UPLOADED",
        message: "No file was uploaded.",
        details:
          'Please select a file before uploading. Make sure you are sending a file with the field name "file".',
        userFriendly:
          "Please select a file to upload. Drag and drop or click to browse for your WhatsApp chat export.",
      });
    }

    const file = req.file;

    // Step 1: Validate the uploaded file
    const validation = validateUploadedFile(file);

    if (validation.errors.length > 0) {
      console.log("❌ File validation failed:", validation.errors);
      return res.status(400).json({
        success: false,
        error: "FILE_VALIDATION_FAILED",
        message: "File validation failed",
        details: validation.errors.join(" "),
        userFriendly: validation.errors.join(" "),
        warnings: validation.warnings,
      });
    }

    let textContent;
    const { isTxtFile, isZipFile, warnings } = validation;

    // Step 2: Process the file based on type
    try {
      if (isZipFile) {
        console.log("🔍 Detected ZIP file, extracting...");
        textContent = extractTextFromZip(file.buffer, file.originalname);
      } else if (isTxtFile) {
        console.log("🔍 Detected TXT file, reading directly...");
        textContent = file.buffer.toString("utf8");

        // Additional validation for direct text files
        if (!textContent || textContent.trim().length === 0) {
          throw new Error(
            "The text file is empty or contains no readable content."
          );
        }

        if (textContent.length > 50 * 1024 * 1024) {
          throw new Error("Text file content is too large to process.");
        }
      }
    } catch (processingError) {
      console.error("❌ File processing failed:", processingError);
      return res.status(400).json({
        success: false,
        error: "FILE_PROCESSING_FAILED",
        message: "Failed to process the uploaded file",
        details: processingError.message,
        userFriendly: processingError.message,
        warnings: warnings,
      });
    }

    // Step 3: Validate text content
    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "EMPTY_CONTENT",
        message: "File contains no readable text content",
        details: "The file appears to be empty or contains no readable text.",
        userFriendly:
          "The uploaded file contains no readable text. Please export your WhatsApp chat again.",
        warnings: warnings,
      });
    }

    console.log(`📊 Text content length: ${textContent.length} characters`);

    // Step 4: Check if it looks like a WhatsApp chat
    const firstFewLines = textContent.split("\n").slice(0, 10).join("\n");
    const whatsAppPattern =
      /\d{1,2}\/\d{1,2}\/\d{4},\s+\d{1,2}:\d{2}\s*(?:am|pm)?\s*-\s*.+?:/i;

    if (!whatsAppPattern.test(firstFewLines)) {
      warnings.push(
        "The file format doesn't look like a standard WhatsApp export. Analysis may not work correctly."
      );
      console.warn(
        "⚠️ File may not be standard WhatsApp format. Sample:",
        firstFewLines.substring(0, 500)
      );
    }

    // Step 5: Perform analysis
    try {
      const result = analyzeChat(textContent);
      console.log("✅ Analysis completed successfully");

      // Add warnings to result if any
      if (warnings.length > 0) {
        result.warnings = warnings;
      }

      res.json({
        success: true,
        ...result,
        fileType: isZipFile ? "zip" : "txt",
        originalFilename: file.originalname,
      });
    } catch (analysisError) {
      console.error("❌ Chat analysis failed:", analysisError);

      let userFriendlyError = analysisError.message;
      let errorCode = "ANALYSIS_FAILED";

      // Provide more user-friendly messages for common analysis errors
      if (analysisError.message.includes("No messages could be parsed")) {
        errorCode = "INVALID_CHAT_FORMAT";
        userFriendlyError =
          "Could not read any messages from the chat file. Please make sure you exported the chat correctly from WhatsApp.";
      } else if (
        analysisError.message.includes("Need at least two participants")
      ) {
        errorCode = "INSUFFICIENT_PARTICIPANTS";
        userFriendlyError =
          "The chat appears to be a conversation with only one person. Love Theorem analyzes conversations between two people.";
      } else if (analysisError.message.includes("No valid messages")) {
        errorCode = "NO_VALID_MESSAGES";
        userFriendlyError =
          "No valid messages with proper timestamps were found. Please check your WhatsApp export format.";
      }

      return res.status(400).json({
        success: false,
        error: errorCode,
        message: analysisError.message,
        details:
          "The chat analysis failed due to issues with the file content.",
        userFriendly: userFriendlyError,
        warnings: warnings,
      });
    }
  } catch (unexpectedError) {
    console.error("💥 Unexpected error during file upload:", unexpectedError);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "An unexpected server error occurred",
      details: unexpectedError.message,
      userFriendly:
        "An unexpected error occurred while processing your file. Please try again later.",
      supportContact:
        "If this continues, please contact support with details about your file.",
    });
  }
});

// ========== CHAT HISTORY API ROUTES ==========
// [Keep all the existing chat history routes exactly as they were before]
// Get all saved analyses for a user
app.get("/api/analyses", (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const analyses = userAnalyses[userId] || {};
    res.json({ success: true, analyses, userId });
  } catch (err) {
    console.error("Error fetching analyses:", err);
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
});

// Save analysis to history
app.post("/api/analyses/save", (req, res) => {
  try {
    const { analysisData, chatName, timestamp, userId } = req.body;

    if (!analysisData) {
      return res.status(400).json({ error: "Analysis data is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const analysisId = `analysis_${Date.now()}`;

    // Initialize user storage if not exists
    if (!userAnalyses[userId]) {
      userAnalyses[userId] = {};
    }

    // Save analysis for specific user
    userAnalyses[userId][analysisId] = {
      id: analysisId,
      chatName:
        chatName || `Chat with ${analysisData.participants.join(" & ")}`,
      timestamp: timestamp || new Date().toISOString(),
      data: analysisData,
      participants: analysisData.participants,
      loveScore: analysisData.loveScore,
      totalMessages: analysisData.counts.totalMessages,
    };

    saveUserAnalyses();

    res.json({
      success: true,
      analysisId,
      userId,
      message: "Analysis saved successfully",
    });
  } catch (err) {
    console.error("Error saving analysis:", err);
    res.status(500).json({ error: "Failed to save analysis" });
  }
});

// Get specific analysis by ID
app.get("/api/analyses/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const analysis = userAnalyses[userId] ? userAnalyses[userId][id] : null;

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Error fetching analysis:", err);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

// Delete analysis
app.delete("/api/analyses/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!userAnalyses[userId] || !userAnalyses[userId][id]) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    delete userAnalyses[userId][id];
    saveUserAnalyses();

    res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (err) {
    console.error("Error deleting analysis:", err);
    res.status(500).json({ error: "Failed to delete analysis" });
  }
});

// Clear all data for a user
app.delete("/api/clear-my-data", (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (userAnalyses[userId]) {
      delete userAnalyses[userId];
      saveUserAnalyses();
    }

    res.json({ success: true, message: "All your data has been cleared" });
  } catch (err) {
    console.error("Error clearing user data:", err);
    res.status(500).json({ error: "Failed to clear data" });
  }
});

// ========== ENHANCED CORE ANALYSIS ==========
// [Keep all the existing analysis functions exactly as they were before]
function analyzeChat(text) {
  console.log("Starting chat analysis...");

  const messages = parseMessages(text);
  console.log(`Parsed ${messages.length} messages`);

  if (!messages || messages.length === 0) {
    throw new Error(
      "No messages could be parsed from the file. Please check the WhatsApp export format."
    );
  }

  // Filter out messages with invalid timestamps
  const validMessages = messages.filter(
    (msg) => msg.timestamp && !isNaN(msg.timestamp.getTime())
  );

  if (validMessages.length === 0) {
    throw new Error(
      "No valid messages with proper timestamps found. Please check the WhatsApp export format."
    );
  }

  console.log(`Found ${validMessages.length} valid messages with timestamps`);

  // Debug: show first 5 parsed
  console.log("✅ First 5 parsed messages:");
  validMessages
    .slice(0, 5)
    .forEach((m, i) =>
      console.log(
        `${i + 1}. ${m.timestamp.toLocaleString()} - ${
          m.sender
        }: ${m.text.slice(0, 40)}`
      )
    );

  // Enhanced participant analysis
  const counts = {};
  const wordCounts = {};
  const emojiUsageByPerson = {};
  const messageTimes = [];
  const replyTimes = [];

  validMessages.forEach((m) => {
    counts[m.sender] = (counts[m.sender] || 0) + 1;
    wordCounts[m.sender] =
      (wordCounts[m.sender] || 0) + (m.text.split(" ").length || 0);

    // Initialize emoji tracking per person
    if (!emojiUsageByPerson[m.sender]) {
      emojiUsageByPerson[m.sender] = {};
    }

    // Track message times for activity patterns
    if (m.timestamp) {
      messageTimes.push({
        timestamp: m.timestamp,
        sender: m.sender,
        hour: m.timestamp.getHours(),
        day: m.timestamp.getDay(),
        text: m.text,
      });
    }
  });

  const participants = Object.keys(counts).sort(
    (a, b) => counts[b] - counts[a]
  );

  console.log(`Participants found: ${participants.join(", ")}`);

  if (participants.length < 2) {
    throw new Error(
      `Need at least two participants in the chat. Found: ${
        participants.length
      } participant(s) - ${participants.join(", ")}`
    );
  }

  const [A, B] = participants;
  const totalMessages = validMessages.length;
  const countA = counts[A];
  const countB = counts[B];

  console.log(
    `Primary participants: ${A} (${countA} messages) and ${B} (${countB} messages)`
  );

  // Enhanced Reply Analysis
  let fastestReply = { time: Infinity, from: null, to: null };
  let slowestReply = { time: 0, from: null, to: null };
  let totalReplyTimeA = 0,
    replyCountA = 0;
  let totalReplyTimeB = 0,
    replyCountB = 0;
  const allReplyTimes = [];

  for (let i = 1; i < validMessages.length; i++) {
    const prev = validMessages[i - 1];
    const curr = validMessages[i];

    if (prev.sender !== curr.sender && prev.timestamp && curr.timestamp) {
      const diffMs = curr.timestamp - prev.timestamp;
      const diffSec = diffMs / 1000;
      const diffMin = diffSec / 60;

      if (diffMin >= 0 && diffMin < 1440) {
        // Less than 24 hours
        allReplyTimes.push(diffMin);

        // Track fastest meaningful reply (>10 seconds to avoid instant replies)
        if (diffSec > 10 && diffSec < fastestReply.time) {
          fastestReply = { time: diffSec, from: curr.sender, to: prev.sender };
        }

        // Track slowest reply
        if (diffMin > slowestReply.time) {
          slowestReply = { time: diffMin, from: curr.sender, to: prev.sender };
        }

        // Track average reply times per person
        if (curr.sender === A) {
          totalReplyTimeA += diffMin;
          replyCountA++;
        } else if (curr.sender === B) {
          totalReplyTimeB += diffMin;
          replyCountB++;
        }
      }
    }
  }

  // ========== ENHANCED EMOJI ANALYSIS ==========
  let totalEmojiCount = 0;
  const emojiUsage = {};
  const allEmojis = [];

  // Enhanced emoji regex for better detection
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

  validMessages.forEach((msg) => {
    const emojis = msg.text.match(emojiRegex);

    if (emojis) {
      totalEmojiCount += emojis.length;

      emojis.forEach((emoji) => {
        // Count overall emoji usage
        emojiUsage[emoji] = (emojiUsage[emoji] || 0) + 1;
        allEmojis.push(emoji);

        // Count emoji usage per person
        emojiUsageByPerson[msg.sender][emoji] =
          (emojiUsageByPerson[msg.sender][emoji] || 0) + 1;
      });
    }
  });

  // Find most used emojis
  const mostUsedEmojis = Object.entries(emojiUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));

  // Find most used emoji per person
  const mostUsedEmojiByPerson = {};
  participants.forEach((person) => {
    const personEmojis = emojiUsageByPerson[person];
    if (personEmojis && Object.keys(personEmojis).length > 0) {
      const sorted = Object.entries(personEmojis).sort(([, a], [, b]) => b - a);
      mostUsedEmojiByPerson[person] = {
        emoji: sorted[0][0],
        count: sorted[0][1],
      };
    } else {
      mostUsedEmojiByPerson[person] = { emoji: "😊", count: 0 };
    }
  });

  // ========== CONVERSATION STARTERS ANALYSIS ==========
  let currentConversation = [];
  let conversationStarters = { [A]: 0, [B]: 0 };

  for (let i = 0; i < validMessages.length; i++) {
    const msg = validMessages[i];

    if (currentConversation.length === 0) {
      // New conversation started
      conversationStarters[msg.sender]++;
      currentConversation.push(msg);
    } else {
      const lastMsg = currentConversation[currentConversation.length - 1];
      const timeDiff = msg.timestamp - lastMsg.timestamp;

      if (timeDiff < 30 * 60 * 1000) {
        // 30 minutes gap
        currentConversation.push(msg);
      } else {
        // Conversation ended, start new one
        conversationStarters[msg.sender]++;
        currentConversation = [msg];
      }
    }
  }

  // ========== MESSAGE STREAK ANALYSIS ==========
  let currentStreak = 1;
  let longestStreak = 1;
  let streakStart = 0;

  for (let i = 1; i < validMessages.length; i++) {
    const prev = validMessages[i - 1];
    const curr = validMessages[i];
    const timeDiff = (curr.timestamp - prev.timestamp) / 60000; // minutes

    if (timeDiff < 30) {
      // Less than 30 minutes between messages
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
    }
  }

  // ========== ACTIVE HOURS ANALYSIS ==========
  const hourlyActivity = Array(24).fill(0);
  const dailyActivity = Array(7).fill(0);

  // Categorize messages by time of day
  const timeCategories = {
    morning: 0, // 6AM - 12PM
    afternoon: 0, // 12PM - 6PM
    evening: 0, // 6PM - 12AM
    night: 0, // 12AM - 6AM
  };

  messageTimes.forEach((msg) => {
    const hour = msg.hour;

    if (hour >= 0 && hour < 24) {
      hourlyActivity[hour]++;

      // Categorize by time of day
      if (hour >= 6 && hour < 12) {
        timeCategories.morning++;
      } else if (hour >= 12 && hour < 18) {
        timeCategories.afternoon++;
      } else if (hour >= 18 && hour < 24) {
        timeCategories.evening++;
      } else {
        timeCategories.night++;
      }
    }

    if (msg.day >= 0 && msg.day < 7) {
      dailyActivity[msg.day]++;
    }
  });

  // Find peak hour
  let peakHour = 0;
  let maxCount = 0;
  hourlyActivity.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });

  // ========== ENHANCED EMOTIONAL KEYWORDS ANALYSIS ==========
  const positiveWords = [
    "love",
    "miss",
    "care",
    "beautiful",
    "handsome",
    "amazing",
    "wonderful",
    "perfect",
    "happy",
    "excited",
    "good",
    "great",
    "nice",
    "sweet",
    "cute",
    "awesome",
    "fantastic",
    "brilliant",
    "lovely",
    "adore",
    "cherish",
    "treasure",
    "special",
    "wonderful",
    "magnificent",
    "gorgeous",
    "stunning",
    "perfect",
    "bliss",
    "ecstatic",
    "joy",
    "delight",
    "pleasure",
    "content",
    "glad",
    "proud",
    "thankful",
    "grateful",
    "blessed",
    "lucky",
    "fortunate",
    "smile",
    "laugh",
    "hug",
    "kiss",
    "romantic",
    "passionate",
    "intimate",
    "affectionate",
  ];

  const negativeWords = [
    "sorry",
    "sad",
    "angry",
    "hate",
    "fight",
    "mad",
    "upset",
    "wrong",
    "bad",
    "stupid",
    "hurt",
    "annoying",
    "terrible",
    "awful",
    "horrible",
    "disappointed",
    "frustrated",
    "annoyed",
    "irritated",
    "angry",
    "furious",
    "hate",
    "despise",
    "loathe",
    "regret",
    "guilty",
    "ashamed",
    "miserable",
    "depressed",
    "heartbroken",
    "crushed",
    "devastated",
    "disgusted",
    "worried",
    "anxious",
    "scared",
    "afraid",
    "fear",
    "pain",
    "suffer",
    "cry",
    "tears",
    "breakup",
    "leave",
    "abandon",
    "betray",
    "cheat",
    "lie",
    "argument",
    "fight",
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  let keywordUsage = {};

  validMessages.forEach((msg) => {
    const text = msg.text.toLowerCase();

    // Use word boundaries for more accurate matching
    positiveWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        positiveCount += matches.length;
        keywordUsage[word] = (keywordUsage[word] || 0) + matches.length;
      }
    });

    negativeWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        negativeCount += matches.length;
        keywordUsage[word] = (keywordUsage[word] || 0) + matches.length;
      }
    });
  });

  // ========== FIRST AND LAST MESSAGES ==========
  const firstMessage = validMessages[0];
  const lastMessage = validMessages[validMessages.length - 1];

  // ========== CONSISTENCY ANALYSIS ==========
  const dateStrings = new Set();
  validMessages.forEach((msg) => {
    if (msg.timestamp) {
      const dateStr = msg.timestamp.toISOString().slice(0, 10);
      dateStrings.add(dateStr);
    }
  });

  const activeDays = dateStrings.size;
  const firstDate = validMessages[0].timestamp;
  const lastDate = validMessages[validMessages.length - 1].timestamp;

  // FIXED: Proper chat duration calculation
  let daysSpan = 1;
  if (firstDate && lastDate) {
    const timeDiff = lastDate - firstDate;
    daysSpan = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  }

  // Calculate enhanced metrics
  const avgReplyA = replyCountA > 0 ? totalReplyTimeA / replyCountA : null;
  const avgReplyB = replyCountB > 0 ? totalReplyTimeB / replyCountB : null;
  const avgReply =
    allReplyTimes.length > 0
      ? allReplyTimes.reduce((a, b) => a + b, 0) / allReplyTimes.length
      : null;
  const fastestReplier =
    avgReplyA && avgReplyB ? (avgReplyA < avgReplyB ? A : B) : null;

  const m = Math.min(countA, countB) / totalMessages;
  const d = Math.min(1, activeDays / daysSpan);
  const emojiRatio = totalMessages ? totalEmojiCount / totalMessages : 0;

  // ===== CORRECTED Score components =====
  let R = 0;
  if (avgReply === null) R = 0;
  else if (avgReply < 2) R = 25;
  else if (avgReply < 5) R = 15;
  else if (avgReply < 10) R = 10;
  else if (avgReply < 30) R = 5;
  else R = -15;

  let E = 0;
  if (emojiRatio > 0.5) E = 20;
  else if (emojiRatio > 0.2) E = 15;
  else if (emojiRatio > 0.1) E = 10;
  else if (emojiRatio > 0.05) E = 5;
  else E = 0;

  let M = 0;
  if (m > 0.45) M = 15;
  else if (m > 0.35) M = 10;
  else if (m > 0.25) M = 5;
  else M = -10;

  let C = 0;
  if (d > 0.8) C = 15;
  else if (d > 0.5) C = 10;
  else if (d > 0.3) C = 5;
  else C = 0;

  const rawLove = 50 + R + E + M + C;
  const maxPossible = 125;
  const loveScore = Math.max(
    0,
    Math.min(100, Math.round((rawLove / maxPossible) * 100))
  );

  // ========== ENHANCED INSIGHTS DATA ==========
  const enhancedInsights = {
    // Basic stats - FIXED chat duration calculation
    chatDuration: daysSpan,
    totalWords: Object.values(wordCounts).reduce((a, b) => a + b, 0),
    wordsPerMessage: {
      [A]: wordCounts[A] / counts[A],
      [B]: wordCounts[B] / counts[B],
    },
    activeDays: activeDays,

    // Reply analysis
    averageReplyTimes: {
      [A]: avgReplyA ? Math.round(avgReplyA * 10) / 10 : null,
      [B]: avgReplyB ? Math.round(avgReplyB * 10) / 10 : null,
    },
    fastestReplier: fastestReplier,
    longestDelay: Math.round(slowestReply.time),

    // Enhanced Emoji analysis
    mostUsedEmojis: mostUsedEmojis,
    mostUsedEmojiByPerson: mostUsedEmojiByPerson,
    totalEmojiCount: totalEmojiCount,

    // Conversation patterns
    conversationStarters: conversationStarters,
    longestStreak: longestStreak,
    activeHours: hourlyActivity.map((count, hour) => ({ hour, count })),
    activeDaysOfWeek: dailyActivity.map((count, day) => ({ day, count })),
    peakHour: peakHour,
    timeCategories: timeCategories,

    // Enhanced Emotional analysis
    emotionalKeywords: {
      positive: positiveCount,
      negative: negativeCount,
      total: positiveCount + negativeCount,
      ratio: positiveCount / (positiveCount + negativeCount || 1),
    },
    mostUsedKeywords: Object.entries(keywordUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count })),

    // First and last messages - FIXED date formatting
    firstMessage: {
      sender: firstMessage.sender,
      text:
        firstMessage.text.length > 100
          ? firstMessage.text.substring(0, 100) + "..."
          : firstMessage.text,
      timestamp: firstMessage.timestamp,
      formattedDate: firstMessage.timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      fullText: firstMessage.text,
    },
    lastMessage: {
      sender: lastMessage.sender,
      text:
        lastMessage.text.length > 100
          ? lastMessage.text.substring(0, 100) + "..."
          : lastMessage.text,
      timestamp: lastMessage.timestamp,
      formattedDate: lastMessage.timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      fullText: lastMessage.text,
    },

    // Message distribution
    messageDistribution: {
      [A]: {
        count: countA,
        percentage: Math.round((countA / totalMessages) * 100),
      },
      [B]: {
        count: countB,
        percentage: Math.round((countB / totalMessages) * 100),
      },
    },

    // Additional timeline info
    timeline: {
      startDate: firstMessage.timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      endDate: lastMessage.timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      totalDuration: daysSpan,
    },
  };

  // Generate relationship story - UPDATED to show percentage format
  const relationshipStory = generateRelationshipStory({
    loveScore,
    avgReply,
    emojiRatio,
    m,
    d,
    positiveCount,
    negativeCount,
    longestStreak,
    fastestReply,
    mostUsedEmojis,
    enhancedInsights,
  });

  // Determine relationship personality
  const personality = determinePersonality({
    emojiRatio,
    avgReply,
    m,
    positiveCount,
    longestStreak,
  });

  // UPDATED: Changed console logs to show percentage format
  console.log(`Analysis complete! Love Score: ${loveScore}%`);
  console.log(`Total emojis found: ${totalEmojiCount}`);
  console.log(`Longest streak: ${longestStreak} messages`);
  console.log(`Chat duration: ${daysSpan} days`);
  console.log(`Active days: ${activeDays} days`);
  console.log(`First message: ${firstMessage.timestamp.toLocaleDateString()}`);
  console.log(`Last message: ${lastMessage.timestamp.toLocaleDateString()}`);
  console.log(
    `Positive words: ${positiveCount}, Negative words: ${negativeCount}`
  );

  return {
    participants: [A, B],
    counts: { [A]: countA, [B]: countB, totalMessages },
    metrics: {
      avgReplyMinutes: avgReply ? Math.round(avgReply * 10) / 10 : null,
      emojiCount: totalEmojiCount,
      emojiRatio: Math.round(emojiRatio * 100) / 100,
      m: Math.round(m * 100) / 100,
      d: Math.round(d * 100) / 100,
      activeDays,
      daysSpan,
      fastestReply: Math.round(fastestReply.time),
      slowestReply: Math.round(slowestReply.time),
      longestStreak,
      positiveWords: positiveCount,
      negativeWords: negativeCount,
      sentimentRatio: positiveCount / (positiveCount + negativeCount || 1),
      enhancedInsights: enhancedInsights,
    },
    insights: {
      mostUsedEmoji: mostUsedEmojis.length > 0 ? mostUsedEmojis[0].emoji : "❤",
      emojiUsageCount: mostUsedEmojis.length > 0 ? mostUsedEmojis[0].count : 0,
      relationshipStory,
      personality,
      strengths: determineStrengths({
        R,
        E,
        M,
        C,
        avgReply,
        emojiRatio,
        m,
        d,
      }),
      improvements: determineImprovements({
        R,
        E,
        M,
        C,
        avgReply,
        emojiRatio,
        m,
        d,
      }),
      ...enhancedInsights,
    },
    components: { R, E, M, C },
    loveScore,
    rawScore: rawLove,
    maxPossible: 125,
    baseScore: 50,
    scoreBreakdown: {
      base: 50,
      replySpeed: R,
      emojiUsage: E,
      messageBalance: M,
      consistency: C,
      total: rawLove,
    },
  };
}

// ========== ENHANCED STORY GENERATION ==========
function generateRelationshipStory(data) {
  const {
    loveScore,
    avgReply,
    emojiRatio,
    m,
    d,
    positiveCount,
    negativeCount,
    longestStreak,
    mostUsedEmojis,
    enhancedInsights,
  } = data;

  // UPDATED: Changed to percentage format in the story
  let story = `With a Love Score of ${loveScore}%, `;

  // Reply analysis
  if (avgReply < 2) {
    story +=
      "you two respond to each other incredibly quickly, showing high attention and care. ";
  } else if (avgReply < 5) {
    story +=
      "your reply times are quite prompt, indicating good communication habits. ";
  } else if (avgReply < 15) {
    story +=
      "you maintain reasonable response times that show mutual respect. ";
  } else {
    story +=
      "while replies may take longer, you maintain meaningful connections. ";
  }

  // Emoji analysis
  if (emojiRatio > 0.3) {
    const topEmoji = mostUsedEmojis.length > 0 ? mostUsedEmojis[0].emoji : "❤";
    story += `Your chats are filled with emotions and expressions, especially with the ${topEmoji} emoji being a favorite. `;
  } else if (emojiRatio > 0.1) {
    const topEmoji = mostUsedEmojis.length > 0 ? mostUsedEmojis[0].emoji : "❤";
    story += `You express emotions well through emojis, with ${topEmoji} appearing frequently. `;
  } else {
    story +=
      "Your communication style is more straightforward but equally meaningful. ";
  }

  // Balance analysis
  if (m > 0.45) {
    story +=
      "The conversation flows beautifully with both partners contributing almost equally. ";
  } else if (m > 0.35) {
    story +=
      "You maintain a good balance in your conversations with healthy participation from both sides. ";
  } else {
    story +=
      "While one person might initiate more, the connection remains strong. ";
  }

  // Consistency analysis
  if (d > 0.7) {
    story += "Your relationship shows remarkable consistency over time. ";
  } else if (d > 0.5) {
    story += "You maintain regular contact and keep the connection alive. ";
  }

  // Sentiment analysis
  if (positiveCount > negativeCount * 2) {
    story +=
      "The overwhelmingly positive language in your chats reflects a warm and caring relationship. ";
  }

  // Streak analysis
  if (longestStreak > 20) {
    story += `Your longest conversation streak of ${longestStreak} messages shows incredible engagement!`;
  }

  return story;
}

function determinePersonality(data) {
  const { emojiRatio, avgReply, m, positiveCount, longestStreak } = data;

  let traits = [];

  if (emojiRatio > 0.2) traits.push("Expressive");
  if (avgReply < 5) traits.push("Attentive");
  if (m > 0.4) traits.push("Balanced");
  if (positiveCount > 10) traits.push("Positive");
  if (longestStreak > 15) traits.push("Engaged");

  if (traits.length === 0) traits.push("Thoughtful");

  return traits.join(" & ");
}

function determineStrengths(data) {
  const strengths = [];

  if (data.R >= 15) strengths.push("Lightning-fast replies");
  if (data.E >= 15) strengths.push("Emotional expressiveness");
  if (data.M >= 10) strengths.push("Conversation balance");
  if (data.C >= 10) strengths.push("Relationship consistency");

  return strengths;
}

function determineImprovements(data) {
  const improvements = [];

  if (data.R <= 5) improvements.push("Try responding a bit faster");
  if (data.E <= 5) improvements.push("Add more emojis to express feelings");
  if (data.M <= 5) improvements.push("Balance conversation participation more");
  if (data.C <= 5) improvements.push("Maintain more consistent communication");

  return improvements;
}

// ========== FIXED PARSER FOR DD/MM/YYYY FORMAT ==========
function parseMessages(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];

  // WhatsApp format: DD/MM/YYYY, HH:MM am/pm - Sender: Message
  const pattern =
    /^(\d{1,2}\/\d{1,2}\/\d{4}),\s+(\d{1,2}:\d{2}\s?(?:am|pm)?)\s*-\s*(.+?):\s(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(pattern);
    if (match) {
      const datePart = match[1];
      const timePart = match[2];
      const sender = match[3].trim();
      const textPart = match[4].trim();

      // Skip system messages
      if (sender.includes("Messages and calls are end-to-end encrypted")) {
        continue;
      }

      const timestamp = parseWhatsAppDate(datePart, timePart);
      if (timestamp) {
        messages.push({ timestamp, sender, text: textPart });
      } else {
        console.log("Failed to parse date for line:", line);
      }
    }
  }

  return messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

// FINAL FIXED DATE PARSING FOR WHATSAPP DD/MM/YYYY FORMAT
function parseWhatsAppDate(dateStr, timeStr) {
  try {
    console.log("Parsing WhatsApp date:", dateStr, timeStr);

    // Split date: DD/MM/YYYY
    const dateParts = dateStr.split("/");
    if (dateParts.length !== 3) {
      console.log("Invalid date format:", dateStr);
      return null;
    }

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
    const year = parseInt(dateParts[2]);

    // Parse time: HH:MM am/pm
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s?(am|pm)?/i);
    if (!timeMatch) {
      console.log("Invalid time format:", timeStr);
      return null;
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3];

    // Handle 12-hour format
    if (period) {
      const periodLower = period.toLowerCase();
      if (periodLower === "pm" && hours < 12) {
        hours += 12;
      } else if (periodLower === "am" && hours === 12) {
        hours = 0;
      }
    }

    // Create date object - CORRECT FORMAT: DD/MM/YYYY
    const date = new Date(year, month, day, hours, minutes, 0);

    if (isNaN(date.getTime())) {
      console.log("Invalid date created:", {
        year,
        month,
        day,
        hours,
        minutes,
      });
      return null;
    }

    console.log("Successfully parsed date:", date.toLocaleString());
    return date;
  } catch (e) {
    console.error("⚠️ Date parse failed for:", dateStr, timeStr, e);
    return null;
  }
}

// ========== SERVER ==========
const PORT = process.env.PORT || 10000;

// Improved server start with error handling
app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Love Theorem backend running on port ${PORT}`);
    console.log(`✅ Health check: http://0.0.0.0:${PORT}/`);
    console.log(`✅ API available at: http://0.0.0.0:${PORT}/api`);
    console.log(`✨ Features: TXT files, ZIP files with automatic extraction`);
    console.log(`🔧 Enhanced error handling with detailed user feedback`);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  });
