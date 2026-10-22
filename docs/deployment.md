# Production Deployment Guide

This guide details the step-by-step procedures for deploying SQL Compass to production using **Vercel** for the React frontend, **Render** for the Express backend, **Neon** for PostgreSQL sandbox execution, and **MongoDB Atlas** for persistent storage.

---

## 1. Architecture & Deployment Matrix

| Component | Target Platform | Runtime / Tier | Primary Configuration |
|---|---|---|---|
| Frontend (`client/`) | Vercel | Node / Edge Static (Free/Pro) | `client/vercel.json`, Vite Build |
| Backend (`backend/`) | Render | Node.js 22 LTS Web Service (Starter/Free) | `render.yaml` or Render Dashboard |
| Practice SQL Sandbox | Neon / PostgreSQL | Serverless PostgreSQL 16 | Connection pooling, read-only role |
| Persistence Store | MongoDB Atlas | M0 Free Tier / Dedicated | Replica Set with TLS connection string |
| Authentication | Clerk | Production Instance | JWT Templates, Authorized Parties |
| AI Pedagogy | Google AI Studio | Gemini 2.0 Flash | API Key |

---

## 2. Pre-Deployment Checklist

1. **Database Provisioning**:
   - MongoDB Atlas cluster created with a dedicated user and network IP access (`0.0.0.0/0` for cloud deployment).
   - Neon PostgreSQL project created with database `sqlcompass_sandbox`.
2. **Authentication Configuration**:
   - Clerk project configured with both Development and Production instances.
   - Authorized redirect URLs configured for your Vercel domain.
3. **API Keys Ready**:
   - Google Gemini API key generated via Google AI Studio.
   - Clerk publishable key (`pk_...`) and secret key (`sk_...`).

---

## 3. Database Setup & Seeding

### 3.1. PostgreSQL Sandbox Initialization
Connect to your Neon database instance (via `psql` or Neon SQL console) and ensure the sandbox tables exist:

```sql
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  salary INT NOT NULL,
  hire_date DATE NOT NULL,
  manager_id INT REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  budget NUMERIC(12,2) NOT NULL,
  head_id INT REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  joined_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  order_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id INT REFERENCES categories(id),
  price NUMERIC(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  created_at DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  enrollment_year INT NOT NULL,
  gpa NUMERIC(3,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  instructor VARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  department VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  course_id INT REFERENCES courses(id),
  grade VARCHAR(2),
  enrolled_at DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  device VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES sessions(id),
  event_type VARCHAR(100) NOT NULL,
  occurred_at TIMESTAMP NOT NULL
);
```

### 3.2. Seed MongoDB Assignments
Run the automated seed script to populate MongoDB with all 39 curriculum challenges:

```bash
cd backend
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sqlcompass?retryWrites=true&w=majority" \
NEON_DATABASE_URL="postgres://<user>:<password>@<endpoint>.neon.tech/sqlcompass_sandbox?sslmode=require" \
npm run seed
```

The script verifies every reference query against PostgreSQL before inserting assignments into MongoDB.

---

## 4. Backend Deployment (Render)

### Option A: Using Blueprint (`render.yaml`)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your repository (`aradhyaxd-git/sql-compass`).
4. Render will parse the root `render.yaml` and configure the Web Service.
5. In the Render Dashboard, fill in the secret environment variables (`CLIENT_ORIGIN`, `CLERK_SECRET_KEY`, `MONGO_URI`, `NEON_DATABASE_URL`, `GEMINI_API_KEY`).

### Option B: Manual Web Service Setup
1. On Render, click **New +** -> **Web Service**.
2. Select repository: `aradhyaxd-git/sql-compass`.
3. Configure settings:
   - **Name**: `sql-compass-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Set **Environment Variables**:
   ```env
   NODE_ENV=production
   CLIENT_ORIGIN=https://<your-vercel-domain>.vercel.app
   CLERK_SECRET_KEY=sk_live_...
   CLERK_PUBLISHABLE_KEY=pk_live_...
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sqlcompass?retryWrites=true&w=majority
   NEON_DATABASE_URL=postgres://<user>:<password>@<neon-host>/sqlcompass_sandbox?sslmode=require
   SANDBOX_RO_URL=postgres://<user>:<password>@<neon-host>/sqlcompass_sandbox?sslmode=require
   GEMINI_API_KEY=AIzaSy...
   HINT_GRAPH=true
   HINT_CACHE_TTL_SECONDS=600
   ```
5. Click **Create Web Service**. Note the deployed URL (e.g., `https://sql-compass-api.onrender.com`).

---

## 5. Frontend Deployment (Vercel)

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your repository `aradhyaxd-git/sql-compass`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click Edit, select `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure **Environment Variables**:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   VITE_API_BASE_URL=https://sql-compass-api.onrender.com
   ```
6. Click **Deploy**.
7. Single-Page Application rewrites are automatically governed by `client/vercel.json`, preventing 404s on browser reloads on `/dashboard`, `/attempt/:id`, or `/profile`.

---

## 6. Post-Deployment Verification

### 6.1. Health & Dependency Probe
Test readiness from your terminal:
```bash
curl -i https://sql-compass-api.onrender.com/health/deep
```
Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "postgres": "ok",
    "mongodb": "ok",
    "server": "ok"
  },
  "timestamp": "2026-10-22T09:00:00.000Z"
}
```

### 6.2. Metrics Scraping
Verify Prometheus metrics are accumulating:
```bash
curl -i https://sql-compass-api.onrender.com/metrics
```

### 6.3. CORS Verification
Verify cross-origin requests from your Vercel frontend succeed:
```bash
curl -i -X OPTIONS https://sql-compass-api.onrender.com/api/assignments \
  -H "Origin: https://<your-vercel-domain>.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```
Ensure `Access-Control-Allow-Origin` returns your Vercel domain.

---

## 7. Local Production Simulation (Docker Compose)

To test the complete stack locally using Docker:

```bash
# Start all containers in background
docker compose up -d --build

# Verify health
curl http://localhost:5000/health/deep

# Run tests inside container
docker exec -it sql_compass_backend npm test

# Stop stack
docker compose down
```
