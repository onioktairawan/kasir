
import React, { useState, useEffect, useCallback, useReducer, useContext } from 'react';
import type { Product, CartItem, Transaction } from '../../types';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import CheckoutModal from './CheckoutModal';
import ReceiptOptionsModal from './ReceiptOptionsModal';
import UserMenu from '../common/UserMenu';
import { ShoppingCartIcon } from '../common/Icons';

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
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isReceiptOptionsOpen, setReceiptOptionsOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const { user } = useContext(AuthContext);
  
  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const fetchedProducts = await api.getProducts();
    setProducts(fetchedProducts);
    setFilteredProducts(fetchedProducts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleCheckout = async (cashReceived: number) => {
    if (!user || cart.length === 0) return;
    const transaction = await api.createTransaction(cart, user, cashReceived);
    setLastTransaction(transaction);
    dispatch({ type: 'CLEAR' });
    setCheckoutOpen(false);
    setReceiptOptionsOpen(true);
    fetchProducts(); // Refetch products to update stock
  };
  
  // Keyboard shortcuts
   useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' && cart.length > 0 && !isCheckoutOpen) {
        event.preventDefault();
        setCartOpen(false);
        setCheckoutOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cart, isCheckoutOpen]);

  const CartFAB = () => (
    <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-110"
        aria-label="Buka Keranjang"
    >
        <ShoppingCartIcon className="h-8 w-8" />
        {totalItemsInCart > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 text-sm font-bold bg-red-500 rounded-full">
                {totalItemsInCart}
            </span>
        )}
    </button>
  );

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md z-20">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Gemini POS</h1>
          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto p-4">
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} onSearch={handleSearch} loading={loading} />
        </main>
        
        {cart.length > 0 && <CartFAB />}

        {/* Cart Slide-in Panel */}
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isCartOpen ? 'bg-black bg-opacity-50' : 'pointer-events-none'}`} onClick={() => setCartOpen(false)}>
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <Cart 
                    items={cart} 
                    onUpdate={handleCartUpdate} 
                    onRemove={handleCartRemove} 
                    onClear={() => dispatch({ type: 'CLEAR' })} 
                    onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
                    onClose={() => setCartOpen(false)}
                />
            </div>
        </div>
        
        {isCheckoutOpen && <CheckoutModal cart={cart} onClose={() => setCheckoutOpen(false)} onConfirm={handleCheckout} />}
        {isReceiptOptionsOpen && lastTransaction && <ReceiptOptionsModal transaction={lastTransaction} onClose={() => { setReceiptOptionsOpen(false); setLastTransaction(null); }} />}
    </div>
  );
};

export default POS;