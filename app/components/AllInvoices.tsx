"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { invoiceDB, Invoice } from "../lib/db";
import { FileText, Trash2, Eye, Download, ChevronDown, ChevronUp } from "lucide-react";

interface AllInvoicesProps {
  refreshTrigger: number;
}

export default function AllInvoices({ refreshTrigger }: AllInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const isMounted = useRef(true);

  const fetchInvoices = useCallback(async () => {
    try {
      const allInvoices = await invoiceDB.getAllInvoices();
      return allInvoices;
    } catch (error) {
      console.error("Failed to load invoices:", error);
      return [];
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    const data = await fetchInvoices();
    if (isMounted.current) {
      setInvoices(data);
      setLoading(false);
    }
  }, [fetchInvoices]);

  useEffect(() => {
    isMounted.current = true;
    loadInvoices();
    
    return () => {
      isMounted.current = false;
    };
  }, [loadInvoices, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setLoading(true);
      await invoiceDB.deleteInvoice(id);
      const updatedInvoices = await fetchInvoices();
      if (isMounted.current) {
        setInvoices(updatedInvoices);
        setLoading(false);
      }
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const handlePrint = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 20px; }
              .total { margin-top: 20px; text-align: right; }
              @media print {
                body { padding: 0; margin: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>S.A TRADERS</h1>
              <p>Distributer | Quice Food Industries</p>
              <p>Plaza 134 Neelam Commercial, Block Dc Colony Gujranwala</p>
              <p>Phone: 03006443021 | 03067317386</p>
            </div>
            <h3>Invoice #: ${invoice.invoiceNumber}</h3>
            <p>Date: ${new Date(invoice.date).toLocaleString()}</p>
            <p>Customer: ${invoice.customerInfo.customer || "-"}</p>
            <p>Region: ${invoice.customerInfo.region || "-"}</p>
            <p>Shop Name: ${invoice.customerInfo.shopName || "-"}</p>
            <p>Contact: ${invoice.customerInfo.contact || "-"}</p>
            <table border="1" cellpadding="8" cellspacing="0">
              <thead>
                <tr style="background-color:#f2f2f2;">
                  <th>Sr.</th>
                  <th>Items</th>
                  <th>QTY</th>
                  <th>U/P (₨)</th>
                  <th>Amount (₨)</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.sr}</td>
                    <td>${item.items}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice}</td>
                    <td>${item.amount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <p><strong>Total:</strong> ₨ ${invoice.total.toLocaleString()}</p>
              <p><strong>Paid:</strong> ₨ ${invoice.paid.toLocaleString()}</p>
              <p><strong>Due:</strong> ₨ ${invoice.dueAmount.toLocaleString()}</p>
              <p><strong>Pre Balance:</strong> ₨ ${invoice.preBalance.toLocaleString()}</p>
              <p><strong>Net Total:</strong> ₨ ${invoice.netTotal.toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.print();
      printWindow.close();
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          All Invoices
        </h2>
        <span className="text-sm text-gray-500">{invoices.length} invoices</span>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No invoices saved yet</p>
          <p className="text-sm text-gray-400">Create an invoice and click Save to see it here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Invoice Header - Always visible */}
              <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(invoice.id)}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-emerald-600">
                        #{invoice.invoiceNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </span>
                      {expandedInvoices.has(invoice.id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-700">
                      <span className="font-semibold">Customer:</span> {invoice.customerInfo.customer || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Items: {invoice.items.length} | Total Items Qty: {invoice.items.reduce((sum, item) => sum + item.quantity, 0)} | Net Total: ₨ {invoice.netTotal.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(invoice);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(invoice);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Print"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(invoice.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Items Table */}
              {expandedInvoices.has(invoice.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Purchased Items:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-3 py-2 text-left">Sr.</th>
                          <th className="px-3 py-2 text-left">Item</th>
                          <th className="px-3 py-2 text-center">Quantity</th>
                          <th className="px-3 py-2 text-center">Unit Price (₨)</th>
                          <th className="px-3 py-2 text-right">Amount (₨)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-200">
                            <td className="px-3 py-2">{item.sr}</td>
                            <td className="px-3 py-2 font-medium">{item.items}</td>
                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                            <td className="px-3 py-2 text-center">{item.unitPrice.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-semibold">{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-semibold">
                          <td colSpan={4} className="px-3 py-2 text-right">Total:</td>
                          <td className="px-3 py-2 text-right">₨ {invoice.total.toLocaleString()}</td>
                        </tr>
                        <tr className="text-sm">
                          <td colSpan={4} className="px-3 py-1 text-right">Paid:</td>
                          <td className="px-3 py-1 text-right">₨ {invoice.paid.toLocaleString()}</td>
                        </tr>
                        <tr className="text-sm">
                          <td colSpan={4} className="px-3 py-1 text-right">Due:</td>
                          <td className="px-3 py-1 text-right text-orange-600">₨ {invoice.dueAmount.toLocaleString()}</td>
                        </tr>
                        <tr className="text-sm">
                          <td colSpan={4} className="px-3 py-1 text-right">Pre Balance:</td>
                          <td className="px-3 py-1 text-right">₨ {invoice.preBalance.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-emerald-50 font-bold">
                          <td colSpan={4} className="px-3 py-2 text-right">Net Total:</td>
                          <td className="px-3 py-2 text-right text-emerald-600">₨ {invoice.netTotal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing invoice details */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p>{new Date(selectedInvoice.date).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p>{selectedInvoice.customerInfo.customer || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Region</p>
                    <p>{selectedInvoice.customerInfo.region || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shop Name</p>
                    <p>{selectedInvoice.customerInfo.shopName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p>{selectedInvoice.customerInfo.contact || "-"}</p>
                  </div>
                </div>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="p-2">Sr.</th>
                      <th className="p-2 text-left">Items</th>
                      <th className="p-2">QTY</th>
                      <th className="p-2">U/P</th>
                      <th className="p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2 text-center">{item.sr}</td>
                        <td className="p-2">{item.items}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-center">{item.unitPrice}</td>
                        <td className="p-2 text-right">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="text-right space-y-2">
                  <p>Total: ₨ {selectedInvoice.total.toLocaleString()}</p>
                  <p>Paid: ₨ {selectedInvoice.paid.toLocaleString()}</p>
                  <p>Due: ₨ {selectedInvoice.dueAmount.toLocaleString()}</p>
                  <p>Pre Balance: ₨ {selectedInvoice.preBalance.toLocaleString()}</p>
                  <p className="font-bold text-lg">Net Total: ₨ {selectedInvoice.netTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}