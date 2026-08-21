import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { 
  Car, ShieldCheck, Wrench, Clock, Phone, MapPin, 
  Calendar, Check, Search, Sparkles, ChevronRight, MessageSquare, AlertTriangle, ArrowRight, CheckCircle2 
} from 'lucide-react';

interface Props {
  onBackToApp: () => void;
}

export const PublicTenantLanding: React.FC<Props> = ({ onBackToApp }) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<'HOME' | 'BOOKING' | 'STATUS_LOOKUP' | 'QUOTATION'>('HOME');
  
  // Status Lookup State
  const [lookupPlate, setLookupPlate] = useState('34 VIP 77');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  // Online Booking Wizard State
  const [bookPlate, setBookPlate] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookService, setBookService] = useState('Periyodik Bakım');
  const [bookDate, setBookDate] = useState('2026-08-22');
  const [bookTime, setBookTime] = useState('10:00');

  // Customer Quotation Approval State
  const sampleApprovedWo = store.getWorkOrders(currentTenant.id).find(w => w.estimate);
  const [quotationDecisions, setQuotationDecisions] = useState<Record<string, 'APPROVED' | 'REJECTED'>>({
    'ei-1': 'APPROVED',
    'ei-2': 'APPROVED',
    'ei-3': 'APPROVED',
    'ei-4': 'APPROVED'
  });

  const handleLookupPlate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupPlate.replace(/\s+/g, '').toUpperCase();
    const veh = store.getVehicles(currentTenant.id).find(v => v.plate.replace(/\s+/g, '').toUpperCase() === clean);
    if (!veh) {
      showError('Araç Bulunamadı', `${lookupPlate} plakalı araç için aktif kayıt bulunamadı.`);
      return;
    }
    const wo = store.getWorkOrders(currentTenant.id).find(w => w.vehicleId === veh.id);
    if (wo) {
      setTrackedOrder({ workOrder: wo, vehicle: veh });
      showSuccess('Canlı Durum Getirildi', `${veh.plate} plakalı aracın güncel aşaması görüntülendi.`);
    } else {
      showError('İş Emri Yok', `${veh.plate} için açık servis iş emri bulunmuyor.`);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPlate.trim() || !bookName.trim() || !bookPhone.trim()) {
      showError('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    const newApt = {
      id: 'apt-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      branchId: 'branch-1',
      customerId: 'cust-web',
      customerName: bookName.trim(),
      customerPhone: bookPhone.trim(),
      vehiclePlate: bookPlate.trim().toUpperCase(),
      vehicleMakeModel: 'Online Randevu',
      serviceType: bookService,
      requestedDate: bookDate,
      requestedTime: bookTime,
      status: 'CONFIRMED' as const,
      createdAt: new Date().toISOString(),
    };

    store.saveAppointment(newApt);
    showSuccess('Randevunuz Alındı!', `${bookPlate} için ${bookDate} saat ${bookTime} randevunuz oluşturuldu. SMS ile onay iletildi.`);
    setActiveTab('HOME');
  };

  const toggleDecision = (itemId: string, decision: 'APPROVED' | 'REJECTED') => {
    setQuotationDecisions(prev => ({ ...prev, [itemId]: decision }));
  };

  const servicesList = [
    { title: 'Periyodik Bakım', desc: 'Motor yağı, yağ, hava, polen ve yakıt filtresi değişimi.', price: '1.450 ₺\'den başlayan' },
    { title: 'Fren & Ön Takım', desc: 'Balata, disk değişimi, kaliper bakımı ve rotil/amortisör kontrolü.', price: '850 ₺\'den başlayan' },
    { title: 'Bilgisayarlı Diagnostik', desc: 'Arıza tespit cihazı ile beyin okuma ve kodlama.', price: '600 ₺' },
    { title: 'Lastik Değişimi & Balans', desc: 'Sökme-takma, 3D lazerli rot ayarı ve Lastik Oteli saklama.', price: '700 ₺\'den başlayan' },
    { title: 'Oto Elektrik & Akü', desc: 'Akü voltaj testi, şarj dinamosu ve aydınlatma onarımı.', price: '450 ₺\'den başlayan' },
    { title: '7/24 Acil Yol Yardım', desc: 'Yerinde akü takviyesi, lastik değişimi ve çekici yönlendirme.', price: '7/24 Çağrı' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg"
            style={{ backgroundColor: currentTenant.branding.primaryColor || '#0284c7' }}
          >
            {currentTenant.name.charAt(0)}
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-100 tracking-tight">
              {currentTenant.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Yetkili Satış Sonrası Servis Merkezi</div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('HOME')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'HOME' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ana Sayfa
          </button>

          <button
            onClick={() => setActiveTab('STATUS_LOOKUP')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'STATUS_LOOKUP' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Plaka ile Durum Sorgula</span>
          </button>

          <button
            onClick={() => setActiveTab('QUOTATION')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'QUOTATION' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Teklif Onay Ekranı</span>
          </button>

          <button
            onClick={() => setActiveTab('BOOKING')}
            className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-600/30"
          >
            Online Randevu
          </button>

          <button
            onClick={onBackToApp}
            className="ml-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Yönetim Paneline Dön ➔
          </button>
        </div>
      </nav>

      {/* VIEW: HOME / LANDING */}
      {activeTab === 'HOME' && (
        <div className="space-y-16 pb-16">
          {/* Hero Section */}
          <section className="relative pt-16 pb-12 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Gelişmiş Otomotiv Satış Sonrası ve Dijital Servis Deneyimi</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Aracınız İçin Güvenilir, Şeffaf ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-200">Dijital Bakım</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Aracınızı servise bırakırken fotoğraflı dijital kabul tutanağı alın; işlemleri, ekspertiz fotoğraflarını ve teklif kalemlerini telefonunuzdan anlık takip edin.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setActiveTab('BOOKING')}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Hemen Randevu Al</span>
              </button>

              <button
                onClick={() => setActiveTab('STATUS_LOOKUP')}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-brand-400" />
                <span>Servisteki Aracımı Sorgula</span>
              </button>
            </div>
          </section>

          {/* Services Grid */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Servis & Bakım Hizmetlerimiz</h2>
              <p className="text-xs text-slate-400">Orijinal ve OEM onaylı yedek parça garantisiyle profesyonel hizmet</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicesList.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all shadow-xl space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-100">{srv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono">{srv.price}</span>
                    <button
                      onClick={() => {
                        setBookService(srv.title);
                        setActiveTab('BOOKING');
                      }}
                      className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Randevu</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact & Map Banner */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">{currentTenant.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>{currentTenant.branding.address} - {currentTenant.branding.city}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{currentTenant.branding.phone}</span>
                </div>
              </div>

              <a
                href={`tel:${currentTenant.branding.phone}`}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>Hemen Ara / Yol Yardım</span>
              </a>
            </div>
          </section>
        </div>
      )}

      {/* VIEW: LIVE PLATE LOOKUP */}
      {activeTab === 'STATUS_LOOKUP' && (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Canlı Araç & Servis Durumu Takibi</h2>
            <p className="text-xs text-slate-400">Plakanızı yazarak aracınızın servisteki anlık aşamasını öğrenin</p>
          </div>

          <form onSubmit={handleLookupPlate} className="p-4 bg-slate-900 rounded-3xl border border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="34 VIP 77"
              value={lookupPlate}
              onChange={e => setLookupPlate(e.target.value.toUpperCase())}
              className="flex-1 uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-brand-500 tracking-wider"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30"
            >
              Sorgula
            </button>
          </form>

          {/* Lookup Result Card */}
          {trackedOrder && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-in fade-in shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <PlateBadge plate={trackedOrder.vehicle.plate} size="md" />
                  <div>
                    <h3 className="font-bold text-base text-slate-100">
                      {trackedOrder.vehicle.make} {trackedOrder.vehicle.model}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono">
                      İş Emri: {trackedOrder.workOrder.workOrderNo}
                    </div>
                  </div>
                </div>

                <WorkOrderStatusBadge status={trackedOrder.workOrder.status} size="lg" />
              </div>

              {/* Progress Timeline */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Servis Aşamaları</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>1. Araç Servise Kabul Edildi (Fotoğraflı hasar tutanağı alındı)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. Ekspertiz & Muayene Tamamlandı</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Teklif Müşteri Tarafından Onaylandı</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-400 font-bold">
                    <Wrench className="w-4 h-4 animate-spin" />
                    <span>4. Atölyede İşlem Devam Ediyor (Lift 1 İstasyonunda)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>5. Kalite Kontrol & Yıkama Hazırlığı</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>6. Araç Teslime Hazır</span>
                  </div>
                </div>
              </div>

              {/* Inspection Health Summary */}
              {trackedOrder.workOrder.inspection && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Ekspertiz Sağlık Raporu</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trackedOrder.workOrder.inspection.items.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs ${
                          item.condition === 'URGENT'
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : item.condition === 'ATTENTION'
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        }`}
                      >
                        <div className="font-bold">{item.title} ({item.condition})</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: ONLINE BOOKING WIZARD */}
      {activeTab === 'BOOKING' && (
        <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Online Servis Randevusu</h2>
            <p className="text-xs text-slate-400">Uygun gün ve saati seçerek 1 dakikada randevunuzu kesinleştirin</p>
          </div>

          <form onSubmit={handleBookingSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl text-xs">
            <div>
              <label className="text-slate-300 font-bold mb-1.5 block">Araç Plakanız *</label>
              <input
                type="text"
                placeholder="34 VIP 77"
                value={bookPlate}
                onChange={e => setBookPlate(e.target.value.toUpperCase())}
                required
                className="w-full uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Adınız Soyadınız *</label>
                <input
                  type="text"
                  placeholder="Can Kaya"
                  value={bookName}
                  onChange={e => setBookName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Telefon Numaranız *</label>
                <input
                  type="tel"
                  placeholder="+90 532..."
                  value={bookPhone}
                  onChange={e => setBookPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold mb-1 block">İstenen Servis / Bakım İşlemi</label>
              <select
                value={bookService}
                onChange={e => setBookService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
              >
                <option value="Periyodik Bakım">Periyodik Bakım (Yağ, Filtreler)</option>
                <option value="Fren & Ön Takım">Fren & Ön Takım Kontrolü</option>
                <option value="Lastik Değişimi & Rot Balans">Lastik Değişimi & Rot Balans</option>
                <option value="Akü & Oto Elektrik">Akü & Oto Elektrik</option>
                <option value="Genel Ekspertiz">Genel Kontrol & Ekspertiz</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Randevu Tarihi</label>
                <input
                  type="date"
                  value={bookDate}
                  onChange={e => setBookDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Saat</label>
                <select
                  value={bookTime}
                  onChange={e => setBookTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                >
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:30">11:30</option>
                  <option value="14:00">14:00</option>
                  <option value="15:30">15:30</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xl shadow-brand-600/30 transition-all active:scale-95"
            >
              Randevumu Onayla & Oluştur
            </button>
          </form>
        </div>
      )}

      {/* VIEW: CUSTOMER DIGITAL QUOTATION APPROVAL SIMULATOR */}
      {activeTab === 'QUOTATION' && (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Mobil Dijital Onay Portalı (Müşteri Gözünden)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Servis Teklifi ve Onay Formu</h2>
            <p className="text-xs text-slate-400">
              WhatsApp veya SMS linkiyle açılan, her kalemi ayrı ayrı kabul veya red edebildiğiniz şeffaf onay ekranı
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="font-extrabold text-sm text-slate-100">34 VIP 77 - BMW 320i</div>
                <div className="text-xs text-slate-400">Sayın Can Kaya için hazırlanan servis teklifi</div>
              </div>
              <span className="font-mono text-xs font-bold text-brand-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                Revizyon #1
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              {[
                { id: 'ei-1', name: 'Motul 8100 5W-30 Motor Yağı (5L)', type: 'Parça', price: 2227.5 },
                { id: 'ei-2', name: 'Yağ Filtresi Mann Orijinal', type: 'Parça', price: 594 },
                { id: 'ei-3', name: 'Brembo Ön Fren Balata Takımı', type: 'Parça', price: 2808 },
                { id: 'ei-4', name: 'Periyodik Bakım ve Balata Değişimi İşçiliği', type: 'İşçilik', price: 1728 },
              ].map(item => {
                const decision = quotationDecisions[item.id] || 'APPROVED';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      decision === 'APPROVED'
                        ? 'bg-slate-950 border-emerald-500/40'
                        : 'bg-slate-950/60 border-rose-800/40 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.type} • Tutar: <span className="font-bold text-emerald-400">{item.price.toLocaleString()} ₺</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDecision(item.id, 'APPROVED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          decision === 'APPROVED'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Kabul Et
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDecision(item.id, 'REJECTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          decision === 'REJECTED'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total & Submit */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Onaylanan Toplam Tutar:</span>
                <span className="font-black text-lg text-emerald-400 font-mono">
                  {Object.entries(quotationDecisions)
                    .filter(([_, d]) => d === 'APPROVED')
                    .reduce((sum, [id]) => {
                      if (id === 'ei-1') return sum + 2227.5;
                      if (id === 'ei-2') return sum + 594;
                      if (id === 'ei-3') return sum + 2808;
                      if (id === 'ei-4') return sum + 1728;
                      return sum;
                    }, 0)
                    .toLocaleString()} ₺
                </span>
              </div>

              <button
                type="button"
                onClick={() => showSuccess('Teklif Onaylandı', 'Kararlarınız kaydedildi, atölye ekibine iş emri başlatma bildirimi iletildi.')}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Teklifi Onaylıyorum & İşe Başlansın</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
