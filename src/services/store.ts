import { 
  Tenant, Customer, Vehicle, WorkOrder, InventoryItem, 
  TireHotelRecord, Appointment, WorkshopBay, Payment, User, AutomationRule, AuditLog 
} from '../types';
import { 
  INITIAL_TENANTS, INITIAL_CUSTOMERS, INITIAL_VEHICLES, 
  INITIAL_WORK_ORDERS, INITIAL_INVENTORY, INITIAL_TIRE_HOTEL, 
  INITIAL_APPOINTMENTS, INITIAL_BAYS, INITIAL_PAYMENTS, INITIAL_USERS, INITIAL_AUTOMATIONS 
} from './mockSeedData';

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
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
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
  }

  public getActiveTenantId(): string {
    return this.get<string>(STORAGE_KEYS.ACTIVE_TENANT_ID, 'tenant-usta');
  }

  public setActiveTenantId(id: string): void {
    this.set(STORAGE_KEYS.ACTIVE_TENANT_ID, id);
  }

  // --- Customers (Tenant Isolated) ---
  public getCustomers(tenantId?: string): Customer[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS).filter(c => c.tenantId === tId);
  }

  public saveCustomer(customer: Customer): void {
    const list = this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.unshift(customer);
    this.set(STORAGE_KEYS.CUSTOMERS, list);
    this.logAudit(customer.tenantId, 'SAVE_CUSTOMER', 'CUSTOMER', customer.id, customer);
  }

  // --- Vehicles ---
  public getVehicles(tenantId?: string): Vehicle[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES).filter(v => v.tenantId === tId);
  }

  public getVehicleByPlate(plate: string, tenantId?: string): Vehicle | undefined {
    const formatted = plate.replace(/\s+/g, '').toUpperCase();
    return this.getVehicles(tenantId).find(v => v.plate.replace(/\s+/g, '').toUpperCase() === formatted);
  }

  public saveVehicle(vehicle: Vehicle): void {
    const list = this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    const idx = list.findIndex(v => v.id === vehicle.id);
    if (idx >= 0) list[idx] = vehicle;
    else list.unshift(vehicle);
    this.set(STORAGE_KEYS.VEHICLES, list);
    this.logAudit(vehicle.tenantId, 'SAVE_VEHICLE', 'VEHICLE', vehicle.id, vehicle);
  }

  // --- Work Orders ---
  public getWorkOrders(tenantId?: string): WorkOrder[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS).filter(w => w.tenantId === tId);
  }

  public getWorkOrderById(id: string): WorkOrder | undefined {
    return this.get<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS).find(w => w.id === id);
  }

  public saveWorkOrder(wo: WorkOrder): void {
    const list = this.get<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
    const idx = list.findIndex(w => w.id === wo.id);
    if (idx >= 0) list[idx] = wo;
    else list.unshift(wo);
    this.set(STORAGE_KEYS.WORK_ORDERS, list);
    this.logAudit(wo.tenantId, 'SAVE_WORK_ORDER', 'WORK_ORDER', wo.id, { status: wo.status, total: wo.totalAmount });
  }

  // --- Inventory ---
  public getInventory(tenantId?: string): InventoryItem[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY).filter(i => i.tenantId === tId);
  }

  public saveInventoryItem(item: InventoryItem): void {
    const list = this.get<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.set(STORAGE_KEYS.INVENTORY, list);
  }

  // --- Tire Hotel ---
  public getTireHotelRecords(tenantId?: string): TireHotelRecord[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<TireHotelRecord[]>(STORAGE_KEYS.TIRE_HOTEL, INITIAL_TIRE_HOTEL).filter(r => r.tenantId === tId);
  }

  public saveTireHotelRecord(record: TireHotelRecord): void {
    const list = this.get<TireHotelRecord[]>(STORAGE_KEYS.TIRE_HOTEL, INITIAL_TIRE_HOTEL);
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);
    this.set(STORAGE_KEYS.TIRE_HOTEL, list);
  }

  // --- Appointments ---
  public getAppointments(tenantId?: string): Appointment[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS).filter(a => a.tenantId === tId);
  }

  public saveAppointment(apt: Appointment): void {
    const list = this.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const idx = list.findIndex(a => a.id === apt.id);
    if (idx >= 0) list[idx] = apt;
    else list.unshift(apt);
    this.set(STORAGE_KEYS.APPOINTMENTS, list);
  }

  // --- Workshop Bays ---
  public getBays(tenantId?: string): WorkshopBay[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<WorkshopBay[]>(STORAGE_KEYS.BAYS, INITIAL_BAYS).filter(b => b.tenantId === tId);
  }

  public saveBay(bay: WorkshopBay): void {
    const list = this.get<WorkshopBay[]>(STORAGE_KEYS.BAYS, INITIAL_BAYS);
    const idx = list.findIndex(b => b.id === bay.id);
    if (idx >= 0) list[idx] = bay;
    else list.push(bay);
    this.set(STORAGE_KEYS.BAYS, list);
  }

  // --- Payments ---
  public getPayments(tenantId?: string): Payment[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS).filter(p => p.tenantId === tId);
  }

  public savePayment(payment: Payment): void {
    const list = this.get<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    list.unshift(payment);
    this.set(STORAGE_KEYS.PAYMENTS, list);

    // Update work order paid amount if applicable
    if (payment.workOrderId) {
      const wo = this.getWorkOrderById(payment.workOrderId);
      if (wo) {
        wo.paidAmount = (wo.paidAmount || 0) + payment.amount;
        if (wo.paidAmount >= wo.totalAmount) {
          wo.paymentStatus = 'PAID';
        } else if (wo.paidAmount > 0) {
          wo.paymentStatus = 'PARTIALLY_PAID';
        }
        this.saveWorkOrder(wo);
      }
    }
  }

  // --- Automations ---
  public getAutomations(tenantId?: string): AutomationRule[] {
    const tId = tenantId || this.getActiveTenantId();
    return this.get<AutomationRule[]>(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS).filter(a => a.tenantId === tId);
  }

  // --- Audit Logs ---
  public logAudit(tenantId: string, action: string, entityType: string, entityId: string, payload?: any): void {
    const logs = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newLog: AuditLog = {
      id: 'audit-' + Math.random().toString(36).substr(2, 9),
      tenantId,
      userId: 'user-current',
      userName: 'Aktif Kullanıcı',
      action,
      entityType,
      entityId,
      newValues: payload,
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // keep last 500
  }

  public getAuditLogs(tenantId?: string): AuditLog[] {
    const logs = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    if (!tenantId) return logs;
    return logs.filter(l => l.tenantId === tenantId);
  }

  // Reset demo data
  public resetToDefaults(): void {
    localStorage.clear();
    this.init();
  }
}

export const store = new DataStore();
store.init();
