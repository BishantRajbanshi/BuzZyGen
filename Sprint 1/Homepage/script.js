
// Toggle main dropdown menu
function toggleMenu() {
closeAllDropdowns();
const menu = document.getElementById("dropdownMenu");
if (menu) {
menu.style.display = menu.style.display === "block" ? "none" : "block";
}
}

// Search handler
function performSearch() {
const query = document.getElementById("searchInput").value.trim();
if (query === "") {
alert("Please enter a search term.");
return;
}
alert("You searched for: " + query);
// window.location.href = "search.html?q=" + encodeURIComponent(query);
}

document.addEventListener("DOMContentLoaded", function () {
const container = document.getElementById("notificationContainer");
const dropdown = document.getElementById("notificationDropdown");
const badge = document.getElementById("notificationBadge");

const notifications = [
"Breaking News: Major Earthquake Hits Kathmandu",
"New Article Published: 'The Future of Artificial Intelligence'",
"Live Event: Election Results Coming In!"
];

window.toggleNotifications = function () {
closeAllDropdowns();
container.classList.toggle("active");

if (container.classList.contains("active")) {
badge.style.display = "none";
}
};

// Render messages
dropdown.innerHTML = "";
if (notifications.length === 0) {
dropdown.innerHTML = "<div class='notification-message'>No new notifications</div>";
} else {
notifications.forEach(msg => {
const div = document.createElement("div");
div.className = "notification-message";
div.textContent = msg;
dropdown.appendChild(div);
});
}

badge.textContent = notifications.length;
});

// Toggle Login/Signup
function toggleLoginSignup() {
closeAllDropdowns();
const container = document.getElementById('loginSignupContainer');
container.style.display = container.style.display === 'block' ? 'none' : 'block';
}

// Toggle Kebab
function toggleKebab() {
closeAllDropdowns();
const menu = document.getElementById("kebabMenu");
menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Close all dropdowns
function closeAllDropdowns() {
const menu = document.getElementById("dropdownMenu");
if (menu) menu.style.display = "none";

const notif = document.getElementById("notificationContainer");
if (notif) notif.classList.remove("active");

const login = document.getElementById("loginSignupContainer");
if (login) login.style.display = "none";

const kebab = document.getElementById("kebabMenu");
if (kebab) kebab.style.display = "none";
}

// Optional: Close Kebab if clicked outside
window.addEventListener("click", function (e) {
const kebab = document.querySelector(".kebab-container");
const user = document.querySelector(".user-profile");
const notif = document.getElementById("notificationContainer");
const menuBtn = document.querySelector(".menu-btn");

if (
!kebab.contains(e.target) &&
!user.contains(e.target) &&
!notif.contains(e.target) &&
!menuBtn.contains(e.target)
) {
closeAllDropdowns();
}
});

// Cookie preferences
document.getElementById('cookie-preferences')?.addEventListener('click', function () {
alert('This would open a modal or a page where you can manage your cookie preferences.');
});

// Form handling
const languageForm = document.querySelector('#language-settings form');
const regionForm = document.querySelector('#region-settings form');
const timezoneForm = document.querySelector('#timezone-settings form');
const cookieForm = document.querySelector('#cookie-settings form');

languageForm?.addEventListener('submit', function (event) {
event.preventDefault();
const selectedLanguage = document.getElementById('language').value;
alert(`Language changed to: ${selectedLanguage}`);
});

regionForm?.addEventListener('submit', function (event) {
event.preventDefault();
const selectedRegion = document.getElementById('region').value;
alert(`Region changed to: ${selectedRegion}`);
});

timezoneForm?.addEventListener('submit', function (event) {
event.preventDefault();
const selectedTimezone = document.getElementById('timezone').value;
alert(`Time Zone changed to: ${selectedTimezone}`);
});

cookieForm?.addEventListener('submit', function (event) {
event.preventDefault();
const acceptCookies = document.getElementById('cookie-accept').checked;
alert(`Cookies accepted: ${acceptCookies ? 'Yes' : 'No'}`);
});

