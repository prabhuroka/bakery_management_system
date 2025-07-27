export interface Product {
  Product_ID: number;
  Product_Name: string;
  Description?: string;
  Price: number;
  Image_URL?: string;
  Category_Name?: string;
  allergens?: string[];
}

export interface Category {
  Category_ID: number;
  Category_Name: string;
  Description?: string;
}

export interface MenuCategory {
  category: string;
  items: Product[];
}