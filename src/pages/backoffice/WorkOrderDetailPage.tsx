import React, { useState } from 'react';
import { useAuth } from '../../core/AuthContext';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { store } from '../../services/store';
import { WorkOrder, WorkOrderStatus, EstimateItem, MPIItem, MPICondition, WorkOrderStatusHistory } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { VehicleDamageCanvas } from '../../components/vehicle/VehicleDamageCanvas';
import { QRKeyTagModal } from '../../components/qr/QRKeyTagModal';
import { 
  WorkOrderWorkflowEngine, 
  WORK_ORDER_STATUS_METADATA, 
  TRANSITION_WHITELIST,
  TransitionValidationResult 
} from '../../core/WorkOrderWorkflowEngine';
import { 
  ArrowLeft, Check, Send, Printer, Wrench, FileText, 
  DollarSign, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, 
  Plus, Trash2, Clock, Car, Layers, QrCode, Search, AlertTriangle, 
  XCircle, AlertOctagon, History, ArrowRight 
} from 'lucide-react';

interface Props {
  workOrder: WorkOrder;
  onBack: () => void;
  onNavigate: (tab: string, itemData?: any) => void;
}

export const WorkOrderDetailPage: React.FC<Props> = ({ workOrder, onBack, onNavigate }) => {
  const { currentUser } = useAuth();
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [wo, setWo] = useState<WorkOrder>(workOrder);
  const [activeSubTab, setActiveSubTab] = useState<'ESTIMATE' | 'INSPECTION' | 'DAMAGE_CANVAS' | 'ASSIGNMENT' | 'PAYMENT' | 'HISTORY'>('ESTIMATE');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Workflow Validation Error Modal State
  const [blockingError, setBlockingError] = useState<TransitionValidationResult | null>(null);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<WorkOrderStatus | null>(null);

  // Manager Override Modal State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Estimate Item Form State
  const [newEstimateType, setNewEstimateType] = useState<'PART' | 'LABOR'>('PART');
  const [newEstimateName, setNewEstimateName] = useState('');
  const [newEstimateQty, setNewEstimateQty] = useState(1);
  const [newEstimatePrice, setNewEstimatePrice] = useState(0);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>((wo.totalAmount || 0) - (wo.paidAmount || 0));
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('CREDIT_CARD');

  const customer = store.getCustomerById(wo.customerId);
  const vehicle = store.getVehicleById(wo.vehicleId);
  const bays = store.getBays(currentTenant.id);

  // All 14 Sequential States for visual pipeline
  const sequentialStatuses: WorkOrderStatus[] = [
    'DRAFT', 'CHECKED_IN', 'INSPECTION', 'ESTIMATE_PENDING',
    'AWAITING_APPROVAL', 'APPROVED', 'PARTS_PENDING', 'ASSIGNED_TO_BAY',
    'IN_PROGRESS', 'QUALITY_CHECK', 'WASH_DETAILING', 'READY_FOR_PICKUP',
    'DELIVERED', 'CLOSED'
  ];

  // CENTRAL WORKFLOW ENGINE TRANSITION CALL
  const handleTransition = async (toStatus: WorkOrderStatus, override = false, overrideReason = '') => {
    const actor = {
      id: currentUser.id || 'user-admin',
      name: currentUser.name || 'Servis Yöneticisi',
      role: currentUser.role || 'TENANT_OWNER',
      tenantId: currentTenant.id,
      branchId: wo.branchId
    };

    const res = await WorkOrderWorkflowEngine.transitionWorkOrder({
      workOrder: wo,
      toStatus,
      actor,
      expectedVersion: wo.statusVersion,
      overrideApproved: override,
      overrideReason: override ? overrideReason : undefined,
      source: 'WEB'
    });

    if (!res.success && res.error) {
      setPendingTargetStatus(toStatus);
      setBlockingError(res.error);
      return;
    }

    if (res.workOrder) {
      setWo(res.workOrder);
      setBlockingError(null);
      setPendingTargetStatus(null);
      setIsOverrideModalOpen(false);
      showSuccess(
        'Aşama Güncellendi', 
        `İş emri başarıyla "${WORK_ORDER_STATUS_METADATA[toStatus]?.label}" durumuna geçirildi.`
      );
    }
  };

  // Add Item to Estimate
  const handleAddEstimateItem = () => {
    if (!newEstimateName.trim() || newEstimatePrice <= 0) {
      showError('Eksik Bilgi', 'Kalem adı ve geçerli bir birim fiyat giriniz.');
      return;
    }

    const newItem: EstimateItem = {
      id: 'ei-' + Math.random().toString(36).substr(2, 9),
      type: newEstimateType,
      name: newEstimateName.trim(),
      quantity: newEstimateQty,
      unit: newEstimateType === 'PART' ? 'ADET' : 'SAAT',
      unitCost: newEstimatePrice * 0.6,
      unitPrice: newEstimatePrice,
      discountRate: 0,
      vatRate: 20,
      totalPrice: newEstimatePrice * newEstimateQty * 1.2,
      status: 'APPROVED',
    };

    const currentEstimate = wo.estimate || {
      id: 'est-' + wo.id,
      workOrderId: wo.id,
      revisionNumber: 1,
      items: [],
      subtotalParts: 0,
      subtotalLabor: 0,
      subtotalSupplies: 0,
      totalDiscount: 0,
      totalVat: 0,
      grandTotal: 0,
      approvedTotal: 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };

    const updatedItems = [...currentEstimate.items, newItem];
    const subParts = updatedItems.filter(i => i.type === 'PART').reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    const subLabor = updatedItems.filter(i => i.type === 'LABOR').reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    const grand = (subParts + subLabor) * 1.2;

    const updatedEstimate = {
      ...currentEstimate,
      items: updatedItems,
      subtotalParts: subParts,
      subtotalLabor: subLabor,
      totalVat: grand - (subParts + subLabor),
      grandTotal: grand,
      approvedTotal: grand,
    };

    const updatedWo = {
      ...wo,
      items: updatedItems,
      estimate: updatedEstimate,
      totalAmount: grand,
      updatedAt: new Date().toISOString(),
    };

    setWo(updatedWo);
    store.saveWorkOrder(updatedWo);
    setNewEstimateName('');
    setNewEstimatePrice(0);
    showSuccess('Kalem Eklendi', `${newItem.name} teklif listesine eklendi.`);
  };

  // Remove Item from Estimate
  const handleRemoveEstimateItem = (itemId: string) => {
    if (!wo.estimate) return;
    const updatedItems = wo.estimate.items.filter(i => i.id !== itemId);
    const subParts = updatedItems.filter(i => i.type === 'PART').reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    const subLabor = updatedItems.filter(i => i.type === 'LABOR').reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    const grand = (subParts + subLabor) * 1.2;

    const updatedEstimate = {
      ...wo.estimate,
      items: updatedItems,
      subtotalParts: subParts,
      subtotalLabor: subLabor,
      totalVat: grand - (subParts + subLabor),
      grandTotal: grand,
      approvedTotal: grand,
    };

    const updatedWo = {
      ...wo,
      items: updatedItems,
      estimate: updatedEstimate,
      totalAmount: grand,
      updatedAt: new Date().toISOString(),
    };

    setWo(updatedWo);
    store.saveWorkOrder(updatedWo);
    showSuccess('Kalem Silindi', 'Teklif tutarı yeniden hesaplandı.');
  };

  // Record Payment & Receipt
  const handleRecordPayment = () => {
    if (paymentAmount <= 0) {
      showError('Geçersiz Tutar', 'Lütfen geçerli bir tahsilat tutarı giriniz.');
      return;
    }

    const newPayment = {
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      branchId: 'branch-1',
      workOrderId: wo.id,
      customerId: wo.customerId,
      customerName: `${customer?.firstName || ''} ${customer?.lastName || ''}`,
      amount: paymentAmount,
      method: paymentMethod,
      status: 'COMPLETED' as const,
      receiptNo: 'MAK-' + Math.floor(100000 + Math.random() * 900000),
      receivedBy: currentUser.name || 'Vezne Sorumlusu',
      createdAt: new Date().toISOString(),
      notes: `${wo.workOrderNo} numaralı iş emri tahsilatı`,
    };

    const newPaidAmount = (wo.paidAmount || 0) + paymentAmount;
    const isFull = newPaidAmount >= wo.totalAmount;

    const updatedWo: WorkOrder = {
      ...wo,
      paidAmount: newPaidAmount,
      paymentStatus: isFull ? 'PAID' : 'PARTIALLY_PAID',
      updatedAt: new Date().toISOString(),
    };

    store.savePayment(newPayment);
    store.saveWorkOrder(updatedWo);
    setWo(updatedWo);
    showSuccess('Tahsilat Kaydedildi', `${paymentAmount.toLocaleString()} ₺ tahsilat makbuzu oluşturuldu.`);
  };

  // WhatsApp Approval Link Generator
  const generateWhatsAppApprovalLink = () => {
    if (!customer?.phone) {
      showError('Telefon Yok', 'Müşterinin kayıtlı telefon numarası bulunmuyor.');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const token = wo.estimate?.customerApprovalToken || 'token-demo';
    const link = `${window.location.origin}/#approval-${token}`;
    const text = encodeURIComponent(
      `Sayın ${customer.firstName} ${customer.lastName}, ${vehicle?.plate} plakalı aracınız için hazırlanan servis teklifini incelemek ve kalem kalem onaylamak için lütfen tıklayınız: ${link}\n\n${currentTenant.name}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const allowedNextSteps = TRANSITION_WHITELIST[wo.status] || [];

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-white font-mono">{wo.workOrderNo}</h1>
              <WorkOrderStatusBadge status={wo.status} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                v{wo.statusVersion || 1}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Danışman: <b>{wo.advisorName}</b></span>
              <span>•</span>
              <span>Açılış: {new Date(wo.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-xs"
            title="Karekodlu Anahtarlık ve Torpido Etiketi Yazdır"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Anahtar Etiketi</span>
          </button>

          <button
            onClick={generateWhatsAppApprovalLink}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Müşteriye WhatsApp teklif onay linki oluştur"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Teklif Linki</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════ CENTRAL WORKFLOW PROGRESSION STEPPER ════════════════════════ */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              İş Emri Süreç Motoru & İlerleme Adımları:
            </span>
            <span className="text-[11px] font-bold text-brand-400">
              ({WORK_ORDER_STATUS_METADATA[wo.status]?.label})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {allowedNextSteps.map(nextSt => (
              <button
                key={nextSt}
                onClick={() => handleTransition(nextSt)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg ${
                  nextSt === 'CANCELLED'
                    ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60'
                    : 'bg-gradient-to-r from-brand-600 to-sky-600 hover:brightness-110 text-white border border-brand-400/40'
                }`}
              >
                <span>{WORK_ORDER_STATUS_METADATA[nextSt]?.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Visual 14-Step Bar */}
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 min-w-[1100px]">
            {sequentialStatuses.map((st, idx) => {
              const isCurrent = wo.status === st;
              const isAllowed = allowedNextSteps.includes(st);
              const meta = WORK_ORDER_STATUS_METADATA[st];

              return (
                <button
                  key={st}
                  onClick={() => handleTransition(st)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isCurrent
                      ? 'bg-brand-600 text-white border-brand-400 shadow-lg scale-105 z-10 ring-2 ring-brand-400/30'
                      : isAllowed
                        ? 'bg-slate-900 text-brand-300 border-brand-500/40 hover:bg-slate-800'
                        : 'bg-slate-950/60 text-slate-500 border-slate-800/80 hover:text-slate-300'
                  }`}
                  title={meta?.description}
                >
                  <span className="font-mono text-[9px] opacity-60">{idx + 1}.</span>
                  <span>{meta?.label}</span>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicle & Customer Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicle Card */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Araç Dosyası</span>
            {vehicle && <PlateBadge plate={vehicle.plate} size="md" />}
            <div className="font-bold text-xs text-slate-200 mt-1">
              {vehicle?.make} {vehicle?.model} ({vehicle?.year})
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Giriş: {wo.intake?.mileageIn.toLocaleString() || vehicle?.currentMileage.toLocaleString()} km
            </div>
          </div>
        </div>

        {/* Customer Card */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Müşteri Profili</span>
            <div className="font-bold text-sm text-slate-100">
              {customer?.firstName} {customer?.lastName}
            </div>
            <div className="text-xs text-brand-400 font-mono">{customer?.phone}</div>
            <div className="text-[11px] text-slate-400">{customer?.city} • Segment: {customer?.segment}</div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Mali Durum</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {wo.totalAmount.toLocaleString()} ₺
            </div>
            <div className="text-xs text-slate-300">
              Ödenen: <span className="text-emerald-400 font-bold">{wo.paidAmount.toLocaleString()} ₺</span>
            </div>
            <div className="text-[11px] text-amber-400 font-semibold">
              Kalan Bakiye: {(wo.totalAmount - wo.paidAmount).toLocaleString()} ₺
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ESTIMATE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'ESTIMATE'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Teklif & Kalemler ({wo.estimate?.items.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INSPECTION')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'INSPECTION'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Fotoğraflı Ekspertiz (MPI)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('DAMAGE_CANVAS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'DAMAGE_CANVAS'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>2D Hasar Çizimi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ASSIGNMENT')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'ASSIGNMENT'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Lift & Teknisyen Ataması</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PAYMENT')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'PAYMENT'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tahsilat & Makbuz</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HISTORY')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'HISTORY'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Statü Geçiş Geçmişi ({wo.statusHistory?.length || 0})</span>
        </button>
      </div>

      {/* TAB CONTENT: ESTIMATE */}
      {activeSubTab === 'ESTIMATE' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Teklif Kalemleri (Revizyon #{wo.estimate?.revisionNumber || 1})</span>
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300">Yeni Kalem Ekle:</div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <select
                value={newEstimateType}
                onChange={e => setNewEstimateType(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="PART">Yedek Parça</option>
                <option value="LABOR">İşçilik</option>
              </select>

              <input
                type="text"
                value={newEstimateName}
                onChange={e => setNewEstimateName(e.target.value)}
                placeholder="Parça / İşçilik Adı..."
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />

              <input
                type="number"
                min={1}
                value={newEstimateQty}
                onChange={e => setNewEstimateQty(parseInt(e.target.value) || 1)}
                placeholder="Adet"
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={newEstimatePrice || ''}
                  onChange={e => setNewEstimatePrice(parseFloat(e.target.value) || 0)}
                  placeholder="Fiyat (₺)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddEstimateItem}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs shrink-0 shadow-md active:scale-95"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Tür</th>
                  <th className="p-3.5">Açıklama</th>
                  <th className="p-3.5">Miktar</th>
                  <th className="p-3.5">Birim Fiyat</th>
                  <th className="p-3.5">KDV (%20)</th>
                  <th className="p-3.5">Toplam Tutar</th>
                  <th className="p-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 font-medium">
                {wo.estimate?.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.type === 'PART' ? 'bg-sky-500/20 text-sky-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {item.type === 'PART' ? 'PARÇA' : 'İŞÇİLİK'}
                      </span>
                    </td>
                    <td className="p-3.5 text-white font-bold">{item.name}</td>
                    <td className="p-3.5 font-mono">{item.quantity} {item.unit}</td>
                    <td className="p-3.5 font-mono">{item.unitPrice.toLocaleString()} ₺</td>
                    <td className="p-3.5 font-mono text-slate-400">{(item.unitPrice * item.quantity * 0.2).toLocaleString()} ₺</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{item.totalPrice.toLocaleString()} ₺</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleRemoveEstimateItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DAMAGE CANVAS */}
      {activeSubTab === 'DAMAGE_CANVAS' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200">2D Araç Hasar ve Ekspertiz Çizim Tuvali</h3>
          <VehicleDamageCanvas
            damagePoints={wo.intake?.damagePoints || []}
            onChange={(points) => {
              const updatedIntake = {
                ...(wo.intake || {
                  id: 'intk-' + wo.id,
                  workOrderId: wo.id,
                  mileageIn: vehicle?.currentMileage || 0,
                  fuelLevelPercent: 50,
                  hasSpareTire: true,
                  hasJack: true,
                  hasRegistrationDoc: true,
                  keyCount: 1,
                  customerComplaints: 'Periyodik kontrol',
                  damagePoints: [],
                  photos: [],
                  completedAt: new Date().toISOString(),
                  advisorName: wo.advisorName
                }),
                damagePoints: points
              };
              const updated = { ...wo, intake: updatedIntake };
              setWo(updated);
              store.saveWorkOrder(updated);
              showSuccess('Hasar Kaydedildi', 'Araç hasar tuvali güncellendi.');
            }}
          />
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENT */}
      {activeSubTab === 'ASSIGNMENT' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200">Lift İstasyonu ve Teknisyen Görevlendirme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 mb-1.5 block font-bold">Atölye Lift İstasyonu:</label>
              <select
                value={wo.bayId || ''}
                onChange={e => {
                  const bay = bays.find(b => b.id === e.target.value);
                  const updated = { ...wo, bayId: e.target.value, bayName: bay?.name };
                  setWo(updated);
                  store.saveWorkOrder(updated);
                  showSuccess('Lift Atandı', `${bay?.name || ''} iş emrine bağlandı.`);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="">Lift Seçiniz...</option>
                {bays.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1.5 block font-bold">Sorumlu Teknisyen (Usta):</label>
              <select
                value={wo.technicianId || ''}
                onChange={e => {
                  const updated = { ...wo, technicianId: e.target.value, technicianName: 'Kemal Teknisyen' };
                  setWo(updated);
                  store.saveWorkOrder(updated);
                  showSuccess('Usta Atandı', 'Teknisyen iş emrine görevlendirildi.');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="">Teknisyen Seçiniz...</option>
                <option value="user-3">Kemal Teknisyen (Mekanik & Motor)</option>
                <option value="user-5">Emre Usta (Elektrik & Diagnostik)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYMENT */}
      {activeSubTab === 'PAYMENT' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200">Tahsilat Kaydı & Fatura Makbuzu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 mb-1.5 block font-bold">Tahsil Edilecek Tutar (₺):</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 mb-1.5 block font-bold">Ödeme Yöntemi:</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="CREDIT_CARD">Kredi Kartı (POS)</option>
                <option value="CASH">Nakit</option>
                <option value="BANK_TRANSFER">Havale / EFT</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleRecordPayment}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                Tahsilatı Kaydet & Makbuz Kes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIMELINE HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" />
              <span>İş Emri Statü Değişiklik ve Denetim Geçmişi</span>
            </h3>
          </div>

          {(!wo.statusHistory || wo.statusHistory.length === 0) ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Henüz kayıtlı durum geçmişi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {wo.statusHistory.map((h, i) => (
                <div
                  key={h.id || i}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs font-mono">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>{h.fromStatus ? WORK_ORDER_STATUS_METADATA[h.fromStatus]?.label : 'Başlangıç'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-brand-400 font-bold">{WORK_ORDER_STATUS_METADATA[h.toStatus]?.label}</span>
                        {h.transitionType === 'OVERRIDE' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                            YÖNETİCİ OVERRIDE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        İşlemi Yapan: <b>{h.performedByUserName}</b> ({h.performedByRole}) • Kaynak: {h.source}
                      </div>
                      {h.reason && (
                        <div className="text-[11px] text-amber-300/90 mt-1 italic">
                          Gerekçe: "{h.reason}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-slate-500">
                    {new Date(h.performedAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════ WORKFLOW VALIDATION BLOCKING MODAL ════════════════════════ */}
      {blockingError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertOctagon className="w-6 h-6" />
                <h3 className="text-base font-black text-white">İş Akışı Durum Engeli</h3>
              </div>
              <button
                onClick={() => setBlockingError(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-bold text-rose-300">{blockingError.message}</p>

              {blockingError.details && blockingError.details.length > 0 && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-rose-900/40 space-y-1.5">
                  <span className="font-bold text-slate-400 font-mono text-[10px] uppercase">Eksik / Hatalı Koşullar:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {blockingError.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {blockingError.suggestedAction && (
                <div className="p-3 bg-brand-950/40 rounded-xl border border-brand-800/40 text-brand-300 text-[11px]">
                  💡 <b>Önerilen Çözüm:</b> {blockingError.suggestedAction}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setBlockingError(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Kapat & Düzelt
              </button>

              {blockingError.requiresOverride && (
                <button
                  onClick={() => {
                    setBlockingError(null);
                    setIsOverrideModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg"
                >
                  Yönetici İzniyle Override Et
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ MANAGER OVERRIDE MODAL ════════════════════════ */}
      {isOverrideModalOpen && pendingTargetStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Yönetici İstisna Onayı (Override)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              İş emrini kural dışı olarak <b className="text-amber-400">"{WORK_ORDER_STATUS_METADATA[pendingTargetStatus]?.label}"</b> durumuna geçirmek üzeresiniz.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-400">Zorunlu İstisna Gerekçesi (Audit Kaydı):</label>
              <textarea
                value={overrideReasonInput}
                onChange={e => setOverrideReasonInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs"
                placeholder="Örn: Müşteri acil teslimat talep etti, kalan bakiye cari hesaba aktarıldı."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsOverrideModalOpen(false); setPendingTargetStatus(null); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Vazgeç
              </button>

              <button
                disabled={!overrideReasonInput.trim()}
                onClick={() => handleTransition(pendingTargetStatus, true, overrideReasonInput)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black shadow-lg"
              >
                Gerekçeyle Onayla & Geçir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Key & Windshield Tag Modal */}
      <QRKeyTagModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        workOrder={wo}
        vehicle={vehicle}
        customer={customer}
      />
    </div>
  );
};
