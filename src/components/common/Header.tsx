import React, { useState } from 'react';
import { useTenant } from '../../core/TenantContext';
import { useAuth } from '../../core/AuthContext';
import { UserRole } from '../../types';
import { 
  Building2, UserCheck, Search, Bell, ExternalLink, 
  Plus, Wrench, Calendar, Sparkles, Shield, ChevronDown, Check 
} from 'lucide-react';

interface Props {
  onOpenCommandPalette: () => void;
  onOpenNewIntake: () => void;
  onOpenNewAppointment: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({
  onOpenCommandPalette,
  onOpenNewIntake,
  onOpenNewAppointment,
  activeTab,
  setActiveTab
}) => {
  const { currentTenant, tenants, switchTenant } = useTenant();
  const { currentUser, switchRole } = useAuth();
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: 'TENANT_OWNER', label: 'İşletme Sahibi / GM', desc: 'Tam yetki, ciro ve yönetim' },
    { id: 'SERVICE_ADVISOR', label: 'Servis Danışmanı', desc: 'Kabul, teklif, müşteri ilişkileri' },
    { id: 'TECHNICIAN', label: 'Teknisyen (Usta)', desc: 'İş listesi, süre, parça talebi' },
    { id: 'INVENTORY_MANAGER', label: 'Depo & Satın Alma', desc: 'Stok, parça, barkod, transfer' },
    { id: 'ACCOUNTANT', label: 'Muhasebe & Finans', desc: 'Kasa, cari, fatura, e-belge' },
    { id: 'TIRE_SPECIALIST', label: 'Lastik Oteli Sorumlusu', desc: 'Lastik kabul, raf, sezonluk çağrı' },
    { id: 'FLEET_MANAGER', label: 'Filo Yöneticisi (B2B)', desc: 'Filo portalı ve onaylar' },
    { id: 'SUPER_ADMIN', label: 'SaaS Super Admin', desc: 'Tüm tenantlar, paketler, audit' },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-4">
      {/* Left: Tenant Branding & Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left group"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: currentTenant.branding.primaryColor || '#0284c7' }}
            >
              {currentTenant.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-100 group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <span>{currentTenant.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-300 font-semibold">
                  {currentTenant.planId}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {currentTenant.slug}.autoservice.app
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {/* Tenant Switcher Dropdown */}
          {tenantDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                Tenant (Şirket) Değiştir
              </div>
              <div className="space-y-1">
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setTenantDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      t.id === currentTenant.id
                        ? 'bg-brand-500/10 border border-brand-500/30 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: t.branding.primaryColor }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.branding.city}</div>
                      </div>
                    </div>
                    {t.id === currentTenant.id && <Check className="w-4 h-4 text-brand-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Link to Public Website / Booking Portal */}
        <button
          onClick={() => setActiveTab('public_site')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          title="Müşterinin gördüğü web sitesi ve randevu portalını aç"
        >
          <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
          <span>Müşteri Sitesi</span>
        </button>
      </div>

      {/* Middle: Fast Search Omnibox Trigger (Ctrl+K) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Plaka, şasi no, müşteri, parça veya iş emri ara...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions & Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Quick Action: New Vehicle Intake */}
        <button
          onClick={onOpenNewIntake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Araç Kabul Aç</span>
        </button>

        {/* Quick Action: New Appointment */}
        <button
          onClick={onOpenNewAppointment}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Yeni Randevu</span>
        </button>

        {/* Role Switcher Dropdown (Simulator) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <span>{currentUser.role}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{currentUser.name}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Rol Simülatörü</span>
                <span className="text-[10px] text-brand-400 font-normal">RBAC Test</span>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {rolesList.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      switchRole(r.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      currentUser.role === r.id
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[11px] text-slate-400">{r.desc}</div>
                    </div>
                    {currentUser.role === r.id && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
