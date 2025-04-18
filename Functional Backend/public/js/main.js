// DOM Elements
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

// Modal functionality
loginBtn.addEventListener("click", () => {
  loginModal.style.display = "block";
});

signupBtn.addEventListener("click", () => {
  signupModal.style.display = "block";
});

closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    loginModal.style.display = "none";
    signupModal.style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
  if (e.target === signupModal) {
    signupModal.style.display = "none";
  }
});

// Form submissions
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;

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
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login");
  }
});

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = e.target[0].value;
  const email = e.target[1].value;
  const password = e.target[2].value;
  const confirmPassword = e.target[3].value;

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
      signupModal.style.display = "none";
      loginModal.style.display = "block";
    } else {
      alert(data.message || "Signup failed");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("An error occurred during signup");
  }
});

// Fetch and display news
async function fetchNews(category = null) {
  try {
    const url = category ? `/api/news/category/${category}` : "/api/news";
    const response = await fetch(url);
    const news = await response.json();
    displayNews(news);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

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

// Category navigation
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const category = link.textContent.toLowerCase();
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    fetchNews(category);
  });
});

// Profile Dropdown functionality
userProfile.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle("active");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!userProfile.contains(e.target)) {
    profileDropdown.classList.remove("active");
  }
});

// Prevent dropdown from closing when clicking inside it
profileDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  fetchNews();
});

searchContainer.addEventListener("click", (e) => {
  e.stopPropagation();
  searchContainer.classList.add("expanded");
  clearTimeout(searchTimeout);
});

// Collapse search bar after 5 seconds of inactivity
document.addEventListener("click", () => {
  if (searchContainer.classList.contains("expanded")) {
    searchTimeout = setTimeout(() => {
      searchContainer.classList.remove("expanded");
    }, 5000);
  }
});

// Prevent collapse when interacting with the search bar
searchContainer.addEventListener("input", () => {
  clearTimeout(searchTimeout);
});
