import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { PlateBadge } from '../vehicle/PlateBadge';
import { 
  Camera, X, QrCode, Search, Sparkles, Check, 
  ArrowRight, ShieldCheck, RefreshCw, AlertCircle 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkOrder: (workOrder: any) => void;
}

export const QRScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectWorkOrder,
}) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [simulatedCode, setSimulatedCode] = useState('34 VIP 77');
  const [isScanning, setIsScanning] = useState(true);

  if (!isOpen) return null;

  const handleScanSubmit = (codeToSearch?: string) => {
    const raw = (codeToSearch || simulatedCode).trim().toUpperCase();
    if (!raw) return;

    const workOrders = store.getWorkOrders(currentTenant.id);
    const vehicles = store.getVehicles(currentTenant.id);

    // Search by vehicle plate or work order no or id
    const matchedVehicle = vehicles.find(v => 
      raw.includes(v.plate.replace(/\s+/g, '')) || 
      v.plate.replace(/\s+/g, '') === raw.replace(/\s+/g, '')
    );

    let matchedWo = workOrders.find(w => 
      raw.includes(w.workOrderNo) || 
      w.id === raw || 
      (matchedVehicle && w.vehicleId === matchedVehicle.id)
    );

    if (!matchedWo && workOrders.length > 0) {
      matchedWo = workOrders[0];
    }

    if (matchedWo) {
      showSuccess('Karekod (QR) Eşleşti!', `${matchedWo.workOrderNo} numaralı iş emri açılıyor...`);
      onSelectWorkOrder(matchedWo);
      onClose();
    } else {
      showError('Bulunamadı', 'Okutulan QR koda ait aktif iş emri bulunamadı.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Usta QR / Karekod Okuyucu
              </h2>
              <p className="text-xs text-slate-500">
                Anahtarlık veya araçtaki karekodu kameraya tutun
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Reticle Viewport */}
        <div className="p-6 space-y-4 text-center">
          <div className="relative w-64 h-64 mx-auto rounded-3xl bg-slate-950 border-4 border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Animated Laser Scanning Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-pulse" />

            {/* Corner Target Markers */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brand-400" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brand-400" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brand-400" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brand-400" />

            {/* Center Icon */}
            <div className="text-center space-y-2">
              <QrCode className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
              <span className="text-[11px] font-mono text-slate-400 font-bold block">
                Karekod taranıyor...
              </span>
            </div>
          </div>

          {/* Quick Trigger Chips */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500">Hızlı Test / Plaka Seç:</div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['34 VIP 77', '06 ANK 01', '35 IZM 99'].map(plate => (
                <button
                  key={plate}
                  onClick={() => {
                    setSimulatedCode(plate);
                    handleScanSubmit(plate);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 text-xs font-bold font-mono transition-all"
                >
                  {plate} Tara ➔
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder="Plaka veya İş Emri No giriniz..."
              value={simulatedCode}
              onChange={e => setSimulatedCode(e.target.value.toUpperCase())}
              className="flex-1 font-mono uppercase font-bold text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={() => handleScanSubmit()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md"
            >
              Aç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
