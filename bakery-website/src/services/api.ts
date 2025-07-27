import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:1000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiProduct {
  Product_ID: number;
  Product_Name: string;
  Description?: string;
  Price: number;
  Image_URL?: string;
  Category_Name: string;
  allergens?: string[];
}

export const getMenu = async (): Promise<ApiProduct[]> => {
  try {
    const response = await api.get('/products/website');
    return response.data as ApiProduct[];
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/products/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export default api;