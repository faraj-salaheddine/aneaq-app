import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import { Eye, EyeOff, Lock, Mail, Save, Server, Settings2, User } from 'lucide-react';
import { useState } from 'react';

export default function ParametresIndex({ settings = {} }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const [showPassword, setShowPassword] = useState(false);
    const [showSmtp, setShowSmtp] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        mail_email:      settings.mail_username     || '',
        mail_from_name:  settings.mail_from_name    || '',
        mail_password:   '',
        mail_host:       settings.mail_host         || 'smtp.gmail.com',
        mail_port:       settings.mail_port         || '587',
        mail_encryption: settings.mail_encryption   || 'tls',
    });

    const submit = (e) => {
        e.preventDefault();
        patch('/dee/parametres', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Paramètres — Email plateforme" />
            <DashboardShell>
                <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Settings2 size={22} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">Configuration</p>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Paramètres email</h1>
                        </div>
                    </div>

                    {flash.success && (
                        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-7 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-slate-900">Email d'envoi</h2>
                                        <p className="text-sm text-slate-500">Tous les emails de la plateforme seront envoyés depuis cet email.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-7 py-6 space-y-4">

                                {/* Email unique */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-black text-slate-700">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={data.mail_email}
                                            onChange={e => setData('mail_email', e.target.value)}
                                            placeholder="votrecompte@gmail.com"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    {errors.mail_email && <p className="mt-1 text-xs font-bold text-red-600">{errors.mail_email}</p>}
                                </div>

                                {/* Nom affiché */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-black text-slate-700">
                                        Nom affiché pour les destinataires
                                    </label>
                                    <div className="relative">
                                        <User size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.mail_from_name}
                                            onChange={e => setData('mail_from_name', e.target.value)}
                                            placeholder="ANEAQ — Système d'Information"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    {errors.mail_from_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.mail_from_name}</p>}
                                </div>

                                {/* Mot de passe */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-black text-slate-700">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.mail_password}
                                            onChange={e => setData('mail_password', e.target.value)}
                                            placeholder="Laissez vide pour ne pas changer"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                        <button type="button" onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.mail_password && <p className="mt-1 text-xs font-bold text-red-600">{errors.mail_password}</p>}
                                    <p className="mt-1 text-xs text-slate-400">
                                        Pour Gmail : utilisez un <b>App Password</b> (Compte Google → Sécurité → Mots de passe des applications).
                                    </p>
                                </div>

                                {/* Paramètres SMTP avancés (masqués par défaut) */}
                                <div>
                                    <button type="button" onClick={() => setShowSmtp(v => !v)}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                                        <Server size={13} />
                                        {showSmtp ? 'Masquer les paramètres SMTP avancés' : 'Paramètres SMTP avancés'}
                                    </button>

                                    {showSmtp && (
                                        <div className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-black text-slate-600">Hôte SMTP</label>
                                                <input type="text" value={data.mail_host}
                                                    onChange={e => setData('mail_host', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="mb-1 block text-xs font-black text-slate-600">Port</label>
                                                    <input type="number" value={data.mail_port}
                                                        onChange={e => setData('mail_port', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400" />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs font-black text-slate-600">Chiffrement</label>
                                                    <select value={data.mail_encryption}
                                                        onChange={e => setData('mail_encryption', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400">
                                                        <option value="tls">TLS</option>
                                                        <option value="ssl">SSL</option>
                                                        <option value="none">Aucun</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 px-7 py-5 flex justify-end">
                                <button type="submit" disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
                                    <Save size={16} />
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </DashboardShell>
        </>
    );
}
