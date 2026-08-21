import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../core/AuthContext';
import { useNotification } from '../../core/NotificationContext';
import {
  Wrench, Shield, BarChart3, Zap, Users, Car, Layers, MessageSquare,
  ClipboardList, Calendar, Package, Wallet, FileSpreadsheet, Globe,
  ChevronRight, Check, ArrowRight, Play, Star, Sparkles, Phone,
  Building2, Lock, CheckCircle2, ArrowDown, Menu, X, LogIn
} from 'lucide-react';

interface Props {
  onEnterPanel: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnterPanel }) => {
  const { firebaseUser, loginWithGoogle, isSuperAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
      showSuccess('Giriş Başarılı', 'Panele yönlendiriliyorsunuz...');
      setTimeout(() => onEnterPanel(), 600);
    } catch (err: any) {
      showError('Giriş Hatası', err.message || 'Google ile giriş başarısız.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const animClass = (id: string) =>
    visibleSections.has(id)
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-8';

  const features = [
    {
      icon: ClipboardList,
      title: 'Dijital Araç Kabul & İş Emri',
      desc: '2D hasar tuvali, fotoğraflı tutanak, dijital imza ve 15 aşamalı iş emri durum makinesi.',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Shield,
      title: 'Çok Noktalı Ekspertiz (MPI)',
      desc: 'Yeşil-Sarı-Kırmızı triyajlı kontrol listesi, fotoğraf ekleme ve müşteriye şeffaf rapor.',
      color: 'from-emerald-500 to-teal-400',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Dijital Teklif Onayı',
      desc: 'Kalem kalem onay/red yapılabilir teklif linki. Müşteri telefonundan tek dokunuşla onaylar.',
      color: 'from-green-500 to-emerald-400',
    },
    {
      icon: Car,
      title: '360° Araç Dosyası & CRM',
      desc: 'Tüm servis geçmişi, ekspertiz raporları, parça kullanımı ve müşteri LTV/RFM segmentasyonu.',
      color: 'from-violet-500 to-purple-400',
    },
    {
      icon: Layers,
      title: 'Lastik Oteli & Sezonluk Çağrı',
      desc: 'DOT, diş derinliği, raf konumu takibi ve sezon geldiğinde otomatik WhatsApp randevu çağrısı.',
      color: 'from-amber-500 to-orange-400',
    },
    {
      icon: Wrench,
      title: 'Atölye & Lift Yönetimi',
      desc: 'Canlı lift doluluk matrisi, teknisyen görevlendirme ve süre takip (labor clocking).',
      color: 'from-rose-500 to-pink-400',
    },
    {
      icon: Package,
      title: 'Yedek Parça ERP & Stok',
      desc: 'SKU, barkod, OEM kodu, çoklu depo, kritik stok alarmı ve otomatik satın alma önerisi.',
      color: 'from-sky-500 to-blue-400',
    },
    {
      icon: FileSpreadsheet,
      title: 'e-Fatura & e-Arşiv (GİB)',
      desc: 'VKN/TCKN sorgulama, e-Fatura/e-Arşiv/e-İrsaliye adaptörü ve giden belge kuyruğu.',
      color: 'from-indigo-500 to-violet-400',
    },
    {
      icon: BarChart3,
      title: 'Raporlar & İş Zekası (BI)',
      desc: 'Ciro, kârlılık, parça/işçilik kırılımları, teknisyen verimlilik karneleri ve trend analizi.',
      color: 'from-teal-500 to-cyan-400',
    },
  ];

  const plans = [
    {
      name: 'Başlangıç',
      price: '1.490',
      period: '/ ay',
      desc: 'Tek şubeli küçük servisler için',
      badge: '',
      features: [
        '1 Şube, 3 Kullanıcı',
        'Dijital Araç Kabul & İş Emri',
        'Müşteri CRM & Araç Dosyası',
        'Online Randevu Sayfası',
        'Temel Raporlar',
        'E-posta Destek',
      ],
      cta: 'Ücretsiz Dene',
      highlight: false,
    },
    {
      name: 'Profesyonel',
      price: '3.490',
      period: '/ ay',
      desc: 'Büyüyen servisler ve çoklu şubeler',
      badge: 'EN POPÜLER',
      features: [
        '3 Şube, 10 Kullanıcı',
        'Başlangıç paketindeki her şey',
        'Lastik Oteli & Sezonluk Çağrı',
        'WhatsApp Teklif Onayı',
        'e-Fatura / e-Arşiv (GİB)',
        'Gelişmiş BI Raporları',
        'Stok & Yedek Parça ERP',
        'Öncelikli Destek',
      ],
      cta: '14 Gün Ücretsiz Başla',
      highlight: true,
    },
    {
      name: 'Kurumsal',
      price: '7.990',
      period: '/ ay',
      desc: 'Filo yönetimi ve servis ağları',
      badge: '',
      features: [
        'Sınırsız Şube & Kullanıcı',
        'Profesyonel paketindeki her şey',
        'Filo B2B Portalı',
        'Franchise Ağ Yönetimi',
        'API Entegrasyon Erişimi',
        'Yapay Zeka Copilot',
        'Özel Eğitim & Onboarding',
        '7/24 Öncelikli Destek',
      ],
      cta: 'Satış Ekibiyle Görüş',
      highlight: false,
    },
  ];

  const stats = [
    { value: '2.400+', label: 'Oto Servis Müşterisi' },
    { value: '850K+', label: 'İş Emri Üretildi' },
    { value: '%99.98', label: 'Platform Uptime' },
    { value: '34', label: 'İl\'de Aktif Kullanım' },
  ];

  const faqs = [
    {
      q: 'AutoService OS hangi tür oto servis işletmelerine uygun?',
      a: 'Yetkili servisler, bağımsız oto tamirciler, hızlı bakım merkezleri, lastik servisleri, filo bakım firmaları ve çok şubeli servis ağları platformumuzu kullanabilir. Multi-tenant mimarisi sayesinde her işletme kendi izole ortamında çalışır.',
    },
    {
      q: 'Mevcut müşteri ve araç verilerimi aktarabilir miyim?',
      a: 'Evet. Excel / CSV formatında müşteri listeleri, araç plaka dosyaları ve stok envanterinizi kolayca içe aktarabilirsiniz. Veri Aktarım Sihirbazı alan eşleştirme (mapping) ile hatasız aktarım sağlar.',
    },
    {
      q: 'e-Fatura ve e-Arşiv entegrasyonu nasıl çalışıyor?',
      a: 'GİB (Gelir İdaresi Başkanlığı) uyumlu e-Fatura ve e-Arşiv adaptörümüz, iş emri kapanışında otomatik olarak fatura oluşturur. VKN/TCKN sorgulama ile mükellefin e-Fatura veya e-Arşiv kullanıcısı olduğunu anında tespit eder.',
    },
    {
      q: 'Müşterilerim teklifi nasıl onaylıyor?',
      a: 'İş emrine teklif oluşturduğunuzda tek tıkla WhatsApp veya SMS linki gönderirsiniz. Müşteri bu linki açarak her bir parça ve işçilik kalemini ayrı ayrı onaylayabilir veya reddedebilir. Onay anında ekibinize bildirim düşer.',
    },
    {
      q: 'Ücretsiz deneme süresi var mı?',
      a: 'Evet! Profesyonel paket için 14 gün, Başlangıç paketi için 7 gün ücretsiz deneme sunuyoruz. Kredi kartı gerekmez, anında başlayın.',
    },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* ═══════════════════════════════════ NAVBAR ═══════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white">AutoService</span>
              <span className="text-sm font-black tracking-tight text-brand-400 ml-0.5">OS</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button onClick={() => scrollTo('features')} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all">Özellikler</button>
            <button onClick={() => scrollTo('how-it-works')} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all">Nasıl Çalışır</button>
            <button onClick={() => scrollTo('pricing')} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all">Fiyatlandırma</button>
            <button onClick={() => scrollTo('faq')} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all">S.S.S.</button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {firebaseUser ? (
              <button
                onClick={onEnterPanel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
              >
                <span>Panele Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isLoggingIn ? 'Giriş...' : 'Giriş Yap'}</span>
                </button>
                <button
                  onClick={() => scrollTo('pricing')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                >
                  <span>Ücretsiz Dene</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-300 p-2">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 text-xs font-semibold">
            <button onClick={() => scrollTo('features')} className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900">Özellikler</button>
            <button onClick={() => scrollTo('how-it-works')} className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900">Nasıl Çalışır</button>
            <button onClick={() => scrollTo('pricing')} className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900">Fiyatlandırma</button>
            <button onClick={() => scrollTo('faq')} className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900">S.S.S.</button>
            <hr className="border-slate-800" />
            {firebaseUser ? (
              <button onClick={onEnterPanel} className="w-full px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-center">Panele Git</button>
            ) : (
              <button onClick={handleLogin} className="w-full px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-center">
                {isLoggingIn ? 'Giriş...' : 'Giriş Yap & Başla'}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-20 w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />
        <div className="absolute top-60 right-20 w-[250px] h-[250px] rounded-full bg-cyan-600/8 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Türkiye'nin Dijital Oto Servis İşletim Sistemi</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            <span className="text-white">Servisinizi</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-300 to-brand-400 animate-gradient-x">
              Dijitale Taşıyın
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Araç kabul, iş emri, ekspertiz, yedek parça, lastik oteli, e-fatura ve müşteri takibini
            tek bir platformda yönetin. Her büyüklükte oto servis için tasarlandı.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {firebaseUser ? (
              <button
                onClick={onEnterPanel}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-2xl shadow-brand-600/30 transition-all active:scale-95"
              >
                <span>Yönetim Paneline Gir</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-2xl shadow-brand-600/30 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="currentColor" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="currentColor" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.98 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="currentColor" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isLoggingIn ? 'Giriş Yapılıyor...' : 'Google ile Hemen Başla'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => scrollTo('features')}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
                >
                  <Play className="w-4 h-4 text-brand-400" />
                  <span>Platformu Keşfet</span>
                </button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit SSL Şifreleme</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>KVKK & GDPR Uyumlu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kredi Kartı Gerekmez</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ STATS BAR ═══════════════════════════════════ */}
      <section className="border-y border-slate-800/60 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{s.value}</div>
              <div className="text-xs text-slate-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════ FEATURES ═══════════════════════════════════ */}
      <section
        id="features"
        ref={(el) => { sectionRefs.current['features'] = el; }}
        className={`py-24 px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${animClass('features')}`}
      >
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Uçtan Uca Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Oto Servisiniz İçin İhtiyacınız Olan Her Şey
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              45+ modül ile araç kabulden fatura kesmeye, lastik saklama'dan müşteri kampanyalarına kadar her operasyonu dijitalleştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-950/30 hover:-translate-y-1 space-y-4"
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-slate-100">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ HOW IT WORKS ═══════════════════════════════════ */}
      <section
        id="how-it-works"
        ref={(el) => { sectionRefs.current['how-it-works'] = el; }}
        className={`py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/20 border-y border-slate-800/40 transition-all duration-700 ease-out ${animClass('how-it-works')}`}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              4 Adımda Servise Dijital Dönüşüm
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Kayıt ol, verilerini aktar, ekibini davet et ve anında dijitale geç.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Hesap Aç', desc: 'Google ile tek tıkla kayıt olun ve servis bilgilerinizi girin.', icon: LogIn },
              { step: '02', title: 'Veri Aktar', desc: 'Mevcut müşteri, araç ve stok listenizi Excel\'den içe aktarın.', icon: Package },
              { step: '03', title: 'Ekibini Davet Et', desc: 'Danışman, usta ve muhasebecilerinizi rolleriyle birlikte ekleyin.', icon: Users },
              { step: '04', title: 'Başla!', desc: 'İlk araç kabulünü yapın, iş emri açın ve dijital servisin keyfini çıkarın.', icon: Sparkles },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-600 text-white text-[11px] font-black flex items-center justify-center shadow-lg shadow-brand-600/40">
                    {s.step}
                  </div>
                  <div className="pt-4">
                    <Icon className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                    <h3 className="font-bold text-sm text-white">{s.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ PRICING ═══════════════════════════════════ */}
      <section
        id="pricing"
        ref={(el) => { sectionRefs.current['pricing'] = el; }}
        className={`py-24 px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${animClass('pricing')}`}
      >
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              İşletmenize Uygun Planı Seçin
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Her plan 14 gün ücretsiz deneme ile gelir. Kredi kartı gerekmez.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-3xl border space-y-6 transition-all duration-300 ${
                  p.highlight
                    ? 'bg-slate-900 border-brand-500/50 shadow-2xl shadow-brand-950/40 scale-[1.03] ring-1 ring-brand-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-600 text-white text-[10px] font-black tracking-wider shadow-lg shadow-brand-600/40">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>

                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">{p.price}</span>
                  <span className="text-sm text-slate-400 font-medium pb-1">₺ {p.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  {p.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={p.highlight ? handleLogin : () => scrollTo('features')}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 ${
                    p.highlight
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ FAQ ═══════════════════════════════════ */}
      <section
        id="faq"
        ref={(el) => { sectionRefs.current['faq'] = el; }}
        className={`py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/20 border-t border-slate-800/40 transition-all duration-700 ease-out ${animClass('faq')}`}
      >
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight">Sıkça Sorulan Sorular</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaqIndex(activeFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-bold text-slate-100 pr-4">{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      activeFaqIndex === i ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaqIndex === i && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ CTA BANNER ═══════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center p-10 sm:p-16 rounded-[2rem] bg-gradient-to-br from-brand-600/20 via-slate-900 to-purple-600/10 border border-brand-500/20 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Servisinizi Dijitale Taşımaya Hazır mısınız?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Binlerce oto servis işletmesi AutoService OS ile operasyonlarını dijitalleştirdi. Sıra sizde.
          </p>
          <button
            onClick={firebaseUser ? onEnterPanel : handleLogin}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-2xl shadow-brand-600/30 transition-all active:scale-95"
          >
            <span>{firebaseUser ? 'Panele Git' : 'Hemen Ücretsiz Başla'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════ FOOTER ═══════════════════════════════════ */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-black text-white">AutoService<span className="text-brand-400">OS</span></span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Türkiye'nin en kapsamlı çok kiracılı oto servis yönetim platformu.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Ürün</h4>
              <div className="space-y-1.5 text-xs text-slate-500">
                <button onClick={() => scrollTo('features')} className="block hover:text-slate-200 transition-colors">Özellikler</button>
                <button onClick={() => scrollTo('pricing')} className="block hover:text-slate-200 transition-colors">Fiyatlandırma</button>
                <button onClick={() => scrollTo('faq')} className="block hover:text-slate-200 transition-colors">S.S.S.</button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Şirket</h4>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div>Hakkımızda</div>
                <div>Blog</div>
                <div>Kariyer</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Destek</h4>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div>Yardım Merkezi</div>
                <div>API Dokümantasyonu</div>
                <div>Durum Sayfası</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} AutoService OS. Tüm hakları saklıdır.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer">Gizlilik Politikası</span>
              <span className="hover:text-slate-300 cursor-pointer">Kullanım Koşulları</span>
              <span className="hover:text-slate-300 cursor-pointer">KVKK Aydınlatma</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
