import { WorkOrder, WorkOrderStatus, User, WorkshopBay } from '../types';
import { FirestoreService } from '../services/firestoreService';

export interface WorkflowTransitionResult {
  allowed: boolean;
  reason?: string;
  requiredAction?: 'APPROVE_ESTIMATE' | 'COMPLETE_QC' | 'COLLECT_PAYMENT' | 'SELECT_BAY' | 'MANAGER_OVERRIDE';
}

export class WorkOrderWorkflowEngine {
  /**
   * Validates whether a work order can transition from current status to next status
   */
  public static validateTransition(
    workOrder: WorkOrder,
    targetStatus: WorkOrderStatus,
    user: { id: string; name: string; role: string },
    allBays: WorkshopBay[],
    overrideReason?: string
  ): WorkflowTransitionResult {
    // 1. Same status is a no-op
    if (workOrder.status === targetStatus) {
      return { allowed: true };
    }

    // 2. Closed or Cancelled work orders cannot be modified without manager role
    if (['CLOSED', 'CANCELLED'].includes(workOrder.status) && !['SUPER_ADMIN', 'TENANT_OWNER', 'TENANT_MANAGER'].includes(user.role)) {
      return {
        allowed: false,
        reason: 'Kapatılmış veya iptal edilmiş iş emirleri sadece servis yöneticisi tarafından yeniden açılabilir.'
      };
    }

    // 3. Rule: Cannot move to IN_PROGRESS without approved estimate
    if (['IN_PROGRESS', 'ASSIGNED_TO_BAY'].includes(targetStatus)) {
      const hasApprovedEstimate = workOrder.estimate && 
        ['APPROVED', 'FULLY_APPROVED', 'PARTIALLY_APPROVED'].includes(workOrder.estimate.status);
      
      if (!hasApprovedEstimate && workOrder.items.length > 0) {
        return {
          allowed: false,
          reason: 'Onaylanmamış teklife sahip iş emri üretime veya lifte alınamaz. Önce müşteri teklif onayını kaydediniz.',
          requiredAction: 'APPROVE_ESTIMATE'
        };
      }
    }

    // 4. Rule: Lift collision prevention
    if (targetStatus === 'ASSIGNED_TO_BAY' && workOrder.bayId) {
      const targetBay = allBays.find(b => b.id === workOrder.bayId);
      if (targetBay && targetBay.status === 'OCCUPIED' && targetBay.activeWorkOrderId && targetBay.activeWorkOrderId !== workOrder.id) {
        return {
          allowed: false,
          reason: `${targetBay.name} şu anda başka bir araç tarafından kullanılıyor. Başka bir lift seçiniz.`,
          requiredAction: 'SELECT_BAY'
        };
      }
    }

    // 5. Rule: Cannot move to READY_FOR_PICKUP without Quality Control check
    if (targetStatus === 'READY_FOR_PICKUP') {
      const isBypassingQC = ['IN_PROGRESS', 'PARTS_PENDING', 'APPROVED'].includes(workOrder.status);
      
      if (isBypassingQC && !['SUPER_ADMIN', 'TENANT_OWNER', 'SERVICE_ADVISOR', 'TENANT_MANAGER'].includes(user.role)) {
        return {
          allowed: false,
          reason: 'Araç teslime hazır durumuna geçmeden önce Kalite Kontrol (QC) aşamasından geçmelidir.',
          requiredAction: 'COMPLETE_QC'
        };
      }
    }

    // 6. Rule: Delivery Payment Guard
    if (targetStatus === 'DELIVERED') {
      const remainingBalance = (workOrder.totalAmount || 0) - (workOrder.paidAmount || 0);
      const isFullyPaid = remainingBalance <= 0 || workOrder.paymentStatus === 'PAID';

      if (!isFullyPaid && !overrideReason) {
        return {
          allowed: false,
          reason: `Araç üzerinde ${remainingBalance.toLocaleString()} ₺ açık bakiye bulunmaktadır. Teslimat için ya tahsilat yapılmalı ya da yetkili teslimat gerekçesi girilmelidir.`,
          requiredAction: 'COLLECT_PAYMENT'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Applies the transition, updates work order and writes immutable audit log
   */
  public static applyTransition(
    workOrder: WorkOrder,
    targetStatus: WorkOrderStatus,
    user: { id: string; name: string; role: string },
    allBays: WorkshopBay[],
    overrideReason?: string
  ): { updatedWorkOrder: WorkOrder; error?: string } {
    const validation = this.validateTransition(workOrder, targetStatus, user, allBays, overrideReason);
    if (!validation.allowed) {
      return { updatedWorkOrder: workOrder, error: validation.reason };
    }

    const previousStatus = workOrder.status;
    const now = new Date().toISOString();

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      status: targetStatus,
      updatedAt: now,
      actualDeliveryDate: ['READY_FOR_PICKUP', 'DELIVERED', 'CLOSED'].includes(targetStatus) ? (workOrder.actualDeliveryDate || now) : workOrder.actualDeliveryDate
    };

    // Log to audit log
    FirestoreService.logAudit({
      tenantId: workOrder.tenantId,
      userId: user.id,
      userName: user.name,
      action: 'WORK_ORDER_STATUS_CHANGED',
      entityType: 'WORK_ORDER',
      entityId: workOrder.id,
      oldValues: { status: previousStatus },
      newValues: { status: targetStatus, overrideReason },
      ipAddress: 'client-web'
    });

    return { updatedWorkOrder };
  }
}
