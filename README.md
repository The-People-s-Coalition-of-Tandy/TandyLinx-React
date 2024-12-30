# TandyLinx

A link management system built with Node.js and React.

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. Initialize the database:
   ```bash
   cd backend
   node db.js
   ```

5. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd ../frontend
   npm run dev
   ```

## Environment Variables

Make sure to set up your `.env` file with the following variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DB_PATH`: Path to SQLite database
- `SECRET_KEY`: Session secret key
- `FRONTEND_URL`: Frontend URL for CORS
