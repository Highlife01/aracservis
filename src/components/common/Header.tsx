import React, { useState } from 'react';
import { useTenant } from '../../core/TenantContext';
import { useAuth } from '../../core/AuthContext';
import { useNotification } from '../../core/NotificationContext';
import { UserRole } from '../../types';
import { 
  Building2, UserCheck, Search, Bell, ExternalLink, 
  Plus, Wrench, Calendar, Sparkles, Shield, ChevronDown, 
  Check, LogIn, LogOut, User as UserIcon, Camera, QrCode 
} from 'lucide-react';

interface Props {
  onOpenCommandPalette: () => void;
  onOpenNewIntake: () => void;
  onOpenNewAppointment: () => void;
  onOpenQRScanner?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({
  onOpenCommandPalette,
  onOpenNewIntake,
  onOpenNewAppointment,
  onOpenQRScanner,
  activeTab,
  setActiveTab
}) => {
  const { currentTenant, tenants, switchTenant } = useTenant();
  const { currentUser, firebaseUser, loginWithGoogle, logout, switchRole, isSuperAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
      showSuccess('Giriş Başarılı', 'Google hesabı ile oturum açıldı.');
    } catch (err: any) {
      showError('Giriş Hatası', err.message || 'Google ile giriş yapılırken bir sorun oluştu.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showSuccess('Çıkış Yapıldı', 'Oturum kapatıldı.');
  };

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: 'SUPER_ADMIN', label: 'SaaS Super Admin (Cebrail Kara)', desc: 'Tüm tenantlar, paketler, audit' },
    { id: 'TENANT_OWNER', label: 'İşletme Sahibi / GM', desc: 'Tam yetki, ciro ve yönetim' },
    { id: 'SERVICE_ADVISOR', label: 'Servis Danışmanı', desc: 'Kabul, teklif, müşteri ilişkileri' },
    { id: 'TECHNICIAN', label: 'Teknisyen (Usta)', desc: 'İş listesi, süre, parça talebi' },
    { id: 'INVENTORY_MANAGER', label: 'Depo & Satın Alma', desc: 'Stok, parça, barkod, transfer' },
    { id: 'ACCOUNTANT', label: 'Muhasebe & Finans', desc: 'Kasa, cari, fatura, e-belge' },
    { id: 'TIRE_SPECIALIST', label: 'Lastik Oteli Sorumlusu', desc: 'Lastik kabul, raf, sezonluk çağrı' },
    { id: 'FLEET_MANAGER', label: 'Filo Yöneticisi (B2B)', desc: 'Filo portalı ve onaylar' },
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

        {/* Link to QR Tracker */}
        <button
          onClick={() => setActiveTab('qr_track')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20 transition-all"
          title="Karekodlu canlı araç takip ekranı"
        >
          <QrCode className="w-3.5 h-3.5 text-purple-400" />
          <span>QR Takip</span>
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

      {/* Right: Quick Actions, Google Sign-In & Role Switcher */}
      <div className="flex items-center gap-2">
        {/* QR Scanner Trigger */}
        {onOpenQRScanner && (
          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all active:scale-95 shadow-sm"
            title="Kamera ile QR Kod Oku"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Tara</span>
          </button>
        )}

        {/* Quick Action: New Vehicle Intake */}
        <button
          onClick={onOpenNewIntake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Araç Kabul Aç</span>
        </button>

        {/* Google Sign In / User Profile */}
        {firebaseUser ? (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            {firebaseUser.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={firebaseUser.displayName || 'User'}
                className="w-6 h-6 rounded-full border border-slate-700 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="text-[11px] font-bold text-slate-100 flex items-center gap-1">
                <span>{firebaseUser.displayName || currentUser.name}</span>
                {isSuperAdmin && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">
                {firebaseUser.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95"
            title="Google ile Giriş Yap"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.98 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{isLoggingIn ? 'Giriş...' : 'Google ile Giriş'}</span>
          </button>
        )}

        {/* Role Switcher Dropdown (Simulator) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
              {currentUser.role === 'SUPER_ADMIN' ? (
                <Shield className="w-4 h-4 text-purple-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-amber-400" />
              )}
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
                <span>Rol & Yetki Simülatörü</span>
                <span className="text-[10px] text-brand-400 font-normal">RBAC</span>
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
                        ? 'bg-purple-500/10 border border-purple-500/30 text-purple-200'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[11px] text-slate-400">{r.desc}</div>
                    </div>
                    {currentUser.role === r.id && <Check className="w-4 h-4 text-purple-400" />}
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
