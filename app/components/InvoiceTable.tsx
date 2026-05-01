"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceItem {
  id: string;
  sr: number;
  items: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceTableProps {
  items: InvoiceItem[];
  setItems: (items: InvoiceItem[]) => void;
  onTotalChange: (total: number) => void;
}

export default function InvoiceTable({ items, setItems, onTotalChange }: InvoiceTableProps) {
  const addNewRow = () => {
    const newId = Date.now().toString();
    const newSr = items.length + 1;
    const newItem: InvoiceItem = {
      id: newId,
      sr: newSr,
      items: "",
      quantity: 0,
      unitPrice: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value) : item.quantity;
          const price = field === "unitPrice" ? Number(value) : item.unitPrice;
          updated.amount = (qty || 0) * (price || 0);
        }
        
        return updated;
      }
      return item;
    });
    
    setItems(updatedItems);
    
    const total = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    onTotalChange(total);
  };

  const deleteRow = (id: string) => {
    const filteredItems = items.filter((item) => item.id !== id);
    const renumberedItems = filteredItems.map((item, idx) => ({
      ...item,
      sr: idx + 1,
    }));
    setItems(renumberedItems);
    
    const total = renumberedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    onTotalChange(total);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs print:text-[8pt]">
        <thead>
          <tr className="bg-gray-800 text-white text-xs print:text-[8pt]">
            <th className="px-1 py-1 text-center w-10">Sr.</th>
            <th className="px-1 py-1 text-left">ITEMS</th>
            <th className="px-1 py-1 text-center w-16">QTY</th>
            <th className="px-1 py-1 text-center w-20">U/P (₨)</th>
            <th className="px-1 py-1 text-right w-24">AMOUNT (₨)</th>
            <th className="px-1 py-1 text-center w-8 print:hidden">Action</th>
           </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="px-1 py-0.5 text-center text-gray-600">{item.sr}</td>
              <td className="px-1 py-0.5">
                <input
                  type="text"
                  value={item.items}
                  onChange={(e) => updateItem(item.id, "items", e.target.value)}
                  placeholder="Item"
                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 print:border-none print:p-0"
                />
              </td>
              <td className="px-1 py-0.5">
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded text-center print:border-none print:p-0"
                  min="0"
                  step="1"
                />
              </td>
              <td className="px-1 py-0.5">
                <input
                  type="number"
                  value={item.unitPrice || ""}
                  onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded text-center print:border-none print:p-0"
                  min="0"
                  step="1"
                />
              </td>
              <td className="px-1 py-0.5 text-right font-semibold">
                {item.amount.toLocaleString()}
              </td>
              <td className="px-1 py-0.5 text-center print:hidden">
                <button
                  onClick={() => deleteRow(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {items.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          No items added yet. Click Add Item to start.
        </div>
      )}
      
      <div className="mt-2 print:hidden">
        <button
          onClick={addNewRow}
          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Item
        </button>
      </div>
    </div>
  );
}