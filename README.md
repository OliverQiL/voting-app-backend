# Voting App Backend

An Express.js based backend API for a voting application with MongoDB database integration.

## Features

- User authentication with JWT
- Role-based access control (admin/user)
- Voting system with support for existing and new options
- RESTful API design
- MongoDB integration
- Testing with Jest

## Prerequisites

- Node.js (v16.x or higher recommended)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/voting-app-backend.git
   cd voting-app-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/voting-app
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
   *Note: Replace MONGODB_URI with your database connection string
   *Note: Replace `your_jwt_secret_key` with a strong random string for production.*

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

This will start the server with nodemon, which automatically restarts when you make changes.

### Production Mode

```bash
npm start
# or
yarn start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ username, email, password }`
- `POST /api/auth/login` - Login a user
  - Body: `{ email, password }`

### Voting

- `GET /api/votes/options` - Get all voting options
- `POST /api/votes` - Submit or update a vote (requires authentication)
  - Body: `{ option }`
- `GET /api/votes/results` - Get voting results (admin only)
- `GET /api/votes/me` - Get current user's vote (requires authentication)

### User Management (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
  - Body: `{ username?, email?, isAdmin?, password? }`
- `DELETE /api/users/:id` - Delete user

## Testing

The project uses Jest for testing. Run tests with:

```bash
npm test
# or
yarn test
```

Tests are organized by domain:
- `auth.test.js` - Authentication endpoint tests
- `user.test.js` - User management endpoint tests
- `vote.test.js` - Voting endpoint tests

## Project Structure

```
src/
├── config/             # Configuration files
│   └── db.js           # MongoDB connection
├── controllers/        # API controllers
│   ├── authController.js
│   ├── userController.js
│   └── voteController.js
├── middlewares/        # Express middlewares
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/             # MongoDB models
│   ├── userModel.js
│   └── voteModel.js
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── voteRoutes.js
├── tests/              # Test files
│   ├── auth.test.js
│   ├── user.test.js
│   └── vote.test.js
├── app.js              # Express app setup
└── server.js           # Server entry point
```

## Database Schema

### User

- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required, encrypted)
- `isAdmin`: Boolean (default: false)
- `timestamps`: Created and updated timestamps

### Vote

- `user`: ObjectId (reference to User)
- `option`: String (the vote option)
- `timestamps`: Created and updated timestamps

### VoteOption

- `name`: String (the option name)
- `count`: Number (count of votes for this option)

## Setting Up Admin Users
By default, the first user is not an admin. To create an admin user:

1. Register a user through the API or frontend
2. Connect to your MongoDB database
3. Locate the user in the users collection
4. Update the isAdmin field to true
5. The user will now have admin privileges

## License

This project is licensed under the MIT License - see the LICENSE file for details.
