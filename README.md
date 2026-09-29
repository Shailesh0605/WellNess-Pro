# Fitness Tracker

A Next.js frontend and Express API backed by SQLite and Prisma.

## Requirements

- Node.js 20.9 or newer
- npm

## Run Locally

1. Clone the repository and open a terminal in its root directory.
2. Create the local environment files.

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item .env.local.example .env.local
```

macOS/Linux:

```sh
cp backend/.env.example backend/.env
cp .env.local.example .env.local
```

3. In `backend/.env`, replace `JWT_SECRET` and `REFRESH_TOKEN_SECRET` with two different random values. Generate each with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

4. Install dependencies, generate Prisma Client, and create the local SQLite schema:

```sh
npm ci
npm --prefix backend ci
npm --prefix backend run prisma:generate
npm --prefix backend run db:deploy
```

5. Start the frontend and backend together:

```sh
npm run dev:all
```

Open `http://localhost:3000`, create an account at `/signup`, then log in. The API health endpoint is `http://localhost:4000/health`.

If port 3000 is already in use, Next.js may choose another port; local localhost origins are allowed by the development CORS configuration. The frontend API URL defaults to `http://localhost:4000` and can be changed in `.env.local`.

## Production Build

```sh
npm run build
```

Set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, and `REFRESH_TOKEN_SECRET` in the deployment environment. Production secrets must be different random values of at least 32 characters. Apply database migrations with `npm --prefix backend run db:deploy` before starting the API with `npm --prefix backend start`.

Local environment files and SQLite database files are ignored by Git. The `.env.example` files are safe templates and should be committed.

