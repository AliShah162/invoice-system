"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit2, Save, X, ArrowLeft, Users, Search, 
  ChevronLeft, ChevronRight, Loader2 
} from "lucide-react";
import Link from "next/link";
import { customerDB, Customer } from "../lib/customerDB";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pageSize] = useState(50);
  const [formData, setFormData] = useState({
    customerName: "",
    shopName: "",
    contact: "",
  });
  
  // Use ref to track if this is the initial load
  const isInitialLoad = useRef(true);

  // Define loadCustomers as a regular async function (not useCallback)
  const loadCustomers = async () => {
    try {
      setLoading(true);
      if (searchTerm.trim()) {
        const results = await customerDB.searchCustomers(searchTerm);
        setCustomers(results);
        setTotalCustomers(results.length);
      } else {
        const { customers: paginatedCustomers, total } = await customerDB.getCustomersPaginated(currentPage, pageSize);
        setCustomers(paginatedCustomers);
        setTotalCustomers(total);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Initialize database on mount only
  useEffect(() => {
    const initDB = async () => {
      try {
        await customerDB.init();
        await loadCustomers();
      } catch (error) {
        console.error("Failed to initialize database:", error);
        alert("Failed to load customer database");
        setLoading(false);
      }
    };
    
    initDB();
  }, []); // Empty dependency array - only runs once on mount

  // Load customers when search term or page changes
  // Skip the first render since initial load already happened
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    loadCustomers();
  }, [searchTerm, currentPage]); // Remove loadCustomers from dependencies

  const handleAddCustomer = async () => {
    if (!formData.customerName.trim()) {
      alert("Customer Name is required!");
      return;
    }

    try {
      setLoading(true);
      await customerDB.addCustomer({
        customerName: formData.customerName.trim(),
        shopName: formData.shopName.trim(),
        contact: formData.contact.trim(),
      });
      
      setFormData({ customerName: "", shopName: "", contact: "" });
      setShowAddForm(false);
      setCurrentPage(1);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to add customer:", error);
      alert("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!formData.customerName.trim() || !editingId) {
      alert("Customer Name is required!");
      return;
    }

    try {
      setLoading(true);
      await customerDB.updateCustomer(editingId, {
        customerName: formData.customerName.trim(),
        shopName: formData.shopName.trim(),
        contact: formData.contact.trim(),
      });
      
      setFormData({ customerName: "", shopName: "", contact: "" });
      setEditingId(null);
      setShowAddForm(false);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      customerName: customer.customerName,
      shopName: customer.shopName,
      contact: customer.contact,
    });
    setEditingId(customer.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      setLoading(true);
      await customerDB.deleteCustomer(id);
      await loadCustomers();
      
      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    localStorage.setItem("selectedCustomer", JSON.stringify({
      customer: customer.customerName,
      shopName: customer.shopName,
      contact: customer.contact,
    }));
    router.push("/");
  };

  const cancelForm = () => {
    setFormData({ customerName: "", shopName: "", contact: "" });
    setEditingId(null);
    setShowAddForm(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCustomers / pageSize);

  return (
    <main className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg shadow-sm p-4 mb-4 text-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Customer List</h1>
                <p className="text-emerald-100 text-sm">
                  Total Customers: {totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invoice
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, shop name, or contact..."
              className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1">
              Found {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Add Customer Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Customer
          </button>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {editingId ? "Edit Customer" : "Add New Customer"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Enter shop name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={editingId ? handleUpdateCustomer : handleAddCustomer}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Save"}
              </button>
              <button
                onClick={cancelForm}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Customers List */}
        {loading && customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm ? "No customers match your search" : "No customers added yet"}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-400">Click Add New Customer to get started</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-3">
                      <div 
                        className="flex-1"
                        onClick={() => handleCustomerClick(customer)}
                      >
                        <h3 className="font-bold text-lg text-gray-800">
                          {customer.customerName}
                        </h3>
                        {customer.shopName && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Shop:</span> {customer.shopName}
                          </p>
                        )}
                        {customer.contact && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Contact:</span> {customer.contact}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Added: {new Date(customer.createdAt).toLocaleDateString()}
                          {customer.updatedAt !== customer.createdAt && 
                            ` (Updated: ${new Date(customer.updatedAt).toLocaleDateString()})`}
                        </p>
                      </div>
                      <div className="flex gap-2 items-start" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Only show when not searching */}
            {!searchTerm && totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Footer with count */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {customers.length} of {totalCustomers.toLocaleString()} customer{totalCustomers !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </main>
  );
}