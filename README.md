# Factory Maintenance System

## Overview
A web-based Factory Maintenance Management System for managing machines, maintenance, spare parts, suppliers, warranties, service history, alerts, and users.

## Main Modules

- Dashboard
- Machines
- Maintenance
- Spare Parts
- Suppliers
- Warranties
- Service History
- Alerts
- Users/Admin
- Authentication

## Requirements

- Node.js (v18 or higher)
- PostgreSQL
- Redis
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd factory-maintenance-system
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Environment Variables

You need to configure the environment variables for the backend and frontend.

### Backend

Copy the example environment file and fill in your actual database credentials:
```bash
cd backend
cp .env.example .env
```
Ensure you provide real values in `.env` for `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `REDIS_URL`. Do NOT commit your real `.env` file to version control.

### Frontend
In production or if your backend is hosted elsewhere, create a `.env` in the `frontend` folder containing:
```
VITE_API_URL=http://localhost:5000
```
(Change the URL to match your backend's API endpoint).

## Database Setup

Initialize the Prisma database schema:
```bash
cd backend
npx prisma db push
```
*(Alternatively, run `npx prisma migrate deploy` for production migrations if they are already generated)*

## Development

You can run both servers locally.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```
*Note: The backend build script automatically runs `prisma generate` before compiling TypeScript.*

### Frontend
```bash
cd frontend
npm run build
```
The output will be generated in the `frontend/dist` folder.

## Deployment

- **Frontend (Vercel/Netlify):** Set your build command to `npm run build` and output directory to `dist`. Ensure the environment variable `VITE_API_URL` is set to your production backend URL. A `vercel.json` is included for SPA routing.
- **Backend (Render/Heroku/VPS):** Set your build command to `npm run build` and start command to `npm start`. Add the production `DATABASE_URL`, `REDIS_URL`, and a strong `JWT_SECRET` in your hosting platform's environment settings.
