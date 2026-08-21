import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { Customer, Vehicle } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { 
  Users, Car, Plus, Search, Phone, Mail, 
  MapPin, Star, Clock, Calendar, ChevronRight, X, ShieldAlert, Sparkles 
} from 'lucide-react';

interface Props {
  initialType?: 'CUSTOMERS' | 'VEHICLES';
  onNavigate: (tab: string, itemData?: any) => void;
}

export const CustomersVehiclesPage: React.FC<Props> = ({ initialType = 'CUSTOMERS', onNavigate }) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'CUSTOMERS' | 'VEHICLES'>(initialType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // New Customer Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustType, setNewCustType] = useState<Customer['type']>('INDIVIDUAL');
  const [newCustSegment, setNewCustSegment] = useState<Customer['segment']>('REGULAR');

  // New Vehicle Modal State
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehMake, setNewVehMake] = useState('');
  const [newVehModel, setNewVehModel] = useState('');
  const [newVehYear, setNewVehYear] = useState('2022');
  const [newVehVin, setNewVehVin] = useState('');
  const [newVehKm, setNewVehKm] = useState('50000');
  const [newVehCustId, setNewVehCustId] = useState('');

  const customers = store.getCustomers(currentTenant.id);
  const vehicles = store.getVehicles(currentTenant.id);

  const filteredCustomers = customers.filter(c => {
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredVehicles = vehicles.filter(v => {
    return (
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showError('Eksik Alan', 'Müşteri adı ve telefon numarası zorunludur.');
      return;
    }

    const parts = newCustName.trim().split(' ');
    const firstName = parts[0] || 'Müşteri';
    const lastName = parts.slice(1).join(' ') || '';

    const newCust: Customer = {
      id: 'cust-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      type: newCustType,
      firstName,
      lastName,
      phone: newCustPhone.trim(),
      email: newCustEmail.trim(),
      city: currentTenant.branding.city || 'İstanbul',
      address: '',
      segment: newCustSegment,
      discountRate: newCustSegment === 'VIP' ? 10 : newCustSegment === 'FLEET' ? 15 : 0,
      loyaltyPoints: 100,
      ltv: 0,
      totalSpent: 0,
      visitCount: 0,
      optInSms: true,
      optInWhatsApp: true,
      optInEmail: true,
      createdAt: new Date().toISOString(),
    };

    store.saveCustomer(newCust);
    showSuccess('Müşteri Kaydedildi', `${newCust.firstName} ${newCust.lastName} sisteme eklendi.`);
    setIsCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehPlate.trim()) {
      showError('Eksik Alan', 'Plaka zorunludur.');
      return;
    }

    const newVeh: Vehicle = {
      id: 'veh-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      customerId: newVehCustId || (customers[0]?.id || 'cust-1'),
      plate: newVehPlate.trim().toUpperCase(),
      vin: newVehVin.trim() || 'TR' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      make: newVehMake.trim() || 'Genel Marka',
      model: newVehModel.trim() || 'Genel Model',
      year: parseInt(newVehYear) || 2022,
      fuelType: 'BENZIN',
      transmission: 'OTOMATIK',
      color: 'Beyaz',
      currentMileage: parseInt(newVehKm) || 50000,
      createdAt: new Date().toISOString(),
    };

    store.saveVehicle(newVeh);
    showSuccess('Araç Kaydedildi', `${newVeh.plate} plakalı araç garaja eklendi.`);
    setIsVehicleModalOpen(false);
    setNewVehPlate('');
    setNewVehMake('');
    setNewVehModel('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Müşteri CRM & 360° Araç Dosyaları</span>
          </h1>
          <p className="text-xs text-slate-400">
            LTV, segmentasyon, araç zaman tünelleri ve geçmiş servis kayıtları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveSubTab('CUSTOMERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'CUSTOMERS'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Müşteriler ({customers.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('VEHICLES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'VEHICLES'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Araçlar ({vehicles.length})</span>
            </button>
          </div>

          {activeSubTab === 'CUSTOMERS' ? (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Müşteri</span>
            </button>
          ) : (
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Araç</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-2 max-w-md text-xs">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder={activeSubTab === 'CUSTOMERS' ? "Müşteri adı, telefon veya firma ara..." : "Plaka, şasi no (VIN) veya model ara..."}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* CUSTOMERS VIEW */}
      {activeSubTab === 'CUSTOMERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(c => {
            const custVehicles = vehicles.filter(v => v.customerId === c.id);

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {c.type === 'INDIVIDUAL' ? 'Bireysel' : c.type === 'FLEET' ? 'Filo Müşterisi' : 'Kurumsal'}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      c.segment === 'VIP'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : c.segment === 'FLEET'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.segment}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-100">
                      {c.firstName} {c.lastName}
                    </h3>
                    {c.companyName && <div className="text-xs text-slate-400">{c.companyName}</div>}
                    <div className="text-xs text-brand-400 font-mono mt-1">{c.phone}</div>
                  </div>

                  {/* Registered Vehicles */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                      Kayıtlı Araçları ({custVehicles.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {custVehicles.map(v => (
                        <PlateBadge key={v.id} plate={v.plate} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial KPI */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">LTV / Toplam Ciro:</span>
                    <span className="font-bold text-emerald-400 font-mono">{c.ltv.toLocaleString()} ₺</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Ziyaret Sayısı:</span>
                    <span className="font-bold text-slate-200">{c.visitCount} defa</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VEHICLES VIEW */}
      {activeSubTab === 'VEHICLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map(v => {
            const owner = customers.find(c => c.id === v.customerId);

            return (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <PlateBadge plate={v.plate} size="md" />
                    <span className="text-xs font-mono font-bold text-slate-400">{v.year}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-100">
                      {v.make} {v.model}
                    </h3>
                    {v.subModel && <div className="text-xs text-slate-400">{v.subModel}</div>}
                    <div className="text-[11px] text-slate-400 font-mono mt-1">VIN: {v.vin}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Araç Sahibi:</span>
                      <span className="font-bold text-slate-200">{owner ? `${owner.firstName} ${owner.lastName}` : 'Kayıtsız'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Güncel Km:</span>
                      <span className="font-mono font-bold text-sky-400">{v.currentMileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Son Servis:</span>
                      <span className="text-slate-300">{v.lastServiceDate || 'Kayıt Yok'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{v.fuelType} • {v.transmission}</span>
                  <button
                    onClick={() => onNavigate('work_orders')}
                    className="text-brand-400 hover:underline text-xs font-semibold"
                  >
                    Servis Geçmişi →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Yeni Müşteri Kartı</h2>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Müşteri Adı Soyadı *</label>
                <input
                  type="text"
                  placeholder="Örn: Can Kaya"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Telefon Numarası *</label>
                <input
                  type="tel"
                  placeholder="+90 532..."
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">E-Posta</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={newCustEmail}
                  onChange={e => setNewCustEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Müşteri Tipi</label>
                  <select
                    value={newCustType}
                    onChange={e => setNewCustType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="INDIVIDUAL">Bireysel</option>
                    <option value="CORPORATE">Kurumsal</option>
                    <option value="FLEET">Filo</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Segment</label>
                  <select
                    value={newCustSegment}
                    onChange={e => setNewCustSegment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="REGULAR">Düzenli</option>
                    <option value="VIP">VIP (Özel)</option>
                    <option value="AT_RISK">Riskli</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Yeni Araç Tanımla</h2>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Plaka *</label>
                <input
                  type="text"
                  placeholder="34 ABC 123"
                  value={newVehPlate}
                  onChange={e => setNewVehPlate(e.target.value.toUpperCase())}
                  required
                  className="w-full uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Marka</label>
                  <input
                    type="text"
                    placeholder="BMW"
                    value={newVehMake}
                    onChange={e => setNewVehMake(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Model</label>
                  <input
                    type="text"
                    placeholder="320i"
                    value={newVehModel}
                    onChange={e => setNewVehModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Model Yılı</label>
                  <input
                    type="number"
                    value={newVehYear}
                    onChange={e => setNewVehYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Kilometre</label>
                  <input
                    type="number"
                    value={newVehKm}
                    onChange={e => setNewVehKm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Araç Sahibi</label>
                <select
                  value={newVehCustId}
                  onChange={e => setNewVehCustId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">Müşteri Seçiniz...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
