import { Head, Link, router } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import MessageriePanel from '@/Components/MessageriePanel';

/* ─── Design tokens ─── */
const BLUE   = '#0C447C';
const BLIGHT = '#1a6abf';
const GREEN  = '#1D9E75';
const ORANGE = '#EF9F27';
const RED    = '#e53e3e';

const STATUS_META = {
    en_preparation:        { label: 'En préparation',          color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' },
    autoeval_en_cours:     { label: 'Autoévaluation en cours', color: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
    autoeval_depose:       { label: 'Autoévaluation déposée',  color: '#0e7490', bg: '#ecfeff', dot: '#06b6d4' },
    en_evaluation:         { label: 'En évaluation',           color: BLUE,      bg: '#dbeafe', dot: BLIGHT   },
    visite_planifiee:      { label: 'Visite planifiée',        color: '#92400e', bg: '#fef3c7', dot: ORANGE   },
    date_visite_planifiee: { label: 'Visite planifiée',        color: '#92400e', bg: '#fef3c7', dot: ORANGE   },
    rapport_en_attente:    { label: 'Rapport attendu',         color: '#991b1b', bg: '#fee2e2', dot: RED      },
    rapport_depose:        { label: 'Rapport déposé',          color: '#166534', bg: '#dcfce7', dot: GREEN    },
    valide:                { label: 'Validé',                  color: '#166534', bg: '#dcfce7', dot: GREEN    },
    cloture:               { label: 'Clôturé',                 color: '#374151', bg: '#f3f4f6', dot: '#6b7280'},
    comite_confirme:       { label: 'Comité confirmé',         color: '#166534', bg: '#dcfce7', dot: GREEN    },
};

const STEPS = [
    { label: 'Affectation confirmée',     always: true },
    { label: 'Rapport d\'autoévaluation', statuses: ['autoeval_depose','en_evaluation','visite_planifiee','rapport_en_attente','rapport_depose','valide','cloture','comite_confirme'] },
    { label: 'Évaluation quantitative',   statuses: ['visite_planifiee','rapport_en_attente','rapport_depose','valide','cloture'], active: ['en_evaluation','comite_confirme'] },
    { label: 'Visite sur site',           statuses: ['rapport_en_attente','rapport_depose','valide','cloture'], active: ['visite_planifiee'] },
    { label: 'Rapport final',             statuses: ['rapport_depose','valide','cloture'], active: ['rapport_en_attente'] },
    { label: 'Validation DEE',            statuses: ['valide','cloture'] },
];

/* ─── Page ─── */
export default function DossierShow({
    expert            = {},
    dossier           = {},
    comite            = [],
    progression       = 0,
    rapport           = null,
    nbRecommandations = 0,
    documents         = [],
    assignmentStatus  = null,
}) {
    const isWaiting = assignmentStatus === 'accepte_par_expert';
    const etab   = dossier?.etablissement || {};
    const status = dossier?.statut || dossier?.status || 'en_preparation';
    const smeta  = STATUS_META[status] || { label: status || '—', color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' };
    const pct    = Math.min(Math.max(Number(progression || 0), 0), 100);
    const etabName = etab.nom || etab.etablissement_2 || etab.etablissement || 'Établissement non renseigné';

    const confirmedCount = comite.filter(m => m.status === 'confirme_par_expert').length;

    return (
        <>
            <Head title={`Dossier ${dossier.reference || ''} — Expert`} />
            <MessageriePanel dossierId={dossier.id} currentRole="expert" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
                *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', system-ui, sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fu { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
                .d1 { animation-delay: .06s; }
                .d2 { animation-delay: .12s; }
                .d3 { animation-delay: .18s; }
                .d4 { animation-delay: .24s; }
                .d5 { animation-delay: .30s; }
                .d6 { animation-delay: .36s; }

                .action-card { transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s; }
                .action-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.14) !important; }

                .member-card { transition: border-color .18s, box-shadow .18s; }
                .member-card:hover { border-color: ${BLUE}44 !important; box-shadow: 0 4px 20px rgba(12,68,124,.08) !important; }

                .back-btn { transition: background .18s, transform .18s; }
                .back-btn:hover { background: #f1f5f9 !important; transform: translateX(-2px); }

                .info-link { transition: color .15s; }
                .info-link:hover { color: ${BLUE} !important; }

                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f8fafc 0%,#eef2f7 100%)', padding: '2rem 1.5rem 4rem' }}>
                <div style={{ maxWidth: 1240, margin: '0 auto' }}>

                    {/* ── Top bar ── */}
                    <div className="fu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                            <Link href="/expert/dashboard" className="info-link" style={{ color: '#94a3b8', textDecoration: 'none' }}>Espace Expert</Link>
                            <ChevronRight />
                            <Link href="/expert/dossiers" className="info-link" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dossiers affectés</Link>
                            <ChevronRight />
                            <span style={{ color: BLUE, fontWeight: 800 }}>{dossier.reference || 'Dossier'}</span>
                        </nav>

                        <button className="back-btn" onClick={() => router.visit('/expert/dossiers')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                            <ArrowLeft size={15} />
                            Retour aux dossiers
                        </button>
                    </div>

                    {/* ── Waiting banner ── */}
                    {isWaiting && (
                        <div className="fu d1" style={{ marginBottom: 20, borderRadius: 16, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#92400e' }}>En attente de confirmation DEE</p>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#b45309', fontWeight: 500, lineHeight: 1.6 }}>
                                    Vous avez accepté cette mission. La DEE doit encore confirmer votre affectation avant que vous puissiez démarrer l'évaluation.
                                    Les actions (évaluation, rapport, recommandations) seront débloquées après la confirmation.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Hero banner ── */}
                    <div className="fu d1" style={{ borderRadius: 22, overflow: 'hidden', marginBottom: 24, boxShadow: `0 8px 40px rgba(12,68,124,.22)` }}>
                        {/* Gradient strip */}
                        <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1355a0 50%, #0d6abf 100%)`, padding: '2.5rem 2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
                            {/* Background decoration */}
                            <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
                            <div style={{ position: 'absolute', bottom: -40, right: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

                            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <span style={{ padding: '4px 12px', borderRadius: 30, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', backdropFilter: 'blur(8px)' }}>
                                            Fiche Dossier
                                        </span>
                                        <span style={{ padding: '4px 14px', borderRadius: 30, background: smeta.bg, color: smeta.color, fontSize: 12, fontWeight: 800 }}>
                                            {smeta.label}
                                        </span>
                                    </div>

                                    <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                        {dossier.reference || '—'}
                                    </h1>

                                    <p style={{ margin: '10px 0 20px', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.80)', maxWidth: 520, lineHeight: 1.5 }}>
                                        {etabName}
                                    </p>

                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <HeroBadge icon={<IcoRole />} text={formatRole(expert.role_comite || expert.role_expert || 'expert')} />
                                        {etab.ville && <HeroBadge icon={<IcoPin />} text={etab.ville} />}
                                        {dossier.campagne && <HeroBadge icon={<IcoCal />} text={`Campagne ${dossier.campagne}`} />}
                                    </div>
                                </div>

                                {/* Quick metrics */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minWidth: 280 }}>
                                    <MetricChip label="Progression" value={`${pct}%`} />
                                    <MetricChip label="Comité" value={`${confirmedCount}/${comite.length}`} />
                                    <MetricChip label="Rapport" value={rapport ? 'Déposé' : 'Attendu'} />
                                    <MetricChip label="Recommandations" value={nbRecommandations || 0} />
                                </div>
                            </div>
                        </div>

                        {/* Progress bar footer */}
                        <div style={{ background: '#fff', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid #e8edf3' }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap' }}>PROGRESSION</span>
                            <div style={{ flex: 1, height: 8, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, transition: 'width 1s cubic-bezier(.22,1,.36,1)' }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 900, color: BLUE, minWidth: 40, textAlign: 'right' }}>{pct}%</span>
                        </div>
                    </div>

                    {/* ── Stat strip ── */}
                    <div className="fu d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                        <StatCard icon={<IcoChart />}  label="Progression"     value={`${pct}%`}              accent={BLUE}   sub={pct < 100 ? 'En cours' : 'Complété'} />
                        <StatCard icon={<IcoUsers />}  label="Membres comité"  value={comite.length}           accent={GREEN}  sub={`${confirmedCount} confirmé(s)`} />
                        <StatCard icon={<IcoFile />}   label="Rapport final"   value={rapport ? '✓' : '—'}    accent={rapport ? GREEN : ORANGE} sub={rapport ? 'Déposé' : 'Non déposé'} />
                        <StatCard icon={<IcoClip />}   label="Recommandations" value={nbRecommandations || 0}  accent={ORANGE} sub="au total" />
                    </div>

                    {/* ── Main grid ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 22, alignItems: 'start' }}>

                        {/* Left column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Établissement info */}
                            <Card className="fu d3" accent={BLUE}>
                                <CardHead icon={<IcoBuilding />} title="Informations établissement" sub="Données principales de l'établissement concerné." />
                                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <InfoCell label="Établissement" value={etabName} span />
                                    <InfoCell label="Acronyme"      value={etab.acronyme} />
                                    <InfoCell label="Ville"         value={etab.ville} />
                                    <InfoCell label="Université"    value={etab.universite} />
                                    <InfoCell label="Email"         value={etab.email} />
                                    <InfoCell label="Domaine"       value={etab.domaine_connaissances} />
                                    <InfoCell label="Vague"         value={dossier.campagne || dossier.vague} />
                                    <InfoCell label="Date visite"   value={formatDate(dossier.date_visite)} />
                                </div>
                            </Card>

                            {/* Progression detail */}
                            <Card className="fu d4" accent={GREEN}>
                                <CardHead icon={<IcoShield />} title="Progression de l'évaluation" sub="Suivi du taux de saisie des critères quantitatifs." />
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '1px solid #e8edf3', borderRadius: 16, padding: '1.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Évaluation quantitative</p>
                                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                                                    {pct < 100 ? `${pct}% des critères renseignés` : 'Tous les critères sont évalués ✓'}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: pct >= 100 ? GREEN : BLUE, lineHeight: 1 }}>{pct}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>%</p>
                                            </div>
                                        </div>
                                        <div style={{ height: 12, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${BLUE} 0%, ${pct >= 100 ? GREEN : BLIGHT} 100%)`, borderRadius: 99, transition: 'width 1.2s cubic-bezier(.22,1,.36,1)' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>0%</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>100%</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => !isWaiting && router.visit(`/expert/evaluations/${dossier.id}`)}
                                        disabled={isWaiting}
                                        style={{ marginTop: 14, width: '100%', padding: '12px', borderRadius: 12, background: isWaiting ? '#e2e8f0' : BLUE, color: isWaiting ? '#94a3b8' : '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: isWaiting ? 'not-allowed' : 'pointer', letterSpacing: '.01em' }}>
                                        {isWaiting ? '🔒 En attente de confirmation' : 'Accéder à l\'évaluation →'}
                                    </button>
                                </div>
                            </Card>

                            {/* Comité */}
                            <Card className="fu d5" accent={ORANGE}>
                                <CardHead icon={<IcoUsers />} title={`Comité d'évaluation`} sub={`${comite.length} expert(s) — ${confirmedCount} confirmé(s)`} />
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {comite.length > 0 ? comite.map((m, i) => (
                                        <MemberRow key={m.id ?? i} member={m} />
                                    )) : (
                                        <EmptyState text="Aucun membre du comité trouvé." />
                                    )}
                                </div>
                            </Card>

                            {/* Actions */}
                            <Card className="fu d6">
                                <CardHead icon={<IcoStar />} title="Actions expert" sub={isWaiting ? 'Disponibles après confirmation DEE.' : 'Accédez aux étapes principales de votre mission d\'évaluation.'} />
                                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, position: 'relative' }}>
                                    {isWaiting && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(3px)', borderRadius: 12, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e', padding: '8px 20px', borderRadius: 30, background: '#fef3c7', border: '1.5px solid #fde68a' }}>
                                                🔒 En attente de confirmation DEE
                                            </span>
                                        </div>
                                    )}
                                    <ActionCard
                                        icon={<IcoChart size={26} />}
                                        title="Évaluation quantitative"
                                        desc={`${pct}% complétée`}
                                        href={`/expert/evaluations/${dossier.id}`}
                                        color={BLUE}
                                        gradFrom="#dbeafe"
                                        gradTo="#eff6ff"
                                        locked={isWaiting}
                                    />
                                    <ActionCard
                                        icon={<IcoFile size={26} />}
                                        title="Rapport final"
                                        desc={rapport ? `Statut : ${rapport.statut || rapport.status || 'Déposé'}` : 'Aucun rapport déposé'}
                                        href={`/expert/rapports/${dossier.id}/deposer`}
                                        color={GREEN}
                                        gradFrom="#dcfce7"
                                        gradTo="#f0fdf4"
                                        locked={isWaiting}
                                    />
                                    <ActionCard
                                        icon={<IcoClip size={26} />}
                                        title="Recommandations"
                                        desc={`${nbRecommandations || 0} recommandation(s)`}
                                        href={`/expert/recommandations-domaine/${dossier.id}`}
                                        color={ORANGE}
                                        gradFrom="#fef3c7"
                                        gradTo="#fffbeb"
                                        locked={isWaiting}
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Right sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Workflow timeline */}
                            <Card className="fu d3" accent={BLUE}>
                                <CardHead icon={<IcoCheck />} title="Avancement" sub="Suivi du workflow dossier." compact />
                                <div style={{ padding: '1.25rem 1.5rem' }}>
                                    {STEPS.map((step, i) => {
                                        const done   = step.always || step.statuses?.includes(status);
                                        const active = step.active?.includes(status);
                                        const isLast = i === STEPS.length - 1;
                                        return (
                                            <TimelineItem key={i} index={i + 1} label={step.label} done={done} active={active} showLine={!isLast} />
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Rapport card */}
                            <Card className="fu d4">
                                <CardHead icon={<IcoFile />} title="Rapport final" sub="État du rapport expert." compact />
                                <div style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ borderRadius: 14, border: `1.5px solid ${rapport ? '#86efac' : '#fed7aa'}`, background: rapport ? '#f0fdf4' : '#fff7ed', padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: rapport ? GREEN : ORANGE, flexShrink: 0 }} />
                                            <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: rapport ? '#166534' : '#92400e' }}>
                                                {rapport ? 'Rapport déposé' : 'Rapport non déposé'}
                                            </p>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>
                                            {rapport
                                                ? `Statut : ${rapport.statut || rapport.status || '—'}`
                                                : 'Déposez votre rapport depuis la section Actions.'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => !isWaiting && router.visit(`/expert/rapports/${dossier.id}/deposer`)}
                                        disabled={isWaiting}
                                        style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, background: isWaiting ? '#e2e8f0' : (rapport ? '#f1f5f9' : GREEN), color: isWaiting ? '#94a3b8' : (rapport ? '#374151' : '#fff'), fontSize: 13, fontWeight: 800, border: 'none', cursor: isWaiting ? 'not-allowed' : 'pointer' }}>
                                        {isWaiting ? '🔒 En attente' : (rapport ? 'Consulter le rapport' : 'Déposer le rapport')}
                                    </button>
                                </div>
                            </Card>

                            {/* Observation */}
                            {dossier.observation && (
                                <Card className="fu d5">
                                    <CardHead icon={<IcoNote />} title="Observation DEE" compact />
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <p style={{ margin: 0, fontSize: 13, color: '#334155', fontWeight: 500, lineHeight: 1.75, borderLeft: `3px solid ${ORANGE}`, paddingLeft: 12 }}>
                                            {dossier.observation}
                                        </p>
                                    </div>
                                </Card>
                            )}

                            {/* Expert info */}
                            <Card className="fu d6">
                                <CardHead icon={<IcoRole2 />} title="Votre rôle" compact />
                                <div style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: BLUE, flexShrink: 0 }}>
                                            {initials(`${expert.prenom || ''} ${expert.nom || ''}`)}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
                                                {expert.prenom || expert.name || ''} {expert.nom || ''}
                                            </p>
                                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{expert.email || '—'}</p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                        <span style={{ padding: '5px 14px', borderRadius: 30, background: '#dbeafe', color: BLUE, fontSize: 12, fontWeight: 800 }}>
                                            {formatRole(expert.role_comite || expert.role_expert || 'expert')}
                                        </span>
                                        <span style={{ padding: '5px 14px', borderRadius: 30, background: smeta.bg, color: smeta.color, fontSize: 12, fontWeight: 800 }}>
                                            {smeta.label}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Documents du dossier */}
                            {documents.length > 0 && (
                                <Card className="fu d7">
                                    <CardHead icon={<IcoFile />} title="Documents du dossier" sub={`${documents.length} fichier(s)`} compact />
                                    <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                                        {documents.map((doc, i) => (
                                            <a key={doc.id ?? i} href={doc.url} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: i < documents.length - 1 ? 8 : 0, textDecoration: 'none', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#EBF4FF'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                                            >
                                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" style={{ flexShrink: 0 }}>
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                    <polyline points="14 2 14 8 20 8"/>
                                                </svg>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {doc.original_name || doc.titre || 'Document'}
                                                    </p>
                                                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                                                        {doc.type || 'document'}
                                                        {doc.size ? ` · ${(doc.size / 1024).toFixed(0)} KB` : ''}
                                                    </p>
                                                </div>
                                                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                    <polyline points="15 3 21 3 21 9"/>
                                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Reusable components ─── */

function Card({ children, accent, className = '', style: extraStyle = {} }) {
    return (
        <div className={className} style={{
            background: '#fff',
            border: '1px solid #e8edf3',
            borderRadius: 18,
            boxShadow: '0 2px 16px rgba(12,68,124,.06)',
            overflow: 'hidden',
            borderTop: accent ? `3px solid ${accent}` : undefined,
            ...extraStyle,
        }}>
            {children}
        </div>
    );
}

function CardHead({ icon, title, sub, compact = false }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: compact ? '.9rem 1.4rem' : '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: compact ? 38 : 44, height: compact ? 38 : 44, borderRadius: 11, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: compact ? 14 : 16 }}>{title}</p>
                {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{sub}</p>}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, accent, sub }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e8edf3', borderRadius: 16, padding: '1.4rem 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.04)', borderTop: `3px solid ${accent}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                    {icon}
                </div>
            </div>
            <p style={{ margin: '14px 0 2px', fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{label}</p>
            {sub && <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{sub}</p>}
        </div>
    );
}

function HeroBadge({ icon, text }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 30, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)' }}>
            <span style={{ color: 'rgba(255,255,255,.8)', display: 'flex' }}>{icon}</span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{text}</span>
        </div>
    );
}

function MetricChip({ label, value }) {
    return (
        <div style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 14, padding: '.9rem 1.1rem' }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.16em', color: 'rgba(255,255,255,.65)' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#fff' }}>{value}</p>
        </div>
    );
}

function InfoCell({ label, value, span }) {
    return (
        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '.85rem 1rem', gridColumn: span ? '1/-1' : undefined }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: '#94a3b8' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{value || '—'}</p>
        </div>
    );
}

function MemberRow({ member }) {
    const name = member.name || `${member.prenom || ''} ${member.nom || ''}`.trim() || 'Expert';
    const role = member.role_comite || member.role_label || 'Expert';
    const sm   = {
        confirme_par_expert: { label: 'Confirmé', color: GREEN,     bg: '#dcfce7' },
        refuse_par_expert:   { label: 'Refusé',   color: RED,       bg: '#fee2e2' },
    }[member.status] || { label: member.status_label || '—', color: '#64748b', bg: '#f1f5f9' };

    const roleColor = role === 'Coordinateur' || role === 'chef_comite' ? ORANGE : BLUE;
    const roleBg    = role === 'Coordinateur' || role === 'chef_comite' ? '#fef3c7' : '#dbeafe';

    return (
        <div className="member-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.1rem', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `linear-gradient(135deg, ${BLUE}22, ${BLUE}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: BLUE, flexShrink: 0, border: `1.5px solid ${BLUE}33` }}>
                {initials(name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email || '—'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                <span style={{ padding: '3px 10px', borderRadius: 30, background: roleBg, color: roleColor, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>{formatRole(member.role_comite || role)}</span>
                <span style={{ padding: '3px 10px', borderRadius: 30, background: sm.bg, color: sm.color, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>{sm.label}</span>
            </div>
        </div>
    );
}

function ActionCard({ icon, title, desc, href, color, gradFrom, gradTo, locked = false }) {
    return (
        <button type="button" className={locked ? '' : 'action-card'} onClick={() => !locked && router.visit(href)} disabled={locked}
            style={{ background: locked ? '#f8fafc' : `linear-gradient(160deg, ${gradFrom}, ${gradTo})`, border: `1.5px solid ${locked ? '#e2e8f0' : color + '28'}`, borderRadius: 18, padding: '1.4rem', textAlign: 'left', cursor: locked ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: locked ? 'none' : `0 4px 14px ${color}18`, opacity: locked ? 0.55 : 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: locked ? '#94a3b8' : color, boxShadow: `0 2px 10px ${locked ? '#0001' : color + '28'}` }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 800, color: locked ? '#94a3b8' : '#0f172a', fontSize: 14, lineHeight: 1.3 }}>{title}</p>
                <p style={{ margin: '5px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600, lineHeight: 1.5 }}>{desc}</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: locked ? '#94a3b8' : color, display: 'flex', alignItems: 'center', gap: 4 }}>
                {locked ? 'Verrouillé' : <>Accéder <span style={{ fontSize: 16 }}>→</span></>}
            </span>
        </button>
    );
}

function TimelineItem({ index, label, done, active, showLine }) {
    const circBg    = done ? GREEN : active ? BLUE : '#e2e8f0';
    const circColor = done || active ? '#fff' : '#94a3b8';
    const subText   = done ? 'Terminé' : active ? 'En cours' : 'En attente';
    const subColor  = done ? GREEN : active ? BLUE : '#94a3b8';

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: circBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: circColor, transition: 'background .3s', boxShadow: done || active ? `0 2px 10px ${circBg}55` : 'none' }}>
                    {done ? '✓' : index}
                </div>
                {showLine && (
                    <div style={{ width: 2, height: 22, background: done ? `linear-gradient(${GREEN}, ${GREEN}44)` : '#e8edf3', margin: '3px 0', borderRadius: 99 }} />
                )}
            </div>
            <div style={{ paddingTop: 5 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: done || active ? '#0f172a' : '#94a3b8', lineHeight: 1.3 }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 700, color: subColor }}>{subText}</p>
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <IcoFile size={32} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>{text}</p>
        </div>
    );
}

/* ─── Helpers ─── */

function initials(name) {
    if (!name) return 'EX';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'EX';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatRole(role) {
    return { chef_comite: 'Coordinateur', expert: 'Expert' }[role] || role || 'Expert';
}

function formatDate(value) {
    if (!value) return 'Non planifiée';
    try { return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return value; }
}

/* ─── Inline SVG icon primitives ─── */

function ArrowLeft({ size = 16 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}
function ChevronRight() {
    return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function IcoChart({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IcoFile({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IcoClip({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
}
function IcoUsers({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcoBuilding({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>;
}
function IcoShield({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IcoStar({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function IcoCheck({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function IcoNote({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IcoPin({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function IcoCal({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcoRole({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IcoRole2({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

DossierShow.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
