import React from 'react';
import { WorkOrderStatus } from '../../types';
import { 
  FileText, CheckCircle2, Search, Calculator, Clock, 
  Package, Wrench, ShieldCheck, Sparkles, Check, Archive, XCircle, AlertTriangle 
} from 'lucide-react';

interface Props {
  status: WorkOrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const WorkOrderStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const getStatusConfig = (s: WorkOrderStatus) => {
    switch (s) {
      case 'DRAFT':
        return { label: 'Taslak', bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: FileText };
      case 'CHECKED_IN':
        return { label: 'Araç Kabul Edildi', bg: 'bg-sky-950 text-sky-300 border-sky-600/40', icon: Clock };
      case 'INSPECTION':
        return { label: 'Ekspertiz / Muayenede', bg: 'bg-indigo-950 text-indigo-300 border-indigo-600/40', icon: Search };
      case 'ESTIMATE_PENDING':
        return { label: 'Teklif Hazırlanıyor', bg: 'bg-blue-950 text-blue-300 border-blue-600/40', icon: Calculator };
      case 'AWAITING_APPROVAL':
        return { label: 'Müşteri Onayı Bekleniyor', bg: 'bg-amber-950 text-amber-300 border-amber-500/50', icon: AlertTriangle };
      case 'APPROVED':
        return { label: 'Müşteri Onayladı', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/40', icon: CheckCircle2 };
      case 'PARTS_PENDING':
        return { label: 'Yedek Parça Bekleniyor', bg: 'bg-purple-950 text-purple-300 border-purple-500/40', icon: Package };
      case 'ASSIGNED_TO_BAY':
        return { label: 'Lifte / Atölyeye Alındı', bg: 'bg-cyan-950 text-cyan-300 border-cyan-500/40', icon: Wrench };
      case 'IN_PROGRESS':
        return { label: 'İşlem Devam Ediyor', bg: 'bg-blue-900 text-blue-200 border-blue-400', icon: Wrench };
      case 'QUALITY_CHECK':
        return { label: 'Kalite Kontrolde', bg: 'bg-teal-950 text-teal-300 border-teal-500/40', icon: ShieldCheck };
      case 'WASH_DETAILING':
        return { label: 'Yıkama & Hazırlık', bg: 'bg-pink-950 text-pink-300 border-pink-500/40', icon: Sparkles };
      case 'READY_FOR_PICKUP':
        return { label: 'Teslime Hazır', bg: 'bg-emerald-900 text-emerald-100 border-emerald-400 font-bold', icon: Check };
      case 'DELIVERED':
        return { label: 'Teslim Edildi', bg: 'bg-slate-800 text-emerald-400 border-emerald-800/40', icon: CheckCircle2 };
      case 'CLOSED':
        return { label: 'Kapandı', bg: 'bg-slate-900 text-slate-400 border-slate-800', icon: Archive };
      case 'CANCELLED':
        return { label: 'İptal', bg: 'bg-rose-950 text-rose-300 border-rose-800/50', icon: XCircle };
      default:
        return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: FileText };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
