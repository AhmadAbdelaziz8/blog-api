# Blog Platform

A full-stack blog application with a React frontend and Express/Node.js backend.

## Features

- User authentication (login/register)
- Role-based access control (User, Author, Admin)
- Create, read, update, and delete blog posts
- Comment on posts
- Rich text editing for post creation
- Responsive design
- Error handling with graceful fallbacks

## Tech Stack

### Frontend

- React
- TypeScript
- React Router for navigation
- TailwindCSS for styling
- Fetch API for data fetching
- TinyMCE for rich text editing
- React Toastify for notifications

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
blog-api/
├── backend/             # Express API
│   ├── prisma/          # Database schema and migrations
│   └── src/             # Backend source code
│       ├── controllers/ # Request handlers
│       ├── middleware/  # Auth middleware, etc.
│       ├── models/      # Data models
│       ├── routes/      # API routes
│       └── utils/       # Utility functions
│
└── frontend/            # React frontend
    ├── public/          # Static assets
    └── src/             # Frontend source code
        ├── api/         # API service calls
        ├── components/  # React components
        ├── contexts/    # React contexts (Auth, Notifications)
        ├── pages/       # Page components
        └── types/       # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd blog-api
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Configure the backend:

   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/blogdb"
     JWT_SECRET="your-secret-key"
     PORT=4000
     ```

4. Set up the database:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## Running the Application

### Development Mode

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## Features

### Authentication

- Register as a User (can comment on posts) or Author (can create posts)
- Login with email and password
- JWT-based authentication

### Posts

- View all published posts
- Create new posts (Authors only)
- Edit and delete your own posts
- Toggle publish status of posts
- Rich text editing with TinyMCE

### Comments

- Add comments to posts
- View all comments on a post
- Edit and delete your own comments

## Troubleshooting

### "Unable to connect to the server" Error

If you encounter connection errors:

1. Ensure the backend server is running at http://localhost:4000
2. Check that your `.env` file in the backend directory has the correct configuration
3. Verify the PostgreSQL database is running and accessible
4. Check the backend console for error messages

### Database Connection Issues

If you encounter database connection problems:

1. Ensure PostgreSQL is running
2. Verify the DATABASE_URL in your `.env` file is correct
3. Run the migrations: `npx prisma migrate dev`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
