import React from 'react';
import type { CartItem } from '../../types';
import { PlusIcon, MinusIcon, TrashIcon, TagIcon, XMarkIcon } from '../common/Icons';

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  discount: number;
  onUpdate: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  onCheckout: () => void;
  onClose: () => void;
  onSetDiscount: (amount: number) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, items, discount, onUpdate, onRemove, onClear, onCheckout, onClose, onSetDiscount }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 0) {
      value = 0;
    }
    if (value > subtotal) {
      value = subtotal;
    }
    onSetDiscount(value);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Cart Panel */}
      <div className="relative w-full max-w-sm h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col transform transition-transform ease-in-out duration-300 translate-x-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Pesanan</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-8">Keranjang kosong</p>
            ) : (
            items.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                    <div className="flex items-center mt-1">
                        <button onClick={() => onUpdate(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                            <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-lg">{item.quantity}</span>
                        <button onClick={() => onUpdate(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="font-bold">{(item.price * item.quantity).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                    <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 mt-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                </div>
            ))
            )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <label htmlFor="discount-input" className="flex items-center gap-1">
                    <TagIcon className="w-5 h-5" /> Diskon
                </label>
                <div className="relative">
                    <span className="absolute left-3 inset-y-0 flex items-center text-gray-500 dark:text-gray-400 text-sm">Rp</span>
                    <input
                        id="discount-input"
                        type="number"
                        value={discount === 0 ? '' : discount}
                        onChange={handleDiscountChange}
                        className="w-36 pl-8 pr-2 py-1 text-right border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="0"
                        disabled={items.length === 0}
                    />
                </div>
            </div>

            <div className="flex justify-between text-2xl font-bold pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
            <span>Total</span>
            <span>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </div>
            <div className="flex gap-2 pt-2">
                <button
                    onClick={onClear}
                    disabled={items.length === 0}
                    className="w-1/3 py-3 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Batal
                </button>
                <button
                    onClick={onCheckout}
                    disabled={items.length === 0 || total < 0}
                    className="w-2/3 py-3 text-lg font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed"
                >
                    Bayar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;