async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    if (!articleId) {
        document.getElementById("articleTitle").textContent = "Article not found.";
        return;
    }

    try {
        const response = await fetch(`/api/article/${articleId}`);
        const article = await response.json();

        // Set image
        const imageDiv = document.getElementById("articleImage");
        const imageUrl = article.featured_image || "https://via.placeholder.com/1200x500?text=No+Image";
        imageDiv.innerHTML = `<img src="${imageUrl}" alt="${article.title}" />`;

        // Set title and meta
        document.getElementById("articleTitle").textContent = article.title || "Untitled";
        document.getElementById("articleAuthor").textContent = `Written by: Admin`;
        document.getElementById("articleDate").textContent = new Date(article.created_at).toLocaleDateString();

        // Set content
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

document.addEventListener("DOMContentLoaded", loadArticle);