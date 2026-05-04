import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Globe, LogOut, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardBackButton from '@/Components/DashboardBackButton';

export default function AuthenticatedLayout({ children }) {
    const { props } = usePage();
    const auth = props.auth || {};
    const locale = props.locale || 'fr';
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
            dashboard: 'Dashboard DEE',
        };

        const ar = {
            about: 'حول المنصة',
            universities: 'الجامعات',
            guides: 'الأدلة',
            arabic: 'العربية',
            french: 'Français',
            profile: 'الملف الشخصي',
            logout: 'تسجيل الخروج',
            dashboard: 'لوحة DEE',
        };

        return isArabic ? ar : fr;
    }, [isArabic]);

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
                            <Link href="/" className="transition hover:text-blue-600">
                                {t.universities}
                            </Link>
                            <Link href="/" className="transition hover:text-blue-600">
                                {t.guides}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="hidden md:flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                            <Globe size={16} />
                            {isArabic ? t.french : t.arabic}
                        </button>

                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setProfileMenuOpen((prev) => !prev)}
                                className="hidden lg:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                            >
                                {auth?.user?.name || 'Administrateur'}
                                <ChevronDown size={16} />
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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

                        <DashboardBackButton label={t.dashboard} />
                    </div>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}