import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { TireHotelRecord } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { 
  Layers, Plus, Search, MessageSquare, Send, 
  Calendar, Check, AlertTriangle, ShieldCheck, X 
} from 'lucide-react';

export const TireHotelPage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Record State
  const [plate, setPlate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [brand, setBrand] = useState('Michelin');
  const [model, setModel] = useState('Pilot Alpin 5');
  const [size, setSize] = useState('205/55 R16');
  const [season, setSeason] = useState<TireHotelRecord['season']>('WINTER');
  const [dotCode, setDotCode] = useState('4023');
  const [shelf, setShelf] = useState('Blok C, Raf 02/1');
  const [hasRims, setHasRims] = useState(true);

  const records = store.getTireHotelRecords(currentTenant.id);

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeason = seasonFilter === 'ALL' || r.season === seasonFilter;
    return matchesSearch && matchesSeason;
  });

  const handleSaveTire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !customerName.trim()) {
      showError('Eksik Alan', 'Plaka ve müşteri adı zorunludur.');
      return;
    }

    const newRec: TireHotelRecord = {
      id: 'th-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      customerId: 'cust-1',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '+90 532 000 00 00',
      vehicleId: 'veh-1',
      vehiclePlate: plate.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      tireSize: size.trim(),
      season,
      dotCode,
      treadDepthFL: 6.5,
      treadDepthFR: 6.5,
      treadDepthRL: 6.8,
      treadDepthRR: 6.8,
      hasRims,
      shelfLocation: shelf.trim(),
      intakeDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-11-15',
      status: 'STORED',
    };

    store.saveTireHotelRecord(newRec);
    showSuccess('Lastik Emanete Alındı', `${newRec.vehiclePlate} lastikleri ${newRec.shelfLocation} rafına yerleştirildi.`);
    setIsModalOpen(false);
    setPlate('');
    setCustomerName('');
  };

  const handleSendSeasonalWhatsApp = (record: TireHotelRecord) => {
    const cleanPhone = record.customerPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Sayın ${record.customerName}, Lastik Otelimizde emanette bulunan ${record.brand} ${record.season === 'WINTER' ? 'Kışlık' : 'Yazlık'} lastiklerinizin montajı için sezon randevunuzu hemen oluşturabilirsiniz.\n\n${currentTenant.name}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Lastik Oteli & Sezonluk Envanter</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {records.length} Takım Lastik
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            DOT tarihi, mm diş derinliği, jant durumu ve sezonluk WhatsApp randevu çağrıları
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Lastik Kabul Et</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Plaka, müşteri veya lastik markası ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={seasonFilter}
            onChange={e => setSeasonFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">Tüm Sezonlar</option>
            <option value="WINTER">Kışlık Lastikler</option>
            <option value="SUMMER">Yazlık Lastikler</option>
            <option value="ALL_SEASON">4 Mevsim</option>
          </select>
        </div>
      </div>

      {/* Tire Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map(r => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <PlateBadge plate={r.vehiclePlate} size="sm" />
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  r.season === 'WINTER'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {r.season === 'WINTER' ? 'Kış Lastiği' : 'Yaz Lastiği'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-100">
                  {r.brand} {r.model}
                </h3>
                <div className="text-xs text-brand-400 font-mono font-bold">{r.tireSize}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {r.customerName} • {r.customerPhone}
                </div>
              </div>

              {/* Tread Depth & DOT Details */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Diş Derinliği (mm):</span>
                  <span className="font-bold text-emerald-400">
                    Ön: {r.treadDepthFL} / Arka: {r.treadDepthRL} mm
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">DOT Üretim Yılı:</span>
                  <span className="font-bold text-slate-200">{r.dotCode || '2023'}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Jant Durumu:</span>
                  <span className="font-bold text-slate-200">{r.hasRims ? 'Jantlı' : 'Jantsız'}</span>
                </div>
                <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Raf / Konum:</span>
                  <span className="font-bold text-amber-300">{r.shelfLocation}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleSendSeasonalWhatsApp(r)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Sezon Randevu Çağrısı Gönder</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Tire Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Lastik Emanet Kabulü</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTire} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Araç Plakası *</label>
                <input
                  type="text"
                  placeholder="34 ABC 123"
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                  required
                  className="w-full uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Müşteri Adı *</label>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Telefon</label>
                  <input
                    type="tel"
                    placeholder="+90 532..."
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Lastik Markası</label>
                  <input
                    type="text"
                    placeholder="Michelin / Continental"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Ebat</label>
                  <input
                    type="text"
                    placeholder="205/55 R16"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Sezon</label>
                  <select
                    value={season}
                    onChange={e => setSeason(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="WINTER">Kışlık</option>
                    <option value="SUMMER">Yazlık</option>
                    <option value="ALL_SEASON">4 Mevsim</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">DOT Kodu</label>
                  <input
                    type="text"
                    placeholder="4023"
                    value={dotCode}
                    onChange={e => setDotCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Depo & Raf Lokasyonu</label>
                <input
                  type="text"
                  placeholder="Blok A, Raf 04/2"
                  value={shelf}
                  onChange={e => setShelf(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Emanete Al
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
