import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { InventoryItem } from '../../types';
import { 
  Package, Plus, Search, Filter, AlertTriangle, 
  ArrowDownRight, ArrowUpRight, Barcode, Check, X, Layers 
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  // New Item State
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('FILTRE');
  const [warehouseLocation, setWarehouseLocation] = useState('Raf A-01');
  const [costPrice, setCostPrice] = useState('200');
  const [salePrice, setSalePrice] = useState('400');
  const [stockOnHand, setStockOnHand] = useState('10');
  const [minStock, setMinStock] = useState('5');

  const inventory = store.getInventory(currentTenant.id);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchTerm)) ||
      (item.oemCode && item.oemCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      showError('Eksik Alan', 'SKU kodu ve parça adı zorunludur.');
      return;
    }

    const qty = parseInt(stockOnHand) || 0;
    const min = parseInt(minStock) || 5;

    const newItem: InventoryItem = {
      id: 'inv-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim() || undefined,
      name: name.trim(),
      brand: brand.trim() || 'Orijinal',
      category,
      unit: 'ADET',
      warehouseLocation,
      costPrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      vatRate: 20,
      stockOnHand: qty,
      stockReserved: 0,
      stockAvailable: qty,
      minStockLevel: min,
      maxStockLevel: 50,
      reorderPoint: min + 2,
      isActive: true,
    };

    store.saveInventoryItem(newItem);
    showSuccess('Parça Kaydedildi', `${newItem.name} (${newItem.sku}) stok kartı açıldı.`);
    setIsNewItemModalOpen(false);
    setSku('');
    setBarcode('');
    setName('');
    setBrand('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Yedek Parça & Stok Yönetimi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              {inventory.length} Kalem
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Çoklu depo, raf lokasyonları, barkod/QR kod ve kritik stok takibi
          </p>
        </div>

        <button
          onClick={() => setIsNewItemModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Stok Kartı Aç</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Parça adı, SKU, barkod veya OEM kodu ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">Tüm Kategoriler</option>
            <option value="FILTRE">Filtreler</option>
            <option value="YAG_SIVI">Yağ & Sıvılar</option>
            <option value="FREN">Fren Sistemi</option>
            <option value="SUSPANSIYON">Süspansiyon</option>
            <option value="MOTOR">Motor Parçaları</option>
            <option value="ELEKTRIK">Elektrik & Akü</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">SKU / Barkod</th>
                <th className="p-4">Parça Adı & Marka</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Raf Lokasyonu</th>
                <th className="p-4">Alış Maliyeti</th>
                <th className="p-4">Satış Fiyatı</th>
                <th className="p-4">Mevcut Stok</th>
                <th className="p-4">Kullanılabilir</th>
                <th className="p-4">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInventory.map(item => {
                const isLow = item.stockAvailable <= item.minStockLevel;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono">
                      <div className="font-bold text-brand-400">{item.sku}</div>
                      {item.barcode && <div className="text-[10px] text-slate-500 font-mono">{item.barcode}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.brand}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold font-mono">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-300">
                      {item.warehouseLocation}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {item.costPrice.toLocaleString()} ₺
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {item.salePrice.toLocaleString()} ₺
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {item.stockOnHand} {item.unit}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span className={isLow ? 'text-rose-400' : 'text-slate-100'}>
                        {item.stockAvailable} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Kritik Stok</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" />
                          <span>Yeterli</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Item Modal */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Yeni Stok Kartı Oluştur</h2>
              <button onClick={() => setIsNewItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">SKU / Parça Kodu *</label>
                  <input
                    type="text"
                    placeholder="FLT-OIL-01"
                    value={sku}
                    onChange={e => setSku(e.target.value.toUpperCase())}
                    required
                    className="w-full uppercase font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Barkod</label>
                  <input
                    type="text"
                    placeholder="8690..."
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Parça Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Bosch Ön Fren Balata Takımı"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Marka</label>
                  <input
                    type="text"
                    placeholder="Bosch / Mann"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="FILTRE">Filtre</option>
                    <option value="YAG_SIVI">Yağ & Sıvı</option>
                    <option value="FREN">Fren</option>
                    <option value="SUSPANSIYON">Süspansiyon</option>
                    <option value="MOTOR">Motor</option>
                    <option value="ELEKTRIK">Elektrik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Alış Maliyeti (₺)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={e => setCostPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Satış Fiyatı (₺)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Mevcut Stok</label>
                  <input
                    type="number"
                    value={stockOnHand}
                    onChange={e => setStockOnHand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Raf / Depo Lokasyonu</label>
                <input
                  type="text"
                  placeholder="Raf A-02/1"
                  value={warehouseLocation}
                  onChange={e => setWarehouseLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Stok Kartını Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
