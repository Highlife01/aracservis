import React, { useState } from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { Payment } from '../../types';
import { 
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, 
  CreditCard, Landmark, Receipt, Plus, Search, Check 
} from 'lucide-react';

export const FinanceLedgerPage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const payments = store.getPayments(currentTenant.id);
  const workOrders = store.getWorkOrders(currentTenant.id);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBilled = workOrders.reduce((sum, w) => sum + w.totalAmount, 0);
  const openReceivables = Math.max(0, totalBilled - totalCollected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Kasa, Cari & Finans Defteri</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {payments.length} Tahsilat
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Nakit/Kredi kartı/Havale tahsilatları, cari hesap bakiyeleri ve makbuzlar
          </p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Toplam Tahsilat (Kasa)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {totalCollected.toLocaleString()} ₺
          </div>
          <div className="text-[11px] text-slate-500">POS, Nakit ve Havale toplamı</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Toplam Fatura Edilen Tutar</div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {totalBilled.toLocaleString()} ₺
          </div>
          <div className="text-[11px] text-slate-500">{workOrders.length} iş emri karşılığı</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Açık Hesap / Bekleyen Alacak</div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {openReceivables.toLocaleString()} ₺
          </div>
          <div className="text-[11px] text-slate-500">Müşterilerden tahsil edilecek bakiye</div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-200 uppercase font-mono">
            Tahsilat & Ödeme Makbuzları Geçmişi
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Makbuz No</th>
                <th className="p-4">Müşteri / Cari</th>
                <th className="p-4">Tutar</th>
                <th className="p-4">Ödeme Yöntemi</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Tahsil Eden</th>
                <th className="p-4">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-brand-400">{p.receiptNo}</td>
                  <td className="p-4 font-medium text-slate-100">{p.customerName}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {p.amount.toLocaleString()} ₺
                  </td>
                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                      {p.method === 'CREDIT_CARD' ? 'Kredi Kartı' : p.method === 'BANK_TRANSFER' ? 'Banka / Havale' : 'Nakit'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4 text-slate-300">{p.receivedBy}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1 w-fit">
                      <Check className="w-3 h-3" />
                      <span>Tamamlandı</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
