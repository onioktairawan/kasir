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
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGc+CiAgICA8dGl0bGU+TG9nbzwvdGl0bGU+CiAgICA8cGF0aCBmaWxsPSIjM2I4MmY2IiBkPSJtMTAwLDE2LjY2NjY3Yy00NS43NzA4NCwwIC04My4zMzMzNCwzNy41NjI1IC04My4zMzMzNCw4My4zMzMzNGMwLDQ1Ljc3MDgzIDM3LjU2MjUsODMuMzMzMyA4My4zMzMzNCw4My4zMzMzYzQ1Ljc3MDgzLDAgODMuMzMzMywtMzcuNTYyNSA4My4zMzMzLC04My4zMzMzYzAsLTQ1Ljc3MDgzIC0zNy41NjI1LC04My4zMzMzNCAtODMuMzMzMywtODMuMzMzMzR6bTAsMTUwYy0zNi44NzUsMCAtNjYuNjY2NjYsLTI5Ljc5MTY3IC02Ni42NjY2NiwtNjYuNjY2NjdjMCwtMzYuODc1IDMwLC02Ni42NjY2NiA2Ni42NjY2NiwtNjYuNjY2NjZjMzYuODc1LDAgNjYuNjY2NywyOS43OTE2NiA2Ni42NjY3LDY2LjY2NjY2YzAsMzYuODc1IC0yOS43OTE2Nyw2Ni42NjY2NyAtNjYuNjY2Nyw2Ni42NjY2N3oiLz4KICAgIDxjaXJjbGUgZmlsbD0iIzNiODJmNiIgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNTAiLz4KICA8L2c+Cjwvc3ZnPg==" 
            alt="Gemini Cafe Logo" 
            className="w-20 h-20 mx-auto"
        />
        <h2 className="text-lg font-bold mt-2">GEMINI CAFE</h2>
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
        <p>-- Powered by Gemini AI --</p>
      </div>
    </div>
  );
};

export default Receipt;