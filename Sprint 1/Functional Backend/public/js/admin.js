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
const createNewsBtn = document.getElementById("createNewsBtn");
const createNewsModal = document.getElementById("createNewsModal");
const createNewsForm = document.getElementById("createNewsForm");
const closeBtn = document.querySelector(".close");
const logoutBtn = document.getElementById("logoutBtn");
const newsList = document.getElementById("newsList");

// Modal functionality
createNewsBtn.addEventListener("click", () => {
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

// Logout functionality
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

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
  newsList.innerHTML = news
    .map(
      (article) => `
        <div class="news-item">
            <div class="news-item-info">
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <small>Category: ${article.category}</small>
            </div>
            <div class="news-item-actions">
                <button class="edit-btn" onclick="editNews(${article.id})">Edit</button>
                <button class="delete-btn" onclick="deleteNews(${article.id})">Delete</button>
            </div>
        </div>
    `
    )
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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchNews();
});
