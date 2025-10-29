import React from 'react';
import type { Transaction } from '../../types';

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div id="receipt-to-print" className="p-4 bg-white text-black font-mono text-xs w-[300px]">
      <div className="text-center mb-4">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx04iffcdVCWPIAFmM3T0REw2xjKzbISd03Q&s"
          alt="Gemini Cafe Logo" 
          className="w-20 h-20 mx-auto"
        />
        <h2 className="text-lg font-bold mt-2">D'fresto</h2>
        <p>Jl. Imajinasi No. 123, Reactville</p>
        <p>Telp: 0812-3456-7890</p>
        <hr className="my-2 border-dashed border-black" />
      </div>
      <div className="text-left">
        <p>No: {transaction.id}</p>
        <p>Kasir: {transaction.cashier.username}</p>
        <p>Tanggal: {transaction.timestamp.toLocaleString('id-ID')}</p>
      </div>
      <hr className="my-2 border-dashed border-black" />
      <div className="space-y-1">
        {transaction.items.map(item => (
          <div key={item.id}>
            <div className="flex justify-between">
              <span>{item.name}</span>
              <span>{(item.quantity * item.price).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-start pl-2 text-gray-600">
                <span>{item.quantity} x {item.price.toLocaleString('id-ID')}</span>
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
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL</span>
          <span>{transaction.total.toLocaleString('id-ID')}</span>
        </div>
         <div className="flex justify-between mt-2">
          <span>Tunai</span>
          <span>{transaction.cashReceived.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>{transaction.change.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <hr className="my-2 border-dashed border-black" />
      <div className="text-center mt-4">
        <p>Terima Kasih Atas Kunjungan Anda!</p>
        <p>-- Powered by exmp --</p>
      </div>
    </div>
  );
};

export default Receipt;
