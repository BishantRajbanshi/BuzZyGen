// Check authentication
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/";
}

// Decode token to get user info
const decodedToken = JSON.parse(atob(token.split(".")[1]));

// Get user's name from token or use a default
let userName = "Valued User";

// If token has a name property, use it
if (decodedToken.name) {
  userName = decodedToken.name;
}
// Otherwise, if we have an email, use the part before the @ symbol
else if (decodedToken.email) {
  userName = decodedToken.email.split("@")[0];
}

// Set user name in welcome message
document.getElementById("userName").textContent = userName;

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const profileModal = document.getElementById("profileModal");
const closeBtn = document.querySelector(".close");
const newsGrid = document.getElementById("newsGrid");
const breakingNewsContent = document.getElementById("breakingNewsContent");
const topStoriesGrid = document.getElementById("topStoriesGrid");
const categoryContent = document.getElementById("categoryContent");
const mostReadList = document.getElementById("mostReadList");
const navLinks = document.querySelectorAll(".nav-links a");
const categoryTabs = document.querySelectorAll(".category-tab");

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
let searchInteractionTimeout;

//Kebab Menu funcationality 
// Logout & Profile from kebab menu
const kebabLogout = document.getElementById("logoutBtn");
const profileBtn = document.getElementById("profileBtn");

if (kebabLogout) {
  kebabLogout.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "userprofile.html";
  });
}

// Kebab menu toggle logic

// Toggle dropdown on icon click
const kebabToggle = document.getElementById("kebabToggle");
const kebabDropdown = document.getElementById("kebabDropdown");

kebabToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  kebabDropdown.style.display =
    kebabDropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown if clicked outside
document.addEventListener("click", (e) => {
  if (!kebabToggle.contains(e.target) && !kebabDropdown.contains(e.target)) {
    kebabDropdown.style.display = "none";
  }
});


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
      e.preventDefault();
      const searchQuery = searchInput.value.trim();
      console.log("Searching for:", searchQuery);

      // Perform the search
      searchDashboardNews(searchQuery);

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

// Add search functionality when user presses Enter in the search input
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchInput.value.trim() !== "") {
      e.preventDefault();
      const searchQuery = searchInput.value.trim();
      console.log("Searching for:", searchQuery);

      // Perform the search
      searchDashboardNews(searchQuery);
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

  // Add click event listeners to sidebar menu items
  const sidebarMenuItems = document.querySelectorAll(".sidebar-menu li a");
  sidebarMenuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // ✅ Allow natural navigation for blog.html and userBlogPost.html
      if (
        href &&
        (href.includes("blog.html") || href.includes("userBlogPost.html"))
      ) {
        return; // don't preventDefault, allow redirect
      }

      e.preventDefault(); // block only category links

      const menuText = this.textContent.trim();

      // Handle different menu items
      if (menuText === "Home") {
        filterNewsByCategory("all");
      } else if (
        [
          "Business",
          "Sports",
          "Technology",
          "Entertainment",
          "Science",
          "Articles",
          "Blog",
        ].includes(menuText)
      ) {
        // Convert "Articles" to "article" for consistency with data-category
        const category =
          menuText === "Articles"
            ? "article"
            : menuText === "Blog"
            ? "blog"
            : menuText.toLowerCase();
        filterNewsByCategory(category);
      } else if (menuText === "Saved Articles") {
        // Show saved articles (to be implemented)
        alert("Saved Articles feature coming soon!");
      } else if (menuText === "Settings") {
        // Show settings (to be implemented)
        alert("Settings feature coming soon!");
      }

      // Close sidebar after selection on mobile
      closeSidebarMenu();
    });
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
  });
}

// Add animation to category tabs
if (categoryTabs && categoryTabs.length > 0) {
  categoryTabs.forEach((tab) => {
    tab.addEventListener("mouseenter", () => {
      // Add subtle animation on hover
      tab.style.transition =
        "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      tab.style.transform = "translateY(-2px)";
    });

    tab.addEventListener("mouseleave", () => {
      tab.style.transform = "translateY(0)";
    });
  });
}

// Modal functionality with enhanced animations
const userProfile = document.querySelector(".user-profile");
userProfile.addEventListener("click", () => {
  // Add animation to modal opening
  profileModal.style.display = "block";
  profileModal.style.opacity = "0";
  setTimeout(() => {
    profileModal.style.opacity = "1";
    profileModal.querySelector(".modal-content").style.transform =
      "translateY(0)";
  }, 10);

  // Load user profile data
  loadUserProfile();
});

closeBtn.addEventListener("click", () => {
  // Add animation to modal closing
  profileModal.style.opacity = "0";
  profileModal.querySelector(".modal-content").style.transform =
    "translateY(-20px)";
  setTimeout(() => {
    profileModal.style.display = "none";
  }, 300);
});

window.addEventListener("click", (e) => {
  if (e.target === profileModal) {
    // Add animation to modal closing
    profileModal.style.opacity = "0";
    profileModal.querySelector(".modal-content").style.transform =
      "translateY(-20px)";
    setTimeout(() => {
      profileModal.style.display = "none";
    }, 300);
  }
});

// Logout functionality
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

// Load user profile
function loadUserProfile() {
  // Use the same userName variable we defined earlier
  document.getElementById("profileName").textContent = userName;
  document.getElementById("profileEmail").textContent = decodedToken.email;

  // Since we don't have created_at in the token, we'll use the token's issued at time
  const tokenIssuedAt = new Date(decodedToken.iat * 1000);
  document.getElementById("memberSince").textContent =
    tokenIssuedAt.toLocaleDateString();
}

// Fetch and display news
async function fetchNews(category = null) {
  try {
    // Handle special categories
    let url;

    // Special handling for "article" category to fetch admin-created articles
    if (category === "article") {
      await fetchAdminArticles();
      return; // Exit early as we've handled this special case
    } else if (!category || category === "all" || category === "home") {
      url = "/api/news";
    } else {
      url = `/api/news/category/${category}`;
    }

    // Add a cache-busting parameter to avoid browser caching
    const cacheBuster = `cacheBust=${Date.now()}`;
    const finalUrl = `${url}?${cacheBuster}`;

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);
    const news = await response.json();

    if (!news || news.length === 0 || news.message) {
      displayFallbackNews();
    } else {
      // Display news in BBC style layout
      displayBreakingNews(news[0]);
      displayTopStories(news.slice(0, 3));
      displayCategoryNews(news);
      displayMostRead(news.slice(0, 5));
      displayNews(news); // Keep original display for compatibility
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    displayFallbackNews();
  }
}

// Fetch and display admin-created articles
async function fetchAdminArticles() {
  try {
    // Show loading state in the main content area
    const mainContent = document.querySelector(".dashboard-main");
    if (mainContent) {
      // Create a temporary loading section
      const loadingSection = document.createElement("div");
      loadingSection.className = "articles-section";
      loadingSection.innerHTML = `
        <h2>Articles</h2>
        <div class="articles-grid">
          <div class="no-articles-message">
            <h3>Loading articles...</h3>
            <p>Please wait while we fetch the latest articles.</p>
          </div>
        </div>
      `;

      // Replace existing articles section if it exists, or append to main content
      const existingSection = document.querySelector(".articles-section");
      if (existingSection) {
        mainContent.replaceChild(loadingSection, existingSection);
      } else {
        // Insert after welcome section
        const welcomeSection = document.querySelector(".welcome-section");
        if (welcomeSection) {
          welcomeSection.insertAdjacentElement("afterend", loadingSection);
        } else {
          mainContent.prepend(loadingSection);
        }
      }
    }

    // Fetch admin articles from the database
    const response = await fetch("/api/news/db", {
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
      throw new Error("Failed to fetch admin articles");
    }

    const data = await response.json();

    // Check if response is in the new format or old format
    const articles = data.articles || data;

    // Display admin articles in admin-style layout
    displayAdminArticles(articles);

    // Hide other content sections when in Articles view
    const sectionsToHide = [
      ".breaking-news-banner",
      ".top-stories",
      ".news-by-category",
      ".most-read",
      ".news-feed",
    ];

    sectionsToHide.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section) {
        section.style.display = "none";
      }
    });
  } catch (error) {
    console.error("Error fetching admin articles:", error);

    // Display error message in admin-style layout
    const mainContent = document.querySelector(".dashboard-main");
    if (mainContent) {
      const articlesSection = document.createElement("div");
      articlesSection.className = "articles-section";
      articlesSection.innerHTML = `
        <h2>Articles</h2>
        <div class="articles-grid">
          <div class="no-articles-message">
            <h3>Error loading articles</h3>
            <p>There was a problem loading the articles. Please try again later.</p>
          </div>
        </div>
      `;

      // Replace existing articles section if it exists, or append to main content
      const existingSection = document.querySelector(".articles-section");
      if (existingSection) {
        mainContent.replaceChild(articlesSection, existingSection);
      } else {
        // Insert after welcome section
        const welcomeSection = document.querySelector(".welcome-section");
        if (welcomeSection) {
          welcomeSection.insertAdjacentElement("afterend", articlesSection);
        } else {
          mainContent.prepend(articlesSection);
        }
      }
    }
  }
}

// Display fallback news when API fails
function displayFallbackNews() {
  newsGrid.innerHTML = `
    <div class="news-error">
      <h3>Unable to load news at this time</h3>
      <p>We're experiencing some technical difficulties with our news service. Please try again later.</p>
    </div>
    ${getFallbackNewsHTML()}
  `;

  // Also display fallback content in BBC-style sections
  if (breakingNewsContent) {
    breakingNewsContent.innerHTML = `<a href="#">Breaking: Technical difficulties with our news service</a>`;
  }

  if (topStoriesGrid) {
    topStoriesGrid.innerHTML = getFallbackTopStoriesHTML();
  }

  if (categoryContent) {
    categoryContent.innerHTML = getFallbackNewsHTML();
  }

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
    {
      title: "Latest Articles from Our Contributors",
      description:
        "Explore in-depth articles from our expert contributors on various topics.",
      category: "Article",
      date: new Date().toLocaleDateString(),
    },
    {
      title: "Blog: Behind the Headlines",
      description:
        "Our editors share insights and perspectives on current events and trending topics.",
      category: "Blog",
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
    "Personalized: Global Economic Summit Concludes with New Agreements",
    "Personalized: Health Experts Release New Guidelines for Balanced Lifestyle",
    "Personalized: Technology Giants Announce Collaboration on AI Standards",
    "Personalized: Sports Championship Results Surprise Fans Worldwide",
    "Personalized: Entertainment Industry Adapts to Changing Consumer Habits",
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

// Display breaking news in the banner
function displayBreakingNews(article) {
  if (!article) return;

  if (breakingNewsContent) {
    breakingNewsContent.innerHTML = `
      <a href="${article.url || `/article/${article.id}` || "#"}">
        ${article.title}
      </a>
    `;

    // Reset the animation when content changes to ensure it starts from the right position
    breakingNewsContent.style.animation = "none";
    setTimeout(() => {
      breakingNewsContent.style.animation = "scrollText 20s linear infinite";
    }, 10);
  }
}

// Display top stories in the grid layout
function displayTopStories(articles) {
  if (!articles || articles.length === 0 || !topStoriesGrid) return;

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
  if (!articles || articles.length === 0 || !categoryContent) return;

  // Default to showing all articles
  let filteredArticles = articles;

  // Set up category tabs - using event delegation for better performance
  const categoryTabsContainer = document.querySelector(".category-tabs");
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

// Display most read articles (personalized)
function displayMostRead(articles) {
  if (!articles || articles.length === 0 || !mostReadList) return;

  // Add "Personalized: " prefix to titles to simulate personalization
  const personalizedArticles = articles.map((article) => {
    return {
      ...article,
      title: `Personalized: ${article.title}`,
    };
  });

  mostReadList.innerHTML = personalizedArticles
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

// Display news in the original layout (kept for compatibility)
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

//Article Display
function displayAdminArticles(articles) {
  // Create or get the articles section
  let articlesSection = document.querySelector(".articles-section");
  const mainContent = document.querySelector(".dashboard-main");

  if (!articlesSection && mainContent) {
    articlesSection = document.createElement("div");
    articlesSection.className = "articles-section";

    // Insert after welcome section
    const welcomeSection = document.querySelector(".welcome-section");
    if (welcomeSection) {
      welcomeSection.insertAdjacentElement("afterend", articlesSection);
    } else {
      mainContent.prepend(articlesSection);
    }
  }

  if (!articlesSection) return;

  // If no articles or empty array, show message
  if (!articles || articles.length === 0) {
    articlesSection.innerHTML = `
      <h2>Articles</h2>
      <div class="articles-grid">
        <div class="no-articles-message">
          <h3>No articles found</h3>
          <p>There are currently no articles available. Please check back later.</p>
        </div>
      </div>
    `;
    return;
  }

  // Create HTML for articles section
  let html = `<h2>Articles</h2>
    <div class="articles-grid">`;

  // Add each article
  articles.forEach((article) => {
    const title = article.title || "";
    const subtitle = article.subtitle || article.description || "";
    const category = article.category || "";
    const date = article.created_at
      ? new Date(article.created_at).toLocaleDateString()
      : "";
    const tags = article.tags || "";

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

    if (!hasValidImage) {
      imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
    }

    html += `
      <div class="article-card" onclick="window.location.href='articleReading.html?id=${
        article.id
      }'">
        <div class="article-image">
          <img src="${imageUrl}" alt="${title || "News article"}" />
        </div>
        <div class="article-content">
          <h3>${title}</h3>
          <p>${subtitle}</p>
          <div class="article-meta">
            ${category ? `<span>Category: ${category}</span>` : ""}
            ${date ? `<span>Published: ${date}</span>` : ""}
            ${tags ? `<span>Tags: ${tags}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  articlesSection.innerHTML = html;
  articlesSection.style.display = "block";
}

// Function to filter news by category
function filterNewsByCategory(category) {
  // Update active state in main navigation
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    if (link.getAttribute("data-category") === category) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Update active state in category tabs
  const categoryTabs = document.querySelectorAll(".category-tab");
  categoryTabs.forEach((tab) => {
    if (tab.getAttribute("data-category") === category) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // If switching to a category other than "article", show all sections again
  if (category !== "article") {
    const sectionsToShow = [
      ".breaking-news-banner",
      ".top-stories",
      ".news-by-category",
      ".most-read",
      ".news-feed",
    ];

    sectionsToShow.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section) {
        section.style.display = "";
      }
    });

    // Hide articles section if it exists
    const articlesSection = document.querySelector(".articles-section");
    if (articlesSection) {
      articlesSection.style.display = "none";
    }
  }

  // Fetch news for the selected category
  fetchNews(category);
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

    // Filter news by category
    filterNewsByCategory(category);
  });
}

// Initialize News + Date Setup After DOM Loads
document.addEventListener("DOMContentLoaded", () => {
  fetchNews(); // This will fetch and render news when page loads

  const navDateEl = document.getElementById("navDate");
  if (navDateEl) {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("default", { month: "long" });
    const year = today.getFullYear();
    const weekday = today.toLocaleString("default", { weekday: "long" });

    navDateEl.textContent = `${day} ${month} ${year}, ${weekday}`;
  }
});

const bell = document.getElementById("notif-bell");
const dropdown = document.getElementById("notif-dropdown");
const notifCount = document.getElementById("notif-count");

bell.addEventListener("click", async (e) => {
  e.stopPropagation();
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
  dropdown.innerHTML = "<div style='padding: 10px;'>Loading...</div>";

  try {
    const response = await fetch("/api/news/db", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    const articles = data.articles || data;

    if (!Array.isArray(articles) || articles.length === 0) {
      notifCount.textContent = "0";
      dropdown.innerHTML =
        "<div style='padding: 10px;'>No articles found.</div>";
      return;
    }

    const validArticles = articles.filter((a) => a.title);
    validArticles.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const recent = validArticles.slice(0, 5);
    notifCount.textContent = recent.length.toString();

    dropdown.innerHTML = recent
      .map(
        (item) => `
      <div>
        <a href="articleReading.html?id=${item.id}">
        <strong>${item.title}</strong>
        <small>${new Date(item.created_at).toLocaleDateString()}</small>
        </a>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Failed to load articles for notification:", error);
    notifCount.textContent = "0";
    dropdown.innerHTML =
      "<div style='padding: 10px;'>Error loading notifications.</div>";
  }
});

document.addEventListener("click", (e) => {
  if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});

// Search news function - for dashboard
async function searchDashboardNews(query) {
  if (!query || query.trim() === "") {
    return;
  }

  // Show loading state
  showGlobalLoading();

  // Hide existing content sections
  const sectionsToHide = [
    ".welcome-section",
    ".articles-section",
    ".breaking-news-banner",
    ".top-stories",
    ".news-by-category",
    ".most-read",
    ".news-feed",
  ];

  sectionsToHide.forEach((selector) => {
    const section = document.querySelector(selector);
    if (section) {
      section.style.display = "none";
    }
  });

  // Get or create search results section
  let searchResultsSection = document.querySelector(".search-results-section");
  const dashboardMain = document.querySelector(".dashboard-main");

  if (!searchResultsSection && dashboardMain) {
    searchResultsSection = document.createElement("div");
    searchResultsSection.className = "search-results-section";
    dashboardMain.prepend(searchResultsSection);
  }

  // Show loading indicator in search results section
  if (searchResultsSection) {
    searchResultsSection.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Searching for "${query}"...</p>
      </div>
    `;
  }

  // Fetch search results
  try {
    const cacheBuster = `cacheBust=${Date.now()}`;
    const url = `/api/news/search?query=${encodeURIComponent(
      query
    )}&${cacheBuster}`;

    console.log("Sending search request to:", url);

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

    console.log("Search response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Search failed with status ${response.status}: ${errorText}`
      );
    }

    const searchResults = await response.json();
    console.log("Search results:", searchResults);

    // Display search results
    displayDashboardSearchResults(searchResults, query);
  } catch (error) {
    console.error("Error searching news:", error);

    if (searchResultsSection) {
      searchResultsSection.innerHTML = `
        <div class="search-error">
          <h3>Error searching for "${query}"</h3>
          <p>There was a problem with your search: ${error.message}. Please try again later.</p>
          <button class="back-to-dashboard-btn" onclick="window.location.reload()">Back to Dashboard</button>
        </div>
      `;
    }
  } finally {
    hideGlobalLoading();
  }
}

// Display search results in dashboard
function displayDashboardSearchResults(articles, query) {
  const searchResultsSection = document.querySelector(
    ".search-results-section"
  );

  if (!searchResultsSection) return;

  // Check if we have results
  if (!articles || articles.length === 0) {
    searchResultsSection.innerHTML = `
      <div class="search-results-header">
        <h2>Search Results for "${query}"</h2>
        <button class="back-to-dashboard-btn" onclick="window.location.reload()">Back to Dashboard</button>
      </div>
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No results found</h3>
        <p>We couldn't find any articles matching your search. Try different keywords or check back later.</p>
      </div>
    `;
    return;
  }

  // Display search results
  searchResultsSection.innerHTML = `
    <div class="search-results-header">
      <h2>Search Results for "${query}"</h2>
      <p>${articles.length} articles found</p>
      <button class="back-to-dashboard-btn" onclick="window.location.reload()">Back to Dashboard</button>
    </div>
    <div class="search-results-grid">
      ${articles
        .map((article) => {
          // Check for valid image URL
          let imageUrl = "https://via.placeholder.com/300x200?text=No+Image";

          // Check all possible image sources
          if (article.featured_image && article.featured_image.trim() !== "") {
            imageUrl = article.featured_image;
          } else if (article.urlToImage && article.urlToImage.trim() !== "") {
            imageUrl = article.urlToImage;
          } else if (article.imageUrl && article.imageUrl.trim() !== "") {
            imageUrl = article.imageUrl;
          }

          return `
          <div class="news-card search-result-card">
            <div class="news-image">
              <img src="${imageUrl}" alt="${article.title || "News article"}">
            </div>
            <div class="news-content">
              <h3>${article.title}</h3>
              <p>${article.description || article.subtitle || ""}</p>
              <div class="news-meta">
                <span class="category">${article.category || "General"}</span>
                <span class="date">${new Date(
                  article.publishedAt || article.created_at || new Date()
                ).toLocaleDateString()}</span>
              </div>
              <a href="${
                article.url || `/article/${article.id}` || "#"
              }" class="read-more">Read More</a>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;

  // Make sure the search results section is visible
  searchResultsSection.style.display = "block";
}

// Show global loading indicator
function showGlobalLoading() {
  // Check if loading indicator already exists
  if (document.querySelector(".global-loading-overlay")) {
    return;
  }

  // Create loading overlay
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "global-loading-overlay";
  loadingOverlay.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading...</p>
    </div>
  `;

  // Add to body
  document.body.appendChild(loadingOverlay);

  // Prevent scrolling
  document.body.style.overflow = "hidden";
}

// Hide global loading indicator
function hideGlobalLoading() {
  const loadingOverlay = document.querySelector(".global-loading-overlay");
  if (loadingOverlay) {
    // Add fade-out animation
    loadingOverlay.classList.add("fade-out");

    // Remove after animation completes
    setTimeout(() => {
      loadingOverlay.remove();
      document.body.style.overflow = "";
    }, 300);
  }
}

// Show global error message
function showGlobalError(title, message) {
  // Check if error message already exists
  if (document.querySelector(".global-error-overlay")) {
    return;
  }

  // Create error overlay
  const errorOverlay = document.createElement("div");
  errorOverlay.className = "global-error-overlay";
  errorOverlay.innerHTML = `
    <div class="global-error-content">
      <i class="fas fa-exclamation-circle"></i>
      <h3>${title}</h3>
      <p>${message}</p>
      <button class="error-dismiss-btn">Dismiss</button>
    </div>
  `;

  // Add to body
  document.body.appendChild(errorOverlay);

  // Add event listener to dismiss button
  const dismissBtn = errorOverlay.querySelector(".error-dismiss-btn");
  dismissBtn.addEventListener("click", () => {
    errorOverlay.classList.add("fade-out");
    setTimeout(() => {
      errorOverlay.remove();
    }, 300);
  });

  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    if (errorOverlay.parentNode) {
      errorOverlay.classList.add("fade-out");
      setTimeout(() => {
        if (errorOverlay.parentNode) {
          errorOverlay.remove();
        }
      }, 300);
    }
  }, 8000);
}
