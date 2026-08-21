import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { WorkOrder, WorkOrderStatus } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { 
  Plus, Search, Filter, LayoutGrid, List, 
  Clock, ArrowRight, Check, AlertCircle, Wrench, FileText, ChevronRight 
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, itemData?: any) => void;
  onOpenNewIntake: () => void;
}

export const WorkOrdersListPage: React.FC<Props> = ({ onNavigate, onOpenNewIntake }) => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const workOrders = store.getWorkOrders(currentTenant.id);

  const filteredOrders = workOrders.filter(wo => {
    const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
    const cust = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);

    const matchesSearch = 
      wo.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (veh && veh.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust && `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Kanban Columns Mapping
  const kanbanColumns: { id: string; title: string; statuses: WorkOrderStatus[]; color: string }[] = [
    { id: 'col-intake', title: 'Kabul & Giriş', statuses: ['DRAFT', 'CHECKED_IN'], color: 'border-sky-500/40 text-sky-400' },
    { id: 'col-insp', title: 'Ekspertiz & Teklif', statuses: ['INSPECTION', 'ESTIMATE_PENDING'], color: 'border-indigo-500/40 text-indigo-400' },
    { id: 'col-appr', title: 'Müşteri Onayı', statuses: ['AWAITING_APPROVAL', 'APPROVED'], color: 'border-amber-500/40 text-amber-400' },
    { id: 'col-bay', title: 'Atölye & İşlemde', statuses: ['PARTS_PENDING', 'ASSIGNED_TO_BAY', 'IN_PROGRESS'], color: 'border-cyan-500/40 text-cyan-400' },
    { id: 'col-qc', title: 'Kalite Kontrol & Yıkama', statuses: ['QUALITY_CHECK', 'WASH_DETAILING'], color: 'border-teal-500/40 text-teal-400' },
    { id: 'col-ready', title: 'Teslime Hazır & Bitti', statuses: ['READY_FOR_PICKUP', 'DELIVERED', 'CLOSED'], color: 'border-emerald-500/40 text-emerald-400' },
  ];

  const handleQuickAdvanceStatus = (wo: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStateMap: Record<WorkOrderStatus, WorkOrderStatus> = {
      DRAFT: 'CHECKED_IN',
      CHECKED_IN: 'INSPECTION',
      INSPECTION: 'ESTIMATE_PENDING',
      ESTIMATE_PENDING: 'AWAITING_APPROVAL',
      AWAITING_APPROVAL: 'APPROVED',
      APPROVED: 'IN_PROGRESS',
      PARTS_PENDING: 'IN_PROGRESS',
      ASSIGNED_TO_BAY: 'IN_PROGRESS',
      IN_PROGRESS: 'QUALITY_CHECK',
      QUALITY_CHECK: 'READY_FOR_PICKUP',
      WASH_DETAILING: 'READY_FOR_PICKUP',
      READY_FOR_PICKUP: 'DELIVERED',
      DELIVERED: 'CLOSED',
      CLOSED: 'CLOSED',
      CANCELLED: 'CANCELLED',
    };

    const nextStatus = nextStateMap[wo.status];
    if (nextStatus && nextStatus !== wo.status) {
      wo.status = nextStatus;
      store.saveWorkOrder(wo);
      showSuccess('Durum İlerletildi', `${wo.workOrderNo} durumu '${nextStatus}' olarak güncellendi.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>İş Emirleri & Servis Akışı</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
              {workOrders.length} Kayıt
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Kabulden teslimata 15 aşamalı akıllı iş emri durum makinesi ve Kanban panosu
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
          </div>

          <button
            onClick={onOpenNewIntake}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İş Emri</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="İş emri no, plaka veya müşteri ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none text-xs"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="CHECKED_IN">Araç Kabul Edildi</option>
            <option value="INSPECTION">Ekspertizde</option>
            <option value="AWAITING_APPROVAL">Onay Bekleniyor</option>
            <option value="APPROVED">Onaylandı</option>
            <option value="IN_PROGRESS">İşlemde</option>
            <option value="READY_FOR_PICKUP">Teslime Hazır</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="CLOSED">Kapandı</option>
          </select>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colOrders = filteredOrders.filter(wo => col.statuses.includes(wo.status));

            return (
              <div
                key={col.id}
                className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-3.5 flex flex-col min-w-[240px]"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-2.5 mb-3 border-b-2 ${col.color.split(' ')[0]}`}>
                  <h3 className={`font-bold text-xs ${col.color.split(' ')[1]}`}>
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-semibold">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[68vh]">
                  {colOrders.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border border-dashed border-slate-800/80 rounded-xl text-slate-600 text-[11px]">
                      Bu aşamada araç yok
                    </div>
                  ) : (
                    colOrders.map(wo => {
                      const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                      const cust = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);

                      return (
                        <div
                          key={wo.id}
                          onClick={() => onNavigate('work_order_detail', wo)}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer shadow-md hover:shadow-xl group space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-brand-400">
                              {wo.workOrderNo}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                              {wo.serviceType}
                            </span>
                          </div>

                          {veh && <PlateBadge plate={veh.plate} size="sm" />}

                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-slate-100 group-hover:text-brand-300 transition-colors truncate">
                              {cust?.firstName} {cust?.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {veh?.make} {veh?.model}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <div className="font-bold text-emerald-400 font-mono">
                              {wo.totalAmount.toLocaleString()} ₺
                            </div>

                            <button
                              onClick={(e) => handleQuickAdvanceStatus(wo, e)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-brand-600 transition-all"
                              title="Bir sonraki duruma ilerlet"
                            >
                              <span>İlerlet</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">İş Emri No</th>
                  <th className="p-4">Araç / Plaka</th>
                  <th className="p-4">Müşteri</th>
                  <th className="p-4">Hizmet Türü</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Tutar</th>
                  <th className="p-4">Ödeme</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map(wo => {
                  const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
                  const cust = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => onNavigate('work_order_detail', wo)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-brand-400">{wo.workOrderNo}</td>
                      <td className="p-4">
                        {veh && (
                          <div className="flex items-center gap-2">
                            <PlateBadge plate={veh.plate} size="sm" />
                            <span className="text-slate-400">{veh.make} {veh.model}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {cust?.firstName} {cust?.lastName}
                      </td>
                      <td className="p-4">{wo.serviceType}</td>
                      <td className="p-4">
                        <WorkOrderStatusBadge status={wo.status} size="sm" />
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-100">
                        {wo.totalAmount.toLocaleString()} ₺
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wo.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : wo.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {wo.paymentStatus === 'PAID' ? 'Ödendi' : wo.paymentStatus === 'PARTIALLY_PAID' ? 'Kısmi' : 'Ödenmedi'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('work_order_detail', wo);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
