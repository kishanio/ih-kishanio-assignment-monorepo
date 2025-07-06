# Indiahikes MedusaJS Assignment

A full-stack e-commerce solution built with MedusaJS backend and Next.js storefront for the Indiahikes technical assessment.

## 📋 Assignment Brief

**Objective:** Set up a MedusaJS project locally, consume the Medusa backend, list products, build a real cart, and manage persistent state.

### Requirements Met ✅
- Connected to local Medusa backend (no mocks)
- Product listing page with real product data
- "Add to Cart" functionality implementation
- Real cart ID storage from Medusa
- Cart persistence across page reloads
- Cart page showing all items with correct quantities and pricing

## 🏗️ Project Structure

This is a monorepo containing:

```
├── medusajs-backend/     # MedusaJS backend server
├── nextjs-storefront/    # Next.js frontend application
└── README.md            # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v20 or higher)
- PostgreSQL database (Note down your database connection details)
- npm package manager

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd medusajs-backend
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your PostgreSQL connection details:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
   ```

4. Run database migration, seeding, and create admin user:
   ```bash
   # Note The bootstrap is not designed to be atomic. 
   # If something goes wrong you would have to delete the DB and recreate it to resume.

   npm run bootstrap
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   
   The backend will be available at `http://localhost:5050`

### Admin Setup & Publishable Key

1. Open your browser and go to `http://localhost:5050/app`
2. Login with the admin credentials:
   - **Email:** `admin@indiahikes.com`
   - **Password:** `qwertyuiop`
3. Navigate to **Settings > Publishable API Keys** in the admin panel `http://localhost:5050/app/settings/publishable-api-keys`
4. Copy the **Publishable Key**

### Storefront Configuration

1. Navigate to the frontend folder:
   ```bash
   cd nextjs-storefront
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with the publishable key from step 4:
   ```env
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<replace_with_your_publishable_key_from_medusa_admin>
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   
   The storefront will be available at `http://localhost:5051`


**Submitted by:** Kishan Rameshchandra Thobhani 
**Submission Date:** July 6, 2025  
**Organization:** Indiahikes