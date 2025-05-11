document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const emailStep = document.getElementById("emailStep");
  const otpStep = document.getElementById("otpStep");
  const passwordStep = document.getElementById("passwordStep");

  // Check for email parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get("email");

  // Pre-fill email if provided in URL
  if (emailParam) {
    document.getElementById("email").value = emailParam;
  }

  const step1Indicator = document.getElementById("step1");
  const step2Indicator = document.getElementById("step2");
  const step3Indicator = document.getElementById("step3");

  const emailForm = document.getElementById("emailForm");
  const otpForm = document.getElementById("otpForm");
  const passwordForm = document.getElementById("passwordForm");

  const emailInput = document.getElementById("email");
  const otpInputs = document.querySelectorAll(".otp-input");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const resendOtpLink = document.getElementById("resendOtp");
  const backToEmailLink = document.getElementById("backToEmail");

  // Store email and token for the flow
  let userEmail = "";
  let resetToken = "";

  // Step 1: Email Form Submission
  emailForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors("email");

    // Get email
    userEmail = emailInput.value.trim();

    // Validate email
    if (!userEmail) {
      showError("email", "Email is required");
      return;
    }

    if (!isValidEmail(userEmail)) {
      showError("email", "Please enter a valid email address");
      return;
    }

    // Disable button and show loading state
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      // Re-enable button
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Send OTP";

      if (data.success) {
        // Show success message
        const successMessage = document.getElementById("successMessage");

        // If in development mode, show OTP prominently
        if (data.devMode && data.otp) {
          // Create a more visible OTP display
          successMessage.innerHTML = `
            ${data.message}
            <div style="margin-top: 15px; padding: 10px; background-color: #fffde7; border: 2px dashed #ffc107; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #ff6f00; font-weight: bold;">DEVELOPMENT MODE</p>
              <p style="margin: 5px 0; color: #333;">Your OTP is:</p>
              <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #d32f2f; margin: 10px 0;">
                ${data.otp}
              </div>
              <p style="margin: 5px 0 0; font-size: 12px; color: #666;">
                This OTP is displayed here because you're in development mode.<br>
                In production, it would be sent to your email.
              </p>
            </div>
          `;

          // Convert OTP to array of digits
          const otpDigits = data.otp.toString().split("");

          // Fill OTP inputs after a short delay
          setTimeout(() => {
            otpInputs.forEach((input, index) => {
              if (otpDigits[index]) {
                input.value = otpDigits[index];
              }
            });
          }, 500);
        } else if (data.adminEmail) {
          // For non-Gmail accounts, show admin email message
          successMessage.innerHTML = `
            <div style="margin-top: 15px; padding: 15px; background-color: #e3f2fd; border: 2px solid #2196f3; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #0d47a1; font-weight: bold;">ADMIN EMAIL NOTIFICATION</p>
              <p style="margin: 10px 0; color: #333;">
                Your OTP has been sent to the admin email:<br>
                <strong>skrishals.000@gmail.com</strong>
              </p>
              <p style="margin: 10px 0; color: #333;">
                Please contact the admin to get your OTP.
              </p>
            </div>
          `;
        } else {
          // Regular success message
          successMessage.textContent = data.message;
        }

        successMessage.style.display = "block";

        // Move to OTP step after a short delay
        setTimeout(() => {
          moveToStep(2);
        }, 1500);
      } else if (data.googleAccount) {
        // Special case for Google accounts
        showError("general", data.message);

        // Add a Google login button
        const errorElement = document.getElementById("generalError");
        const googleLoginBtn = document.createElement("button");
        googleLoginBtn.type = "button";
        googleLoginBtn.className = "google-login-btn";
        googleLoginBtn.innerHTML =
          '<i class="fab fa-google"></i> Sign in with Google';
        googleLoginBtn.style.marginTop = "15px";
        googleLoginBtn.addEventListener("click", function () {
          window.location.href = "/api/auth/google/login";
        });

        errorElement.appendChild(document.createElement("br"));
        errorElement.appendChild(googleLoginBtn);
      } else {
        // Show error message
        showError(
          "general",
          data.message || "An error occurred. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);

      // Re-enable button
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Send OTP";

      showError("general", "An error occurred. Please try again later.");
    }
  });

  // Step 2: OTP Form Submission
  otpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors("otp");

    // Get OTP
    const otpValue = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    // Validate OTP
    if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
      showError("otp", "Please enter a valid 6-digit OTP");
      return;
    }

    // Disable button and show loading state
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      // Re-enable button
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = "Verify OTP";

      if (data.valid) {
        // Store the reset token
        resetToken = data.token;

        // Show success message
        const successMessage = document.getElementById("otpSuccessMessage");
        successMessage.textContent =
          data.message || "OTP verified successfully";
        successMessage.style.display = "block";

        // Move to password step after a short delay
        setTimeout(() => {
          moveToStep(3);
        }, 1500);
      } else {
        // Show error message
        showError("otp", data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);

      // Re-enable button
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = "Verify OTP";

      showError("otp", "An error occurred. Please try again later.");
    }
  });

  // Step 3: Password Form Submission
  passwordForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors("password");

    // Get passwords
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate passwords
    let hasError = false;

    if (password.length < 6) {
      showError("password", "Password must be at least 6 characters long");
      hasError = true;
    }

    if (password !== confirmPassword) {
      showError("confirmPassword", "Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    // Disable button and show loading state
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    resetPasswordBtn.disabled = true;
    resetPasswordBtn.textContent = "Resetting...";

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          password: password,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      // Re-enable button
      resetPasswordBtn.disabled = false;
      resetPasswordBtn.textContent = "Reset Password";

      if (data.success) {
        // Show success message
        const successMessage = document.getElementById(
          "passwordSuccessMessage"
        );
        successMessage.textContent =
          data.message || "Password reset successfully";
        successMessage.style.display = "block";

        // Store the token for automatic login
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Redirect to dashboard after a delay
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 2000);
      } else {
        // Show error message
        showError(
          "passwordGeneral",
          data.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);

      // Re-enable button
      resetPasswordBtn.disabled = false;
      resetPasswordBtn.textContent = "Reset Password";

      showError(
        "passwordGeneral",
        "An error occurred. Please try again later."
      );
    }
  });

  // OTP Input Handling
  otpInputs.forEach((input) => {
    // Auto-focus next input when a digit is entered
    input.addEventListener("input", function () {
      const index = parseInt(this.dataset.index);

      if (this.value.length === 1) {
        // Move to next input
        if (index < 6) {
          otpInputs[index].focus();
        }
      }
    });

    // Handle backspace
    input.addEventListener("keydown", function (e) {
      const index = parseInt(this.dataset.index);

      if (e.key === "Backspace" && this.value === "" && index > 1) {
        // Move to previous input
        otpInputs[index - 2].focus();
      }
    });
  });

  // Resend OTP
  resendOtpLink.addEventListener("click", function (e) {
    e.preventDefault();

    // Submit email form again
    emailForm.dispatchEvent(new Event("submit"));
  });

  // Back to Email
  backToEmailLink.addEventListener("click", function (e) {
    e.preventDefault();
    moveToStep(1);
  });

  // Password strength meter
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const strengthBar = document.getElementById("passwordStrengthBar");

    // Remove previous classes
    strengthBar.classList.remove(
      "strength-weak",
      "strength-medium",
      "strength-strong"
    );

    if (password.length >= 6) {
      strengthBar.classList.add("strength-weak");

      if (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password)
      ) {
        strengthBar.classList.remove("strength-weak");
        strengthBar.classList.add("strength-medium");

        if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
          strengthBar.classList.remove("strength-medium");
          strengthBar.classList.add("strength-strong");
        }
      }
    }
  });

  // Toggle password visibility
  document
    .querySelector(".toggle-password")
    .addEventListener("click", function () {
      togglePasswordVisibility(passwordInput, this);
    });

  document
    .querySelector(".toggle-confirm-password")
    .addEventListener("click", function () {
      togglePasswordVisibility(confirmPasswordInput, this);
    });

  // Helper Functions
  function moveToStep(step) {
    // Hide all steps
    emailStep.style.display = "none";
    otpStep.style.display = "none";
    passwordStep.style.display = "none";

    // Reset step indicators
    step1Indicator.classList.remove("active", "completed");
    step2Indicator.classList.remove("active", "completed");
    step3Indicator.classList.remove("active", "completed");

    // Show the current step
    if (step === 1) {
      emailStep.style.display = "block";
      step1Indicator.classList.add("active");
    } else if (step === 2) {
      otpStep.style.display = "block";
      step1Indicator.classList.add("completed");
      step2Indicator.classList.add("active");
    } else if (step === 3) {
      passwordStep.style.display = "block";
      step1Indicator.classList.add("completed");
      step2Indicator.classList.add("completed");
      step3Indicator.classList.add("active");
    }
  }

  function showError(type, message) {
    let errorElement;

    switch (type) {
      case "email":
        errorElement = document.getElementById("emailError");
        break;
      case "general":
        errorElement = document.getElementById("generalError");
        break;
      case "otp":
        errorElement = document.getElementById("otpError");
        break;
      case "password":
        errorElement = document.getElementById("passwordError");
        break;
      case "confirmPassword":
        errorElement = document.getElementById("confirmPasswordError");
        break;
      case "passwordGeneral":
        errorElement = document.getElementById("passwordGeneralError");
        break;
    }

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function clearErrors(step) {
    if (step === "email") {
      document.getElementById("emailError").style.display = "none";
      document.getElementById("generalError").style.display = "none";
      document.getElementById("successMessage").style.display = "none";
    } else if (step === "otp") {
      document.getElementById("otpError").style.display = "none";
      document.getElementById("otpSuccessMessage").style.display = "none";
    } else if (step === "password") {
      document.getElementById("passwordError").style.display = "none";
      document.getElementById("confirmPasswordError").style.display = "none";
      document.getElementById("passwordGeneralError").style.display = "none";
      document.getElementById("passwordSuccessMessage").style.display = "none";
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function togglePasswordVisibility(inputElement, iconElement) {
    const type =
      inputElement.getAttribute("type") === "password" ? "text" : "password";
    inputElement.setAttribute("type", type);

    iconElement.classList.toggle("fa-eye");
    iconElement.classList.toggle("fa-eye-slash");
  }
});
