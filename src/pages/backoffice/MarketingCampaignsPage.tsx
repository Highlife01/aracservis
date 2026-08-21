import React, { useState } from 'react';
import { useTenant } from '../../core/TenantContext';
import { useNotification } from '../../core/NotificationContext';
import { 
  MessageSquare, Send, Users, Sparkles, Plus, 
  Calendar, Check, AlertCircle, TrendingUp 
} from 'lucide-react';

export const MarketingCampaignsPage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { showSuccess } = useNotification();

  const [campaigns, setCampaigns] = useState([
    {
      id: 'camp-1',
      title: '10.000 Km Periyodik Bakım Çağrısı',
      targetSegment: 'Bakımı Yaklaşan Araçlar',
      audienceCount: 142,
      channel: 'WHATSAPP',
      status: 'ACTIVE',
      sentCount: 142,
      convertedCount: 38,
      revenueGenerated: 184000,
    },
    {
      id: 'camp-2',
      title: 'Kış Lastiği Sezonluk Randevu Hatırlatması',
      targetSegment: 'Lastik Oteli Müşterileri',
      audienceCount: 88,
      channel: 'WHATSAPP',
      status: 'ACTIVE',
      sentCount: 88,
      convertedCount: 52,
      revenueGenerated: 46800,
    },
    {
      id: 'camp-3',
      title: '6 Aydır Uğramayan VIP Müşteri Winback İndirimi (%15)',
      targetSegment: 'Kayıp Riski / Pasif VIP',
      audienceCount: 24,
      channel: 'SMS',
      status: 'SCHEDULED',
      sentCount: 0,
      convertedCount: 0,
      revenueGenerated: 0,
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>WhatsApp & Pazarlama Otomasyonu</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
              Meta API
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Periyodik bakım hatırlatması, kış lastiği çağrısı ve müşteri geri kazanım (winback) kampanyaları
          </p>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map(c => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {c.channel}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {c.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-100">{c.title}</h3>
              <div className="text-xs text-slate-400">Hedef: <b className="text-slate-300">{c.targetSegment}</b></div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gönderilen:</span>
                <span className="font-bold text-slate-200">{c.sentCount} kişi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Servise Gelen (Dönüşüm):</span>
                <span className="font-bold text-emerald-400">{c.convertedCount} müşteri</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Oluşan Ciro:</span>
                <span className="font-bold text-emerald-400 font-mono">{c.revenueGenerated.toLocaleString()} ₺</span>
              </div>
            </div>

            <button
              onClick={() => showSuccess('Kampanya Başlatıldı', `${c.title} başarıyla kuyruğa alındı.`)}
              className="w-full py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-bold transition-all"
            >
              Tekrar Gönder / Tetikle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
