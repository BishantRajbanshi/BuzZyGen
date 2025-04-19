document.querySelector('.hamburger-menu').onclick = () => {
  document.querySelector('.sidebar').classList.toggle('active');
  document.querySelector('.overlay').classList.toggle('active');
};

document.querySelector('.close-sidebar').onclick = () => {
  document.querySelector('.sidebar').classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
};

 // Toggle User Profile Dropdown
    document.querySelector('.user-profile').addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelector('.profile-dropdown').classList.toggle('active');
        document.querySelector('.kebab-dropdown').classList.remove('active');
    });

    // Toggle Kebab Menu Dropdown
    document.querySelector('.kebab-menu').addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelector('.kebab-dropdown').classList.toggle('active');
        document.querySelector('.profile-dropdown').classList.remove('active');
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function () {
        document.querySelector('.profile-dropdown').classList.remove('active');
        document.querySelector('.kebab-dropdown').classList.remove('active');
    });

    document.querySelector('.kebab-dropdown').addEventListener('click', function (e) {
    e.stopPropagation(); // Don't let click inside close the dropdown
});

