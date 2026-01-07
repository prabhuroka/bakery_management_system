# Bakery Management System

A full-stack bakery management solution consisting of a backend API, a customer-facing website, and a staff POS system.

---

## Overview

This repository contains three main components:
- Backend API for managing bakery operations
- Customer-facing website for showcasing products
- Staff POS application for internal operations

---

## Backend API

<details>
<summary><strong>Bakery Management System - Backend API</strong></summary>

### Overview

This is a comprehensive backend API for a bakery management system, providing endpoints for:

- Employee authentication and authorization
- Product and inventory management
- Order processing
- Customer management
- Analytics and reporting
- Real-time notifications via WebSocket

---

### Technologies Used

- Node.js
- Express.js
- MySQL
- JWT Authentication
- WebSocket for real-time notifications
- Docker for containerization
- OpenAPI/Swagger for documentation

---

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MySQL (v8.0 or higher) or Docker
- Git

---

### Getting Started

#### 1. Clone the Repository

git clone https://github.com/prabhuroka/bakery_management_system
cd bakery-management-api



---

#### 2. Install Dependencies

npm install



---

#### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

NODE_ENV=development
PORT=1000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=bakery_database

JWT_SECRET=your_secure_jwt_secret



---

#### 4. Database Setup

**Option A: Using Docker (Recommended)**

docker-compose up -d


This will start:
- MySQL database container
- API server container
- Swagger UI for API documentation

**Option B: Manual Database Setup**

Create a MySQL database:

CREATE DATABASE bakery_database;



Import the database schema:

mysql -u your_db_user -p bakery_database < database.sql


---

#### 5. Run the Application

For development:

npm run dev



For production:

npm start


The API will be available at:
http://localhost:1000


---

### API Documentation

After starting the application, you can access the API documentation at:

- Swagger UI: http://localhost:8080  
- OpenAPI Spec: http://localhost:1000/api-docs.yml  

---

### Available Endpoints

The API is organized into several modules:

- Authentication: /api/auth
- Products: /api/products
- Orders: /api/orders
- Employees: /api/employees
- Inventory: /api/inventory
- Analytics: /api/analytics
- Notifications: /api/notifications
- Customers: /api/customers
- Reports: /api/reports
- Audit Logs: /api/audit-logs
- Roles: /api/roles

---

### Development Workflow

**Branching**

Create a new branch for each feature/bugfix:
git checkout -b feature/your-feature-name


**Testing**

- Currently uses manual testing (Postman/Insomnia)
- Add tests for new features

**Commit Messages**

- Use descriptive commit messages following conventional commits

**Pull Requests**

- Create PRs for code review before merging to main

---

### Deployment

**Docker Deployment**

docker-compose up -d --build



**Manual Deployment**

npm install --production
npm start


---

### Environment Variables

NODE_ENV
PORT
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET


---

### Default Admin Credentials

Email: john@bakery.com  
Password: password123 (for development only)

</details>

---

## Customer-Facing Website

<details>
<summary><strong>Bakery Management System - Customer Facing Website (bakery-website)</strong></summary>

### Overview

This is the frontend website for Sweet Delights Bakery, built with React and TypeScript. The website showcases the bakery's products, tells their story, and provides contact information.

---

### Technologies Used

- React (v18+)
- TypeScript
- React Bootstrap
- CSS Modules
- Axios for API calls
- React Router for navigation

---

### Features

- Responsive design for all devices
- Product menu with categories
- About page with bakery story
- Contact page with form
- Loading states and error handling
- Modern UI with animations

---

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

---

### Getting Started

#### 1. Clone the Repository

git clone https://github.com/prabhuroka/bakery_management_system
cd bakery-website


---

#### 2. Install Dependencies

npm install



---

#### 3. Environment Setup

Create a `.env` file with:

REACT_APP_API_URL=http://localhost:1000/api



---

#### 4. Run the Development Server

npm start


The website will be available at:
http://localhost:3000



---

### Available Scripts

- npm start
- npm test
- npm run build

---

### Styling Approach

- CSS Variables
- Global Styles
- Bootstrap
- Custom CSS

---

### Pages

- Home
- Menu
- About
- Contact

---

### API Integration

- Fetch menu items (/api/products/website)
- Fetch categories (/api/products/categories)

---

### Responsive Design

Supports:
- Mobile
- Tablet
- Desktop

</details>

---

## Staff POS Application

<details>
<summary><strong>Bakery POS System - Staff Application (staff-frontend)</strong></summary>

### Overview

This is a Point of Sale (POS) system designed for bakery staff, featuring order management, product inventory, employee management, and reporting capabilities.

---

### Features

- POS Interface
- Order Management
- Product Management
- Employee Management
- Reporting
- Customer Management
- Audit Logs

---

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to the backend API

---

### Installation

git clone https://github.com/prabhuroka/bakery_management_system
cd staff-frontend
npm install


---

### Environment Setup

REACT_APP_API_URL=http://localhost:1000/api



---

### Start the Application

npm start


---

### Available Scripts

- npm start
- npm test
- npm run build
- npm run eject

---

### Authentication

Email: john@bakery.com  
Password: password123  

---

### Roles and Permissions

- Owner
- Manager
- Employee

---

### API Integration

- /auth/employee/login
- /products
- /orders
- /employees
- /reports

---

### Styling

Uses a custom CSS stylesheet (pos.css) with some Ant Design overrides.

---

### Deployment

npm run build

This will create an optimized build in the build/ folder.

</details>

---

Have a great day running this project.
