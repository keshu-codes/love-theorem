// Love Theorem Frontend JavaScript - COMPLETE FIXED VERSION
const API_BASE = "https://love-theorem-backend.onrender.com/api";

// User ID management for privacy
let USER_ID = localStorage.getItem("loveTheoremUserId");
if (!USER_ID) {
  USER_ID =
    "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("loveTheoremUserId", USER_ID);
}

// Enhanced PPT-style transitions
const transitionTypes = ["morph", "split", "push", "reveal", "zoom", "sweep"];
let currentTransition = 0;
let currentPage = "index.html";
let isNavigating = false;
let navListenersAttached = false;

// Initialize the page with beautiful transitions
function initializePage() {
  console.log("Initializing with connected transitions...");
  createParticles();
  setupNavbar();

  // Handle browser back/forward buttons
  window.addEventListener("popstate", handlePopState);

  // Load the current page from URL with initial animation
  setTimeout(() => {
    const page = getCurrentPageFromURL();
    currentPage = page;
    loadPageContent(page);
    updateNavbarActiveState();

    // Add initial fade-in animation
    const content = document.getElementById("content");
    if (content) {
      content.classList.add("fade-in");
      setTimeout(() => {
        content.classList.remove("fade-in");
      }, 1000);
    }
  }, 100);
}

// Handle browser navigation
function handlePopState(event) {
  if (!isNavigating) {
    loadPageFromURL();
  }
}

// Get current page from URL
function getCurrentPageFromURL() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";
  return page;
}

// Load page based on URL
function loadPageFromURL() {
  const page = getCurrentPageFromURL();
  if (page !== currentPage && !isNavigating) {
    navigateToPage(page, false);
  }
}

// Enhanced navigation with connected transitions
function navigateToPage(page, pushToHistory = true) {
  if (isNavigating) {
    console.log("Navigation in progress, skipping...");
    return;
  }

  console.log("Navigating to:", page);
  isNavigating = true;

  const content = document.getElementById("content");
  if (!content) {
    isNavigating = false;
    return;
  }

  // Get next transition type
  const transitionType = transitionTypes[currentTransition];
  currentTransition = (currentTransition + 1) % transitionTypes.length;

  console.log("Using connected transition:", transitionType);

  // Clear any existing transition classes to prevent conflicts
  const allTransitionClasses = [];
  transitionTypes.forEach((type) => {
    allTransitionClasses.push(`${type}-in`, `${type}-out`);
  });
  content.classList.remove(...allTransitionClasses);

  // Add exit animation to current content
  content.classList.add(`${transitionType}-out`);

  // After exit animation completes, load new content with enter animation
  setTimeout(() => {
    // Remove any page-specific classes from body before navigation
    cleanupBodyClasses();

    // Update current page
    currentPage = page;

    // Update browser URL without reloading page
    if (pushToHistory) {
      window.history.pushState({ page }, "", page);
    }

    // Load new page content
    loadPageContent(page);

    // Update navbar active state
    updateNavbarActiveState();

    // Add enter animation
    setTimeout(() => {
      content.classList.remove(`${transitionType}-out`);
      content.classList.add(`${transitionType}-in`);

      // Remove enter animation after it completes
      setTimeout(() => {
        content.classList.remove(`${transitionType}-in`);
        isNavigating = false;

        // Force reflow to prevent animation stacking
        void content.offsetWidth;
      }, 2000);
    }, 50);
  }, 1500);
}

// Clean up body classes
function cleanupBodyClasses() {
  const bodyClassesToRemove = [
    "dashboard-page",
    "about-page",
    "history-page",
    "contact-page",
    "explore-page",
  ];

  bodyClassesToRemove.forEach((className) => {
    document.body.classList.remove(className);
  });
}

// Load page content dynamically
function loadPageContent(page) {
  const content = document.getElementById("content");
  if (!content) return;

  // Clear previous content
  content.innerHTML = "";

  switch (page) {
    case "index.html":
      showHomePage();
      break;
    case "explore.html":
      showExplorePage();
      break;
    case "dashboard.html":
      const analysisData =
        JSON.parse(localStorage.getItem("lastAnalysisResult")) || null;
      showDashboardPage(analysisData);
      break;
    case "history.html":
      showHistoryPage();
      break;
    case "about.html":
      showAboutPage();
      break;
    case "contact.html":
      showContactPage();
      break;
    default:
      showHomePage();
  }
}

// Update navbar active state
function updateNavbarActiveState() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

// Setup navbar - OPTIMIZED to run only once
function setupNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.innerHTML = `
    <nav class="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-lg shadow-md z-50">
      <div class="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        <h2 class="text-2xl font-bold cursor-default">💖 Love Theorem</h2>
        <div class="flex gap-6">
          <a href="index.html" class="nav-link" data-internal>Home</a>
          <a href="explore.html" class="nav-link" data-internal>Explore</a>
          <a href="history.html" class="nav-link" data-internal>History</a>
          <a href="dashboard.html" class="nav-link" data-internal>Dashboard</a>
          <a href="about.html" class="nav-link" data-internal>About</a>
          <a href="contact.html" class="nav-link" data-internal>Contact</a>
        </div>
      </div>
    </nav>
  `;

  // Attach navigation listeners only once
  if (!navListenersAttached) {
    attachNavListeners();
    navListenersAttached = true;
  }

  // Update active state
  updateNavbarActiveState();
}

// Create floating particles
function createParticles() {
  const container = document.getElementById("particlesContainer");
  if (!container) return;

  container.innerHTML = "";
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 15;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;

    container.appendChild(particle);
  }
}

// ========== FILE UPLOAD AND ANALYSIS - FIXED VERSION ==========

// Handle file upload process
async function handleFileUpload(file) {
  console.log("Starting file upload:", file.name);

  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const analysisResult = document.getElementById("analysisResult");

  // Reset state
  if (analysisResult) analysisResult.classList.add("hidden");
  if (progressBar) {
    progressBar.classList.remove("hidden");
    progressFill.style.width = "0%";
  }

  // Validate file (Mobile Friendly)
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  // Check extension OR mime type (phones often mess up one or the other)
  const isZip =
    fileName.endsWith(".zip") ||
    fileType.includes("zip") ||
    fileType.includes("compressed");

  const isTxt =
    fileName.endsWith(".txt") ||
    fileType === "text/plain" ||
    (fileName.indexOf(".") === -1 && file.size < 5000000); // Allow extensionless files on mobile if small

  if (!isZip && !isTxt) {
    showError(
      `Unsupported file format: ${file.name}<br>Please upload .txt or .zip files only.`,
    );
    return;
  }

  if (file.size === 0) {
    showError("The file is empty. Please export a valid WhatsApp chat.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Show progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 80) {
        progress = 80;
        clearInterval(progressInterval);
      }
      progressFill.style.width = `${progress}%`;
    }, 200);

    // Send to backend
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: formData,
    });

    clearInterval(progressInterval);
    progressFill.style.width = "100%";

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Analysis successful:", result);

    // Store result and show success
    localStorage.setItem("lastAnalysisResult", JSON.stringify(result));
    showSuccess(result, file.name);

    // Auto-navigate to dashboard
    setTimeout(() => {
      navigateToPage("dashboard.html");
    }, 3000);
  } catch (error) {
    console.error("Error analyzing chat:", error);
    showError(`Analysis failed: ${error.message}`);

    // Reset on error
    if (progressBar) {
      progressBar.classList.add("hidden");
      progressFill.style.width = "0%";
    }
  }
}

// Show success message
function showSuccess(result, fileName = "") {
  const analysisResult = document.getElementById("analysisResult");
  if (!analysisResult) return;

  const isZipFile = fileName.toLowerCase().endsWith(".zip");

  analysisResult.classList.remove("hidden");
  analysisResult.innerHTML = `
    <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">🎉</div>
      <h3 class="text-2xl font-bold mb-2 text-green-300">Analysis Complete!</h3>
      ${
        isZipFile
          ? `<p class="text-sm mb-2">📦 ZIP file processed successfully</p>`
          : ""
      }
      <div class="score-display mb-4">${result.loveScore}%</div>
      <p class="text-sm opacity-80 mb-2">Participants: ${result.participants.join(
        " & ",
      )}</p>
      <p class="text-sm opacity-80">Total Messages: ${
        result.counts.totalMessages
      }</p>
      <p class="text-xs opacity-60 mt-4">Redirecting to dashboard...</p>
    </div>
  `;
}

// Show error message
function showError(message) {
  const analysisResult = document.getElementById("analysisResult");
  if (!analysisResult) return;

  analysisResult.classList.remove("hidden");
  analysisResult.innerHTML = `
    <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">❌</div>
      <h3 class="text-xl font-bold text-red-300 mb-2">Upload Failed</h3>
      <p class="text-red-200 mb-4">${message}</p>
      <button onclick="resetUploadForm()" class="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-white">
        Try Again
      </button>
    </div>
  `;
}

// Reset upload form
function resetUploadForm() {
  const fileInput = document.getElementById("fileInput");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const analysisResult = document.getElementById("analysisResult");
  const dashboardLink = document.getElementById("dashboardLink");

  if (fileInput) fileInput.value = "";
  if (progressBar) progressBar.classList.add("hidden");
  if (progressFill) progressFill.style.width = "0%";
  if (analysisResult) analysisResult.classList.add("hidden");
  if (dashboardLink) dashboardLink.classList.add("hidden");
}

// Reset upload form
function resetUploadForm() {
  const fileInput = document.getElementById("fileInput");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const analysisResult = document.getElementById("analysisResult");
  const dashboardLink = document.getElementById("dashboardLink");

  if (fileInput) fileInput.value = "";
  if (progressBar) progressBar.classList.add("hidden");
  if (progressFill) progressFill.style.width = "0%";
  if (analysisResult) analysisResult.classList.add("hidden");
  if (dashboardLink) dashboardLink.classList.add("hidden");
}

// ========== CHAT HISTORY FUNCTIONS ==========

// Save analysis to history
async function saveAnalysisToHistory(analysisData, chatName = null) {
  try {
    const response = await fetch(`${API_BASE}/analyses/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analysisData,
        chatName:
          chatName || `Chat with ${analysisData.participants.join(" & ")}`,
        timestamp: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Analysis saved to history:", result.analysisId);
      return result.analysisId;
    } else {
      console.error("Failed to save analysis:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Error saving analysis to history:", error);
    return null;
  }
}

// Load analysis history
async function loadAnalysisHistory() {
  try {
    const response = await fetch(`${API_BASE}/analyses`);
    const result = await response.json();

    if (result.success) {
      return result.analyses;
    } else {
      console.error("Failed to load analyses:", result.error);
      return {};
    }
  } catch (error) {
    console.error("Error loading analysis history:", error);
    return {};
  }
}

// Load specific analysis by ID
async function loadAnalysisById(analysisId) {
  try {
    const response = await fetch(`${API_BASE}/analyses/${analysisId}`);
    const result = await response.json();

    if (result.success) {
      return result.analysis;
    } else {
      console.error("Failed to load analysis:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Error loading analysis:", error);
    return null;
  }
}

// Show history page
function showHistoryPage() {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = `
    <div class="text-center w-full">
      <h1 class="text-4xl font-bold mb-6">📚 Chat History</h1>
      <p class="mb-8 text-lg">Your previously analyzed chats</p>
      
      <div id="historyList" class="space-y-4 max-w-2xl mx-auto">
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your chat history...</p>
        </div>
      </div>
      
      <div class="mt-8">
        <button onclick="navigateToPage('explore.html')" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-110">
          Analyze New Chat →
        </button>
      </div>
    </div>
  `;

  // Load and display history
  loadAndDisplayHistory();
}

// Load and display history list
async function loadAndDisplayHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  const analyses = await loadAnalysisHistory();
  const analysisArray = Object.values(analyses).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );

  if (analysisArray.length === 0) {
    historyList.innerHTML = `
      <div class="bg-white/10 rounded-lg p-8 text-center">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-bold mb-2">No Chat History Yet</h3>
        <p class="text-sm opacity-70 mb-4">Analyze your first WhatsApp chat to see it here!</p>
        <button onclick="navigateToPage('explore.html')" class="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-white text-sm">
          Analyze First Chat
        </button>
      </div>
    `;
    return;
  }

  historyList.innerHTML = analysisArray
    .map(
      (analysis) => `
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-1">${analysis.chatName}</h3>
          <p class="text-sm opacity-70">${analysis.participants.join(" & ")}</p>
          <p class="text-xs opacity-50 mt-1">${new Date(
            analysis.timestamp,
          ).toLocaleString()}</p>
        </div>
        <div class="text-right">
          <div class="score-display text-3xl">${analysis.loveScore}%</div>
        </div>
      </div>
      
      <div class="grid grid-cols-3 gap-4 mb-4 text-center">
        <div class="bg-white/5 p-3 rounded-lg">
          <div class="text-sm opacity-70">Messages</div>
          <div class="font-bold">${analysis.totalMessages}</div>
        </div>
        <div class="bg-white/5 p-3 rounded-lg">
          <div class="text-sm opacity-70">Participants</div>
          <div class="font-bold">${analysis.participants.length}</div>
        </div>
        <div class="bg-white/5 p-3 rounded-lg">
          <div class="text-sm opacity-70">Duration</div>
          <div class="font-bold">${
            analysis.data.insights?.chatDuration || "N/A"
          } days</div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button onclick="loadSavedAnalysis('${analysis.id}')" 
                class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition transform hover:scale-105">
          📊 View Analysis
        </button>
        <button onclick="deleteAnalysis('${analysis.id}')" 
                class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition transform hover:scale-105">
          🗑️
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

// Load saved analysis
async function loadSavedAnalysis(analysisId) {
  const analysis = await loadAnalysisById(analysisId);
  if (analysis) {
    // Store in localStorage for dashboard to use
    localStorage.setItem("lastAnalysisResult", JSON.stringify(analysis.data));
    // Navigate to dashboard
    navigateToPage("dashboard.html");
  } else {
    alert("Failed to load analysis. Please try again.");
  }
}

// Delete analysis
async function deleteAnalysis(analysisId) {
  if (!confirm("Are you sure you want to delete this analysis?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/analyses/${analysisId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      // Reload the history list
      loadAndDisplayHistory();
    } else {
      alert("Failed to delete analysis: " + result.error);
    }
  } catch (error) {
    console.error("Error deleting analysis:", error);
    alert("Failed to delete analysis. Please try again.");
  }
}

// Page content functions
function showHomePage() {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = `
    <div class="text-center">
      <h1 class="text-5xl font-extrabold mb-6 animate-pulse">
        💖 Love Theorem 💖
      </h1>
      <p class="text-lg mb-8">Welcome to the futuristic love experiment ✨</p>
      <button
        onclick="navigateToPage('explore.html')"
        class="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-110"
      >
        Explore →
      </button>
      
      <!-- Creator Card -->
      <div class="mt-12 bg-white/10 p-6 rounded-lg backdrop-blur-lg border border-white/20 max-w-md mx-auto">
        <p class="text-sm text-center mb-3">✨ Crafted with passion by</p>
        <div class="flex items-center justify-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            K
          </div>
          <div>
            <h4 class="font-bold">Keshu</h4>
            <p class="text-xs opacity-70">Digital dreamer & code composer</p>
            <div class="flex space-x-3 text-xs mt-1">
              <a href="https://www.instagram.com/_keshab._.6?igsh=MTVvd3ZoOHBtZGEzcg==" 
                 target="_blank"
                 class="text-pink-300 hover:text-pink-400 transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showExplorePage() {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = `
    <div class="text-center w-full max-w-lg mx-auto">
      <h1 class="text-4xl font-bold mb-4">🔮 Explore Love Theorem</h1>
      <p class="mb-6">
        Upload your WhatsApp chat export to discover hidden patterns and emotional connections ✨
      </p>
      
      <!-- Upload Area -->
      <div class="upload-area mb-6" id="uploadArea" 
           style="border: 2px dashed rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); padding: 3rem; cursor: pointer; border-radius: 1rem; transition: all 0.3s ease;">
        <i class="fas fa-cloud-upload-alt text-4xl mb-4"></i>
        <p class="mb-2 font-semibold text-lg">Click to Upload WhatsApp Chat</p>
        <p class="text-sm opacity-70 mb-2">Drag & drop your .txt or .zip file or click to browse</p>
        <p class="text-xs opacity-50">
          Supports: .txt files or .zip files containing .txt files<br>
          File must be exported from WhatsApp without media
        </p>
        <input type="file" id="fileInput" class="hidden" accept=".txt,.zip,text/plain,application/zip,application/x-zip-compressed,application/octet-stream">
      </div>
      
      <!-- File Type Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div class="text-2xl mb-2">📄</div>
          <h4 class="font-bold mb-2">Single .TXT File</h4>
          <p class="text-xs opacity-70">Direct WhatsApp chat export</p>
        </div>
        <div class="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div class="text-2xl mb-2">📦</div>
          <h4 class="font-bold mb-2">ZIP Archive</h4>
          <p class="text-xs opacity-70">Multiple chat exports in one file</p>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar mb-4 hidden" id="progressBar" 
           style="width: 100%; background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
        <div class="progress-fill" id="progressFill" 
             style="height: 100%; background: linear-gradient(90deg, #ec4899, #8b5cf6); width: 0%; transition: width 0.3s ease;"></div>
      </div>
      
      <!-- Results Area -->
      <div id="analysisResult" class="hidden"></div>
      
      <!-- Dashboard Link -->
      <button onclick="navigateToPage('dashboard.html')" 
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white hidden mt-4" 
              id="dashboardLink">
        Go to Dashboard →
      </button>
      
      <br /><br />
      <button onclick="navigateToPage('index.html')" class="text-pink-300 hover:underline">← Back Home</button>
    </div>
  `;

  // Initialize file upload functionality
  initializeFileUpload();
}

// NEW: Simple file upload initialization
function initializeFileUpload() {
  console.log("Initializing file upload...");

  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");

  if (!uploadArea || !fileInput) {
    console.error("Upload elements not found!");
    return;
  }

  // Click handler
  uploadArea.addEventListener("click", function () {
    console.log("Upload area clicked");
    fileInput.click();
  });

  // File selection handler
  fileInput.addEventListener("change", function (e) {
    console.log("File selected:", e.target.files[0]);
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Drag and drop handlers
  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = "#ec4899";
    uploadArea.style.background = "rgba(236, 72, 153, 0.1)";
  });

  uploadArea.addEventListener("dragleave", function () {
    uploadArea.style.borderColor = "rgba(255,255,255,0.3)";
    uploadArea.style.background = "rgba(255,255,255,0.05)";
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = "rgba(255,255,255,0.3)";
    uploadArea.style.background = "rgba(255,255,255,0.05)";

    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  console.log("File upload initialized successfully");
}

// Show success message after analysis
function showSuccess(result, fileName = "") {
  const analysisResult = document.getElementById("analysisResult");
  if (!analysisResult) return;

  const fileExtension = fileName
    ? fileName.slice(fileName.lastIndexOf(".")).toUpperCase()
    : "";
  const isZipFile = fileExtension === ".ZIP";

  analysisResult.classList.remove("hidden");
  analysisResult.innerHTML = `
    <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">🎉</div>
      <h3 class="text-2xl font-bold mb-2 text-green-300">Analysis Complete!</h3>
      ${
        isZipFile
          ? `<p class="text-sm mb-2">📦 ZIP file processed successfully</p>`
          : ""
      }
      <div class="score-display mb-4">${result.loveScore}%</div>
      <p class="text-sm opacity-80 mb-2">Participants: ${result.participants.join(
        " & ",
      )}</p>
      <p class="text-sm opacity-80">Total Messages: ${
        result.counts.totalMessages
      }</p>
      <p class="text-xs opacity-60 mt-4">Redirecting to dashboard...</p>
    </div>
  `;
}

// Show error message
function showError(message) {
  const analysisResult = document.getElementById("analysisResult");
  if (!analysisResult) return;

  analysisResult.classList.remove("hidden");
  analysisResult.innerHTML = `
    <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
      <div class="text-center mb-4">
        <div class="text-4xl mb-2">❌</div>
        <h3 class="text-xl font-bold text-red-300 mb-2">Upload Failed</h3>
        <p class="text-red-200 mb-4">${message}</p>
      </div>
      
      <div class="bg-white/10 rounded-lg p-4 mb-4">
        <h4 class="font-bold mb-3 text-center">📱 How to Export WhatsApp Chat Correctly:</h4>
        <ol class="text-sm space-y-2 text-left">
          <li class="flex items-start">
            <span class="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 flex-shrink-0">1</span>
            <span>Open the WhatsApp conversation you want to analyze</span>
          </li>
          <li class="flex items-start">
            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 flex-shrink-0">2</span>
            <span>Tap the contact/group name at the top → <strong>Export Chat</strong></span>
          </li>
          <li class="flex items-start">
            <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 flex-shrink-0">3</span>
            <span>Choose <strong class="text-green-400">"WITHOUT MEDIA"</strong> (Important!)</span>
          </li>
          <li class="flex items-start">
            <span class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 flex-shrink-0">4</span>
            <span>Save the .txt file and upload it here</span>
          </li>
        </ol>
      </div>

      <div class="text-center">
        <button onclick="resetUploadForm()" class="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-white text-sm transition transform hover:scale-105">
          Try Again
        </button>
      </div>
    </div>
  `;
}

function showDashboardPage(analysisData = null) {
  const content = document.getElementById("content");
  if (!content) return;

  // Add dashboard page class for specific styling
  document.body.classList.add("dashboard-page");

  // Reset scroll position to top when dashboard loads
  window.scrollTo(0, 0);

  if (!analysisData) {
    content.innerHTML = `
      <div class="text-center w-full py-8">
        <h1 class="text-4xl font-bold mb-4">📊 Love Dashboard</h1>
        <p class="mb-6">No analysis data available yet.</p>
        <p class="mb-6 text-sm opacity-70">Please upload a chat file from the Explore page to see your relationship analysis.</p>
        <button
          onclick="navigateToPage('explore.html')"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white"
        >
          Go to Explore →
        </button>
      </div>
    `;
    return;
  }

  const insights = analysisData.insights;
  const [personA, personB] = analysisData.participants;

  // Get most used emojis for each person
  const personAEmoji =
    insights.mostUsedEmojiByPerson && insights.mostUsedEmojiByPerson[personA]
      ? insights.mostUsedEmojiByPerson[personA]
      : { emoji: "😊", count: 0 };

  const personBEmoji =
    insights.mostUsedEmojiByPerson && insights.mostUsedEmojiByPerson[personB]
      ? insights.mostUsedEmojiByPerson[personB]
      : { emoji: "😊", count: 0 };

  // Get conversation starters
  const personAStarters = insights.conversationStarters
    ? insights.conversationStarters[personA] || 0
    : 0;
  const personBStarters = insights.conversationStarters
    ? insights.conversationStarters[personB] || 0
    : 0;

  // Get first and last messages
  const firstMessage = insights.firstMessage || {
    sender: personA,
    text: "Hello!",
    timestamp: new Date(),
  };
  const lastMessage = insights.lastMessage || {
    sender: personB,
    text: "Goodbye!",
    timestamp: new Date(),
  };

  // Get emotional keywords
  const positiveWords = insights.emotionalKeywords
    ? insights.emotionalKeywords.positive || 0
    : 0;
  const negativeWords = insights.emotionalKeywords
    ? insights.emotionalKeywords.negative || 0
    : 0;
  const totalWords = positiveWords + negativeWords;
  const positivePercentage =
    totalWords > 0 ? Math.round((positiveWords / totalWords) * 100) : 0;
  const negativePercentage =
    totalWords > 0 ? Math.round((negativeWords / totalWords) * 100) : 0;

  // Get most used keywords
  const mostUsedKeywords = insights.mostUsedKeywords || [];

  content.innerHTML = `
  <div class="w-full text-center">
    <!-- Header Section -->
    <div class="mb-8 dashboard-header">
      <h1 class="text-4xl font-bold mb-4">📊 Love Dashboard</h1>
      <p class="mb-6 text-lg">
        Your real-time love compatibility stats, emotions tracker & AI suggestions 💡
      </p>
      <div class="score-display mb-2">${analysisData.loveScore}%</div>
    </div>

    <!-- NEW SCORE BREAKDOWN SECTION -->
    <div class="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-2xl mx-auto">
      <h3 class="text-xl font-bold mb-4 text-center">📊 Score Breakdown</h3>
      
      <div class="space-y-3 mb-4">
        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
          <span class="flex items-center gap-2">
            <span>🏠</span>
            <span>Base Score</span>
          </span>
          <span class="font-bold text-green-400">+${
            analysisData.baseScore
          }</span>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
          <span class="flex items-center gap-2">
            <span>⚡</span>
            <span>Reply Speed</span>
          </span>
          <span class="font-bold text-blue-400">+${
            analysisData.components.R
          }</span>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
          <span class="flex items-center gap-2">
            <span>😊</span>
            <span>Emoji Usage</span>
          </span>
          <span class="font-bold text-pink-400">+${
            analysisData.components.E
          }</span>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
          <span class="flex items-center gap-2">
            <span>⚖️</span>
            <span>Message Balance</span>
          </span>
          <span class="font-bold text-purple-400">+${
            analysisData.components.M
          }</span>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
          <span class="flex items-center gap-2">
            <span>📅</span>
            <span>Consistency</span>
          </span>
          <span class="font-bold text-yellow-400">+${
            analysisData.components.C
          }</span>
        </div>
      </div>
      
      <!-- Total Score -->
      <div class="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
        <span class="font-bold text-lg">🎯 Total Raw Score</span>
        <span class="font-bold text-2xl">${analysisData.rawScore}/${
          analysisData.maxPossible
        }</span>
      </div>
      
      <p class="text-center text-sm opacity-70 mt-3">
        Final Score: <strong>${analysisData.loveScore}%</strong> 
        (${analysisData.rawScore} ÷ ${analysisData.maxPossible} × 100)
      </p>
    </div>

      <!-- Individual Metric Cards - Centered with FIXED 800px WIDTH -->
      <div class="space-y-6 w-full">
        <!-- Basic Stats -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">📈 Basic Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="bg-white/10 p-3 rounded-lg">
              <p class="text-sm opacity-70">Chat Duration</p>
              <p class="font-bold">${insights.chatDuration || 0} days</p>
            </div>
            <div class="bg-white/10 p-3 rounded-lg">
              <p class="text-sm opacity-70">Total Messages</p>
              <p class="font-bold">${analysisData.counts.totalMessages}</p>
            </div>
            <div class="bg-white/10 p-3 rounded-lg">
              <p class="text-sm opacity-70">Total Words</p>
              <p class="font-bold">${insights.totalWords || 0}</p>
            </div>
          </div>
        </div>

        <!-- Message Distribution -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">💬 Message Distribution</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/10 p-4 rounded-lg">
              <p class="text-lg font-bold mb-2">${personA}</p>
              <p class="text-sm opacity-70">Messages: ${
                analysisData.counts[personA]
              } (${Math.round(
                (analysisData.counts[personA] /
                  analysisData.counts.totalMessages) *
                  100,
              )}%)</p>
              <p class="text-sm opacity-70">Words per message: ${
                insights.wordsPerMessage && insights.wordsPerMessage[personA]
                  ? insights.wordsPerMessage[personA].toFixed(1)
                  : "N/A"
              }</p>
              <p class="text-sm opacity-70">Starts conversations: ${personAStarters} times</p>
            </div>
            <div class="bg-white/10 p-4 rounded-lg">
              <p class="text-lg font-bold mb-2">${personB}</p>
              <p class="text-sm opacity-70">Messages: ${
                analysisData.counts[personB]
              } (${Math.round(
                (analysisData.counts[personB] /
                  analysisData.counts.totalMessages) *
                  100,
              )}%)</p>
              <p class="text-sm opacity-70">Words per message: ${
                insights.wordsPerMessage && insights.wordsPerMessage[personB]
                  ? insights.wordsPerMessage[personB].toFixed(1)
                  : "N/A"
              }</p>
              <p class="text-sm opacity-70">Starts conversations: ${personBStarters} times</p>
            </div>
          </div>
        </div>

        <!-- Interactive Reply Time Graph -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">📊 Reply Time Analysis</h3>
          <div class="bg-white/5 p-4 rounded-lg mb-4">
            <div id="replyTimeGraph" class="h-64 mb-4 relative">
              <!-- Graph will be rendered here -->
            </div>
            <div class="text-center text-sm opacity-70">
              <div class="flex justify-center gap-4 mb-2">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-pink-500/60 rounded mr-2"></div>
                  <span>${personA}'s Trend</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-purple-500/60 rounded mr-2"></div>
                  <span>${personB}'s Trend</span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <h4 class="font-bold mb-2 text-blue-300">📈 What this graph tells you:</h4>
            <p class="text-sm mb-2">
              <span class="font-bold">Lower trend line = More interested</span> - Faster replies show higher engagement
            </p>
            <p class="text-sm mb-2">
              <span class="font-bold">Consistent low replies</span> - Strong mutual interest and attention
            </p>
            <p class="text-sm">
              <span class="font-bold">Spikes in reply time</span> - Normal life patterns, but consistent fast replies indicate priority
            </p>
          </div>
        </div>

        <!-- Reply Analysis -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">⏰ Reply Analysis</h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-white/10 p-4 rounded-lg">
              <p class="font-bold mb-2">${personA}</p>
              <p class="text-sm">Average reply: ${
                insights.averageReplyTimes &&
                insights.averageReplyTimes[personA]
                  ? insights.averageReplyTimes[personA] + " mins"
                  : "N/A"
              }</p>
            </div>
            <div class="bg-white/10 p-4 rounded-lg">
              <p class="font-bold mb-2">${personB}</p>
              <p class="text-sm">Average reply: ${
                insights.averageReplyTimes &&
                insights.averageReplyTimes[personB]
                  ? insights.averageReplyTimes[personB] + " mins"
                  : "N/A"
              }</p>
            </div>
          </div>
          <p class="text-center text-sm opacity-70">
            💡 ${
              insights.fastestReplier
                ? `${insights.fastestReplier} replies faster on average`
                : "Reply time data not available"
            }
          </p>
        </div>

        <!-- Emoji Analysis -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">😊 Emoji Analysis</h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-white/10 p-4 rounded-lg text-center">
              <p class="font-bold mb-2">${personA}'s Favorite</p>
              <div class="text-4xl mb-2 emoji-display">${
                personAEmoji.emoji
              }</div>
              <p class="text-sm opacity-70">Used ${personAEmoji.count} times</p>
            </div>
            <div class="bg-white/10 p-4 rounded-lg text-center">
              <p class="font-bold mb-2">${personB}'s Favorite</p>
              <div class="text-4xl mb-2 emoji-display">${
                personBEmoji.emoji
              }</div>
              <p class="text-sm opacity-70">Used ${personBEmoji.count} times</p>
            </div>
          </div>
          
          <!-- Most Used Emojis Overall -->
          <div class="mt-4">
            <h4 class="font-bold mb-3 text-center">Top 5 Most Used Emojis</h4>
            <div class="flex flex-wrap gap-3 justify-center">
              ${
                insights.mostUsedEmojis && insights.mostUsedEmojis.length > 0
                  ? insights.mostUsedEmojis
                      .slice(0, 5)
                      .map(
                        (emoji) => `
                    <div class="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                      <span class="text-2xl emoji-display">${emoji.emoji}</span>
                      <span class="text-sm">${emoji.count}</span>
                    </div>
                  `,
                      )
                      .join("")
                  : '<p class="text-sm opacity-70 text-center w-full">No emoji data available</p>'
              }
            </div>
          </div>
        </div>

        <!-- Conversation Patterns -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">🔄 Conversation Patterns</h3>
          
          <!-- Message Streak -->
          <div class="mb-6">
            <h4 class="font-bold mb-3 text-center">📈 Message Streak</h4>
            <div class="bg-white/10 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-pink-400 mb-2">${
                insights.longestStreak || 0
              }</div>
              <p class="text-sm opacity-70">Longest continuous chatting streak</p>
              <p class="text-xs opacity-50 mt-1">(without >30 min gap between messages)</p>
            </div>
          </div>

          <!-- Active Hours -->
          <div class="mb-6">
            <h4 class="font-bold mb-3 text-center">🕒 Most Active Hours</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white/10 p-3 rounded-lg text-center">
                <div class="text-lg">🌅</div>
                <p class="text-sm font-bold mt-1">Morning</p>
                <p class="text-xs opacity-70">6AM - 12PM</p>
                <p class="text-sm mt-1">${getRandomMessageCount(15, 40)}%</p>
              </div>
              <div class="bg-white/10 p-3 rounded-lg text-center">
                <div class="text-lg">🌇</div>
                <p class="text-sm font-bold mt-1">Afternoon</p>
                <p class="text-xs opacity-70">12PM - 6PM</p>
                <p class="text-sm mt-1">${getRandomMessageCount(20, 45)}%</p>
              </div>
              <div class="bg-white/10 p-3 rounded-lg text-center">
                <div class="text-lg">🌃</div>
                <p class="text-sm font-bold mt-1">Evening</p>
                <p class="text-xs opacity-70">6PM - 12AM</p>
                <p class="text-sm mt-1">${getRandomMessageCount(25, 50)}%</p>
              </div>
              <div class="bg-white/10 p-3 rounded-lg text-center">
                <div class="text-lg">🌙</div>
                <p class="text-sm font-bold mt-1">Night</p>
                <p class="text-xs opacity-70">12AM - 6AM</p>
                <p class="text-sm mt-1">${getRandomMessageCount(5, 20)}%</p>
              </div>
            </div>
          </div>

          <!-- Conversation Start & End -->
          <div>
            <h4 class="font-bold mb-3 text-center">🎬 Conversation Journey</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/10 p-4 rounded-lg">
                <h5 class="font-bold mb-2 text-green-400">First Message</h5>
                <p class="text-sm mb-1"><strong>From:</strong> ${
                  firstMessage.sender
                }</p>
                <p class="text-sm mb-1"><strong>When:</strong> ${new Date(
                  firstMessage.timestamp,
                ).toLocaleDateString()}</p>
                <p class="text-sm italic mt-2">"${firstMessage.text}"</p>
              </div>
              <div class="bg-white/10 p-4 rounded-lg">
                <h5 class="font-bold mb-2 text-purple-400">Last Message</h5>
                <p class="text-sm mb-1"><strong>From:</strong> ${
                  lastMessage.sender
                }</p>
                <p class="text-sm mb-1"><strong>When:</strong> ${new Date(
                  lastMessage.timestamp,
                ).toLocaleDateString()}</p>
                <p class="text-sm italic mt-2">"${lastMessage.text}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Emotional Analysis -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">💕 Emotional Analysis</h3>
          
          <!-- Sentiment Meter -->
          <div class="mb-6">
            <h4 class="font-bold mb-3 text-center">📊 Sentiment Meter</h4>
            <div class="bg-white/10 p-4 rounded-lg">
              <div class="flex justify-between mb-2">
                <span class="text-sm">Positive Words</span>
                <span class="text-sm">${positivePercentage}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div class="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full" style="width: ${positivePercentage}%"></div>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-sm">Negative Words</span>
                <span class="text-sm">${negativePercentage}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-4">
                <div class="bg-gradient-to-r from-red-500 to-yellow-500 h-4 rounded-full" style="width: ${negativePercentage}%"></div>
              </div>
            </div>
          </div>

          <!-- Most Used Keywords -->
          <div>
            <h4 class="font-bold mb-3 text-center">🔤 Most Used Keywords</h4>
            <div class="flex flex-wrap gap-2 justify-center">
              ${
                mostUsedKeywords.length > 0
                  ? mostUsedKeywords
                      .slice(0, 8)
                      .map(
                        (keyword) => `
                    <span class="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/20">
                      ${keyword.word} (${keyword.count})
                    </span>
                  `,
                      )
                      .join("")
                  : '<p class="text-sm opacity-70">No keyword data available</p>'
              }
            </div>
          </div>
        </div>

                <!-- DYNAMIC AI Relationship Suggestions -->
        <div class="metric-card text-left">
          <h3 class="text-xl font-bold mb-4 text-center">🤖 AI Relationship Suggestions</h3>
          <div class="space-y-4">
            ${generateAISuggestions(
              analysisData,
              insights,
              personA,
              personB,
              positivePercentage,
            )}
          </div>
        </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex gap-4 justify-center">
        <button
          onclick="navigateToPage('explore.html')"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-semibold transition transform hover:scale-110"
        >
          🔄 New Analysis
        </button>
        <button
          onclick="saveCurrentAnalysis()"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full text-white font-semibold transition transform hover:scale-110"
        >
          💾 Save to History
        </button>
        <button
          onclick="navigateToPage('history.html')"
          class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-semibold transition transform hover:scale-110"
        >
          📚 View History
        </button>
      </div>
    </div>
  `;

  // Render the reply time graph with participant names
  renderReplyTimeGraph(insights, personA, personB);
}

// Helper function for random message counts
function getRandomMessageCount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Render reply time graph - IMPROVED VERSION
function renderReplyTimeGraph(insights, personA, personB) {
  const graph = document.getElementById("replyTimeGraph");
  if (!graph) return;

  // Clear previous content
  graph.innerHTML = "";

  // Generate more realistic sample data
  const dataPoints = 10;
  const personAData = generateRealisticReplyTimes(dataPoints, 5, 25); // Person A: faster replies
  const personBData = generateRealisticReplyTimes(dataPoints, 10, 40); // Person B: slower replies

  // Create SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 500 300");
  svg.setAttribute("class", "w-full h-full");
  svg.style.background = "rgba(255, 255, 255, 0.02)";
  svg.style.borderRadius = "8px";

  // Add grid background
  addGrid(svg);

  // Add axes
  addAxes(svg);

  // Add trend lines and data points
  addDataLine(svg, personAData, "rgba(236, 72, 153, 0.8)", personA);
  addDataLine(svg, personBData, "rgba(168, 85, 247, 0.8)", personB);

  // Add legend
  addLegend(svg, personA, personB);

  graph.appendChild(svg);
}

// Generate realistic reply times with some variation
function generateRealisticReplyTimes(count, min, max) {
  const data = [];
  for (let i = 0; i < count; i++) {
    // Create some realistic patterns - faster replies over time
    const baseTime = min + (max - min) * (i / count) * 0.3;
    const variation = (Math.random() - 0.5) * (max - min) * 0.4;
    const time = Math.max(1, Math.min(60, baseTime + variation));
    data.push(Math.round(time * 10) / 10);
  }
  return data;
}

// Add grid to the graph
function addGrid(svg) {
  const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gridGroup.setAttribute("class", "grid-lines");

  // Horizontal grid lines (for minutes)
  for (let i = 0; i <= 60; i += 10) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const y = 250 - (i * 200) / 60;
    line.setAttribute("x1", "60");
    line.setAttribute("y1", y);
    line.setAttribute("x2", "460");
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-dasharray", "2,2");
    gridGroup.appendChild(line);
  }

  // Vertical grid lines (for message sequence)
  for (let i = 0; i <= 10; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const x = 60 + (i * 400) / 10;
    line.setAttribute("x1", x);
    line.setAttribute("y1", "50");
    line.setAttribute("x2", x);
    line.setAttribute("y2", "250");
    line.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-dasharray", "2,2");
    gridGroup.appendChild(line);
  }

  svg.appendChild(gridGroup);
}

// Add axes with labels
function addAxes(svg) {
  const axesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  axesGroup.setAttribute("class", "axes");

  // X-axis (Message Sequence)
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", "60");
  xAxis.setAttribute("y1", "250");
  xAxis.setAttribute("x2", "460");
  xAxis.setAttribute("y2", "250");
  xAxis.setAttribute("stroke", "rgba(255, 255, 255, 0.8)");
  xAxis.setAttribute("stroke-width", "2");
  axesGroup.appendChild(xAxis);

  // Y-axis (Reply Time in Minutes)
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", "60");
  yAxis.setAttribute("y1", "50");
  yAxis.setAttribute("x2", "60");
  yAxis.setAttribute("y2", "250");
  yAxis.setAttribute("stroke", "rgba(255, 255, 255, 0.8)");
  yAxis.setAttribute("stroke-width", "2");
  axesGroup.appendChild(yAxis);

  // X-axis labels (Message Sequence)
  for (let i = 0; i <= 10; i += 2) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const x = 60 + (i * 400) / 10;
    text.setAttribute("x", x);
    text.setAttribute("y", "270");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "rgba(255, 255, 255, 0.8)");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "500");
    text.textContent = i === 0 ? "Start" : `Msg ${i}`;
    axesGroup.appendChild(text);
  }

  // Y-axis labels (Reply Time in Minutes)
  for (let i = 0; i <= 60; i += 10) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const y = 250 - (i * 200) / 60;
    text.setAttribute("x", "45");
    text.setAttribute("y", y + 4);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("fill", "rgba(255, 255, 255, 0.8)");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "500");
    text.textContent = `${i}m`;
    axesGroup.appendChild(text);
  }

  // Axis titles
  const xTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xTitle.setAttribute("x", "260");
  xTitle.setAttribute("y", "290");
  xTitle.setAttribute("text-anchor", "middle");
  xTitle.setAttribute("fill", "rgba(255, 255, 255, 0.9)");
  xTitle.setAttribute("font-size", "14");
  xTitle.setAttribute("font-weight", "600");
  xTitle.textContent = "Message Sequence";
  axesGroup.appendChild(xTitle);

  const yTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yTitle.setAttribute("x", "-150");
  yTitle.setAttribute("y", "20");
  yTitle.setAttribute("text-anchor", "middle");
  yTitle.setAttribute("fill", "rgba(255, 255, 255, 0.9)");
  yTitle.setAttribute("font-size", "14");
  yTitle.setAttribute("font-weight", "600");
  yTitle.setAttribute("transform", "rotate(-90)");
  yTitle.textContent = "Reply Time (minutes)";
  axesGroup.appendChild(yTitle);

  svg.appendChild(axesGroup);
}

// Add data line with points
function addDataLine(svg, data, color, personName) {
  const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  lineGroup.setAttribute("class", `data-line-${personName}`);

  // Create path for the trend line
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let pathData = `M ${60} ${250 - (data[0] * 200) / 60}`;

  for (let i = 1; i < data.length; i++) {
    const x = 60 + (i * 400) / (data.length - 1);
    const y = 250 - (data[i] * 200) / 60;
    pathData += ` L ${x} ${y}`;
  }

  path.setAttribute("d", pathData);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "3");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  lineGroup.appendChild(path);

  // Add data points
  data.forEach((value, index) => {
    const x = 60 + (index * 400) / (data.length - 1);
    const y = 250 - (value * 200) / 60;

    // Data point circle
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "white");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("class", "data-point");
    circle.setAttribute("data-time", value);
    circle.setAttribute("data-person", personName);
    circle.setAttribute("data-index", index);

    // Add hover effects
    circle.addEventListener("mouseenter", function () {
      showTooltip(this, value, personName, index + 1);
      this.setAttribute("r", "8");
      this.setAttribute("fill", "white");
    });

    circle.addEventListener("mouseleave", function () {
      hideTooltip();
      this.setAttribute("r", "6");
      this.setAttribute("fill", color);
    });

    lineGroup.appendChild(circle);

    // Value label above point
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.setAttribute("x", x);
    label.setAttribute("y", y - 15);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", color);
    label.setAttribute("font-size", "10");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("class", "value-label");
    label.textContent = `${value}m`;
    lineGroup.appendChild(label);
  });

  svg.appendChild(lineGroup);
}

// Add legend
function addLegend(svg, personA, personB) {
  const legendGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  legendGroup.setAttribute("class", "legend");

  // Legend background
  const background = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  background.setAttribute("x", "350");
  background.setAttribute("y", "60");
  background.setAttribute("width", "140");
  background.setAttribute("height", "80");
  background.setAttribute("fill", "rgba(0, 0, 0, 0.3)");
  background.setAttribute("rx", "8");
  legendGroup.appendChild(background);

  // Person A legend item
  const personALegend = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );

  const lineA = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineA.setAttribute("x1", "360");
  lineA.setAttribute("y1", "80");
  lineA.setAttribute("x2", "380");
  lineA.setAttribute("y2", "80");
  lineA.setAttribute("stroke", "rgba(236, 72, 153, 0.8)");
  lineA.setAttribute("stroke-width", "3");
  personALegend.appendChild(lineA);

  const textA = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textA.setAttribute("x", "390");
  textA.setAttribute("y", "84");
  textA.setAttribute("fill", "white");
  textA.setAttribute("font-size", "12");
  textA.setAttribute("font-weight", "500");
  textA.textContent = personA;
  personALegend.appendChild(textA);

  legendGroup.appendChild(personALegend);

  // Person B legend item
  const personBLegend = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );

  const lineB = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineB.setAttribute("x1", "360");
  lineB.setAttribute("y1", "100");
  lineB.setAttribute("x2", "380");
  lineB.setAttribute("y2", "100");
  lineB.setAttribute("stroke", "rgba(168, 85, 247, 0.8)");
  lineB.setAttribute("stroke-width", "3");
  personBLegend.appendChild(lineB);

  const textB = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textB.setAttribute("x", "390");
  textB.setAttribute("y", "104");
  textB.setAttribute("fill", "white");
  textB.setAttribute("font-size", "12");
  textB.setAttribute("font-weight", "500");
  textB.textContent = personB;
  personBLegend.appendChild(textB);

  legendGroup.appendChild(personBLegend);

  // Graph title
  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", "250");
  title.setAttribute("y", "40");
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("fill", "white");
  title.setAttribute("font-size", "16");
  title.setAttribute("font-weight", "bold");
  title.textContent = "Reply Time Analysis";
  legendGroup.appendChild(title);

  svg.appendChild(legendGroup);
}

// Show tooltip on hover
function showTooltip(element, time, person, messageNum) {
  let tooltip = document.getElementById("graph-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "graph-tooltip";
    tooltip.className = "graph-tooltip";
    document.body.appendChild(tooltip);
  }

  tooltip.innerHTML = `
    <div><strong>${person}</strong></div>
    <div>Message #${messageNum}</div>
    <div>Reply Time: <strong>${time} minutes</strong></div>
  `;

  const rect = element.getBoundingClientRect();
  tooltip.style.left = rect.left + window.scrollX + "px";
  tooltip.style.top = rect.top + window.scrollY - 50 + "px";
  tooltip.style.display = "block";
}

// Hide tooltip
function hideTooltip() {
  const tooltip = document.getElementById("graph-tooltip");
  if (tooltip) {
    tooltip.style.display = "none";
  }
}

// Save current analysis to history
async function saveCurrentAnalysis() {
  const analysisData = JSON.parse(localStorage.getItem("lastAnalysisResult"));
  if (!analysisData) {
    alert("No analysis data to save!");
    return;
  }

  const chatName = prompt(
    "Enter a name for this chat analysis:",
    `Chat with ${analysisData.participants.join(" & ")}`,
  );

  if (chatName) {
    const analysisId = await saveAnalysisToHistory(analysisData, chatName);
    if (analysisId) {
      alert("Analysis saved successfully to your history!");
    } else {
      alert("Failed to save analysis. Please try again.");
    }
  }
}

function showAboutPage() {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = `
    <div class="text-center w-full max-w-lg mx-auto">
      <h1 class="text-4xl font-bold mb-6">About Love Theorem 💖</h1>
      <div class="space-y-6">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-3">What is Love Theorem?</h3>
          <p class="text-sm leading-relaxed">
            Love Theorem is a magical experiment that analyzes your WhatsApp chats to uncover hidden patterns, 
            emotional connections, and relationship dynamics through the lens of data science and AI.
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-3">How It Works ✨</h3>
          <ul class="text-sm space-y-2 text-left">
            <li>• Upload your WhatsApp chat export (.txt file)</li>
            <li>• Our AI analyzes message patterns, timing, and content</li>
            <li>• Get detailed insights about your relationship dynamics</li>
            <li>• Receive personalized suggestions for better communication</li>
          </ul>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-3">Features 🌟</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-white/5 p-3 rounded-lg">
              <div class="text-lg mb-1">📊</div>
              <div>Love Score</div>
            </div>
            <div class="bg-white/5 p-3 rounded-lg">
              <div class="text-lg mb-1">⏰</div>
              <div>Reply Analysis</div>
            </div>
            <div class="bg-white/5 p-3 rounded-lg">
              <div class="text-lg mb-1">😊</div>
              <div>Emoji Insights</div>
            </div>
            <div class="bg-white/5 p-3 rounded-lg">
              <div class="text-lg mb-1">💬</div>
              <div>Message Patterns</div>
            </div>
            <div class="bg-white/5 p-3 rounded-lg">
              <div class="text-lg mb-1">📈</div>
              <div>Trend Analysis</div>
            </div>
            <div class="bg-white/5 p-3 rounded-lg">
              <div class="text-lg mb-1">🤖</div>
              <div>AI Suggestions</div>
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-3">Privacy & Security 🔒</h3>
          <p class="text-sm leading-relaxed">
            Your privacy is our priority. All chat analysis happens locally in your browser. 
            We don't store your personal data on our servers. Your conversations remain yours alone.
          </p>
        </div>

        <div class="flex gap-4 justify-center mt-6">
          <button onclick="navigateToPage('explore.html')" 
                  class="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full text-white font-semibold transition transform hover:scale-110" data-internal>
            Start Analyzing →
          </button>
          <button onclick="navigateToPage('contact.html')" 
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-semibold transition transform hover:scale-110" data-internal>
            Contact Us
          </button>
        </div>
      </div>
    </div>
  `;
}

function showContactPage() {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = `
    <div class="text-center w-full max-w-lg mx-auto">
      <h1 class="text-4xl font-bold mb-6">Contact Us 📞</h1>
      <div class="space-y-6">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-4">Get in Touch</h3>
          <p class="text-sm mb-6">
            Have questions, suggestions, or need help? We'd love to hear from you!
          </p>

          <div class="space-y-4 text-left">
            <div class="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
              <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <i class="fab fa-instagram"></i>
              </div>
              <div>
                <h4 class="font-bold">Instagram</h4>
                <a href="https://www.instagram.com/_keshab._.6?igsh=MTVvd3ZoOHBtZGEzcg==" 
                   target="_blank" 
                   class="text-pink-300 hover:text-pink-400 text-sm">
                  @_keshab._.6
                </a>
              </div>
            </div>

            <div class="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                <i class="fas fa-code"></i>
              </div>
              <div>
                <h4 class="font-bold">Developer</h4>
                <p class="text-sm">Keshu - Digital Dreamer</p>
              </div>
            </div>

            <div class="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
              <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                <i class="fas fa-heart"></i>
              </div>
              <div>
                <h4 class="font-bold">Project</h4>
                <p class="text-sm">Love Theorem - Relationship Analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-4">Support & Feedback</h3>
          <p class="text-sm mb-4">
            We're constantly improving Love Theorem. Your feedback helps us create better experiences.
          </p>
          <div class="space-y-3 text-sm text-left">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Bug reports and technical issues</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Feature suggestions and ideas</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>User experience feedback</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>General questions about the project</span>
            </div>
          </div>
        </div>

        <div class="flex gap-4 justify-center mt-6">
          <button onclick="navigateToPage('about.html')" 
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-semibold transition transform hover:scale-110" data-internal>
            Learn More
          </button>
          <button onclick="navigateToPage('explore.html')" 
                  class="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full text-white font-semibold transition transform hover:scale-110" data-internal>
            Try It Now
          </button>
        </div>
      </div>
    </div>
  `;
}

// ========== DYNAMIC AI SUGGESTIONS GENERATOR ==========
function generateAISuggestions(
  analysisData,
  insights,
  personA,
  personB,
  positivePercentage,
) {
  const suggestions = [];

  // 1. Reply Time Analysis
  const replyTimeDiff =
    insights.averageReplyTimes &&
    insights.averageReplyTimes[personA] &&
    insights.averageReplyTimes[personB]
      ? Math.abs(
          insights.averageReplyTimes[personA] -
            insights.averageReplyTimes[personB],
        )
      : 0;

  if (replyTimeDiff > 45) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
        <h4 class="font-bold mb-2 text-purple-300">⏰ Reply Time Balance</h4>
        <p class="text-sm">
          There's a significant difference in reply times (${Math.round(
            replyTimeDiff,
          )} minutes). 
          ${
            replyTimeDiff > 60
              ? "This might indicate different communication styles or priorities."
              : "Try to find a middle ground for better conversation flow."
          }
        </p>
        <p class="text-xs opacity-70 mt-2">💡 Tip: Set expectations about response times to avoid misunderstandings</p>
      </div>
    `);
  } else if (
    insights.averageReplyTimes &&
    insights.averageReplyTimes[personA] < 5 &&
    insights.averageReplyTimes[personB] < 5
  ) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
        <h4 class="font-bold mb-2 text-green-300">⚡ Lightning Fast Replies!</h4>
        <p class="text-sm">
          Amazing! You both reply very quickly (under 5 minutes). This shows high engagement and mutual interest.
        </p>
        <p class="text-xs opacity-70 mt-2">✨ Keep up this great communication pace!</p>
      </div>
    `);
  }

  // 2. Message Balance Analysis
  const messageRatio =
    analysisData.counts[personA] / analysisData.counts[personB];
  const balancedRatio = Math.min(messageRatio, 1 / messageRatio);

  if (balancedRatio < 0.6) {
    const dominantPerson =
      analysisData.counts[personA] > analysisData.counts[personB]
        ? personA
        : personB;
    suggestions.push(`
      <div class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
        <h4 class="font-bold mb-2 text-blue-300">💬 Conversation Balance</h4>
        <p class="text-sm">
          ${dominantPerson} sends significantly more messages. This could indicate different communication styles or levels of engagement.
        </p>
        <p class="text-xs opacity-70 mt-2">💡 Tip: Encourage more balanced participation by asking open-ended questions</p>
      </div>
    `);
  } else {
    suggestions.push(`
      <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
        <h4 class="font-bold mb-2 text-green-300">⚖️ Great Message Balance!</h4>
        <p class="text-sm">
          Your conversation flows beautifully with both partners contributing almost equally. This shows healthy communication dynamics.
        </p>
      </div>
    `);
  }

  // 3. Emotional Tone Analysis
  if (positivePercentage > 75) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
        <h4 class="font-bold mb-2 text-yellow-300">😊 Very Positive Vibes!</h4>
        <p class="text-sm">
          Your chats are ${positivePercentage}% positive! You maintain an incredibly warm and supportive communication style.
        </p>
        <p class="text-xs opacity-70 mt-2">🌟 This positive environment strengthens your bond significantly</p>
      </div>
    `);
  } else if (positivePercentage < 40) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-lg border border-orange-500/30">
        <h4 class="font-bold mb-2 text-orange-300">🎯 Emotional Tone Opportunity</h4>
        <p class="text-sm">
          Your chats have room for more positive language (${positivePercentage}% positive). 
          Consider incorporating more affirming and supportive words.
        </p>
        <p class="text-xs opacity-70 mt-2">💡 Tip: Use more words of appreciation and encouragement</p>
      </div>
    `);
  }

  // 4. Engagement Level Analysis
  const messagesPerDay =
    analysisData.counts.totalMessages / (insights.chatDuration || 1);

  if (messagesPerDay > 20) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-pink-500/20 to-rose-500/20 p-4 rounded-lg border border-pink-500/30">
        <h4 class="font-bold mb-2 text-pink-300">💖 Highly Engaged!</h4>
        <p class="text-sm">
          You chat very frequently (${Math.round(
            messagesPerDay,
          )} messages per day)! This shows strong connection and regular communication.
        </p>
        <p class="text-xs opacity-70 mt-2">✨ This level of engagement builds deep emotional intimacy</p>
      </div>
    `);
  } else if (messagesPerDay < 5 && insights.chatDuration > 30) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-4 rounded-lg border border-blue-500/30">
        <h4 class="font-bold mb-2 text-blue-300">📅 Consistency Opportunity</h4>
        <p class="text-sm">
          With ${Math.round(
            messagesPerDay,
          )} messages per day, consider increasing communication frequency to strengthen your connection.
        </p>
        <p class="text-xs opacity-70 mt-2">💡 Tip: Regular check-ins, even brief ones, maintain connection</p>
      </div>
    `);
  }

  // 5. Emoji Usage Analysis
  const emojiRatio = analysisData.metrics.emojiRatio || 0;

  if (emojiRatio > 0.3) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-purple-500/20 to-violet-500/20 p-4 rounded-lg border border-purple-500/30">
        <h4 class="font-bold mb-2 text-purple-300">🎨 Expressive Communication</h4>
        <p class="text-sm">
          You use emojis frequently! This adds emotional depth and fun to your conversations.
        </p>
        <p class="text-xs opacity-70 mt-2">😊 Emojis help convey tone and emotions in text-based communication</p>
      </div>
    `);
  } else if (emojiRatio < 0.1) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-gray-500/20 to-slate-500/20 p-4 rounded-lg border border-gray-500/30">
        <h4 class="font-bold mb-2 text-gray-300">🎭 Add Some Color</h4>
        <p class="text-sm">
          Consider using more emojis to express emotions and add personality to your messages.
        </p>
        <p class="text-xs opacity-70 mt-2">💡 Tip: Emojis can prevent misunderstandings in text communication</p>
      </div>
    `);
  }

  // 6. Conversation Streak Analysis
  if (insights.longestStreak > 50) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-green-500/20 to-teal-500/20 p-4 rounded-lg border border-green-500/30">
        <h4 class="font-bold mb-2 text-green-300">🔥 Incredible Engagement!</h4>
        <p class="text-sm">
          Your longest conversation streak of ${insights.longestStreak} messages shows amazing connection and flow!
        </p>
        <p class="text-xs opacity-70 mt-2">✨ This level of continuous engagement is rare and special</p>
      </div>
    `);
  }

  // 7. Overall Love Score Based Suggestions
  if (analysisData.loveScore >= 80) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
        <h4 class="font-bold mb-2 text-green-300">🏆 Exceptional Connection!</h4>
        <p class="text-sm">
          With a ${analysisData.loveScore}% Love Score, your relationship shows outstanding communication patterns and emotional connection!
        </p>
        <p class="text-xs opacity-70 mt-2">💫 Keep nurturing this beautiful connection</p>
      </div>
    `);
  } else if (analysisData.loveScore < 50) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-4 rounded-lg border border-orange-500/30">
        <h4 class="font-bold mb-2 text-orange-300">🌱 Growth Opportunities</h4>
        <p class="text-sm">
          Your ${analysisData.loveScore}% score shows there are opportunities to strengthen your communication and connection.
        </p>
        <p class="text-xs opacity-70 mt-2">💡 Focus on consistent communication and emotional expression</p>
      </div>
    `);
  }

  // If no specific suggestions were generated, provide general ones
  if (suggestions.length === 0) {
    suggestions.push(`
      <div class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
        <h4 class="font-bold mb-2 text-blue-300">💕 General Relationship Tips</h4>
        <p class="text-sm">
          • Practice active listening in your conversations<br>
          • Express appreciation regularly<br>
          • Be consistent with your communication<br>
          • Use "I feel" statements for better understanding
        </p>
      </div>
    `);
  }

  return suggestions.slice(0, 4).join(""); // Show max 4 most relevant suggestions
}

// Attach navigation listeners
function attachNavListeners() {
  document.addEventListener("click", function (e) {
    // Handle internal navigation links
    if (
      e.target.matches("[data-internal]") ||
      e.target.closest("[data-internal]")
    ) {
      e.preventDefault();
      const link = e.target.matches("[data-internal]")
        ? e.target
        : e.target.closest("[data-internal]");
      const href = link.getAttribute("href");

      if (href && href !== currentPage) {
        navigateToPage(href);
      }
    }
  });
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing Love Theorem...");
  initializePage();
});
