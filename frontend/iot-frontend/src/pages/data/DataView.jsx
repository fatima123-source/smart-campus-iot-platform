/**
 * DataView.jsx
 * Mohammed - Consultation des données (Service 1)
 *
 * Fonctionnalités :
 *  - Filtrage par salle / type / unité
 *  - Recherche textuelle
 *  - Visualisation des données (cartes + graphe)
 *  - Export PDF
 */

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllSalles, getCapteurs, getHistorique } from "../../services/api";

// ─── Icônes SVG inline ───────────────────────────────────────────────
const Icons = {
  temperature: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  ),
  presence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  energie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  gaz: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  pdf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
};

// ─── Config types capteurs ────────────────────────────────────────────
const SENSOR_CONFIG = {
  temperature_C: {
    label: "Température",
    unit: "°C",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.3)",
    icon: Icons.temperature,
    filter: { type: "temperature", unit: "°C" },
  },
  presence: {
    label: "Occupation",
    unit: "pers",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    icon: Icons.presence,
    filter: { type: "presence" },
  },
  energie: {
    label: "Consommation",
    unit: "kWh",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    icon: Icons.energie,
    filter: { type: "energie" },
  },
  gaz: {
    label: "Gaz / CO₂",
    unit: "ppm",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
    icon: Icons.gaz,
    filter: { type: "temperature", unit: "ppm" },
  },
};

// ─── Composant carte capteur ──────────────────────────────────────────
const SensorCard = ({ config, capteurs }) => {
  const relevant = capteurs.filter((c) => {
    if (config.filter.unit) {
      return c.type === config.filter.type && c.unit === config.filter.unit;
    }
    return c.type === config.filter.type;
  });

  const avg =
    relevant.length > 0
      ? (relevant.reduce((s, c) => s + c.value, 0) / relevant.length).toFixed(1)
      : "—";

  const max =
    relevant.length > 0
      ? Math.max(...relevant.map((c) => c.value)).toFixed(1)
      : "—";

  const min =
    relevant.length > 0
      ? Math.min(...relevant.map((c) => c.value)).toFixed(1)
      : "—";

  return (
    <div style={{
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      transition: "transform 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: config.color }}>{config.icon}</span>
        <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "15px" }}>
          {config.label}
        </span>
        <span style={{
          marginLeft: "auto",
          background: config.color,
          color: "#fff",
          borderRadius: "20px",
          padding: "2px 10px",
          fontSize: "12px",
          fontWeight: 600,
        }}>
          {relevant.length} capteurs
        </span>
      </div>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>Moyenne</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: config.color, lineHeight: 1 }}>
            {avg}
            <span style={{ fontSize: "14px", fontWeight: 400, marginLeft: "4px" }}>
              {config.unit}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            Min: <span style={{ color: "#1e293b", fontWeight: 600 }}>{min} {relevant.length > 0 ? config.unit : ""}</span>
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            Max: <span style={{ color: "#1e293b", fontWeight: 600 }}>{max} {relevant.length > 0 ? config.unit : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────
export default function DataView() {
  const [salles, setSalles] = useState([]);
  const [capteurs, setCapteurs] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(false);

  // Filtres
  const [selectedSalle, setSelectedSalle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [search, setSearch] = useState("");

  // ─── Chargement initial des salles ─────────────────────────────────
  useEffect(() => {
    getAllSalles()
      .then((res) => setSalles(res.data))
      .catch((err) => console.error("Erreur salles:", err));
  }, []);

  // ─── Chargement capteurs selon filtres ─────────────────────────────
  useEffect(() => {
    fetchCapteurs();
  }, [selectedSalle, selectedType, selectedUnit, search]);

  const fetchCapteurs = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedSalle) filters.salleId = selectedSalle;
      if (selectedType)  filters.type = selectedType;
      if (selectedUnit)  filters.unit = selectedUnit;
      if (search)        filters.search = search;

      const res = await getCapteurs(filters);
      setCapteurs(res.data);
    } catch (err) {
      console.error("Erreur capteurs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Chargement historique quand une salle est sélectionnée ────────
  useEffect(() => {
    if (!selectedSalle) {
      setHistorique([]);
      return;
    }
    setHistLoading(true);
    getHistorique(selectedSalle)
      .then((res) => setHistorique(res.data))
      .catch((err) => console.error("Erreur historique:", err))
      .finally(() => setHistLoading(false));
  }, [selectedSalle]);

  // ─── Reset filtres ──────────────────────────────────────────────────
  const resetFiltres = () => {
    setSelectedSalle("");
    setSelectedType("");
    setSelectedUnit("");
    setSearch("");
  };

  // ─── Préparer données graphe ────────────────────────────────────────
// ✅ SOLUTION — regrouper toutes les valeurs par timestamp
const graphData = (() => {
  const grouped = {};

  historique.forEach((h) => {
    // Arrondir au timestamp le plus proche (minute)
    const time = new Date(h.timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!grouped[time]) {
      grouped[time] = { time };
    }

    // Déterminer la clé selon type + unité
    const key =
      h.type === "temperature" && h.unit === "ppm"
        ? "gaz"
        : h.type;

    grouped[time][key] = h.value;
  });

  // Convertir en tableau trié par temps
  return Object.values(grouped).reverse();
})();
  // ─── Export PDF ─────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("Rapport Données Capteurs - SmartCampus", 14, 18);

    // Sous-titre avec filtres appliqués
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const salleName = selectedSalle
      ? salles.find((s) => s._id === selectedSalle)?.name || selectedSalle
      : "Toutes les salles";
    doc.text(
      `Salle: ${salleName} | Type: ${selectedType || "Tous"} | Date: ${new Date().toLocaleDateString("fr-FR")}`,
      14,
      26
    );

    // Tableau des capteurs
    autoTable(doc, {
      startY: 32,
      head: [["Salle", "Code", "Type", "Valeur", "Unité", "Statut", "Dernière MAJ"]],
      body: capteurs.map((c) => [
        c.salleId?.name || "—",
        c.salleId?.code || "—",
        c.type,
        c.value,
        c.unit,
        c.status,
        new Date(c.lastUpdate).toLocaleString("fr-FR"),
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });

    doc.save(`donnees_capteurs_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ─── Rendu ──────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#1e293b",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
        padding: "28px 32px",
        color: "#fff",
      }}>
        <h1 style={{ margin: 0, fontSize: "1.5em", fontWeight: 700 }}>
          Consultation des Données
        </h1>
        <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: "14px" }}>
          SmartCampus — Capteurs en temps réel
        </p>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* ── Barre de filtres ── */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}>

          {/* Recherche */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <span style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "#94a3b8",
            }}>
              {Icons.search}
            </span>
            <input
              type="text"
              placeholder="Rechercher une salle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px 10px 38px",
                border: "1px solid #e2e8f0", borderRadius: "8px",
                fontSize: "14px", outline: "none", boxSizing: "border-box",
                background: "#f8fafc",
              }}
            />
          </div>

          {/* Salle */}
          <select
            value={selectedSalle}
            onChange={(e) => setSelectedSalle(e.target.value)}
            style={{
              padding: "10px 14px", border: "1px solid #e2e8f0",
              borderRadius: "8px", fontSize: "14px", background: "#f8fafc",
              outline: "none", minWidth: "180px", cursor: "pointer",
            }}
          >
            <option value="">🏫 Toutes les salles</option>
            {salles.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.type})
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedUnit(""); }}
            style={{
              padding: "10px 14px", border: "1px solid #e2e8f0",
              borderRadius: "8px", fontSize: "14px", background: "#f8fafc",
              outline: "none", minWidth: "160px", cursor: "pointer",
            }}
          >
            <option value="">📡 Tous les types</option>
            <option value="temperature">🌡️ Température</option>
            <option value="presence">👥 Présence</option>
            <option value="energie">⚡ Énergie</option>
          </select>

          {/* Unité (pour distinguer °C et ppm) */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            style={{
              padding: "10px 14px", border: "1px solid #e2e8f0",
              borderRadius: "8px", fontSize: "14px", background: "#f8fafc",
              outline: "none", minWidth: "140px", cursor: "pointer",
            }}
          >
            <option value="">📏 Toutes unités</option>
            <option value="°C">°C — Température</option>
            <option value="ppm">ppm — Gaz/CO₂</option>
            <option value="persons">pers — Présence</option>
            <option value="kWh">kWh — Énergie</option>
          </select>

          {/* Boutons */}
          <button
            onClick={resetFiltres}
            style={{
              padding: "10px 16px", background: "#f1f5f9",
              border: "1px solid #e2e8f0", borderRadius: "8px",
              fontSize: "14px", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "6px", color: "#475569",
            }}
          >
            {Icons.refresh} Reset
          </button>

          <button
            onClick={exportPDF}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #0f766e, #0d9488)",
              border: "none", borderRadius: "8px", fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center",
              gap: "6px", color: "#fff", fontWeight: 600,
            }}
          >
            {Icons.pdf} Exporter PDF
          </button>
        </div>

        {/* ── Résumé ── */}
        <div style={{
          marginBottom: "20px", fontSize: "13px", color: "#64748b",
        }}>
          {loading ? "Chargement..." : (
            <>
              <span style={{ fontWeight: 600, color: "#0f766e" }}>
                {capteurs.length}
              </span> capteur(s) trouvé(s)
              {selectedSalle && (
                <span> — Salle : <strong>
                  {salles.find(s => s._id === selectedSalle)?.name}
                </strong></span>
              )}
            </>
          )}
        </div>

        {/* ── Cartes résumé ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {Object.entries(SENSOR_CONFIG).map(([key, config]) => (
            <SensorCard key={key} config={config} capteurs={capteurs} />
          ))}
        </div>

        {/* ── Graphe historique ── */}
        {selectedSalle && (
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600 }}>
              📈 Historique — {salles.find(s => s._id === selectedSalle)?.name}
            </h3>
            {histLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                Chargement historique...
              </div>
            ) : historique.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                Aucun historique disponible pour cette salle.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px", border: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Température (°C)" />
                  <Line type="monotone" dataKey="presence" stroke="#3b82f6" strokeWidth={2} dot={false} name="Présence (pers)" />
                  <Line type="monotone" dataKey="energie" stroke="#10b981" strokeWidth={2} dot={false} name="Énergie (kWh)" />
                  <Line type="monotone" dataKey="gaz" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Gaz (ppm)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* ── Tableau des capteurs ── */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              🗂️ Détail des capteurs
            </h3>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              Chargement...
            </div>
          ) : capteurs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              Aucun capteur trouvé avec ces filtres.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Salle", "Code", "Type", "Valeur", "Unité", "Statut", "Dernière MAJ"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px", textAlign: "left",
                        fontWeight: 600, color: "#64748b", fontSize: "12px",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        borderBottom: "1px solid #f1f5f9",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {capteurs.map((c, i) => (
                    <tr key={c._id} style={{
                      background: i % 2 === 0 ? "#fff" : "#fafbfc",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf9"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                        {c.salleId?.name || "—"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "13px" }}>
                        {c.salleId?.code || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          background: c.type === "temperature" ? "rgba(249,115,22,0.1)"
                            : c.type === "presence" ? "rgba(59,130,246,0.1)"
                            : c.type === "energie" ? "rgba(16,185,129,0.1)"
                            : "rgba(139,92,246,0.1)",
                          color: c.type === "temperature" ? "#f97316"
                            : c.type === "presence" ? "#3b82f6"
                            : c.type === "energie" ? "#10b981"
                            : "#8b5cf6",
                          padding: "3px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 600,
                        }}>
                          {c.type === "temperature" && c.unit === "ppm" ? "gaz" : c.type}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: "15px" }}>
                        {c.value}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>
                        {c.unit}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: c.status === "actif" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          color: c.status === "actif" ? "#10b981" : "#ef4444",
                          padding: "3px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 600,
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px" }}>
                        {new Date(c.lastUpdate).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}