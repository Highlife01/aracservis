import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { 
  UserCheck, Play, Pause, CheckCircle2, Search, 
  Wrench, Camera, Package, Clock, AlertTriangle, ShieldCheck 
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, itemData?: any) => void;
}

export const TechnicianCenterPage: React.FC<Props> = ({ onNavigate }) => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const [activeTimerId, setActiveTimerId] = useState<string | null>('wo-101');
  const [timerSeconds, setTimerSeconds] = useState(2450); // 40m 50s
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const workOrders = store.getWorkOrders(currentTenant.id);
  const myAssignedOrders = workOrders.filter(w => !['CLOSED', 'CANCELLED', 'DELIVERED'].includes(w.status));

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = (woId: string) => {
    if (activeTimerId === woId) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerId(woId);
      setIsTimerRunning(true);
      setTimerSeconds(0);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mobile/PWA Header Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Teknisyen & Usta Çalışma Merkezi</h1>
            <div className="text-xs text-slate-400">
              Aktif Teknisyen: <b className="text-slate-200">Kemal Usta (Mekanik Şefi)</b>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono">PWA / Saha Modu Aktif</span>
        </div>
      </div>

      {/* Assigned Work Orders Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
          Üzerime Atanan Aktif İşler ({myAssignedOrders.length})
        </h2>

        {myAssignedOrders.map(wo => {
          const veh = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
          const cust = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);
          const isTimerActive = activeTimerId === wo.id && isTimerRunning;

          return (
            <div
              key={wo.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 shadow-xl ${
                isTimerActive
                  ? 'bg-slate-900 border-brand-500 shadow-brand-950/60'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {veh && <PlateBadge plate={veh.plate} size="md" />}
                  <div>
                    <div className="font-bold text-sm text-slate-100">
                      {veh?.make} {veh?.model} ({veh?.year})
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {wo.workOrderNo} • {wo.serviceType}
                    </div>
                  </div>
                </div>

                <WorkOrderStatusBadge status={wo.status} />
              </div>

              {/* Complaints / Checklist note */}
              {wo.intake?.customerComplaints && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-0.5">Müşteri Şikayeti & İş Tanımı:</span>
                  "{wo.intake.customerComplaints}"
                </div>
              )}

              {/* Big Touch Controls for Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                {/* Timer Trigger */}
                <button
                  type="button"
                  onClick={() => handleToggleTimer(wo.id)}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                    isTimerActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-brand-600 hover:bg-brand-500 text-white'
                  }`}
                >
                  {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerActive ? `Durdur (${formatTimer(timerSeconds)})` : 'İşe Başla (Süre Tut)'}</span>
                </button>

                {/* MPI Inspection Trigger */}
                <button
                  type="button"
                  onClick={() => onNavigate('work_order_detail', wo)}
                  className="py-3 px-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Ekspertiz Doldur ({wo.inspection?.items.length || 0})</span>
                </button>

                {/* Detail view */}
                <button
                  type="button"
                  onClick={() => onNavigate('work_order_detail', wo)}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>İş Emri Detayı</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
