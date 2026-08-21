import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { WorkOrder, Appointment, WorkshopBay, Payment } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { WorkOrderWorkflowEngine } from '../../core/WorkOrderWorkflowEngine';
import { 
  Car, Clock, AlertTriangle, CheckCircle2, TrendingUp, 
  Wrench, Users, Package, ArrowUpRight, Play, Eye, 
  Calendar, Check, Send, Sparkles, Plus, Camera, QrCode, 
  FileSpreadsheet, Tag, ShieldCheck, DollarSign, ChevronRight, 
  Filter, AlertOctagon, CheckCircle, RefreshCw 
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, itemData?: any) => void;
  onOpenNewIntake: () => void;
}

type DateFilterType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL';

export const ExecutiveDashboard: React.FC<Props> = ({ onNavigate, onOpenNewIntake }) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [dateFilter, setDateFilter] = useState<DateFilterType>('TODAY');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [managerOverrideModalOpen, setManagerOverrideModalOpen] = useState(false);
  const [targetWoToDeliver, setTargetWoToDeliver] = useState<WorkOrder | null>(null);
  const [overrideReason, setOverrideReason] = useState('Yönetici onaylı açık hesap teslimatı');

  // Reactive state synced with store events
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = store.subscribe(() => setTick(t => t + 1));
    return () => unsub();
  }, []);

  const workOrders = store.getWorkOrders(currentTenant.id);
  const appointments = store.getAppointments(currentTenant.id);
  const bays = store.getBays(currentTenant.id);
  const inventory = store.getInventory(currentTenant.id);
  const customers = store.getCustomers(currentTenant.id);
  const payments = store.getPayments(currentTenant.id);

  // Today Date String (YYYY-MM-DD)
  const todayStr = new Date().toISOString().substring(0, 10);

  // 1. Precise Filtered Payments
  const todayCompletedPayments = payments.filter(p => 
    p.status === 'COMPLETED' && p.createdAt && p.createdAt.substring(0, 10) === todayStr
  );
  const todayRevenue = todayCompletedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // 2. Precise Outstanding Receivables (Açık Alacak)
  const activeUnpaidWorkOrders = workOrders.filter(w => 
    !['CANCELLED'].includes(w.status) && ((w.totalAmount || 0) > (w.paidAmount || 0))
  );
  const totalReceivables = activeUnpaidWorkOrders.reduce((sum, w) => sum + ((w.totalAmount || 0) - (w.paidAmount || 0)), 0);

  // 3. Average Basket Size (Tamamlanan İşlerin Ortalama Cirosu)
  const completedWOs = workOrders.filter(w => ['READY_FOR_PICKUP', 'DELIVERED', 'CLOSED'].includes(w.status) && (w.totalAmount || 0) > 0);
  const averageBasket = completedWOs.length > 0
    ? Math.round(completedWOs.reduce((sum, w) => sum + (w.totalAmount || 0), 0) / completedWOs.length)
    : 0;

  // 4. Estimate Conversion Rate (Teklif Dönüşüm Oranı)
  const workOrdersWithEstimates = workOrders.filter(w => w.estimate);
  const approvedEstimatesCount = workOrdersWithEstimates.filter(w => 
    w.estimate && ['APPROVED', 'FULLY_APPROVED', 'PARTIALLY_APPROVED'].includes(w.estimate.status)
  ).length;
  const estimateConversionRate = workOrdersWithEstimates.length > 0
    ? Math.round((approvedEstimatesCount / workOrdersWithEstimates.length) * 100)
    : 100;

  // 5. Critical & Overdue Work Orders (Geciken / Acil İşler)
  const overdueWorkOrders = workOrders.filter(w => {
    if (['DELIVERED', 'CLOSED', 'CANCELLED'].includes(w.status)) return false;
    if (w.priority === 'URGENT' || w.priority === 'HIGH') return true;
    if (w.estimatedDeliveryDate && w.estimatedDeliveryDate < todayStr) return true;
    return false;
  });

  // 6. Blocked by Parts (Parça Bekleyenler)
  const partsPendingWorkOrders = workOrders.filter(w => 
    w.status === 'PARTS_PENDING' || (w.estimate && w.status === 'APPROVED' && !w.bayId)
  );

  // 7. Ready for Delivery Queue (Teslimat Bekleyenler)
  const readyForPickupQueue = workOrders.filter(w => w.status === 'READY_FOR_PICKUP');

  // 8. Pending Estimates (Müşteri Onay Bekleyenler)
  const awaitingApproval = workOrders.filter(w => 
    w.status === 'AWAITING_APPROVAL' || w.status === 'ESTIMATE_PENDING'
  );

  // Active in Workshop
  const activeWorkOrders = workOrders.filter(w => !['CLOSED', 'CANCELLED', 'DELIVERED'].includes(w.status));
  const occupiedBays = bays.filter(b => b.status === 'OCCUPIED');
  const lowStockItems = inventory.filter(i => i.stockAvailable <= i.minStockLevel);

  // Handle Workflow Status Transition
  const handleAdvanceStatus = async (wo: WorkOrder, targetStatus: any) => {
    const result = await WorkOrderWorkflowEngine.transitionWorkOrder({
      workOrder: wo,
      toStatus: targetStatus,
      actor: { id: 'user-admin', name: 'Servis Yöneticisi', role: 'TENANT_OWNER', tenantId: currentTenant.id }
    });

    if (!result.success && result.error) {
      if (targetStatus === 'DELIVERED') {
        setTargetWoToDeliver(wo);
        setManagerOverrideModalOpen(true);
      } else {
        showError('İş Akışı Engeli', result.error.message || 'Geçiş yapılamadı.');
      }
      return;
    }

    if (result.workOrder) {
      showSuccess('Statü Güncellendi', `${wo.workOrderNo} durumu "${targetStatus}" olarak güncellendi.`);
    }
  };

  const handleManagerOverrideDelivery = async () => {
    if (!targetWoToDeliver) return;
    const result = await WorkOrderWorkflowEngine.transitionWorkOrder({
      workOrder: targetWoToDeliver,
      toStatus: 'DELIVERED',
      actor: { id: 'user-admin', name: 'Servis Yöneticisi', role: 'TENANT_OWNER', tenantId: currentTenant.id },
      overrideApproved: true,
      overrideReason
    });

    if (result.success) {
      showSuccess('Yetkili Teslimat Yapıldı', `${targetWoToDeliver.workOrderNo} yönetici onayıyla teslim edildi.`);
    }
    setManagerOverrideModalOpen(false);
    setTargetWoToDeliver(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* ════════════════════════ TOP OPERATIONAL HEADER ════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
              Gerçek Zamanlı Operasyon Komuta Merkezi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentTenant.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Bugün serviste aktif <b className="text-white">{activeWorkOrders.length} araç</b>,{' '}
            <b className="text-amber-400">{awaitingApproval.length} onay bekleyen teklif</b>,{' '}
            <b className="text-emerald-400">{readyForPickupQueue.length} teslime hazır araç</b>.
          </p>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={onOpenNewIntake}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-600 hover:brightness-110 text-white font-black text-xs shadow-xl shadow-brand-600/30 transition-all active:scale-95 border border-brand-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Araç Kabulü</span>
          </button>

          <button
            onClick={() => onNavigate('mileage_prediction')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all shadow-md"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Bakım Motoru</span>
          </button>

          <button
            onClick={() => onNavigate('appointments')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all shadow-md"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Randevular</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════ 4 REAL KPI METRICS CARDS ════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Bugünkü Gerçek Tahsilat */}
        <div 
          onClick={() => onNavigate('finance')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Bugünkü Net Tahsilat</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {todayRevenue.toLocaleString()} ₺
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            Bugün {todayCompletedPayments.length} makbuz kesildi
          </div>
        </div>

        {/* 2. Açık Alacak Tutarı */}
        <div 
          onClick={() => onNavigate('finance')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Açık Alacak (Bakiye)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">
              {totalReceivables.toLocaleString()} ₺
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {activeUnpaidWorkOrders.length} açık iş emrinden kalan
          </div>
        </div>

        {/* 3. Ortalama Sepet Tutarı */}
        <div 
          onClick={() => onNavigate('work_orders')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Ortalama Sepet</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-300 font-mono">
              {averageBasket.toLocaleString()} ₺
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            İş emri başına ortalama ciro
          </div>
        </div>

        {/* 4. Teklif Dönüşüm Oranı */}
        <div 
          onClick={() => onNavigate('work_orders')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Teklif Onay Oranı</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
              %{estimateConversionRate}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {approvedEstimatesCount} / {workOrdersWithEstimates.length} teklif onaylandı
          </div>
        </div>
      </div>

      {/* ════════════════════════ 3 DESKS ROW: OVERDUE, PARTS & READY DELIVERY ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Geciken / Kritik İşler Masası */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Geciken & Kritik İşler ({overdueWorkOrders.length})</span>
            </h3>
          </div>

          {overdueWorkOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Geciken veya acil müdahale bekleyen iş emri bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueWorkOrders.slice(0, 4).map(wo => {
                const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                return (
                  <div
                    key={wo.id}
                    onClick={() => onNavigate('work_order_detail', wo)}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-rose-900/40 hover:border-rose-500/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      {veh && <PlateBadge plate={veh.plate} size="sm" />}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black">
                        {wo.priority}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      {veh?.make} {veh?.model} • {wo.workOrderNo}
                    </div>
                    <div className="text-[11px] text-rose-400 font-mono">
                      Tahmini Teslim: {wo.estimatedDeliveryDate || 'Belirtilmedi'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Parça & Tedarik Masası */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Parça Bekleyen Araçlar ({partsPendingWorkOrders.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[11px] text-brand-400 hover:underline font-bold"
            >
              Stok ➔
            </button>
          </div>

          {partsPendingWorkOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Parça tedariği nedeniyle duran araç bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {partsPendingWorkOrders.slice(0, 4).map(wo => {
                const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                return (
                  <div
                    key={wo.id}
                    onClick={() => onNavigate('work_order_detail', wo)}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-amber-900/40 hover:border-amber-500/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      {veh && <PlateBadge plate={veh.plate} size="sm" />}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Parça Bekliyor
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      {veh?.make} {veh?.model} • {wo.workOrderNo}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {wo.items.length} kalem işlem • {wo.totalAmount.toLocaleString()} ₺
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Teslimat & Tahsilat Masası */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Teslime Hazır Araçlar ({readyForPickupQueue.length})</span>
            </h3>
          </div>

          {readyForPickupQueue.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Teslimat bekleyen araç bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {readyForPickupQueue.slice(0, 4).map(wo => {
                const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                const remaining = (wo.totalAmount || 0) - (wo.paidAmount || 0);

                return (
                  <div
                    key={wo.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-900/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      {veh && <PlateBadge plate={veh.plate} size="sm" />}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        remaining > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {remaining > 0 ? `Kalan: ${remaining.toLocaleString()} ₺` : 'Ödendi'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs font-bold text-slate-200">
                        {veh?.make} {veh?.model}
                      </div>
                      <button
                        onClick={() => handleAdvanceStatus(wo, 'DELIVERED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        Teslim Et ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════ LIVE BAY MATRIX & APPOINTMENTS ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Bay Stations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Wrench className="w-4 h-4 text-brand-400" />
                <span>Canlı Lift İstasyonları ({bays.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('workshop_bays')}
                className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Tüm Atölye Planı</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bays.map(bay => (
                <div
                  key={bay.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    bay.status === 'OCCUPIED'
                      ? 'bg-slate-950/90 border-brand-500/40 shadow-inner'
                      : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-xs text-slate-200">{bay.name}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bay.status === 'OCCUPIED'
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {bay.status === 'OCCUPIED' ? 'Dolu / İşlemde' : 'Boş'}
                    </span>
                  </div>

                  {bay.status === 'OCCUPIED' && bay.activeVehiclePlate ? (
                    <div className="space-y-2 mt-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <PlateBadge plate={bay.activeVehiclePlate} size="sm" />
                        <span className="text-[11px] text-slate-300 font-bold">{bay.activeTechnicianName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-400" />
                        <span>İşlem devam ediyor</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 py-3 text-center">
                      İstasyon müsait. Yeni iş atanabilir.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Today's Appointments */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Günün Randevuları ({appointments.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-[11px] text-brand-400 hover:underline font-bold"
              >
                Tümü ➔
              </button>
            </div>

            <div className="space-y-2.5">
              {appointments.slice(0, 4).map(apt => (
                <div
                  key={apt.id}
                  className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {apt.requestedTime}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {apt.status}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-200">
                    {apt.vehiclePlate} - {apt.vehicleMakeModel}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {apt.customerName} • {apt.serviceType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════ MANAGER OVERRIDE DELIVERY MODAL ════════════════════════ */}
      {managerOverrideModalOpen && targetWoToDeliver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Yönetici Teslimat Onayı</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bu aracın üzerinde <b className="text-amber-400">{((targetWoToDeliver.totalAmount || 0) - (targetWoToDeliver.paidAmount || 0)).toLocaleString()} ₺</b> ödenmemiş açık bakiye bulunmaktadır.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Teslimat Gerekçesi (Zorunlu Denetim Kaydı):</label>
              <textarea
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                placeholder="Örn: Cari hesap anlaşmalı kurumsal müşteri, ay sonu faturalandırılacak."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setManagerOverrideModalOpen(false); setTargetWoToDeliver(null); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Vazgeç
              </button>

              <button
                onClick={handleManagerOverrideDelivery}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg"
              >
                Gerekçeyle Teslim Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
