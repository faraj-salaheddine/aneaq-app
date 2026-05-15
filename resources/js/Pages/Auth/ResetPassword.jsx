import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans relative">
            <Head title="Réinitialisation du mot de passe - ANEAQ" />

            <div className="absolute top-6 left-6">
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors"
                >
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>
            </div>

            {/* Logo */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <img
                        src="/images/logo-aneaq.png"
                        alt="Logo ANEAQ"
                        className="h-20 bg-white p-2 rounded-2xl shadow-md"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
                <h1 className="text-3xl font-black text-blue-950 tracking-tight">ANEAQ</h1>
                <p className="text-slate-500 mt-2 font-medium">Portail de l'Évaluation Institutionnelle</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <KeyRound size={28} className="text-blue-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Nouveau mot de passe</h2>
                <p className="text-sm text-slate-500 text-center mb-6 font-medium">
                    Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </p>

                <form onSubmit={submit} className="space-y-5">

                    {/* Email (readonly) */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                            Adresse Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="username"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200'} bg-slate-50 outline-none text-slate-600`}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-semibold mt-2">{errors.email}</p>}
                    </div>

                    {/* New password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                            Nouveau mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            autoFocus
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white outline-none`}
                        />
                        {errors.password && <p className="text-red-500 text-xs font-semibold mt-2">{errors.password}</p>}
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-bold text-slate-700 mb-2">
                            Confirmer le mot de passe
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.password_confirmation ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white outline-none`}
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-xs font-semibold mt-2">{errors.password_confirmation}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 ${processing && 'opacity-75 cursor-not-allowed'}`}
                    >
                        {processing ? (
                            <span className="animate-pulse">Réinitialisation...</span>
                        ) : (
                            <>
                                <KeyRound size={16} />
                                Réinitialiser le mot de passe
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-12 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                © {new Date().getFullYear()} ANEAQ - Division de l'Évaluation des Établissements
            </div>
        </div>
    );
}
