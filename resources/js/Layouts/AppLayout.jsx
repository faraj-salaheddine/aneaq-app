import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function AppLayout({ children, title = "ANEAQ" }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <Link
                            href={route("home")}
                            className="text-2xl font-bold text-slate-800"
                        >
                            ANEAQ
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                            <Link href={route("home")} className="hover:text-indigo-600">
                                À propos
                            </Link>
                            <Link href={route("etablissements.index")} className="hover:text-indigo-600">
                                Établissements
                            </Link>
                            <Link href={route("experts.index")} className="hover:text-indigo-600">
                                Experts
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                            {auth?.user?.name || "Utilisateur"}
                        </span>

                        <Link
                            href={route("dashboard")}
                            className="inline-flex items-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    {title && (
                        <div className="mb-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                                ANEAQ
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-slate-800">
                                {title}
                            </h1>
                        </div>
                    )}

                    {children}
                </div>
            </main>

            <footer className="mt-12 bg-[#162c6b] text-white">
                <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
                    <div>
                        <h3 className="text-2xl font-bold">ANEAQ</h3>
                        <p className="mt-4 text-sm text-white/80 leading-7">
                            Agence Nationale d’Évaluation et d’Assurance Qualité
                            de l’Enseignement Supérieur et de la Recherche Scientifique.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold">Liens rapides</h4>
                        <div className="mt-4 space-y-3 text-sm text-white/80">
                            <div>
                                <Link href={route("dashboard")} className="hover:text-white">
                                    Dashboard
                                </Link>
                            </div>
                            <div>
                                <Link href={route("campagnes.index")} className="hover:text-white">
                                    Vagues d’évaluation
                                </Link>
                            </div>
                            <div>
                                <Link href={route("dossiers.index")} className="hover:text-white">
                                    Dossiers
                                </Link>
                            </div>
                            <div>
                                <Link href={route("etablissements.index")} className="hover:text-white">
                                    Établissements
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold">Contactez-nous</h4>
                        <div className="mt-4 space-y-3 text-sm text-white/80">
                            <p>05 Street Abou Inan Hassan, Rabat - Morocco</p>
                            <p>+212 537 27 16 08</p>
                            <p>contact@aneaq.ma</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
                    © 2026 ANEAQ - Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}