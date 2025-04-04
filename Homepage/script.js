document.addEventListener("DOMContentLoaded", function () {
    // Toggle Mobile Menu (nav-sections)
    document.querySelector(".menu-btn").addEventListener("click", function (event) {
        event.stopPropagation();
        document.getElementById("homeDropdown").classList.toggle("active");
    });

document.addEventListener("DOMContentLoaded", function () {
    // Sample messages to display
    const messages = [
        "Breaking News: Global stock market sees a major surge today.",
        "Latest News: A new technological breakthrough in artificial intelligence.",
        "Top Story: Scientists discover a potential cure for a rare disease.",
        "Trending: A major political shift in European Union's policies."
    ];

    // Function to toggle the visibility of the notifications dropdown
    function toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.toggle('active');  // Toggle the 'active' class to show/hide the dropdown

        // If the dropdown is being opened, populate it with messages
        if (dropdown.classList.contains('active')) {
            // Clear any previous messages
            dropdown.innerHTML = '';

            // Add the messages to the dropdown
            messages.forEach(function (message) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('notification-item');

                const messageText = document.createElement('p');
                messageText.textContent = message;
                messageElement.appendChild(messageText);

                // Append the message element to the dropdown
                dropdown.appendChild(messageElement);
            });
        }
    }

    // Add event listener for the notification icon click
    document.querySelector(".notification-icon").addEventListener("click", toggleNotifications);
});



    // Function to toggle user dropdown visibility
    function toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        const allDropdowns = document.querySelectorAll(".dropdown");

        // Close all other dropdowns except user
        allDropdowns.forEach((d) => {
            if (d.id !== 'userDropdown') d.classList.remove("active");
        });

        dropdown.classList.toggle("active");

        if (dropdown.classList.contains("active") && dropdown.innerHTML.trim() === "") {
            dropdown.innerHTML = `
                <ul>
                    <li><a href="signup.html">Sign Up</a></li>
                    <li><a href="login.html">Login</a></li>
                </ul>
            `;
        }
    }

    // Close all dropdowns when clicking outside
    document.addEventListener("click", function (event) {
        const dropdowns = document.querySelectorAll(".dropdown");
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target) && !event.target.closest('.menu-btn') && !event.target.closest('.user-profile')) {
                dropdown.classList.remove("active");
                if (dropdown.id === 'userDropdown') dropdown.innerHTML = '';
            }
        });
    });
});
