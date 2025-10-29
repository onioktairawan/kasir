import type { User, Product, Category, Transaction, SalesReportData, CartItem, TopProductReport } from '../types';

// Base URL untuk API. Saat pengembangan, ini akan di-proxy.
const API_BASE_URL = ''; 

// Helper function untuk menangani respons dari fetch
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Terjadi kesalahan pada server' }));
    throw new Error(error.message);
  }
  return response.json();
};


export const api = {
  login: async (username: string, pin: string): Promise<User | null> => {
    // Di backend, Anda akan memvalidasi username dan pin/password
    // Untuk saat ini, kita akan melewati login sungguhan dan mengasumsikan berhasil
    // jika backend mengembalikan pengguna.
    // Ini adalah contoh, idealnya Anda menggunakan POST dengan body
    const response = await fetch(`${API_BASE_URL}/api/users?username=${username}`);
    const users: User[] = await handleResponse(response);
    // Logika login sederhana, backend seharusnya menangani ini dengan lebih aman
    return users.length > 0 ? users[0] : null;
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    return handleResponse(response);
  },
  
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    return handleResponse(response);
  },

  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  updateProduct: async (productData: Product): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${productData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  deleteProduct: async (productId: number): Promise<{ success: boolean }> => {
    await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
    });
    return { success: true }; // Asumsikan sukses jika tidak ada error
  },

  createTransaction: async (cart: CartItem[], cashier: User, amountPaid: number, discount: number): Promise<Transaction> => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal - discount;

    const transactionData = {
        items: cart,
        cashierId: cashier.id,
        amountPaid,
        discount,
        subtotal,
        total,
        // Properti lain akan dihitung dan diatur oleh backend
    };
    
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });

    const newTransaction: Transaction = await handleResponse(response);

    // Logging di frontend bisa dipertahankan jika masih diinginkan
    console.log('--- NEW TRANSACTION LOG (from Backend) ---');
    console.log(`ID: ${newTransaction.id}`);
    console.log(`Time: ${new Date(newTransaction.timestamp).toLocaleString()}`);
    console.log(`Cashier: ${newTransaction.cashier.username}`);
    // ... log lainnya
    console.log('------------------------------------------');
    
    return newTransaction;
  },
  
  getSalesReport: async (period: 'daily' | 'weekly' | 'monthly'): Promise<SalesReportData[]> => {
      const response = await fetch(`${API_BASE_URL}/api/reports/sales?period=${period}`);
      return handleResponse(response);
  },

  getTopProductsReport: async (period: '3d' | '7d' | '30d'): Promise<TopProductReport[]> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/topproducts?period=${period}`);
    return handleResponse(response);
  },
};
