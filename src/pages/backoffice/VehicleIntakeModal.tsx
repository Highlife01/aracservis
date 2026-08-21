import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { DamagePoint, WorkOrder, Vehicle, Customer } from '../../types';
import { VehicleDamageCanvas } from '../../components/vehicle/VehicleDamageCanvas';
import { DigitalSignaturePad } from '../../components/signature/DigitalSignaturePad';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { 
  X, Check, Car, User, Gauge, Fuel, CheckSquare, 
  Camera, FileText, AlertCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workOrder: WorkOrder) => void;
}

export const VehicleIntakeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [plate, setPlate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [modelYear, setModelYear] = useState('2022');
  const [mileage, setMileage] = useState('45000');
  const [fuelLevel, setFuelLevel] = useState<number>(75);
  const [serviceType, setServiceType] = useState<WorkOrder['serviceType']>('PERIYODIK_BAKIM');
  
  // Accessories & Inventory
  const [hasSpareTire, setHasSpareTire] = useState(true);
  const [hasJack, setHasJack] = useState(true);
  const [hasRegistration, setHasRegistration] = useState(true);
  const [keyCount, setKeyCount] = useState(2);
  const [valuableItems, setValuableItems] = useState('');

  // Damage & Complaints
  const [damagePoints, setDamagePoints] = useState<DamagePoint[]>([]);
  const [complaints, setComplaints] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  // Quick search existing vehicle/customer
  const handlePlateBlur = () => {
    if (!plate.trim()) return;
    const existingVehicle = store.getVehicleByPlate(plate, currentTenant.id);
    if (existingVehicle) {
      setMake(existingVehicle.make);
      setModel(existingVehicle.model);
      setModelYear(existingVehicle.year.toString());
      setMileage((existingVehicle.currentMileage + 200).toString());

      const cust = store.getCustomers(currentTenant.id).find(c => c.id === existingVehicle.customerId);
      if (cust) {
        setCustomerName(`${cust.firstName} ${cust.lastName}`);
        setCustomerPhone(cust.phone);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!plate.trim() || !customerName.trim() || !customerPhone.trim()) {
      showError('Eksik Bilgi', 'Plaka, müşteri adı ve telefon numarası zorunludur.');
      return;
    }

    try {
      // 1. Ensure Customer exists or create
      let customer = store.getCustomers(currentTenant.id).find(c => c.phone.includes(customerPhone.trim()));
      if (!customer) {
        const parts = customerName.trim().split(' ');
        const firstName = parts[0] || 'Müşteri';
        const lastName = parts.slice(1).join(' ') || '';
        customer = {
          id: 'cust-' + Math.random().toString(36).substr(2, 9),
          tenantId: currentTenant.id,
          type: 'INDIVIDUAL',
          firstName,
          lastName,
          phone: customerPhone.trim(),
          email: '',
          city: currentTenant.branding.city || 'İstanbul',
          address: '',
          segment: 'REGULAR',
          discountRate: 0,
          loyaltyPoints: 0,
          ltv: 0,
          totalSpent: 0,
          visitCount: 1,
          lastVisitDate: new Date().toISOString().split('T')[0],
          optInSms: true,
          optInWhatsApp: true,
          optInEmail: true,
          createdAt: new Date().toISOString(),
        };
        store.saveCustomer(customer);
      }

      // 2. Ensure Vehicle exists or create
      let vehicle = store.getVehicleByPlate(plate, currentTenant.id);
      if (!vehicle) {
        vehicle = {
          id: 'veh-' + Math.random().toString(36).substr(2, 9),
          tenantId: currentTenant.id,
          customerId: customer.id,
          plate: plate.trim().toUpperCase(),
          vin: 'TR' + Math.random().toString(36).substring(2, 10).toUpperCase() + '0192',
          make: make.trim() || 'Genel Marka',
          model: model.trim() || 'Genel Model',
          year: parseInt(modelYear) || 2022,
          fuelType: 'BENZIN',
          transmission: 'OTOMATIK',
          color: 'Beyaz',
          currentMileage: parseInt(mileage) || 50000,
          createdAt: new Date().toISOString(),
        };
        store.saveVehicle(vehicle);
      } else {
        vehicle.currentMileage = parseInt(mileage) || vehicle.currentMileage;
        store.saveVehicle(vehicle);
      }

      // 3. Create Work Order with Intake Data
      const newWorkOrderNo = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newWorkOrderId = 'wo-' + Math.random().toString(36).substr(2, 9);

      const newWorkOrder: WorkOrder = {
        id: newWorkOrderId,
        workOrderNo: newWorkOrderNo,
        tenantId: currentTenant.id,
        branchId: 'branch-1',
        customerId: customer.id,
        vehicleId: vehicle.id,
        advisorId: 'user-current',
        advisorName: 'Murat Danışman',
        status: 'CHECKED_IN',
        priority: 'NORMAL',
        serviceType,
        items: [],
        totalAmount: 0,
        paidAmount: 0,
        paymentStatus: 'UNPAID',
        intake: {
          id: 'intk-' + Math.random().toString(36).substr(2, 9),
          workOrderId: newWorkOrderId,
          mileageIn: parseInt(mileage) || 50000,
          fuelLevelPercent: fuelLevel,
          hasSpareTire,
          hasJack,
          hasRegistrationDoc: hasRegistration,
          keyCount,
          valuableItems,
          customerComplaints: complaints || 'Periyodik kontrol ve servis talebi.',
          damagePoints,
          photos: [],
          customerSignatureUrl: signatureUrl,
          completedAt: new Date().toISOString(),
          advisorName: 'Murat Danışman',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.saveWorkOrder(newWorkOrder);
      showSuccess('Araç Kabul Edildi', `${vehicle.plate} plakalı araç kabul edildi ve ${newWorkOrderNo} no'lu iş emri açıldı.`);
      onSuccess(newWorkOrder);
      onClose();
    } catch (e: any) {
      showError('Kayıt Hatası', e.message || 'Araç kabulü sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Dijital Araç Kabul & İntake Formu</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
                  Adım {step} / 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tablet/Mobil uyumlu araç giriş, hasar tespiti ve dijital imza sihirbazı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              step === 1
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Müşteri & Araç Bilgisi</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              step === 2
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Hasar & Envanter Tespiti</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              step === 3
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Şikayetler & Dijital İmza</span>
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {/* STEP 1: Araç & Müşteri */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Araç Plakası <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="34 ABC 123"
                      value={plate}
                      onChange={e => setPlate(e.target.value.toUpperCase())}
                      onBlur={handlePlateBlur}
                      className="w-full uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:border-brand-500 focus:outline-none tracking-wider"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Kayıtlı plakaları otomatik tanır ve geçmişini doldurur.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Hizmet / Servis Türü
                  </label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    <option value="PERIYODIK_BAKIM">Periyodik Bakım (Yağ, Filtreler)</option>
                    <option value="MEKANIK_ONARIM">Mekanik Onarım & Motor</option>
                    <option value="ELEKTRIK_ELEKTRONIK">Oto Elektrik & Diagnostik</option>
                    <option value="LASTIK_ROT">Lastik Değişimi & Rot-Balans</option>
                    <option value="KAPORTA_BOYA">Kaporta & Boya Onarımı</option>
                    <option value="EKSPERTIZE">Genel Ekspertiz & Muayene</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Müşteri Adı Soyadı / Firma <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Can Kaya"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Müşteri Telefon No (WhatsApp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+90 532 000 00 00"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">Marka</label>
                  <input
                    type="text"
                    placeholder="Örn: BMW / VW"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">Model</label>
                  <input
                    type="text"
                    placeholder="Örn: 320i / Passat"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">Model Yılı</label>
                  <input
                    type="number"
                    value={modelYear}
                    onChange={e => setModelYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Kilometre ve Yakıt Seviyesi */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-brand-400" />
                      <span>Giriş Kilometresi (km)</span>
                    </label>
                    <input
                      type="number"
                      value={mileage}
                      onChange={e => setMileage(e.target.value)}
                      className="w-full font-mono font-bold text-sm bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Fuel className="w-4 h-4 text-amber-400" />
                        <span>Yakıt Deposu Seviyesi: %{fuelLevel}</span>
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {fuelLevel === 0 && 'Boş (Rezerv)'}
                        {fuelLevel === 25 && '1/4 Depo'}
                        {fuelLevel === 50 && 'Yarım Depo'}
                        {fuelLevel === 75 && '3/4 Depo'}
                        {fuelLevel === 100 && 'Tam Dolu'}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="25"
                      value={fuelLevel}
                      onChange={e => setFuelLevel(parseInt(e.target.value))}
                      className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Hasar Tespiti & Aksesuar Envanteri */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-brand-400" />
                  <span>2D İnteraktif Hasar Çizim Haritası</span>
                </h3>
                <VehicleDamageCanvas
                  damagePoints={damagePoints}
                  onChange={setDamagePoints}
                />
              </div>

              {/* Aksesuarlar / Teslim Alınanlar */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200">Teslim Alınan Araç Ekipmanları & Eşyalar</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={hasSpareTire}
                      onChange={e => setHasSpareTire(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span className="text-slate-300">Stepne (Yedek Lastik)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={hasJack}
                      onChange={e => setHasJack(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span className="text-slate-300">Kriko & Bijon Anahtarı</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={hasRegistration}
                      onChange={e => setHasRegistration(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span className="text-slate-300">Ruhsat Belgesi</span>
                  </label>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Anahtar:</span>
                    <select
                      value={keyCount}
                      onChange={e => setKeyCount(parseInt(e.target.value))}
                      className="bg-slate-950 text-slate-100 rounded px-2 py-0.5 border border-slate-700"
                    >
                      <option value={1}>1 Adet</option>
                      <option value={2}>2 Adet</option>
                      <option value={3}>3 Adet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Araç İçinde Bulunan Değerli Eşya Notu (Varsa):
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Güneş gözlüğü, bagajda takım çantası..."
                    value={valuableItems}
                    onChange={e => setValuableItems(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Müşteri Şikayeti & Dijital İmza */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Müşteri Şikayetleri ve Talep Edilen İşlemler <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Müşterinin beyan ettiği ses, arıza veya bakım detaylarını buraya yazınız..."
                  value={complaints}
                  onChange={e => setComplaints(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-xs focus:border-brand-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Digital Signature Pad */}
              <div>
                <DigitalSignaturePad
                  title="Müşteri Dijital Kabul İmzası"
                  onSave={setSignatureUrl}
                  initialSignature={signatureUrl}
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Müşteri bu formu imzalayarak araç teslim tutanağındaki hasar ve yakıt durumunu onaylar.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
            >
              İptal
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!plate.trim() || !customerName.trim() || !customerPhone.trim())) {
                    showError('Eksik Alanlar', 'Lütfen plaka, müşteri adı ve telefonunu giriniz.');
                    return;
                  }
                  setStep((step + 1) as any);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/20 transition-all"
              >
                <span>Devam Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Kabulü Tamamla & İş Emri Aç</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
