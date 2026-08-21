import React, { useState } from 'react';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { 
  Sliders, Palette, Shield, Globe, MessageSquare, 
  Sparkles, Check, Save, ToggleLeft, ToggleRight 
} from 'lucide-react';

export const TenantSettingsPage: React.FC = () => {
  const { currentTenant, updateTenantBranding, updateFeatureFlags } = useTenant();
  const { showSuccess } = useNotification();

  const [companyName, setCompanyName] = useState(currentTenant.branding.companyName);
  const [legalName, setLegalName] = useState(currentTenant.branding.legalName);
  const [taxOffice, setTaxOffice] = useState(currentTenant.branding.taxOffice);
  const [taxNo, setTaxNo] = useState(currentTenant.branding.taxNo);
  const [phone, setPhone] = useState(currentTenant.branding.phone);
  const [email, setEmail] = useState(currentTenant.branding.email);
  const [city, setCity] = useState(currentTenant.branding.city);
  const [primaryColor, setPrimaryColor] = useState(currentTenant.branding.primaryColor);
  const [smsSenderTitle, setSmsSenderTitle] = useState(currentTenant.branding.smsSenderTitle || '');

  const [flags, setFlags] = useState<Record<string, boolean>>({
    inventory: currentTenant.featureFlags?.inventory ?? true,
    fleet: currentTenant.featureFlags?.fleet ?? true,
    tire_hotel: currentTenant.featureFlags?.tire_hotel ?? true,
    einvoice: currentTenant.featureFlags?.einvoice ?? true,
    whatsapp: currentTenant.featureFlags?.whatsapp ?? true,
    advanced_reports: currentTenant.featureFlags?.advanced_reports ?? true,
    ai_copilot: currentTenant.featureFlags?.ai_copilot ?? true,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBranding({
      companyName,
      legalName,
      taxOffice,
      taxNo,
      phone,
      email,
      city,
      primaryColor,
      smsSenderTitle,
    });
    updateFeatureFlags(flags);
    showSuccess('Ayarlar Kaydedildi', 'Şirket ve marka ayarları başarıyla güncellendi.');
  };

  const toggleFlag = (key: string) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>Şirket & Marka Özelleştirme Ayarları</span>
        </h1>
        <p className="text-xs text-slate-400">
          Logo, tema renkleri, yasal şirket bilgileri ve dinamik modül (feature flag) yönetimi
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Brand & Theme Colors */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-400" />
            <span>Marka Renkleri & Görünüm</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold mb-1.5 block">Ana Tema Rengi (Hex):</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold mb-1.5 block">SMS / Bildirim Başlığı:</label>
              <input
                type="text"
                value={smsSenderTitle}
                onChange={e => setSmsSenderTitle(e.target.value.toUpperCase())}
                placeholder="USTAOTO"
                maxLength={11}
                className="w-full uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Company Legal Information */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          <h3 className="font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Şirket & Yasal Bilgiler</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold mb-1 block">Görünen Servis Adı:</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold mb-1 block">Yasal Resmi Ünvan:</label>
              <input
                type="text"
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-bold mb-1 block">Vergi Dairesi:</label>
              <input
                type="text"
                value={taxOffice}
                onChange={e => setTaxOffice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold mb-1 block">Vergi / TC No:</label>
              <input
                type="text"
                value={taxNo}
                onChange={e => setTaxNo(e.target.value)}
                className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold mb-1 block">Şehir / Lokasyon:</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Feature Flags */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          <h3 className="font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Aktif Modüller & Feature Flags</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'inventory', label: 'Gelişmiş Stok & Çoklu Depo ERP' },
              { key: 'fleet', label: 'Kurumsal Filo Yönetimi (B2B Portalı)' },
              { key: 'tire_hotel', label: 'Lastik Oteli & Sezonluk Çağrı' },
              { key: 'einvoice', label: 'GİB e-Fatura / e-Arşiv Entegrasyonu' },
              { key: 'whatsapp', label: 'WhatsApp Business Otomasyonları' },
              { key: 'advanced_reports', label: 'Gelişmiş BI Raporlama & Analitik' },
              { key: 'ai_copilot', label: 'Yapay Zeka Servis Danışmanı Copilot' },
            ].map(f => (
              <div
                key={f.key}
                onClick={() => toggleFlag(f.key)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all select-none"
              >
                <span className="font-bold text-slate-200">{f.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  flags[f.key] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {flags[f.key] ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
};
