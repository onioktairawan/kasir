export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  cashReceived: number;
  change: number;
  timestamp: Date;
  cashier: User;
}

export type Theme = 'light' | 'dark';

export interface SalesReportData {
    totalSales: number;
    transactions: number;
    chartData: { date: string; sales: number }[];
}