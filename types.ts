
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
  stock: number;
  category: Category;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  cashier: User;
  amountPaid: number;
  change: number;
}

export type Theme = 'light' | 'dark';

export interface SalesReportData {
    period: string;
    totalSales: number;
    transactions: number;
}

export interface TopProductReport {
  id: number;
  name: string;
  imageUrl: string;
  quantitySold: number;
}
