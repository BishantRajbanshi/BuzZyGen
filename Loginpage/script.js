document.getElementById("loginBtn").addEventListener("click", function() {
    document.getElementById("content").style.transform = "translateY(-100px)";
    document.getElementById("loginCard").classList.add("show");
});

document.getElementById("closeBtn").addEventListener("click", function() {
    document.getElementById("loginCard").classList.remove("show");
    document.getElementById("content").style.transform = "translateY(0)";
});
