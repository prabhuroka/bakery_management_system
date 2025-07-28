#####Bakery Management System - Backend API
Overview
This is a comprehensive backend API for a bakery management system, providing endpoints for:

Employee authentication and authorization

Product and inventory management

Order processing

Customer management

Analytics and reporting

Real-time notifications via WebSocket

Technologies Used
Node.js

Express.js

MySQL

JWT Authentication

WebSocket for real-time notifications

Docker for containerization

OpenAPI/Swagger for documentation

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14 or higher)

npm or yarn

MySQL (v8.0 or higher) or Docker

Git

Getting Started
1. Clone the Repository
bash
git clone https://github.com/prabhuroka/bakery_management_system
cd bakery-management-api

3. Install Dependencies
bash
npm install
4. Environment Setup
Create a .env file in the root directory with the following variables:

env
NODE_ENV=development
PORT=1000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=bakery_database

JWT_SECRET=your_secure_jwt_secret
4. Database Setup
Option A: Using Docker (Recommended)
bash
docker-compose up -d
This will start:

MySQL database container

API server container

Swagger UI for API documentation

Option B: Manual Database Setup
Create a MySQL database:

sql
CREATE DATABASE bakery_database;
Import the database schema:

bash
mysql -u your_db_user -p bakery_database < database.sql
5. Run the Application
For development:

bash
npm run dev
For production:

bash
npm start
The API will be available at http://localhost:1000

API Documentation
After starting the application, you can access the API documentation at:

Swagger UI: http://localhost:8080

OpenAPI Spec: http://localhost:1000/api-docs.yml

Project Structure
text
bakery-management-api/
├── app.js                # Main application entry point
├── config/
│   ├── database.js       # Database connection configuration
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── security.js       # Security middleware
│   └── audit.js          # Audit logging middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── products.js       # Product management routes
│   ├── orders.js         # Order processing routes
│   ├── employees.js      # Employee management routes
│   ├── inventory.js      # Inventory management routes
│   └── ...               # Other route files
├── websocket.js          # WebSocket server implementation
├── tasks.js              # Scheduled tasks
├── backup.js             # Database backup utilities
├── database.sql          # Database schema and seed data
├── api-docs.yml          # OpenAPI specification
├── docker-compose.yml    # Docker configuration
├── package.json
└── README.md
Available Endpoints
The API is organized into several modules:

Authentication: /api/auth

Products: /api/products

Orders: /api/orders

Employees: /api/employees

Inventory: /api/inventory

Analytics: /api/analytics

Notifications: /api/notifications

Customers: /api/customers

Reports: /api/reports

Audit Logs: /api/audit-logs

Roles: /api/roles

Development Workflow
Branching:

Create a new branch for each feature/bugfix: git checkout -b feature/your-feature-name

Testing:

Currently uses manual testing (Postman/Insomnia)

Add tests for new features

Commit Messages:

Use descriptive commit messages following conventional commits

Pull Requests:

Create PRs for code review before merging to main

Deployment
Docker Deployment
bash
docker-compose up -d --build
Manual Deployment
Build the application:

bash
npm install --production
Start the server:

bash
npm start
Environment Variables
Variable	Description	Default
NODE_ENV	Application environment	development
PORT	Port the server listens on	1000
DB_HOST	Database host	localhost
DB_PORT	Database port	3306
DB_USER	Database username	-
DB_PASSWORD	Database password	-
DB_NAME	Database name	bakery_database
JWT_SECRET	Secret for JWT token generation	-


Default Admin Credentials
Email: john@bakery.com

Password: password123 (for development only)


####Bakery Management System - Customer facing Website (bakery-website)
This is the frontend website for Sweet Delights Bakery, built with React and TypeScript. The website showcases the bakery's products, tells their story, and provides contact information.

Technologies Used
React (v18+)

TypeScript

React Bootstrap

CSS Modules

Axios for API calls

React Router for navigation

Features
Responsive design for all devices

Product menu with categories

About page with bakery story

Contact page with form

Loading states and error handling

Modern UI with animations

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v16 or higher)

npm or yarn

Git

Getting Started
1. Clone the Repository
git clone https://github.com/prabhuroka/bakery_management_system  (Already cloned if you followed above steps)
cd bakery-website
3. Install Dependencies
bash
npm install
4. Environment Setup
Create a .env file in the root directory with the following variables:

env
REACT_APP_API_URL=http://localhost:1000/api
4. Run the Development Server
bash
npm start
The website will be available at http://localhost:3000

Project Structure
text
bakery-website/
├── public/                  # Static files
├── src/
│   ├── components/          # Reusable components
│   │   ├── ErrorMessage.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── MenuCategory.tsx
│   │   └── ProductCard.tsx
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Menu.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── services/            # API services
│   │   ├── api.ts
│   │   └── types.ts
│   ├── styles/              # Global styles
│   │   ├── main.css
│   │   └── variables.css
│   ├── App.tsx              # Main app component
│   └── index.tsx            # Entry point
├── package.json
└── README.md
Available Scripts
In the project directory, you can run:

npm start
Runs the app in development mode.
Open http://localhost:3000 to view it in the browser.

npm test
Launches the test runner in interactive watch mode.

npm run build
Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for best performance.

Styling Approach
The project uses a combination of:

CSS Variables: Defined in variables.css for consistent theming

Global Styles: In main.css for layout and base styles

Bootstrap: For responsive grid and components

Custom CSS: For bakery-specific styling

Component Documentation
Core Components
Header: Responsive navigation bar with links to all pages

Footer: Copyright information and links

ProductCard: Displays individual product information

MenuCategory: Groups products by category

LoadingSpinner: Animated spinner for loading states

ErrorMessage: Displays error messages to users

Pages
Home: Hero section and featured categories

Menu: Displays all bakery products organized by category

About: Tells the bakery's story and philosophy

Contact: Contact information and message form

API Integration
The frontend communicates with the backend API (documented separately) to:

Fetch menu items (/api/products/website)

Fetch categories (/api/products/categories)

Responsive Design
The website is fully responsive and adapts to:

Mobile (up to 768px)

Tablet (768px - 992px)

Desktop (992px and up)

Key responsive features:

Flexible grid layouts

Responsive typography

Adaptive navigation

Mobile-friendly forms


#### Bakery POS System - Staff Application (staff-frontend)
Overview
This is a Point of Sale (POS) system designed for bakery staff, featuring order management, product inventory, employee management, and reporting capabilities. The application includes role-based access control with different permissions for owners, managers, and regular staff.

Features
POS Interface: Add products to orders, manage quantities, and process payments

Order Management: View, complete, or cancel pending orders

Product Management: Add, edit, and track product inventory

Employee Management: Create and manage employee accounts with role assignments

Reporting: Generate sales reports and view cancelled orders

Customer Management: Search for customers or create new ones

Audit Logs: Track system activities and changes

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14 or higher)

npm (v6 or higher) or yarn

Access to the backend API (either locally or remote)

Installation
Clone the repository:

bash
git clone https://github.com/prabhuroka/bakery_management_system  (Already cloned if you followed above steps)
cd staff-frontend
Install dependencies:

bash
npm install
# or
yarn install
Create a .env file in the root directory with the following variables:

text
REACT_APP_API_URL=http://localhost:1000/api
Start the development server:

bash
npm start
# or
yarn start
Available Scripts
In the project directory, you can run:

npm start: Runs the app in development mode

npm test: Launches the test runner

npm run build: Builds the app for production

npm run eject: Ejects from Create React App (advanced)

Project Structure
text
bakery-pos/
├── public/                  # Static files
├── src/
│   ├── components/          # Reusable components
│   ├── pages/               # Main application pages
│   ├── services/            # API and authentication services
│   ├── styles/              # CSS stylesheets
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Application entry point
├── .env                     # Environment variables
├── package.json             # Project dependencies and scripts
└── README.md                # This file
Development Notes
Authentication
The system uses JWT for authentication. Default login credentials:

Email: john@bakery.com

Password: password123

Roles and Permissions
Owner: Full access to all features including employee management and reports

Manager: Access to POS, orders, and limited product management

Employee: Basic access to POS and order management

API Integration
The application expects a backend API with specific endpoints. Ensure your backend implements:

Authentication endpoints (/auth/employee/login)

Product management endpoints (/products, /products/categories)

Order management endpoints (/orders, /orders/status/*)

Employee management endpoints (/employees, /roles)

Reporting endpoints (/reports/sales, /reports/cancelled-orders)

Styling
The application uses a custom CSS stylesheet (pos.css) with some Ant Design overrides. For new components, follow the existing styling patterns.

Deployment
To build the application for production:

bash
npm run build
This will create an optimized build in the build/ folder that can be deployed to any static hosting service (Netlify, Vercel, AWS S3, etc.).



Have a great day running this project.




