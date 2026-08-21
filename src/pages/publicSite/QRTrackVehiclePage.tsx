import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { 
  Car, ShieldCheck, Wrench, Clock, Phone, MapPin, 
  Calendar, Check, Search, Sparkles, ChevronRight, MessageSquare, 
  AlertTriangle, ArrowRight, CheckCircle2, QrCode, CreditCard, Download, Shield 
} from 'lucide-react';

interface Props {
  initialPlate?: string;
  onBackToApp?: () => void;
}

export const QRTrackVehiclePage: React.FC<Props> = ({ 
  initialPlate = '34 VIP 77',
  onBackToApp
}) => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const [queryPlate, setQueryPlate] = useState(initialPlate);
  const [isPaid, setIsPaid] = useState(false);

  const vehicles = store.getVehicles(currentTenant.id);
  const workOrders = store.getWorkOrders(currentTenant.id);

  const matchedVehicle = vehicles.find(v => 
    v.plate.replace(/\s+/g, '').toUpperCase() === queryPlate.replace(/\s+/g, '').toUpperCase()
  ) || vehicles[0];

  const matchedWo = workOrders.find(w => w.vehicleId === matchedVehicle?.id) || workOrders[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-sm"
            style={{ backgroundColor: currentTenant.branding.primaryColor || '#0284c7' }}
          >
            {currentTenant.name.charAt(0)}
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 tracking-tight">
              {currentTenant.name}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Karekodlu Canlı Servis Durumu Takip Portalı
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${currentTenant.branding.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Servisi Ara</span>
          </a>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Panele Dön ➔
            </button>
          )}
        </div>
      </header>

      {/* Main Track Viewport */}
      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-600 via-sky-600 to-indigo-600 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PlateBadge plate={matchedVehicle?.plate || '34 VIP 77'} size="md" />
              <div>
                <h1 className="text-lg font-black tracking-tight">
                  {matchedVehicle?.make} {matchedVehicle?.model} ({matchedVehicle?.year})
                </h1>
                <div className="text-xs text-sky-100 font-mono">
                  İş Emri No: {matchedWo?.workOrderNo || 'WO-2026-0042'}
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold border border-white/30 w-fit">
              {matchedWo?.serviceType || 'Periyodik Bakım'}
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-100">
            <span>Kabul Tarihi: {new Date(matchedWo?.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
            <span>Danışman: {matchedWo?.advisorName || 'Murat Danışman'}</span>
            <span>Tahmini Teslim: Bugün 17:30</span>
          </div>
        </div>

        {/* Live Stepper Progression */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Servis İşlem Adımları & Güncel Aşama</span>
          </h3>

          <div className="space-y-4">
            {[
              { step: 1, title: 'Araç Servise Kabul Edildi', desc: '2D fotoğraflı hasar kontrolü ve teslim tutanağı imzalandı.', status: 'COMPLETED' },
              { step: 2, title: 'Ekspertiz (MPI) Muayenesi Yapıldı', desc: 'Frenler, motor ve yürüyen aksam kontrol listesi tamamlandı.', status: 'COMPLETED' },
              { step: 3, title: 'Teklif Kalemleri Onaylandı', desc: 'Müşteri WhatsApp üzerinden yedek parça ve işçilik teklifini onayladı.', status: 'COMPLETED' },
              { step: 4, title: 'Atölyede İşlem Devam Ediyor', desc: 'Lift 1 İstasyonunda periyodik bakım ve parça montajı yapılıyor.', status: 'IN_PROGRESS' },
              { step: 5, title: 'Kalite Kontrol & Yıkama', desc: 'Usta şefi son kontrolü ve araç içi ozon temizliği.', status: 'PENDING' },
              { step: 6, title: 'Araç Teslime Hazır', desc: 'Müşteriye SMS/WhatsApp ile hazır bildirimi iletilir.', status: 'PENDING' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs ${
                  s.status === 'COMPLETED'
                    ? 'bg-emerald-500 text-white'
                    : s.status === 'IN_PROGRESS'
                    ? 'bg-brand-600 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {s.status === 'COMPLETED' ? <Check className="w-4 h-4" /> : s.step}
                </div>

                <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${
                      s.status === 'IN_PROGRESS' ? 'text-brand-600' : s.status === 'COMPLETED' ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {s.title}
                    </h4>
                    {s.status === 'IN_PROGRESS' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                        Şu Anki Aşama
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MPI Health Report Card */}
        {matchedWo?.inspection && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ekspertiz Sağlık Karnesi</span>
              </h3>
              <span className="text-xs font-bold text-slate-900">Teknisyen: {matchedWo.inspection.technicianName}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedWo.inspection.items.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    item.condition === 'URGENT'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : item.condition === 'ATTENTION'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-mono shadow-2xs">
                      {item.condition === 'GOOD' ? 'Sorunsuz ✓' : item.condition === 'ATTENTION' ? 'Takip Edilmeli ⚠️' : 'Acil Değişim ❌'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice & Payment Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>Onaylanan İşlemler ve Ödeme Özeti</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">KDV Dahil</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Motul 8100 5W-30 Motor Yağı (5L)</span>
              <span className="font-mono font-bold text-slate-900">2.227,50 ₺</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Mann Orijinal Yağ Filtresi</span>
              <span className="font-mono font-bold text-slate-900">594,00 ₺</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Brembo Ön Fren Balata Takımı</span>
              <span className="font-mono font-bold text-slate-900">2.808,00 ₺</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Periyodik Bakım ve Balata İşçiliği</span>
              <span className="font-mono font-bold text-slate-900">1.728,00 ₺</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-sm font-bold border-t border-slate-200">
            <span className="text-slate-700">Toplam Tutar:</span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              7.357,50 ₺
            </span>
          </div>

          {isPaid ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Ödeme Başarıyla Alındı (Makbuz No: MAK-2026-091)</span>
              </div>
              <button
                onClick={() => showSuccess('Makbuz İndirildi', 'E-Makbuz cihazınıza kaydedildi.')}
                className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-700 flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>E-Makbuz</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsPaid(true);
                showSuccess('Ödeme Başarılı', '7.357,50 ₺ kredi kartı ödemeniz tahsil edildi.');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Kredi Kartı ile Online Öde (7.357,50 ₺)</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
