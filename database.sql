DROP DATABASE IF EXISTS bakery_database;

-- Create database
CREATE DATABASE IF NOT EXISTS bakery_database;
USE bakery_database;

-- Roles table
CREATE TABLE Role (
  Role_ID INT AUTO_INCREMENT PRIMARY KEY,
  Role_Name VARCHAR(50) NOT NULL UNIQUE,
  Description VARCHAR(255)
);

-- Employees table
CREATE TABLE Employee (
  Employee_ID INT AUTO_INCREMENT PRIMARY KEY,
  First_Name VARCHAR(50) NOT NULL,
  Last_Name VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Phone VARCHAR(20),
  Hire_Date DATE NOT NULL,
  Active BOOLEAN DEFAULT TRUE,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employee-Role junction table
CREATE TABLE Employee_Role (
  Employee_ID INT NOT NULL,
  Role_ID INT NOT NULL,
  PRIMARY KEY (Employee_ID, Role_ID),
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE,
  FOREIGN KEY (Role_ID) REFERENCES Role(Role_ID) ON DELETE CASCADE
);

-- Employee shifts table
CREATE TABLE Employee_Shift (
  Shift_ID INT AUTO_INCREMENT PRIMARY KEY,
  Employee_ID INT NOT NULL,
  Shift_Date DATE NOT NULL,
  Shift_Begin DATETIME NOT NULL,
  Shift_End DATETIME,
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE
);

-- Customers table
CREATE TABLE Customer (
  Customer_ID INT AUTO_INCREMENT PRIMARY KEY,
  First_Name VARCHAR(50) NOT NULL,
  Last_Name VARCHAR(50) NOT NULL,
  Email VARCHAR(100),
  Phone VARCHAR(20),
  Loyalty_Points INT DEFAULT 0,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Product categories
CREATE TABLE Category (
  Category_ID INT AUTO_INCREMENT PRIMARY KEY,
  Category_Name VARCHAR(50) NOT NULL UNIQUE,
  Description VARCHAR(255)
);

-- Allergens table
CREATE TABLE Allergen (
  Allergy_ID INT AUTO_INCREMENT PRIMARY KEY,
  Description VARCHAR(100) NOT NULL UNIQUE
);

-- Ingredients table
CREATE TABLE Ingredient (
  Ingredient_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL UNIQUE,
  Description VARCHAR(255),
  Stock_Level DECIMAL(10,2) NOT NULL DEFAULT 0,
  Minimum_Level DECIMAL(10,2) NOT NULL DEFAULT 10,
  Unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  Expiry_Date DATE,
  Supplier_Info VARCHAR(255)
);

-- Products table
CREATE TABLE Product (
  Product_ID INT AUTO_INCREMENT PRIMARY KEY,
  Product_Name VARCHAR(100) NOT NULL,
  Description TEXT,
  Category_ID INT,
  Price DECIMAL(10,2) NOT NULL,
  Cost DECIMAL(10,2),
  Product_Stock_Level INT NOT NULL DEFAULT 0,
  Image_URL VARCHAR(255),
  Active BOOLEAN DEFAULT TRUE,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID) ON DELETE SET NULL
);

-- Product-Ingredient junction table
CREATE TABLE Product_Ingredient (
  Product_ID INT NOT NULL,
  Ingredient_ID INT NOT NULL,
  Quantity DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (Product_ID, Ingredient_ID),
  FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE,
  FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID) ON DELETE CASCADE
);

-- Product-Allergen junction table
CREATE TABLE Product_Allergen_Info (
  Product_ID INT NOT NULL,
  Allergy_ID INT NOT NULL,
  PRIMARY KEY (Product_ID, Allergy_ID),
  FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE,
  FOREIGN KEY (Allergy_ID) REFERENCES Allergen(Allergy_ID) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE `Order` (
  Order_ID INT AUTO_INCREMENT PRIMARY KEY,
  Employee_ID INT NOT NULL,
  Customer_ID INT,
  Order_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Discount DECIMAL(5,2) DEFAULT 0,
  Payment_Method ENUM('cash', 'credit') NOT NULL,
  Total_Amount DECIMAL(10,2) NOT NULL,
  Notes TEXT,
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID),
  FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE SET NULL
);

-- Product-Order junction table
CREATE TABLE Product_Order (
  Product_ID INT NOT NULL,
  Order_ID INT NOT NULL,
  Quantity INT NOT NULL,
  PRIMARY KEY (Product_ID, Order_ID),
  FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID),
  FOREIGN KEY (Order_ID) REFERENCES `Order`(Order_ID) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE Payment (
  Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
  Order_ID INT NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Payment_Method ENUM('cash', 'credit') NOT NULL,
  Payment_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Employee_ID INT NOT NULL,
  FOREIGN KEY (Order_ID) REFERENCES `Order`(Order_ID) ON DELETE CASCADE,
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID)
);

-- Promotions table
CREATE TABLE Promotion (
  Promotion_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Description TEXT,
  Discount_Percentage DECIMAL(5,2) NOT NULL,
  Start_Date DATE NOT NULL,
  End_Date DATE NOT NULL,
  Active BOOLEAN DEFAULT TRUE
);

-- Product-Promotion junction table
CREATE TABLE Product_Promotion (
  Product_ID INT NOT NULL,
  Promotion_ID INT NOT NULL,
  PRIMARY KEY (Product_ID, Promotion_ID),
  FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE,
  FOREIGN KEY (Promotion_ID) REFERENCES Promotion(Promotion_ID) ON DELETE CASCADE
);

-- Inventory adjustments table
CREATE TABLE Inventory_Adjustment (
  Adjustment_ID INT AUTO_INCREMENT PRIMARY KEY,
  Ingredient_ID INT NOT NULL,
  Employee_ID INT NOT NULL,
  Quantity DECIMAL(10,2) NOT NULL,
  Reason VARCHAR(255),
  Adjustment_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID),
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID)
);

-- Equipment table
CREATE TABLE Equipment (
  Equipment_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Description TEXT,
  Purchase_Date DATE,
  Maintenance_Schedule VARCHAR(100),
  Status ENUM('operational', 'maintenance', 'retired') DEFAULT 'operational'
);

-- Product-Equipment junction table
CREATE TABLE Product_Equipment (
  Product_ID INT NOT NULL,
  Equipment_ID INT NOT NULL,
  PRIMARY KEY (Product_ID, Equipment_ID),
  FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE,
  FOREIGN KEY (Equipment_ID) REFERENCES Equipment(Equipment_ID) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE Notification (
  Notification_ID INT AUTO_INCREMENT PRIMARY KEY,
  Type ENUM('inventory', 'shift', 'order', 'system') NOT NULL,
  Message TEXT NOT NULL,
  Related_ID INT,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Read_At DATETIME
);

-- Notification read status table
CREATE TABLE Notification_Read (
  Employee_ID INT NOT NULL,
  Notification_ID INT NOT NULL,
  Read_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Employee_ID, Notification_ID),
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE,
  FOREIGN KEY (Notification_ID) REFERENCES Notification(Notification_ID) ON DELETE CASCADE
);

-- Daily summaries table
CREATE TABLE Daily_Summary (
  Summary_ID INT AUTO_INCREMENT PRIMARY KEY,
  Summary_Date DATE NOT NULL UNIQUE,
  Total_Orders INT NOT NULL,
  Total_Sales DECIMAL(10,2) NOT NULL,
  Cash_Sales DECIMAL(10,2) NOT NULL,
  Credit_Sales DECIMAL(10,2) NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE Settings (
  Setting_ID INT AUTO_INCREMENT PRIMARY KEY,
  Setting_Name VARCHAR(50) NOT NULL UNIQUE,
  Setting_Value TEXT,
  Description VARCHAR(255),
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert roles
INSERT INTO Role (Role_Name, Description) VALUES 
('owner', 'Full system access and administration'),
('manager', 'Can manage employees and inventory'),
('employee', 'Can process orders and view products'),
('baker', 'Prepares bakery products'),
('cashier', 'Handles customer transactions');

-- Insert employees (passwords are hashed 'password123')
INSERT INTO Employee (First_Name, Last_Name, Email, Password, Phone, Hire_Date, Active) VALUES 
('John', 'Smith', 'john@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0101', '2020-01-15', TRUE),
('Sarah', 'Johnson', 'sarah@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0102', '2020-03-22', TRUE),
('Michael', 'Williams', 'michael@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0103', '2021-05-10', TRUE),
('Emily', 'Brown', 'emily@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0104', '2021-07-18', TRUE),
('David', 'Jones', 'david@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0105', '2022-01-05', TRUE),
('Jessica', 'Garcia', 'jessica@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0106', '2022-03-30', TRUE),
('Daniel', 'Miller', 'daniel@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0107', '2022-06-12', TRUE),
('Jennifer', 'Davis', 'jennifer@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0108', '2022-09-25', TRUE),
('Robert', 'Rodriguez', 'robert@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0109', '2023-01-08', TRUE),
('Lisa', 'Martinez', 'lisa@bakery.com', '$2b$10$X5w3Zz2q1UJ7QO5V8pYbUeN9n6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F', '555-0110', '2023-04-15', TRUE);

-- Assign roles to employees
INSERT INTO Employee_Role (Employee_ID, Role_ID) VALUES 
(1, 1), (1, 2), -- John is owner and manager
(2, 2), (2, 4), -- Sarah is manager and baker
(3, 3), (3, 5), -- Michael is employee and cashier
(4, 3), (4, 4), -- Emily is employee and baker
(5, 3), (5, 5), -- David is employee and cashier
(6, 3),         -- Jessica is employee
(7, 3), (7, 4), -- Daniel is employee and baker
(8, 3), (8, 5), -- Jennifer is employee and cashier
(9, 3), (9, 4), -- Robert is employee and baker
(10, 3);        -- Lisa is employee


-- Insert employee shifts
INSERT INTO Employee_Shift (Employee_ID, Shift_Date, Shift_Begin, Shift_End) VALUES 
(1, '2023-06-01', '2023-06-01 08:00:00', '2023-06-01 16:00:00'),
(2, '2023-06-01', '2023-06-01 07:00:00', '2023-06-01 15:00:00'),
(3, '2023-06-01', '2023-06-01 09:00:00', '2023-06-01 17:00:00'),
(4, '2023-06-01', '2023-06-01 06:00:00', '2023-06-01 14:00:00'),
(5, '2023-06-02', '2023-06-02 08:00:00', '2023-06-02 16:00:00'),
(6, '2023-06-02', '2023-06-02 07:00:00', '2023-06-02 15:00:00'),
(7, '2023-06-02', '2023-06-02 09:00:00', '2023-06-02 17:00:00'),
(8, '2023-06-03', '2023-06-03 08:00:00', '2023-06-03 16:00:00'),
(9, '2023-06-03', '2023-06-03 07:00:00', '2023-06-03 15:00:00'),
(10, '2023-06-03', '2023-06-03 09:00:00', '2023-06-03 17:00:00');

-- Insert customers
INSERT INTO Customer (First_Name, Last_Name, Email, Phone, Loyalty_Points) VALUES 
('Alice', 'Thompson', 'alice@example.com', '555-0201', 120),
('Bob', 'Wilson', 'bob@example.com', '555-0202', 85),
('Carol', 'Moore', 'carol@example.com', '555-0203', 200),
('Dave', 'Taylor', 'dave@example.com', '555-0204', 35),
('Eve', 'Anderson', 'eve@example.com', '555-0205', 150),
('Frank', 'Thomas', 'frank@example.com', '555-0206', 70),
('Grace', 'Jackson', 'grace@example.com', '555-0207', 95),
('Henry', 'White', 'henry@example.com', '555-0208', 180),
('Ivy', 'Harris', 'ivy@example.com', '555-0209', 25),
('Jack', 'Martin', 'jack@example.com', '555-0210', 110);

-- Insert categories
INSERT INTO Category (Category_Name, Description) VALUES 
('Bread', 'Various types of bread'),
('Pastry', 'Sweet and savory pastries'),
('Cake', 'Whole cakes and slices'),
('Cookie', 'Different cookie varieties'),
('Sandwich', 'Pre-made sandwiches'),
('Breakfast', 'Breakfast items'),
('Gluten-Free', 'Gluten-free options'),
('Vegan', 'Vegan bakery items'),
('Seasonal', 'Seasonal specials'),
('Beverage', 'Coffee, tea and other drinks');

-- Insert allergens
INSERT INTO Allergen (Description) VALUES 
('Gluten'),
('Dairy'),
('Eggs'),
('Nuts'),
('Soy'),
('Sesame'),
('Sulfites'),
('Lupin'),
('Mustard'),
('Shellfish');

-- Insert ingredients
INSERT INTO Ingredient (Name, Description, Stock_Level, Minimum_Level, Unit, Expiry_Date, Supplier_Info) VALUES 
('Wheat Flour', 'High quality wheat flour', 50.00, 20.00, 'kg', '2023-12-01', 'Local Flour Mill'),
('Sugar', 'Granulated white sugar', 30.00, 15.00, 'kg', '2024-06-01', 'Sweet Sugar Co.'),
('Butter', 'Unsalted butter', 25.00, 10.00, 'kg', '2023-09-15', 'Dairy Delights'),
('Eggs', 'Large grade A eggs', 120.00, 60.00, 'units', '2023-07-01', 'Fresh Egg Farms'),
('Milk', 'Whole milk', 20.00, 10.00, 'L', '2023-07-10', 'Dairy Delights'),
('Yeast', 'Active dry yeast', 5.00, 2.00, 'kg', '2024-01-01', 'Baking Essentials'),
('Salt', 'Fine sea salt', 10.00, 5.00, 'kg', '2025-01-01', 'Salt Masters'),
('Chocolate Chips', 'Semi-sweet chocolate chips', 15.00, 8.00, 'kg', '2023-11-01', 'Choco World'),
('Vanilla Extract', 'Pure vanilla extract', 2.00, 1.00, 'L', '2024-03-01', 'Flavor King'),
('Almond Flour', 'Fine ground almond flour', 8.00, 4.00, 'kg', '2023-10-01', 'Nutty Goodness');

-- Insert products
INSERT INTO Product (Product_Name, Description, Category_ID, Price, Cost, Product_Stock_Level, Image_URL, Active) VALUES 
('Sourdough Loaf', 'Traditional sourdough bread', 1, 5.99, 2.50, 4, 'https://www.allrecipes.com/thmb/DCWXlgmQnMJTPiwFiYm_i3hlCbY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/260540-Chef-Johns-Sourdough-Bread-DDMFS-004-4x3-6791a75a5d804ec28424d04756054c5b.jpg', 1),
('Croissant', 'Buttery French croissant', 2, 3.50, 1.20, 30, 'https://www.theflavorbender.com/wp-content/uploads/2020/05/French-Croissants-SM-2363.jpg', 1),
('Chocolate Chip Cookie', 'Classic cookie with chocolate chips', 4, 2.50, 0.80, 50, 'https://images.aws.nestle.recipes/resized/5b069c3ed2feea79377014f6766fcd49_Original_NTH_Chocolate_Chip_Cookie_1080_850.jpg', 1),
('Red Velvet Cake Slice', 'Moist red velvet cake with cream cheese frosting', 3, 4.99, 2.00, 17, 'https://bakerbynature.com/wp-content/uploads/2016/11/untitled-17-of-74-3-1.jpg', 1),
('Ham & Cheese Croissant', 'Savory croissant with ham and cheese', 5, 4.50, 1.80, 22, 'https://www.thegunnysack.com/wp-content/uploads/2014/07/Ham_and_Cheese_Croissant.jpg', 1),
('Blueberry Muffin', 'Fresh muffin with blueberries', 6, 3.25, 1.10, 27, 'https://www.rainbownourishments.com/wp-content/uploads/2022/03/vegan-blueberry-muffins-1-1.jpg', 1),
('Gluten-Free Brownie', 'Rich chocolate brownie, gluten-free', 7, 3.75, 1.50, 18, 'https://media.gettyimages.com/id/1199650543/photo/stack-of-homemade-gluten-free-brownies-with-chocolate-and-coffee-glazing.jpg?s=612x612&w=gi&k=20&c=rRNEBYq6ciTm0VgamPP1kfT4nNqoSX7L8aHbs0eMq2U=', 1),
('Vegan Banana Bread', 'Moist banana bread, vegan recipe', 8, 4.25, 1.60, 10, 'https://www.ambitiouskitchen.com/wp-content/uploads/2021/03/Vegan-Banana-Bread-5-750x750.jpg', 1),
('Pumpkin Spice Latte', 'Seasonal pumpkin spice latte', 10, 4.50, 1.20, 0, 'https://cdn.loveandlemons.com/wp-content/uploads/2022/09/pumpkin-spice-latte-1.jpg', 1),
('Cinnamon Roll', 'Sweet roll with cinnamon filling', 2, 3.99, 1.30, 23, 'https://schoolnightvegan.com/wp-content/uploads/2024/08/vegan-cinnamon-rolls-34.jpg', 1),
('Coke', NULL, 10, 1.00, NULL, 200, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29jYSUyMGNvbGF8ZW58MHx8MHx8fDA%3D', 1),
('Pepsi', 'Chilled', 10, 1.00, NULL, 17, 'https://www.shutterstock.com/image-photo/poznan-pol-aug-7-2024-260nw-2505223157.jpg', 1),
('Gatorade', NULL, 10, 2.99, NULL, 100, 'https://pepsihomedelivery.com/wp-content/uploads/2020/04/gat-min-lin.jpeg', 1),
('Hawaiian Rolls', NULL, 1, 2.99, NULL, 25, 'https://inquiringchef.com/wp-content/uploads/2019/08/Garlic-Bread-Hawaiian-Rolls_square-2052.jpg', 1),
('Pumpernickel', NULL, 1, 3.99, NULL, 25, 'https://grainsinsmallplaces.net/wp-content/uploads/2022/12/Fresh-milled-pumpernickel-bread-from-rye-500x500.png', 1),
('Focaccia', NULL, 1, 1.99, NULL, 20, 'https://media.istockphoto.com/id/469431454/photo/italian-focaccia-bread-with-rosemary-and-garlic.jpg?s=612x612&w=0&k=20&c=KGjJ1bFKGP__lMmwZWK6qQxAjFfWJPy3aeCbeuG-Yos=', 1),
('Scones', NULL, 6, 3.99, NULL, 19, 'https://media.istockphoto.com/id/1302833389/photo/blueberry-scones.jpg?s=612x612&w=0&k=20&c=C967P8KPWMmJabeUMuoz7Ku-6tF8iNMMIXY9GD3eVpQ=', 1),
('Bagel with cheese cream', NULL, 6, 2.99, NULL, 100, 'https://media.newyorker.com/photos/5d13d9c28be7a80008baaf21/master/pass/Zeller-Cream-Cheese.jpg', 1),
('Chocolate Truffle Cake', NULL, 3, 9.99, NULL, 10, 'https://bluebowlrecipes.com/wp-content/uploads/2023/08/chocolate-truffle-cake-8844.jpg', 1),
('Pound cake', NULL, 3, 5.99, NULL, 10, 'https://hips.hearstapps.com/hmg-prod/images/perfect-pound-cake-8472-preview-65e741110d936.jpg?crop=0.6666666666666667xw:1xh;center,top&resize=1200:*', 1),
('Fruit cake', NULL, 3, 7.99, NULL, 10, 'https://www.rockrecipes.com/wp-content/uploads/2019/10/Fruitcake-Loaf-Cake-close-up-of-cut-cake-and-slice-on-white-plate.jpg', 1),
('Macarons', NULL, 4, 2.99, NULL, 100, 'https://www.southernliving.com/thmb/dnsycw_-mf35yKRkq3cBsThVzrY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Southern-Living_Macarons_025-0e05e0cd226d44609f55ed8bc9cd3a3e.jpg', 1),
('Biscotti', NULL, 4, 3.99, NULL, 100, 'https://veronikaskitchen.com/wp-content/uploads/2021/12/Orange-Cranberry-Biscotti-1976.jpg', 1),
('Oatmeal Raisin Cookie', NULL, 4, 2.99, NULL, 100, 'https://www.recipetineats.com/uploads/2016/07/Oatmeal-Raisin-Cookies_3.jpg', 1),
('Gluten free cheese cake', NULL, 7, 9.99, NULL, 20, 'https://www.adashofmegnut.com/wp-content/uploads/2022/02/Gluten-Free-Cheesecake-4.jpg', 1),
('Gluten free stuffy toffee pudding', NULL, 7, 3.99, NULL, 20, 'https://glutenfreecuppatea.co.uk/wp-content/uploads/2018/10/gluten-free-sticky-toffee-pudding-recipe-featured1.jpg', 1),
('French Baguette Sandwich', NULL, 5, 4.99, NULL, 20, 'https://unpeeledjournal.com/wp-content/uploads/2020/09/50371473232_3b952086a0_c.jpg', 1),
('Egg Sandwich', NULL, 5, 4.99, NULL, 10, 'https://images.food52.com/rUoTNkuwutnBVUjL7fI2WFvBcjE=/d53c5c74-3e43-4020-ae20-21e3c7501f6e--teig_160920_0587.jpg?w=3840&q=75', 1);




-- Insert product-ingredient relationships
INSERT INTO Product_Ingredient (Product_ID, Ingredient_ID, Quantity) VALUES 
(1, 1, 0.5), (1, 3, 0.1), (1, 6, 0.02), (1, 7, 0.01),
(2, 1, 0.3), (2, 2, 0.05), (2, 3, 0.2), (2, 4, 0.1),
(3, 1, 0.2), (3, 2, 0.15), (3, 3, 0.1), (3, 4, 0.05), (3, 8, 0.15),
(4, 1, 0.25), (4, 2, 0.2), (4, 3, 0.15), (4, 4, 0.3), (4, 9, 0.02),
(5, 1, 0.3), (5, 3, 0.15), (5, 4, 0.05),
(6, 1, 0.2), (6, 2, 0.15), (6, 3, 0.1), (6, 4, 0.2), (6, 5, 0.1),
(7, 10, 0.3), (7, 2, 0.2), (7, 8, 0.15), (7, 4, 0.1),
(8, 10, 0.4), (8, 2, 0.25), (8, 5, 0.15),
(9, 2, 0.1), (9, 5, 0.2), (9, 9, 0.01),
(10, 1, 0.35), (10, 2, 0.25), (10, 3, 0.2), (10, 7, 0.02);

-- Insert product-allergen relationships
INSERT INTO Product_Allergen_Info (Product_ID, Allergy_ID) VALUES 
(1, 1), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 2), (6, 3),
(7, 4),
(9, 2),
(10, 1), (10, 2), (10, 3);

-- Insert orders
INSERT INTO `Order` (Employee_ID, Customer_ID, Order_Date, Discount, Payment_Method, Total_Amount, Notes) VALUES 
(3, 1, '2023-06-01 09:15:23', 0, 'cash', 12.48, 'Birthday cake'),
(5, 2, '2023-06-01 10:30:45', 5, 'credit', 22.45, 'Large order for office'),
(8, 3, '2023-06-01 11:45:12', 0, 'cash', 8.50, 'Quick breakfast'),
(3, 4, '2023-06-02 08:20:33', 10, 'credit', 15.30, 'Regular customer discount'),
(5, 5, '2023-06-02 12:15:47', 0, 'cash', 6.75, NULL),
(8, 6, '2023-06-02 14:30:22', 0, 'credit', 19.95, 'All gluten-free'),
(3, 7, '2023-06-03 09:45:11', 15, 'credit', 25.60, 'VIP customer'),
(5, 8, '2023-06-03 11:10:05', 0, 'cash', 10.25, NULL),
(8, 9, '2023-06-03 13:20:38', 0, 'credit', 14.80, 'Meeting snacks'),
(3, 10, '2023-06-03 15:45:19', 5, 'cash', 18.35, 'Last minute order');

-- Insert product-order relationships
INSERT INTO Product_Order (Product_ID, Order_ID, Quantity) VALUES 
(1, 1, 1), (3, 1, 2),
(2, 2, 4), (4, 2, 2), (6, 2, 3),
(2, 3, 2), (10, 3, 1),
(1, 4, 1), (5, 4, 2), (9, 4, 1),
(3, 5, 3),
(7, 6, 5), (8, 6, 2),
(4, 7, 3), (5, 7, 2), (6, 7, 2),
(2, 8, 2), (3, 8, 1),
(1, 9, 2), (3, 9, 3),
(4, 10, 2), (6, 10, 2), (10, 10, 1);

-- Insert payments
INSERT INTO Payment (Order_ID, Amount, Payment_Method, Payment_Date, Employee_ID) VALUES 
(1, 12.48, 'cash', '2023-06-01 09:15:23', 3),
(2, 22.45, 'credit', '2023-06-01 10:30:45', 5),
(3, 8.50, 'cash', '2023-06-01 11:45:12', 8),
(4, 15.30, 'credit', '2023-06-02 08:20:33', 3),
(5, 6.75, 'cash', '2023-06-02 12:15:47', 5),
(6, 19.95, 'credit', '2023-06-02 14:30:22', 8),
(7, 25.60, 'credit', '2023-06-03 09:45:11', 3),
(8, 10.25, 'cash', '2023-06-03 11:10:05', 5),
(9, 14.80, 'credit', '2023-06-03 13:20:38', 8),
(10, 18.35, 'cash', '2023-06-03 15:45:19', 3);

-- Insert promotions
INSERT INTO Promotion (Name, Description, Discount_Percentage, Start_Date, End_Date, Active) VALUES 
('Summer Sale', 'Summer special on selected items', 15.00, '2023-06-01', '2023-08-31', TRUE),
('Morning Special', 'Discount on breakfast items before 10am', 10.00, '2023-01-01', '2023-12-31', TRUE),
('Gluten-Free Week', 'Promotion for gluten-free products', 20.00, '2023-06-15', '2023-06-22', FALSE),
('Buy One Get One', 'BOGO on cookies every Friday', 50.00, '2023-01-01', '2023-12-31', TRUE),
('Holiday Special', 'Seasonal holiday promotion', 15.00, '2023-12-01', '2023-12-31', FALSE),
('Loyalty Reward', 'Extra discount for loyalty members', 5.00, '2023-01-01', '2023-12-31', TRUE),
('New Product Launch', 'Introductory discount on new items', 10.00, '2023-07-01', '2023-07-15', FALSE),
('Bulk Discount', 'Discount on orders over $20', 5.00, '2023-01-01', '2023-12-31', TRUE),
('Weekend Special', 'Weekend-only promotions', 10.00, '2023-01-01', '2023-12-31', TRUE),
('Anniversary Sale', 'Celebrating our anniversary', 25.00, '2023-09-01', '2023-09-07', FALSE);

-- Insert product-promotion relationships
INSERT INTO Product_Promotion (Product_ID, Promotion_ID) VALUES 
(2, 1), (6, 1), (10, 1),
(2, 2), (5, 2), (6, 2), (9, 2),
(7, 3),
(3, 4),
(1, 5), (4, 5), (10, 5),
(1, 6), (2, 6), (3, 6), (4, 6), (5, 6), (6, 6), (7, 6), (8, 6), (9, 6), (10, 6),
(8, 7),
(1, 8), (2, 8), (3, 8), (4, 8), (5, 8), (6, 8), (7, 8), (8, 8), (9, 8), (10, 8),
(4, 9), (10, 9),
(1, 10), (2, 10), (3, 10), (4, 10), (5, 10), (6, 10), (7, 10), (8, 10), (9, 10), (10, 10);

-- Insert inventory adjustments
INSERT INTO Inventory_Adjustment (Ingredient_ID, Employee_ID, Quantity, Reason, Adjustment_Date) VALUES 
(1, 2, -5.00, 'Daily usage', '2023-06-01 08:30:00'),
(2, 2, -2.50, 'Daily usage', '2023-06-01 08:30:00'),
(3, 2, -3.00, 'Daily usage', '2023-06-01 08:30:00'),
(4, 2, -15.00, 'Daily usage', '2023-06-01 08:30:00'),
(1, 2, 25.00, 'Restock delivery', '2023-06-02 07:15:00'),
(2, 2, 15.00, 'Restock delivery', '2023-06-02 07:15:00'),
(3, 2, 10.00, 'Restock delivery', '2023-06-02 07:15:00'),
(4, 2, 60.00, 'Restock delivery', '2023-06-02 07:15:00'),
(8, 2, -1.50, 'Special order preparation', '2023-06-02 10:45:00'),
(10, 2, -2.00, 'Gluten-free batch', '2023-06-03 09:20:00');

-- Insert equipment
INSERT INTO Equipment (Name, Description, Purchase_Date, Maintenance_Schedule, Status) VALUES 
('Industrial Oven', 'Large capacity baking oven', '2020-01-15', 'Quarterly', 'operational'),
('Dough Mixer', 'Heavy duty dough mixer', '2020-02-20', 'Monthly', 'operational'),
('Proofing Cabinet', 'Temperature controlled proofing cabinet', '2021-03-10', 'Bi-monthly', 'operational'),
('Coffee Machine', 'Commercial espresso machine', '2021-05-05', 'Monthly', 'operational'),
('Display Case', 'Refrigerated display case', '2022-01-15', 'Quarterly', 'operational'),
('Bread Slicer', 'Automatic bread slicing machine', '2020-06-20', 'Monthly', 'maintenance'),
('Stand Mixer', 'Countertop stand mixer', '2022-03-15', 'As needed', 'operational'),
('Pastry Sheeter', 'Dough sheeting machine', '2021-08-10', 'Quarterly', 'operational'),
('Scale', 'Digital baking scale', '2023-01-05', 'None', 'operational'),
('Blender', 'High power commercial blender', '2022-05-20', 'None', 'retired');

-- Insert product-equipment relationships
INSERT INTO Product_Equipment (Product_ID, Equipment_ID) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 7),
(3, 1), (3, 7),
(4, 1), (4, 7),
(5, 1), (5, 2),
(6, 1), (6, 7),
(7, 1), (7, 7),
(8, 1), (8, 7),
(9, 4),
(10, 1), (10, 2), (10, 7);

-- Insert notifications
INSERT INTO Notification (Type, Message, Related_ID, Created_At, Read_At) VALUES 
('inventory', 'Low stock alert: Wheat Flour below minimum level', 1, '2023-05-30 16:45:00', '2023-05-30 17:10:00'),
('inventory', 'Low stock alert: Butter below minimum level', 3, '2023-05-31 09:30:00', '2023-05-31 10:15:00'),
('order', 'Large order placed by VIP customer', 7, '2023-06-03 09:46:00', NULL),
('system', 'Scheduled maintenance tonight at 11pm', NULL, '2023-06-01 14:00:00', '2023-06-01 14:05:00'),
('shift', 'Shift swap request from Michael Williams', 3, '2023-06-02 15:30:00', '2023-06-02 16:20:00'),
('inventory', 'Sugar delivery received', 2, '2023-06-02 07:20:00', '2023-06-02 07:25:00'),
('order', 'Special request in order #10', 10, '2023-06-03 15:46:00', NULL),
('system', 'New software update available', NULL, '2023-06-01 08:00:00', '2023-06-01 08:30:00'),
('inventory', 'Almond Flour running low', 10, '2023-06-03 10:00:00', NULL),
('shift', 'Employee late for shift: Jennifer Davis', 8, '2023-06-03 08:15:00', '2023-06-03 08:30:00');

-- Insert notification read status
INSERT INTO Notification_Read (Employee_ID, Notification_ID, Read_Date) VALUES 
(1, 1, '2023-05-30 17:10:00'),
(2, 2, '2023-05-31 10:15:00'),
(1, 4, '2023-06-01 14:05:00'),
(2, 5, '2023-06-02 16:20:00'),
(2, 6, '2023-06-02 07:25:00'),
(1, 8, '2023-06-01 08:30:00'),
(2, 10, '2023-06-03 08:30:00');

-- Insert daily summaries
INSERT INTO Daily_Summary (Summary_Date, Total_Orders, Total_Sales, Cash_Sales, Credit_Sales) VALUES 
('2023-06-01', 3, 43.43, 12.48, 30.95),
('2023-06-02', 3, 41.50, 6.75, 34.75),
('2023-06-03', 4, 69.00, 28.60, 40.40),
('2023-05-31', 5, 85.25, 45.50, 39.75),
('2023-05-30', 4, 62.80, 30.25, 32.55),
('2023-05-29', 6, 98.40, 50.20, 48.20),
('2023-05-28', 7, 112.75, 60.30, 52.45),
('2023-05-27', 8, 125.60, 65.25, 60.35),
('2023-05-26', 5, 78.90, 40.15, 38.75),
('2023-05-25', 4, 65.20, 35.10, 30.10);

-- Insert settings
INSERT INTO Settings (Setting_Name, Setting_Value, Description) VALUES 
('business_name', 'Sweet Delights Bakery', 'Name of the bakery'),
('business_hours', '{"monday": "7:00-18:00", "tuesday": "7:00-18:00", "wednesday": "7:00-18:00", "thursday": "7:00-18:00", "friday": "7:00-20:00", "saturday": "8:00-20:00", "sunday": "8:00-16:00"}', 'Business hours in JSON format'),
('tax_rate', '7.5', 'Sales tax rate in percentage'),
('low_stock_threshold', '20', 'Percentage below minimum stock level to trigger alert'),
('default_discount', '0', 'Default discount percentage for orders'),
('loyalty_points_rate', '1', 'Points earned per dollar spent'),
('theme_color', '#d4a373', 'Primary color for UI'),
('backup_schedule', 'daily', 'Frequency of automatic backups'),
('notification_sound', 'true', 'Enable/disable notification sounds'),
('auto_logout_minutes', '30', 'Inactivity timeout in minutes');



UPDATE Employee SET Password = '$2b$10$ea09Wmb97Kg8vkBJlO.FL.5HOLupNJJqkDMuLm.gcOfA0R8GhKsCi' WHERE Email = 'john@bakery.com';
UPDATE Employee SET Password = '$2b$10$ea09Wmb97Kg8vkBJlO.FL.5HOLupNJJqkDMuLm.gcOfA0R8GhKsCi' WHERE Email = 'lisa@bakery.com';
SELECT Email, Password FROM Employee WHERE Email = 'john@bakery.com';


ALTER TABLE `Order`
ADD COLUMN `Status` VARCHAR(20) NOT NULL DEFAULT 'pending'
COMMENT 'Order status: pending, completed, cancelled';

SELECT * FROM `Order`
SELECT * FROM Product
SELECT * FROM Employee
SELECT * FROM ROLE
SELECT * FROM Employee_Role



CREATE TABLE Audit_Log (
  Log_ID INT AUTO_INCREMENT PRIMARY KEY,
  Employee_ID INT NOT NULL,
  Action_Type VARCHAR(50) NOT NULL,
  Action_Details TEXT,
  IP_Address VARCHAR(45),
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID)
);


