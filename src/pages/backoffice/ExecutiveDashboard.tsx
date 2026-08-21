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
  Calendar, Check, Send, Sparkles, Plus 
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

  // Derived Metrics
  const activeWorkOrders = workOrders.filter(w => !['CLOSED', 'CANCELLED', 'DELIVERED'].includes(w.status));
  const awaitingApproval = workOrders.filter(w => w.status === 'AWAITING_APPROVAL' || w.status === 'ESTIMATE_PENDING');
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
    <div className="space-y-6">
      {/* Top Banner: Executive Operations Cockpit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
              Canlı Operasyon & Yönetici Komuta Merkezi
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {currentTenant.name}
          </h1>
          <p className="text-xs text-slate-400">
            Bugün serviste aktif <span className="text-slate-100 font-bold">{activeWorkOrders.length} araç</span> işlemde, <span className="text-emerald-400 font-bold">{readyForPickup.length} araç teslime hazır</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10">
          <button
            onClick={onOpenNewIntake}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Araç Kabulü</span>
          </button>

          <button
            onClick={() => onNavigate('appointments')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Randevu Takvimi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Vehicles */}
        <div 
          onClick={() => onNavigate('work_orders')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Servisteki Araçlar</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeWorkOrders.length}</span>
            <span className="text-xs text-sky-400 font-medium">aktif iş emri</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {readyForPickup.length} teslime hazır, {occupiedBays.length} lifte bağlı
          </div>
        </div>

        {/* Pending Customer Approvals */}
        <div 
          onClick={() => onNavigate('work_orders')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Onay Bekleyen Teklifler</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{awaitingApproval.length}</span>
            <span className="text-xs text-amber-400 font-medium">müşteri bekliyor</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Dijital link ve WhatsApp ile gönderildi
          </div>
        </div>

        {/* Lift & Bay Utilization */}
        <div 
          onClick={() => onNavigate('workshop_bays')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Atölye Lift Doluluğu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300">
              {occupiedBays.length} / {bays.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              %{Math.round((occupiedBays.length / (bays.length || 1)) * 100)} doluluk
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {bays.length - occupiedBays.length} lift şu an müsait
          </div>
        </div>

        {/* Revenue Today */}
        <div 
          onClick={() => onNavigate('finance')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Bugünkü Tahsilat</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-300">
              {todayRevenue.toLocaleString()} ₺
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {payments.length} tahsilat makbuzu kesildi
          </div>
        </div>
      </div>

      {/* Main Grid: Live Workshop Bays & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Bay Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-400" />
              <span>Canlı Atölye & Lift İstasyonları</span>
            </h3>
            <button
              onClick={() => onNavigate('workshop_bays')}
              className="text-xs text-brand-400 hover:underline flex items-center gap-1"
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
                    ? 'bg-slate-900/90 border-brand-500/30'
                    : 'bg-slate-950/60 border-slate-800'
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
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <PlateBadge plate={bay.activeVehiclePlate} size="sm" />
                      <span className="text-[11px] text-slate-400">{bay.activeTechnicianName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-400" />
                      <span>İşlem süresi: 45 dk devam ediyor</span>
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

          {/* Quick Approvals Action Table */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
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
              <div className="space-y-2">
                {awaitingApproval.map(wo => {
                  const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                  const cust = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);

                  return (
                    <div
                      key={wo.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 gap-3"
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
                          title="Müşterinin WhatsApp üzerinden onay verdiğini simüle et"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Onayla (Simüle)</span>
                        </button>

                        <button
                          onClick={() => onNavigate('work_orders', wo)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
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
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Günün Randevuları ({appointments.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-[11px] text-brand-400 hover:underline"
              >
                Tümü
              </button>
            </div>

            <div className="space-y-2.5">
              {appointments.map(apt => (
                <div
                  key={apt.id}
                  className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5"
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
            <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Kritik Stok Uyarıları ({lowStockItems.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950/90 rounded-xl border border-rose-900/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {item.sku} • {item.warehouseLocation}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold font-mono">
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
