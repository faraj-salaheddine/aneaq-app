import { useState, useEffect } from 'react';
import { Link, Head, useForm, usePage } from '@inertiajs/react';
import {
    Download,
    ExternalLink,
    ChevronDown,
    FileText,
    ShieldCheck,
    Users,
    BarChart3,
    MapPin,
    Phone,
    Mail,
    Printer,
    Globe,
    LogIn,
    LogOut,
    X,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export default function Welcome({ auth }) {
    const { props } = usePage();

    const currentUser = props?.auth?.user || auth?.user || null;

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
            nav_dashboard: "Dashboard DEE",
            nav_dashboard_si: "Dashboard SI",
            nav_dashboard_expert: "Espace Expert",
            nav_dashboard_etablissement: "Espace Établissement",
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
            login_robot: "Je ne suis pas un robot",
        },
        AR: {
            nav_about: "حول الوكالة",
            nav_universities: "الجامعات",
            nav_guides: "الدلائل",
            nav_login: "تسجيل الدخول",
            nav_dashboard: "لوحة قيادة DEE",
            nav_dashboard_si: "لوحة قيادة SI",
            nav_dashboard_expert: "فضاء الخبير",
            nav_dashboard_etablissement: "فضاء المؤسسة",
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
            login_robot: "أنا لست روبوت",
        },
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
        { year: '2022', [t.public_etab]: 9, [t.prive_etab]: 3 },
        { year: '2023', [t.public_etab]: 0, [t.prive_etab]: 0 },
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

    const dashboardUrl = (() => {
        if (!currentUser) {
            return '/login';
        }

        if (currentUser.role === 'admin_dee') {
            return '/dee/dashboard';
        }

        if (currentUser.role === 'si' || currentUser.role === 'admin_si') {
            return '/si/dashboard';
        }

        if (currentUser.role === 'expert') {
            return '/expert/dashboard';
        }

        if (currentUser.role === 'etablissement') {
            return '/etablissement/dashboard';
        }

        return '/dashboard';
    })();

    const dashboardLabel = (() => {
        if (!currentUser) {
            return t.nav_login;
        }

        if (currentUser.role === 'admin_dee') {
            return t.nav_dashboard;
        }

        if (currentUser.role === 'si' || currentUser.role === 'admin_si') {
            return t.nav_dashboard_si;
        }

        if (currentUser.role === 'expert') {
            return t.nav_dashboard_expert;
        }

        if (currentUser.role === 'etablissement') {
            return t.nav_dashboard_etablissement;
        }

        return currentUser.name || 'Dashboard';
    })();

    return (
        <div
            dir={activeLang === 'AR' ? 'rtl' : 'ltr'}
            className="relative min-h-screen scroll-smooth bg-slate-50 font-sans text-slate-900"
        >
            <Head title="ANEAQ - Portail de l'Évaluation Institutionnelle" />

            <nav
                className={`fixed z-40 w-full transition-all duration-500 ${
                    isSticky ? 'bg-white py-3 shadow-xl' : 'bg-transparent py-5 text-white'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="group relative z-50 flex items-center gap-3 md:gap-5">
                        <img
                            src="/images/logo-ministere.png"
                            alt="Ministère"
                            className="h-10 rounded-lg bg-white p-1.5 object-contain shadow-lg transition-transform hover:scale-105 sm:h-14"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />

                        <div className={`hidden h-8 w-px sm:block ${isSticky ? 'bg-slate-300' : 'bg-white/40'}`} />

                        <img
                            src="/images/logo-aneaq.png"
                            alt="ANEAQ"
                            className="h-10 rounded-lg bg-white p-1.5 object-contain shadow-lg transition-transform hover:scale-105 sm:h-14"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </Link>

                    <div className="hidden items-center gap-8 text-sm font-semibold lg:flex">
                        <a
                            href="#about"
                            className={`transition ${
                                isSticky ? 'text-slate-700 hover:text-blue-600' : 'text-white drop-shadow-md hover:text-blue-200'
                            }`}
                        >
                            {t.nav_about}
                        </a>

                        <div className="group relative cursor-pointer py-2">
                            <span
                                className={`flex items-center gap-1 transition ${
                                    isSticky ? 'text-slate-700 hover:text-blue-600' : 'text-white drop-shadow-md hover:text-blue-200'
                                }`}
                            >
                                {t.nav_universities}
                                <ChevronDown size={16} />
                            </span>

                            <div
                                className={`absolute top-full hidden w-[650px] rounded-2xl border border-slate-100 bg-white p-5 text-slate-800 shadow-2xl group-hover:block ${
                                    activeLang === 'AR' ? '-right-20' : '-left-20'
                                }`}
                            >
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                    {universities.map((u, i) => (
                                        <a
                                            key={i}
                                            href={u.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link flex items-center justify-between rounded-xl border-b border-slate-50 p-2.5 text-sm font-medium transition last:border-0 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <span className="truncate pr-2">
                                                {u.name}
                                            </span>

                                            <ExternalLink
                                                size={14}
                                                className="shrink-0 text-blue-300 group-hover/link:text-blue-600"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <a
                            href="#download"
                            className={`transition ${
                                isSticky ? 'text-slate-700 hover:text-blue-600' : 'text-white drop-shadow-md hover:text-blue-200'
                            }`}
                        >
                            {t.nav_guides}
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setActiveLang(activeLang === 'FR' ? 'AR' : 'FR')}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold shadow-sm transition ${
                                isSticky
                                    ? 'border-slate-300 text-slate-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white'
                                    : 'border-white text-white drop-shadow-md hover:bg-white hover:text-blue-950'
                            }`}
                        >
                            <Globe size={16} />
                            {activeLang === 'FR' ? 'العربية' : 'Français'}
                        </button>

                        {currentUser ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={dashboardUrl}
                                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95"
                                >
                                    {dashboardLabel}
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    title="Se déconnecter"
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-all active:scale-95 ${
                                        isSticky
                                            ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700'
                                            : 'bg-red-600/90 shadow-red-900/20 hover:bg-red-700'
                                    }`}
                                >
                                    <LogOut size={18} />
                                </Link>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowLoginModal(true)}
                                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                                    isSticky
                                        ? 'bg-blue-950 text-white hover:bg-blue-900'
                                        : 'bg-white text-blue-950 hover:bg-slate-100'
                                }`}
                            >
                                <LogIn size={18} />
                                {t.nav_login}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-blue-950 pb-40 pt-[9rem]">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/aneaq-bg.jpg')",
                        transform: `translateY(${offsetY}px)`,
                        willChange: 'transform',
                    }}
                />

                <div className="absolute inset-0 z-0 bg-blue-950/70 backdrop-blur-[3px]" />

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center">
                    <span className="mb-8 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-xl backdrop-blur-sm">
                        {t.hero_badge}
                    </span>

                    <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-2xl md:text-7xl">
                        {t.hero_title1}
                        <br />
                        <span className="text-blue-300">
                            {t.hero_title2}
                        </span>
                    </h1>

                    <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-blue-50 drop-shadow-md md:text-xl">
                        {t.hero_desc}
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <a
                            href="#download"
                            className="flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-blue-950 shadow-xl transition-all hover:scale-105 hover:bg-blue-50"
                        >
                            {t.hero_btn1}
                            <FileText size={20} />
                        </a>

                        <a
                            href="#about"
                            className="flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-blue-600/80 px-8 py-4 font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-blue-600"
                        >
                            {t.hero_btn2}
                        </a>
                    </div>
                </div>
            </section>

            <section id="about" className="bg-white py-24 md:py-32">
                <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 md:grid-cols-2 md:gap-24">
                    <div className="relative order-2 md:order-1">
                        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[3rem] border-8 border-slate-50 bg-white p-12 shadow-2xl md:p-16">
                            <img
                                src="/images/logo-aneaq.png"
                                alt="Logo ANEAQ"
                                className="h-full w-full object-contain drop-shadow-xl transition-transform duration-700 hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-blue-600">
                            {t.about_badge}
                        </span>

                        <h2 className="mb-6 text-3xl font-black leading-tight text-blue-950 md:text-4xl">
                            {t.about_title}
                        </h2>

                        <p className="mb-10 text-lg leading-relaxed text-slate-600">
                            {t.about_desc}
                        </p>

                        <div className="space-y-8">
                            {[
                                { t: t.about_p1_title, d: t.about_p1_desc },
                                { t: t.about_p2_title, d: t.about_p2_desc },
                                { t: t.about_p3_title, d: t.about_p3_desc },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <ShieldCheck size={24} />
                                    </div>

                                    <div>
                                        <h4 className="mb-1 text-lg font-bold text-blue-950">
                                            {item.t}
                                        </h4>

                                        <p className="text-sm leading-relaxed text-slate-500">
                                            {item.d}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="download" className="bg-slate-50 py-24 md:py-32">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-16 text-center md:mb-20">
                        <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-blue-600">
                            {t.docs_badge}
                        </span>

                        <h2 className="mb-6 text-3xl font-black text-blue-950 md:text-4xl">
                            {t.docs_title}
                        </h2>

                        <p className="mx-auto max-w-2xl text-lg text-slate-500">
                            {t.docs_desc}
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
                        {docs.map((doc, i) => (
                            <div
                                key={i}
                                className="group flex h-full flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl md:p-10"
                            >
                                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                                    <FileText size={32} />
                                </div>

                                <h3 className="mb-8 flex-grow text-2xl font-bold text-blue-950">
                                    {doc.title}
                                </h3>

                                <div className="mt-auto flex flex-col gap-3">
                                    <a
                                        href={`/docs/${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-950 py-4 font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-800"
                                    >
                                        <Download size={18} />
                                        {t.dl_fr}
                                    </a>

                                    <a
                                        href={`/docs/ar_${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-100 py-4 font-bold text-slate-700 transition hover:bg-slate-200"
                                    >
                                        <Download size={18} />
                                        {t.dl_ar}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="stats" className="relative z-20 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-10 lg:grid-cols-3">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
                            {[
                                {
                                    label: t.stat_etab,
                                    val: '100',
                                    icon: <ShieldCheck size={28} />,
                                    color: 'text-blue-600',
                                    bg: 'bg-blue-50',
                                },
                                {
                                    label: t.stat_exp,
                                    val: '242+',
                                    icon: <Users size={28} />,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                },
                                {
                                    label: t.stat_rap,
                                    val: '450+',
                                    icon: <FileText size={28} />,
                                    color: 'text-emerald-600',
                                    bg: 'bg-emerald-50',
                                },
                                {
                                    label: t.stat_taux,
                                    val: '88%',
                                    icon: <BarChart3 size={28} />,
                                    color: 'text-sky-600',
                                    bg: 'bg-sky-50',
                                },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50 transition-transform duration-300 hover:scale-105"
                                >
                                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${s.bg} ${s.color}`}>
                                        {s.icon}
                                    </div>

                                    <div>
                                        <div className="mb-1 text-3xl font-black text-slate-800">
                                            {s.val}
                                        </div>

                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            {s.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50 lg:col-span-2">
                            <h3 className="mb-2 flex items-center gap-3 text-xl font-bold text-blue-950">
                                <BarChart3 className="text-blue-600" />
                                {t.chart_title}
                            </h3>

                            <p className="mb-8 px-8 text-sm text-slate-400">
                                Répartition annuelle des missions d&apos;évaluation
                            </p>

                            <div className="min-h-[350px] w-full flex-grow">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                        barGap={8}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                                        <XAxis
                                            dataKey="year"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                                            dy={15}
                                        />

                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />

                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{
                                                borderRadius: '1rem',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                fontWeight: 'bold',
                                            }}
                                        />

                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{
                                                paddingBottom: '20px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#475569',
                                            }}
                                        />

                                        <Bar
                                            dataKey={t.public_etab}
                                            fill="#2563eb"
                                            radius={[6, 6, 0, 0]}
                                            animationDuration={1500}
                                        />

                                        <Bar
                                            dataKey={t.prive_etab}
                                            fill="#10b981"
                                            radius={[6, 6, 0, 0]}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-blue-950 pb-8 pt-20 text-white md:pt-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-16 grid gap-12 border-b border-white/10 pb-16 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <span className="mb-6 flex items-center gap-2 text-3xl font-black tracking-tighter">
                                <img
                                    src="/images/logo-aneaq.png"
                                    alt="ANEAQ"
                                    className="h-10 rounded bg-white p-1"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                ANEAQ
                            </span>

                            <p className="text-sm leading-relaxed text-blue-200/70">
                                {t.footer_about}
                            </p>
                        </div>

                        <div>
                            <h4 className="mb-6 text-lg font-bold text-white">
                                {t.footer_links}
                            </h4>

                            <ul className="space-y-4 text-sm font-medium text-blue-200/70">
                                <li>
                                    <a href="#about" className="transition hover:text-white">
                                        {t.nav_about}
                                    </a>
                                </li>

                                <li>
                                    <a href="#download" className="transition hover:text-white">
                                        {t.nav_guides}
                                    </a>
                                </li>

                                <li>
                                    {currentUser ? (
                                        <Link
                                            href={dashboardUrl}
                                            className="transition hover:text-white"
                                        >
                                            {dashboardLabel}
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginModal(true)}
                                            className="transition hover:text-white"
                                        >
                                            {t.nav_login}
                                        </button>
                                    )}
                                </li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <h4 className="mb-6 text-lg font-bold text-white">
                                {t.footer_contact}
                            </h4>

                            <div className="grid gap-8 sm:grid-cols-2">
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4 text-sm text-blue-200/70">
                                        <MapPin className="mt-0.5 shrink-0 text-blue-400" size={20} />
                                        <span className="leading-relaxed">
                                            05 Street Abou Inan Hassan,
                                            <br />
                                            Rabat – Morocco
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Mail className="shrink-0 text-blue-400" size={20} />
                                        <a
                                            href="mailto:contact@aneaq.ma"
                                            className="transition hover:text-white"
                                        >
                                            contact@aneaq.ma
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Phone className="shrink-0 text-blue-400" size={20} />
                                        <span dir="ltr">+212 537 27 16 08</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Printer className="shrink-0 text-blue-400" size={20} />
                                        <span dir="ltr">+212 537 27 16 07</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs font-semibold uppercase tracking-wider text-blue-200/40">
                        <p>{t.footer_rights}</p>
                    </div>
                </div>
            </footer>

            {showLoginModal && !currentUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <button
                        type="button"
                        aria-label="Fermer"
                        className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowLoginModal(false)}
                    />

                    <div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl duration-200 md:p-10">
                        <button
                            type="button"
                            onClick={() => setShowLoginModal(false)}
                            className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-700"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8 text-center">
                            <img
                                src="/images/logo-aneaq.png"
                                alt="Logo"
                                className="mx-auto mb-4 h-16 rounded-xl border border-slate-100 bg-slate-50 p-2"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />

                            <h2 className="text-2xl font-black tracking-tight text-slate-800">
                                {t.login_title}
                            </h2>
                        </div>

                        <form onSubmit={submitLogin} className="space-y-5 text-left">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    {t.login_email}
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`w-full rounded-xl border px-4 py-3 transition-all focus:ring ${
                                        errors.email
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-blue-200'
                                    }`}
                                    placeholder="nom@exemple.com"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                />

                                {errors.email && (
                                    <p className="mt-2 text-xs font-semibold text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-bold text-slate-700">
                                        {t.login_pwd}
                                    </label>

                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
                                    >
                                        {t.login_forgot}
                                    </Link>
                                </div>

                                <input
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={`w-full rounded-xl border px-4 py-3 transition-all focus:ring ${
                                        errors.password
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-blue-200'
                                    }`}
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                />

                                {errors.password && (
                                    <p className="mt-2 text-xs font-semibold text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <span className="ml-2 text-sm font-medium text-slate-600">
                                        {t.login_remember}
                                    </span>
                                </label>

                                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <span className="flex-grow text-sm font-medium text-slate-700">
                                        {t.login_robot}
                                    </span>

                                    <img
                                        src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                                        alt="reCAPTCHA"
                                        className="w-7"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`mt-2 w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-700/40 active:scale-[0.98] ${
                                    processing ? 'cursor-not-allowed opacity-75' : ''
                                }`}
                            >
                                {processing ? t.login_loading : t.login_btn}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}