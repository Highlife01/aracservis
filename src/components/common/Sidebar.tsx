import React from 'react';
import { useAuth } from '../../core/AuthContext';
import { useTenant } from '../../core/TenantContext';
import { 
  LayoutDashboard, Calendar, ClipboardList, Search, Wrench, 
  UserCheck, Users, Car, Building, Package, ShoppingCart, 
  Layers, Wallet, FileSpreadsheet, MessageSquare, BarChart3, 
  FileUp, Sliders, Zap, Shield, Globe, Award, Sparkles 
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  badgeCount?: number;
  badgeAlert?: number;
  flag?: string;
  superAdminOnly?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isSuperAdmin } = useAuth();
  const { currentTenant } = useTenant();

  const menuSections: MenuSection[] = [
    {
      title: 'OPERASYON & ATÖLYE',
      items: [
        { id: 'dashboard', label: 'Komuta Merkezi', icon: LayoutDashboard, badge: 'Canlı' },
        { id: 'appointments', label: 'Randevular & Takvim', icon: Calendar },
        { id: 'work_orders', label: 'İş Emirleri & Kabul', icon: ClipboardList, badgeCount: 3 },
        { id: 'inspection', label: 'Dijital Ekspertiz (MPI)', icon: Search },
        { id: 'workshop_bays', label: 'Atölye & Lift Matrisi', icon: Wrench },
        { id: 'technician_center', label: 'Teknisyen Merkezi', icon: UserCheck, flag: 'mobile_pwa' },
      ]
    },
    {
      title: 'CRM & ARAÇLAR',
      items: [
        { id: 'customers', label: 'Müşteri Yönetimi (CRM)', icon: Users },
        { id: 'vehicles', label: '360° Araç Dosyaları', icon: Car },
        { id: 'fleet', label: 'Kurumsal Filo Portalı', icon: Building, flag: 'fleet' },
      ]
    },
    {
      title: 'STOK & LASTİK',
      items: [
        { id: 'inventory', label: 'Stok & Yedek Parça', icon: Package, badgeAlert: 1, flag: 'inventory' },
        { id: 'purchasing', label: 'Satın Alma & Tedarik', icon: ShoppingCart },
        { id: 'tire_hotel', label: 'Lastik Oteli & Depo', icon: Layers, flag: 'tire_hotel' },
      ]
    },
    {
      title: 'FİNANS & e-BELGE',
      items: [
        { id: 'finance', label: 'Kasa, Cari & Tahsilat', icon: Wallet },
        { id: 'einvoice', label: 'e-Fatura / e-Arşiv (GİB)', icon: FileSpreadsheet, flag: 'einvoice' },
      ]
    },
    {
      title: 'PAZARLAMA & ANALİTİK',
      items: [
        { id: 'marketing', label: 'WhatsApp & Kampanyalar', icon: MessageSquare, flag: 'whatsapp' },
        { id: 'reports', label: 'Raporlar & Analitik BI', icon: BarChart3, flag: 'advanced_reports' },
        { id: 'data_migration', label: 'Veri Aktarım & Excel', icon: FileUp },
        { id: 'automations', label: 'Otomasyon Motoru', icon: Zap },
      ]
    },
    {
      title: 'SİSTEM & YÖNETİM',
      items: [
        { id: 'landing', label: 'Platform Tanıtım Sitesi', icon: Globe },
        { id: 'public_site', label: 'Müşteri Randevu Sitesi', icon: Sparkles },
        { id: 'settings', label: 'Şirket & Şube Ayarları', icon: Sliders },
        { id: 'super_admin', label: 'Platform Super Admin', icon: Shield, superAdminOnly: true },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {menuSections.map((section, sIdx) => {
          // Filter items based on super admin or flags
          const visibleItems = section.items.filter(item => {
            if (item.superAdminOnly && !isSuperAdmin && currentUser.role !== 'TENANT_OWNER') {
              return false;
            }
            if (item.flag && currentTenant.featureFlags && currentTenant.featureFlags[item.flag] === false) {
              return false;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 tracking-wider px-3 py-1 uppercase font-mono">
                {section.title}
              </div>

              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {/* Badges */}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-brand-700' : 'bg-brand-500/20 text-brand-300'
                      }`}>
                        {item.badgeCount}
                      </span>
                    )}

                    {item.badgeAlert !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.badgeAlert} kritik
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Tenant Info Card */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="font-bold text-slate-200 text-[11px] truncate max-w-[120px]">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">v2.4 Enterprise</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="text-slate-400 hover:text-white p-1"
            title="Ayarlar"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
