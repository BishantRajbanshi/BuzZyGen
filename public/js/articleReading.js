// ---------------- Load Article ----------------
async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    document.getElementById("articleTitle").textContent = "Article not found.";
    return;
  }

  try {
    let response;
    let article;
    const token = localStorage.getItem("token");

    // 🔁 Detect if we're on the blog page
    if (window.location.pathname.includes("blogRed.html")) {
      response = await fetch(`/api/blogs/${articleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } else {
      response = await fetch(`/api/article/${articleId}`);
    }

    if (!response.ok) throw new Error("Failed to fetch content.");

    article = await response.json();

    const imageDiv = document.getElementById("articleImage");
    const imageUrl = article.featured_image || "https://via.placeholder.com/1200x500?text=No+Image";
    imageDiv.innerHTML = `<img src="${imageUrl}" alt="${article.title}" />`;

    document.getElementById("articleTitle").textContent = article.title || "Untitled";
    document.getElementById("articleAuthor").textContent = `Written by: ${article.author_name || "Unknown"}`;
    document.getElementById("articleDate").textContent = new Date(article.created_at).toLocaleDateString();

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

// ---------------- Check Auth ----------------
function checkAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    authButtons.innerHTML = `
      <span>Welcome, ${decodedToken.email}</span>
      <button id="logoutBtn">Logout</button>
      ${decodedToken.role === "admin" ? '<a href="/admin" class="admin-link">Admin Panel</a>' : ""}
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  }
}

// ---------------- Bookmark Functionality ----------------
async function setupBookmark() {
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  const icon = bookmarkBtn?.querySelector("i");
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!bookmarkBtn || !token || !articleId) return;

  try {
    const res = await fetch("/api/bookmark", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bookmarks = await res.json();

    const isBookmarked = bookmarks.some(article => article.id == articleId);
    if (isBookmarked) {
      icon.classList.add("bookmarked");
      bookmarkBtn.dataset.bookmarked = "true";
    }
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
  }

  bookmarkBtn.addEventListener("click", async () => {
    if (bookmarkBtn.dataset.bookmarked === "true") {
      alert("This article is already bookmarked.");
      return;
    }

    try {
      const response = await fetch("/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });

      const data = await response.json();

      if (response.ok) {
        icon.classList.add("bookmarked");
        bookmarkBtn.dataset.bookmarked = "true";
        alert("Article bookmarked!");
      } else {
        alert(data.message || "Failed to bookmark.");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      alert("An error occurred.");
    }
  });
}

// ---------------- Modal Functionality ----------------
function setupModals() {
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
    if (loginModal && e.target === loginModal) loginModal.style.display = "none";
    if (signupModal && e.target === signupModal) signupModal.style.display = "none";
  });
}

// ---------------- Password Toggle ----------------
function setupPasswordToggles() {
  const togglePassword = document.querySelector(".toggle-password");
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordInput = document.getElementById("loginPassword");
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  const togglePasswordSignup = document.querySelector(".toggle-password-signup");
  if (togglePasswordSignup) {
    togglePasswordSignup.addEventListener("click", function () {
      const passwordInput = document.getElementById("signupPassword");
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  const togglePasswordConfirm = document.querySelector(".toggle-password-confirm");
  if (togglePasswordConfirm) {
    togglePasswordConfirm.addEventListener("click", function () {
      const passwordInput = document.getElementById("signupConfirmPassword");
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }
}

// ---------------- Auth Forms ----------------
function setupForms() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          const decoded = JSON.parse(atob(data.token.split(".")[1]));
          window.location.href = decoded.role === "admin" ? "/admin.html" : "/dashboard.html";
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
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
      const confirmPassword = document.getElementById("signupConfirmPassword").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok) {
          alert("Signup successful! Please login.");
          if (signupModal) signupModal.style.display = "none";
          if (loginModal) loginModal.style.display = "block";
        } else {
          alert(data.message || "Signup failed");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("An error occurred during signup");
      }
    });
  }
}

// ---------------- Navigation Animation ----------------
function setupNavAnimations() {
  if (navLinks && navLinks.length > 0) {
    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        link.style.transition = "transform 0.3s ease";
        link.style.transform = "translateY(-2px)";
      });

      link.addEventListener("mouseleave", () => {
        link.style.transform = "translateY(0)";
      });

      link.addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        const category = link.getAttribute("data-category");
        fetchNews(category);
      });
    });
  }
}

// ---------------- Back and Logout ----------------
function setupGlobalActions() {
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

  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "dashboard.html#article";
    });
  }
}

// ---------------- Initialize Everything ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  setupBookmark();
  setupModals();
  setupPasswordToggles();
  setupForms();
  setupNavAnimations();
  setupGlobalActions();
  checkAuth();
});
