import { Link, router, usePage } from "@inertiajs/react";
import { ChevronDown, ExternalLink, Globe } from "lucide-react";
import { useMemo } from "react";

export default function AneqLayout({ children, title, description }) {
    const { auth, locale } = usePage().props;
    const user = auth?.user;
    const isArabic = locale === "ar";

    const t = useMemo(() => {
        const fr = {
            about: "À propos",
            universities: "Universités",
            guides: "Guides",
            backHome: "Retour à l'accueil",
            dashboard: "Dashboard",
            arabic: "العربية",
            french: "Français",
        };

        const ar = {
            about: "حول المنصة",
            universities: "الجامعات",
            guides: "الأدلة",
            backHome: "العودة إلى الرئيسية",
            dashboard: "لوحة القيادة",
            arabic: "العربية",
            french: "Français",
        };

        return isArabic ? ar : fr;
    }, [isArabic]);

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

    return (
        <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-[#f6f8fc]">
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-4">
                            <img
                                src="/images/logo-ministere.png"
                                alt="Ministère"
                                className="h-11 rounded-xl bg-white p-1.5 shadow-sm"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                            <div className="h-9 w-px bg-slate-200"></div>
                            <img
                                src="/images/logo-aneaq.png"
                                alt="ANEAQ"
                                className="h-11 rounded-xl bg-white p-1.5 shadow-sm"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                        </Link>

                        <div className="hidden xl:flex items-center gap-8 text-sm font-semibold text-slate-700">
                            <Link href="/" className="transition hover:text-blue-600">
                                {t.about}
                            </Link>

                            <div className="relative group">
                                <button
                                    type="button"
                                    className="flex items-center gap-1 transition hover:text-blue-600"
                                >
                                    {t.universities} <ChevronDown size={16} />
                                </button>

                                <div className="absolute left-0 top-full hidden w-[640px] rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl group-hover:block">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                        {universities.map((u, i) => (
                                            <a
                                                key={i}
                                                href={u.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between rounded-xl border-b border-slate-50 p-2.5 text-sm font-medium transition hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <span className="truncate pr-2">{u.name}</span>
                                                <ExternalLink
                                                    size={14}
                                                    className="shrink-0 text-blue-400"
                                                />
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
                            onClick={() => router.post(`/language/${isArabic ? "fr" : "ar"}`)}
                            className="hidden md:flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                            <Globe size={16} />
                            {isArabic ? t.french : t.arabic}
                        </button>

                        <div className="hidden lg:flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                            {user?.name || "Utilisateur"}
                        </div>

                        <Link
                            href="/dashboard"
                            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                            {t.dashboard}
                        </Link>

                        <Link
                            href="/"
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            {t.backHome}
                        </Link>
                    </div>
                </div>
            </header>

            {(title || description) && (
                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="rounded-[2rem] bg-gradient-to-r from-[#13255c] to-[#223983] p-8 text-white shadow-xl shadow-blue-950/10">
                        {title && (
                            <h1 className="text-3xl font-black">{title}</h1>
                        )}
                        {description && (
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
                                {description}
                            </p>
                        )}
                    </div>
                </section>
            )}

            <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                {children}
            </main>

            <footer className="mt-16 bg-[#13255c] text-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <h3 className="text-2xl font-bold">ANEAQ</h3>
                            <p className="mt-4 text-sm leading-7 text-blue-100">
                                Agence Nationale d’Evaluation et d’Assurance Qualité de l’Enseignement
                                Supérieur et de la Recherche Scientifique.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold">Liens rapides</h4>
                            <div className="mt-4 space-y-2 text-sm text-blue-100">
                                <div>Dashboard administrateur</div>
                                <div>Etablissements</div>
                                <div>Experts</div>
                                <div>Dossiers</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold">Contactez-nous</h4>
                            <div className="mt-4 space-y-2 text-sm text-blue-100">
                                <div>05 Street Abou Inan Hassan, Rabat - Morocco</div>
                                <div>+212 537 27 16 08</div>
                                <div>+212 537 27 16 07</div>
                                <div>contact@aneaq.ma</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-blue-200">
                        © 2026 ANEAQ - DIVISION DE L EVALUATION DES ETABLISSEMENTS. TOUS DROITS RÉSERVÉS.
                    </div>
                </div>
            </footer>
        </div>
    );
}