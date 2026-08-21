import React from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { WorkshopBay } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { 
  Wrench, Check, Clock, AlertTriangle, ShieldCheck, 
  Sparkles, Plus, CheckCircle2, User 
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, itemData?: any) => void;
}

export const WorkshopBaysPage: React.FC<Props> = ({ onNavigate }) => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const bays = store.getBays(currentTenant.id);
  const workOrders = store.getWorkOrders(currentTenant.id);

  const handleToggleMaintenance = (bay: WorkshopBay) => {
    const updatedStatus = bay.status === 'MAINTENANCE' ? 'IDLE' : 'MAINTENANCE';
    const updated = { ...bay, status: updatedStatus as any };
    store.saveBay(updated);
    showSuccess('Lift Durumu Değişti', `${bay.name} durumu '${updatedStatus}' yapıldı.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Atölye, Lift & İstasyon Yönetimi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {bays.length} İstasyon
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Fiziksel lift dolulukları, mekanik/elektrik bölmeleri ve teknisyen görevlendirmeleri
          </p>
        </div>
      </div>

      {/* Bay Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bays.map(bay => {
          const isOccupied = bay.status === 'OCCUPIED';
          const isMaint = bay.status === 'MAINTENANCE';

          return (
            <div
              key={bay.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 shadow-xl flex flex-col justify-between ${
                isOccupied
                  ? 'bg-slate-900 border-brand-500/40 shadow-brand-950/40'
                  : isMaint
                  ? 'bg-rose-950/20 border-rose-800/40'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {bay.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    isOccupied
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      : isMaint
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isOccupied ? 'DOLU / İŞLEMDE' : isMaint ? 'ARIZALI / BAKIM' : 'BOŞ (MÜSAİT)'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-brand-400" />
                    <span>{bay.name}</span>
                  </h3>
                </div>

                {/* Occupancy Info */}
                {isOccupied && bay.activeVehiclePlate ? (
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Bağlı Araç:</span>
                      <PlateBadge plate={bay.activeVehiclePlate} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Teknisyen:</span>
                      <span className="font-bold text-slate-200">{bay.activeTechnicianName || 'Usta'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>İşlemde: 45 dk</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                    {isMaint ? 'İstasyon bakımda, araç alınamaz.' : 'İstasyon boş, sıradaki aracı alabilirsiniz.'}
                  </div>
                )}
              </div>

              {/* Bottom Toggle */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleMaintenance(bay)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    isMaint
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {isMaint ? 'Bakımı Bitir (Aktif Et)' : 'Bakıma Al'}
                </button>

                {isOccupied && bay.activeWorkOrderId && (
                  <button
                    onClick={() => {
                      const wo = store.getWorkOrderById(bay.activeWorkOrderId!);
                      if (wo) onNavigate('work_order_detail', wo);
                    }}
                    className="text-xs font-bold text-brand-400 hover:underline"
                  >
                    İş Emrini Gör →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
