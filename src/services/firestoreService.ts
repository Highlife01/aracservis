import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, onSnapshot, Unsubscribe, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { 
  Tenant, Customer, Vehicle, WorkOrder, InventoryItem, 
  TireHotelRecord, Appointment, WorkshopBay, Payment, User, AuditLog, AutomationRule 
} from '../types';

export class FirestoreService {
  // Collection Names
  public static COLLECTIONS = {
    TENANTS: 'tenants',
    USERS: 'users',
    CUSTOMERS: 'customers',
    VEHICLES: 'vehicles',
    WORK_ORDERS: 'work_orders',
    INVENTORY: 'inventory',
    TIRE_HOTEL: 'tire_hotel',
    APPOINTMENTS: 'appointments',
    BAYS: 'bays',
    PAYMENTS: 'payments',
    AUDIT_LOGS: 'audit_logs',
    AUTOMATIONS: 'automations',
  };

  /**
   * Generic realtime subscription for a tenant-isolated collection
   */
  public static subscribeToTenantCollection<T>(
    collectionName: string,
    tenantId: string,
    onData: (items: T[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, where('tenantId', '==', tenantId));

      return onSnapshot(q, (snapshot) => {
        const results: T[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        onData(results);
      }, (error) => {
        console.warn(`[Firestore] Subscription warning for ${collectionName}:`, error.message);
        if (onError) onError(error);
      });
    } catch (e: any) {
      console.warn(`[Firestore] Initialization fallback for ${collectionName}:`, e.message);
      return () => {};
    }
  }

  /**
   * Fetch all documents for a tenant once
   */
  public static async getTenantDocuments<T>(collectionName: string, tenantId: string): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      const items: T[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      return items;
    } catch (e: any) {
      console.warn(`[Firestore] getTenantDocuments error for ${collectionName}:`, e.message);
      return [];
    }
  }

  /**
   * Save or overwrite a single document in Firestore
   */
  public static async saveDocument<T extends { id: string; tenantId?: string }>(
    collectionName: string,
    item: T
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, {
        ...item,
        updatedAt: new Date().toISOString(),
        serverSyncedAt: serverTimestamp()
      }, { merge: true });
    } catch (e: any) {
      console.warn(`[Firestore] Write error on ${collectionName}/${item.id}:`, e.message);
    }
  }

  /**
   * Batch save multiple documents to Firestore
   */
  public static async saveDocumentsBatch<T extends { id: string; tenantId?: string }>(
    collectionName: string,
    items: T[]
  ): Promise<void> {
    if (!items || items.length === 0) return;
    try {
      const batch = writeBatch(db);
      items.forEach(item => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, {
          ...item,
          updatedAt: new Date().toISOString(),
          serverSyncedAt: serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
    } catch (e: any) {
      console.warn(`[Firestore] Batch save error on ${collectionName}:`, e.message);
    }
  }

  /**
   * Delete a document in Firestore
   */
  public static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (e: any) {
      console.warn(`[Firestore] Delete error on ${collectionName}/${id}:`, e.message);
    }
  }

  /**
   * Record an immutable audit log directly to Firestore
   */
  public static async logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      const id = 'log-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
      const docRef = doc(db, this.COLLECTIONS.AUDIT_LOGS, id);
      await setDoc(docRef, {
        ...log,
        id,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });
    } catch (e: any) {
      console.warn('[Firestore] Audit log error:', e.message);
    }
  }
}
