import React, { useState, useEffect, useCallback, useReducer, useContext, useRef } from 'react';
import type { Product, CartItem, Transaction } from '../../types';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';
import { LogoutIcon, ShoppingCartIcon, UserCircleIcon, SunIcon, MoonIcon } from '../common/Icons';

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR' };

const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state.map(item =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return state.filter(item => item.id !== action.payload.id);
      }
      return state.map(item =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [discount, setDiscount] = useState(0);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProducts = await api.getProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        setError('Gagal memuat produk. Pastikan server backend berjalan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleSearch = useCallback((query: string, category: string) => {
    let result = products;
    if (category !== 'all') {
      result = result.filter(p => p.category.name === category);
    }
    if (query) {
      result = result.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [products]);

  const handleAddToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, []);

  const handleCartUpdate = useCallback((id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const handleCartRemove = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const handleClearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    setDiscount(0);
    setCartOpen(false);
  }, []);

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };
  
  const handleCheckout = async (amountPaid: number) => {
    if (!user || cart.length === 0) return;
    try {
        const transaction = await api.createTransaction(cart, user, amountPaid, discount);
        setCheckoutOpen(false);
        dispatch({ type: 'CLEAR' });
        setDiscount(0);
        setLastTransaction(transaction);
    } catch(err) {
        console.error(err);
        alert('Gagal memproses transaksi.');
    }
  };
  
   useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && cart.length > 0 && !isCheckoutOpen && !isCartOpen) {
        event.preventDefault();
        setCartOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cart, isCheckoutOpen, isCartOpen]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const CartButton = () => (
    <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-4 right-4 z-20 flex items-center justify-center h-16 w-auto min-w-[64px] px-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105"
    >
        <ShoppingCartIcon className="h-7 w-7" />
        <div className="ml-2 text-left">
            <span className="block text-xs leading-tight">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            <span className="block font-bold text-base leading-tight">{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
        </div>
    </button>
  );

  const UserMenu = () => (
    <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <UserCircleIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-600 dark:text-gray-300 font-medium">{user?.username}</span>
        </button>
        {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <button
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    <span>Ganti Tema</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogoutIcon className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        )}
    </div>
  );

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md z-30">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kasir</h1>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto p-2 sm:p-4">
            {error ? (
                <div className="text-center py-16 text-red-500">
                    <p>{error}</p>
                </div>
            ) : (
                <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} onSearch={handleSearch} loading={loading} />
            )}
        </main>
        
        {cart.length > 0 && <CartButton />}
      
        <Cart
          isOpen={isCartOpen}
          items={cart}
          onUpdate={handleCartUpdate}
          onRemove={handleCartRemove}
          onClear={handleClearCart}
          onCheckout={handleProceedToCheckout}
          onClose={() => setCartOpen(false)}
          discount={discount}
          onSetDiscount={setDiscount}
        />
      
        {isCheckoutOpen && <CheckoutModal cart={cart} discount={discount} onClose={() => setCheckoutOpen(false)} onConfirm={handleCheckout} />}
        {lastTransaction && <ReceiptModal transaction={lastTransaction} onClose={() => setLastTransaction(null)} />}
    </div>
  );
};

export default POS;