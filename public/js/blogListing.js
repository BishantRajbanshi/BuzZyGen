let page = 0;
const limit = 6;
let allBlogs = [];

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "/");

  fetchBlogs(token);

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

  const moreBtn = document.querySelector(".more-posts");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      page++;
      fetchBlogs(token);
    });
  }
});

function fetchBlogs(token) {
  fetch(`/api/blogs?limit=${limit}&offset=${page * limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((blogs) => {
      if (blogs.length === 0) {
        document.querySelector(".more-posts").style.display = "none";
        return;
      }

      allBlogs = allBlogs.concat(blogs);
      renderUserArticles(allBlogs);
    })
    .catch((err) => {
      console.error("Failed to fetch blogs:", err);
      document.querySelector(".stories-grid").innerHTML = `<p>Error loading blogs.</p>`;
    });
}

function renderUserArticles(blogs) {
  const container = document.querySelector(".stories-grid");
  const featured = document.querySelector(".featured-image-wrapper");
  const featuredTextBox = document.querySelector(".featured-text-box");

  if (!container || !blogs.length) return;

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
        <p class="meta">
          ${new Date(featuredBlog.created_at).toLocaleDateString()} • 
          by ${featuredBlog.author_name || "Unknown"}
        </p>
        <h2>${featuredBlog.title}</h2>
        <p class="excerpt">${featuredBlog.subtitle || featuredBlog.content?.slice(0, 150) || ""}</p>
      </a>
    `;
  }

  // Exclude featured
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
            <p class="meta">
              ${new Date(blog.created_at).toLocaleDateString()} • 
              by ${blog.author_name || "Unknown"}
            </p>
            <p>${excerpt}</p>
            <span class="read-more">Read More →</span>
          </article>
        </a>
      `;
    })
    .join("");
}
