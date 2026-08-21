import React, { useState } from 'react';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { 
  FileSpreadsheet, Send, CheckCircle2, Search, 
  Building, RefreshCw, Check, ShieldCheck, Download, AlertCircle 
} from 'lucide-react';

export const EInvoicePage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const [vknQuery, setVknQuery] = useState('8910234567');
  const [lookupResult, setLookupResult] = useState<any>(null);

  // Simulated e-Invoices Queue
  const [invoices, setInvoices] = useState([
    {
      id: 'einv-1',
      invoiceNo: 'GIB2026000000412',
      receiverTitle: 'Demir Lojistik ve Ticaret A.Ş.',
      vkn: '2840192837',
      type: 'E_FATURA',
      profile: 'TICARIFATURA',
      amount: 14850,
      status: 'GIB_SUCCESS',
      date: '2026-08-21',
    },
    {
      id: 'einv-2',
      invoiceNo: 'EAR2026000000892',
      receiverTitle: 'Can Kaya',
      vkn: '10928374651',
      type: 'E_ARSIV',
      profile: 'TEMELFATURA',
      amount: 7236,
      status: 'GIB_SUCCESS',
      date: '2026-08-21',
    }
  ]);

  const handleLookupVkn = () => {
    if (!vknQuery.trim()) return;
    setLookupResult({
      vkn: vknQuery,
      title: 'Örnek Otomotiv San. Tic. A.Ş.',
      isEInvoiceUser: true,
      mailboxAlias: 'defaultpk@ornekltd.com.tr',
      registeredAt: '2021-04-10',
    });
    showSuccess('GİB Sorgusu Tamamlandı', 'Mükellef e-Fatura sistemine kayıtlıdır.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Türkiye e-Belge Entegrasyon Katmanı</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              GİB Uyumlu
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            e-Fatura, e-Arşiv, e-İrsaliye ve GİB VKN Mükellef Sorgulama Adaptörleri
          </p>
        </div>
      </div>

      {/* VKN / TCKN Taxpayer Lookup Widget */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
          <Search className="w-4 h-4 text-brand-400" />
          <span>GİB Canlı Vergi Kimlik No (VKN / TCKN) Mükellef Sorgulama</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="10 Haneli VKN veya 11 Haneli TCKN giriniz..."
            value={vknQuery}
            onChange={e => setVknQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-xs focus:border-brand-500 focus:outline-none"
          />
          <button
            onClick={handleLookupVkn}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>GİB'den Sorgula</span>
          </button>
        </div>

        {lookupResult && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
            <div className="space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>e-Fatura Kayıtlı Mükellefi: {lookupResult.title}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Posta Kutusu: {lookupResult.mailboxAlias}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[11px]">
              e-Fatura Zorunlu
            </span>
          </div>
        )}
      </div>

      {/* Sent e-Invoices Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-200 uppercase font-mono">
            Giden e-Belge Kuyruğu
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Belge No</th>
                <th className="p-4">Alıcı Ünvanı</th>
                <th className="p-4">VKN / TCKN</th>
                <th className="p-4">Belge Türü</th>
                <th className="p-4">Tutar</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">GİB Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-brand-400">{inv.invoiceNo}</td>
                  <td className="p-4 font-bold text-slate-100">{inv.receiverTitle}</td>
                  <td className="p-4 font-mono text-slate-400">{inv.vkn}</td>
                  <td className="p-4 font-mono font-bold text-purple-400">
                    <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-[10px]">
                      {inv.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {inv.amount.toLocaleString()} ₺
                  </td>
                  <td className="p-4 text-slate-400">{inv.date}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <Check className="w-3 h-3" />
                      <span>1300 - Başarıyla İmzalandı</span>
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
