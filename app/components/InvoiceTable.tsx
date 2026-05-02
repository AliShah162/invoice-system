"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";

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

// Menu data structure
interface MenuItem {
  name: string;
  subHeading?: string;
  items: string[];
}

const menuData: { mainHeading: string; subItems: MenuItem[] | string[] }[] = [
  {
    mainHeading: "CSD",
    subItems: [
      { name: "2.25L", items: ["Cola", "DoMore", "Double Up", "Malta"] },
      { name: "1.5L", items: ["Cola", "DoMore", "Double Up", "Malta", "Lychee", "Apple", "Anar"] },
      { name: "1Ltr", items: ["Cola", "DoMore", "Double Up", "Malta"] },
      { name: "300ml", items: ["Cola", "DoMore", "Double Up", "Malta", "Lychee", "Apple", "Peach"] },
    ],
  },
  {
    mainHeading: "Boost Up",
    subItems: [],
  },
  {
    mainHeading: "Tetra",
    subItems: [
      { name: "250ml", items: ["Mango", "Apple", "Fruit punch", "Lychee", "Anar"] },
      { name: "200ml", items: ["Mango", "Apple", "Fruit punch", "Lychee", "Anar"] },
    ],
  },
  {
    mainHeading: "Pet Frooti",
    subItems: [
      { name: "250ml", items: ["Mango", "Apple", "Peach", "Guava"] },
      { name: "500ml", items: ["Mango", "Apple", "Peach", "Guava"] },
      { name: "1000ml", items: ["Mango", "Apple", "Peach", "Guava"] },
      { name: "2000ml", items: ["Mango"] },
    ],
  },
  {
    mainHeading: "Prisma",
    subItems: [{ name: "", items: ["Mango", "Apple", "Fruit Punch", "Anar"] }],
  },
  {
    mainHeading: "Water",
    subItems: [{ name: "", items: ["500ml", "1.5L"] }],
  },
];

export default function InvoiceTable({ items, setItems, onTotalChange }: InvoiceTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate position when dropdown opens
  useEffect(() => {
    if (openDropdownId && buttonRefs.current.has(openDropdownId)) {
      const button = buttonRefs.current.get(openDropdownId);
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: Math.max(10, rect.left + window.scrollX - 160),
        });
      }
    }
  }, [openDropdownId]);

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

  const formatSelection = (mainHeading: string, subHeading: string, itemName: string): string => {
    if (subHeading && subHeading.trim() !== "") {
      return `${mainHeading}-${subHeading}-${itemName}`;
    }
    return `${mainHeading}-${itemName}`;
  };

  const handleSelectItem = (itemId: string, mainHeading: string, subHeading: string, itemName: string) => {
    const formattedValue = formatSelection(mainHeading, subHeading, itemName);
    updateItem(itemId, "items", formattedValue);
    setOpenDropdownId(null);
  };

  // Render dropdown menu as portal
  const renderDropdownMenu = () => {
    if (!openDropdownId) return null;

    return (
      <div 
        ref={dropdownRef}
        className="fixed z-[9999] w-72 sm:w-80 max-h-80 overflow-y-auto bg-white border-2 border-gray-300 rounded-lg shadow-2xl"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
        }}
      >
        {menuData.map((section, idx) => (
          <div key={idx}>
            {/* Main Heading */}
            <div className="sticky top-0 bg-emerald-600 text-white px-3 sm:px-4 py-2 font-bold text-sm sm:text-base">
              {section.mainHeading}
            </div>
            
            {/* If subItems is empty (like Boost Up), just add the heading as selectable */}
            {section.subItems.length === 0 && section.mainHeading === "Boost Up" && (
              <div
                onClick={() => handleSelectItem(openDropdownId, section.mainHeading, "", section.mainHeading)}
                className="px-3 sm:px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 text-gray-700 text-sm"
              >
                {section.mainHeading}
              </div>
            )}
            
            {/* Render sub sections */}
            {section.subItems.map((subItem, subIdx) => {
              const subHeading = typeof subItem === 'object' && 'name' in subItem ? subItem.name : '';
              const itemList = typeof subItem === 'object' && 'items' in subItem ? subItem.items : [];
              
              return (
                <div key={subIdx}>
                  {subHeading && (
                    <div className="bg-gray-100 px-3 sm:px-4 py-1.5 text-xs font-semibold text-gray-700 border-b border-gray-200">
                      📦 {subHeading}
                    </div>
                  )}
                  
                  {itemList.map((itemName, itemIdx) => (
                    <div
                      key={itemIdx}
                      onClick={() => handleSelectItem(openDropdownId, section.mainHeading, subHeading, itemName)}
                      className="px-4 sm:px-6 py-1.5 sm:py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 text-gray-700 text-xs sm:text-sm transition-colors duration-150"
                    >
                      • {itemName}
                    </div>
                  ))}
                </div>
              );
            })}
            
            {/* For Prisma and Water which have subHeading empty but items directly */}
            {section.subItems.map((subItem, subIdx) => {
              const subHeading = typeof subItem === 'object' && 'name' in subItem ? subItem.name : '';
              const itemList = typeof subItem === 'object' && 'items' in subItem ? subItem.items : [];
              
              if (!subHeading && itemList.length > 0) {
                return itemList.map((itemName, itemIdx) => (
                  <div
                    key={`direct-${subIdx}-${itemIdx}`}
                    onClick={() => handleSelectItem(openDropdownId, section.mainHeading, "", itemName)}
                    className="px-4 sm:px-6 py-1.5 sm:py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 text-gray-700 text-xs sm:text-sm transition-colors duration-150"
                  >
                    • {itemName}
                  </div>
                ));
              }
              return null;
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="overflow-x-auto -mx-2 px-2">
        {/* Mobile: Stacked card layout (below 768px) */}
        <div className="block md:hidden space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500 font-semibold">#{item.sr}</span>
                <button
                  onClick={() => deleteRow(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Item Name</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={item.items}
                      onChange={(e) => updateItem(item.id, "items", e.target.value)}
                      placeholder="Enter item name..."
                      className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-l focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(item.id, el);
                        else buttonRefs.current.delete(item.id);
                      }}
                      onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r hover:bg-gray-200"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded text-center"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Unit Price (₨)</label>
                    <input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded text-center"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Amount:</span>
                  <span className="font-bold text-emerald-600 text-base">₨ {item.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed">
              No items added yet. Click Add Item to start.
            </div>
          )}
          
          <button
            onClick={addNewRow}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Tablet and Desktop: Table layout (768px and above) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-2 py-2 text-center w-12">Sr.</th>
                <th className="px-2 py-2 text-left min-w-[250px]">ITEMS</th>
                <th className="px-2 py-2 text-center w-24">QTY</th>
                <th className="px-2 py-2 text-center w-28">U/P (₨)</th>
                <th className="px-2 py-2 text-right w-32">AMOUNT (₨)</th>
                <th className="px-2 py-2 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-2 py-2 text-center text-gray-600 font-medium">{item.sr}</td>
                  <td className="px-2 py-2">
                    <div className="flex">
                      <input
                        type="text"
                        value={item.items}
                        onChange={(e) => updateItem(item.id, "items", e.target.value)}
                        placeholder="Enter item name..."
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-l focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        ref={(el) => {
                          if (el) buttonRefs.current.set(item.id, el);
                          else buttonRefs.current.delete(item.id);
                        }}
                        onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                        className="px-2 py-1.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r hover:bg-gray-200"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-center"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-center"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td className="px-2 py-2 text-right font-semibold">
                    ₨ {item.amount.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => deleteRow(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {items.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-lg">
              No items added yet. Click Add Item to start.
            </div>
          )}
          
          <div className="mt-3">
            <button
              onClick={addNewRow}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Render dropdown outside the table */}
      {renderDropdownMenu()}
    </>
  );
}