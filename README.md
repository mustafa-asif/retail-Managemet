# Save Mart Retail Management System

This is a full-stack retail management system for "Save Mart". It consists of a React/Vite frontend and a NestJS backend connected to an Oracle Database.

## Features

- **Dashboard**: High-level KPIs, revenue charts, top products.
- **Stores**: Manage branch locations.
- **Customers**: Manage customer database.
- **Products**: Manage product catalog.
- **Inventory**: Check and update stock levels, refresh Oracle Materialized Views.
- **Sales**: View historical sales and process new transactions via Oracle stored procedures.
- **Analytics**: Store summaries, best sellers, monthly sales, and set operations on products.
- **Audit Log**: View automatically generated inventory audit logs.

---

## 🚀 How to Run Locally

To run the application locally, you will need to start both the **Backend API** and the **Frontend React Application**.

### Prerequisites

- Node.js (v18+)
- Local or remote Oracle Database (with the Save Mart schema imported)
- Git

### 1. Setup the Backend (NestJS + Oracle)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   - Copy the example `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Open `backend/.env` and enter your Oracle Database connection details (Host, Port, User, Password, Service Name).

4. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *The backend should now be running at `http://localhost:5000/api`*

---

### 2. Setup the Frontend (React + Vite)

Open a **new terminal tab/window** and stay in the root directory (or navigate back to it):

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   - Copy the example `.env.example` file:
     ```bash
     cp .env.example .env
     ```
   - The default configuration expects the backend to be running on `http://localhost:5000/api`. If your backend runs on a different host or port, update `VITE_API_BASE_URL` in the `.env` file.

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running locally, typically at `http://localhost:5173` or `http://localhost:3000`. Open the URL provided in your terminal in your browser.*

---

## Architecture Overview

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Recharts, Axios, Lucide React Icons.
- **Backend**: NestJS, Node.js, `oracledb` node module.
- **Database**: Oracle SQL Database (Handles referential integrity, materialized views for inventory caching, and stored procedures for checkout transactions).
