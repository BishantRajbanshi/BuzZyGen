// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Mark the body as loaded to stop browser spinner
  document.body.classList.add("loaded");

  // Get token from localStorage
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    // Decode token to check role
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    if (decodedToken.role !== "admin") {
      window.location.href = "/";
      return;
    }

    // Initialize the admin dashboard
    initAdminDashboard(token);
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    window.location.href = "/";
  }
});

// Initialize admin dashboard
function initAdminDashboard(token) {
  // DOM Elements
  const createNewsModal = document.getElementById("createNewsModal");
  const createNewsForm = document.getElementById("createNewsForm");
  const closeBtn = document.querySelector(".close");
  const newArticleBtn = document.querySelector(".new-article-btn");

  // Modal functionality
  if (newArticleBtn) {
    newArticleBtn.addEventListener("click", () => {
      if (createNewsModal) {
        createNewsModal.style.display = "block";
      }
    });
  }

  if (closeBtn && createNewsModal) {
    closeBtn.addEventListener("click", () => {
      createNewsModal.style.display = "none";
      if (createNewsForm) {
        createNewsForm.reset();
      }
      resetImagePreview();
    });
  }

  if (createNewsModal) {
    window.addEventListener("click", (e) => {
      if (e.target === createNewsModal) {
        createNewsModal.style.display = "none";
        if (createNewsForm) {
          createNewsForm.reset();
        }
        resetImagePreview();
      }
    });
  }

  // Show loading state
  function showLoadingState() {
    const articlesGrid = document.querySelector(".articles-grid");
    if (articlesGrid) {
      articlesGrid.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i> Loading news...
        </div>
      `;
    }
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

  // Show global loading indicator
  function showGlobalLoading() {
    const loadingBar = document.getElementById("global-loading");
    if (loadingBar) {
      loadingBar.style.display = "block";
    }
  }

  // Hide global loading indicator
  function hideGlobalLoading() {
    const loadingBar = document.getElementById("global-loading");
    if (loadingBar) {
      loadingBar.style.display = "none";
    }
  }

  // Reset image preview
  function resetImagePreview() {
    const imagePreview = document.getElementById("image-preview");
    const imageDropArea = document.getElementById("image-drop-area");
    const previewImage = document.getElementById("preview-image");
    const featuredImageInput = document.getElementById("featured-image");

    if (imagePreview && imageDropArea) {
      imagePreview.style.display = "none";
      imageDropArea.style.display = "block";

      if (previewImage) {
        previewImage.src = "";
      }

      if (featuredImageInput) {
        featuredImageInput.value = "";
      }
    }
  }

  // Fetch and display news
  function fetchNews() {
    // Show loading state
    showLoadingState();
    showGlobalLoading();

    // Get news only from the database for admin dashboard
    fetch("/api/news/db", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        return response.json();
      })
      .then((news) => {
        // Display news from database (even if empty)
        displayNews(news);

        // Mark the body as fully loaded
        document.body.classList.add("fully-loaded");
      })
      .catch((error) => {
        console.error("Error fetching news:", error);

        // Show error message
        const articlesGrid = document.querySelector(".articles-grid");
        if (articlesGrid) {
          articlesGrid.innerHTML = `
            <div class="no-articles-message">
              <h3>Error loading news</h3>
              <p>There was a problem loading the news articles. Please try again later.</p>
            </div>
          `;
        }
      })
      .finally(() => {
        // Hide loading states
        hideLoadingState();
        hideGlobalLoading();

        // Force browser to complete loading
        setTimeout(() => {
          document.body.classList.add("fully-loaded");
        }, 0);
      });
  }

  // Display news in the admin dashboard
  function displayNews(news) {
    const articlesGrid = document.querySelector(".articles-grid");
    if (!articlesGrid) return;

    // If no news or empty array, show message
    if (!news || news.length === 0) {
      articlesGrid.innerHTML = `
        <div class="no-articles-message">
          <h3>No news articles found</h3>
          <p>Create your first article by clicking the "New Article" button above.</p>
        </div>
      `;
      return;
    }

    // Take only the first 3 articles
    const recentArticles = news.slice(0, 3);

    articlesGrid.innerHTML = recentArticles
      .map((article) => {
        // Handle both database news and API news formats
        const title = article.title || "";
        const subtitle = article.subtitle || article.description || "";
        const category = article.category || "";
        const date = article.created_at
          ? new Date(article.created_at).toLocaleDateString()
          : "";
        const tags = article.tags || "";

        // For image, check all possible image field names
        let imageUrl = "";
        if (article.featured_image) {
          imageUrl = article.featured_image;
        } else if (article.imageUrl) {
          imageUrl = article.imageUrl;
        } else if (article.urlToImage) {
          imageUrl = article.urlToImage;
        }

        return `
          <div class="article-card">
            <div class="article-content">
              <h3>${title}</h3>
              <p>${subtitle}</p>
              <div class="article-meta">
                ${category ? `<span>Category: ${category}</span>` : ""}
                ${date ? `<span>Published: ${date}</span>` : ""}
                ${tags ? `<span>Tags: ${tags}</span>` : ""}
              </div>
              ${
                article.id
                  ? `
              <div class="article-actions">
                <button onclick="editNews(${article.id})">Edit</button>
                <button onclick="deleteNews(${article.id})">Delete</button>
              </div>`
                  : ""
              }
            </div>
            <div class="article-image">
              <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=News'" />
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Setup image upload functionality
  function setupImageUpload() {
    const imageDropArea = document.getElementById("image-drop-area");
    const imageUpload = document.getElementById("image-upload");
    const imagePreview = document.getElementById("image-preview");
    const previewImage = document.getElementById("preview-image");
    const removeImageBtn = document.getElementById("remove-image");
    const featuredImageInput = document.getElementById("featured-image");

    if (!imageDropArea || !imageUpload) return;

    // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      imageDropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Highlight drop area when item is dragged over it
    ["dragenter", "dragover"].forEach((eventName) => {
      imageDropArea.addEventListener(eventName, () => {
        imageDropArea.classList.add("highlight");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      imageDropArea.addEventListener(eventName, () => {
        imageDropArea.classList.remove("highlight");
      });
    });

    // Handle dropped files
    imageDropArea.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });

    // Handle click to browse
    imageDropArea.addEventListener("click", () => {
      imageUpload.click();
    });

    // Handle file selection via input
    imageUpload.addEventListener("change", (e) => {
      handleFiles(e.target.files);
    });

    // Handle remove image button
    if (removeImageBtn) {
      removeImageBtn.addEventListener("click", () => {
        if (previewImage) previewImage.src = "";
        if (featuredImageInput) featuredImageInput.value = "";
        if (imagePreview) imagePreview.style.display = "none";
        if (imageDropArea) imageDropArea.style.display = "block";
      });
    }

    function handleFiles(files) {
      if (files && files.length) {
        const file = files[0];

        // Convert file to data URL
        const reader = new FileReader();

        reader.onload = function (e) {
          // Set the preview image
          if (previewImage) {
            previewImage.src = e.target.result;
          }

          // Store the data URL in the hidden input
          if (featuredImageInput) {
            featuredImageInput.value = e.target.result;
          }

          // Show the preview and hide the drop area
          if (imageDropArea && imagePreview) {
            imageDropArea.style.display = "none";
            imagePreview.style.display = "block";
          }
        };

        reader.readAsDataURL(file);
      }
    }
  }

  // Setup form submission for creating news
  function setupNewsForm() {
    const createNewsForm = document.getElementById("createNewsForm");
    const createNewsModal = document.getElementById("createNewsModal");

    if (!createNewsForm) return;

    createNewsForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Show loading indicator
      showGlobalLoading();

      const formData = {
        title: document.getElementById("title").value,
        subtitle: document.getElementById("subtitle").value,
        content: document.getElementById("content").value,
        featured_image: document.getElementById("featured-image").value,
        category: document.getElementById("category").value,
        tags: document.getElementById("tags").value,
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
          if (createNewsModal) {
            createNewsModal.style.display = "none";
          }
          createNewsForm.reset();
          resetImagePreview();
          fetchNews();
          alert("News article created successfully!");
        } else {
          alert("Error creating news article");
        }
      } catch (error) {
        console.error("Error creating news:", error);
        alert("Error creating news article");
      } finally {
        hideGlobalLoading();
      }
    });
  }

  // Delete news article
  window.deleteNews = function (id) {
    if (!confirm("Are you sure you want to delete this news article?")) {
      return;
    }

    // Show loading indicator
    showGlobalLoading();

    fetch(`/api/news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          fetchNews();
        } else {
          alert("Error deleting news article");
        }
      })
      .catch((error) => {
        console.error("Error deleting news:", error);
        alert("Error deleting news article");
      })
      .finally(() => {
        hideGlobalLoading();
      });
  };

  // Edit news article
  window.editNews = function (id) {
    // Show loading indicator
    showGlobalLoading();

    const createNewsForm = document.getElementById("createNewsForm");
    const createNewsModal = document.getElementById("createNewsModal");

    fetch(`/api/news/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        return response.json();
      })
      .then((article) => {
        // Populate form with article data
        const titleInput = document.getElementById("title");
        const subtitleInput = document.getElementById("subtitle");
        const contentInput = document.getElementById("content");
        const categoryInput = document.getElementById("category");
        const tagsInput = document.getElementById("tags");
        const featuredImageInput = document.getElementById("featured-image");
        const previewImage = document.getElementById("preview-image");
        const imageDropArea = document.getElementById("image-drop-area");
        const imagePreview = document.getElementById("image-preview");

        if (titleInput) titleInput.value = article.title || "";
        if (subtitleInput) subtitleInput.value = article.subtitle || "";
        if (contentInput) contentInput.value = article.content || "";
        if (categoryInput) categoryInput.value = article.category || "";
        if (tagsInput) tagsInput.value = article.tags || "";

        // Handle image
        if (
          article.featured_image &&
          featuredImageInput &&
          previewImage &&
          imageDropArea &&
          imagePreview
        ) {
          featuredImageInput.value = article.featured_image;
          previewImage.src = article.featured_image;
          imageDropArea.style.display = "none";
          imagePreview.style.display = "block";
        } else {
          resetImagePreview();
        }

        // Show modal
        if (createNewsModal) {
          createNewsModal.style.display = "block";
        }

        // Update form submission to handle edit
        if (createNewsForm) {
          const originalSubmit = createNewsForm.onsubmit;
          createNewsForm.onsubmit = async (e) => {
            e.preventDefault();

            // Show loading indicator
            showGlobalLoading();

            const formData = {
              title: document.getElementById("title").value,
              subtitle: document.getElementById("subtitle").value,
              content: document.getElementById("content").value,
              featured_image: document.getElementById("featured-image").value,
              category: document.getElementById("category").value,
              tags: document.getElementById("tags").value,
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
                if (createNewsModal) {
                  createNewsModal.style.display = "none";
                }
                createNewsForm.reset();
                resetImagePreview();
                createNewsForm.onsubmit = originalSubmit;
                fetchNews();
                alert("News article updated successfully!");
              } else {
                alert("Error updating news article");
              }
            } catch (error) {
              console.error("Error updating news:", error);
              alert("Error updating news article");
            } finally {
              hideGlobalLoading();
            }
          };
        }
      })
      .catch((error) => {
        console.error("Error fetching news article:", error);
        alert("Error fetching news article");
      })
      .finally(() => {
        hideGlobalLoading();
      });
  };

  // Setup sidebar functionality
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

  // Setup logout functionality
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
        }
      });
    }
  }

  // Setup navigation links
  function setupNavigation() {
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
  }

  // Initialize all components
  fetchNews();
  setupSidebar();
  setupLogout();
  setupImageUpload();
  setupNewsForm();
  setupNavigation();

  // Force browser to complete loading
  setTimeout(() => {
    document.body.classList.add("fully-loaded");
  }, 100);
}

// Force browser to stop loading indicator when page is fully loaded
window.addEventListener("load", function () {
  document.body.classList.add("loaded");

  // Create and remove a dummy image to force the browser to complete loading
  const img = document.createElement("img");
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  img.onload = function () {
    document.body.appendChild(img);
    document.body.removeChild(img);
  };
});
