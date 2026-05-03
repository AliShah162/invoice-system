export interface Customer {
  id: string;
  customerName: string;
  shopName: string;
  contact: string;
  createdAt: number;
  updatedAt: number;
}

class CustomerDB {
  private dbName = "CustomerDB";
  private storeName = "customers";
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("customerName", "customerName", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("contact", "contact", { unique: false });
        }
      };
    });
  }

  async addCustomer(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    await this.init();
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customer,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.add(newCustomer);
      
      request.onsuccess = () => resolve(newCustomer);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCustomer(id: string, updates: Partial<Omit<Customer, "id" | "createdAt">>): Promise<Customer> {
    await this.init();
    
    const customer = await this.getCustomer(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    
    const updatedCustomer: Customer = {
      ...customer,
      ...updates,
      updatedAt: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(updatedCustomer);
      
      request.onsuccess = () => resolve(updatedCustomer);
      request.onerror = () => reject(request.error);
    });
  }

  async getCustomer(id: string): Promise<Customer | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCustomers(): Promise<Customer[]> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("createdAt");
      const request = index.openCursor(null, "prev");
      
      const customers: Customer[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          customers.push(cursor.value);
          cursor.continue();
        } else {
          resolve(customers);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    await this.init();
    
    if (!searchTerm.trim()) {
      return this.getAllCustomers();
    }
    
    const allCustomers = await this.getAllCustomers();
    const term = searchTerm.toLowerCase().trim();
    
    return allCustomers.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(term) ||
        customer.shopName.toLowerCase().includes(term) ||
        customer.contact.toLowerCase().includes(term)
    );
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAllCustomers(): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTotalCount(): Promise<number> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Pagination support for large datasets
  async getCustomersPaginated(page: number, pageSize: number): Promise<{ customers: Customer[]; total: number }> {
    await this.init();
    
    const total = await this.getTotalCount();
    const start = (page - 1) * pageSize;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("createdAt");
      const request = index.openCursor(null, "prev");
      
      const customers: Customer[] = [];
    //   let count = 0;
      let skipped = 0;
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && customers.length < pageSize) {
          if (skipped >= start) {
            customers.push(cursor.value);
          } else {
            skipped++;
          }
          cursor.continue();
        } else {
          resolve({ customers, total });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const customerDB = new CustomerDB();