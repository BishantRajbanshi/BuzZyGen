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
  const topStoriesSection = document.querySelector(".top-stories");
  const mostReadSection = document.querySelector(".most-read");
  const newsFeedSection = document.querySelector(".news-feed");
  const categoryTabsSection = document.querySelector(".news-by-category");
  const userArticlesSection = document.querySelector(".user-articles-section");
  const breakingNewsBanner = document.querySelector(".breaking-news-banner");

  // Always show breaking news banner
  if (breakingNewsBanner) breakingNewsBanner.style.display = "block";

  if (category === "article") {
    // Show only admin-posted articles
    if (userArticlesSection) userArticlesSection.style.display = "block";
    if (topStoriesSection) topStoriesSection.style.display = "none";
    if (mostReadSection) mostReadSection.style.display = "none";
    if (newsFeedSection) newsFeedSection.style.display = "none";
    if (categoryTabsSection) categoryTabsSection.style.display = "none";

    // Clear all other sections (optional)
    if (document.getElementById("topStoriesGrid"))
      document.getElementById("topStoriesGrid").innerHTML = "";
    if (document.getElementById("categoryContent"))
      document.getElementById("categoryContent").innerHTML = "";
    if (document.getElementById("mostReadList"))
      document.getElementById("mostReadList").innerHTML = "";
    if (document.getElementById("newsGrid"))
      document.getElementById("newsGrid").innerHTML = "";

    if (userArticlesSection) {
      userArticlesSection.innerHTML = `
        <div class="container" id="userArticleContainer"></div>
      `;
      loadAdminArticlesForUser();
    }

    return;
  }

  // Reset: show all sections
  if (userArticlesSection) userArticlesSection.style.display = "none";
  if (topStoriesSection) topStoriesSection.style.display = "block";
  if (mostReadSection) mostReadSection.style.display = "block";
  if (newsFeedSection) newsFeedSection.style.display = "block";
  if (categoryTabsSection) categoryTabsSection.style.display = "block";

  try {
    let url =
      !category || category === "all" || category === "home"
        ? "/api/news"
        : `/api/news/category/${category}`;

    const finalUrl = `${url}?cacheBust=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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

    clearTimeout(timeoutId);
    const news = await response.json();

    if (!news || news.length === 0 || news.message) {
      displayFallbackNews();
    } else {
      displayBreakingNews(news[0]);
      displayTopStories(news.slice(0, 3));
      displayCategoryNews(news);
      displayMostRead(news.slice(0, 5));
      displayNews(news);
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    displayFallbackNews();
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

async function loadAdminArticlesForUser() {
  const container = document.getElementById("userArticleContainer");

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/news/db", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const articles = await response.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      container.innerHTML = `<p>No articles available at the moment.</p>`;
      return;
    }

    const html = articles
    .map((article) => {
      const title = article.title || "Untitled";
      const subtitle = article.subtitle || article.description || "";
      const contentSnippet = article.content
        ? article.content.slice(0, 100) + "..."
        : "";
      const category = article.category || "General";
      const date = article.created_at
        ? new Date(article.created_at).toLocaleDateString()
        : "Unknown";
      const image =
        article.featured_image ||
        article.urlToImage ||
        article.imageUrl ||
        "https://via.placeholder.com/300x200?text=No+Image";
  
      return `
        <a href="articleReading.html?id=${article.id}" class="news-block">
          <img src="${image}" alt="${title}" class="news-img" />
          <div class="news-content">
            ${subtitle ? `<span class="series-title">${subtitle}</span>` : ""}
            <h2 class="news-title">${title}</h2>
            <p class="description">${contentSnippet}</p>
            <p class="meta">${date} | ${category}</p>
          </div>
        </a>
      `;
    })
    .join("");
  

    container.innerHTML = `
      ${html}
    `;
  } catch (error) {
    console.error("Failed to load admin articles:", error);
    container.innerHTML = `<p>Error loading articles. Please try again later.</p>`;
  }
}



// Initialize - using a single DOMContentLoaded listener for better performance
let initialized = false;
document.addEventListener("DOMContentLoaded", () => {
  if (!initialized) {
    fetchNews();
    loadAdminArticlesForUser();
    initialized = true;
  }
});
