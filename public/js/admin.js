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

// Search functionality is disabled
function searchDisabledNotice() {
  alert(
    "Search functionality is currently under maintenance. Please check back later."
  );
}

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
      // Reset edit mode when creating a new article
      isEditMode = false;
      editingNewsId = null;

      // Reset form
      if (createNewsForm) {
        createNewsForm.reset();
      }
      resetImagePreview();

      // Show modal
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

      // Reset edit mode when closing modal
      isEditMode = false;
      editingNewsId = null;
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

        // Reset edit mode when closing modal
        isEditMode = false;
        editingNewsId = null;
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
      .then((response) => {
        // Check if response is in the new format or old format
        const news = response.articles || response;

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

  //Fetch Blog
  function fetchPendingBlogs() {
    fetch("/api/blogs/pending", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((blogs) => renderPendingBlogs(blogs))
      .catch((err) => {
        console.error("Error fetching pending blogs:", err);
        const container = document.querySelector(".articles-grid");
        if (container) {
          container.innerHTML += `<p style="color:red;">Error loading approval blogs</p>`;
        }
      });
  }

  // Display news in the admin dashboard
  function displayNews(news, showAll = false) {
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

    // Take only the latest 5 articles if not showing all
    const articlesToShow = showAll ? news : news.slice(0, 5);

    articlesGrid.innerHTML = articlesToShow
      .map((article) => {
        // Handle both database news and API news formats
        const title = article.title || "";
        const subtitle = article.subtitle || article.description || "";
        const category = article.category || "";
        const date = article.created_at
          ? new Date(article.created_at).toLocaleDateString()
          : "";
        const tags = article.tags || "";

        // For image, check all possible image field names and validate
        let imageUrl = "";
        let hasValidImage = false;

        if (article.featured_image && article.featured_image.trim() !== "") {
          imageUrl = article.featured_image;
          hasValidImage = true;
        } else if (article.imageUrl && article.imageUrl.trim() !== "") {
          imageUrl = article.imageUrl;
          hasValidImage = true;
        } else if (article.urlToImage && article.urlToImage.trim() !== "") {
          imageUrl = article.urlToImage;
          hasValidImage = true;
        }

        // Use placeholder if no valid image
        if (!hasValidImage) {
          imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
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
                <button onclick="editNews(${article.id})" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="confirmDeleteNews(${article.id})" class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
              </div>`
                  : ""
              }
            </div>
            <div class="article-image">
              <img src="${imageUrl}" alt="${title || "News article"}" />
            </div>
          </div>
        `;
      })
      .join("");
  }

  //Fetching renderpending blog
  function renderPendingBlogs(blogs) {
    const container = document.querySelector(".articles-grid");
    if (!container) return;

    if (!blogs || blogs.length === 0) {
      container.innerHTML += `<div class="no-articles-message"><p>No pending blogs to approve.</p></div>`;
      return;
    }

    const html = blogs
      .map((blog) => {
        const image =
          blog.featured_image ||
          "https://via.placeholder.com/300x200?text=No+Image";
        const subtitle = blog.subtitle || blog.content?.slice(0, 100) || "";

        return `
        <div class="article-card">
          <div class="article-content">
            <h3>${blog.title}</h3>
            <p>${subtitle}</p>
            <div class="article-meta">
              <span>Pending Approval</span> • 
              <span>${new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
            <div class="article-actions">
              <button class="approve-btn" data-id="${
                blog.id
              }"><i class="fas fa-check-circle"></i> Approve</button>
            </div>
          </div>
          <div class="article-image">
            <img src="${image}" alt="${blog.title}" />
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML += html;

    // Attach approve handlers
    document.querySelectorAll(".approve-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        approveBlog(id);
      });
    });
  }

  //Approve Blogs
  function approveBlog(id) {
    if (!confirm("Approve this blog?")) return;

    fetch(`/api/blogs/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          alert("Blog approved successfully.");
          fetchNews(); // reload approved articles
          fetchPendingBlogs(); // reload pending section
        } else {
          alert("Failed to approve blog.");
        }
      })
      .catch((err) => {
        console.error("Approval error:", err);
        alert("Error approving blog.");
      });
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

  // Track if we're in edit mode
  let isEditMode = false;
  let editingNewsId = null;

  // Setup form submission for creating news
  function setupNewsForm() {
    const createNewsForm = document.getElementById("createNewsForm");
    const createNewsModal = document.getElementById("createNewsModal");

    if (!createNewsForm) return;

    // Define the submit handler function
    const handleFormSubmit = async (e) => {
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
        let url = "/api/news";
        let method = "POST";
        let successMessage = "News article created successfully!";

        // If in edit mode, use PUT method and include the ID in the URL
        if (isEditMode && editingNewsId) {
          url = `/api/news/${editingNewsId}`;
          method = "PUT";
          successMessage = "News article updated successfully!";
        }

        const response = await fetch(url, {
          method: method,
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
          alert(successMessage);

          // Reset edit mode
          isEditMode = false;
          editingNewsId = null;
        } else {
          alert(
            isEditMode
              ? "Error updating news article"
              : "Error creating news article"
          );
        }
      } catch (error) {
        console.error(
          isEditMode ? "Error updating news:" : "Error creating news:",
          error
        );
        alert(
          isEditMode
            ? "Error updating news article"
            : "Error creating news article"
        );
      } finally {
        hideGlobalLoading();
      }
    };

    // Attach the submit handler
    createNewsForm.addEventListener("submit", handleFormSubmit);
  }

  // Delete news article with enhanced animation
  window.confirmDeleteNews = function (id) {
    if (
      !confirm(
        "Are you sure you want to delete this article? This action cannot be undone."
      )
    ) {
      return;
    }

    // Find the delete button
    const deleteBtn = document.querySelector(
      `.delete-btn[onclick="confirmDeleteNews(${id})"]`
    );
    if (!deleteBtn) return;

    // Show loading indicator
    showGlobalLoading();

    // Add a deleting class for animation
    deleteBtn.classList.add("deleting");
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

    // Make the API call
    fetch(`/api/news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Add success class briefly before refreshing
          deleteBtn.classList.remove("deleting");
          deleteBtn.classList.add("success");
          deleteBtn.innerHTML = '<i class="fas fa-check"></i> Deleted!';

          // Refresh after a short delay to show the success state
          setTimeout(() => {
            fetchNews();
          }, 800);
        } else {
          throw new Error("Failed to delete article");
        }
      })
      .catch((error) => {
        console.error("Error deleting news:", error);
        deleteBtn.classList.remove("deleting");
        deleteBtn.classList.add("error");
        deleteBtn.innerHTML = '<i class="fas fa-times"></i> Error';
        setTimeout(() => {
          deleteBtn.classList.remove("error");
          deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
          alert("Error deleting news article. Please try again.");
        }, 1500);
      })
      .finally(() => {
        hideGlobalLoading();
      });
  };

  // Edit news article with enhanced animation
  window.editNews = function (id) {
    // Find the edit button that was clicked
    const editBtn = event.currentTarget;

    // Add a loading class for animation
    editBtn.classList.add("loading");
    editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Store original content
    const originalContent = '<i class="fas fa-edit"></i> Edit';

    // Show loading indicator
    showGlobalLoading();

    const createNewsForm = document.getElementById("createNewsForm");
    const createNewsModal = document.getElementById("createNewsModal");

    // Set edit mode
    isEditMode = true;
    editingNewsId = id;

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
      .then((response) => {
        // Check if response is in the new format or old format
        const article = response.article || response;

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

        // Show success animation briefly
        editBtn.classList.remove("loading");
        editBtn.classList.add("success");
        editBtn.innerHTML = '<i class="fas fa-check"></i> Loaded';

        // Reset button after a short delay
        setTimeout(() => {
          editBtn.classList.remove("success");
          editBtn.innerHTML = originalContent;
        }, 1000);

        // Show modal
        if (createNewsModal) {
          createNewsModal.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error fetching news article:", error);

        // Show error animation
        editBtn.classList.remove("loading");
        editBtn.classList.add("error");
        editBtn.innerHTML = '<i class="fas fa-times"></i> Error';

        // Reset button after a short delay
        setTimeout(() => {
          editBtn.classList.remove("error");
          editBtn.innerHTML = originalContent;
          alert("Error fetching news article");
        }, 1500);

        // Reset edit mode on error
        isEditMode = false;
        editingNewsId = null;
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

        const category = link.getAttribute("data-category");

        const articlesGrid = document.querySelector(".articles-grid");
        const sectionHeader = document.querySelector(".section-header h2");
        const viewAllBtn = document.querySelector(".view-all-btn");
        if (!articlesGrid) return;

        // Clear grid before loading new content
        articlesGrid.innerHTML = "";

        // Load section content based on category
        if (category === "all") {
          if (sectionHeader) {
            sectionHeader.textContent = "Latest 5 Articles";
          }
          if (viewAllBtn) {
            viewAllBtn.style.display = "block";
          }
          fetchNews(); // Show latest 5 articles
        } else if (category === "approve") {
          if (sectionHeader) {
            sectionHeader.textContent = "Blogs Approval";
          }
          if (viewAllBtn) {
            viewAllBtn.style.display = "none";
          }
          fetchPendingBlogs(); // Show unapproved blogs
        } else {
          articlesGrid.innerHTML = `<div class="no-articles-message"><p>Feature under development for "${category}"</p></div>`;
        }
      });
    });
  }

  // Setup search bar functionality
  function setupSearchBar() {
    // Get search container
    const searchContainer = document.querySelector(".search-container");

    if (searchContainer) {
      // Remove disabled class if it exists
      searchContainer.classList.remove("search-disabled");
      searchContainer.title = "Search for news and articles";

      // Get and enable the search input and button
      const searchInput = searchContainer.querySelector("input");
      const searchButton = searchContainer.querySelector("button");

      if (searchInput) {
        searchInput.disabled = false;
        searchInput.placeholder = "Search...";

        // Add event listener for search input
        searchInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && searchInput.value.trim() !== "") {
            e.preventDefault();
            const searchQuery = searchInput.value.trim();
            searchAdminNews(searchQuery);
          }
        });

        // Add event listener for search button
        if (searchButton) {
          searchButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (searchInput.value.trim() !== "") {
              const searchQuery = searchInput.value.trim();
              searchAdminNews(searchQuery);
            }
          });
        }
      }
    }
  }

  // Function to search news in admin dashboard
  async function searchAdminNews(query) {
    if (!query || query.trim() === "") {
      return;
    }

    // Show loading state
    showGlobalLoading();

    // Clear any existing search results
    const currentResults = document.querySelector(".admin-search-results");
    if (currentResults) {
      currentResults.remove();
    }

    // Get the articles container
    const articlesGrid = document.querySelector(".articles-grid");
    if (articlesGrid) {
      articlesGrid.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Searching for "${query}"...</p>
        </div>
      `;
    }

    try {
      // Create URL with query parameter
      const cacheBuster = `cacheBust=${Date.now()}`;
      const url = `/api/news/search?query=${encodeURIComponent(
        query
      )}&${cacheBuster}`;

      // Fetch search results
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const searchResults = await response.json();

      // Display search results
      displayAdminSearchResults(searchResults, query);
    } catch (error) {
      console.error("Error searching news:", error);

      // Show error message
      if (articlesGrid) {
        articlesGrid.innerHTML = `
          <div class="search-error">
            <h3>Error searching for "${query}"</h3>
            <p>There was a problem with your search. Please try again later.</p>
            <button class="back-to-admin-btn" onclick="fetchNews()">Back to News</button>
          </div>
        `;
      }
    } finally {
      hideGlobalLoading();
    }
  }

  // Display search results in admin dashboard
  function displayAdminSearchResults(articles, query) {
    const articlesGrid = document.querySelector(".articles-grid");

    if (!articlesGrid) return;

    // Check if we have results
    if (!articles || articles.length === 0) {
      articlesGrid.innerHTML = `
        <div class="search-results-section">
          <div class="search-results-header">
            <h2>Search Results for "${query}"</h2>
            <button class="back-to-admin-btn" onclick="fetchNews()">Back to News</button>
          </div>
          <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No results found</h3>
            <p>We couldn't find any articles matching your search. Try different keywords.</p>
          </div>
        </div>
      `;
      return;
    }

    // Build search results HTML
    articlesGrid.innerHTML = `
      <div class="search-results-section">
        <div class="search-results-header">
          <h2>Search Results for "${query}"</h2>
          <p>${articles.length} articles found</p>
          <button class="back-to-admin-btn" onclick="fetchNews()">Back to News</button>
        </div>
        <div class="search-results-grid">
          ${articles
            .map((article) => {
              // Check for valid image URL
              let imageUrl =
                "https://via.placeholder.com/300x200?text=No+Image";

              // Check all possible image sources
              if (
                article.featured_image &&
                article.featured_image.trim() !== ""
              ) {
                imageUrl = article.featured_image;
              } else if (
                article.urlToImage &&
                article.urlToImage.trim() !== ""
              ) {
                imageUrl = article.urlToImage;
              } else if (article.imageUrl && article.imageUrl.trim() !== "") {
                imageUrl = article.imageUrl;
              }

              return `
              <div class="article-card search-result-card">
                <div class="news-image">
                  <img src="${imageUrl}" alt="${
                article.title || "News article"
              }">
                </div>
                <div class="news-content">
                  <h3>${article.title}</h3>
                  <p>${article.description || article.subtitle || ""}</p>
                  <div class="news-meta">
                    <span class="category">${
                      article.category || "General"
                    }</span>
                    <span class="date">${new Date(
                      article.publishedAt || article.created_at || new Date()
                    ).toLocaleDateString()}</span>
                  </div>
                  <div class="article-actions">
                    <a href="${
                      article.url || `/article/${article.id}` || "#"
                    }" class="view-btn" target="_blank">View</a>
                    ${
                      article.id
                        ? `<button class="edit-btn" data-id="${article.id}">Edit</button>
                       <button class="delete-btn" data-id="${article.id}">Delete</button>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;

    // Add event listeners for edit and delete buttons
    const editButtons = articlesGrid.querySelectorAll(".edit-btn");
    const deleteButtons = articlesGrid.querySelectorAll(".delete-btn");

    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const articleId = button.getAttribute("data-id");
        editNews(articleId);
      });
    });

    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const articleId = button.getAttribute("data-id");
        confirmDeleteNews(articleId);
      });
    });
  }

  // Function to toggle between all articles and latest 5 articles
  window.showAllArticles = function () {
    // Show loading state
    showGlobalLoading();

    // Get the button and current state
    const button = document.querySelector(".view-all-btn");
    const isShowingAll = button.getAttribute("data-showing-all") === "true";

    // Fetch articles from the database
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
      .then((response) => {
        // Check if response is in the new format or old format
        const news = response.articles || response;

        // Display articles based on current state
        displayNews(news, !isShowingAll);

        // Update section header and button text
        const sectionHeader = document.querySelector(".section-header h2");
        if (sectionHeader) {
          sectionHeader.textContent = !isShowingAll
            ? "All Articles"
            : "Latest 5 Articles";
        }

        // Update button text and state
        button.textContent = !isShowingAll
          ? "Show Latest 5"
          : "View All Articles";
        button.setAttribute("data-showing-all", !isShowingAll);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        alert("Error loading articles. Please try again later.");
      })
      .finally(() => {
        hideGlobalLoading();
      });
  };

  // Initialize all components
  fetchNews();
  fetchPendingBlogs();
  setupSidebar();
  setupLogout();
  setupImageUpload();
  setupNewsForm();
  setupNavigation();
  setupSearchBar();

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
