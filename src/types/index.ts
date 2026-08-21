// ==========================================
// AUTOSERVICE OS - DOMAIN MODEL TYPES
// ==========================================

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'TENANT_OWNER'
  | 'TENANT_MANAGER'
  | 'BRANCH_MANAGER'
  | 'SERVICE_ADVISOR'
  | 'TECHNICIAN'
  | 'INVENTORY_MANAGER'
  | 'ACCOUNTANT'
  | 'TIRE_SPECIALIST'
  | 'FLEET_MANAGER'
  | 'END_CUSTOMER';

export interface User {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  createdAt: string;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
  legalName: string;
  taxOffice: string;
  taxNo: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  currency: string;
  vatRate: number; // Default 20
  smsSenderTitle?: string;
  customDomain?: string;
}

export interface TenantPlan {
  id: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'FRANCHISE';
  name: string;
  maxUsers: number;
  maxBranches: number;
  maxMonthlyWorkOrders: number;
  priceMonthlyTRY: number;
  features: string[];
}

export interface Tenant {
  id: string;
  slug: string; // e.g. usta-otomotiv
  name: string;
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'SUSPENDED';
  planId: TenantPlan['id'];
  branding: TenantBranding;
  trialEndsAt?: string;
  createdAt: string;
  featureFlags: Record<string, boolean>;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  workingHours: string;
  bayCount: number;
  isActive: boolean;
}

// ------------------------------------------
// CRM: CUSTOMER & VEHICLE
// ------------------------------------------
export type CustomerType = 'INDIVIDUAL' | 'CORPORATE' | 'FLEET';
export type CustomerSegment = 'VIP' | 'REGULAR' | 'AT_RISK' | 'LOST' | 'FLEET';

export interface Customer {
  id: string;
  tenantId: string;
  type: CustomerType;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  taxOffice?: string;
  taxNoOrTc?: string;
  city: string;
  district?: string;
  address: string;
  segment: CustomerSegment;
  discountRate: number; // %
  loyaltyPoints: number;
  ltv: number;
  totalSpent: number;
  visitCount: number;
  lastVisitDate?: string;
  npsScore?: number;
  optInSms: boolean;
  optInWhatsApp: boolean;
  optInEmail: boolean;
  notes?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  tenantId: string;
  customerId: string;
  fleetId?: string;
  plate: string;
  vin: string;
  make: string;
  model: string;
  subModel?: string;
  year: number;
  fuelType: 'BENZIN' | 'DIZEL' | 'LPG' | 'HIBRIZ' | 'ELEKTRIK';
  transmission: 'MANUEL' | 'OTOMATIK' | 'YARI_OTOMATIK';
  color: string;
  engineCode?: string;
  currentMileage: number;
  lastServiceMileage?: number;
  lastServiceDate?: string;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  inspectionExpiryDate?: string; // TÜVTÜRK
  insuranceExpiryDate?: string;  // Trafik
  cascoExpiryDate?: string;      // Kasko
  notes?: string;
  createdAt: string;
}

export interface VehicleTimelineEvent {
  id: string;
  vehicleId: string;
  tenantId: string;
  date: string;
  type: 'WORK_ORDER' | 'INSPECTION' | 'TIRE_CHANGE' | 'OWNER_CHANGE' | 'ACCIDENT' | 'NOTE';
  title: string;
  description: string;
  mileage: number;
  cost?: number;
  referenceId?: string;
}

// ------------------------------------------
// INTAKE, INSPECTION & DAMAGE
// ------------------------------------------
export interface DamagePoint {
  id: string;
  xPercent: number; // 0-100 on vehicle 2D diagram
  yPercent: number;
  view: 'TOP' | 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT';
  type: 'SCRATCH' | 'DENT' | 'CRACK' | 'PAINT' | 'RUST';
  severity: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  note?: string;
}

export interface VehicleIntake {
  id: string;
  workOrderId: string;
  mileageIn: number;
  fuelLevelPercent: number; // 0, 25, 50, 75, 100
  hasSpareTire: boolean;
  hasJack: boolean;
  hasRegistrationDoc: boolean;
  keyCount: number;
  valuableItems?: string;
  customerComplaints: string;
  damagePoints: DamagePoint[];
  photos: string[];
  customerSignatureUrl?: string;
  advisorSignatureUrl?: string;
  completedAt: string;
  advisorName: string;
}

export type MPICondition = 'GOOD' | 'ATTENTION' | 'URGENT';

export interface MPIItem {
  id: string;
  category: 'MOTOR' | 'FREN' | 'ON_TAKIM' | 'SIVILAR' | 'ELEKTRIK' | 'LASTIK' | 'KAPORTA';
  title: string;
  condition: MPICondition;
  description?: string;
  photoUrl?: string;
  recommendedPartSku?: string;
  recommendedPartName?: string;
  estimatedLaborCost?: number;
  estimatedPartCost?: number;
}

export interface MPIInspection {
  id: string;
  workOrderId: string;
  technicianId: string;
  technicianName: string;
  items: MPIItem[];
  overallSummary?: string;
  completedAt: string;
}

// ------------------------------------------
// ESTIMATES & QUOTATION
// ------------------------------------------
export type ItemApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED';

export interface EstimateItem {
  id: string;
  type: 'PART' | 'LABOR' | 'SUPPLY' | 'EXTERNAL_SERVICE';
  sku?: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  unitPrice: number;
  discountRate: number; // %
  vatRate: number; // %
  totalPrice: number;
  status: ItemApprovalStatus;
  rejectionReason?: string;
}

export interface Estimate {
  id: string;
  workOrderId: string;
  revisionNumber: number;
  items: EstimateItem[];
  subtotalParts: number;
  subtotalLabor: number;
  subtotalSupplies: number;
  totalDiscount: number;
  totalVat: number;
  grandTotal: number;
  approvedTotal: number;
  customerApprovalToken?: string;
  approvedAt?: string;
  approvedByIp?: string;
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_APPROVED' | 'FULLY_APPROVED' | 'REJECTED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

// ------------------------------------------
// WORK ORDER ENGINE
// ------------------------------------------
export type WorkOrderStatus =
  | 'DRAFT'
  | 'CHECKED_IN'
  | 'INSPECTION'
  | 'ESTIMATE_PENDING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'PARTS_PENDING'
  | 'ASSIGNED_TO_BAY'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'WASH_DETAILING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CLOSED'
  | 'CANCELLED';

export interface WorkOrderStatusHistory {
  id: string;
  workOrderId: string;
  tenantId: string;
  branchId: string;
  fromStatus: WorkOrderStatus | null;
  toStatus: WorkOrderStatus;
  reason?: string;
  transitionType: 'NORMAL' | 'SYSTEM' | 'CUSTOMER' | 'OVERRIDE' | 'ROLLBACK';
  performedByUserId: string;
  performedByUserName: string;
  performedByRole: UserRole;
  performedAt: string;
  source: 'WEB' | 'MOBILE' | 'PUBLIC_LINK' | 'API' | 'SYSTEM';
  metadata?: Record<string, any>;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string; // e.g. WO-2026-0042
  tenantId: string;
  branchId: string;
  customerId: string;
  vehicleId: string;
  advisorId: string;
  advisorName: string;
  technicianId?: string;
  technicianName?: string;
  bayId?: string;
  bayName?: string;
  status: WorkOrderStatus;
  statusVersion?: number;
  statusChangedAt?: string;
  statusChangedBy?: string;
  currentStepStartedAt?: string;
  currentStepDueAt?: string;
  blockedReason?: string;
  blockedByPartIds?: string[];
  overrideRequired?: boolean;
  overrideReason?: string;
  overrideApprovedBy?: string;
  statusHistory?: WorkOrderStatusHistory[];
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  serviceType: 'PERIYODIK_BAKIM' | 'MEKANIK_ONARIM' | 'ELEKTRIK_ELEKTRONIK' | 'LASTIK_ROT' | 'KAPORTA_BOYA' | 'EKSPERTIZE' | 'GARANTI';
  intake?: VehicleIntake;
  inspection?: MPIInspection;
  estimate?: Estimate;
  items: EstimateItem[];
  internalNotes?: string;
  customerNotes?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// WORKSHOP & BAYS
// ------------------------------------------
export interface WorkshopBay {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  type: 'MEKANIK' | 'ELEKTRIK' | 'KAPORTA_BOYA' | 'ROT_BALANS' | 'DIAGNOSTIK' | 'YIKAMA';
  status: 'IDLE' | 'OCCUPIED' | 'MAINTENANCE';
  activeWorkOrderId?: string;
  activeVehiclePlate?: string;
  activeTechnicianName?: string;
}

// ------------------------------------------
// INVENTORY & SPARE PARTS
// ------------------------------------------
export interface InventoryItem {
  id: string;
  tenantId: string;
  sku: string;
  barcode?: string;
  oemCode?: string;
  equivalentCodes?: string[];
  name: string;
  brand: string;
  category: 'FILTRE' | 'YAG_SIVI' | 'FREN' | 'SUSPANSIYON' | 'MOTOR' | 'ELEKTRIK' | 'LASTIK' | 'SARF';
  unit: 'ADET' | 'LT' | 'TAKIM' | 'SET' | 'METRE';
  warehouseLocation: string; // e.g. "Raf A-12"
  costPrice: number;
  salePrice: number;
  vatRate: number; // 20
  stockOnHand: number;
  stockReserved: number;
  stockAvailable: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  supplierName?: string;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  type: 'PURCHASE_IN' | 'WORK_ORDER_OUT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'SCRAP_OUT' | 'ADJUSTMENT';
  quantity: number;
  unitCost: number;
  referenceNo?: string; // Work order or PO no
  performedBy: string;
  notes?: string;
  createdAt: string;
}

// ------------------------------------------
// TIRE HOTEL
// ------------------------------------------
export interface TireHotelRecord {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehiclePlate: string;
  brand: string;
  model: string;
  tireSize: string; // e.g. "205/55 R16"
  season: 'WINTER' | 'SUMMER' | 'ALL_SEASON';
  dotCode?: string; // e.g. "4224"
  treadDepthFL: number; // mm
  treadDepthFR: number;
  treadDepthRL: number;
  treadDepthRR: number;
  hasRims: boolean;
  rimCondition?: string;
  shelfLocation: string; // e.g. "Lastik Deposu - Blok C-04"
  intakeDate: string;
  expiryDate: string;
  status: 'STORED' | 'MOUNTED_ON_VEHICLE' | 'RETURNED' | 'SCRAPPED';
  notes?: string;
}

// ------------------------------------------
// APPOINTMENTS
// ------------------------------------------
export interface Appointment {
  id: string;
  tenantId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleMakeModel: string;
  serviceType: string;
  requestedDate: string;
  requestedTime: string; // "09:30"
  status: 'REQUESTED' | 'CONFIRMED' | 'ARRIVED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  customerNotes?: string;
  createdAt: string;
}

// ------------------------------------------
// FINANCE & CASH REGISTERS
// ------------------------------------------
export interface Payment {
  id: string;
  tenantId: string;
  branchId: string;
  workOrderId?: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OPEN_ACCOUNT';
  status: 'COMPLETED' | 'REFUNDED' | 'PENDING';
  receiptNo: string;
  receivedBy: string;
  createdAt: string;
  notes?: string;
}

// ------------------------------------------
// AUDIT & AUTOMATION
// ------------------------------------------
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  tenantId: string;
  name: string;
  eventTrigger: 'WORK_ORDER_STATUS_CHANGED' | 'ESTIMATE_APPROVED' | 'VEHICLE_INTAKE_COMPLETED' | 'INVENTORY_LOW';
  conditionField?: string;
  conditionValue?: string;
  actionType: 'SEND_WHATSAPP' | 'SEND_SMS' | 'CREATE_TASK' | 'NOTIFY_USER';
  templateText: string;
  isActive: boolean;
}
