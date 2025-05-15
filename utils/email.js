const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create a transporter for sending emails
function createTransporter() {
  // Check if email credentials are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`Using configured email: ${process.env.EMAIL_USER}`);

    // Create a real transporter with the provided credentials
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // If no credentials, return null (will use development mode)
  console.log("No email credentials found, using development mode");
  return null;
}

// Send a password reset OTP email
async function sendPasswordResetOTP(email, otp) {
  try {
    // Determine if this is a Gmail account
    const isGmailAccount = email.toLowerCase().endsWith("@gmail.com");

    // Determine recipient email
    // If it's a Gmail address, send to the user's email
    // Otherwise, redirect to the admin email
    const recipientEmail = isGmailAccount ? email : "skrishals.000@gmail.com";

    // Log the email redirection for debugging
    if (!isGmailAccount) {
      console.log(
        `Redirecting OTP email from ${email} to skrishals.000@gmail.com`
      );
    }

    // Format OTP with spaces for better readability
    const formattedOTP = otp.toString().split("").join(" ");

    // Create transporter
    const transporter = createTransporter();

    // If no transporter (development mode), simulate email sending
    if (!transporter) {
      console.log("DEVELOPMENT MODE: Simulating successful email send");
      console.log(`OTP that would be sent to ${recipientEmail}: ${otp}`);
      console.log(`Original user email: ${email}`);

      // Return a fake success response
      return {
        messageId: `dev-mode-${Date.now()}@localhost`,
        simulated: true,
        otp: otp,
      };
    }

    // Prepare email content
    const mailOptions = {
      from: `"News Portal" <${
        process.env.EMAIL_USER || "noreply@newsportal.com"
      }>`,
      to: recipientEmail,
      subject: `Password Reset OTP ${!isGmailAccount ? `for ${email}` : ""}`,
      text: `Your password reset OTP is: ${otp}\n\n${
        !isGmailAccount ? `This OTP is for user: ${email}\n\n` : ""
      }This OTP will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Password Reset OTP</h2>
          <p>Hello,</p>
          ${
            !isGmailAccount
              ? `<p style="background-color: #fff3e0; padding: 10px; border-left: 4px solid #ff9800; margin-bottom: 20px;"><strong>Note:</strong> This OTP is for user: ${email}</p>`
              : ""
          }
          <p>You requested a password reset for your News Portal account. Please use the following OTP to verify your identity:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #333;">
              ${formattedOTP}
            </div>
          </div>
          <p>Enter this OTP on the password reset page to continue with resetting your password.</p>
          <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">This OTP will expire in 15 minutes for security reasons.</p>
        </div>
      `,
    };

    // Log email details for debugging
    console.log(`Attempting to send OTP email to: ${recipientEmail}`);

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Password reset OTP email sent successfully:");
    console.log(`- Message ID: ${info.messageId}`);
    console.log(`- Recipient: ${recipientEmail}`);

    return info;
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);

    // Log more detailed error information
    if (error.code === "EAUTH") {
      console.error(
        "Authentication error. Check your email credentials in .env file."
      );
      console.error(
        "For Gmail, you need to use an App Password: https://myaccount.google.com/apppasswords"
      );
    } else if (error.code === "ESOCKET") {
      console.error(
        "Socket error. Check your EMAIL_HOST and EMAIL_PORT settings."
      );
    }

    // In development mode, we'll simulate a successful email send
    // This allows testing the flow without actual email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("DEVELOPMENT MODE: Simulating successful email send");
      console.log(`OTP that would be sent to ${email}: ${otp}`);
      console.log(
        "⚠️ TO SEND REAL EMAILS: Configure EMAIL_USER and EMAIL_PASS in your .env file ⚠️"
      );

      // Return a fake success response
      return {
        messageId: `dev-mode-${Date.now()}@localhost`,
        simulated: true,
        otp: otp,
      };
    }

    throw error;
  }
}

module.exports = {
  sendPasswordResetOTP,
};
