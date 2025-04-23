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
const profileModal = document.getElementById("profileModal");
const closeBtn = document.querySelector(".close");
const newsGrid = document.getElementById("newsGrid");
const breakingNewsContent = document.getElementById("breakingNewsContent");
const topStoriesGrid = document.getElementById("topStoriesGrid");
const categoryContent = document.getElementById("categoryContent");
const mostReadList = document.getElementById("mostReadList");
const navLinks = document.querySelectorAll(".nav-links a");
const categoryTabs = document.querySelectorAll(".category-tab");

// Modal functionality
const userProfile = document.querySelector(".user-profile");
userProfile.addEventListener("click", () => {
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
async function fetchNews(category = null) {
  try {
    // Add a cache-busting parameter to avoid browser caching
    const cacheBuster = `cacheBust=${Date.now()}`;
    const url =
      category && category !== "all"
        ? `/api/news/category/${category}?${cacheBuster}`
        : `/api/news?${cacheBuster}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });
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
      <a href="${article.url || `/article/${article.id}`}">
        ${article.title}
      </a>
    `;
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

  // Set up category tabs
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
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
  });

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

// Category navigation
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const category =
      link.getAttribute("data-category") || link.textContent.toLowerCase();
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    fetchNews(category);
  });
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchNews();
});
