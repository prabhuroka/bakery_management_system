// api.ts
import axios, { AxiosInstance } from 'axios';
import { Product, Category, Customer, Order, OrderCreateRequest } from '../types/types';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:1000/api',
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// API functions
export const searchCustomers = (query: string) => api.get<Customer[]>('/customers/search', { params: { query } });
export const createCustomer = (customer: Omit<Customer, 'Customer_ID'>) => api.post<Customer>('/customers', customer);
export const getProducts = () => api.get<Product[]>('/products');
export const getCategories = () => api.get<Category[]>('/products/categories');
export const createOrder = (order: OrderCreateRequest) => api.post<Order>('/orders', order);
export const getOrder = (id: number) => api.get<Order>(`/orders/${id}`);
export const getOrders = (date?: string) => api.get<Order[]>('/orders', date ? { params: { date } } : undefined);
export const login = (email: string, password: string) => api.post('/auth/employee/login', { email, password });

export default api;