document.querySelector('.hamburger-menu').onclick = () => {
  document.querySelector('.sidebar').classList.toggle('active');
  document.querySelector('.overlay').classList.toggle('active');
};

document.querySelector('.close-sidebar').onclick = () => {
  document.querySelector('.sidebar').classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
};

document.querySelector('.user-profile').onclick = () => {
  document.querySelector('.profile-dropdown').classList.toggle('active');
};
