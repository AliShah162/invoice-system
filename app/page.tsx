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
    <main className="min-h-screen bg-gray-50 py-2 px-2 md:py-4 md:px-4 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto space-y-3 print:space-y-1">
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
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            {showHistory ? <X className="w-3 h-3" /> : <History className="w-3 h-3" />}
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>
        
        {/* Invoice History - Toggleable */}
        {showHistory && (
          <div className="bg-white rounded-lg shadow-sm p-3 print:hidden">
            <AllInvoices refreshTrigger={refreshInvoices} />
          </div>
        )}
        
        {/* Footer - Hide on print */}
        <div className="text-center text-gray-400 text-[10px] py-2 print:hidden">
          Software by SmartPOS - PH: 0348-1508721 (Imran)
        </div>
      </div>
    </main>
  );
}