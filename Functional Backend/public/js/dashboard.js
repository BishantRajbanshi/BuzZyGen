// Check authentication
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/";
}

// Decode token to get user info
const decodedToken = JSON.parse(atob(token.split(".")[1]));
document.getElementById("userName").textContent = decodedToken.email;

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const myProfileBtn = document.getElementById("myProfileBtn");
const profileModal = document.getElementById("profileModal");
const closeBtn = document.querySelector(".close");
const newsGrid = document.getElementById("newsGrid");

// Modal functionality
myProfileBtn.addEventListener("click", () => {
  profileModal.style.display = "block";
  // Load user profile data
  loadUserProfile();
});

closeBtn.addEventListener("click", () => {
  profileModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === profileModal) {
    profileModal.style.display = "none";
  }
});

// Logout functionality
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

// Load user profile
async function loadUserProfile() {
  try {
    const response = await fetch("/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = await response.json();

    document.getElementById("profileName").textContent = userData.name;
    document.getElementById("profileEmail").textContent = userData.email;
    document.getElementById("memberSince").textContent = new Date(
      userData.created_at
    ).toLocaleDateString();
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

// Fetch and display news
async function fetchNews() {
  try {
    const response = await fetch("/api/news", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const news = await response.json();
    displayNews(news);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

function displayNews(news) {
  newsGrid.innerHTML = news
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
                    <span class="category">${
                      article.category || "General"
                    }</span>
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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchNews();
});
