import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Globe } from 'lucide-react';
import { useMemo } from 'react';
import DashboardBackButton from '@/Components/DashboardBackButton';

export default function GuestLayout({ children }) {
    const { props } = usePage();
    const auth = props.auth || {};
    const locale = props.locale || 'fr';
    const isArabic = locale === 'ar';

    const t = useMemo(() => {
        const fr = {
            about: 'À propos',
            universities: 'Universités',
            guides: 'Guides',
            arabic: 'العربية',
            french: 'Français',
            dashboard: 'Dashboard DEE',
            login: 'Connexion',
            register: 'Inscription',
        };

        const ar = {
            about: 'حول المنصة',
            universities: 'الجامعات',
            guides: 'الأدلة',
            arabic: 'العربية',
            french: 'Français',
            dashboard: 'لوحة DEE',
            login: 'تسجيل الدخول',
            register: 'إنشاء حساب',
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

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f6f8fc]">
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-4">
                            <img
                                src="/images/logo-ministere.png"
                                alt="Ministère"
                                className="h-11 rounded-xl bg-white p-1.5 shadow-sm"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                            <div className="h-9 w-px bg-slate-200"></div>
                            <img
                                src="/images/logo-aneaq.png"
                                alt="ANEAQ"
                                className="h-11 rounded-xl bg-white p-1.5 shadow-sm"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </Link>

                        <div className="hidden xl:flex items-center gap-8 text-sm font-semibold text-slate-700">
                            <Link href="/" className="transition hover:text-blue-600">
                                {t.about}
                            </Link>

                            <div className="relative group">
                                <button type="button" className="flex items-center gap-1 transition hover:text-blue-600">
                                    {t.universities} <ChevronDown size={16} />
                                </button>

                                <div className="absolute left-0 top-full hidden w-[620px] rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl group-hover:block">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                        {universities.map((u, i) => (
                                            <a
                                                key={i}
                                                href={u.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-xl border-b border-slate-50 p-2.5 text-sm font-medium transition hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                {u.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Link href="/" className="transition hover:text-blue-600">
                                {t.guides}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.post(`/language/${isArabic ? 'fr' : 'ar'}`)}
                            className="hidden md:flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                            <Globe size={16} />
                            {isArabic ? t.french : t.arabic}
                        </button>

                        {auth?.user ? (
                            <DashboardBackButton label={t.dashboard} />
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-600 hover:text-blue-600"
                                >
                                    {t.login}
                                </Link>

                                <Link
                                    href="/register"
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                                >
                                    {t.register}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="bg-blue-950 pb-8 pt-16 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <span className="mb-5 flex items-center gap-3 text-3xl font-black tracking-tighter">
                                <img
                                    src="/images/logo-aneaq.png"
                                    alt="ANEAQ"
                                    className="h-10 rounded bg-white p-1"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                ANEAQ
                            </span>

                            <p className="text-sm leading-relaxed text-blue-200/70">
                                Agence Nationale d’Evaluation et d’Assurance Qualité de l’Enseignement Supérieur et de la Recherche Scientifique.
                            </p>
                        </div>

                        <div>
                            <h4 className="mb-5 text-lg font-bold text-white">Navigation</h4>
                            <ul className="space-y-3 text-sm font-medium text-blue-200/70">
                                <li>
                                    <Link href="/" className="transition hover:text-white">
                                        Accueil
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard" className="transition hover:text-white">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/campagnes" className="transition hover:text-white">
                                        Vagues
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dee/dossiers" className="transition hover:text-white">
                                        Dossiers
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <h4 className="mb-5 text-lg font-bold text-white">Contact</h4>
                            <div className="grid gap-6 sm:grid-cols-2 text-sm text-blue-200/70">
                                <div>
                                    <p>05 Street Abou Inan Hassan,</p>
                                    <p>Rabat - Morocco</p>
                                    <p className="mt-4">contact@aneaq.ma</p>
                                </div>
                                <div>
                                    <p dir="ltr">+212 537 27 16 08</p>
                                    <p dir="ltr">+212 537 27 16 07</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs font-semibold uppercase tracking-wider text-blue-200/40">
                        © 2026 ANEAQ - Division de l’Evaluation des Etablissements. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}