/**
 * Confirmation Message Utility
 *
 * This utility provides functions to show beautiful confirmation messages
 * with animated checkmarks and other indicators.
 */

// SVG templates for icons
const SVG_TEMPLATES = {
  success: `
    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
  `,
  error: `
    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#F44336"/>
      <path class="checkmark__check" fill="none" stroke="#F44336" d="M16 16 36 36 M36 16 16 36"/>
    </svg>
  `,
  info: `
    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#2196F3"/>
      <path class="checkmark__check" fill="none" stroke="#2196F3" d="M26 15 26 34 M26 38 26 38"/>
    </svg>
  `,
};

/**
 * Show a confirmation message with an animated icon
 *
 * @param {string} message - The message to display
 * @param {string} type - The type of message: 'success', 'error', or 'info'
 * @param {string} containerId - The ID of the container to append the message to
 * @param {boolean} autoDismiss - Whether to automatically dismiss the message after 5 seconds
 * @param {Function} onDismiss - Optional callback function to execute when the message is dismissed
 */
function showConfirmation(
  message,
  type = "success",
  containerId = "confirmation-container",
  autoDismiss = true,
  onDismiss = null
) {
  // Get or create the container
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.maxWidth = "400px";
    document.body.appendChild(container);
  }

  // Create the confirmation message element
  const confirmationEl = document.createElement("div");
  confirmationEl.className = `confirmation-message ${type} ${
    autoDismiss ? "auto-dismiss" : ""
  }`;

  // Add the appropriate icon
  const iconContainer = document.createElement("div");
  iconContainer.className = "checkmark-circle";
  iconContainer.innerHTML = SVG_TEMPLATES[type] || SVG_TEMPLATES.success;

  // Add the message
  const messageEl = document.createElement("p");
  messageEl.textContent = message;

  // Add a close button
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.marginLeft = "auto";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.fontSize = "20px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "inherit";
  closeBtn.style.padding = "0 0 0 10px";
  closeBtn.onclick = () => {
    confirmationEl.style.opacity = "0";
    confirmationEl.style.transform = "translateY(-20px)";
    setTimeout(() => {
      container.removeChild(confirmationEl);
      if (onDismiss && typeof onDismiss === "function") {
        onDismiss();
      }
    }, 300);
  };

  // Assemble the confirmation message
  confirmationEl.appendChild(iconContainer);
  confirmationEl.appendChild(messageEl);
  confirmationEl.appendChild(closeBtn);

  // Add to the container
  container.appendChild(confirmationEl);

  // Auto-dismiss after 5 seconds if enabled
  if (autoDismiss) {
    setTimeout(() => {
      if (confirmationEl.parentNode === container) {
        confirmationEl.style.opacity = "0";
        confirmationEl.style.transform = "translateY(-20px)";
        setTimeout(() => {
          if (confirmationEl.parentNode === container) {
            container.removeChild(confirmationEl);
            if (onDismiss && typeof onDismiss === "function") {
              onDismiss();
            }
          }
        }, 300);
      }
    }, 2000);
  }

  return confirmationEl;
}

/**
 * Show a success confirmation with a checkmark animation
 */
function showSuccess(
  message,
  containerId,
  autoDismiss = true,
  onDismiss = null
) {
  return showConfirmation(
    message,
    "success",
    containerId,
    autoDismiss,
    onDismiss
  );
}

/**
 * Show an error confirmation
 */
function showError(message, containerId, autoDismiss = true, onDismiss = null) {
  return showConfirmation(
    message,
    "error",
    containerId,
    autoDismiss,
    onDismiss
  );
}

/**
 * Show an info confirmation
 */
function showInfo(message, containerId, autoDismiss = true, onDismiss = null) {
  return showConfirmation(message, "info", containerId, autoDismiss, onDismiss);
}

/**
 * Add a confirmation message to a specific form or element
 *
 * @param {HTMLElement} element - The element to add the confirmation to
 * @param {string} message - The message to display
 * @param {string} type - The type of message: 'success', 'error', or 'info'
 * @param {boolean} autoDismiss - Whether to automatically dismiss the message
 */
function addConfirmationToElement(
  element,
  message,
  type = "success",
  autoDismiss = true
) {
  // Create container if it doesn't exist
  let container = element.querySelector(".element-confirmation-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "element-confirmation-container";
    element.appendChild(container);
  }

  // Create the confirmation message
  const confirmationEl = document.createElement("div");
  confirmationEl.className = `confirmation-message ${type} ${
    autoDismiss ? "auto-dismiss" : ""
  }`;

  // Add the appropriate icon
  const iconContainer = document.createElement("div");
  iconContainer.className = "checkmark-circle";
  iconContainer.innerHTML = SVG_TEMPLATES[type] || SVG_TEMPLATES.success;

  // Add the message
  const messageEl = document.createElement("p");
  messageEl.textContent = message;

  // Assemble the confirmation message
  confirmationEl.appendChild(iconContainer);
  confirmationEl.appendChild(messageEl);

  // Add to the container
  container.innerHTML = ""; // Clear previous messages
  container.appendChild(confirmationEl);

  // Auto-dismiss after 5 seconds if enabled
  if (autoDismiss) {
    setTimeout(() => {
      if (confirmationEl.parentNode === container) {
        confirmationEl.style.opacity = "0";
        confirmationEl.style.transform = "translateY(-20px)";
        setTimeout(() => {
          if (confirmationEl.parentNode === container) {
            container.removeChild(confirmationEl);
          }
        }, 300);
      }
    }, 2000);
  }

  return confirmationEl;
}

// Export the functions
window.Confirmation = {
  show: showConfirmation,
  success: showSuccess,
  error: showError,
  info: showInfo,
  addToElement: addConfirmationToElement,
};
