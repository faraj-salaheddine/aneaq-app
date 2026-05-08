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
        const handle = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const t = useMemo(() => ({
        profile:     isArabic ? 'الملف الشخصي' : 'Voir le profil',
        logout:      isArabic ? 'تسجيل الخروج' : 'Se déconnecter',
        dashboardDee: isArabic ? 'لوحة قيادة DEE' : 'Dashboard DEE',
        home:        isArabic ? 'العودة إلى الرئيسية' : "Retourner à l'accueil",
        ar:          'العربية',
        fr:          'Français',
    }), [isArabic]);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/images/logo-ministere.png"
                        alt="Ministère"
                        className="h-10 rounded-lg bg-white p-1 shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="h-8 w-px bg-slate-200" />
                    <img
                        src="/images/logo-aneaq.png"
                        alt="ANEAQ"
                        className="h-10 rounded-lg bg-white p-1 shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="hidden text-sm font-black text-slate-800 lg:block">ANEAQ</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2.5">
                    {/* Language */}
                    <button
                        type="button"
                        onClick={() => router.post(`/language/${isArabic ? 'fr' : 'ar'}`)}
                        className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 md:flex"
                    >
                        <Globe size={13} />
                        {isArabic ? t.fr : t.ar}
                    </button>

                    {/* User menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setProfileMenuOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            <User size={15} />
                            <span className="hidden sm:block max-w-[120px] truncate">
                                {user?.name || 'Administrateur DEE'}
                            </span>
                            <ChevronDown size={14} />
                        </button>

                        {profileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                <Link
                                    href="/dee/profile"
                                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    <User size={15} />
                                    {t.profile}
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut size={15} />
                                    {t.logout}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* CTA button */}
                    <Link
                        href={buttonMode === 'home' ? '/' : '/dee/dashboard'}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700"
                    >
                        {buttonMode === 'home' ? t.home : t.dashboardDee}
                    </Link>
                </div>
            </div>
        </header>
    );
}
