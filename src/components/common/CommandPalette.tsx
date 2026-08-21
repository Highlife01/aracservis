import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { Search, Car, Users, ClipboardList, Package, ArrowRight, X } from 'lucide-react';
import { PlateBadge } from '../vehicle/PlateBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, itemData?: any) => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const { currentTenant } = useTenant();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const queryClean = query.trim().toLowerCase();
  const customers = store.getCustomers(currentTenant.id);
  const vehicles = store.getVehicles(currentTenant.id);
  const workOrders = store.getWorkOrders(currentTenant.id);
  const inventory = store.getInventory(currentTenant.id);

  const matchedVehicles = queryClean
    ? vehicles.filter(v => v.plate.toLowerCase().includes(queryClean) || v.vin.toLowerCase().includes(queryClean) || `${v.make} ${v.model}`.toLowerCase().includes(queryClean))
    : [];

  const matchedCustomers = queryClean
    ? customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(queryClean) || c.phone.includes(queryClean) || (c.companyName && c.companyName.toLowerCase().includes(queryClean)))
    : [];

  const matchedWorkOrders = queryClean
    ? workOrders.filter(w => w.workOrderNo.toLowerCase().includes(queryClean))
    : [];

  const matchedInventory = queryClean
    ? inventory.filter(i => i.name.toLowerCase().includes(queryClean) || i.sku.toLowerCase().includes(queryClean) || (i.oemCode && i.oemCode.toLowerCase().includes(queryClean)))
    : [];

  const hasResults = matchedVehicles.length > 0 || matchedCustomers.length > 0 || matchedWorkOrders.length > 0 || matchedInventory.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-brand-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Plaka (örn: 34 VIP 77), müşteri adı, telefon, iş emri veya parça kodu ara..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-medium"
          />
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {!queryClean && (
            <div className="p-4 text-center text-slate-500">
              <div className="font-semibold text-slate-400 mb-1">Hızlı Komuta ve Arama Merkezi</div>
              <div>Herhangi bir plaka, müşteri telefonu veya parça OEM kodunu yazmaya başlayın.</div>
            </div>
          )}

          {queryClean && !hasResults && (
            <div className="p-8 text-center text-slate-500">
              "{query}" ile eşleşen kayıt bulunamadı.
            </div>
          )}

          {/* Matched Vehicles */}
          {matchedVehicles.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Car className="w-3 h-3 text-sky-400" />
                <span>Araçlar ({matchedVehicles.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedVehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onNavigate('vehicles', v);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <PlateBadge plate={v.plate} size="sm" />
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-brand-400 transition-colors">
                          {v.make} {v.model} ({v.year})
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">VIN: {v.vin} • {v.currentMileage.toLocaleString()} km</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Users className="w-3 h-3 text-emerald-400" />
                <span>Müşteriler ({matchedCustomers.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('customers', c);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {c.firstName} {c.lastName} {c.companyName && <span className="text-slate-400 font-normal">({c.companyName})</span>}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.phone} • {c.city} • LTV: {c.ltv.toLocaleString()} ₺</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-semibold">
                      {c.segment}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Work Orders */}
          {matchedWorkOrders.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <ClipboardList className="w-3 h-3 text-amber-400" />
                <span>İş Emirleri ({matchedWorkOrders.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedWorkOrders.map(w => (
                  <button
                    key={w.id}
                    onClick={() => {
                      onNavigate('work_orders', w);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {w.workOrderNo} - {w.serviceType}
                      </div>
                      <div className="text-[11px] text-slate-400">Danışman: {w.advisorName} • Tutar: {w.totalAmount.toLocaleString()} ₺</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                      {w.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Inventory */}
          {matchedInventory.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Package className="w-3 h-3 text-purple-400" />
                <span>Yedek Parça & Stok ({matchedInventory.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedInventory.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onNavigate('inventory', i);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                        {i.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">SKU: {i.sku} • {i.warehouseLocation} • Stok: {i.stockAvailable} {i.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{i.salePrice.toLocaleString()} ₺</div>
                      <div className="text-[10px] text-slate-500">{i.brand}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Kapatmak için <b>ESC</b> tuşuna basabilirsiniz</span>
          <span className="font-mono">{currentTenant.name}</span>
        </div>
      </div>
    </div>
  );
};
