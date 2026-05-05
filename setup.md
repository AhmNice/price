# Project Setup

This repository contains:

- `client/` - React + Vite + TypeScript frontend
- `server/` - Express + TypeScript + Prisma backend

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- PostgreSQL running locally (or any reachable Postgres instance)

## 1. Install Dependencies

From the project root:

```bash
cd server
npm install

cd ../client
npm install
```

## 2. Configure Server Environment

Create a `.env` file in `server/`.

Example:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=your_password

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mydb

SESSION_COOKIE_NAME_ACCESS=access_token
SESSION_COOKIE_NAME_REFRESH=refresh_token
JWT_SECRET=change_me
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:5173
```

Notes:

- Frontend API base URL is currently `http://localhost:5000/api` in `client/src/store/api.ts`.
- Make sure `PORT` matches that base URL.

## 3. Generate Prisma Client and Apply Migrations

From `server/`:

```bash
npm run db:init
npm run prisma:generate
npm run prisma:migrate
```

Optional tools:

```bash
npm run prisma:studio
npm run seed
```

## 4. Run Development Servers

Terminal 1 (backend):

```bash
cd server
npm run dev
```

Terminal 2 (frontend):

```bash
cd client
npm run dev
```

Default app URL:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## 5. Useful Commands

Server (`server/`):

```bash
npm run dev
npm run start
npm run lint
npm run format
npm run db:init
npm run seed
```

Client (`client/`):

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Troubleshooting

- If Prisma fails to connect, verify `DATABASE_URL` and PostgreSQL status.
- If frontend requests fail, confirm backend is running and `PORT` matches `client/src/store/api.ts`.
- If CORS/cookie issues happen, ensure `CLIENT_URL` in `server/.env` matches the frontend dev URL.
