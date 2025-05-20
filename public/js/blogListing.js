document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "/");

  fetch("/api/blogs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((blogs) => renderUserArticles(blogs))
    .catch((err) => {
      console.error("Failed to fetch user blogs:", err);
      document.querySelector(".stories-grid").innerHTML = `<p>Error loading blogs.</p>`;
    });

  // Logout button
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

  // Back button
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "dashboard.html#article";
    });
  }
});

function renderUserArticles(blogs) {
  const container = document.querySelector(".stories-grid");
  const featured = document.querySelector(".featured-image-wrapper");
  const featuredTextBox = document.querySelector(".featured-text-box");

  if (!container) return;

  if (!blogs || blogs.length === 0) {
    container.innerHTML = `<p>You haven't posted any blogs yet.</p>`;
    if (featuredTextBox) {
      featuredTextBox.innerHTML = `<p>No featured blog available.</p>`;
    }
    return;
  }

  // ✅ Featured Blog
  const featuredBlog = blogs[0];
  const imageUrl =
    featuredBlog.featured_image || "https://via.placeholder.com/1200x500?text=No+Image";

  if (featured) {
    featured.style.backgroundImage = `url('${imageUrl}')`;
    featured.style.cursor = "pointer";
    featured.onclick = () => (window.location.href = `blogRed.html?id=${featuredBlog.id}`);
  }

  if (featuredTextBox) {
    featuredTextBox.innerHTML = `
      <a href="blogRed.html?id=${featuredBlog.id}" style="text-decoration: none; color: inherit;">
        <p class="meta">${new Date(featuredBlog.created_at).toLocaleDateString()} • ${featuredBlog.category || "Uncategorized"}</p>
        <h2>${featuredBlog.title}</h2>
        <p class="excerpt">${featuredBlog.subtitle || featuredBlog.content?.slice(0, 150) || ""}</p>
      </a>
    `;
  }

  // ✅ Render Remaining Blogs - entire card clickable
  const rest = blogs.slice(1);
  container.innerHTML = rest
    .map((blog) => {
      const image =
        blog.featured_image || "https://via.placeholder.com/600x300?text=No+Image";
      const excerpt =
        blog.subtitle || (blog.content ? blog.content.slice(0, 120) + "..." : "");
      return `
        <a href="blogRed.html?id=${blog.id}" class="story-link-wrapper">
          <article class="story-card">
            <img src="${image}" alt="${blog.title}" />
            <h4>${blog.title}</h4>
            <p class="meta">${new Date(blog.created_at).toLocaleDateString()} • ${blog.category || "Uncategorized"}</p>
            <p>${excerpt}</p>
            <span class="read-more">Read More →</span>
          </article>
        </a>
      `;
    })
    .join("");
}

