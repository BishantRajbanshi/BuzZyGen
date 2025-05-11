// ✅ Full user.js for blog dashboard

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
  
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/");
  
    let decodedToken;
    try {
      decodedToken = JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Invalid token");
      return (window.location.href = "/");
    }
  
    const userName = decodedToken.name || (decodedToken.email ? decodedToken.email.split("@")[0] : "User");
    document.querySelector(".welcome-text h1").textContent = `Hello ${userName},`;
  
    initUserBlogDashboard(token);
    setupImageUpload();
    fetchUserBlogs(token);
    setupLogout();
  });
  
  function initUserBlogDashboard(token) {
    setupSidebar();
    setupModal();
    setupForm(token);
  }
  
  function setupSidebar() {
    const hamburger = document.querySelector(".hamburger-menu");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const closeSidebar = document.querySelector(".close-sidebar");
  
    hamburger?.addEventListener("click", () => {
      sidebar?.classList.add("active");
      overlay?.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  
    const closeFn = () => {
      sidebar?.classList.remove("active");
      overlay?.classList.remove("active");
      document.body.style.overflow = "";
    };
  
    closeSidebar?.addEventListener("click", closeFn);
    overlay?.addEventListener("click", closeFn);
  }
  
  function setupModal() {
    const modal = document.getElementById("createNewsModal");
    const newBtn = document.querySelector(".new-article-btn");
    const closeBtn = document.querySelector(".modal .close");
  
    newBtn?.addEventListener("click", () => {
      resetForm();
      modal.style.display = "block";
    });
  
    closeBtn?.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
  
  function resetForm() {
    const form = document.getElementById("createNewsForm");
    form.reset();
    document.getElementById("featured-image").value = "";
    document.getElementById("image-preview").style.display = "none";
    document.getElementById("image-drop-area").style.display = "block";
  }
  
  function setupForm(token) {
    const form = document.getElementById("createNewsForm");
    let editingId = null;
  
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const data = {
        title: form.title.value,
        subtitle: form.subtitle.value,
        content: form.content.value,
        featured_image: form["featured_image"].value,
        category: form.category.value,
        tags: form.tags.value,
        created_at: new Date().toISOString(),
      };
  
      const url = editingId ? `/api/blogs/${editingId}` : "/api/blogs";
      const method = editingId ? "PUT" : "POST";
  
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
  
      if (res.ok) {
        alert(`Blog ${editingId ? "updated" : "posted"} successfully.`);
        document.getElementById("createNewsModal").style.display = "none";
        fetchUserBlogs(token);
      } else {
        alert("Error submitting blog.");
      }
    });
  
    window.editNews = (id, blogData) => {
      editingId = id;
      form.title.value = blogData.title;
      form.subtitle.value = blogData.subtitle;
      form.content.value = blogData.content;
      form["featured_image"].value = blogData.featured_image || "";
      form.category.value = blogData.category;
      form.tags.value = blogData.tags || "";
  
      if (blogData.featured_image) {
        document.getElementById("preview-image").src = blogData.featured_image;
        document.getElementById("image-preview").style.display = "block";
        document.getElementById("image-drop-area").style.display = "none";
      }
  
      document.getElementById("createNewsModal").style.display = "block";
    };
  }
  
  function fetchUserBlogs(token) {
    fetch("/api/blogs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((blogs) => renderUserBlogs(blogs))
      .catch((err) => {
        console.error("Error loading blogs:", err);
        document.querySelector(".blog-grid").innerHTML = `<p>Error loading blogs.</p>`;
      });
  }
  
  function renderUserBlogs(blogs) {
    const container = document.querySelector(".blog-grid");
    if (!container) return;
  
    if (!blogs || blogs.length === 0) {
      container.innerHTML = `<p>No blogs posted yet.</p>`;
      return;
    }
  
    const latestBlogs = blogs.slice(0, 5);
    container.innerHTML = latestBlogs
      .map(
        (blog) => `
        <div class="blog-card">
          <div class="blog-content">
            <h3>${blog.title}</h3>
            <p>${blog.subtitle || blog.content?.slice(0, 100) || ""}</p>
            <button class="edit-btn" data-id="${blog.id}">Edit</button>
            <button class="delete-btn" data-id="${blog.id}">Delete</button>
          </div>
          <div class="blog-image">
            <img src="${blog.featured_image || "https://via.placeholder.com/300x200?text=No+Image"}" alt="${blog.title}">
          </div>
        </div>
      `
      )
      .join("");
  
    setupEditDelete(localStorage.getItem("token"));
  }
  
  function setupEditDelete(token) {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/api/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const blog = await res.json();
        window.editNews(id, blog);
      });
    });
  
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Are you sure you want to delete this blog?")) return;
  
        const res = await fetch(`/api/blogs/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          alert("Blog deleted.");
          fetchUserBlogs(token);
        } else {
          alert("Failed to delete blog.");
        }
      });
    });
  }
  
  function setupImageUpload() {
    const imageUpload = document.getElementById("image-upload");
    const imageDropArea = document.getElementById("image-drop-area");
    const imagePreview = document.getElementById("image-preview");
    const previewImage = document.getElementById("preview-image");
    const removeImageBtn = document.getElementById("remove-image");
    const featuredImageInput = document.getElementById("featured-image");
  
    imageDropArea?.addEventListener("click", () => imageUpload.click());
    imageUpload?.addEventListener("change", handleImage);
  
    imageDropArea?.addEventListener("dragover", (e) => {
      e.preventDefault();
      imageDropArea.classList.add("highlight");
    });
  
    imageDropArea?.addEventListener("dragleave", () => {
      imageDropArea.classList.remove("highlight");
    });
  
    imageDropArea?.addEventListener("drop", (e) => {
      e.preventDefault();
      imageDropArea.classList.remove("highlight");
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        imageUpload.files = files;
        handleImage();
      }
    });
  
    function handleImage() {
      const file = imageUpload.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        imagePreview.style.display = "block";
        imageDropArea.style.display = "none";
        featuredImageInput.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    removeImageBtn?.addEventListener("click", () => {
      imageUpload.value = "";
      previewImage.src = "";
      featuredImageInput.value = "";
      imagePreview.style.display = "none";
      imageDropArea.style.display = "block";
    });
  }
  
  function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
          localStorage.removeItem("token");
          sessionStorage.clear();
          alert("You have been logged out.");
          window.location.href = "/";
        }
      });
    }
  }
  