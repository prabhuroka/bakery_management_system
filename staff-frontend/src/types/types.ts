export interface Product {
  Product_ID: number;
  Product_Name: string;
  Description: string;
  Category_ID: number;
  Price: number;
  Image_URL: string;
  Product_Stock_Level: number;
  Active: boolean;
}

export interface Category {
  Category_ID: number;
  Category_Name: string;
}

export interface Customer {
  Customer_ID: number;
  First_Name: string;
  Last_Name: string;
  Email?: string;
  Phone?: string;
  Loyalty_Points: number;
}

export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  order_id: number;
  Order_Date: string;
  Total_Amount: number;
  Payment_Method: string;
  Status: string;
  customer_id?: number;
  customer_first_name?: string;
  customer_last_name?: string;
  products: Array<{
    product_id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  notes?: string;
}

export interface OrderCreateRequest {
  customer_id?: number;
  products: Array<{
    product_id: number;
    quantity: number;
  }>;
  payment_method: 'cash' | 'credit';
  notes?: string;
}
export interface Employee {
  Employee_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Active: boolean;
  roles: string[]; 
}

export interface Role {
  Role_ID: number;
  Role_Name: string;
  Description?: string;
}