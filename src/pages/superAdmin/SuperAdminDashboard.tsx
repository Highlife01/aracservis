import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { Tenant, TenantPlan } from '../../types';
import { 
  Shield, Building2, TrendingUp, Users, Plus, 
  Activity, Check, AlertTriangle, ExternalLink, X, ShieldAlert 
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { tenants, switchTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantCity, setNewTenantCity] = useState('İstanbul');
  const [newTenantPlan, setNewTenantPlan] = useState<TenantPlan['id']>('PROFESSIONAL');
  const [newTenantColor, setNewTenantColor] = useState('#0284c7');

  const allAuditLogs = store.getAuditLogs();

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantSlug.trim()) {
      showError('Eksik Alan', 'Şirket adı ve alt alan adı (slug) zorunludur.');
      return;
    }

    const newTenant: Tenant = {
      id: 'tenant-' + Math.random().toString(36).substr(2, 8),
      slug: newTenantSlug.trim().toLowerCase(),
      name: newTenantName.trim(),
      status: 'ACTIVE',
      planId: newTenantPlan,
      branding: {
        companyName: newTenantName.trim(),
        legalName: newTenantName.trim() + ' Ltd. Şti.',
        taxOffice: 'Merkez V.D.',
        taxNo: '1029384756',
        phone: '+90 850 000 00 00',
        email: `bilgi@${newTenantSlug}.com`,
        address: 'Sanayi Bölgesi No:1',
        city: newTenantCity,
        currency: '₺',
        vatRate: 20,
        primaryColor: newTenantColor,
        secondaryColor: '#0f172a',
        accentColor: '#f59e0b',
        smsSenderTitle: newTenantSlug.toUpperCase().slice(0, 10),
      },
      featureFlags: {
        inventory: true,
        fleet: newTenantPlan === 'ENTERPRISE',
        tire_hotel: true,
        einvoice: newTenantPlan === 'ENTERPRISE' || newTenantPlan === 'PROFESSIONAL',
        whatsapp: true,
        advanced_reports: true,
        ai_copilot: newTenantPlan === 'ENTERPRISE',
      },
      createdAt: new Date().toISOString(),
    };

    store.saveTenant(newTenant);
    showSuccess('Yeni Tenant Oluşturuldu', `${newTenant.name} (${newTenant.slug}) SaaS platformuna eklendi.`);
    setIsNewTenantModalOpen(false);
    setNewTenantName('');
    setNewTenantSlug('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">SaaS Platform Sahibi Yönetim Paneli</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tüm oto servis tenant'larının yaşam döngüsü, lisanslar, MRR ve audit denetim izleri
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewTenantModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tenant Aç</span>
        </button>
      </div>

      {/* SaaS Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Toplam Aktif Tenant</div>
          <div className="text-2xl font-black text-purple-300 font-mono">{tenants.length} Şirket</div>
          <div className="text-[11px] text-emerald-400 font-bold">0 askıya alınmış</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Platform MRR (Aylık Gelir)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">145.000 ₺</div>
          <div className="text-[11px] text-emerald-500 font-bold">▲ %14 bu ay</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Platform Geneli İş Emri Hacmi</div>
          <div className="text-2xl font-black text-slate-100 font-mono">1.840 Adet</div>
          <div className="text-[11px] text-slate-400">Bu ay üretilen toplam</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Sistem Sağlığı & API Uptime</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">%99.98</div>
          <div className="text-[11px] text-emerald-500 font-bold">Tüm servisler operasyonel</div>
        </div>
      </div>

      {/* Tenants List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-200 uppercase font-mono">
            Kayıtlı Tenant (Oto Servis İşletmeleri) Listesi
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Tenant Adı</th>
                <th className="p-4">Alt Alan Adı (Slug)</th>
                <th className="p-4">Paket (Plan)</th>
                <th className="p-4">Lokasyon</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Oluşturulma</th>
                <th className="p-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[11px]"
                        style={{ backgroundColor: t.branding.primaryColor }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-100">{t.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-brand-400">{t.slug}.autoservice.app</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-purple-300 font-mono">
                      {t.planId}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{t.branding.city}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono">
                    {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        switchTenant(t.id);
                        showSuccess('Tenant Değiştirildi', `${t.name} olarak oturum açıldı (Support Impersonation).`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-semibold transition-all"
                    >
                      Oturum Aç (İncele)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Audit Logs */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-xs text-slate-200 uppercase font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400" />
          <span>Platform Geneli Denetim & Audit Logları (Son Olaylar)</span>
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allAuditLogs.slice(0, 10).map((log, idx) => (
            <div
              key={log.id || idx}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="text-brand-400 font-bold">[{log.action}]</span>
                <span className="text-slate-300">{log.entityType} ({log.entityId})</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {new Date(log.createdAt).toLocaleTimeString('tr-TR')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Tenant Modal */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Yeni Tenant (Oto Servis) Açılışı</h2>
              <button onClick={() => setIsNewTenantModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">İşletme / Servis Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Anadolu Oto Servis"
                  value={newTenantName}
                  onChange={e => {
                    setNewTenantName(e.target.value);
                    if (!newTenantSlug) {
                      setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Alt Alan Adı (Slug) *</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                  <input
                    type="text"
                    placeholder="anadolu-oto"
                    value={newTenantSlug}
                    onChange={e => setNewTenantSlug(e.target.value.toLowerCase())}
                    required
                    className="w-full bg-transparent text-slate-100 font-mono font-bold focus:outline-none"
                  />
                  <span className="text-slate-500 font-mono">.autoservice.app</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Abonelik Paketi</label>
                  <select
                    value={newTenantPlan}
                    onChange={e => setNewTenantPlan(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="STARTER">Başlangıç (Starter)</option>
                    <option value="PROFESSIONAL">Profesyonel (Pro)</option>
                    <option value="ENTERPRISE">Kurumsal (Enterprise)</option>
                    <option value="FRANCHISE">Franchise Ağı</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Şehir</label>
                  <input
                    type="text"
                    value={newTenantCity}
                    onChange={e => setNewTenantCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Marka Ana Rengi</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTenantColor}
                    onChange={e => setNewTenantColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono text-slate-300">{newTenantColor}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Tenant'ı Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
