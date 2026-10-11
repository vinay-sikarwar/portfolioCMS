# PortfolioHQ

PortfolioHQ is a headless portfolio CMS with a React client and an Express API, using Firebase for authentication and Neon for the PostgreSQL database with Prisma ORM.

## Project Structure

- `client/` contains the Vite React application.
- `server/` contains the Express API, Firebase authentication integration, database access, and Prisma schema.
- `server/prisma/` contains the Prisma schema for the Neon PostgreSQL database.

## Run Locally

Prerequisite: Node.js

1.  Install dependencies: `npm install`
2.  Generate the Prisma client: `npm run db:generate`
3.  Create a `.env` file in the `server/` directory with the following variables:
    ```
    DATABASE_URL="YOUR_NEON_POSTGRES_CONNECTION_STRING"
    FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
    ```
4.  Apply the database schema: `npx prisma migrate dev --name init`
5.  Start the full-stack development server: `npm run dev`

The application is served at `http://localhost:3000`.

## Production

Build the React client with `npm run build`, then start the Express server with `npm start`. In production, Express serves the built client from `client/dist` and handles the `/api` routes. Prisma connects to the Neon PostgreSQL database through `DATABASE_URL`, and Firebase handles authentication.
