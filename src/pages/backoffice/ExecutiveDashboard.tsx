import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { WorkOrder, Appointment, WorkshopBay } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { 
  Car, Clock, AlertTriangle, CheckCircle2, TrendingUp, 
  Wrench, Users, Package, ArrowUpRight, Play, Eye, 
  Calendar, Check, Send, Sparkles, Plus, Camera, QrCode, 
  FileSpreadsheet, Tag, ShieldCheck, DollarSign, ChevronRight 
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, itemData?: any) => void;
  onOpenNewIntake: () => void;
}

export const ExecutiveDashboard: React.FC<Props> = ({ onNavigate, onOpenNewIntake }) => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const workOrders = store.getWorkOrders(currentTenant.id);
  const appointments = store.getAppointments(currentTenant.id);
  const bays = store.getBays(currentTenant.id);
  const inventory = store.getInventory(currentTenant.id);
  const customers = store.getCustomers(currentTenant.id);
  const payments = store.getPayments(currentTenant.id);

  // Derived Operational Metrics
  const activeWorkOrders = workOrders.filter(w => !['CLOSED', 'CANCELLED', 'DELIVERED'].includes(w.status));
  const awaitingApproval = workOrders.filter(w => w.status === 'AWAITING_APPROVAL' || w.status === 'ESTIMATE_PENDING');
  const inWorkshop = workOrders.filter(w => ['IN_PROGRESS', 'ASSIGNED_TO_BAY', 'QUALITY_CHECK'].includes(w.status));
  const readyForPickup = workOrders.filter(w => w.status === 'READY_FOR_PICKUP');
  const occupiedBays = bays.filter(b => b.status === 'OCCUPIED');
  const lowStockItems = inventory.filter(i => i.stockAvailable <= i.minStockLevel);
  const todayRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  // Quick Action: Simulate Customer WhatsApp Approval
  const handleQuickSimulateApproval = (wo: WorkOrder) => {
    if (wo.estimate) {
      wo.estimate.status = 'FULLY_APPROVED';
      wo.estimate.items.forEach(i => (i.status = 'APPROVED'));
      wo.estimate.approvedTotal = wo.estimate.grandTotal;
      wo.totalAmount = wo.estimate.grandTotal;
      wo.status = 'APPROVED';
      store.saveWorkOrder(wo);
      showSuccess('Teklif Onaylandı (Simülasyon)', `${wo.workOrderNo} teklifi müşteri tarafından WhatsApp üzerinden onaylandı.`);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* ════════════════════════ TOP OPERATIONAL HEADER ════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
              Canlı Operasyon Komuta Merkezi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentTenant.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Bugün serviste aktif <b className="text-white">{activeWorkOrders.length} araç</b> işlemde,{' '}
            <b className="text-amber-400">{awaitingApproval.length} onay bekleyen teklif</b>,{' '}
            <b className="text-emerald-400">{readyForPickup.length} araç teslime hazır</b>.
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

      {/* ════════════════════════ 4 KPI METRICS CARDS ════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Vehicles */}
        <div 
          onClick={() => onNavigate('work_orders')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Servisteki Araçlar</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{activeWorkOrders.length}</span>
            <span className="text-xs text-sky-400 font-bold">aktif iş emri</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {inWorkshop.length} atölyede, {readyForPickup.length} teslime hazır
          </div>
        </div>

        {/* Pending Customer Approvals */}
        <div 
          onClick={() => onNavigate('work_orders')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Onay Bekleyenler</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">{awaitingApproval.length}</span>
            <span className="text-xs text-amber-400 font-bold">teklif bekliyor</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            WhatsApp onay linki iletilmiş
          </div>
        </div>

        {/* Lift & Bay Utilization */}
        <div 
          onClick={() => onNavigate('workshop_bays')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Atölye Lift Doluluğu</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {occupiedBays.length} / {bays.length}
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              %{Math.round((occupiedBays.length / (bays.length || 1)) * 100)} Doluluk
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {bays.length - occupiedBays.length} lift şu an müsait
          </div>
        </div>

        {/* Revenue Today */}
        <div 
          onClick={() => onNavigate('finance')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span className="font-bold">Bugünkü Tahsilat</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300 font-mono">
              {todayRevenue.toLocaleString()} ₺
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {payments.length} tahsilat makbuzu kesildi
          </div>
        </div>
      </div>

      {/* ════════════════════════ MAIN OPERATIONAL COCKPIT ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Workshop Bays & Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Bay Matrix */}
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
                        <span>İşlem süresi: 45 dk devam ediyor</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 py-3 text-center">
                      İstasyon müsait. Sıradaki araç atanabilir.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Approvals Action Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Müşteri Onayı Bekleyen Teklifler ({awaitingApproval.length})</span>
              </h3>
            </div>

            {awaitingApproval.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Şu anda müşteri onayı bekleyen teklif bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2.5">
                {awaitingApproval.map(wo => {
                  const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                  const cust = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);

                  return (
                    <div
                      key={wo.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {veh && <PlateBadge plate={veh.plate} size="sm" />}
                        <div>
                          <div className="text-xs font-bold text-slate-200">
                            {cust?.firstName} {cust?.lastName} ({veh?.make} {veh?.model})
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {wo.workOrderNo} • Teklif Tutarı: <span className="text-amber-300 font-bold">{wo.estimate?.grandTotal.toLocaleString()} ₺</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickSimulateApproval(wo)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                          title="Müşterinin WhatsApp üzerinden onay verdiğini simüle et"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Onayla (Simüle)</span>
                        </button>

                        <button
                          onClick={() => onNavigate('work_order_detail', wo)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
                        >
                          İncele
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Appointments & Low Stock Warnings */}
        <div className="space-y-6">
          {/* Today's Appointments */}
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
              {appointments.map(apt => (
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

          {/* Low Stock Items Warning */}
          {lowStockItems.length > 0 && (
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Kritik Stok Uyarıları ({lowStockItems.length})</span>
                </h3>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-[11px] text-rose-300 hover:underline font-bold"
                >
                  Depo ➔
                </button>
              </div>

              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/90 rounded-xl border border-rose-900/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {item.sku} • {item.warehouseLocation}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold font-mono border border-rose-500/30">
                        {item.stockAvailable} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
