# News Portal

A professional news portal similar to BBC News, built with Node.js, Express, and MySQL.

## Features

- **User Authentication**

  - Email/Password Login and Registration
  - Google OAuth Integration
  - OTP-based Password Reset
  - Account Management

- **News Management**

  - Personalized News Feed
  - Category-based News Browsing
  - Search Functionality
  - Featured Articles

- **Admin Dashboard**
  - News Article Creation and Editing
  - User Management
  - Media Management
  - Analytics

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT, Passport.js, Google OAuth
- **Email**: Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- MySQL (Laragon)
- News API key (from https://newsapi.org/)
- Google OAuth credentials (optional, for Google login)
- Gmail account (optional, for sending password reset emails)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd news-portal
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=news_portal
JWT_SECRET=your_jwt_secret_key
NEWS_API_KEY=your_news_api_key

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_key

# Email configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password

# Base URL
BASE_URL=http://localhost:3000
```

4. Set up the database:

- Open Laragon
- Start MySQL
- Import the `schema.sql` file to create the database and tables

5. Run the migrations:

   ```
   node apply-otp-migration.js
   ```

6. Start the server:

```bash
node server.js
```

The application will be available at `http://localhost:3000`

## Email Configuration

For the password reset functionality to work with Gmail:

1. You need to set up an App Password for your Gmail account
2. Follow the instructions in [docs/gmail-app-password-setup.md](docs/gmail-app-password-setup.md)

## Google OAuth Setup

To enable Google login:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Set up OAuth credentials
3. Add the following authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
4. Copy your Client ID and Client Secret to the `.env` file

## Development Mode

When running in development mode without email credentials:

1. OTPs will be displayed in the console and on the forgot password page
2. No actual emails will be sent
3. You can use the displayed OTP to test the password reset flow

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/google` - Login with Google
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP token

### News

- `GET /api/news` - Get all news
- `GET /api/news/category/:category` - Get news by category
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/:id` - Update news (admin only)
- `DELETE /api/news/:id` - Delete news (admin only)

## Admin Access

Default admin credentials:

- Email: admin@newsportal.com
- Password: admin123

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License.
