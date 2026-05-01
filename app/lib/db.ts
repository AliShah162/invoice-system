export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerInfo: {
    customer: string;
    region: string;
    shopName: string;
    contact: string;
  };
  items: Array<{
    id: string;
    sr: number;
    items: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  total: number;
  paid: number;
  dueAmount: number;
  preBalance: number;
  netTotal: number;
}

class InvoiceDB {
  private dbName = "InvoiceDB";
  private storeName = "invoices";
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2); // Incremented version number for schema change
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("date", "date");
          store.createIndex("invoiceNumber", "invoiceNumber");
        }
      };
    });
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(invoice);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllInvoices(): Promise<Invoice[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("date");
      const request = index.openCursor(null, "prev");
      const invoices: Invoice[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          invoices.push(cursor.value);
          cursor.continue();
        } else {
          resolve(invoices);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllInvoices(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const invoiceDB = new InvoiceDB();