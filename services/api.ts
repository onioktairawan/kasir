import type { User, Product, Category, Transaction, SalesReportData, CartItem } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    // Handle cases where the response might be empty (e.g., successful delete with 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json() as Promise<T>;
    }
    return Promise.resolve({} as T);
};

const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    return handleResponse<T>(response);
};

export const api = {
    login: async (username: string, pin: string): Promise<User | null> => {
        try {
            return await apiRequest<User>('/login', {
                method: 'POST',
                body: JSON.stringify({ username, pin }),
            });
        } catch (error) {
            console.error('Login failed:', error);
            return null;
        }
    },

    getUsers: (): Promise<User[]> => apiRequest<User[]>('/users'),

    addUser: (userData: Omit<User, 'id'> & { pin: string }): Promise<User> => {
        return apiRequest<User>('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    updateUser: (userData: User & { pin?: string }): Promise<User> => {
        return apiRequest<User>(`/users/${userData.id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    deleteUser: (userId: string): Promise<{ success: boolean }> => {
        return apiRequest(`/users/${userId}`, { method: 'DELETE' });
    },

    getProducts: (): Promise<Product[]> => apiRequest<Product[]>('/products'),

    getCategories: (): Promise<Category[]> => apiRequest<Category[]>('/categories'),

    addProduct: (productData: Omit<Product, 'id'>): Promise<Product> => {
        return apiRequest<Product>('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    addMultipleProducts: (productsData: Omit<Product, 'id'>[]): Promise<{ success: boolean, count: number }> => {
        return apiRequest<{ success: boolean, count: number }>('/products/bulk', {
            method: 'POST',
            body: JSON.stringify(productsData),
        });
    },

    updateProduct: (productData: Product): Promise<Product> => {
        return apiRequest<Product>(`/products/${productData.id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },

    deleteProduct: (productId: string): Promise<{ success: boolean }> => {
        return apiRequest(`/products/${productId}`, { method: 'DELETE' });
    },

    createTransaction: (cart: CartItem[], cashier: User, cashReceived: number): Promise<Transaction> => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal;
        const change = cashReceived - total;
        const transactionData = {
            items: cart,
            subtotal,
            total,
            paymentMethod: 'Cash',
            cashReceived,
            change,
            cashier,
        };
        return apiRequest<Transaction>('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
    },

    getSalesReport: (startDate: Date, endDate: Date): Promise<SalesReportData> => {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
        return apiRequest<SalesReportData>(`/reports/sales?${params.toString()}`);
    },

    getTopSellingProducts: (startDate: Date, endDate: Date): Promise<{ product: Product; quantity: number; revenue: number }[]> => {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
        return apiRequest<{ product: Product; quantity: number; revenue: number }[]>(`/reports/top-products?${params.toString()}`);
    },

    getTransactions: (startDate: Date, endDate: Date): Promise<Transaction[]> => {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
        // The backend returns dates as ISO strings, so we need to convert them back to Date objects
        return apiRequest<Transaction[]>(`/transactions?${params.toString()}`).then(transactions => 
            transactions.map(t => ({ ...t, timestamp: new Date(t.timestamp) }))
        );
    },
};
