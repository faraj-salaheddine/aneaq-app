import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Globe, LogOut, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function DeeHeader({ buttonMode = 'dashboard' }) {
        const { props } = usePage();

    const user = props?.auth?.user || null;
    const locale = props?.locale || 'fr';
    const isArabic = locale === 'ar';

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
            arabic: 'العربية',
            french: 'Français',
            profile: 'Voir le profil',
            logout: 'Se déconnecter',
            dashboardDee: 'Dashboard DEE',
        };

        const ar = {
            about: 'حول المنصة',
            universities: 'الجامعات',
            guides: 'الأدلة',
            arabic: 'العربية',
            french: 'Français',
            profile: 'الملف الشخصي',
            logout: 'تسجيل الخروج',
            dashboardDee: 'لوحة قيادة DEE',
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
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-4">
                        <img
                            src="/images/logo-ministere.png"
                            alt="Ministère"
                            className="h-11 rounded-xl bg-white p-1.5 shadow-sm"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />

                        <div className="h-9 w-px bg-slate-200" />

                        <img
                            src="/images/logo-aneaq.png"
                            alt="ANEAQ"
                            className="h-11 rounded-xl bg-white p-1.5 shadow-sm"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </Link>

                    <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 xl:flex">
                        <Link href="/" className="transition hover:text-blue-600">
                            {t.about}
                        </Link>

                        <div className="group relative">
                            <button
                                type="button"
                                className="flex items-center gap-1 transition hover:text-blue-600"
                            >
                                {t.universities}
                                <ChevronDown size={16} />
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
                        className="hidden items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white md:flex"
                    >
                        <Globe size={16} />
                        {isArabic ? t.french : t.arabic}
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setProfileMenuOpen((prev) => !prev)}
                            className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                            <User size={17} />
                            {user?.name || 'Administrateur DEE'}
                            <ChevronDown size={16} />
                        </button>

                        {profileMenuOpen && (
                            <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    <User size={18} />
                                    {t.profile}
                                </Link>

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut size={18} />
                                    {t.logout}
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
    href={buttonMode === 'home' ? '/' : '/dee/dashboard'}
    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
>
    {buttonMode === 'home' ? "Retourner à l’accueil" : t.dashboardDee}
</Link>
                </div>
            </div>
        </header>
    );
}