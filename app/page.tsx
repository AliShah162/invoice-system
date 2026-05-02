"use client";

import { useState } from "react";
import SATradersCard from "./components/SATradersCard";
import InvoiceForm from "./components/InvoiceForm";
import AllInvoices from "./components/AllInvoices";
import { History, X } from "lucide-react";

export default function Home() {
  const [refreshInvoices, setRefreshInvoices] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const handleInvoiceSaved = () => {
    setRefreshInvoices(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-2 px-2 sm:py-3 sm:px-3 md:py-4 md:px-4 lg:px-6 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 print:space-y-1">
        {/* Header */}
        <SATradersCard />
        
        {/* Main Invoice Form */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden print:shadow-none">
          <InvoiceForm onInvoiceSaved={handleInvoiceSaved} />
        </div>
        
        {/* History Toggle - Hide on print */}
        <div className="flex justify-center print:hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
          >
            {showHistory ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <History className="w-4 h-4 sm:w-5 sm:h-5" />}
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>
        
        {/* Invoice History - Toggleable */}
        {showHistory && (
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 print:hidden">
            <AllInvoices refreshTrigger={refreshInvoices} />
          </div>
        )}
        
        {/* Footer - Hide on print */}
        <div className="text-center text-gray-400 text-[10px] sm:text-xs py-2 sm:py-3 print:hidden">
          Software by SmartPOS - PH: 0348-1508721 (Imran)
        </div>
      </div>
    </main>
  );
}