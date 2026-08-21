import React, { useState } from 'react';
import { useAuth } from '../../core/AuthContext';
import { useNotification } from '../../core/NotificationContext';
import { PlateBadge } from '../../components/vehicle/PlateBadge';
import {
  Wrench, Shield, BarChart3, Zap, Users, Car, Layers, MessageSquare,
  ClipboardList, Calendar, Package, Wallet, FileSpreadsheet, Globe,
  ChevronRight, Check, ArrowRight, Play, Star, Sparkles, Phone,
  Building2, Lock, CheckCircle2, Menu, X, LogIn, Clock,
  Smartphone, Award, TrendingUp, Sliders, ShieldCheck, CheckCircle,
  Eye, Cpu
} from 'lucide-react';

interface Props {
  onEnterPanel: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnterPanel }) => {
  const { firebaseUser, loginWithGoogle } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  
  // Interactive Hero Preview Tab
  const [heroTab, setHeroTab] = useState<'KANBAN' | 'DAMAGE_CANVAS' | 'WHATSAPP' | 'BAYS'>('KANBAN');
  
  // Interactive ROI Calculator State
  const [monthlyVehicles, setMonthlyVehicles] = useState<number>(120);

  // Active damage pins simulator
  const [damagePins] = useState([
    { id: 1, x: 28, y: 35, type: 'SCRATCH', label: 'Sol Ön Çamurluk Çizik' },
    { id: 2, x: 72, y: 65, type: 'DENT', label: 'Sağ Arka Kapı Göçük' },
    { id: 3, x: 50, y: 88, type: 'PAINT', label: 'Arka Tampon Boya Hasarı' }
  ]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
      showSuccess('Giriş Başarılı', 'Panele yönlendiriliyorsunuz...');
      setTimeout(() => onEnterPanel(), 500);
    } catch (err: any) {
      showError('Giriş Hatası', err.message || 'Google ile giriş başarısız.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // ROI Calculations
  const estimatedRevenueGain = Math.round(monthlyVehicles * 850 * 1.18);
  const estimatedHoursSaved = Math.round((monthlyVehicles * 35) / 60);
  const approvalRateBoost = 38;

  const features = [
    {
      icon: ClipboardList,
      title: 'Dijital Araç Kabul & 2D Hasar Tuvali',
      desc: 'Araç silueti üzerine dokunarak çizik, göçük ve boya hasarlarını koordinat bazlı işaretleyin; tablet üzerinde dijital müşteri imzası alın.',
      tag: 'Kabul & Tutanak',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Teklif Onay Portalı',
      desc: 'Müşteriye tek tıkla gönderilen interaktif onay linki. Parça ve işçilikleri kalem kalem telefonundan incelesin, onaylasın veya reddetsin.',
      tag: 'Ciro Artırıcı',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      color: 'from-emerald-600 to-teal-500',
    },
    {
      icon: ShieldCheck,
      title: 'Çok Noktalı Ekspertiz (MPI)',
      desc: 'Yeşil/Sarı/Kırmızı triyaj sistemiyle fren, motor, yürüyen aksam ve sıvı kontrollerini fotoğraflayarak müşteriye şeffaf sağlık karnesi sunun.',
      tag: 'Müşteri Güveni',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      color: 'from-purple-600 to-pink-500',
    },
    {
      icon: Layers,
      title: 'Lastik Oteli & Sezonluk Çağrı',
      desc: 'DOT üretim yılı, mm diş derinliği, jant durumu ve raf lokasyonunu kaydedin. Kış/yaz sezonu geldiğinde tek tıkla toplu WhatsApp randevu çağrısı atın.',
      tag: 'Sezonluk Gelir',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Wrench,
      title: 'Canlı Atölye, Lift & Teknisyen Merkezi',
      desc: 'Hangi liftte hangi araç var anlık görün. Teknisyenler tablet üzerinden iş sürelerini (labor clocking) takip etsin ve parça talep etsin.',
      tag: 'Atölye Verimi',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      color: 'from-rose-600 to-red-500',
    },
    {
      icon: FileSpreadsheet,
      title: 'GİB e-Fatura, e-Arşiv & VKN Sorgulama',
      desc: 'Gelir İdaresi Başkanlığı uyumlu entegrasyon. Vergi No ile otomatik mükellef sorgulayın, tek tıkla e-Fatura / e-Arşiv oluşturup gönderin.',
      tag: 'Mevzuat Uyumlu',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      color: 'from-indigo-600 to-violet-500',
    },
    {
      icon: Package,
      title: 'Yedek Parça ERP & Çoklu Depo',
      desc: 'SKU, barkod, OEM kodları, raf konumları ve kritik stok alarmları. Satın alma ve tedarikçi cari hesaplarını kusursuz yönetin.',
      tag: 'Stok Kontrolü',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      color: 'from-cyan-600 to-blue-500',
    },
    {
      icon: Building2,
      title: 'Kurumsal Filo B2B Portalı',
      desc: 'Filo şirketleri için özel giriş ekranı. Araçlarının bakım durumlarını izlesinler, teklifleri merkezi portaldan toplu onaylasınlar.',
      tag: 'B2B Filo',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      color: 'from-teal-600 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Gelişmiş Raporlar & Analitik BI',
      desc: 'Parça vs işçilik kârlılığı, teknisyen verimlilik karneleri, ortalama iş emri sepet tutarı ve kayıp müşteri (RFM) analizleri.',
      tag: 'İş Zekası',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      color: 'from-sky-600 to-indigo-500',
    },
  ];

  const testimonials = [
    {
      name: 'Kemal Usta',
      role: 'Usta Otomotiv Kurucusu - Maslak Sanayi',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      comment: 'Eskiden müşterilerle telefonda fiyat tartışmaktan iş yapamıyorduk. WhatsApp teklif onay sistemiyle müşteriler fotoğrafları ve parçaları tek tek görüp onaylıyor. Ciromuz 3 ayda %40 arttı.',
      rating: 5,
      tag: 'Mekanik & Bakım',
    },
    {
      name: 'Murat Yıldırım',
      role: 'Filo Bakım A.Ş. Operasyon Müdürü',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: '600 araçlık filomuzun bakım onaylarını, parça maliyetlerini ve periyodik takiplerini tek bir ekrandan yönetiyoruz. Ekibin hazırladığı B2B Filo Portalı muazzam çalışıyor.',
      rating: 5,
      tag: 'Filo Yönetimi',
    },
    {
      name: 'Sinan Demir',
      role: 'LastikPark Genel Müdürü - İzmir',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      comment: 'Lastik Oteli modülü sayesinde 1.200 takım emanet lastiğin rafını ve diş derinliğini hatasız takip ediyoruz. Sezon geldiğinde tek tıkla gönderdiğimiz WhatsApp çağrısı dükkanı 2 günde dolduruyor.',
      rating: 5,
      tag: 'Lastik & Rot Balans',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-brand-500 selection:text-white bg-grid-light relative">
      {/* ════════════════════════ TOP ANNOUNCEMENT BAR ════════════════════════ */}
      <div className="bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 text-white text-xs py-2.5 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-md relative z-50">
        <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
        <span>AutoService OS v2.4 Yayında: Türkiye'nin İlk Çok Kiracılı GİB e-Fatura & WhatsApp Onaylı Oto Servis Platformu</span>
        <button onClick={() => scrollTo('features')} className="underline hover:text-sky-100 ml-2 hidden sm:inline text-xs font-extrabold">
          Yenilikleri İncele →
        </button>
      </div>

      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <nav className="sticky top-0 left-0 right-0 z-40 h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-2xl shadow-xs">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-sky-600 flex items-center justify-center shadow-lg shadow-brand-500/25 border border-brand-500/30">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-950">AutoService</span>
                <span className="text-lg font-black tracking-tight text-brand-600">OS</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-mono">v2.4</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Oto Servis & Bakım İşletim Sistemi</div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => scrollTo('features')} className="px-4 py-2 rounded-xl hover:text-slate-950 hover:bg-white hover:shadow-xs transition-all">Özellikler</button>
            <button onClick={() => scrollTo('live-preview')} className="px-4 py-2 rounded-xl hover:text-slate-950 hover:bg-white hover:shadow-xs transition-all">Canlı Önizleme</button>
            <button onClick={() => scrollTo('calculator')} className="px-4 py-2 rounded-xl hover:text-slate-950 hover:bg-white hover:shadow-xs transition-all">Tasarruf Hesabı</button>
            <button onClick={() => scrollTo('comparison')} className="px-4 py-2 rounded-xl hover:text-slate-950 hover:bg-white hover:shadow-xs transition-all">Karşılaştırma</button>
            <button onClick={() => scrollTo('pricing')} className="px-4 py-2 rounded-xl hover:text-slate-950 hover:bg-white hover:shadow-xs transition-all">Paketler</button>
            <button onClick={() => scrollTo('testimonials')} className="px-4 py-2 rounded-xl hover:text-slate-950 hover:bg-white hover:shadow-xs transition-all">Referanslar</button>
          </div>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {firebaseUser ? (
              <button
                onClick={onEnterPanel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all active:scale-95 border border-brand-500/20"
              >
                <span>Yönetim Paneline Git</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-600" />
                  <span>{isLoggingIn ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
                </button>

                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all active:scale-95 border border-brand-500/20"
                >
                  <span>60 Gün Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-slate-700 p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-5 space-y-3 text-xs font-bold shadow-2xl">
            <button onClick={() => scrollTo('features')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100">Özellikler</button>
            <button onClick={() => scrollTo('live-preview')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100">Canlı Önizleme</button>
            <button onClick={() => scrollTo('calculator')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100">Tasarruf Hesabı</button>
            <button onClick={() => scrollTo('comparison')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100">Karşılaştırma</button>
            <button onClick={() => scrollTo('pricing')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100">Fiyatlandırma</button>
            <hr className="border-slate-200" />
            {firebaseUser ? (
              <button onClick={onEnterPanel} className="w-full py-3 rounded-xl bg-brand-600 text-white font-extrabold text-center shadow-md">
                Yönetim Paneline Git →
              </button>
            ) : (
              <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 text-white font-extrabold text-center shadow-md">
                {isLoggingIn ? 'Giriş...' : 'Google ile Hemen Başla (Ücretsiz)'}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ════════════════════════ HERO SECTION ════════════════════════ */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial-light-glow">
        {/* Soft Ambient Lights */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-brand-500/8 blur-[140px] pointer-events-none" />
        <div className="absolute top-48 left-10 w-[350px] h-[350px] rounded-full bg-purple-500/6 blur-[120px] pointer-events-none" />
        <div className="absolute top-64 right-10 w-[350px] h-[350px] rounded-full bg-sky-400/8 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-200 text-brand-700 text-xs font-extrabold shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Türkiye'nin Yeni Nesil Çok Kiracılı (Multi-Tenant) Oto Servis Platformu</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-600" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-950">
            Araç Servisinizi Tek Bir <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600">
              Dijital İşletim Sistemiyle
            </span>{' '}
            Yönetin
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            2D hasar çizimli dijital araç kabulden WhatsApp teklif onayına; lift matrisinden GİB e-Faturaya ve lastik oteline kadar oto servis operasyonlarınızı tek çatı altında toplayın.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {firebaseUser ? (
              <button
                onClick={onEnterPanel}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95 border border-brand-400/30"
              >
                <span>Yönetim Paneline Giriş Yap</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95 border border-brand-400/30"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.98 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isLoggingIn ? 'Giriş Yapılıyor...' : 'Google ile 60 Gün Ücretsiz Başla'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => scrollTo('live-preview')}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4 text-brand-600" />
                  <span>Canlı Önizlemeyi İncele</span>
                </button>
              </>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">2.400+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Aktif Oto Servis & Atölye</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">850K+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Tamamlanan İş Emri</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">%38</div>
              <div className="text-xs text-slate-500 font-medium mt-1">WhatsApp Teklif Onay Artışı</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">%99.98</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Sistem & API Uptime</div>
            </div>
          </div>
        </div>

        {/* ════════════════════════ INTERACTIVE LIVE PRODUCT COCKPIT ════════════════════════ */}
        <div id="live-preview" className="max-w-6xl mx-auto mt-14 relative z-10">
          <div className="p-4 sm:p-6 rounded-[2.5rem] bg-white border-2 border-slate-200 shadow-2xl shadow-slate-200/80">
            {/* Window Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-200 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-600 ml-2">
                  AutoService OS - Canlı Operasyon Simülatörü
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setHeroTab('KANBAN')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    heroTab === 'KANBAN' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  İş Emirleri & Kanban
                </button>
                <button
                  onClick={() => setHeroTab('DAMAGE_CANVAS')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    heroTab === 'DAMAGE_CANVAS' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2D Hasar Tuvali
                </button>
                <button
                  onClick={() => setHeroTab('WHATSAPP')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    heroTab === 'WHATSAPP' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  WhatsApp Onay Ekranı
                </button>
                <button
                  onClick={() => setHeroTab('BAYS')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    heroTab === 'BAYS' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Atölye Lift Matrisi
                </button>
              </div>
            </div>

            {/* TAB CONTENT: KANBAN */}
            {heroTab === 'KANBAN' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-in fade-in duration-300">
                {/* Column 1: Araç Kabul */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>1. ARAÇ KABUL (2)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-brand-400 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <PlateBadge plate="34 VIP 77" size="sm" />
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Kabulde</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">BMW 320i Sedan (2022)</div>
                    <div className="text-[11px] text-slate-500">Can Kaya • 60.000 Km Periyodik Bakım</div>
                  </div>
                </div>

                {/* Column 2: Onay Bekleyen */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>2. MÜŞTERİ ONAYINDA (1)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-amber-300 shadow-xs space-y-2 hover:border-amber-400 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <PlateBadge plate="06 ANK 01" size="sm" />
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">WhatsApp Gönderildi</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">Mercedes C200d (2021)</div>
                    <div className="text-[11px] text-emerald-600 font-mono font-bold">Teklif Tutarı: 7.350 ₺</div>
                  </div>
                </div>

                {/* Column 3: Atölyede İşlemde */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>3. ATÖLYEDE İŞLEMDE (1)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-xs space-y-2 hover:border-emerald-400 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <PlateBadge plate="35 IZM 99" size="sm" />
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Lift 2'de</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">Audi A4 2.0 TDI (2020)</div>
                    <div className="text-[11px] text-slate-500">Teknisyen: Kemal Usta (Mekanik)</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2D DAMAGE CANVAS */}
            {heroTab === 'DAMAGE_CANVAS' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-left animate-in fade-in duration-300">
                {/* Visual Silhouette */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative flex items-center justify-center min-h-[220px]">
                  <div className="text-center space-y-2">
                    <Car className="w-32 h-32 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-500 font-mono font-bold">2D İnteraktif Araç Hasar Çizim Tuvali</div>
                  </div>

                  {/* Simulated Pins */}
                  {damagePins.map(pin => (
                    <div
                      key={pin.id}
                      style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-lg shadow-rose-500/40 cursor-pointer animate-pulse"
                      title={pin.label}
                    >
                      {pin.id}
                    </div>
                  ))}
                </div>

                {/* Marked Points Detail */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase font-mono">Tespit Edilen Hasar Noktaları ({damagePins.length})</h4>
                  <div className="space-y-2">
                    {damagePins.map(pin => (
                      <div key={pin.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                            {pin.id}
                          </span>
                          <span className="font-bold text-slate-900">{pin.label}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-mono font-bold">Fotoğraf Eklendi (1)</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-800 flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Müşteri kabul sırasında dijital imza ile teslim tutanağını onaylamıştır.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WHATSAPP QUOTATION */}
            {heroTab === 'WHATSAPP' && (
              <div className="p-6 max-w-xl mx-auto space-y-4 text-left animate-in fade-in duration-300">
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">Müşterinin Gördüğü WhatsApp Onay Ekranı</span>
                    </div>
                    <PlateBadge plate="34 VIP 77" size="sm" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl flex items-center justify-between border border-slate-200 shadow-xs">
                      <div>
                        <div className="font-bold text-slate-900">Motul 8100 5W-30 Motor Yağı (5L)</div>
                        <div className="text-[11px] text-slate-500">Yedek Parça • 2.227,50 ₺</div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">ONAYLANDI ✓</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl flex items-center justify-between border border-slate-200 shadow-xs">
                      <div>
                        <div className="font-bold text-slate-900">Brembo Ön Fren Balata Takımı</div>
                        <div className="text-[11px] text-slate-500">Yedek Parça • 2.808,00 ₺</div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">ONAYLANDI ✓</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80">
                    <span className="text-xs text-slate-700 font-bold">Toplam Onaylanan Tutar:</span>
                    <span className="text-base font-black text-emerald-700 font-mono">5.035,50 ₺</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BAYS */}
            {heroTab === 'BAYS' && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-white border border-brand-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">LİFT 1 (2 Sütunlu)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">DOLU</span>
                  </div>
                  <PlateBadge plate="34 VIP 77" size="sm" />
                  <div className="text-xs text-slate-500">Usta: Murat Teknisyen</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">LİFT 2 (4 Sütunlu / Rot)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">MÜSAİT</span>
                  </div>
                  <div className="text-xs text-slate-400 py-3">Sıradaki aracı alabilirsiniz</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-brand-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">LİFT 3 (Mekanik Bakım)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">DOLU</span>
                  </div>
                  <PlateBadge plate="35 IZM 99" size="sm" />
                  <div className="text-xs text-slate-500">Usta: Kemal Usta</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FEATURES GRID ════════════════════════ */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              <span>45+ Güçlü Modül & Uçtan Uca Altyapı</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Oto Servis İşletmenizin İhtiyacı Olan Her Şey
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Basit bir program değil; araç kabulden faturalandırmaya, depodan müşteri pazarlamasına kadar eksiksiz bir servis işletim sistemi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group p-7 rounded-3xl bg-white border border-slate-200 hover:border-brand-400 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100/80 hover:-translate-y-1.5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${f.badgeColor}`}>
                        {f.tag}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-950 group-hover:text-brand-600 transition-colors">
                      {f.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {f.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center text-brand-600 text-xs font-bold group-hover:translate-x-1 transition-transform">
                    <span>Detayları Keşfet →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════ ROI / TASARRUF HESAPLAYICI ════════════════════════ */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-100/60 border-y border-slate-200">
        <div className="max-w-5xl mx-auto p-8 sm:p-12 rounded-[2.5rem] bg-white border-2 border-brand-200 shadow-xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Yatırım Getirisi & Kazanç Simülatörü</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
              AutoService OS ile Ne Kadar Kazanç Sağlarsınız?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Aylık baktığınız ortalama araç sayısını seçin, dijital dönüşümün işletmenize getireceği tahmini ciro artışını hesaplayalım.
            </p>
          </div>

          {/* Slider */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-slate-700">Aylık Servise Giren Araç Sayısı:</span>
              <span className="text-2xl font-black text-brand-600 font-mono">{monthlyVehicles} Araç / Ay</span>
            </div>

            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={monthlyVehicles}
              onChange={e => setMonthlyVehicles(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>20 Araç</span>
              <span>250 Araç</span>
              <span>500+ Araç</span>
            </div>
          </div>

          {/* Live Calculated Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="text-xs text-slate-600 font-bold">Tahmini Ek Ciro Artışı</div>
              <div className="text-3xl font-black text-emerald-700 font-mono">+{estimatedRevenueGain.toLocaleString()} ₺</div>
              <div className="text-[11px] text-slate-500">WhatsApp teklif onayı ve çapraz satışlarla</div>
            </div>

            <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2">
              <div className="text-xs text-slate-600 font-bold">Kazanılan Personel Zamanı</div>
              <div className="text-3xl font-black text-brand-600 font-mono">+{estimatedHoursSaved} Saat</div>
              <div className="text-[11px] text-slate-500">Evrak, fatura ve telefon trafiğinden</div>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
              <div className="text-xs text-slate-600 font-bold">Teklif Onay Oranı Artışı</div>
              <div className="text-3xl font-black text-purple-700 font-mono">+{approvalRateBoost}%</div>
              <div className="text-[11px] text-slate-500">Şeffaf fotoğraflı dijital onay ile</div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={firebaseUser ? onEnterPanel : handleLogin}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-600 hover:brightness-105 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all active:scale-95"
            >
              Hemen Servisinizde Kullanmaya Başlayın →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════ COMPARISON MATRIX ════════════════════════ */}
      <section id="comparison" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Neden AutoService OS?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              Geleneksel Yöntemler vs AutoService OS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Defter, kağıt tutanaklar ve Excel dosyaları ile modern oto servis yönetimi arasındaki farklar.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-5 font-bold">Özellik / Karşılaştırma</th>
                  <th className="p-5 text-rose-600 font-bold">Kağıt / Excel / Eski Yazılımlar</th>
                  <th className="p-5 text-brand-700 font-bold bg-brand-50/50">AutoService OS Platformu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { title: 'Araç Kabul & Hasar Tespiti', old: 'Kağıda elle çizim, fotoğraflar kaybolur', modern: '2D interaktif tuval, fotoğraflı ve dijital imzalı kabul tutanağı' },
                  { title: 'Teklif & Müşteri Onayı', old: 'Telefonla sözlü onay, fiyatta itirazlar ve anlaşmazlık', modern: 'Tek tıkla WhatsApp linki, kalem kalem onay/red ve SMS kaydı' },
                  { title: 'Lastik Oteli Envanteri', old: 'Defterde unutulan lastikler, sezon çağrısı yok', modern: 'DOT, mm diş derinliği, raf konumu ve otomatik sezonluk WhatsApp çağrısı' },
                  { title: 'GİB e-Fatura & e-Arşiv', old: 'Ayrı portalda manuel veri girişi, hatalar', modern: 'VKN/TCKN otomatik sorgulama, iş emrinden tek tıkla faturalandırma' },
                  { title: 'Çok Şube & Filo B2B', old: 'Desteklenmez veya çok pahalı lisanslar', modern: 'Çok kiracılı (Multi-tenant) mimari, filo portali hazır' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 font-bold text-slate-900">{row.title}</td>
                    <td className="p-5 text-slate-500 flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{row.old}</span>
                    </td>
                    <td className="p-5 text-emerald-800 font-bold bg-brand-50/30">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.modern}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════════════ PRICING ════════════════════════ */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold">
              <Award className="w-3.5 h-3.5 text-brand-600" />
              <span>Şeffaf & Tek Fiyat Politikası</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Her Şey Dahil Tek Fiyat: <span className="text-brand-600 font-mono">799 ₺</span> / Ay
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Karmaşık paketler, gizli ücretler veya modül kısıtlaması yok. Tüm 45+ modül tek bir abonelikte sınırsızca elinizin altında.
            </p>
          </div>

          {/* Master Single Pricing Card */}
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white border-2 border-brand-500 shadow-2xl shadow-brand-100 relative ring-4 ring-brand-50 space-y-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-gradient-to-r from-brand-600 to-sky-600 text-white text-xs font-black tracking-wider shadow-md">
              60 GÜN TAMAMEN ÜCRETSİZ DENE
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
              <div>
                <div className="text-xs font-extrabold text-brand-600 uppercase tracking-wider font-mono">
                  AUTOSERVICE OS FULL ENTERPRISE SUITE
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
                  Tüm Özellikler Sınırsız & Eksiksiz
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kullanıcı sınırı yok • Şube sınırı yok • İş emri limiti yok
                </p>
              </div>

              <div className="text-left md:text-right">
                <div className="flex items-baseline md:justify-end gap-1.5">
                  <span className="text-5xl sm:text-6xl font-black text-slate-950 font-mono tracking-tight">
                    799
                  </span>
                  <div className="text-left">
                    <span className="text-lg font-black text-brand-600">₺</span>
                    <div className="text-[11px] text-slate-500 font-bold">/ ay (Sabit Fiyat)</div>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  ✓ İlk 60 Gün Sıfır Maliyet • Kredi Kartı Gerekmez
                </div>
              </div>
            </div>

            {/* Feature Checklist (Grid 2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>2D Hasar Çizimli</b> Dijital Araç Kabul & Tutanak</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>WhatsApp</b> Kalem Kalem Teklif Onay Portalı</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Lastik Oteli</b>, DOT, Raf & Sezonluk WhatsApp Çağrısı</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>GİB e-Fatura, e-Arşiv</b> & VKN Mükellef Doğrulama</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Karekodlu (QR)</b> Anahtarlık & Torpido Takip Etiketleri</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Müşteri Canlı Servis Durumu</b> Takip Portalı</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Periyodik Km & Bakım</b> Otomatik Hesaplama Motoru</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Yedek Parça, Stok ERP</b>, Barkod & Çoklu Depo</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Canlı Lift Matrisi</b> & Teknisyen Süre Takibi (Labor Clocking)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><b>Sınırsız Kullanıcı</b>, Sınırsız Teknisyen & Şube</span>
              </div>
            </div>

            {/* Bottom Big CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                <span>Dilediğiniz an iptal edebilirsiniz. Verileriniz %100 güvendedir.</span>
              </div>

              <button
                onClick={firebaseUser ? onEnterPanel : handleLogin}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 hover:brightness-105 text-white font-black text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{firebaseUser ? 'Yönetim Paneline Git' : 'Google ile 60 Gün Ücretsiz Başla'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ TESTIMONIALS ════════════════════════ */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Gerçek Kullanıcı Yorumları</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950">
              Servis Sahipleri Ne Diyor?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Türkiye'nin dört bir yanındaki bağımsız ve yetkili oto servislerin deneyimleri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-white border border-slate-200 space-y-4 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {t.tag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FAQ ACCORDION ════════════════════════ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-950">Sıkça Sorulan Sorular</h2>
            <p className="text-xs text-slate-600">Merak ettiğiniz tüm soruların yanıtları</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'AutoService OS hangi tür oto servis işletmelerine uygundur?',
                a: 'Bağımsız oto tamircileri, periyodik bakım merkezleri, lastik servisleri, oto elektrik ve diagnostik servisleri, filo bakım firmaları ve çok şubeli servis ağları için tam uyumludur. Multi-tenant yapısı sayesinde her işletme kendi bağımsız ve izole ortamında çalışır.'
              },
              {
                q: 'Eski servis programımdaki veya Exceldeki verileri aktarabilir miyim?',
                a: 'Evet! Gelişmiş Excel / CSV Veri Aktarım Sihirbazımız sayesinde mevcut müşteri rehberinizi, araç plaka dosyalarınızı ve parça stok listenizi 1 dakikada aktarabilirsiniz.'
              },
              {
                q: 'Müşteriler teklifi nasıl onaylar?',
                a: 'İş emrine parça ve işçilik kalemleri eklediğinizde tek tıkla müşterinizin telefonuna özel bir WhatsApp onay linki gider. Müşteri uygulamaya ihtiyaç duymadan telefon tarayıcısından kalem kalem kabul/red yapabilir.'
              },
              {
                q: 'GİB e-Fatura / e-Arşiv entegrasyonu için ekstra ücret var mı?',
                a: 'Hayır. 799 ₺ tek fiyat dahilinde GİB uyumlu e-Fatura / e-Arşiv / e-İrsaliye adaptörü ve otomatik VKN mükellef sorgulama yerleşiktir; hiçbir ekstra entegrasyon ücreti talep edilmez.'
              },
              {
                q: 'Ücretsiz deneme süresi bittiğinde ne olur?',
                a: '60 günlük deneme süresince hiçbir kredi kartı bilgisi istenmez. Süre sonunda memnun kalırsanız aylık 799 ₺ sabit fiyatla çalışmaya devam edebilirsiniz; verileriniz asla silinmez.'
              }
            ].map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setActiveFaqIndex(activeFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-xs text-slate-800 hover:text-brand-600"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeFaqIndex === i ? 'rotate-90 text-brand-600' : ''}`} />
                </button>
                {activeFaqIndex === i && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FINAL CTA BANNER ════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto p-10 sm:p-16 rounded-[3rem] bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 text-center space-y-6 shadow-2xl shadow-brand-500/30 border border-white/20 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Servisinizi Geleceğe Taşımaya Hazır mısınız?
            </h2>
            <p className="text-sm sm:text-base text-sky-100 max-w-xl mx-auto">
              60 gün boyunca tüm modülleri sınırsız ve ücretsiz deneyin. Kredi kartı gerekmez.
            </p>
            <div className="pt-2">
              <button
                onClick={firebaseUser ? onEnterPanel : handleLogin}
                className="px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-sm shadow-2xl transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <span>{firebaseUser ? 'Yönetim Paneline Git' : 'Google ile Hemen Başla (Ücretsiz)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer className="border-t border-slate-200 bg-white py-14 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-slate-900">AutoService<span className="text-brand-600">OS</span></span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Türkiye'nin en kapsamlı çok kiracılı (multi-tenant) oto servis ve filo yönetim platformu.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Modüller</h4>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div>2D Hasar Tuvali</div>
                <div>İş Emri & Kanban</div>
                <div>WhatsApp Teklif Onayı</div>
                <div>Lastik Oteli</div>
                <div>GİB e-Fatura Adaptörü</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Kurumsal</h4>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div>Hakkımızda</div>
                <div>Güvenlik & KVKK</div>
                <div>Kullanıcı Sözleşmesi</div>
                <div>İletişim & Destek</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">İletişim & Destek</h4>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-900">0850 000 00 00</span>
                </div>
                <div>destek@autoserviceos.com</div>
                <div className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tüm Sistemler Operasyonel</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} AutoService OS. Tüm hakları saklıdır.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-900 cursor-pointer">Gizlilik Politikası</span>
              <span>•</span>
              <span className="hover:text-slate-900 cursor-pointer">Çerez Tercihleri</span>
              <span>•</span>
              <span className="hover:text-slate-900 cursor-pointer">KVKK Aydınlatma Metni</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
