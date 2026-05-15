import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans relative">
            <Head title="Mot de passe oublié - ANEAQ" />

            {/* Back button */}
            <div className="absolute top-6 left-6">
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors"
                >
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>
            </div>

            {/* Logo + title */}
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

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Mail size={28} className="text-blue-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Mot de passe oublié ?</h2>
                <p className="text-sm text-slate-500 text-center mb-6 font-medium">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {/* Success status */}
                {status && (
                    <div className="mb-6 text-sm font-medium text-green-700 bg-green-50 border border-green-200 p-4 rounded-xl text-center">
                        ✅ {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
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
                            autoFocus
                            placeholder="nom@exemple.com"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} focus:ring transition-all bg-slate-50 focus:bg-white outline-none`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs font-semibold mt-2">{errors.email}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 ${processing && 'opacity-75 cursor-not-allowed'}`}
                    >
                        {processing ? (
                            <span className="animate-pulse">Envoi en cours...</span>
                        ) : (
                            <>
                                <Mail size={16} />
                                Envoyer le lien de réinitialisation
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                © {new Date().getFullYear()} ANEAQ - Division de l'Évaluation des Établissements
            </div>
        </div>
    );
}
