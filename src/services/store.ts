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

class DataStore {
  private listeners: Set<() => void> = new Set();
  private unsubs: Unsubscribe[] = [];

  // Pure In-Memory Reactive Cache (No LocalStorage)
  private activeTenantId: string = 'tenant-usta';
  private tenants: Tenant[] = INITIAL_TENANTS;
  private users: User[] = INITIAL_USERS;
  private customers: Customer[] = INITIAL_CUSTOMERS;
  private vehicles: Vehicle[] = INITIAL_VEHICLES;
  private workOrders: WorkOrder[] = INITIAL_WORK_ORDERS;
  private inventory: InventoryItem[] = INITIAL_INVENTORY;
  private tireHotel: TireHotelRecord[] = INITIAL_TIRE_HOTEL;
  private appointments: Appointment[] = INITIAL_APPOINTMENTS;
  private bays: WorkshopBay[] = INITIAL_BAYS;
  private payments: Payment[] = INITIAL_PAYMENTS;
  private automations: AutomationRule[] = INITIAL_AUTOMATIONS;
  private auditLogs: AuditLog[] = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error('Listener error', e); }
    });
  }

  public init() {
    // Initial in-memory boot
    this.startRealtimeSync(this.activeTenantId);
  }

  /**
   * Start live Real-time Firestore synchronization for the active tenant
   * All data streams straight from Cloud Firestore without localStorage
   */
  public startRealtimeSync(tenantId: string) {
    this.stopRealtimeSync();
    this.activeTenantId = tenantId;

    // 1. Subscribe to Work Orders
    const unSubWO = FirestoreService.subscribeToTenantCollection<WorkOrder>(
      FirestoreService.COLLECTIONS.WORK_ORDERS,
      tenantId,
      (cloudWOs) => {
        if (cloudWOs && cloudWOs.length > 0) {
          this.workOrders = cloudWOs;
        } else {
          // Seed to Firestore if collection is empty on first run
          const seed = INITIAL_WORK_ORDERS.filter(w => w.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.WORK_ORDERS, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubWO);

    // 2. Subscribe to Vehicles
    const unSubVeh = FirestoreService.subscribeToTenantCollection<Vehicle>(
      FirestoreService.COLLECTIONS.VEHICLES,
      tenantId,
      (cloudVehs) => {
        if (cloudVehs && cloudVehs.length > 0) {
          this.vehicles = cloudVehs;
        } else {
          const seed = INITIAL_VEHICLES.filter(v => v.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.VEHICLES, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubVeh);

    // 3. Subscribe to Customers
    const unSubCust = FirestoreService.subscribeToTenantCollection<Customer>(
      FirestoreService.COLLECTIONS.CUSTOMERS,
      tenantId,
      (cloudCusts) => {
        if (cloudCusts && cloudCusts.length > 0) {
          this.customers = cloudCusts;
        } else {
          const seed = INITIAL_CUSTOMERS.filter(c => c.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.CUSTOMERS, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubCust);

    // 4. Subscribe to Inventory
    const unSubInv = FirestoreService.subscribeToTenantCollection<InventoryItem>(
      FirestoreService.COLLECTIONS.INVENTORY,
      tenantId,
      (cloudInv) => {
        if (cloudInv && cloudInv.length > 0) {
          this.inventory = cloudInv;
        } else {
          const seed = INITIAL_INVENTORY.filter(i => i.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.INVENTORY, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubInv);

    // 5. Subscribe to Appointments
    const unSubApt = FirestoreService.subscribeToTenantCollection<Appointment>(
      FirestoreService.COLLECTIONS.APPOINTMENTS,
      tenantId,
      (cloudApts) => {
        if (cloudApts && cloudApts.length > 0) {
          this.appointments = cloudApts;
        } else {
          const seed = INITIAL_APPOINTMENTS.filter(a => a.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.APPOINTMENTS, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubApt);

    // 6. Subscribe to Bays
    const unSubBays = FirestoreService.subscribeToTenantCollection<WorkshopBay>(
      FirestoreService.COLLECTIONS.BAYS,
      tenantId,
      (cloudBays) => {
        if (cloudBays && cloudBays.length > 0) {
          this.bays = cloudBays;
        } else {
          const seed = INITIAL_BAYS.filter(b => b.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.BAYS, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubBays);

    // 7. Subscribe to Payments
    const unSubPay = FirestoreService.subscribeToTenantCollection<Payment>(
      FirestoreService.COLLECTIONS.PAYMENTS,
      tenantId,
      (cloudPays) => {
        if (cloudPays && cloudPays.length > 0) {
          this.payments = cloudPays;
        } else {
          const seed = INITIAL_PAYMENTS.filter(p => p.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.PAYMENTS, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubPay);

    // 8. Subscribe to Tire Hotel
    const unSubTire = FirestoreService.subscribeToTenantCollection<TireHotelRecord>(
      FirestoreService.COLLECTIONS.TIRE_HOTEL,
      tenantId,
      (cloudTire) => {
        if (cloudTire && cloudTire.length > 0) {
          this.tireHotel = cloudTire;
        } else {
          const seed = INITIAL_TIRE_HOTEL.filter(t => t.tenantId === tenantId);
          if (seed.length > 0) {
            FirestoreService.saveDocumentsBatch(FirestoreService.COLLECTIONS.TIRE_HOTEL, seed);
          }
        }
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubTire);

    // 9. Subscribe to Audit Logs
    const unSubLogs = FirestoreService.subscribeToTenantCollection<AuditLog>(
      FirestoreService.COLLECTIONS.AUDIT_LOGS,
      tenantId,
      (cloudLogs) => {
        this.auditLogs = cloudLogs;
        this.notifyListeners();
      }
    );
    this.unsubs.push(unSubLogs);
  }

  public stopRealtimeSync() {
    this.unsubs.forEach(fn => {
      try { fn(); } catch (e) { console.error('Unsub error', e); }
    });
    this.unsubs = [];
  }

  // --- Active Tenant ID ---
  public getActiveTenantId(): string {
    return this.activeTenantId;
  }

  public setActiveTenantId(tenantId: string): void {
    this.activeTenantId = tenantId;
    this.startRealtimeSync(tenantId);
    this.notifyListeners();
  }

  // --- Tenants ---
  public getTenants(): Tenant[] {
    return this.tenants;
  }

  public getTenantById(id: string): Tenant | undefined {
    return this.tenants.find(t => t.id === id);
  }

  public getTenantBySlug(slug: string): Tenant | undefined {
    return this.tenants.find(t => t.slug === slug);
  }

  public saveTenant(tenant: Tenant): void {
    const idx = this.tenants.findIndex(t => t.id === tenant.id);
    if (idx >= 0) this.tenants[idx] = tenant;
    else this.tenants.push(tenant);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.TENANTS, tenant);
  }

  // --- Customers ---
  public getCustomers(tenantId?: string): Customer[] {
    if (!tenantId) return this.customers;
    return this.customers.filter(c => c.tenantId === tenantId);
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  public saveCustomer(customer: Customer): void {
    const idx = this.customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) this.customers[idx] = customer;
    else this.customers.push(customer);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.CUSTOMERS, customer);
  }

  // --- Vehicles ---
  public getVehicles(tenantId?: string): Vehicle[] {
    if (!tenantId) return this.vehicles;
    return this.vehicles.filter(v => v.tenantId === tenantId);
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  public getVehicleByPlate(plate: string, tenantId?: string): Vehicle | undefined {
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    return this.getVehicles(tenantId).find(v => v.plate.replace(/\s+/g, '').toUpperCase() === clean);
  }

  public saveVehicle(vehicle: Vehicle): void {
    const idx = this.vehicles.findIndex(v => v.id === vehicle.id);
    if (idx >= 0) this.vehicles[idx] = vehicle;
    else this.vehicles.push(vehicle);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.VEHICLES, vehicle);
  }

  // --- Work Orders ---
  public getWorkOrders(tenantId?: string): WorkOrder[] {
    if (!tenantId) return this.workOrders;
    return this.workOrders.filter(w => w.tenantId === tenantId);
  }

  public getWorkOrderById(id: string): WorkOrder | undefined {
    return this.workOrders.find(w => w.id === id);
  }

  public saveWorkOrder(workOrder: WorkOrder): void {
    const idx = this.workOrders.findIndex(w => w.id === workOrder.id);
    if (idx >= 0) this.workOrders[idx] = workOrder;
    else this.workOrders.push(workOrder);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.WORK_ORDERS, workOrder);
  }

  // --- Inventory ---
  public getInventory(tenantId?: string): InventoryItem[] {
    if (!tenantId) return this.inventory;
    return this.inventory.filter(i => i.tenantId === tenantId);
  }

  public saveInventoryItem(item: InventoryItem): void {
    const idx = this.inventory.findIndex(i => i.id === item.id);
    if (idx >= 0) this.inventory[idx] = item;
    else this.inventory.push(item);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.INVENTORY, item);
  }

  // --- Tire Hotel ---
  public getTireHotel(tenantId?: string): TireHotelRecord[] {
    if (!tenantId) return this.tireHotel;
    return this.tireHotel.filter(t => t.tenantId === tenantId);
  }

  public getTireHotelRecords(tenantId?: string): TireHotelRecord[] {
    return this.getTireHotel(tenantId);
  }

  public saveTireRecord(record: TireHotelRecord): void {
    const idx = this.tireHotel.findIndex(t => t.id === record.id);
    if (idx >= 0) this.tireHotel[idx] = record;
    else this.tireHotel.push(record);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.TIRE_HOTEL, record);
  }

  public saveTireHotelRecord(record: TireHotelRecord): void {
    this.saveTireRecord(record);
  }

  // --- Appointments ---
  public getAppointments(tenantId?: string): Appointment[] {
    if (!tenantId) return this.appointments;
    return this.appointments.filter(a => a.tenantId === tenantId);
  }

  public saveAppointment(appointment: Appointment): void {
    const idx = this.appointments.findIndex(a => a.id === appointment.id);
    if (idx >= 0) this.appointments[idx] = appointment;
    else this.appointments.push(appointment);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.APPOINTMENTS, appointment);
  }

  // --- Bays ---
  public getBays(tenantId?: string): WorkshopBay[] {
    if (!tenantId) return this.bays;
    return this.bays.filter(b => b.tenantId === tenantId);
  }

  public saveBay(bay: WorkshopBay): void {
    const idx = this.bays.findIndex(b => b.id === bay.id);
    if (idx >= 0) this.bays[idx] = bay;
    else this.bays.push(bay);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.BAYS, bay);
  }

  // --- Payments ---
  public getPayments(tenantId?: string): Payment[] {
    if (!tenantId) return this.payments;
    return this.payments.filter(p => p.tenantId === tenantId);
  }

  public savePayment(payment: Payment): void {
    const idx = this.payments.findIndex(p => p.id === payment.id);
    if (idx >= 0) this.payments[idx] = payment;
    else this.payments.push(payment);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.PAYMENTS, payment);
  }

  // --- Users ---
  public getUsers(tenantId?: string): User[] {
    if (!tenantId) return this.users;
    return this.users.filter(u => u.tenantId === tenantId);
  }

  public saveUser(user: User): void {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx >= 0) this.users[idx] = user;
    else this.users.push(user);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.USERS, user);
  }

  // --- Automations ---
  public getAutomations(tenantId?: string): AutomationRule[] {
    if (!tenantId) return this.automations;
    return this.automations.filter(a => a.tenantId === tenantId);
  }

  public saveAutomation(rule: AutomationRule): void {
    const idx = this.automations.findIndex(a => a.id === rule.id);
    if (idx >= 0) this.automations[idx] = rule;
    else this.automations.push(rule);
    this.notifyListeners();
    FirestoreService.saveDocument(FirestoreService.COLLECTIONS.AUTOMATIONS, rule);
  }

  // --- Audit Logs ---
  public getAuditLogs(tenantId?: string): AuditLog[] {
    if (!tenantId) return this.auditLogs;
    return this.auditLogs.filter(l => l.tenantId === tenantId);
  }
}

export const store = new DataStore();
store.init();
