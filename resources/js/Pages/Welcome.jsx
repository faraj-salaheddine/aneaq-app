import { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { 
    Download, ExternalLink, ChevronDown, FileText, 
    ShieldCheck, Users, BarChart3, MapPin, 
    Phone, Mail, Printer, Globe, LogIn
} from 'lucide-react';

export default function Welcome({ auth }) {
    const [isSticky, setIsSticky] = useState(false);
    const [activeLang, setActiveLang] = useState('FR');

    // Dictionnaire de traduction FR / AR
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
            footer_rights: "© 2026 ANEAQ - Division de l'Évaluation des Établissements. Tous droits réservés."
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
            footer_rights: "© 2026 الوكالة الوطنية لتقييم وضمان الجودة - قسم تقييم المؤسسات. جميع الحقوق محفوظة."
        }
    };

    const t = translations[activeLang];

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const universities = [
        { name: "Université Mohammed V – Rabat", link: "http://www.um5.ac.ma/um5/" },
        { name: "Université Hassan II – Casablanca", link: "http://www.uh2c.ac.ma/" },
        { name: "Université Cadi Ayyad – Marrakech", link: "http://www.uca.ma" },
        { name: "Université Al Quaraouiyine – Fès", link: "http://www.uaq.ma" },
        { name: "Université Ibn Zohr – Agadir", link: "http://www.uiz.ac.ma" },
        { name: "Université Al Akhawayn – Ifrane", link: "http://www.aui.ma/en/" },
    ];

    const docs = [
        { title: t.docs_card1, file: "guide_auto.pdf" },
        { title: t.docs_card2, file: "referentiel.pdf" },
        { title: t.docs_card3, file: "annexes.pdf" },
    ];

    return (
        <div dir={activeLang === 'AR' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
            <Head title="ANEAQ - Portail de l'Évaluation Institutionnelle" />

            {/* --- NAVBAR --- */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${
                isSticky ? 'bg-white shadow-xl py-3' : 'bg-blue-950 py-5 text-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    
                    {/* Logos Ministère & ANEAQ */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <img src="/images/logo-ministere.png" alt="Ministère" className="h-12 hidden sm:block bg-white rounded p-1" onError={(e) => e.target.style.display='none'} />
                        <div className="h-10 w-px bg-slate-300 hidden sm:block opacity-30"></div>
                        <img src="/images/logo-aneaq.png" alt="ANEAQ" className="h-12 bg-white rounded p-1" onError={(e) => {e.target.onerror = null; e.target.outerHTML = '<div class="bg-blue-600 p-2 rounded-xl"><ShieldCheck class="text-white w-6 h-6" /></div>'}} />
                        <span className={`text-2xl font-black tracking-tighter ${isSticky ? 'text-blue-950' : 'text-white'}`}>
                            ANEAQ
                        </span>
                    </Link>
                    
                    {/* Menu Central */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
                        <a href="#about" className="hover:text-blue-500 transition">{t.nav_about}</a>
                        
                        <div className="relative group cursor-pointer py-2">
                            <span className="flex items-center gap-1 hover:text-blue-500 transition">
                                {t.nav_universities} <ChevronDown size={16} />
                            </span>
                            <div className={`absolute hidden group-hover:block bg-white text-slate-800 shadow-2xl rounded-2xl p-3 w-80 top-full ${activeLang === 'AR' ? '-right-10' : '-left-10'} border border-slate-100`}>
                                <div className="grid gap-1">
                                    {universities.map((u, i) => (
                                        <a key={i} href={u.link} target="_blank" rel="noopener noreferrer" 
                                           className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl text-sm transition font-medium border-b border-slate-50 last:border-0">
                                            {u.name} <ExternalLink size={14} className="text-blue-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <a href="#download" className="hover:text-blue-500 transition">{t.nav_guides}</a>
                    </div>

                    {/* Actions de droite */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setActiveLang(activeLang === 'FR' ? 'AR' : 'FR')}
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border border-current hover:bg-blue-600 hover:border-blue-600 hover:text-white transition shadow-sm"
                        >
                            <Globe size={16} /> {activeLang === 'FR' ? 'العربية' : 'Français'}
                        </button>

                        {auth.user ? (
                            <Link href={route('dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95">
                                {t.nav_dashboard}
                            </Link>
                        ) : (
                            <Link href={route('login')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                                isSticky ? 'bg-blue-950 text-white hover:bg-blue-900' : 'bg-white text-blue-950 hover:bg-slate-100'
                            }`}>
                                <LogIn size={18} /> {t.nav_login}
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-48 pb-32 bg-blue-950 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <span className="inline-block px-5 py-2 bg-blue-800/50 text-blue-200 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-blue-700">
                        {t.hero_badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                        {t.hero_title1} <br/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                            {t.hero_title2}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100/80 max-w-3xl mx-auto mb-12 leading-relaxed">
                        {t.hero_desc}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#download" className="bg-white text-blue-950 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3">
                            {t.hero_btn1} <FileText size={20} />
                        </a>
                        <a href="#about" className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 border border-blue-600">
                            {t.hero_btn2}
                        </a>
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="py-12 -mt-16 relative z-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: t.stat_etab, val: "159", icon: <ShieldCheck size={28} /> },
                            { label: t.stat_exp, val: "120+", icon: <Users size={28} /> },
                            { label: t.stat_rap, val: "450+", icon: <FileText size={28} /> },
                            { label: t.stat_taux, val: "88%", icon: <BarChart3 size={28} /> }
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-2xl shadow-blue-900/5 border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">{s.icon}</div>
                                <div className="text-4xl font-black text-blue-950 mb-2">{s.val}</div>
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <section id="about" className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="relative order-2 md:order-1">
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-[3rem] overflow-hidden shadow-inner flex items-center justify-center border-8 border-white shadow-2xl">
                            {/* Optionnel : image de fond ici */}
                             <ShieldCheck size={140} className="text-slate-300 drop-shadow-sm" />
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">{t.about_badge}</span>
                        <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-6 leading-tight">
                            {t.about_title}
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-10">
                            {t.about_desc}
                        </p>
                        <div className="space-y-8">
                            {[
                                { t: t.about_p1_title, d: t.about_p1_desc },
                                { t: t.about_p2_title, d: t.about_p2_desc },
                                { t: t.about_p3_title, d: t.about_p3_desc }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
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

            {/* --- DOWNLOAD CENTER --- */}
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
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-blue-950 mb-8 flex-grow">{doc.title}</h3>
                                <div className="flex flex-col gap-3 mt-auto">
                                    <a href={`/docs/${doc.file}`} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center justify-center gap-3 bg-blue-950 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-950/20 w-full">
                                        <Download size={18} /> {t.dl_fr}
                                    </a>
                                    <a href={`/docs/ar_${doc.file}`} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center justify-center gap-3 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition w-full">
                                        <Download size={18} /> {t.dl_ar}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-blue-950 text-white pt-20 md:pt-24 pb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/10">
                        <div className="lg:col-span-1">
                            <span className="text-3xl font-black tracking-tighter mb-6 block flex items-center gap-2">
                                <img src="/images/logo-aneaq.png" alt="ANEAQ" className="h-10 bg-white rounded p-1" onError={(e) => e.target.style.display='none'} /> ANEAQ
                            </span>
                            <p className="text-blue-200/70 text-sm leading-relaxed">{t.footer_about}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-lg text-white">{t.footer_links}</h4>
                            <ul className="space-y-4 text-blue-200/70 text-sm font-medium">
                                <li><a href="#about" className="hover:text-white transition">{t.nav_about}</a></li>
                                <li><a href="#download" className="hover:text-white transition">{t.nav_guides}</a></li>
                                <li><Link href={route('login')} className="hover:text-white transition">{t.nav_login}</Link></li>
                            </ul>
                        </div>

                        {/* Coordonnées Fixées */}
                        <div className="lg:col-span-2">
                            <h4 className="font-bold mb-6 text-lg text-white">{t.footer_contact}</h4>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4 text-sm text-blue-200/70">
                                        <MapPin className="text-blue-400 shrink-0 mt-0.5" size={20} />
                                        <span className="leading-relaxed">05 Street Abou Inan Hassan,<br/>Rabat – Morrooco</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Mail className="text-blue-400 shrink-0" size={20} />
                                        <a href="mailto:contact@aneaq.ma" className="hover:text-white transition">contact@aneaq.ma</a>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Phone className="text-blue-400 shrink-0" size={20} />
                                        <span dir="ltr">+212 537 27 16 08</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Printer className="text-blue-400 shrink-0" size={20} />
                                        <span dir="ltr">+212 537 27 16 07</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs font-semibold text-blue-200/40 uppercase tracking-wider">
                        <p>{t.footer_rights}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}