// Love Theorem Frontend JavaScript - COMPLETE FIXED VERSION

// ========== IMPORTANT: CHOOSE THE CORRECT API_BASE ==========
// For PRODUCTION (when frontend is deployed):
const API_BASE = "https://love-theorem-backend.onrender.com/api";

// For LOCAL DEVELOPMENT (when testing locally):
// const API_BASE = "http://localhost:10000/api";

// ========== USER MANAGEMENT ==========
let USER_ID = localStorage.getItem("loveTheoremUserId");
if (!USER_ID) {
  USER_ID = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("loveTheoremUserId", USER_ID);
}

// ========== NAVIGATION & TRANSITIONS ==========
const transitionTypes = ["morph", "split", "push", "reveal", "zoom", "sweep"];
let currentTransition = 0;
let currentPage = "index.html";
let isNavigating = false;
let navListenersAttached = false;

function initializePage() {
  console.log("Initializing with connected transitions...");
  createParticles();
  setupNavbar();

  window.addEventListener("popstate", handlePopState);

  setTimeout(() => {
    const page = getCurrentPageFromURL();
    currentPage = page;
    loadPageContent(page);
    updateNavbarActiveState();

    const content = document.getElementById("content");
    if (content) {
      content.classList.add("fade-in");
      setTimeout(() => {
        content.classList.remove("fade-in");
      }, 1000);
    }
  }, 100);
}

function handlePopState(event) {
  if (!isNavigating) {
    loadPageFromURL();
  }
}

function getCurrentPageFromURL() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";
  return page;
}

function loadPageFromURL() {
  const page = getCurrentPageFromURL();
  if (page !== currentPage && !isNavigating) {
    navigateToPage(page, false);
  }
}

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

  const transitionType = transitionTypes[currentTransition];
  currentTransition = (currentTransition + 1) % transitionTypes.length;

  const allTransitionClasses = [];
  transitionTypes.forEach((type) => {
    allTransitionClasses.push(`${type}-in`, `${type}-out`);
  });
  content.classList.remove(...allTransitionClasses);

  content.classList.add(`${transitionType}-out`);

  setTimeout(() => {
    cleanupBodyClasses();
    currentPage = page;

    if (pushToHistory) {
      window.history.pushState({ page }, "", page);
    }

    loadPageContent(page);
    updateNavbarActiveState();

    setTimeout(() => {
      content.classList.remove(`${transitionType}-out`);
      content.classList.add(`${transitionType}-in`);

      setTimeout(() => {
        content.classList.remove(`${transitionType}-in`);
        isNavigating = false;
        void content.offsetWidth;
      }, 2000);
    }, 50);
  }, 1500);
}

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

function loadPageContent(page) {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = "";

  switch (page) {
    case "index.html":
      showHomePage();
      break;
    case "explore.html":
      showExplorePage();
      break;
    case "dashboard.html":
      const analysisData = JSON.parse(localStorage.getItem("lastAnalysisResult")) || null;
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

  if (!navListenersAttached) {
    attachNavListeners();
    navListenersAttached = true;
  }

  updateNavbarActiveState();
}

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

// ========== FILE UPLOAD WITH ZIP SUPPORT ==========

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
        <input type="file" id="fileInput" class="hidden" accept=".txt,.zip">
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

  initializeFileUpload();
}

function initializeFileUpload() {
  console.log("Initializing file upload...");
  
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  
  if (!uploadArea || !fileInput) {
    console.error("Upload elements not found!");
    return;
  }

  // Click handler
  uploadArea.addEventListener('click', function() {
    console.log("Upload area clicked");
    fileInput.click();
  });

  // File selection handler
  fileInput.addEventListener('change', function(e) {
    console.log("File selected:", e.target.files[0]);
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Drag and drop handlers
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#ec4899';
    uploadArea.style.background = 'rgba(236, 72, 153, 0.1)';
  });

  uploadArea.addEventListener('dragleave', function() {
    uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
    uploadArea.style.background = 'rgba(255,255,255,0.05)';
  });

  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgba(255,255,255,0.3)';
    uploadArea.style.background = 'rgba(255,255,255,0.05)';
    
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  console.log("File upload initialized successfully");
}

async function handleFileUpload(file) {
  console.log("Starting file upload:", file.name);
  
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const analysisResult = document.getElementById("analysisResult");
  const dashboardLink = document.getElementById("dashboardLink");
  
  // Reset state
  if (analysisResult) analysisResult.classList.add("hidden");
  if (dashboardLink) dashboardLink.classList.add("hidden");
  if (progressBar) {
    progressBar.classList.remove("hidden");
    progressFill.style.width = "0%";
  }

  // Validate file
  const allowedExtensions = ['.txt', '.zip'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    showError(`Unsupported file format: ${file.name}<br>Please upload .txt or .zip files only.`);
    return;
  }

  if (file.size === 0) {
    showError("The file is empty. Please export a valid WhatsApp chat.");
    return;
  }

  if (file.size > 100 * 1024 * 1024) {
    showError("File is too large. Please upload a file smaller than 100MB.");
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
    console.log("Sending to:", `${API_BASE}/analyze`);
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

    if (!result.participants || result.participants.length < 2) {
      throw new Error(
        "Could not find enough participants in the chat. Make sure it's a conversation between at least 2 people."
      );
    }

    // Save to history
    const chatName = `Chat with ${result.participants.join(" & ")}`;
    const analysisId = await saveAnalysisToHistory(result, chatName);

    if (analysisId) {
      console.log("Analysis saved to history:", analysisId);
    }

    // Store result for dashboard
    localStorage.setItem("lastAnalysisResult", JSON.stringify(result));

    // Show success
    showSuccess(result, file.name);

    // Show dashboard link
    if (dashboardLink) {
      dashboardLink.classList.remove("hidden");
    }

    // Auto-navigate to dashboard after 3 seconds
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

function showSuccess(result, fileName = '') {
  const analysisResult = document.getElementById("analysisResult");
  if (!analysisResult) return;

  const isZipFile = fileName.toLowerCase().endsWith('.zip');
  
  analysisResult.classList.remove("hidden");
  analysisResult.innerHTML = `
    <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">🎉</div>
      <h3 class="text-2xl font-bold mb-2 text-green-300">Analysis Complete!</h3>
      ${isZipFile ? `<p class="text-sm mb-2">📦 ZIP file processed successfully</p>` : ''}
      <div class="score-display mb-4">${result.loveScore}%</div>
      <p class="text-sm opacity-80 mb-2">Participants: ${result.participants.join(" & ")}</p>
      <p class="text-sm opacity-80">Total Messages: ${result.counts.totalMessages}</p>
      <p class="text-xs opacity-60 mt-4">Redirecting to dashboard...</p>
    </div>
  `;
}

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

async function saveAnalysisToHistory(analysisData, chatName = null) {
  try {
    const response = await fetch(`${API_BASE}/analyses/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analysisData,
        chatName: chatName || `Chat with ${analysisData.participants.join(" & ")}`,
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

  loadAndDisplayHistory();
}

async function loadAndDisplayHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  const analyses = await loadAnalysisHistory();
  const analysisArray = Object.values(analyses).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
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
          <p class="text-xs opacity-50 mt-1">${new Date(analysis.timestamp).toLocaleString()}</p>
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
          <div class="font-bold">${analysis.data.insights?.chatDuration || "N/A"} days</div>
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
  `
    )
    .join("");
}

async function loadSavedAnalysis(analysisId) {
  const analysis = await loadAnalysisById(analysisId);
  if (analysis) {
    localStorage.setItem("lastAnalysisResult", JSON.stringify(analysis.data));
    navigateToPage("dashboard.html");
  } else {
    alert("Failed to load analysis. Please try again.");
  }
}

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
      loadAndDisplayHistory();
    } else {
      alert("Failed to delete analysis: " + result.error);
    }
  } catch (error) {
    console.error("Error deleting analysis:", error);
    alert("Failed to delete analysis. Please try again.");
  }
}

// ========== PAGE CONTENT FUNCTIONS ==========

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

// [Include all the other page functions: showDashboardPage, showAboutPage, showContactPage, etc.]
// [Include all the helper functions: getRandomMessageCount, renderReplyTimeGraph, generateAISuggestions, etc.]

function attachNavListeners() {
  document.addEventListener("click", function (e) {
    if (e.target.matches("[data-internal]") || e.target.closest("[data-internal]")) {
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
