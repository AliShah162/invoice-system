"use client";

import { useState } from "react";
import InvoiceTable from "./InvoiceTable";
import { Printer, Save, RefreshCw } from "lucide-react";
import { invoiceDB } from "../lib/db";

interface CustomerInfo {
  customer: string;
  region: string;
  shopName: string;
  contact: string;
}

interface InvoiceItem {
  id: string;
  sr: number;
  items: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceFormProps {
  onInvoiceSaved: () => void;
}

export default function InvoiceForm({ onInvoiceSaved }: InvoiceFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customer: "",
    region: "",
    shopName: "",
    contact: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const [preBalance, setPreBalance] = useState(0);

  const dueAmount = total - paid;
  const netTotal = total + preBalance;

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const handleSave = async () => {
    if (items.length === 0) {
      alert("Please add at least one item to the invoice!");
      return;
    }

    const invoiceData = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      customerInfo,
      items,
      total,
      paid,
      dueAmount,
      preBalance,
      netTotal,
    };

    try {
      await invoiceDB.saveInvoice(invoiceData);
      alert(`Invoice ${invoiceData.invoiceNumber} saved successfully!`);

      setCustomerInfo({ customer: "", region: "", shopName: "", contact: "" });
      setItems([]);
      setTotal(0);
      setPaid(0);
      setPreBalance(0);

      onInvoiceSaved();
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data?")) {
      setCustomerInfo({ customer: "", region: "", shopName: "", contact: "" });
      setItems([]);
      setTotal(0);
      setPaid(0);
      setPreBalance(0);
    }
  };

  return (
    <div className="space-y-3 print:space-y-1">
      {/* Customer Information - Ultra Compact */}
      <div className="bg-white rounded-lg shadow-sm p-3 print:p-1">
        <h2 className="text-base font-bold text-gray-800 mb-2 pb-0.5 border-b-2 border-emerald-500 inline-block print:text-sm">
          Customer Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 print:text-[8pt]">Customer</label>
            <input
              type="text"
              value={customerInfo.customer}
              onChange={(e) => setCustomerInfo({ ...customerInfo, customer: e.target.value })}
              placeholder="Name"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 print:border-none print:p-0 print:text-[8pt]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 print:text-[8pt]">Region</label>
            <input
              type="text"
              value={customerInfo.region}
              onChange={(e) => setCustomerInfo({ ...customerInfo, region: e.target.value })}
              placeholder="Region"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 print:border-none print:p-0 print:text-[8pt]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 print:text-[8pt]">Shop Name</label>
            <input
              type="text"
              value={customerInfo.shopName}
              onChange={(e) => setCustomerInfo({ ...customerInfo, shopName: e.target.value })}
              placeholder="Shop Name"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 print:border-none print:p-0 print:text-[8pt]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 print:text-[8pt]">Contact</label>
            <input
              type="text"
              value={customerInfo.contact}
              onChange={(e) => setCustomerInfo({ ...customerInfo, contact: e.target.value })}
              placeholder="Phone"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 print:border-none print:p-0 print:text-[8pt]"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items Table - Compact */}
      <div className="bg-white rounded-lg shadow-sm p-3 print:p-1">
        <h2 className="text-base font-bold text-gray-800 mb-2 pb-0.5 border-b-2 border-emerald-500 inline-block print:text-sm">
          Items
        </h2>

        <InvoiceTable items={items} setItems={setItems} onTotalChange={setTotal} />
      </div>

      {/* Summary Section - Ultra Compact */}
      <div className="bg-white rounded-lg shadow-sm p-3 print:p-1">
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-1">
            <div className="flex justify-between py-0.5 text-sm print:text-[9pt]">
              <span className="font-semibold">Total:</span>
              <span>₨ {total.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-0.5 text-sm print:text-[9pt]">
              <span className="font-semibold">Paid:</span>
              <input
                type="number"
                value={paid}
                onChange={(e) => setPaid(Number(e.target.value))}
                className="w-24 px-1 py-0 text-sm border border-gray-300 rounded text-right print:border-none print:p-0"
                min="0"
              />
            </div>

            <div className="flex justify-between py-0.5 text-sm print:text-[9pt]">
              <span className="font-semibold">Due:</span>
              <span className="text-orange-600">₨ {dueAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-0.5 text-sm print:text-[9pt]">
              <span className="font-semibold">Pre Balance:</span>
              <input
                type="number"
                value={preBalance}
                onChange={(e) => setPreBalance(Number(e.target.value))}
                placeholder="0"
                className="w-24 px-1 py-0 text-sm border border-gray-300 rounded text-right print:border-none print:p-0"
                min="0"
              />
            </div>

            <div className="flex justify-between py-1 bg-emerald-50 rounded px-2 mt-1 print:bg-transparent">
              <span className="font-bold">Net Total:</span>
              <span className="font-bold text-emerald-600">₨ {netTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hide on print */}
        <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200 print:hidden">
          <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">
            <Save className="w-3 h-3" /> Save
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded text-sm">
            <Printer className="w-3 h-3" /> Print
          </button>
          <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm">
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}