import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { WorkOrder, WorkOrderStatus, EstimateItem, MPIItem, MPICondition } from '../../types';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import { WorkOrderStatusBadge } from '../../components/workOrder/WorkOrderStatusBadge';
import { VehicleDamageCanvas } from '../../components/vehicle/VehicleDamageCanvas';
import { QRKeyTagModal } from '../../components/qr/QRKeyTagModal';
import { 
  ArrowLeft, Check, Send, Printer, Wrench, FileText, 
  Search, ShieldCheck, DollarSign, Plus, Trash2, ExternalLink, 
  CheckCircle2, XCircle, AlertTriangle, MessageSquare, Clock, UserCheck, QrCode, Tag 
} from 'lucide-react';

interface Props {
  workOrder: WorkOrder;
  onBack: () => void;
  onNavigate: (tab: string, itemData?: any) => void;
}

export const WorkOrderDetailPage: React.FC<Props> = ({ workOrder: initialWo, onBack, onNavigate }) => {
  const { currentTenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [wo, setWo] = useState<WorkOrder>(initialWo);
  const [activeSubTab, setActiveSubTab] = useState<'INTAKE' | 'INSPECTION' | 'ESTIMATE' | 'WORKSHOP' | 'PAYMENT'>('ESTIMATE');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Estimate Editor State
  const [newItemType, setNewItemType] = useState<EstimateItem['type']>('PART');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('500');
  const [newItemUnit, setNewItemUnit] = useState('ADET');

  // MPI Inspection Form State
  const [newMpiCategory, setNewMpiCategory] = useState<MPIItem['category']>('FREN');
  const [newMpiTitle, setNewMpiTitle] = useState('');
  const [newMpiCondition, setNewMpiCondition] = useState<MPICondition>('ATTENTION');
  const [newMpiDesc, setNewMpiDesc] = useState('');

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState(wo.totalAmount - (wo.paidAmount || 0));
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('CREDIT_CARD');

  const vehicle = store.getVehicles(currentTenant.id).find(v => v.id === wo.vehicleId);
  const customer = store.getCustomers(currentTenant.id).find(c => c.id === wo.customerId);
  const bays = store.getBays(currentTenant.id);

  // Status transitions
  const allStatuses: WorkOrderStatus[] = [
    'CHECKED_IN',
    'INSPECTION',
    'ESTIMATE_PENDING',
    'AWAITING_APPROVAL',
    'APPROVED',
    'IN_PROGRESS',
    'QUALITY_CHECK',
    'READY_FOR_PICKUP',
    'DELIVERED',
    'CLOSED'
  ];

  const handleStatusChange = (newStatus: WorkOrderStatus) => {
    const updated = { ...wo, status: newStatus, updatedAt: new Date().toISOString() };
    setWo(updated);
    store.saveWorkOrder(updated);
    showSuccess('Durum Güncellendi', `İş emri durumu '${newStatus}' olarak kaydedildi.`);
  };

  // Add Item to Estimate
  const handleAddEstimateItem = () => {
    if (!newItemName.trim()) return;

    const qty = parseFloat(newItemQty) || 1;
    const price = parseFloat(newItemPrice) || 0;
    const total = qty * price * 1.2; // 20% VAT

    const newItem: EstimateItem = {
      id: 'ei-' + Math.random().toString(36).substr(2, 9),
      type: newItemType,
      name: newItemName.trim(),
      quantity: qty,
      unit: newItemUnit,
      unitCost: price * 0.6,
      unitPrice: price,
      discountRate: 0,
      vatRate: 20,
      totalPrice: total,
      status: 'APPROVED',
    };

    const currentItems = wo.estimate?.items || [];
    const updatedItems = [...currentItems, newItem];

    const grandTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const updatedWo: WorkOrder = {
      ...wo,
      estimate: {
        id: wo.estimate?.id || 'est-' + Math.random().toString(36).substr(2, 9),
        workOrderId: wo.id,
        revisionNumber: (wo.estimate?.revisionNumber || 0) + 1,
        items: updatedItems,
        subtotalParts: updatedItems.filter(i => i.type === 'PART').reduce((s, i) => s + (i.unitPrice * i.quantity), 0),
        subtotalLabor: updatedItems.filter(i => i.type === 'LABOR').reduce((s, i) => s + (i.unitPrice * i.quantity), 0),
        subtotalSupplies: 0,
        totalDiscount: 0,
        totalVat: grandTotal * (20 / 120),
        grandTotal,
        approvedTotal: grandTotal,
        customerApprovalToken: wo.estimate?.customerApprovalToken || 'appr-' + Math.random().toString(36).substr(2, 9),
        status: 'FULLY_APPROVED',
        createdAt: new Date().toISOString(),
      },
      totalAmount: grandTotal,
    };

    setWo(updatedWo);
    store.saveWorkOrder(updatedWo);
    setNewItemName('');
    showSuccess('Kalem Eklendi', `${newItem.name} teklif ve iş emrine eklendi.`);
  };

  // Add MPI Finding
  const handleAddMpiFinding = () => {
    if (!newMpiTitle.trim()) return;

    const newItem: MPIItem = {
      id: 'mpi-' + Math.random().toString(36).substr(2, 9),
      category: newMpiCategory,
      title: newMpiTitle.trim(),
      condition: newMpiCondition,
      description: newMpiDesc.trim() || undefined,
    };

    const currentInspection = wo.inspection || {
      id: 'insp-' + Math.random().toString(36).substr(2, 9),
      workOrderId: wo.id,
      technicianId: 'user-current',
      technicianName: 'Kemal Teknisyen',
      completedAt: new Date().toISOString(),
      items: [],
    };

    const updatedWo: WorkOrder = {
      ...wo,
      inspection: {
        ...currentInspection,
        items: [...currentInspection.items, newItem],
      }
    };

    setWo(updatedWo);
    store.saveWorkOrder(updatedWo);
    setNewMpiTitle('');
    setNewMpiDesc('');
    showSuccess('Ekspertiz Maddesi Eklendi', `${newItem.title} kontrol listesine kaydedildi.`);
  };

  // Payment Recording
  const handleRecordPayment = () => {
    if (paymentAmount <= 0) return;

    const newPayment = {
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentTenant.id,
      branchId: 'branch-1',
      workOrderId: wo.id,
      customerId: wo.customerId,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Müşteri',
      amount: paymentAmount,
      method: paymentMethod,
      status: 'COMPLETED' as const,
      receiptNo: `MK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      receivedBy: 'Selin Muhasebe',
      createdAt: new Date().toISOString(),
      notes: `${wo.workOrderNo} numaralı iş emri tahsilatı`,
    };

    store.savePayment(newPayment);
    const updatedWo = store.getWorkOrderById(wo.id);
    if (updatedWo) setWo(updatedWo);
    showSuccess('Tahsilat Kaydedildi', `${paymentAmount.toLocaleString()} ₺ tahsilat makbuzu oluşturuldu.`);
  };

  // WhatsApp Approval Link Generator
  const generateWhatsAppApprovalLink = () => {
    if (!customer?.phone) {
      showError('Telefon Yok', 'Müşterinin kayıtlı telefon numarası bulunmuyor.');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const token = wo.estimate?.customerApprovalToken || 'token-demo';
    const link = `${window.location.origin}/#approval-${token}`;
    const text = encodeURIComponent(
      `Sayın ${customer.firstName} ${customer.lastName}, ${vehicle?.plate} plakalı aracınız için hazırlanan servis teklifini incelemek ve kalem kalem onaylamak için lütfen tıklayınız: ${link}\n\n${currentTenant.name}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-white font-mono">{wo.workOrderNo}</h1>
              <WorkOrderStatusBadge status={wo.status} />
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Danışman: <b>{wo.advisorName}</b></span>
              <span>•</span>
              <span>Açılış: {new Date(wo.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-xs"
            title="Karekodlu Anahtarlık ve Torpido Etiketi Yazdır"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Anahtar Etiketi</span>
          </button>

          <button
            onClick={generateWhatsAppApprovalLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Müşteriye WhatsApp teklif onay linki oluştur"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Teklif Linki</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* Vehicle & Customer Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicle Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Araç Bilgisi</span>
            {vehicle && <PlateBadge plate={vehicle.plate} size="md" />}
            <div className="font-bold text-xs text-slate-200 mt-1">
              {vehicle?.make} {vehicle?.model} ({vehicle?.year})
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Km: {wo.intake?.mileageIn.toLocaleString() || vehicle?.currentMileage.toLocaleString()} km
            </div>
          </div>
        </div>

        {/* Customer Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Müşteri Profili</span>
            <div className="font-bold text-sm text-slate-100">
              {customer?.firstName} {customer?.lastName}
            </div>
            <div className="text-xs text-brand-400 font-mono">{customer?.phone}</div>
            <div className="text-[11px] text-slate-400">{customer?.city} • Segment: {customer?.segment}</div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Mali Durum</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {wo.totalAmount.toLocaleString()} ₺
            </div>
            <div className="text-xs text-slate-300">
              Ödenen: <span className="text-emerald-400 font-bold">{wo.paidAmount.toLocaleString()} ₺</span>
            </div>
            <div className="text-[11px] text-amber-400 font-semibold">
              Kalan Bakiye: {(wo.totalAmount - wo.paidAmount).toLocaleString()} ₺
            </div>
          </div>
        </div>
      </div>

      {/* 15-State Progression Stepper */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase font-mono mb-2">
          İş Emri Durum İlerlemesi (Tıklayarak durumu güncelleyebilirsiniz):
        </div>
        <div className="flex items-center gap-1.5 min-w-[700px]">
          {allStatuses.map((st, idx) => {
            const isCurrent = wo.status === st;
            return (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-brand-600 text-white shadow-lg font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{idx + 1}. {st}</span>
                {isCurrent && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('ESTIMATE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'ESTIMATE'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Teklif & Parça-İşçilik ({wo.estimate?.items.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INSPECTION')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'INSPECTION'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Fotoğraflı Ekspertiz (MPI) ({wo.inspection?.items.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INTAKE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'INTAKE'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Kabul Tutanağı & Hasar Haritası</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WORKSHOP')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'WORKSHOP'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Atölye & Teknisyen Atama</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PAYMENT')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'PAYMENT'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tahsilat & Kasa</span>
        </button>
      </div>

      {/* TAB CONTENT: ESTIMATE & ITEMS */}
      {activeSubTab === 'ESTIMATE' && (
        <div className="space-y-6">
          {/* Add Item Form */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
              Yeni Parça / İşçilik Kalemi Ekle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Tür:</label>
                <select
                  value={newItemType}
                  onChange={e => setNewItemType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="PART">Yedek Parça</option>
                  <option value="LABOR">İşçilik</option>
                  <option value="SUPPLY">Sarf Malzeme</option>
                  <option value="EXTERNAL_SERVICE">Dış Servis / Torna</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 mb-1 block">Kalem / Parça Adı:</label>
                <input
                  type="text"
                  placeholder="Örn: Bosch Ön Fren Diski / Yağ Değişimi"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Miktar & Birim:</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={newItemQty}
                    onChange={e => setNewItemQty(e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100 text-center font-mono"
                  />
                  <select
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
                  >
                    <option value="ADET">Adet</option>
                    <option value="LT">Litre</option>
                    <option value="TAKIM">Takım</option>
                    <option value="SAAT">Saat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Birim Fiyat (₺):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddEstimateItem}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shrink-0 shadow-lg shadow-brand-600/30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Estimate Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Tür</th>
                  <th className="p-4">Açıklama</th>
                  <th className="p-4">Miktar</th>
                  <th className="p-4">Birim Fiyat</th>
                  <th className="p-4">KDV (%20)</th>
                  <th className="p-4">Toplam Tutar</th>
                  <th className="p-4">Onay Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(wo.estimate?.items || []).map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-semibold text-brand-400">
                      {item.type === 'PART' ? 'Yedek Parça' : item.type === 'LABOR' ? 'İşçilik' : 'Sarf Malzeme'}
                    </td>
                    <td className="p-4 font-bold text-slate-100">{item.name}</td>
                    <td className="p-4 font-mono">{item.quantity} {item.unit}</td>
                    <td className="p-4 font-mono">{item.unitPrice.toLocaleString()} ₺</td>
                    <td className="p-4 font-mono">%20</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {item.totalPrice.toLocaleString()} ₺
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.status === 'APPROVED' ? 'Onaylandı' : item.status === 'REJECTED' ? 'Reddedildi' : 'Onay Bekliyor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
              <div className="space-y-1 text-right text-xs">
                <div className="text-slate-400">Ara Toplam: <b>{((wo.estimate?.grandTotal || 0) * 0.833).toLocaleString()} ₺</b></div>
                <div className="text-slate-400">KDV (%20): <b>{((wo.estimate?.grandTotal || 0) * 0.167).toLocaleString()} ₺</b></div>
                <div className="text-sm font-black text-emerald-400 font-mono pt-1 border-t border-slate-800">
                  Genel Toplam: {(wo.estimate?.grandTotal || wo.totalAmount).toLocaleString()} ₺
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MPI INSPECTION */}
      {activeSubTab === 'INSPECTION' && (
        <div className="space-y-6">
          {/* Add Finding */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
              Yeni Ekspertiz Kontrol Maddesi Ekle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Kategori:</label>
                <select
                  value={newMpiCategory}
                  onChange={e => setNewMpiCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="MOTOR">Motor & Mekanik</option>
                  <option value="FREN">Fren Sistemi</option>
                  <option value="ON_TAKIM">Ön Takım & Süspansiyon</option>
                  <option value="SIVILAR">Sıvılar & Yağlar</option>
                  <option value="LASTIK">Lastikler & Jant</option>
                  <option value="ELEKTRIK">Elektrik & Akü</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Parça / Kontrol Adı:</label>
                <input
                  type="text"
                  placeholder="Örn: Arka Amortisörler"
                  value={newMpiTitle}
                  onChange={e => setNewMpiTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Durum (Triage):</label>
                <select
                  value={newMpiCondition}
                  onChange={e => setNewMpiCondition(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="GOOD">GOOD (İyi / Sorunsuz)</option>
                  <option value="ATTENTION">ATTENTION (Dikkat / Yakında Değişim)</option>
                  <option value="URGENT">URGENT (Acil Değişmeli)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Aksiyon:</label>
                <button
                  type="button"
                  onClick={handleAddMpiFinding}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  Ekspertize Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Inspection Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(wo.inspection?.items || []).map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-4 rounded-2xl border ${
                  item.condition === 'URGENT'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : item.condition === 'ATTENTION'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-emerald-950/20 border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                    {item.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.condition === 'URGENT'
                      ? 'bg-rose-600 text-white'
                      : item.condition === 'ATTENTION'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {item.condition}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100">{item.title}</div>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                )}
                {item.estimatedPartCost && (
                  <div className="text-xs font-mono text-amber-300 mt-2">
                    Tahmini Parça: {item.estimatedPartCost.toLocaleString()} ₺ • İşçilik: {item.estimatedLaborCost?.toLocaleString()} ₺
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INTAKE & DAMAGE */}
      {activeSubTab === 'INTAKE' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
              2D Kayıtlı Araç Hasar Çizim Haritası
            </h3>
            <VehicleDamageCanvas
              damagePoints={wo.intake?.damagePoints || []}
              onChange={() => {}}
              readOnly={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200">Müşteri Şikayeti</h4>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                "{wo.intake?.customerComplaints || 'Belirtilmedi'}"
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200">Aksesuar & Envanter Durumu</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  Stepne: <b>{wo.intake?.hasSpareTire ? 'Mevcut' : 'Yok'}</b>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  Kriko: <b>{wo.intake?.hasJack ? 'Mevcut' : 'Yok'}</b>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  Ruhsat: <b>{wo.intake?.hasRegistrationDoc ? 'Teslim Alındı' : 'Yok'}</b>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  Anahtar: <b>{wo.intake?.keyCount || 1} Adet</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WORKSHOP & BAYS */}
      {activeSubTab === 'WORKSHOP' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
            Atölye Lift ve Teknisyen Atama
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 mb-1.5 block">Atölye Lift İstasyonu:</label>
              <select
                value={wo.bayId || ''}
                onChange={e => {
                  const bay = bays.find(b => b.id === e.target.value);
                  const updated = { ...wo, bayId: e.target.value, bayName: bay?.name };
                  setWo(updated);
                  store.saveWorkOrder(updated);
                  showSuccess('Lift Atandı', `${bay?.name || ''} iş emrine bağlandı.`);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="">Lift Seçiniz...</option>
                {bays.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1.5 block">Sorumlu Teknisyen (Usta):</label>
              <select
                value={wo.technicianId || ''}
                onChange={e => {
                  const updated = { ...wo, technicianId: e.target.value, technicianName: 'Kemal Teknisyen' };
                  setWo(updated);
                  store.saveWorkOrder(updated);
                  showSuccess('Usta Atandı', 'Teknisyen iş emrine görevlendirildi.');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="">Teknisyen Seçiniz...</option>
                <option value="user-3">Kemal Teknisyen (Mekanik & Motor)</option>
                <option value="user-5">Emre Usta (Elektrik & Diagnostik)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYMENT */}
      {activeSubTab === 'PAYMENT' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
            Tahsilat & Kasa Girişi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 mb-1.5 block">Tahsil Edilecek Tutar (₺):</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 mb-1.5 block">Ödeme Yöntemi:</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="CREDIT_CARD">Kredi Kartı (POS)</option>
                <option value="CASH">Nakit</option>
                <option value="BANK_TRANSFER">Havale / EFT</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleRecordPayment}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                Tahsilatı Kaydet & Makbuz Kes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Key & Windshield Tag Modal */}
      <QRKeyTagModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        workOrder={wo}
        vehicle={vehicle}
        customer={customer}
      />
    </div>
  );
};
