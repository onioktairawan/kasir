import React, { useState, useEffect, useMemo } from 'react';
import type { CartItem } from '../../types';

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  onConfirm: (cashReceived: number) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ cart, onClose, onConfirm }) => {
  const [cashReceived, setCashReceived] = useState('');
  
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  
  const change = useMemo(() => {
    const cash = parseFloat(cashReceived);
    if (!isNaN(cash) && cash >= total) {
      return cash - total;
    }
    return 0;
  }, [cashReceived, total]);

  const handleConfirm = () => {
    const cash = parseFloat(cashReceived);
    if (!isNaN(cash) && cash >= total) {
      onConfirm(cash);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter') {
          handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cashReceived, total]);

  const quickDenominations = [20000, 50000, 100000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b dark:border-gray-600">
          <h3 className="text-2xl font-bold">Pembayaran</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
        </div>
        
        <div className="my-6 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">Total Tagihan</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                {total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            </p>
        </div>

        <div className="space-y-4">
            <div>
                <label htmlFor="cash" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Uang Tunai Diterima</label>
                <input
                    type="number"
                    id="cash"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    autoFocus
                    className="mt-1 block w-full px-4 py-3 text-xl sm:text-2xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="0"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCashReceived(String(total))} className="flex-1 px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900 font-semibold">
                    Uang Pas
                </button>
                {quickDenominations.map(amount => (
                    <button key={amount} type="button" onClick={() => setCashReceived(String(amount))} className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                        {amount.toLocaleString('id-ID')}
                    </button>
                ))}
            </div>
        </div>

        {parseFloat(cashReceived) >= total && (
            <div className="mt-6 text-center bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
                 <p className="text-lg text-gray-500 dark:text-gray-400">Kembalian</p>
                <p className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                    {change.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
            </div>
        )}

        <div className="pt-6 border-t dark:border-gray-600 flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Batal
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={parseFloat(cashReceived) < total || isNaN(parseFloat(cashReceived))}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            Konfirmasi (Enter)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;