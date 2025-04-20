// DOM Elements - safely get elements that might not exist on all pages
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const closeButtons = document.querySelectorAll(".close");
const navLinks = document.querySelectorAll(".nav-links a");
const authButtons = document.querySelector(".auth-buttons");
const userProfile = document.querySelector(".user-profile");
const profileDropdown = document.querySelector(".profile-dropdown");

// Sidebar functionality
const hamburgerMenu = document.querySelector(".hamburger-menu");
const sidebar = document.querySelector(".sidebar");
const closeSidebar = document.querySelector(".close-sidebar");
const overlay = document.querySelector(".overlay");

// Search bar functionality
const searchContainer = document.querySelector(".search-container");
let searchTimeout;

// Only set up sidebar functionality if all required elements exist
if (hamburgerMenu && sidebar && closeSidebar && overlay) {
  function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling when sidebar is open
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  hamburgerMenu.addEventListener("click", openSidebar);
  closeSidebar.addEventListener("click", closeSidebarMenu);
  overlay.addEventListener("click", closeSidebarMenu);

  // Close sidebar with escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeSidebarMenu();
    }
  });
}

// This event listener has been moved inside the sidebar functionality check

// Check authentication status
function checkAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    authButtons.innerHTML = `
            <span>Welcome, ${decodedToken.email}</span>
            <button id="logoutBtn">Logout</button>
            ${
              decodedToken.role === "admin"
                ? '<a href="/admin" class="admin-link">Admin Panel</a>'
                : ""
            }
        `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  }
}

// Modal functionality - only set up if elements exist
if (loginBtn && loginModal) {
  loginBtn.addEventListener("click", () => {
    loginModal.style.display = "block";
  });
}

if (signupBtn && signupModal) {
  signupBtn.addEventListener("click", () => {
    signupModal.style.display = "block";
  });
}

if (closeButtons.length > 0) {
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (loginModal) loginModal.style.display = "none";
      if (signupModal) signupModal.style.display = "none";
    });
  });
}

window.addEventListener("click", (e) => {
  if (loginModal && e.target === loginModal) {
    loginModal.style.display = "none";
  }
  if (signupModal && e.target === signupModal) {
    signupModal.style.display = "none";
  }
});

// Toggle password visibility for login
const togglePassword = document.querySelector(".toggle-password");
if (togglePassword) {
  togglePassword.addEventListener("click", function () {
    const passwordInput = document.getElementById("loginPassword");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// Toggle password visibility for signup
const togglePasswordSignup = document.querySelector(".toggle-password-signup");
if (togglePasswordSignup) {
  togglePasswordSignup.addEventListener("click", function () {
    const passwordInput = document.getElementById("signupPassword");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// Toggle password visibility for confirm password
const togglePasswordConfirm = document.querySelector(
  ".toggle-password-confirm"
);
if (togglePasswordConfirm) {
  togglePasswordConfirm.addEventListener("click", function () {
    const passwordInput = document.getElementById("signupConfirmPassword");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// Register Now link functionality
const registerNowLink = document.getElementById("registerNowLink");
if (registerNowLink) {
  registerNowLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    signupModal.style.display = "block";
  });
}

// Login Now link functionality
const loginNowLink = document.getElementById("loginNowLink");
if (loginNowLink) {
  loginNowLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupModal.style.display = "none";
    loginModal.style.display = "block";
  });
}

// Forgot Password link functionality
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Password reset functionality will be implemented soon!");
  });
}

// Form submissions - only set up if forms exist
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
        if (decodedToken.role === "admin") {
          window.location.href = "/admin.html";
        } else {
          window.location.href = "/dashboard.html";
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please login.");
        if (signupModal) signupModal.style.display = "none";
        if (loginModal) loginModal.style.display = "block";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup");
    }
  });
}

// Fetch and display news
function fetchNews(category = null) {
  // Handle special categories
  let url;
  if (!category || category === "all" || category === "home") {
    url = "/api/news";
  } else {
    url = `/api/news/category/${category}`;
  }

  // Add a cache-busting parameter to avoid browser caching
  const cacheBuster = `cacheBust=${Date.now()}`;
  const finalUrl = `${url}?${cacheBuster}`;

  // Show loading state
  showLoadingState();

  // Set a timeout for the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn("Fetch request timed out");
    displayFallbackNews();
    hideLoadingState();
  }, 10000); // 10 second timeout

  fetch(finalUrl, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    signal: controller.signal,
  })
    .then((response) => {
      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((news) => {
      // Check if we got valid news data
      if (!news || news.length === 0) {
        console.warn("No news articles returned from API");
        displayFallbackNews();
      } else {
        // Display news in BBC style layout
        displayBreakingNews(news[0]);
        displayTopStories(news.slice(0, 3));
        displayCategoryNews(news);
        displayMostRead(news.slice(0, 5));
        displayNews(news); // Keep original display for compatibility
        console.log("Successfully loaded news from API");
      }
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      // Use fallback news when there's an error
      displayFallbackNews();
    })
    .finally(() => {
      // Always hide loading state
      hideLoadingState();
    });
}

// Show loading state
function showLoadingState() {
  const sections = [
    document.getElementById("breakingNewsContent"),
    document.getElementById("topStoriesGrid"),
    document.getElementById("categoryContent"),
    document.getElementById("mostReadList"),
    document.querySelector(".featured-news"),
  ];

  sections.forEach((section) => {
    if (section) {
      section.innerHTML =
        '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
    }
  });
}

// Hide loading state
function hideLoadingState() {
  const loadingSpinners = document.querySelectorAll(".loading-spinner");
  loadingSpinners.forEach((spinner) => {
    if (spinner) {
      spinner.remove();
    }
  });
}

// Display fallback news when API fails
function displayFallbackNews() {
  const featuredNews = document.querySelector(".featured-news");
  if (!featuredNews) return;

  featuredNews.innerHTML = `
    <div class="news-error">
      <h3>Unable to load news at this time</h3>
      <p>We're experiencing some technical difficulties with our news service. Please try again later.</p>
    </div>
    ${getFallbackNewsHTML()}
  `;

  // Also display fallback content in BBC-style sections
  const breakingNewsContent = document.getElementById("breakingNewsContent");
  if (breakingNewsContent) {
    breakingNewsContent.innerHTML = `<a href="#">Breaking: Technical difficulties with our news service</a>`;
  }

  const topStoriesGrid = document.getElementById("topStoriesGrid");
  if (topStoriesGrid) {
    topStoriesGrid.innerHTML = getFallbackTopStoriesHTML();
  }

  const categoryContent = document.getElementById("categoryContent");
  if (categoryContent) {
    categoryContent.innerHTML = getFallbackNewsHTML();
  }

  const mostReadList = document.getElementById("mostReadList");
  if (mostReadList) {
    mostReadList.innerHTML = getFallbackMostReadHTML();
  }
}

// Generate fallback news items
function getFallbackNewsHTML() {
  const fallbackNews = [
    {
      title: "Technology Trends for 2024",
      description:
        "Discover the latest technology trends that are shaping our future.",
      category: "Technology",
      date: new Date().toLocaleDateString(),
    },
    {
      title: "Global Economic Outlook",
      description:
        "Experts analyze the current state of the global economy and future projections.",
      category: "Business",
      date: new Date().toLocaleDateString(),
    },
    {
      title: "Health and Wellness Tips",
      description:
        "Simple lifestyle changes that can significantly improve your overall health and wellbeing.",
      category: "Health",
      date: new Date().toLocaleDateString(),
    },
  ];

  return fallbackNews
    .map(
      (article) => `
    <div class="news-card">
      <img src="https://via.placeholder.com/300x200" alt="${article.title}">
      <div class="news-content">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <div class="news-meta">
          <span class="category">${article.category}</span>
          <span class="date">${article.date}</span>
        </div>
        <a href="#" class="read-more">Read More</a>
      </div>
    </div>
  `
    )
    .join("");
}

// Generate fallback top stories HTML
function getFallbackTopStoriesHTML() {
  return `
    <div class="story-card main-story">
      <img src="https://via.placeholder.com/800x500?text=Breaking+News" alt="Breaking News">
      <div class="story-content">
        <h3>Major Technology Breakthrough Announced</h3>
        <p>Scientists have made a significant breakthrough in quantum computing that could revolutionize the tech industry.</p>
        <div class="story-meta">
          <span class="category">Technology</span>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <a href="#" class="story-link"></a>
    </div>
    <div class="story-card secondary-story">
      <img src="https://via.placeholder.com/400x250?text=Business+News" alt="Business News">
      <div class="story-content">
        <h3>Global Markets Respond to Economic Data</h3>
        <div class="story-meta">
          <span class="category">Business</span>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <a href="#" class="story-link"></a>
    </div>
    <div class="story-card secondary-story">
      <img src="https://via.placeholder.com/400x250?text=Sports+News" alt="Sports News">
      <div class="story-content">
        <h3>Championship Finals Set for Weekend Showdown</h3>
        <div class="story-meta">
          <span class="category">Sports</span>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <a href="#" class="story-link"></a>
    </div>
  `;
}

// Generate fallback most read HTML
function getFallbackMostReadHTML() {
  const mostReadItems = [
    "Global Economic Summit Concludes with New Agreements",
    "Health Experts Release New Guidelines for Balanced Lifestyle",
    "Technology Giants Announce Collaboration on AI Standards",
    "Sports Championship Results Surprise Fans Worldwide",
    "Entertainment Industry Adapts to Changing Consumer Habits",
  ];

  return mostReadItems
    .map(
      (title) => `
      <div class="most-read-item">
        <h3><a href="#">${title}</a></h3>
      </div>
    `
    )
    .join("");
}

// Display news in the original layout (kept for compatibility)
function displayNews(news) {
  const featuredNews = document.querySelector(".featured-news");
  if (!featuredNews) return;

  featuredNews.innerHTML = news
    .map(
      (article) => `
    <div class="news-card">
      <img src="${
        article.urlToImage ||
        article.imageUrl ||
        "https://via.placeholder.com/300x200"
      }" alt="${article.title}">
      <div class="news-content">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <div class="news-meta">
          <span class="category">${article.category || "General"}</span>
          <span class="date">${new Date(
            article.publishedAt || article.created_at
          ).toLocaleDateString()}</span>
        </div>
        <a href="${
          article.url || `/article/${article.id}`
        }" class="read-more">Read More</a>
      </div>
    </div>
  `
    )
    .join("");
}

// Display breaking news in the banner
function displayBreakingNews(article) {
  if (!article) return;

  const breakingNewsContent = document.getElementById("breakingNewsContent");
  if (!breakingNewsContent) return;

  breakingNewsContent.innerHTML = `
    <a href="${article.url || `/article/${article.id}`}">
      ${article.title}
    </a>
  `;
}

// Display top stories in the grid layout
function displayTopStories(articles) {
  if (!articles || articles.length === 0) return;

  const topStoriesGrid = document.getElementById("topStoriesGrid");
  if (!topStoriesGrid) return;

  // Get the main story and secondary stories
  const mainStory = articles[0];
  const secondaryStories = articles.slice(1, 3);

  // Create HTML for the main story
  let html = `
    <div class="story-card main-story">
      <img src="${
        mainStory.urlToImage ||
        mainStory.imageUrl ||
        "https://via.placeholder.com/800x500"
      }" alt="${mainStory.title}">
      <div class="story-content">
        <h3>${mainStory.title}</h3>
        <p>${mainStory.description}</p>
        <div class="story-meta">
          <span class="category">${mainStory.category || "General"}</span>
          <span class="date">${new Date(
            mainStory.publishedAt || mainStory.created_at
          ).toLocaleDateString()}</span>
        </div>
      </div>
      <a href="${
        mainStory.url || `/article/${mainStory.id}`
      }" class="story-link"></a>
    </div>
  `;

  // Add secondary stories
  secondaryStories.forEach((story) => {
    html += `
      <div class="story-card secondary-story">
        <img src="${
          story.urlToImage ||
          story.imageUrl ||
          "https://via.placeholder.com/400x250"
        }" alt="${story.title}">
        <div class="story-content">
          <h3>${story.title}</h3>
          <div class="story-meta">
            <span class="category">${story.category || "General"}</span>
            <span class="date">${new Date(
              story.publishedAt || story.created_at
            ).toLocaleDateString()}</span>
          </div>
        </div>
        <a href="${story.url || `/article/${story.id}`}" class="story-link"></a>
      </div>
    `;
  });

  topStoriesGrid.innerHTML = html;
}

// Display news by category
function displayCategoryNews(articles) {
  if (!articles || articles.length === 0) return;

  const categoryContent = document.getElementById("categoryContent");
  if (!categoryContent) return;

  // Default to showing all articles
  let filteredArticles = articles;

  // Set up category tabs - using event delegation for better performance
  const categoryTabsContainer = document.querySelector(".category-tabs");
  const categoryTabs = document.querySelectorAll(".category-tab");

  if (categoryTabsContainer) {
    // Remove any existing event listeners to prevent duplicates
    const newCategoryTabsContainer = categoryTabsContainer.cloneNode(true);
    categoryTabsContainer.parentNode.replaceChild(
      newCategoryTabsContainer,
      categoryTabsContainer
    );

    newCategoryTabsContainer.addEventListener("click", (e) => {
      const tab = e.target.closest(".category-tab");
      if (!tab) return; // Click was not on a tab

      // Remove active class from all tabs
      categoryTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      const category = tab.dataset.category;

      // Filter articles by category
      if (category === "all") {
        filteredArticles = articles;
      } else {
        filteredArticles = articles.filter(
          (article) =>
            (article.category || "").toLowerCase() === category.toLowerCase()
        );

        // If no articles in this category, show all
        if (filteredArticles.length === 0) {
          filteredArticles = articles;
        }
      }

      // Update the display
      renderCategoryNews(filteredArticles);
    });
  }

  // Initial render
  renderCategoryNews(filteredArticles);

  function renderCategoryNews(articles) {
    categoryContent.innerHTML = articles
      .slice(0, 6) // Limit to 6 articles
      .map(
        (article) => `
        <div class="news-card">
          <img src="${
            article.urlToImage ||
            article.imageUrl ||
            "https://via.placeholder.com/300x200"
          }" alt="${article.title}">
          <div class="news-content">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <div class="news-meta">
              <span class="category">${article.category || "General"}</span>
              <span class="date">${new Date(
                article.publishedAt || article.created_at
              ).toLocaleDateString()}</span>
            </div>
            <a href="${
              article.url || `/article/${article.id}`
            }" class="read-more">Read More</a>
          </div>
        </div>
      `
      )
      .join("");
  }
}

// Display most read articles
function displayMostRead(articles) {
  if (!articles || articles.length === 0) return;

  const mostReadList = document.getElementById("mostReadList");
  if (!mostReadList) return;

  mostReadList.innerHTML = articles
    .map(
      (article) => `
      <div class="most-read-item">
        <h3>
          <a href="${article.url || `/article/${article.id}`}">
            ${article.title}
          </a>
        </h3>
      </div>
    `
    )
    .join("");
}

// Category navigation - using event delegation for better performance
const navContainer = document.querySelector(".nav-links");
if (navContainer) {
  // Remove any existing event listeners to prevent duplicates
  const newNavContainer = navContainer.cloneNode(true);
  navContainer.parentNode.replaceChild(newNavContainer, navContainer);

  newNavContainer.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return; // Click was not on a link

    e.preventDefault();

    // Get category from data attribute, defaulting to "all" for Home
    const category = link.getAttribute("data-category") || "all";

    // Update active class
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Fetch news with the category
    fetchNews(category);
  });
}

// Profile Dropdown functionality - only add listeners if elements exist
if (userProfile && profileDropdown) {
  userProfile.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("active");
  });

  // Prevent dropdown from closing when clicking inside it
  profileDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (userProfile && !userProfile.contains(e.target)) {
      profileDropdown.classList.remove("active");
    }
  });
}

// Navigation dropdown functionality
const moreMenu = document.querySelector(".more-menu");
const moreDropdown = document.getElementById("moreDropdown");

if (moreMenu && moreDropdown) {
  moreMenu.addEventListener("click", (e) => {
    e.preventDefault();
    moreDropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!moreMenu.contains(e.target) && !moreDropdown.contains(e.target)) {
      moreDropdown.classList.remove("active");
    }
  });
}

// Initialize - using both DOMContentLoaded and window.onload for reliability
let initialized = false;

function initializePage() {
  if (!initialized) {
    checkAuth();
    fetchNews();
    initialized = true;
    console.log("Page initialized successfully");
  }
}

// Try to initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initializePage);

// Fallback to window.onload if DOMContentLoaded doesn't fire or completes too early
window.onload = function () {
  if (!initialized) {
    console.log("Using window.onload fallback for initialization");
    initializePage();
  }

  // Force a refresh of the news content after a short delay
  setTimeout(() => {
    if (
      document.querySelector(".loading-spinner") ||
      !document.querySelector(".news-card")
    ) {
      console.log("Forcing news refresh");
      fetchNews();
    }
  }, 1000);
};

// Add event listeners for search container if it exists
if (searchContainer) {
  searchContainer.addEventListener("click", (e) => {
    e.stopPropagation();
    searchContainer.classList.add("expanded");
    clearTimeout(searchTimeout);
  });

  // Prevent collapse when interacting with the search bar
  searchContainer.addEventListener("input", () => {
    clearTimeout(searchTimeout);
  });
}

// Collapse search bar after 5 seconds of inactivity
document.addEventListener("click", () => {
  if (searchContainer && searchContainer.classList.contains("expanded")) {
    searchTimeout = setTimeout(() => {
      searchContainer.classList.remove("expanded");
    }, 5000);
  }
});
