import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Globe, LogOut, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardBackButton from '@/Components/DashboardBackButton';
import DeeHeader from '@/Components/DEE/DeeHeader';

export default function DashboardShell({ children }) {
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
            <DeeHeader />

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
                                    <Link href="/etablissements" className="transition hover:text-white">
                                        Établissements
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/experts" className="transition hover:text-white">
                                        Experts
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dee/dossiers" className="transition hover:text-white">
                                        Dossiers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/workflow/visites" className="transition hover:text-white">
                                        Visites
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