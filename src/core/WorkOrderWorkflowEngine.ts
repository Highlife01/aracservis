import { 
  WorkOrder, WorkOrderStatus, WorkOrderStatusHistory, 
  UserRole, WorkshopBay, InventoryItem 
} from '../types';
import { FirestoreService } from '../services/firestoreService';
import { store } from '../services/store';

export interface TransitionActor {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string;
  branchId?: string;
}

export interface TransitionInput {
  workOrder: WorkOrder;
  toStatus: WorkOrderStatus;
  actor: TransitionActor;
  expectedVersion?: number;
  reason?: string;
  overrideApproved?: boolean;
  overrideReason?: string;
  bayId?: string;
  technicianId?: string;
  technicianName?: string;
  source?: 'WEB' | 'MOBILE' | 'PUBLIC_LINK' | 'API' | 'SYSTEM';
  metadata?: Record<string, any>;
}

export interface TransitionValidationResult {
  valid: boolean;
  code?: 'MISSING_REQUIRED_CONDITION' | 'INVALID_TRANSITION' | 'VERSION_CONFLICT' | 'UNAUTHORIZED' | 'LIFT_OCCUPIED' | 'PAYMENT_REQUIRED';
  message?: string;
  details?: string[];
  blockingFields?: string[];
  suggestedAction?: string;
  requiresOverride?: boolean;
}

// 1. Durum Görünen İsimleri ve Renkleri
export const WORK_ORDER_STATUS_METADATA: Record<WorkOrderStatus, { label: string; description: string; stepIndex: number }> = {
  DRAFT: { label: 'Taslak', description: 'İş emri henüz tamamlanmamış veya kayıt aşamasında', stepIndex: 0 },
  CHECKED_IN: { label: 'Araç Kabul Edildi', description: 'Araç servise fiziksel olarak alınmış, kabul tutanağı oluşmuş', stepIndex: 1 },
  INSPECTION: { label: 'İnceleme Yapılıyor', description: 'Ön kontrol veya detaylı ekspertiz devam ediyor', stepIndex: 2 },
  ESTIMATE_PENDING: { label: 'Teklif Hazırlanıyor', description: 'İş kalemleri ve maliyet hesaplanıyor', stepIndex: 3 },
  AWAITING_APPROVAL: { label: 'Müşteri Onayı Bekleniyor', description: 'Teklif müşteriye gönderilmiş, karar bekleniyor', stepIndex: 4 },
  APPROVED: { label: 'İşlem Onaylandı', description: 'Müşteri yapılacak işleri onaylamış', stepIndex: 5 },
  PARTS_PENDING: { label: 'Parça Bekleniyor', description: 'İş için gerekli parça bulunmuyor veya tedarik bekleniyor', stepIndex: 6 },
  ASSIGNED_TO_BAY: { label: 'Lift Atandı', description: 'İş emri lift ve teknisyene bağlandı', stepIndex: 7 },
  IN_PROGRESS: { label: 'İşlem Devam Ediyor', description: 'Teknik işlem aktif olarak yapılıyor', stepIndex: 8 },
  QUALITY_CHECK: { label: 'Kalite Kontrol', description: 'İş tamamlandı, son kontrol bekliyor', stepIndex: 9 },
  WASH_DETAILING: { label: 'Yıkama / Detaylandırma', description: 'Teslim öncesi temizlik veya kozmetik işlem yapılıyor', stepIndex: 10 },
  READY_FOR_PICKUP: { label: 'Teslime Hazır', description: 'Teknik ve kalite süreci tamamlanmış', stepIndex: 11 },
  DELIVERED: { label: 'Araç Teslim Edildi', description: 'Araç müşteriye teslim edilmiş', stepIndex: 12 },
  CLOSED: { label: 'Kapatıldı', description: 'Finans, teslim ve belge süreçleri tamamlanmış', stepIndex: 13 },
  CANCELLED: { label: 'İptal Edildi', description: 'İş emri kontrollü şekilde iptal edilmiş', stepIndex: 99 },
};

// 2. Merkezi Geçiş Whitelist Matrisi
export const TRANSITION_WHITELIST: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  DRAFT: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['INSPECTION', 'CANCELLED'],
  INSPECTION: ['ESTIMATE_PENDING', 'CANCELLED'],
  ESTIMATE_PENDING: ['AWAITING_APPROVAL', 'CANCELLED'],
  AWAITING_APPROVAL: ['APPROVED', 'ESTIMATE_PENDING', 'CANCELLED'],
  APPROVED: ['PARTS_PENDING', 'ASSIGNED_TO_BAY', 'CANCELLED'],
  PARTS_PENDING: ['ASSIGNED_TO_BAY', 'CANCELLED'],
  ASSIGNED_TO_BAY: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['IN_PROGRESS', 'WASH_DETAILING', 'READY_FOR_PICKUP', 'CANCELLED'],
  WASH_DETAILING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: ['DRAFT'], // Yalnızca yönetici yeniden açabilir
};

export class WorkOrderWorkflowEngine {
  /**
   * Validates all conditions, actor permissions and domain rules for a work order transition
   */
  public static validateTransition(input: TransitionInput): TransitionValidationResult {
    const { workOrder, toStatus, actor, expectedVersion, overrideApproved, overrideReason } = input;
    const currentStatus = workOrder.status;

    // 1. Same status is a no-op
    if (currentStatus === toStatus) {
      return { valid: true };
    }

    // 2. Tenant isolation check
    if (workOrder.tenantId !== actor.tenantId && actor.role !== 'SUPER_ADMIN') {
      return {
        valid: false,
        code: 'UNAUTHORIZED',
        message: 'Bu iş emrine erişim yetkiniz bulunmuyor (Tenant Uyuşmazlığı).',
        suggestedAction: 'Doğru şirket hesabıyla giriş yaptığınızdan emin olun.'
      };
    }

    // 3. Optimistic Locking / Version Check
    if (expectedVersion !== undefined && workOrder.statusVersion !== undefined) {
      if (workOrder.statusVersion !== expectedVersion) {
        return {
          valid: false,
          code: 'VERSION_CONFLICT',
          message: 'İş emri başka bir kullanıcı veya sekme tarafından güncellenmiş.',
          details: [`Beklenen sürüm: ${expectedVersion}, Mevcut sürüm: ${workOrder.statusVersion}`],
          suggestedAction: 'Sayfayı yenileyip güncel durumu inceledikten sonra tekrar deneyiniz.'
        };
      }
    }

    // 4. Transition Whitelist Check
    const allowedTargets = TRANSITION_WHITELIST[currentStatus] || [];
    if (!allowedTargets.includes(toStatus) && !overrideApproved) {
      return {
        valid: false,
        code: 'INVALID_TRANSITION',
        message: `"${WORK_ORDER_STATUS_METADATA[currentStatus]?.label}" durumundan doğrudan "${WORK_ORDER_STATUS_METADATA[toStatus]?.label}" durumuna geçiş yapılamaz.`,
        details: [`İzin verilen sonraki aşamalar: ${allowedTargets.map(s => WORK_ORDER_STATUS_METADATA[s]?.label).join(', ')}`],
        suggestedAction: 'Lütfen iş emri aşamalarını sırasıyla takip ediniz.'
      };
    }

    // 5. State-Specific Mandatory Rules
    const blockingDetails: string[] = [];
    const blockingFields: string[] = [];

    // Rule: DRAFT -> CHECKED_IN
    if (toStatus === 'CHECKED_IN') {
      if (!workOrder.customerId) {
        blockingDetails.push('Müşteri kaydı zorunludur.');
        blockingFields.push('customerId');
      }
      if (!workOrder.vehicleId) {
        blockingDetails.push('Araç kaydı zorunludur.');
        blockingFields.push('vehicleId');
      }
    }

    // Rule: ESTIMATE_PENDING -> AWAITING_APPROVAL
    if (toStatus === 'AWAITING_APPROVAL') {
      if (!workOrder.items || workOrder.items.length === 0) {
        blockingDetails.push('Teklif gönderilebilmesi için en az bir işçilik veya parça kalemi girilmelidir.');
        blockingFields.push('items');
      }
      if ((workOrder.totalAmount || 0) <= 0 && (!workOrder.estimate || workOrder.estimate.grandTotal <= 0)) {
        blockingDetails.push('Teklif tutarı sıfırdan büyük olmalıdır.');
        blockingFields.push('estimate.grandTotal');
      }
    }

    // Rule: AWAITING_APPROVAL -> APPROVED
    if (toStatus === 'APPROVED') {
      const hasEstimate = !!workOrder.estimate;
      if (!hasEstimate && workOrder.items.length > 0) {
        blockingDetails.push('Müşteri onayı için geçerli bir teklif belgesi gereklidir.');
        blockingFields.push('estimate');
      }
    }

    // Rule: APPROVED -> ASSIGNED_TO_BAY / IN_PROGRESS
    if (['ASSIGNED_TO_BAY', 'IN_PROGRESS'].includes(toStatus)) {
      if (input.bayId || workOrder.bayId) {
        const targetBayId = input.bayId || workOrder.bayId;
        const allBays = store.getBays(workOrder.tenantId);
        const targetBay = allBays.find(b => b.id === targetBayId);

        if (targetBay && targetBay.status === 'OCCUPIED' && targetBay.activeWorkOrderId && targetBay.activeWorkOrderId !== workOrder.id) {
          blockingDetails.push(`${targetBay.name} istasyonu şu anda başka bir araç tarafından kullanılıyor.`);
          blockingFields.push('bayId');
        }
      }
    }

    // Rule: READY_FOR_PICKUP
    if (toStatus === 'READY_FOR_PICKUP') {
      const isBypassingQC = ['IN_PROGRESS', 'PARTS_PENDING', 'APPROVED'].includes(currentStatus);
      if (isBypassingQC && !['SUPER_ADMIN', 'TENANT_OWNER', 'TENANT_MANAGER', 'SERVICE_ADVISOR'].includes(actor.role)) {
        blockingDetails.push('Araç teslime hazır durumuna geçmeden önce Kalite Kontrol (QC) aşamasından geçmelidir.');
        blockingFields.push('inspection.qualityCheck');
      }
    }

    // Rule: DELIVERED (Payment & Clearance Check)
    if (toStatus === 'DELIVERED') {
      const remainingBalance = (workOrder.totalAmount || 0) - (workOrder.paidAmount || 0);
      const isFullyPaid = remainingBalance <= 0 || workOrder.paymentStatus === 'PAID';

      if (!isFullyPaid && !overrideApproved) {
        return {
          valid: false,
          code: 'PAYMENT_REQUIRED',
          message: `Araç üzerinde ${remainingBalance.toLocaleString()} ₺ açık bakiye bulunmaktadır.`,
          details: [`Teslimat için kalan ${remainingBalance.toLocaleString()} ₺ tahsil edilmeli veya yönetici override onayı verilmelidir.`],
          blockingFields: ['paidAmount'],
          requiresOverride: true,
          suggestedAction: 'Tahsilat yapınız veya yetkili teslimat gerekçesi giriniz.'
        };
      }
    }

    // Rule: CANCELLED (Reason Mandatory)
    if (toStatus === 'CANCELLED') {
      if (!input.reason && !overrideReason) {
        blockingDetails.push('İş emrinin iptal edilebilmesi için iptal gerekçesi girilmesi zorunludur.');
        blockingFields.push('reason');
      }
    }

    if (blockingDetails.length > 0) {
      return {
        valid: false,
        code: 'MISSING_REQUIRED_CONDITION',
        message: `İş emri "${WORK_ORDER_STATUS_METADATA[toStatus]?.label}" durumuna alınamaz.`,
        details: blockingDetails,
        blockingFields,
        suggestedAction: 'Lütfen yukarıdaki eksik koşulları tamamlayıp tekrar deneyiniz.'
      };
    }

    return { valid: true };
  }

  /**
   * Central Engine Transition Dispatcher
   * Mutates status, executes side-effects, records audit log & history, saves to Firestore
   */
  public static async transitionWorkOrder(input: TransitionInput): Promise<{
    success: boolean;
    workOrder?: WorkOrder;
    error?: TransitionValidationResult;
  }> {
    const validation = this.validateTransition(input);
    if (!validation.valid) {
      // Record rejected transition attempt to audit log
      FirestoreService.logAudit({
        tenantId: input.workOrder.tenantId,
        userId: input.actor.id,
        userName: input.actor.name,
        action: 'WORK_ORDER_TRANSITION_REJECTED',
        entityType: 'WORK_ORDER',
        entityId: input.workOrder.id,
        oldValues: { status: input.workOrder.status },
        newValues: { targetStatus: input.toStatus, error: validation.message, details: validation.details },
        ipAddress: 'client-web'
      });

      return { success: false, error: validation };
    }

    const { workOrder, toStatus, actor, reason, overrideApproved, overrideReason } = input;
    const previousStatus = workOrder.status;
    const now = new Date().toISOString();
    const newVersion = (workOrder.statusVersion || 1) + 1;

    // 1. Create Immutable History Record
    const historyId = 'hist-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    const historyRecord: WorkOrderStatusHistory = {
      id: historyId,
      workOrderId: workOrder.id,
      tenantId: workOrder.tenantId,
      branchId: workOrder.branchId || 'branch-1',
      fromStatus: previousStatus,
      toStatus: toStatus,
      reason: reason || overrideReason,
      transitionType: overrideApproved ? 'OVERRIDE' : 'NORMAL',
      performedByUserId: actor.id,
      performedByUserName: actor.name,
      performedByRole: actor.role,
      performedAt: now,
      source: input.source || 'WEB',
      metadata: input.metadata || {}
    };

    // 2. Prepare Updated Work Order
    const updatedHistory = [...(workOrder.statusHistory || []), historyRecord];

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      status: toStatus,
      statusVersion: newVersion,
      statusChangedAt: now,
      statusChangedBy: actor.name,
      currentStepStartedAt: now,
      bayId: input.bayId !== undefined ? input.bayId : workOrder.bayId,
      technicianId: input.technicianId !== undefined ? input.technicianId : workOrder.technicianId,
      technicianName: input.technicianName !== undefined ? input.technicianName : workOrder.technicianName,
      overrideReason: overrideApproved ? overrideReason : workOrder.overrideReason,
      overrideApprovedBy: overrideApproved ? actor.name : workOrder.overrideApprovedBy,
      actualDeliveryDate: ['DELIVERED', 'CLOSED'].includes(toStatus) ? (workOrder.actualDeliveryDate || now) : workOrder.actualDeliveryDate,
      statusHistory: updatedHistory,
      updatedAt: now
    };

    // 3. Side Effects: Update Lift Station Occupancy
    if (toStatus === 'ASSIGNED_TO_BAY' || toStatus === 'IN_PROGRESS') {
      const bayId = updatedWorkOrder.bayId;
      if (bayId) {
        const bay = store.getBays(workOrder.tenantId).find(b => b.id === bayId);
        if (bay) {
          store.saveBay({
            ...bay,
            status: 'OCCUPIED',
            activeWorkOrderId: workOrder.id,
            activeVehiclePlate: store.getVehicleById(workOrder.vehicleId)?.plate || '34 VIP 77',
            activeTechnicianName: updatedWorkOrder.technicianName || bay.activeTechnicianName
          });
        }
      }
    } else if (['READY_FOR_PICKUP', 'DELIVERED', 'CLOSED', 'CANCELLED', 'WASH_DETAILING'].includes(toStatus)) {
      // Release bay if vehicle moves out
      if (workOrder.bayId) {
        const bay = store.getBays(workOrder.tenantId).find(b => b.id === workOrder.bayId);
        if (bay && bay.activeWorkOrderId === workOrder.id) {
          store.saveBay({
            ...bay,
            status: 'IDLE',
            activeWorkOrderId: undefined,
            activeVehiclePlate: undefined,
            activeTechnicianName: undefined
          });
        }
      }
    }

    // 4. Save to Firestore & in-memory store
    store.saveWorkOrder(updatedWorkOrder);

    // 5. Immutable Audit Log
    FirestoreService.logAudit({
      tenantId: workOrder.tenantId,
      userId: actor.id,
      userName: actor.name,
      action: 'WORK_ORDER_STATUS_CHANGED',
      entityType: 'WORK_ORDER',
      entityId: workOrder.id,
      oldValues: { status: previousStatus, version: workOrder.statusVersion },
      newValues: { status: toStatus, version: newVersion, overrideReason },
      ipAddress: 'client-web'
    });

    return { success: true, workOrder: updatedWorkOrder };
  }
}
