import type { User, Product, Category, Transaction, SalesReportData, CartItem } from '../types';
import { UserRole } from '../types';

let mockUsers: (User & { pin: string })[] = [
  { id: 1, username: 'admin', role: UserRole.ADMIN, pin: '1234' },
  { id: 2, username: 'kasir1', role: UserRole.CASHIER, pin: '1111' },
];

const mockCategories: Category[] = [
  { id: 1, name: 'Makanan' },
  { id: 2, name: 'Minuman' },
];

let mockProducts: Product[] = [];

let mockTransactions: Transaction[] = [];

// Generate realistic mock transactions for the last year
const generateMockTransactions = () => {
    if (mockProducts.length === 0) return; // Don't generate if no products
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);

        // More transactions on weekends
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const transactionCount = Math.floor(Math.random() * (isWeekend ? 25 : 10));

        for (let j = 0; j < transactionCount; j++) {
            const cart: CartItem[] = [];
            const itemCount = Math.floor(Math.random() * 5) + 1;
            let subtotal = 0;

            for (let k = 0; k < itemCount; k++) {
                const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                cart.push({ ...product, quantity });
                subtotal += product.price * quantity;
            }

            const total = subtotal;
            const cashReceived = total + Math.floor(Math.random() * 50000);
            const change = cashReceived - total;
            
            const transactionHour = Math.floor(Math.random() * (22-8) + 8); // 8 AM to 10 PM
            date.setHours(transactionHour, Math.floor(Math.random() * 60));

            mockTransactions.push({
                id: `TRX-${date.getTime()}-${j}`,
                items: cart,
                subtotal,
                total,
                paymentMethod: 'Cash',
                cashReceived,
                change,
                timestamp: new Date(date),
                cashier: mockUsers[1],
            });
        }
    }
};

generateMockTransactions();


const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 500));

export const api = {
  login: async (username: string, pin: string): Promise<User | null> => {
    console.log(`Attempting login for user: ${username} with PIN: ${pin}`);
    const user = mockUsers.find(u => u.username === username && u.pin === pin);
    if (user) {
      // Don't send the pin back to the client
      const { pin, ...userToReturn } = user;
      return simulateDelay(userToReturn);
    }
    return simulateDelay(null);
  },
  
  getUsers: async (): Promise<User[]> => {
    const usersToReturn = mockUsers.map(u => {
      const { pin, ...user } = u;
      return user;
    });
    return simulateDelay(usersToReturn);
  },

  addUser: async (userData: Omit<User, 'id'> & { pin: string }): Promise<User> => {
    if (!userData.pin) throw new Error("PIN is required for a new user.");

    const newUser: User & { pin: string } = {
      ...userData,
      id: Math.max(0, ...mockUsers.map(u => u.id)) + 1,
    };
    mockUsers.push(newUser);
    const { pin, ...userToReturn } = newUser;
    return simulateDelay(userToReturn);
  },

  updateUser: async (userData: User & { pin?: string }): Promise<User> => {
    mockUsers = mockUsers.map(u => {
      if (u.id === userData.id) {
        return {
          ...u,
          username: userData.username,
          role: userData.role,
          pin: userData.pin ? userData.pin : u.pin, // Update pin only if provided
        };
      }
      return u;
    });
    const { pin, ...userToReturn } = userData;
    return simulateDelay(userToReturn);
  },

  deleteUser: async (userId: number): Promise<{ success: boolean }> => {
    const userToDelete = mockUsers.find(u => u.id === userId);
    if (userToDelete?.role === UserRole.ADMIN) {
        const adminCount = mockUsers.filter(u => u.role === UserRole.ADMIN).length;
        if (adminCount <= 1) {
            throw new Error("Tidak dapat menghapus admin terakhir.");
        }
    }
    mockUsers = mockUsers.filter(u => u.id !== userId);
    return simulateDelay({ success: true });
  },

  getProducts: async (): Promise<Product[]> => {
    return simulateDelay(mockProducts);
  },
  
  getCategories: async (): Promise<Category[]> => {
    return simulateDelay(mockCategories);
  },

  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(0, ...mockProducts.map(p => p.id)) + 1,
    };
    mockProducts.push(newProduct);
    return simulateDelay(newProduct);
  },

  addMultipleProducts: async (productsData: Omit<Product, 'id'>[]): Promise<{ success: boolean, count: number }> => {
    let currentMaxId = Math.max(0, ...mockProducts.map(p => p.id));
    const newProducts: Product[] = productsData.map((p, index) => ({
      ...p,
      id: currentMaxId + 1 + index,
    }));
    mockProducts.push(...newProducts);
    return simulateDelay({ success: true, count: newProducts.length });
  },

  updateProduct: async (productData: Product): Promise<Product> => {
    mockProducts = mockProducts.map(p => p.id === productData.id ? productData : p);
    return simulateDelay(productData);
  },

  deleteProduct: async (productId: number): Promise<{ success: boolean }> => {
    mockProducts = mockProducts.filter(p => p.id !== productId);
    return simulateDelay({ success: true });
  },

  createTransaction: async (cart: CartItem[], cashier: User, cashReceived: number): Promise<Transaction> => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;
    const change = cashReceived - total;

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      items: cart,
      subtotal,
      total,
      paymentMethod: 'Cash',
      cashReceived,
      change,
      timestamp: new Date(),
      cashier,
    };
    
    mockTransactions.push(newTransaction);
    return simulateDelay(newTransaction);
  },
  
  getSalesReport: async (startDate: Date, endDate: Date): Promise<SalesReportData> => {
      const filteredTransactions = mockTransactions.filter(t => {
          const timestamp = t.timestamp;
          return timestamp >= startDate && timestamp <= endDate;
      });

      const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
      const transactions = filteredTransactions.length;

      const dailyData: { [key: string]: number } = {};
      
      const dateCursor = new Date(startDate);
      while(dateCursor <= endDate) {
          dailyData[dateCursor.toISOString().split('T')[0]] = 0;
          dateCursor.setDate(dateCursor.getDate() + 1);
      }

      filteredTransactions.forEach(t => {
          const dateKey = t.timestamp.toISOString().split('T')[0];
          if(dailyData[dateKey] !== undefined) {
              dailyData[dateKey] += t.total;
          }
      });
      
      const chartData = Object.keys(dailyData).map(date => ({
          date: date,
          sales: dailyData[date]
      }));

      return simulateDelay({
          totalSales,
          transactions,
          chartData
      });
  },

  getTopSellingProducts: async (startDate: Date, endDate: Date): Promise<{ product: Product; quantity: number; revenue: number }[]> => {
      const filteredTransactions = mockTransactions.filter(t => {
          const timestamp = t.timestamp;
          return timestamp >= startDate && timestamp <= endDate;
      });

      const productSales: { [key: number]: { quantity: number; revenue: number } } = {};

      filteredTransactions.forEach(t => {
          t.items.forEach(item => {
              if (!productSales[item.id]) {
                  productSales[item.id] = { quantity: 0, revenue: 0 };
              }
              productSales[item.id].quantity += item.quantity;
              productSales[item.id].revenue += item.price * item.quantity;
          });
      });

      const sortedProducts = Object.keys(productSales)
          .map(id => ({
              productId: Number(id),
              ...productSales[Number(id)],
          }))
          .sort((a, b) => b.quantity - a.quantity);

      const topProducts = sortedProducts.map(p => ({
          product: mockProducts.find(mp => mp.id === p.productId)!,
          quantity: p.quantity,
          revenue: p.revenue,
      }));

      return simulateDelay(topProducts.slice(0, 10)); // Return top 10
  },

  getTransactions: async (startDate: Date, endDate: Date): Promise<Transaction[]> => {
      const filtered = mockTransactions.filter(t => {
          const timestamp = t.timestamp;
          return timestamp >= startDate && timestamp <= endDate;
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent
      return simulateDelay(filtered);
  },
};
