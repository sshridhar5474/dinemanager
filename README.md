# DineManager

## Overview
DineManager is a web-based restaurant operations management system.  
It simulates real-world workflows including staff management, inventory tracking, order processing, and table-based billing.

The application is built using React and demonstrates dynamic UI behavior, state management, and real-time data simulation.

---

## Live Demo

Access the application here:

https://dinemanager-eight.vercel.app/

### Login Credentials
Username: admin  
Password: admin

---

## How to Run Locally

### Prerequisites
- Node.js (v16 or higher)
- npm

### Steps

# Clone repository
git clone https://github.com/sshridhar5474/dinemanager.git

# Navigate to project folder
cd dinemanager

# Install dependencies
npm install

# Start development server
npm run dev

Open in browser:
http://localhost:5173

---

## JavaScript Features

### 1. Authentication
- Login using provided credentials
- Data persists during session
- Logging out resets all data

### 2. Dashboard
- Real-time overview of operations
- Staff presence ratio
- Inventory alerts
- Order statistics
- Activity chart
- Average order completion time indicator

### 3. Staff Management
- Toggle staff attendance (present/absent)
- Filter and view different roles

### 4. Inventory
- Track ingredient quantities
- Low stock and out-of-stock detection
- Restocking functionality
- Automatic updates when orders are placed

### 5. Orders
- Select table before placing orders
- Place orders using menu items
- Orders move automatically through stages:
  Pending → Preparing → Ready → Completed
- Completed orders are removed after a short duration

### 6. Table Management
- View all tables with live data
- See items ordered per table
- Track total bill
- Click a table to view detailed orders
- Generate bill to clear table

---

## Notes
- Data is stored in browser localStorage
- Designed as a simulation of restaurant operations
- Built for learning web programming concepts using React, CSS, and JavaScript
