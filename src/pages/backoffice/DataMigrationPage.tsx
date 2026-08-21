import React, { useState } from 'react';
import { useNotification } from '../../core/NotificationContext';
import { 
  FileUp, FileSpreadsheet, CheckCircle2, Download, 
  ArrowRight, RefreshCw, AlertTriangle, Check 
} from 'lucide-react';

export const DataMigrationPage: React.FC = () => {
  const { showSuccess } = useNotification();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [dataType, setDataType] = useState<'CUSTOMERS' | 'VEHICLES' | 'INVENTORY'>('CUSTOMERS');
  const [fileName, setFileName] = useState('eski_servis_musteri_listesi.xlsx');

  const handleSimulateImport = () => {
    setActiveStep(3);
    showSuccess('İçe Aktarım Başarılı', '248 müşteri ve 312 araç kaydı başarıyla aktarıldı.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>Veri Aktarım & Excel Migrasyon Merkezi</span>
        </h1>
        <p className="text-xs text-slate-400">
          Eski servis yazılımlarından ve Excel listelerinden müşteri, araç, stok ve cari verilerini hatasız aktarın
        </p>
      </div>

      {/* Migration Wizard */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs font-bold border-b border-slate-800 pb-4">
          <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-brand-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">1</span>
            <span>Dosya Yükleme & Tür Seçimi</span>
          </div>
          <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-brand-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">2</span>
            <span>Alan Eşleştirme & Önizleme</span>
          </div>
          <div className={`flex items-center gap-2 ${activeStep === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">3</span>
            <span>Tamamlama & Rapor</span>
          </div>
        </div>

        {/* Step 1 */}
        {activeStep === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold mb-1.5 block">Aktarılacak Veri Türü:</label>
              <div className="grid grid-cols-3 gap-3">
                {(['CUSTOMERS', 'VEHICLES', 'INVENTORY'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDataType(t)}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                      dataType === t
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t === 'CUSTOMERS' && 'Müşteri & Cari Listesi'}
                    {t === 'VEHICLES' && 'Araç & Plaka Dosyaları'}
                    {t === 'INVENTORY' && 'Stok & Yedek Parça'}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag Drop Area */}
            <div className="p-8 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-950 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-brand-400 mx-auto" />
              <div className="font-bold text-slate-200">Excel (.xlsx) veya CSV Dosyasını Buraya Sürükleyin</div>
              <div className="text-slate-500 text-[11px]">veya bilgisayarınızdan dosya seçin</div>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30 text-xs inline-flex items-center gap-2"
              >
                <span>{fileName} Dosyasını İncele</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {activeStep === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-200">Excel Sütunları ile Platform Alanlarını Eşleştirin</h3>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="grid grid-cols-2 text-slate-400 font-bold border-b border-slate-800 pb-2">
                <span>Excel Sütunu (Gelen)</span>
                <span>AutoService OS Alanı (Hedef)</span>
              </div>
              <div className="grid grid-cols-2 items-center py-1 border-b border-slate-900">
                <span className="font-mono text-slate-300">AD_SOYAD</span>
                <span className="font-bold text-emerald-400">Müşteri Adı Soyadı</span>
              </div>
              <div className="grid grid-cols-2 items-center py-1 border-b border-slate-900">
                <span className="font-mono text-slate-300">GSM_NO</span>
                <span className="font-bold text-emerald-400">Telefon Numarası</span>
              </div>
              <div className="grid grid-cols-2 items-center py-1 border-b border-slate-900">
                <span className="font-mono text-slate-300">PLAKA</span>
                <span className="font-bold text-emerald-400">Araç Plakası</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-xl text-slate-400"
              >
                Geri
              </button>
              <button
                onClick={handleSimulateImport}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 text-xs"
              >
                İçe Aktarımı Başlat
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {activeStep === 3 && (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">İçe Aktarım Başarıyla Tamamlandı!</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Tüm müşteri ve araç verileri tenant izolasyonuyla veritabanınıza aktarılmıştır.
            </p>
            <button
              onClick={() => setActiveStep(1)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Yeni Bir Aktarım Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
