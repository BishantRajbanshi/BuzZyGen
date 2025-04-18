# News Portal

A professional news portal similar to BBC News, built with Node.js, Express, and MySQL.

## Features

- User authentication (login/signup)
- News feed from external API
- Category-based news filtering
- Admin panel for CRUD operations
- Responsive design
- Modern UI/UX

## Prerequisites

- Node.js (v14 or higher)
- MySQL (Laragon)
- News API key (from https://newsapi.org/)

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
DB_PASSWORD=
DB_NAME=news_portal
JWT_SECRET=your_jwt_secret_key
NEWS_API_KEY=your_news_api_key
```

4. Set up the database:

- Open Laragon
- Start MySQL
- Import the `schema.sql` file to create the database and tables

5. Start the server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login

### News

- GET `/api/news` - Get all news
- GET `/api/news/category/:category` - Get news by category
- POST `/api/news` - Create news (admin only)
- PUT `/api/news/:id` - Update news (admin only)
- DELETE `/api/news/:id` - Delete news (admin only)

## Admin Access

Default admin credentials:

- Email: admin@newsportal.com
- Password: admin123

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License.
