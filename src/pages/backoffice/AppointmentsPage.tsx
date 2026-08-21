import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { Appointment } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { 
  Calendar as CalendarIcon, Clock, Plus, Filter, 
  Search, CheckCircle2, XCircle, ArrowRight, User, Phone, Check, X 
} from 'lucide-react';

interface Props {
  onOpenNewIntake: () => void;
}

export const AppointmentsPage: React.FC<Props> = ({ onOpenNewIntake }) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-08-21');
  const [searchTerm, setSearchTerm] = useState('');

  // New Appointment Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [serviceType, setServiceType] = useState('Periyodik Bakım');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const appointments = store.getAppointments(currentTenant.id);

  const filteredAppointments = appointments.filter(a => {
    return (
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !plate.trim()) {
      showError('Eksik Alan', 'Lütfen müşteri adı, telefon ve plakayı giriniz.');
      return;
    }

    const newApt: Appointment = {
      id: 'apt-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      branchId: 'branch-1',
      customerId: 'cust-' + Math.random().toString(36).substr(2, 6),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      vehiclePlate: plate.trim().toUpperCase(),
      vehicleMakeModel: makeModel.trim() || 'Genel Araç',
      serviceType,
      requestedDate: selectedDate,
      requestedTime: time,
      status: 'CONFIRMED',
      customerNotes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    store.saveAppointment(newApt);
    showSuccess('Randevu Oluşturuldu', `${newApt.vehiclePlate} için ${newApt.requestedDate} saat ${newApt.requestedTime} randevusu kaydedildi.`);
    setIsModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setPlate('');
    setMakeModel('');
    setNotes('');
  };

  const handleUpdateStatus = (apt: Appointment, status: Appointment['status']) => {
    const updated = { ...apt, status };
    store.saveAppointment(updated);
    showSuccess('Durum Güncellendi', `Randevu durumu '${status}' yapıldı.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Randevu & Kapasite Takvimi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {appointments.length} Randevu
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Müşteri online randevuları, şube lift kapasitesi ve günlük servis planı
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Randevu Ekle</span>
        </button>
      </div>

      {/* Filter & Date Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Plaka, müşteri veya işlem türü ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-brand-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map(apt => (
          <div
            key={apt.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {apt.requestedTime} • {apt.requestedDate}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  apt.status === 'CONFIRMED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : apt.status === 'ARRIVED'
                    ? 'bg-sky-500/20 text-sky-300'
                    : apt.status === 'IN_SERVICE'
                    ? 'bg-brand-500/20 text-brand-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {apt.status}
                </span>
              </div>

              <PlateBadge plate={apt.vehiclePlate} size="sm" />

              <div className="space-y-0.5">
                <div className="font-bold text-sm text-slate-100">{apt.customerName}</div>
                <div className="text-xs text-brand-400 font-mono">{apt.customerPhone}</div>
                <div className="text-xs text-slate-300 font-medium">{apt.vehicleMakeModel}</div>
                <div className="text-xs text-slate-400">{apt.serviceType}</div>
              </div>

              {apt.customerNotes && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 italic">
                  "{apt.customerNotes}"
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {apt.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleUpdateStatus(apt, 'ARRIVED')}
                  className="flex-1 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all"
                >
                  Servise Geldi
                </button>
              )}

              {apt.status === 'ARRIVED' && (
                <button
                  onClick={onOpenNewIntake}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Kabul & İş Emri Aç
                </button>
              )}

              {apt.status !== 'CANCELLED' && apt.status !== 'IN_SERVICE' && (
                <button
                  onClick={() => handleUpdateStatus(apt, 'CANCELLED')}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Randevuyu İptal Et"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Yeni Randevu Kaydı</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
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
                  <label className="text-slate-300 font-bold mb-1 block">Telefon (WhatsApp) *</label>
                  <input
                    type="tel"
                    placeholder="+90 532..."
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Marka & Model</label>
                <input
                  type="text"
                  placeholder="Örn: BMW 320i / VW Golf"
                  value={makeModel}
                  onChange={e => setMakeModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Saat Seçimi</label>
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Hizmet Türü</label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Müşteri Notu</label>
                <textarea
                  rows={2}
                  placeholder="Müşterinin belirttiği ek notlar..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30"
                >
                  Randevuyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
