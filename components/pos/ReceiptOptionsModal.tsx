import React, { useState } from 'react';
import type { Transaction } from '../../types';
import { ArrowDownTrayIcon, PrinterIcon } from '../common/Icons';
import Receipt from './Receipt';

interface ReceiptOptionsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const ReceiptOptionsModal: React.FC<ReceiptOptionsModalProps> = ({ transaction, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async () => {
    setIsProcessing(true);
    const receiptElement = document.getElementById('receipt-to-print');
    if (receiptElement && (window as any).html2canvas) {
      try {
        const canvas = await (window as any).html2canvas(receiptElement, {
          scale: 3, // Increase scale for better resolution
          backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `receipt-${transaction.id}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      } catch (error) {
        console.error("Failed to generate image:", error);
        alert("Gagal mengunduh struk. Silakan coba lagi.");
      } finally {
        setIsProcessing(false);
      }
    } else {
        alert("Fungsi download tidak tersedia.");
        setIsProcessing(false);
    }
  };
  
  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm text-center flex flex-col my-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
            <h3 className="text-2xl font-bold">Transaksi Berhasil!</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Pratinjau Struk:</p>
            
            <div className="my-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg ring-1 ring-inset ring-gray-200 dark:ring-gray-600">
                <div className="mx-auto">
                    <Receipt transaction={transaction} />
                </div>
            </div>
        </div>

        <div className="mt-auto p-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <div className="flex gap-3">
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center w-1/2 gap-2 px-4 py-3 text-md font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                    <PrinterIcon className="w-5 h-5"/>
                    Cetak
                </button>
                <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-1/2 gap-2 px-4 py-3 text-md font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            <span>...</span>
                        </>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="w-5 h-5"/>
                            Simpan
                        </>
                    )}
                </button>
            </div>


            <button 
                onClick={onClose}
                className="w-full py-3 text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
                Selesai / Transaksi Baru
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptOptionsModal;