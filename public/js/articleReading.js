async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    if (!articleId) {
        document.getElementById("articleTitle").textContent = "Article not found.";
        return;
    }

    try {
        const response = await fetch(`/api/article/${articleId}`);
        const article = await response.json();

        // Set image
        const imageDiv = document.getElementById("articleImage");
        const imageUrl = article.featured_image || "https://via.placeholder.com/1200x500?text=No+Image";
        imageDiv.innerHTML = `<img src="${imageUrl}" alt="${article.title}" />`;

        // Set title and meta
        document.getElementById("articleTitle").textContent = article.title || "Untitled";
        document.getElementById("articleAuthor").textContent = `Written by: Admin`;
        document.getElementById("articleDate").textContent = new Date(article.created_at).toLocaleDateString();

        // Set content
        const contentDiv = document.getElementById("articleContent");
        contentDiv.innerHTML = article.content
            .split("\n")
            .map(p => `<p>${p.trim()}</p>`)
            .join("");
    } catch (error) {
        document.getElementById("articleTitle").textContent = "Failed to load article.";
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", loadArticle);

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

// Search bar functionality with enhanced animations
const searchContainer = document.querySelector(".search-container");
const searchInput = searchContainer
  ? searchContainer.querySelector("input")
  : null;
const searchButton = searchContainer
  ? searchContainer.querySelector("button")
  : null;
let searchTimeout;
let searchInteractionTimeout;

// Add animation to search container
if (searchContainer && searchInput && searchButton) {
  // Hover event for search container
  searchContainer.addEventListener("mouseenter", () => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    // Expand the search container
    searchContainer.classList.add("expanded");

    // Set a timeout to collapse after 3 seconds if no interaction
    searchInteractionTimeout = setTimeout(() => {
      // Only collapse if not active and no text in input
      if (
        !searchContainer.classList.contains("active") &&
        searchInput.value.trim() === ""
      ) {
        searchContainer.classList.remove("expanded");
      }
    }, 3000);
  });

  // Focus event for search input
  searchInput.addEventListener("focus", () => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    // Add active class to keep it expanded
    searchContainer.classList.add("active");
    searchContainer.classList.add("expanded");
  });

  // Input event to maintain active state when typing
  searchInput.addEventListener("input", () => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    // Keep active while typing
    if (searchInput.value.trim() !== "") {
      searchContainer.classList.add("active");
    }
  });

  // Blur event for search input
  searchInput.addEventListener("blur", () => {
    // If input is empty, remove active class after a short delay
    if (searchInput.value.trim() === "") {
      // Set a timeout to allow for button clicks
      setTimeout(() => {
        searchContainer.classList.remove("active");

        // Start the collapse timeout
        searchInteractionTimeout = setTimeout(() => {
          searchContainer.classList.remove("expanded");
        }, 500);
      }, 200);
    }
  });

  // Click event for search button
  searchButton.addEventListener("click", (e) => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    if (!searchContainer.classList.contains("expanded")) {
      e.preventDefault();
      searchContainer.classList.add("expanded");
      searchContainer.classList.add("active");
      searchInput.focus();
    } else if (searchInput.value.trim() !== "") {
      // Perform search
      console.log("Searching for:", searchInput.value);
      // Add ripple effect to button
      const ripple = document.createElement("span");
      ripple.classList.add("ripple-effect");
      searchButton.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    } else {
      // If button is clicked but input is empty, focus on input
      searchInput.focus();
    }
  });

  // Click outside to collapse if empty
  document.addEventListener("click", (e) => {
    if (
      !searchContainer.contains(e.target) &&
      searchInput.value.trim() === ""
    ) {
      searchContainer.classList.remove("active");
      searchContainer.classList.remove("expanded");
    }
  });
}

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

// Add animation to navigation links
if (navLinks && navLinks.length > 0) {
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      // Add subtle animation on hover
      link.style.transition =
        "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      link.style.transform = "translateY(-2px)";
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = "translateY(0)";
    });

    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));

      // Add active class to clicked link with animation
      link.classList.add("active");

      // Get category from data attribute
      const category = link.getAttribute("data-category");

      // Fetch news for the selected category
      fetchNews(category);
    });
      // ✅ Logout button logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.href = "/";
      }
    });
  }

  // ✅ Back button logic
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "dashboard.html#article";
    });
}
});
}

//BookMark
document.addEventListener("DOMContentLoaded", () => {
  const bookmarkBtn = document.getElementById("bookmarkBtn");

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams(window.location.search);
      const articleId = params.get("id");

      if (!token || !articleId) {
        alert("Please log in to bookmark this article.");
        return;
      }

      try {
        const response = await fetch("/api/bookmark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Article bookmarked successfully!");
          bookmarkBtn.querySelector("i").classList.add("bookmarked"); // optional style
        } else {
          alert(data.message || "Failed to bookmark.");
        }
      } catch (error) {
        console.error("Bookmark error:", error);
        alert("Something went wrong. Try again later.");
      }
    });
  }
});
