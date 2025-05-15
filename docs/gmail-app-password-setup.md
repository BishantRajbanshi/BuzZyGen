# Setting Up Gmail App Password for OTP Emails

This guide will help you set up a Gmail App Password to use with the News Portal's OTP email functionality.

## Why You Need an App Password

Google has security measures that prevent "less secure apps" from using your Gmail account with just your regular password. Instead, you need to generate an App Password - a 16-character code that gives the News Portal permission to access your Gmail account.

## Prerequisites

1. A Gmail account
2. 2-Step Verification enabled on your Google Account

## Step 1: Enable 2-Step Verification (if not already enabled)

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security** from the left navigation panel
3. Under "Signing in to Google," select **2-Step Verification**
4. Follow the on-screen steps to enable 2-Step Verification

## Step 2: Generate an App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security** from the left navigation panel
3. Under "Signing in to Google," select **App passwords**
   - Note: This option only appears if 2-Step Verification is enabled
4. At the bottom, click **Select app** and choose **Other (Custom name)**
5. Enter "News Portal" as the name
6. Click **Generate**
7. The App Password is the 16-character code that appears on your screen
8. Copy this password (you won't be able to see it again)

## Step 3: Update Your .env File

1. Open the `.env` file in your News Portal project
2. Find the email configuration section
3. Update the following values:
   ```
   EMAIL_USER=your.gmail.address@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```
4. Save the file

## Step 4: Restart Your Server

After updating the `.env` file, restart your server for the changes to take effect.

## Troubleshooting

If you're still having issues sending emails:

1. **Check Console Logs**: Look for specific error messages in your server console
2. **Verify App Password**: Make sure you copied the entire 16-character App Password correctly
3. **Check Email Address**: Ensure your Gmail address is entered correctly
4. **Gmail Settings**: Make sure your Gmail account doesn't have additional security restrictions
5. **Firewall Issues**: Some networks block outgoing SMTP connections

## Security Notes

- Keep your App Password secure - it provides access to your Gmail account
- If you suspect your App Password has been compromised, you can revoke it from your Google Account security settings
- Consider creating a separate Gmail account specifically for your application
