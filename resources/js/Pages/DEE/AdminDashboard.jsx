import { Head, Link, router, usePage } from '@inertiajs/react';
import DeeHeader from '@/Components/DEE/DeeHeader';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Globe,
    Layers3,
    LogOut,
    Mail,
    MapPin,
    Phone,
    Printer,
    ShieldCheck,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function AdminDashboard({ stats: dashboardStats = {} }) {
    const { props } = usePage();

    const auth = props?.auth || {};
    const user = auth?.user || null;

    const locale = props?.locale || 'fr';
    const isArabic = locale === 'ar';

    const counts = dashboardStats || props?.stats || {};

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const t = useMemo(() => {
        const fr = {
            about: 'À propos',
            universities: 'Universités',
            guides: 'Guides',
            dashboard: 'Dashboard DEE',
            backHome: "Retour à l'accueil",
            arabic: 'العربية',
            french: 'Français',
            profile: 'Voir le profil',
            logout: 'Se déconnecter',
            heroBadge: 'Plateforme ANEAQ - Évaluation des établissements',
            heroTitle: 'Pilotez l’évaluation des établissements dans un espace moderne et centralisé',
            heroDesc:
                'Gérez les vagues d’évaluation, les établissements, les experts, les dossiers et les visites dans une interface claire, professionnelle et adaptée au workflow ANEAQ.',
            createWave: "Créer une vague d'évaluation",
            discoverModules: 'Découvrir les modules',
            statsTitle: 'Chiffres clés',
            statsSubtitle: 'Une vue simple et rapide sur les principaux modules de gestion.',
            etablissements: 'Établissements',
            experts: 'Experts',
            vagues: 'Vagues',
            dossiers: 'Dossiers',
            visites: 'Visites',
            modulesTitle: 'Modules principaux',
            modulesSubtitle: 'Les briques essentielles de votre plateforme d’évaluation.',
            seeMore: 'Voir plus',
            openModule: 'Ouvrir le module',
            workflowTitle: 'Comment ça fonctionne',
            workflowSubtitle: 'Un processus simple en plusieurs étapes pour piloter les évaluations.',
            step1Title: 'Créer une vague',
            step1Desc: 'Créer la campagne d’évaluation et définir les informations générales.',
            step2Title: 'Sélectionner les établissements',
            step2Desc: 'Choisir les établissements concernés et générer leurs accès.',
            step3Title: 'Affecter les experts',
            step3Desc: 'Rechercher, sélectionner et affecter les experts aux dossiers.',
            step4Title: 'Suivre les dossiers',
            step4Desc: 'Gérer les statuts, les documents, les rapports et les dates de visite.',
            whyTitle: 'Pourquoi cette plateforme ?',
            whySubtitle: 'Une expérience plus claire, plus rapide et mieux structurée.',
            why1: 'Centralisation des données et des opérations',
            why2: 'Suivi clair des vagues, dossiers et visites',
            why3: 'Navigation rapide entre les modules',
            why4: 'Interface professionnelle cohérente',
            ctaTitle: 'Prêt à commencer une nouvelle campagne d’évaluation ?',
            ctaDesc:
                'Accédez directement à la création d’une vague ou ouvrez le dashboard administrateur pour continuer votre travail.',
            quickLinks: 'Liens rapides',
            adminDashboard: 'Dashboard DEE',
            contactUs: 'Contactez-nous',
            rights: '© 2026 ANEAQ - Division de l’Evaluation des Etablissements. Tous droits réservés.',
            adminSpace: 'Espace administrateur DEE',
        };

        const ar = {
            about: 'حول المنصة',
            universities: 'الجامعات',
            guides: 'الأدلة',
            dashboard: 'لوحة قيادة DEE',
            backHome: 'العودة إلى الرئيسية',
            arabic: 'العربية',
            french: 'Français',
            profile: 'الملف الشخصي',
            logout: 'تسجيل الخروج',
            heroBadge: 'منصة الوكالة الوطنية - تقييم المؤسسات',
            heroTitle: 'إدارة تقييم المؤسسات داخل فضاء حديث ومركزي',
            heroDesc:
                'قم بتدبير حملات التقييم، المؤسسات، الخبراء، الملفات والزيارات من خلال واجهة واضحة ومهنية ومتكاملة.',
            createWave: 'إنشاء حملة تقييم',
            discoverModules: 'اكتشف الوحدات',
            statsTitle: 'أرقام أساسية',
            statsSubtitle: 'نظرة سريعة ومبسطة على أهم وحدات التسيير.',
            etablissements: 'المؤسسات',
            experts: 'الخبراء',
            vagues: 'الحملات',
            dossiers: 'الملفات',
            visites: 'الزيارات',
            modulesTitle: 'الوحدات الرئيسية',
            modulesSubtitle: 'المرتكزات الأساسية لمنصة التقييم.',
            seeMore: 'عرض المزيد',
            openModule: 'فتح الوحدة',
            workflowTitle: 'كيف تعمل المنصة',
            workflowSubtitle: 'مسار بسيط على مراحل لتدبير عمليات التقييم.',
            step1Title: 'إنشاء حملة',
            step1Desc: 'إنشاء حملة التقييم وتحديد معلوماتها العامة.',
            step2Title: 'اختيار المؤسسات',
            step2Desc: 'اختيار المؤسسات المعنية وتوليد حسابات الولوج.',
            step3Title: 'تعيين الخبراء',
            step3Desc: 'البحث عن الخبراء واختيارهم وربطهم بالملفات.',
            step4Title: 'تتبع الملفات',
            step4Desc: 'تتبع الحالات والوثائق والتقارير وتواريخ الزيارات.',
            whyTitle: 'لماذا هذه المنصة؟',
            whySubtitle: 'تجربة أوضح وأسرع وأكثر تنظيماً.',
            why1: 'مركزة المعطيات والعمليات',
            why2: 'تتبع واضح للحملات والملفات والزيارات',
            why3: 'تنقل سريع بين الوحدات',
            why4: 'واجهة احترافية ومنسجمة',
            ctaTitle: 'هل أنت جاهز لبدء حملة تقييم جديدة؟',
            ctaDesc:
                'يمكنك الولوج مباشرة إلى إنشاء حملة جديدة أو فتح لوحة القيادة الإدارية لمتابعة عملك.',
            quickLinks: 'روابط سريعة',
            adminDashboard: 'لوحة إدارة DEE',
            contactUs: 'اتصل بنا',
            rights: '© 2026 الوكالة الوطنية - مديرية تقييم المؤسسات. جميع الحقوق محفوظة.',
            adminSpace: 'فضاء إدارة DEE',
        };

        return isArabic ? ar : fr;
    }, [isArabic]);

    const universities = [
        { name: 'Université Mohammed V – Rabat', link: 'http://www.um5.ac.ma/um5/' },
        { name: 'Université Hassan II – Casablanca', link: 'http://www.uh2c.ac.ma/' },
        { name: 'Université Cadi Ayyad – Marrakech', link: 'http://www.uca.ma' },
        { name: 'Université Sidi Mohammed Ben Abdellah – Fès', link: 'http://www.usmba.ac.ma/' },
        { name: 'Université Moulay Ismail – Meknès', link: 'http://www.umi.ac.ma' },
        { name: 'Université Abdelmalek Essaadi – Tétouan', link: 'http://www.uae.ma/' },
    ];

    const stats = [
        {
            label: t.etablissements,
            value: counts.etablissements ?? 0,
            icon: Building2,
            route: '/dee/etablissements',
        },
        {
            label: t.experts,
            value: counts.experts ?? 0,
            icon: Users,
            route: '/dee/experts',
        },
        {
            label: t.vagues,
            value: counts.vagues ?? counts.campagnes ?? 0,
            icon: Layers3,
            route: '/dee/campagnes',
        },
        {
            label: t.dossiers,
            value: counts.dossiers ?? 0,
            icon: ClipboardCheck,
            route: '/dee/dossiers',
        },
        {
            label: t.visites,
            value: counts.visites ?? 0,
            icon: CalendarDays,
            route: '/dee/workflow/visites',
        },
    ];

    const modules = [
        {
            title: t.etablissements,
            desc: 'Gestion des établissements, consultation, recherche et rattachement aux vagues.',
            icon: Building2,
            route: '/dee/etablissements',
        },
        {
            title: t.experts,
            desc: 'Gestion des experts, recherche, filtrage, affectation et suivi.',
            icon: Users,
            route: '/dee/experts',
        },
        {
            title: t.vagues,
            desc: 'Création, pilotage et suivi des vagues d’évaluation.',
            icon: Layers3,
            route: '/dee/campagnes',
        },
        {
            title: t.dossiers,
            desc: 'Suivi des dossiers, statuts, documents et expertises.',
            icon: ClipboardCheck,
            route: '/dee/dossiers',
        },
        {
            title: t.visites,
            desc: 'Planification et suivi des dates de visite programmées.',
            icon: CalendarDays,
            route: '/dee/workflow/visites',
        },
        {
            title: t.dashboard,
            desc: 'Tableau de bord global pour piloter l’ensemble de la plateforme.',
            icon: ShieldCheck,
            route: '/dee/dashboard',
        },
    ];

    const workflowSteps = [
        { title: t.step1Title, desc: t.step1Desc },
        { title: t.step2Title, desc: t.step2Desc },
        { title: t.step3Title, desc: t.step3Desc },
        { title: t.step4Title, desc: t.step4Desc },
    ];

    const whyItems = [t.why1, t.why2, t.why3, t.why4];

    const goTo = (url) => {
        router.visit(url);
    };

    return (
        <>
            <Head title="Dashboard DEE - ANEAQ" />

            <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f6f8fc] text-slate-800">
            <DeeHeader buttonMode="home" />

                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_35%)]" />

                    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
                        <div className="flex flex-col justify-center">
                            <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                                {t.heroBadge}
                            </span>

                            <h1 className="mt-6 text-4xl font-black leading-tight text-blue-950 sm:text-5xl lg:text-6xl">
                                {t.heroTitle}
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                                {t.heroDesc}
                            </p>

                            <div className="mt-8">
                                <button
                                    type="button"
                                    onClick={() => goTo('/dee/campagnes/create')}
                                    className="inline-flex min-w-[340px] items-center justify-center rounded-2xl bg-[#223270] px-12 py-5 text-base font-black text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-[#1b285a] active:scale-95"
                                >
                                    {t.createWave}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="w-full rounded-[2rem] bg-gradient-to-br from-[#223270] via-[#2f5fe4] to-[#0ea5c6] p-8 text-white shadow-2xl">
                                <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-100">
                                    ANEAQ
                                </p>

                                <h2 className="mt-4 text-3xl font-black">
                                    {t.discoverModules}
                                </h2>

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {stats.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={() => goTo(item.route)}
                                                className="group rounded-2xl bg-white/10 p-5 text-left backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
                                            >
                                                <Icon size={24} />

                                                <p className="mt-4 text-sm uppercase tracking-[0.2em] text-blue-100">
                                                    {item.label}
                                                </p>

                                                <p className="mt-2 text-3xl font-black">
                                                    {item.value}
                                                </p>

                                                <p className="mt-3 text-sm font-bold text-blue-50 opacity-0 transition group-hover:opacity-100">
                                                    {t.openModule}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">
                            {t.statsTitle}
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-blue-950">
                            {t.statsSubtitle}
                        </h2>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
                        {stats.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => goTo(item.route)}
                                    className="group rounded-[1.8rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                        <Icon size={26} />
                                    </div>

                                    <p className="mt-5 text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
                                        {item.label}
                                    </p>

                                    <p className="mt-2 text-5xl font-black text-blue-950">
                                        {item.value}
                                    </p>

                                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">
                                        {t.openModule}
                                        <ArrowRight size={16} />
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">
                            {t.modulesTitle}
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-blue-950">
                            {t.modulesSubtitle}
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {modules.map((module) => {
                            const Icon = module.icon;

                            return (
                                <button
                                    key={module.title}
                                    type="button"
                                    onClick={() => goTo(module.route)}
                                    className="group rounded-[2rem] border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                        <Icon size={26} />
                                    </div>

                                    <h3 className="mt-6 text-2xl font-black text-blue-950">
                                        {module.title}
                                    </h3>

                                    <p className="mt-4 text-sm leading-7 text-slate-600">
                                        {module.desc}
                                    </p>

                                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition group-hover:gap-3">
                                        {t.seeMore}
                                        <ArrowRight size={16} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="border-y border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">
                                {t.workflowTitle}
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-blue-950">
                                {t.workflowSubtitle}
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {workflowSteps.map((step, index) => (
                                <div
                                    key={step.title}
                                    className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
                                        {index + 1}
                                    </div>

                                    <h3 className="mt-6 text-xl font-black text-blue-950">
                                        {step.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-2">
                        <div className="rounded-[2rem] bg-gradient-to-br from-[#13255c] to-[#223983] p-10 text-white shadow-xl">
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-100">
                                {t.whyTitle}
                            </p>

                            <h2 className="mt-3 text-3xl font-black">
                                {t.whySubtitle}
                            </h2>

                            <div className="mt-8 space-y-4">
                                {whyItems.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 rounded-2xl bg-white/10 p-4"
                                    >
                                        <CheckCircle2
                                            className="mt-0.5 shrink-0 text-blue-200"
                                            size={20}
                                        />

                                        <span className="text-sm leading-7 text-blue-50">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">
                                ANEAQ
                            </p>

                            <h2 className="mt-3 text-3xl font-black text-blue-950">
                                {t.ctaTitle}
                            </h2>

                            <p className="mt-5 text-base leading-8 text-slate-600">
                                {t.ctaDesc}
                            </p>

                            <div className="mt-10 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => goTo('/dee/campagnes/create')}
                                    className="inline-flex h-16 min-w-[360px] items-center justify-center rounded-2xl bg-[#223270] px-12 text-base font-black text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-[#1b285a] active:scale-95"
                                >
                                    {t.createWave}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-blue-950 pb-8 pt-20 text-white md:pt-24">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="mb-16 grid gap-12 border-b border-white/10 pb-16 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="lg:col-span-1">
                                <span className="mb-6 flex items-center gap-3 text-3xl font-black tracking-tighter">
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
                                    Agence Nationale d’Evaluation et d’Assurance Qualité de l’Enseignement Supérieur et de la Recherche Scientifique.
                                </p>
                            </div>

                            <div>
                                <h4 className="mb-6 text-lg font-bold text-white">
                                    {t.quickLinks}
                                </h4>

                                <ul className="space-y-4 text-sm font-medium text-blue-200/70">
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => goTo('/dee/dashboard')}
                                            className="transition hover:text-white"
                                        >
                                            {t.adminDashboard}
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => goTo('/dee/etablissements')}
                                            className="transition hover:text-white"
                                        >
                                            {t.etablissements}
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => goTo('/dee/experts')}
                                            className="transition hover:text-white"
                                        >
                                            {t.experts}
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => goTo('/dee/campagnes')}
                                            className="transition hover:text-white"
                                        >
                                            {t.vagues}
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => goTo('/dee/dossiers')}
                                            className="transition hover:text-white"
                                        >
                                            {t.dossiers}
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => goTo('/dee/workflow/visites')}
                                            className="transition hover:text-white"
                                        >
                                            {t.visites}
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="lg:col-span-2">
                                <h4 className="mb-6 text-lg font-bold text-white">
                                    {t.contactUs}
                                </h4>

                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4 text-sm text-blue-200/70">
                                            <MapPin className="mt-0.5 shrink-0 text-blue-400" size={20} />

                                            <span className="leading-relaxed">
                                                05 Street Abou Inan Hassan,
                                                <br />
                                                Rabat - Morocco
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
                            <p>{t.rights}</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}