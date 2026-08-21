import React from 'react';
import { store } from '../../services/store';
import { useTenant } from '../../core/TenantContext';
import { 
  BarChart3, TrendingUp, PieChart, Users, 
  Wrench, Car, Clock, ShieldCheck, DollarSign 
} from 'lucide-react';

export const ReportsBIPage: React.FC = () => {
  const { currentTenant } = useTenant();

  const workOrders = store.getWorkOrders(currentTenant.id);
  const payments = store.getPayments(currentTenant.id);
  const inventory = store.getInventory(currentTenant.id);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const avgTicket = workOrders.length > 0 ? Math.round(totalRevenue / workOrders.length) : 0;
  const quoteAcceptanceRate = 88; // %
  const onTimeDeliveryRate = 94; // %

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Raporlar & İş Zekası (BI)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Ciro, kârlılık, parça-işçilik kırılımları, teknisyen verimliliği ve sepet analizleri
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Toplam Servis Cirosu</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {totalRevenue.toLocaleString()} ₺
          </div>
          <div className="text-[11px] text-emerald-500 font-bold">▲ %18 geçen aya göre</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Ortalama İş Emri Tutarı (AOV)</div>
          <div className="text-2xl font-black text-brand-300 font-mono">
            {avgTicket.toLocaleString()} ₺
          </div>
          <div className="text-[11px] text-slate-400">Araç başı ortalama gelir</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Teklif Onay Oranı</div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            %{quoteAcceptanceRate}
          </div>
          <div className="text-[11px] text-amber-500 font-bold">Dijital onay dönüşümü</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Zamanında Teslimat Oranı</div>
          <div className="text-2xl font-black text-teal-300 font-mono">
            %{onTimeDeliveryRate}
          </div>
          <div className="text-[11px] text-teal-400">SLA hedefine uygun</div>
        </div>
      </div>

      {/* Visual Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parts vs Labor Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-400" />
            <span>Gelir Kırılımı (Parça vs İşçilik)</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-purple-400">Yedek Parça Geliri (%65)</span>
                <span className="font-mono text-slate-200">{(totalRevenue * 0.65).toLocaleString()} ₺</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-400">İşçilik Geliri (%35)</span>
                <span className="font-mono text-slate-200">{(totalRevenue * 0.35).toLocaleString()} ₺</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Technician Efficiency Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Teknisyen Verimlilik Karnesi</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Kemal Usta (Mekanik)</div>
                <div className="text-[11px] text-slate-400">Tamamlanan İş: 24 adet</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 text-sm">%112 Verimlilik</span>
                <div className="text-[10px] text-slate-500">Standart saat üzeri</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Emre Usta (Elektrik & Diagnostik)</div>
                <div className="text-[11px] text-slate-400">Tamamlanan İş: 18 adet</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sky-400 text-sm">%98 Verimlilik</span>
                <div className="text-[10px] text-slate-500">Standart saatte</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
