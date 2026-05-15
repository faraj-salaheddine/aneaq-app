import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

const BLUE  = '#0C447C';
const GREEN = '#1D9E75';

const STATUS_META = {
    en_attente:          { label: 'En attente',       color: '#94a3b8', bg: '#f8fafc' },
    invite:              { label: 'Invité',            color: '#64748b', bg: '#f1f5f9' },
    confirme_par_expert: { label: 'Confirmé expert',  color: '#3b82f6', bg: '#eff6ff' },
    comite_confirme:     { label: 'Comité confirmé',  color: '#8b5cf6', bg: '#f5f3ff' },
    visite_planifiee:    { label: 'Visite planifiée', color: '#f97316', bg: '#fff7ed' },
    visite_realisee:     { label: 'Visite réalisée',  color: '#10b981', bg: '#ecfdf5' },
    rapport_depose:      { label: 'Rapport déposé',   color: '#0ea5e9', bg: '#f0f9ff' },
    rapport_valide:      { label: 'Rapport validé',   color: GREEN,     bg: '#ecfdf5' },
    refuse:              { label: 'Refusé',            color: '#ef4444', bg: '#fef2f2' },
};

const DOSSIER_STATUS = {
    soumis:    { label: 'Soumis',    color: '#3b82f6', bg: '#eff6ff' },
    en_cours:  { label: 'En cours',  color: '#f97316', bg: '#fff7ed' },
    termine:   { label: 'Terminé',   color: GREEN,     bg: '#ecfdf5' },
    archive:   { label: 'Archivé',   color: '#64748b', bg: '#f1f5f9' },
};

function ProgressBar({ value, color = BLUE, height = 6 }) {
    return (
        <div style={{ background: '#e2e8f0', borderRadius: 99, height, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }}/>
        </div>
    );
}

function StepDots({ steps }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div title={s.label} style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: s.done ? GREEN : '#e2e8f0',
                        border: `2px solid ${s.done ? GREEN : '#cbd5e1'}`,
                        flexShrink: 0,
                        transition: 'background 0.2s',
                    }}/>
                    {i < steps.length - 1 && (
                        <div style={{ width: 16, height: 2, background: s.done ? GREEN : '#e2e8f0', transition: 'background 0.2s' }}/>
                    )}
                </div>
            ))}
        </div>
    );
}

function ExpertRow({ expert }) {
    const sm = STATUS_META[expert.status] ?? { label: expert.status, color: '#64748b', bg: '#f8fafc' };
    const progressColor = expert.progress >= 80 ? GREEN : expert.progress >= 40 ? '#f97316' : '#e11d48';

    return (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f8fafc' }}>
            {/* Avatar */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338ca' }}>
                    {expert.expert.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </span>
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {expert.expert}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{expert.role}</div>
            </div>

            {/* Status badge */}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, color: sm.color, background: sm.bg, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {sm.label}
            </span>

            {/* Step dots */}
            <div style={{ flexShrink: 0 }}>
                <StepDots steps={expert.steps}/>
            </div>

            {/* Progress % */}
            <div style={{ width: 80, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Avancement</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: progressColor }}>{expert.progress}%</span>
                </div>
                <ProgressBar value={expert.progress} color={progressColor} height={5}/>
            </div>

            {/* Rapport icon */}
            <div style={{ flexShrink: 0, width: 20, textAlign: 'center' }}>
                {expert.has_rapport ? (
                    <span title={`Rapport: ${expert.rapport_statut}`} style={{ color: expert.rapport_statut === 'valide' ? GREEN : '#f97316', fontSize: 14 }}>
                        {expert.rapport_statut === 'valide' ? '✓' : '⏳'}
                    </span>
                ) : (
                    <span title="Pas de rapport" style={{ color: '#cbd5e1', fontSize: 14 }}>—</span>
                )}
            </div>
        </div>
    );
}

export default function SuiviAvancement({ dossiers, statuts, filters, totalCriteres }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statut, setStatut] = useState(filters.statut ?? '');
    const [expanded, setExpanded] = useState({});

    const applyFilters = (newStatut) => {
        router.get(route('dee.suivi-avancement.index'), { search, statut: newStatut ?? statut }, { preserveState: true, replace: true });
    };

    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <DashboardShell title="Suivi d'avancement">
            <Head title="Suivi d'avancement"/>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: BLUE, margin: 0 }}>Suivi d'avancement</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
                        Progression des experts par dossier — {dossiers.length} dossier{dossiers.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Rechercher dossier ou établissement…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ flex: 1, minWidth: 260, padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    />
                    <select
                        value={statut}
                        onChange={e => { setStatut(e.target.value); applyFilters(e.target.value); }}
                        style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}
                    >
                        <option value="">Tous les statuts</option>
                        {statuts.map(s => (
                            <option key={s} value={s}>{DOSSIER_STATUS[s]?.label ?? s}</option>
                        ))}
                    </select>
                    <button onClick={() => applyFilters()} style={{ padding: '8px 20px', background: BLUE, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        Filtrer
                    </button>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Étapes :</span>
                    {['Invité', 'Confirmé', 'Évaluations', 'Rapport', 'Validé'].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }}/>
                            <span style={{ fontSize: 11, color: '#475569' }}>{s}</span>
                        </div>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{totalCriteres} critères d'évaluation</span>
                </div>

                {/* Dossier cards */}
                {dossiers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 15 }}>Aucun dossier trouvé</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {dossiers.map(d => {
                            const dsm = DOSSIER_STATUS[d.statut] ?? { label: d.statut, color: '#64748b', bg: '#f8fafc' };
                            const isOpen = expanded[d.id];
                            const progressColor = d.avg_progress >= 80 ? GREEN : d.avg_progress >= 40 ? '#f97316' : '#e11d48';

                            return (
                                <div key={d.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    {/* Card header */}
                                    <div
                                        onClick={() => toggle(d.id)}
                                        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderBottom: isOpen ? '1px solid #f1f5f9' : 'none' }}
                                    >
                                        {/* Progress ring */}
                                        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                                            <svg width={44} height={44} viewBox="0 0 44 44">
                                                <circle cx={22} cy={22} r={18} fill="none" stroke="#e2e8f0" strokeWidth={4}/>
                                                <circle cx={22} cy={22} r={18} fill="none" stroke={progressColor} strokeWidth={4}
                                                    strokeDasharray={`${2 * Math.PI * 18 * d.avg_progress / 100} ${2 * Math.PI * 18}`}
                                                    strokeLinecap="round" transform="rotate(-90 22 22)"/>
                                            </svg>
                                            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: progressColor }}>
                                                {d.avg_progress}%
                                            </span>
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{d.reference}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, color: dsm.color, background: dsm.bg }}>{dsm.label}</span>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{d.etablissement}</div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: BLUE }}>{d.experts.length}</div>
                                                <div style={{ fontSize: 10, color: '#94a3b8' }}>expert{d.experts.length !== 1 ? 's' : ''}</div>
                                            </div>

                                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                                                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                <polyline points="6 9 12 15 18 9"/>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Expert rows */}
                                    {isOpen && (
                                        <div>
                                            {d.experts.length === 0 ? (
                                                <div style={{ padding: '20px 18px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                                                    Aucun expert affecté à ce dossier
                                                </div>
                                            ) : (
                                                d.experts.map(e => <ExpertRow key={e.id} expert={e}/>)
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
