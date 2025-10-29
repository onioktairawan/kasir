import React, { useState, useMemo, useEffect } from 'react';
import type { CartItem } from '../../types';

interface CheckoutModalProps {
  cart: CartItem[];
  discount: number;
  onClose: () => void;
  onConfirm: (amountPaid: number) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ cart, discount, onClose, onConfirm }) => {
  const [amountPaid, setAmountPaid] = useState<number | ''>('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const change = useMemo(() => {
    if (amountPaid === '' || amountPaid < total) {
      return 0;
    }
    return amountPaid - total;
  }, [amountPaid, total]);

  const isPaymentSufficient = useMemo(() => {
    if (amountPaid === '') return false;
    return amountPaid >= total;
  }, [amountPaid, total]);

  const handleConfirm = () => {
    if (isPaymentSufficient && amountPaid !== '') {
      onConfirm(amountPaid);
    }
  };
  
  // Autofocus input on modal open
  useEffect(() => {
    const input = document.getElementById('amount-paid-input');
    if (input) {
      input.focus();
    }
  }, []);

  const potentialOptions = [total, 20000, 50000, 100000].filter(v => v > 0);
  const quickPaymentOptions = [...new Set(potentialOptions.filter(v => v >= total))].sort((a,b) => a-b);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 mx-4 sm:mx-0" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b dark:border-gray-600">
          <h3 className="text-2xl font-bold">Konfirmasi Pembayaran</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
        </div>
        <div className="my-4">
          <h4 className="font-semibold mb-2">Ringkasan Pesanan</h4>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <p>{item.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">{item.quantity} x {item.price.toLocaleString('id-ID')}</p>
                </div>
                <p>{(item.quantity * item.price).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </div>
             {discount > 0 && (
                <div className="flex justify-between text-red-500">
                    <span>Diskon</span>
                    <span>- {discount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                </div>
            )}
            <div className="flex justify-between text-xl font-bold">
              <span>Total Bayar</span>
              <span>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </div>
             <div className="pt-4 space-y-2">
                <label htmlFor="amount-paid-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Uang Diterima</label>
                <input 
                    id="amount-paid-input"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 50000"
                    className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                 <div className="flex flex-wrap gap-2 pt-2">
                    {quickPaymentOptions.map(amount => (
                        <button key={amount} onClick={() => setAmountPaid(amount)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                           {amount === total ? 'Uang Pas' : amount.toLocaleString('id-ID')}
                        </button>
                    ))}
                </div>
            </div>
             <div className="flex justify-between text-lg font-semibold mt-2 text-green-600 dark:text-green-400">
              <span>Kembalian</span>
              <span>{change.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t dark:border-gray-600 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Batal
          </button>
          <button onClick={handleConfirm} disabled={!isPaymentSufficient} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed">
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;