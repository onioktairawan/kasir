import React from 'react';
import type { Transaction } from '../../types';

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div id="receipt-to-print" className="p-4 bg-white text-black font-mono text-xs w-[300px]">
      <div className="text-center">
        <img src="https://i.imgur.com/g00fB1b.png" alt="Logo" className="mx-auto mb-2 w-16 h-16" />
        <h2 className="text-lg font-bold">GEMINI CAFE</h2>
        <p>Jl. Imajinasi No. 123, Reactville</p>
        <p>Telp: 0812-3456-7890</p>
        <hr className="my-2 border-dashed border-black" />
      </div>
      <div>
        <p>No: {transaction.id}</p>
        <p>Kasir: {transaction.cashier.username}</p>
        <p>Tanggal: {transaction.timestamp.toLocaleString('id-ID')}</p>
      </div>
      <hr className="my-2 border-dashed border-black" />
      <div>
        {transaction.items.map(item => (
          <div key={item.id} className="mb-1">
            <p>{item.name}</p>
            <div className="flex justify-between">
              <span>{item.quantity} x {item.price.toLocaleString('id-ID')}</span>
              <span>{(item.quantity * item.price).toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
      <hr className="my-2 border-dashed border-black" />
      <div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{transaction.subtotal.toLocaleString('id-ID')}</span>
        </div>
        {transaction.discount > 0 && (
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>- {transaction.discount.toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL</span>
          <span>{transaction.total.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Bayar</span>
          <span>{transaction.amountPaid.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>{transaction.change.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <hr className="my-2 border-dashed border-black" />
      <div className="text-center mt-4">
        <p>Terima Kasih Atas Kunjungan Anda!</p>
      </div>
    </div>
  );
};

export default Receipt;