import React, { useRef } from 'react';
import { WorkOrder, Vehicle, Customer } from '../../types';
import { useTenant } from '../../core/TenantContext';
import { PlateBadge } from '../vehicle/PlateBadge';
import { Printer, X, QrCode, Tag, Check, Download, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder;
  vehicle?: Vehicle;
  customer?: Customer;
}

export const QRKeyTagModal: React.FC<Props> = ({
  isOpen,
  onClose,
  workOrder,
  vehicle,
  customer,
}) => {
  const { currentTenant } = useTenant();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // QR Code payload (Direct action URL or plate payload)
  const qrData = `AUTOSERVICE://wo/${workOrder.id}/${vehicle?.plate || workOrder.workOrderNo}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    qrData
  )}&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Karekodlu (QR) Anahtar & Torpido Takip Etiketi
              </h2>
              <p className="text-xs text-slate-500">
                Ustanın telefonla okutup iş emrine ulaşabileceği termal etiket
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Viewport */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60 flex flex-col items-center justify-center">
          {/* 🏷️ THE PHYSICAL TAG CONTAINER */}
          <div
            ref={printRef}
            className="printable-card w-full max-w-md bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-xl text-slate-900 space-y-4 font-sans select-none"
          >
            {/* Top Bar: Service Info & Tag Title */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <div className="text-xs font-black tracking-tight uppercase text-brand-700">
                  {currentTenant.name}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  {currentTenant.branding.phone}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                  SERVİS TAKİP ETİKETİ
                </span>
              </div>
            </div>

            {/* Main Center: Plate + QR Code */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Araç Plakası</div>
                  <PlateBadge plate={vehicle?.plate || '34 VIP 77'} size="md" />
                </div>

                <div>
                  <div className="text-xs font-black text-slate-900">
                    {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium truncate max-w-[180px]">
                    {customer?.firstName} {customer?.lastName || workOrder.customerNotes}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500">
                  İş Emri: <b className="text-slate-900">{workOrder.workOrderNo}</b>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="p-1.5 bg-white border-2 border-slate-900 rounded-xl flex flex-col items-center shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-24 h-24 object-contain"
                />
                <span className="text-[8px] font-mono font-bold text-slate-700 mt-1">
                  USTA KAMERA TARA
                </span>
              </div>
            </div>

            {/* Bottom Bar: Intake & Check Notes */}
            <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-600">
              <span>
                Kabul: {new Date(workOrder.createdAt).toLocaleDateString('tr-TR')}
              </span>
              <span className="font-bold text-slate-900 uppercase">
                {workOrder.serviceType}
              </span>
              <span>Danışman: {workOrder.advisorName.split(' ')[0]}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center mt-3 no-print">
            Termal etiket yazıcıları (50x30mm veya 70x40mm) ve standart A4 için optimize edilmiştir.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Kapat
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            <span>Etiketi Yazdır (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
