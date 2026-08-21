import { 
  Tenant, Customer, Vehicle, WorkOrder, InventoryItem, 
  TireHotelRecord, Appointment, WorkshopBay, Payment, User, AutomationRule, AuditLog 
} from '../types';
import { 
  INITIAL_TENANTS, INITIAL_CUSTOMERS, INITIAL_VEHICLES, 
  INITIAL_WORK_ORDERS, INITIAL_INVENTORY, INITIAL_TIRE_HOTEL, 
  INITIAL_APPOINTMENTS, INITIAL_BAYS, INITIAL_PAYMENTS, INITIAL_USERS, INITIAL_AUTOMATIONS 
} from './mockSeedData';
import { FirestoreService } from './firestoreService';
import { Unsubscribe } from 'firebase/firestore';

const STORAGE_KEYS = {
  TENANTS: 'autoservice_tenants',
  ACTIVE_TENANT_ID: 'autoservice_active_tenant_id',
  USERS: 'autoservice_users',
  CUSTOMERS: 'autoservice_customers',
  VEHICLES: 'autoservice_vehicles',
  WORK_ORDERS: 'autoservice_work_orders',
  INVENTORY: 'autoservice_inventory',
  TIRE_HOTEL: 'autoservice_tire_hotel',
  APPOINTMENTS: 'autoservice_appointments',
  BAYS: 'autoservice_bays',
  PAYMENTS: 'autoservice_payments',
  AUTOMATIONS: 'autoservice_automations',
  AUDIT_LOGS: 'autoservice_audit_logs',
};

class DataStore {
  private listeners: Set<() => void> = new Set();
  private unsubs: Unsubscribe[] = [];

  private get<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultVal;
      return JSON.parse(data) as T;
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      this.notifyListeners();
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error('Listener error', e); }
    });
  }

  // Initialize store if empty
  public init() {
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      this.set(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID)) {
      this.set(STORAGE_KEYS.ACTIVE_TENANT_ID, 'tenant-usta');
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.set(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      this.set(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORK_ORDERS)) {
      this.set(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.set(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIRE_HOTEL)) {
      this.set(STORAGE_KEYS.TIRE_HOTEL, INITIAL_TIRE_HOTEL);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.set(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BAYS)) {
      this.set(STORAGE_KEYS.BAYS, INITIAL_BAYS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      this.set(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTOMATIONS)) {
      this.set(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS);
    }
  }

  /**
   * Start live Real-time Firestore synchronization for the active tenant
   */
  public startRealtimeSync(tenantId: string) {
    this.stopRealtimeSync();

    // Subscribe to Work Orders
    const unSubWO = FirestoreService.subscribeToTenantCollection<WorkOrder>(
      FirestoreService.COLLECTIONS.WORK_ORDERS,
      tenantId,
      (cloudWOs) => {
        if (cloudWOs && cloudWOs.length > 0) {
          const local = this.getWorkOrders();
          const merged = this.mergeCollections(local, cloudWOs, tenantId);
          this.set(STORAGE_KEYS.WORK_ORDERS, merged);
        }
      }
    );
    this.unsubs.push(unSubWO);

    // Subscribe to Vehicles
    const unSubVeh = FirestoreService.subscribeToTenantCollection<Vehicle>(
      FirestoreService.COLLECTIONS.VEHICLES,
      tenantId,
      (cloudVehs) => {
        if (cloudVehs && cloudVehs.length > 0) {
          const local = this.getVehicles();
          const merged = this.mergeCollections(local, cloudVehs, tenantId);
          this.set(STORAGE_KEYS.VEHICLES, merged);
        }
      }
    );
    this.unsubs.push(unSubVeh);

    // Subscribe to Customers
    const unSubCust = FirestoreService.subscribeToTenantCollection<Customer>(
      FirestoreService.COLLECTIONS.CUSTOMERS,
      tenantId,
      (cloudCusts) => {
        if (cloudCusts && cloudCusts.length > 0) {
          const local = this.getCustomers();
          const merged = this.mergeCollections(local, cloudCusts, tenantId);
          this.set(STORAGE_KEYS.CUSTOMERS, merged);
        }
      }
    );
    this.unsubs.push(unSubCust);

    // Subscribe to Appointments
    const unSubApt = FirestoreService.subscribeToTenantCollection<Appointment>(
      FirestoreService.COLLECTIONS.APPOINTMENTS,
      tenantId,
      (cloudApts) => {
        if (cloudApts && cloudApts.length > 0) {
          const local = this.getAppointments();
          const merged = this.mergeCollections(local, cloudApts, tenantId);
          this.set(STORAGE_KEYS.APPOINTMENTS, merged);
        }
      }
    );
    this.unsubs.push(unSubApt);

    // Subscribe to Bays
    const unSubBays = FirestoreService.subscribeToTenantCollection<WorkshopBay>(
      FirestoreService.COLLECTIONS.BAYS,
      tenantId,
      (cloudBays) => {
        if (cloudBays && cloudBays.length > 0) {
          const local = this.getBays();
          const merged = this.mergeCollections(local, cloudBays, tenantId);
          this.set(STORAGE_KEYS.BAYS, merged);
        }
      }
    );
    this.unsubs.push(unSubBays);

    // Subscribe to Payments
    const unSubPay = FirestoreService.subscribeToTenantCollection<Payment>(
      FirestoreService.COLLECTIONS.PAYMENTS,
      tenantId,
      (cloudPays) => {
        if (cloudPays && cloudPays.length > 0) {
          const local = this.getPayments();
          const merged = this.mergeCollections(local, cloudPays, tenantId);
          this.set(STORAGE_KEYS.PAYMENTS, merged);
        }
      }
    );
    this.unsubs.push(unSubPay);
  }

  public stopRealtimeSync() {
    this.unsubs.forEach(fn => fn());
    this.unsubs = [];
  }

  private mergeCollections<T extends { id: string; tenantId?: string }>(local: T[], cloud: T[], tenantId: string): T[] {
    const otherTenants = local.filter(item => item.tenantId && item.tenantId !== tenantId);
    const map = new Map<string, T>();
    cloud.forEach(c => map.set(c.id, c));
    return [...otherTenants, ...Array.from(map.values())];
  }

  // --- Active Tenant ID ---
  public getActiveTenantId(): string {
    return this.get<string>(STORAGE_KEYS.ACTIVE_TENANT_ID, 'tenant-usta');
  }

  public setActiveTenantId(tenantId: string): void {
    this.set(STORAGE_KEYS.ACTIVE_TENANT_ID, tenantId);
    this.startRealtimeSync(tenantId);
  }

  // --- Tenants ---
  public getTenants(): Tenant[] {
    return this.get<Tenant[]>(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  }

  public getTenantById(id: string): Tenant | undefined {
    return this.getTenants().find(t => t.id === id);
  }

  public getTenantBySlug(slug: string): Tenant | undefined {
    return this.getTenants().find(t => t.slug === slug);
  }

  public saveTenant(tenant: Tenant): void {
    const list = this.getTenants();
    const idx = list.findIndex(t => t.id === tenant.id);
    if (idx >= 0) list[idx] = tenant;
    else list.push(tenant);
    this.set(STORAGE_KEYS.TENANTS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.TENANTS, tenant);
  }

  // --- Customers ---
  public getCustomers(tenantId?: string): Customer[] {
    const list = this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    if (!tenantId) return list;
    return list.filter(c => c.tenantId === tenantId);
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  public saveCustomer(customer: Customer): void {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.push(customer);
    this.set(STORAGE_KEYS.CUSTOMERS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.CUSTOMERS, customer);
  }

  // --- Vehicles ---
  public getVehicles(tenantId?: string): Vehicle[] {
    const list = this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    if (!tenantId) return list;
    return list.filter(v => v.tenantId === tenantId);
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.id === id);
  }

  public getVehicleByPlate(plate: string, tenantId?: string): Vehicle | undefined {
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    return this.getVehicles(tenantId).find(v => v.plate.replace(/\s+/g, '').toUpperCase() === clean);
  }

  public saveVehicle(vehicle: Vehicle): void {
    const list = this.getVehicles();
    const idx = list.findIndex(v => v.id === vehicle.id);
    if (idx >= 0) list[idx] = vehicle;
    else list.push(vehicle);
    this.set(STORAGE_KEYS.VEHICLES, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.VEHICLES, vehicle);
  }

  // --- Work Orders ---
  public getWorkOrders(tenantId?: string): WorkOrder[] {
    const list = this.get<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
    if (!tenantId) return list;
    return list.filter(w => w.tenantId === tenantId);
  }

  public getWorkOrderById(id: string): WorkOrder | undefined {
    return this.getWorkOrders().find(w => w.id === id);
  }

  public saveWorkOrder(workOrder: WorkOrder): void {
    const list = this.getWorkOrders();
    const idx = list.findIndex(w => w.id === workOrder.id);
    if (idx >= 0) list[idx] = workOrder;
    else list.push(workOrder);
    this.set(STORAGE_KEYS.WORK_ORDERS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.WORK_ORDERS, workOrder);
  }

  // --- Inventory ---
  public getInventory(tenantId?: string): InventoryItem[] {
    const list = this.get<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    if (!tenantId) return list;
    return list.filter(i => i.tenantId === tenantId);
  }

  public saveInventoryItem(item: InventoryItem): void {
    const list = this.getInventory();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    this.set(STORAGE_KEYS.INVENTORY, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.INVENTORY, item);
  }

  // --- Tire Hotel ---
  public getTireHotel(tenantId?: string): TireHotelRecord[] {
    const list = this.get<TireHotelRecord[]>(STORAGE_KEYS.TIRE_HOTEL, INITIAL_TIRE_HOTEL);
    if (!tenantId) return list;
    return list.filter(t => t.tenantId === tenantId);
  }

  public getTireHotelRecords(tenantId?: string): TireHotelRecord[] {
    return this.getTireHotel(tenantId);
  }

  public saveTireRecord(record: TireHotelRecord): void {
    const list = this.getTireHotel();
    const idx = list.findIndex(t => t.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    this.set(STORAGE_KEYS.TIRE_HOTEL, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.TIRE_HOTEL, record);
  }

  public saveTireHotelRecord(record: TireHotelRecord): void {
    this.saveTireRecord(record);
  }

  // --- Appointments ---
  public getAppointments(tenantId?: string): Appointment[] {
    const list = this.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    if (!tenantId) return list;
    return list.filter(a => a.tenantId === tenantId);
  }

  public saveAppointment(appointment: Appointment): void {
    const list = this.getAppointments();
    const idx = list.findIndex(a => a.id === appointment.id);
    if (idx >= 0) list[idx] = appointment;
    else list.push(appointment);
    this.set(STORAGE_KEYS.APPOINTMENTS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.APPOINTMENTS, appointment);
  }

  // --- Bays ---
  public getBays(tenantId?: string): WorkshopBay[] {
    const list = this.get<WorkshopBay[]>(STORAGE_KEYS.BAYS, INITIAL_BAYS);
    if (!tenantId) return list;
    return list.filter(b => b.tenantId === tenantId);
  }

  public saveBay(bay: WorkshopBay): void {
    const list = this.getBays();
    const idx = list.findIndex(b => b.id === bay.id);
    if (idx >= 0) list[idx] = bay;
    else list.push(bay);
    this.set(STORAGE_KEYS.BAYS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.BAYS, bay);
  }

  // --- Payments ---
  public getPayments(tenantId?: string): Payment[] {
    const list = this.get<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (!tenantId) return list;
    return list.filter(p => p.tenantId === tenantId);
  }

  public savePayment(payment: Payment): void {
    const list = this.getPayments();
    const idx = list.findIndex(p => p.id === payment.id);
    if (idx >= 0) list[idx] = payment;
    else list.push(payment);
    this.set(STORAGE_KEYS.PAYMENTS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.PAYMENTS, payment);
  }

  // --- Users ---
  public getUsers(tenantId?: string): User[] {
    const list = this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!tenantId) return list;
    return list.filter(u => u.tenantId === tenantId);
  }

  public saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx >= 0) list[idx] = user;
    else list.push(user);
    this.set(STORAGE_KEYS.USERS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.USERS, user);
  }

  // --- Automations ---
  public getAutomations(tenantId?: string): AutomationRule[] {
    const list = this.get<AutomationRule[]>(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS);
    if (!tenantId) return list;
    return list.filter(a => a.tenantId === tenantId);
  }

  public saveAutomation(rule: AutomationRule): void {
    const list = this.getAutomations();
    const idx = list.findIndex(a => a.id === rule.id);
    if (idx >= 0) list[idx] = rule;
    else list.push(rule);
    this.set(STORAGE_KEYS.AUTOMATIONS, list);
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.AUTOMATIONS, rule);
  }

  // --- Audit Logs ---
  public getAuditLogs(tenantId?: string): AuditLog[] {
    const list = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    if (!tenantId) return list;
    return list.filter(l => l.tenantId === tenantId);
  }
}

export const store = new DataStore();
store.init();
