// resources/js/Pages/SI/Etablissements.jsx

import { useState } from "react";
import { Head } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

export default function Etablissements({ etablissements = [] }) {
    const [search, setSearch] = useState("");

    const filtered = etablissements.filter(e =>
        (e.etablissement || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.universite    || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.ville         || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Head title="Établissements" />
            <div style={{ padding: "2rem" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
                        Établissements
                    </h1>
                </div>

                {/* Search */}
                <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: 340 }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}>
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36, width: "100%", boxSizing: "border-box" }}
                    />
                </div>

                {/* Table */}
                <div style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    overflow: "hidden",
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                                {["Établissement", "Université", "Ville"].map(col => (
                                    <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((etab, i) => (
                                <tr key={etab.id} style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                                    <td style={{ padding: "13px 16px", fontSize: 14, color: "var(--color-text-primary)" }}>
                                        <div style={{ fontWeight: 500 }}>{etab.etablissement}</div>
                                    </td>
                                    <td style={{ padding: "13px 16px", fontSize: 14, color: "var(--color-text-primary)" }}>
                                        {etab.universite}
                                    </td>
                                    <td style={{ padding: "13px 16px", fontSize: 14, color: "var(--color-text-primary)" }}>
                                        {etab.ville}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: "2rem", textAlign: "center", fontSize: 14, color: "var(--color-text-secondary)" }}>
                                        Aucun résultat trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {filtered.length > 0 && (
                    <p style={{ marginTop: "1rem", fontSize: 13, color: "var(--color-text-secondary)" }}>
                        {filtered.length} établissement{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
                    </p>
                )}
            </div>
        </>
    );
}

Etablissements.layout = page => <DashboardLayout>{page}</DashboardLayout>;