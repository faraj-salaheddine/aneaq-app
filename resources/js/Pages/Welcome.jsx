import { useState, useEffect } from 'react';
import { Link, Head, useForm } from '@inertiajs/react';
import { 
    Download, ExternalLink, ChevronDown, FileText, 
    ShieldCheck, Users, BarChart3, MapPin, 
    Phone, Mail, Printer, Globe, LogIn, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Welcome({ auth }) {
    const [isSticky, setIsSticky] = useState(false);
    const [activeLang, setActiveLang] = useState('FR');
    const [offsetY, setOffsetY] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submitLogin = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => setShowLoginModal(false),
            onError: () => reset('password'),
        });
    };

    const translations = {
        FR: {
            nav_about: "À propos",
            nav_universities: "Universités",
            nav_guides: "Guides",
            nav_login: "Se connecter",
            nav_dashboard: "Mon Tableau de Bord",
            hero_badge: "Assurance Qualité de l'Enseignement Supérieur",
            hero_title1: "Évaluer aujourd'hui pour",
            hero_title2: "l'excellence de demain",
            hero_desc: "Plateforme digitale centralisée dédiée à la gestion, au suivi et à l'orchestration des opérations d'évaluation institutionnelle au Maroc.",
            hero_btn1: "Ressources & Guides",
            hero_btn2: "Découvrir la DEE",
            stat_etab: "Établissements Évalués",
            stat_exp: "Experts Référencés",
            stat_rap: "Rapports Générés",
            stat_taux: "Taux de Conformité",
            chart_title: "Évolution des évaluations par type d'établissement",
            public_etab: "Établissements Publics",
            prive_etab: "Établissements Privés",
            about_badge: "La Mission de l'ANEAQ",
            about_title: "Un pilier stratégique pour la Recherche Scientifique",
            about_desc: "La Division de l'Évaluation des Établissements (DEE) est investie d'une mission régalienne : accompagner les institutions publiques et privées vers les meilleurs standards internationaux à travers une démarche rigoureuse.",
            about_p1_title: "Évaluation Institutionnelle",
            about_p1_desc: "Analyse approfondie de la gouvernance, des infrastructures et de la pédagogie.",
            about_p2_title: "Digitalisation des Processus",
            about_p2_desc: "Espace unifié centralisant les rapports d'auto-évaluation et l'intervention des experts.",
            about_p3_title: "Suivi des Recommandations",
            about_p3_desc: "Traçabilité continue des plans d'action et des améliorations continues.",
            docs_badge: "Documentation",
            docs_title: "Centre de Ressources",
            docs_desc: "Accédez en libre téléchargement aux cadres de référence et canevas officiels pour la préparation de l'évaluation.",
            docs_card1: "Guide Auto-évaluation",
            docs_card2: "Référentiel Qualité",
            docs_card3: "Annexes & Formulaires",
            dl_fr: "Télécharger (FR)",
            dl_ar: "تحميل (AR)",
            footer_about: "Agence Nationale d'Évaluation et d'Assurance Qualité de l'Enseignement Supérieur et de la Recherche Scientifique.",
            footer_links: "Liens Rapides",
            footer_contact: "Contactez-nous",
            footer_rights: "© 2026 ANEAQ - Division de l'Évaluation des Établissements. Tous droits réservés.",
            login_title: "SE CONNECTER",
            login_email: "Adresse Email",
            login_pwd: "Mot de passe",
            login_forgot: "Mot de passe oublié ?",
            login_remember: "Se souvenir de moi",
            login_btn: "Se connecter",
            login_loading: "Connexion en cours...",
            login_robot: "Je ne suis pas un robot"
        },
        AR: {
            nav_about: "حول الوكالة",
            nav_universities: "الجامعات",
            nav_guides: "الدلائل",
            nav_login: "تسجيل الدخول",
            nav_dashboard: "لوحة القيادة الخاصة بي",
            hero_badge: "ضمان جودة التعليم العالي",
            hero_title1: "تقييم اليوم من أجل",
            hero_title2: "تميز الغد",
            hero_desc: "منصة رقمية مركزية مخصصة لإدارة وتتبع وتنظيم عمليات التقييم المؤسساتي في المغرب.",
            hero_btn1: "الموارد والدلائل",
            hero_btn2: "اكتشف القسم",
            stat_etab: "المؤسسات المقيمة",
            stat_exp: "الخبراء المعتمدون",
            stat_rap: "التقارير المنجزة",
            stat_taux: "نسبة المطابقة",
            chart_title: "تطور التقييمات حسب نوع المؤسسة",
            public_etab: "مؤسسات عامة",
            prive_etab: "مؤسسات خاصة",
            about_badge: "مهمة الوكالة",
            about_title: "ركيزة استراتيجية للبحث العلمي",
            about_desc: "تتولى قسم تقييم المؤسسات مهمة سيادية: مرافقة المؤسسات العامة والخاصة نحو أفضل المعايير الدولية من خلال نهج صارم.",
            about_p1_title: "التقييم المؤسساتي",
            about_p1_desc: "تحليل متعمق للحكامة والبنى التحتية والمنهجية التربوية.",
            about_p2_title: "رقمنة المساطر",
            about_p2_desc: "فضاء موحد يجمع تقارير التقييم الذاتي وتدخلات الخبراء.",
            about_p3_title: "تتبع التوصيات",
            about_p3_desc: "تتبع مستمر لخطط العمل والتحسينات المستمرة.",
            docs_badge: "الوثائق",
            docs_title: "مركز الموارد",
            docs_desc: "قم بتحميل الأطر المرجعية والنماذج الرسمية للتحضير للتقييم بحرية.",
            docs_card1: "دليل التقييم الذاتي",
            docs_card2: "المرجع الوطني للجودة",
            docs_card3: "الملاحق والنماذج",
            dl_fr: "Télécharger (FR)",
            dl_ar: "تحميل (AR)",
            footer_about: "الوكالة الوطنية لتقييم وضمان جودة التعليم العالي والبحث العلمي.",
            footer_links: "روابط سريعة",
            footer_contact: "اتصل بنا",
            footer_rights: "© 2026 الوكالة الوطنية لتقييم وضمان الجودة - قسم تقييم المؤسسات. جميع الحقوق محفوظة.",
            login_title: "تسجيل الدخول",
            login_email: "البريد الإلكتروني",
            login_pwd: "كلمة المرور",
            login_forgot: "هل نسيت كلمة المرور؟",
            login_remember: "تذكرني",
            login_btn: "دخول",
            login_loading: "جاري الاتصال...",
            login_robot: "أنا لست روبوت"
        }
    };

    const t = translations[activeLang];

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 50);
            setOffsetY(window.scrollY * 0.4);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const chartData = [
        { year: '2021', [t.public_etab]: 10, [t.prive_etab]: 3 },
        { year: '2022', [t.public_etab]: 9,  [t.prive_etab]: 3 },
        { year: '2023', [t.public_etab]: 0,  [t.prive_etab]: 0 },
        { year: '2024', [t.public_etab]: 21, [t.prive_etab]: 25 },
        { year: '2025', [t.public_etab]: 50, [t.prive_etab]: 0 },
    ];

    const universities = [
        { name: "Université Mohammed V – Rabat", link: "http://www.um5.ac.ma/um5/" },
        { name: "Université Hassan II – Casablanca", link: "http://www.uh2c.ac.ma/" },
        { name: "Université Cadi Ayyad – Marrakech", link: "http://www.uca.ma" },
        { name: "Université Sidi Mohammed Ben Abdellah – Fès", link: "http://www.usmba.ac.ma/" },
        { name: "Université Al Quaraouiyine – Fès", link: "http://www.uaq.ma" },
        { name: "Université Moulay Ismail – Meknès", link: "http://www.umi.ac.ma" },
        { name: "Université Hassan Premier – Settat", link: "http://www.uh1.ac.ma/" },
        { name: "Université Abdelmalek Essaadi – Tétouan", link: "http://www.uae.ma/" },
        { name: "Université Ibn Zohr – Agadir", link: "http://www.uiz.ac.ma" },
        { name: "Université Chouaïb Doukkali - El Jadida", link: "http://www.ucd.ac.ma" },
        { name: "Université Mohammed Premier – Oujda", link: "http://www.ump.ma/" },
        { name: "Université Ibn Tofail – Kénitra", link: "http://www.univ-ibntofail.ac.ma" },
        { name: "Université Sultan Moulay Slimane – Béni Mellal", link: "http://www.usms.ac.ma/" },
        { name: "Université Al Akhawayn – Ifrane", link: "http://www.aui.ma/en/" },
    ];

    const docs = [
        { title: t.docs_card1, file: "guide_auto.pdf" },
        { title: t.docs_card2, file: "referentiel.pdf" },
        { title: t.docs_card3, file: "annexes.pdf" },
    ];

    return (
        <div dir={activeLang === 'AR' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth relative">
            <Head title="ANEAQ - Portail de l'Évaluation Institutionnelle" />

            {/* --- NAVBAR --- */}
            <nav className={`fixed w-full z-40 transition-all duration-500 ${
                isSticky ? 'bg-white shadow-xl py-3' : 'bg-transparent py-5 text-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 md:gap-5 group relative z-50">
                        <img src="/images/logo-ministere.png" alt="Ministère" className="h-10 sm:h-14 object-contain bg-white rounded-lg p-1.5 shadow-lg hover:scale-105 transition-transform" onError={(e) => e.target.style.display='none'} />
                        <div className={`h-8 sm:h-12 w-px ${isSticky ? 'bg-slate-300' : 'bg-white/40'} hidden sm:block`}></div>
                        <img src="/images/logo-aneaq.png" alt="ANEAQ" className="h-10 sm:h-14 object-contain bg-white rounded-lg p-1.5 shadow-lg hover:scale-105 transition-transform" onError={(e) => {e.target.onerror = null; e.target.outerHTML = '<div class="bg-blue-600 p-2 rounded-xl"><ShieldCheck class="text-white w-6 h-6" /></div>'}} />
                    </Link>
                    
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
                        <a href="#about" className={`transition ${isSticky ? 'hover:text-blue-600 text-slate-700' : 'hover:text-blue-200 text-white drop-shadow-md'}`}>{t.nav_about}</a>
                        
                        <div className="relative group cursor-pointer py-2">
                            <span className={`flex items-center gap-1 transition ${isSticky ? 'hover:text-blue-600 text-slate-700' : 'hover:text-blue-200 text-white drop-shadow-md'}`}>
                                {t.nav_universities} <ChevronDown size={16} />
                            </span>
                            <div className={`absolute hidden group-hover:block bg-white text-slate-800 shadow-2xl rounded-2xl p-5 w-[650px] top-full ${activeLang === 'AR' ? '-right-20' : '-left-20'} border border-slate-100`}>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                    {universities.map((u, i) => (
                                        <a key={i} href={u.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 hover:bg-blue-50 rounded-xl text-sm transition font-medium border-b border-slate-50 last:border-0 hover:text-blue-700 group/link">
                                            <span className="truncate pr-2">{u.name}</span>
                                            <ExternalLink size={14} className="text-blue-300 group-hover/link:text-blue-600 shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <a href="#download" className={`transition ${isSticky ? 'hover:text-blue-600 text-slate-700' : 'hover:text-blue-200 text-white drop-shadow-md'}`}>{t.nav_guides}</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setActiveLang(activeLang === 'FR' ? 'AR' : 'FR')}
                            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition shadow-sm ${isSticky ? 'border-slate-300 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600' : 'border-white text-white hover:bg-white hover:text-blue-950 drop-shadow-md'}`}
                        >
                            <Globe size={16} /> {activeLang === 'FR' ? 'العربية' : 'Français'}
                        </button>

                        {auth.user ? (
                            <Link href={route('dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95">
                                {t.nav_dashboard}
                            </Link>
                        ) : (
                            <button 
                                onClick={() => setShowLoginModal(true)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${isSticky ? 'bg-blue-950 text-white hover:bg-blue-900' : 'bg-white text-blue-950 hover:bg-slate-100'}`}
                            >
                                <LogIn size={18} /> {t.nav_login}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* 1. --- HERO SECTION (pt-[9rem]) --- */}
            <section className="relative pt-[9rem] pb-40 overflow-hidden min-h-[85vh] flex items-center bg-blue-950">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ 
                        backgroundImage: "url('/images/hero-bg.jpeg')", 
                        transform: `translateY(${offsetY}px)`, 
                        willChange: 'transform' 
                    }}
                ></div>
                <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[3px] z-0"></div>

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10 w-full">
                    <span className="inline-block px-5 py-2 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-sm shadow-xl">
                        {t.hero_badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-white drop-shadow-2xl">
                        {t.hero_title1} <br/> <span className="text-blue-300">{t.hero_title2}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-50 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-md">
                        {t.hero_desc}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#download" className="bg-white text-blue-950 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 hover:scale-105">
                            {t.hero_btn1} <FileText size={20} />
                        </a>
                        <a href="#about" className="bg-blue-600/80 hover:bg-blue-600 text-white backdrop-blur-md px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 border border-white/20 hover:scale-105">
                            {t.hero_btn2}
                        </a>
                    </div>
                </div>
            </section>

            {/* 2. --- ABOUT SECTION (Mission ANEAQ) --- */}
            <section id="about" className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="relative order-2 md:order-1">
                        <div className="aspect-[4/3] bg-white rounded-[3rem] overflow-hidden flex items-center justify-center border-8 border-slate-50 shadow-2xl relative p-12 md:p-16">
                             <img 
                                 src="/images/logo-aneaq.png" 
                                 alt="Logo ANEAQ" 
                                 className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700" 
                                 onError={(e) => {e.target.onerror = null; e.target.outerHTML = '<div class="text-slate-300 font-bold text-2xl">Logo ANEAQ</div>'}}
                             />
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">{t.about_badge}</span>
                        <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-6 leading-tight">{t.about_title}</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-10">{t.about_desc}</p>
                        <div className="space-y-8">
                            {[
                                { t: t.about_p1_title, d: t.about_p1_desc },
                                { t: t.about_p2_title, d: t.about_p2_desc },
                                { t: t.about_p3_title, d: t.about_p3_desc }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-blue-950 text-lg mb-1">{item.t}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. --- DOWNLOAD CENTER (Documentation PDF) --- */}
            <section id="download" className="py-24 md:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 md:mb-20">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">{t.docs_badge}</span>
                        <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-6">{t.docs_title}</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t.docs_desc}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {docs.map((doc, i) => (
                            <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col h-full">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"><FileText size={32} /></div>
                                <h3 className="text-2xl font-bold text-blue-950 mb-8 flex-grow">{doc.title}</h3>
                                <div className="flex flex-col gap-3 mt-auto">
                                    <a href={`/docs/${doc.file}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-blue-950 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-950/20 w-full"><Download size={18} /> {t.dl_fr}</a>
                                    <a href={`/docs/ar_${doc.file}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition w-full"><Download size={18} /> {t.dl_ar}</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. --- SECTION STATS + GRAPHIQUE --- */}
            <section id="stats" className="py-24 md:py-32 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                            {[
                                { label: t.stat_etab, val: "100", icon: <ShieldCheck size={28} />, color: "text-blue-600", bg: "bg-blue-50" },
                                { label: t.stat_exp, val: "242+", icon: <Users size={28} />, color: "text-indigo-600", bg: "bg-indigo-50" },
                                { label: t.stat_rap, val: "450+", icon: <FileText size={28} />, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { label: t.stat_taux, val: "88%", icon: <BarChart3 size={28} />, color: "text-sky-600", bg: "bg-sky-50" }
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-6 hover:scale-105 transition-transform duration-300">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
                                    <div>
                                        <div className="text-3xl font-black text-slate-800 mb-1">{s.val}</div>
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col">
                            <h3 className="text-xl font-bold text-blue-950 mb-2 flex items-center gap-3">
                                <BarChart3 className="text-blue-600" /> {t.chart_title}
                            </h3>
                            <p className="text-sm text-slate-400 mb-8 px-8">Répartition annuelle des missions d'évaluation</p>
                            <div className="flex-grow w-full min-h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barGap={8}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '14px', fontWeight: '500', color: '#475569' }} />
                                        <Bar dataKey={t.public_etab} fill="#2563eb" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                        <Bar dataKey={t.prive_etab} fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. --- FOOTER --- */}
            <footer className="bg-blue-950 text-white pt-20 md:pt-24 pb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/10">
                        <div className="lg:col-span-1">
                            <span className="text-3xl font-black tracking-tighter mb-6 block flex items-center gap-2"><img src="/images/logo-aneaq.png" alt="ANEAQ" className="h-10 bg-white rounded p-1" onError={(e) => e.target.style.display='none'} /> ANEAQ</span>
                            <p className="text-blue-200/70 text-sm leading-relaxed">{t.footer_about}</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-lg text-white">{t.footer_links}</h4>
                            <ul className="space-y-4 text-blue-200/70 text-sm font-medium">
                                <li><a href="#about" className="hover:text-white transition">{t.nav_about}</a></li>
                                <li><a href="#download" className="hover:text-white transition">{t.nav_guides}</a></li>
                                <li><button onClick={() => setShowLoginModal(true)} className="hover:text-white transition">{t.nav_login}</button></li>
                            </ul>
                        </div>
                        <div className="lg:col-span-2">
                            <h4 className="font-bold mb-6 text-lg text-white">{t.footer_contact}</h4>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4 text-sm text-blue-200/70"><MapPin className="text-blue-400 shrink-0 mt-0.5" size={20} /><span className="leading-relaxed">05 Street Abou Inan Hassan,<br/>Rabat – Morrooco</span></div>
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70"><Mail className="text-blue-400 shrink-0" size={20} /><a href="mailto:contact@aneaq.ma" className="hover:text-white transition">contact@aneaq.ma</a></div>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70"><Phone className="text-blue-400 shrink-0" size={20} /><span dir="ltr">+212 537 27 16 08</span></div>
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70"><Printer className="text-blue-400 shrink-0" size={20} /><span dir="ltr">+212 537 27 16 07</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-xs font-semibold text-blue-200/40 uppercase tracking-wider"><p>{t.footer_rights}</p></div>
                </div>
            </footer>

            {/* --- POP-UP DE CONNEXION (MODAL) --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLoginModal(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all">
                            <X size={20} />
                        </button>
                        <div className="text-center mb-8">
                            <img src="/images/logo-aneaq.png" alt="Logo" className="h-16 mx-auto mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100" onError={(e) => e.target.style.display='none'} />
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.login_title}</h2>
                        </div>
                        <form onSubmit={submitLogin} className="space-y-5 text-left">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.login_email}</label>
                                <input type="email" name="email" value={data.email} className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white`} placeholder="nom@exemple.com" autoFocus onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-red-500 text-xs font-semibold mt-2">{errors.email}</p>}
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700">{t.login_pwd}</label>
                                    <Link href={route('password.request')} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">{t.login_forgot}</Link>
                                </div>
                                <input type="password" name="password" value={data.password} className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white`} placeholder="••••••••" onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <p className="text-red-500 text-xs font-semibold mt-2">{errors.password}</p>}
                            </div>
                            <div className="flex flex-col gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm font-medium text-slate-600">{t.login_remember}</span>
                                </label>
                                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-4 shadow-sm">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    <span className="text-sm font-medium text-slate-700 flex-grow">{t.login_robot}</span>
                                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-7" />
                                </div>
                            </div>
                            <button type="submit" disabled={processing} className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 transition-all transform active:scale-[0.98] mt-2 ${processing && 'opacity-75 cursor-not-allowed'}`}>
                                {processing ? t.login_loading : t.login_btn}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}