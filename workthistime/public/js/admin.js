// Check if user is admin
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/";
}

// Decode token to check role
const decodedToken = JSON.parse(atob(token.split(".")[1]));
if (decodedToken.role !== "admin") {
  window.location.href = "/";
}

// DOM Elements
const createNewsModal = document.getElementById("createNewsModal");
const createNewsForm = document.getElementById("createNewsForm");
const closeBtn = document.querySelector(".close");
const newArticleBtn = document.querySelector(".new-article-btn");

// Modal functionality
newArticleBtn.addEventListener("click", () => {
  createNewsModal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  createNewsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === createNewsModal) {
    createNewsModal.style.display = "none";
  }
});

// Fetch and display news
async function fetchNews() {
  try {
    // First try to get news from the database
    const dbResponse = await fetch("/api/news/db", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let news;

    if (dbResponse.ok) {
      news = await dbResponse.json();
    }

    // If no news in database or error, fall back to the API news
    if (!news || news.length === 0) {
      const apiResponse = await fetch("/api/news", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      news = await apiResponse.json();
    }

    displayNews(news);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

function displayNews(news) {
  const articlesGrid = document.querySelector(".articles-grid");
  if (!articlesGrid) return;

  // Take only the first 3 articles
  const recentArticles = news.slice(0, 3);

  articlesGrid.innerHTML = recentArticles
    .map((article) => {
      // Handle both database news and API news formats
      const title = article.title || "";
      const description = article.description || "";

      // For image, check both database format and API format
      let imageUrl = "";
      if (article.imageUrl) {
        imageUrl = article.imageUrl;
      } else if (article.urlToImage) {
        imageUrl = article.urlToImage;
      }

      return `
          <div class="article-card">
            <div class="article-content">
              <h3>${title}</h3>
              <p>${description}</p>
            </div>
            <div class="article-image">
              <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=News'" />
            </div>
          </div>
        `;
    })
    .join("");
}

// Create news
createNewsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = {
    title: e.target[0].value,
    description: e.target[1].value,
    content: e.target[2].value,
    imageUrl: e.target[3].value,
    category: e.target[4].value,
  };

  try {
    const response = await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      createNewsModal.style.display = "none";
      createNewsForm.reset();
      fetchNews();
    } else {
      alert("Error creating news article");
    }
  } catch (error) {
    console.error("Error creating news:", error);
    alert("Error creating news article");
  }
});

// Delete news
async function deleteNews(id) {
  if (!confirm("Are you sure you want to delete this news article?")) {
    return;
  }

  try {
    const response = await fetch(`/api/news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      fetchNews();
    } else {
      alert("Error deleting news article");
    }
  } catch (error) {
    console.error("Error deleting news:", error);
    alert("Error deleting news article");
  }
}

// Edit news
async function editNews(id) {
  try {
    const response = await fetch(`/api/news/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const article = await response.json();

    // Populate form with article data
    createNewsForm[0].value = article.title;
    createNewsForm[1].value = article.description;
    createNewsForm[2].value = article.content;
    createNewsForm[3].value = article.imageUrl;
    createNewsForm[4].value = article.category;

    createNewsModal.style.display = "block";

    // Update form submission to handle edit
    const originalSubmit = createNewsForm.onsubmit;
    createNewsForm.onsubmit = async (e) => {
      e.preventDefault();
      const formData = {
        title: e.target[0].value,
        description: e.target[1].value,
        content: e.target[2].value,
        imageUrl: e.target[3].value,
        category: e.target[4].value,
      };

      try {
        const response = await fetch(`/api/news/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          createNewsModal.style.display = "none";
          createNewsForm.reset();
          createNewsForm.onsubmit = originalSubmit;
          fetchNews();
        } else {
          alert("Error updating news article");
        }
      } catch (error) {
        console.error("Error updating news:", error);
        alert("Error updating news article");
      }
    };
  } catch (error) {
    console.error("Error fetching news article:", error);
    alert("Error fetching news article");
  }
}

// Sidebar functionality
function setupSidebar() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");
  const closeSidebar = document.querySelector(".close-sidebar");

  if (hamburgerMenu && sidebar && overlay && closeSidebar) {
    hamburgerMenu.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    function closeSidebarFunc() {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    closeSidebar.addEventListener("click", closeSidebarFunc);
    overlay.addEventListener("click", closeSidebarFunc);
  }
}

// Logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Show confirmation dialog
      const confirmLogout = confirm("Are you sure you want to logout?");

      if (confirmLogout) {
        // Clear the token from localStorage
        localStorage.removeItem("token");

        // Clear any other user-related data
        sessionStorage.clear();

        // Show logout message
        alert("You have been logged out successfully.");

        // Redirect to the home page
        window.location.href = "/";

        console.log("User logged out");
      }
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Fetch news articles for the Recent Articles section
  fetchNews();

  // Setup sidebar functionality
  setupSidebar();

  // Setup logout functionality
  setupLogout();

  // Add event listener for the New Article button
  const newArticleBtn = document.querySelector(".new-article-btn");
  if (newArticleBtn) {
    newArticleBtn.addEventListener("click", () => {
      const modal = document.getElementById("createNewsModal");
      if (modal) {
        modal.style.display = "block";
      }
    });
  }

  // Add event listeners for navigation links
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));

      // Add active class to clicked link
      link.classList.add("active");

      // Get category from data attribute
      const category = link.getAttribute("data-category");

      // You can add functionality here to load different content based on category
      console.log(`Selected category: ${category}`);
    });
  });
});
