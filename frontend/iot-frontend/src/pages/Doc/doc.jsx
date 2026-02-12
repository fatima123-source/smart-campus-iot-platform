
import { useState } from "react";

const Doc = () => {
  const [tab, setTab] = useState("capteurs");

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1>Documentation API</h1>
        <p>Points d'accès REST pour l’intégration avec la plateforme Smart Campus</p>
      </div>

      {/* INFORMATIONS GENERALES */}
      <section style={styles.card}>
        <h2>Informations Générales</h2>
        <p style={styles.muted}>Configuration de base pour utiliser l’API</p>

        <div style={styles.block}>
          <strong>Base URL</strong>
          <pre style={styles.code}>https://api.smart-campus.university.fr</pre>
        </div>

        <div style={styles.block}>
          <strong>Authentification</strong>
          <pre style={styles.code}>Authorization: Bearer YOUR_API_KEY</pre>
        </div>

        <div style={styles.block}>
          <strong>Content-Type</strong>
          <pre style={styles.code}>application/json</pre>
        </div>
      </section>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          style={tab === "capteurs" ? styles.activeTab : styles.tab}
          onClick={() => setTab("capteurs")}
        >
          Capteurs
        </button>
        <button
          style={tab === "events" ? styles.activeTab : styles.tab}
          onClick={() => setTab("events")}
        >
          Événements
        </button>
        <button
          style={tab === "actions" ? styles.activeTab : styles.tab}
          onClick={() => setTab("actions")}
        >
          Actions
        </button>
      </div>

      {/* CAPTEURS */}
      {tab === "capteurs" && (
        <section style={styles.card}>
          <h2>Endpoints – Capteurs</h2>
          <p style={styles.muted}>Gestion des capteurs IoT</p>

          <div style={styles.endpoint}>
            <span style={styles.get}>GET</span>
            <code>/api/sensors</code>
          </div>

          <p>Récupérer tous les capteurs</p>

          <pre style={styles.code}>
{`[
  {
    "id": "sensor-1",
    "type": "Température",
    "value": 23.5
  }
]`}
          </pre>
        </section>
      )}

      {/* EVENEMENTS */}
      {tab === "events" && (
        <section style={styles.card}>
          <h2>Endpoints – Événements</h2>
          <p style={styles.muted}>Gestion des règles et événements</p>

          <div style={styles.endpoint}>
            <span style={styles.get}>GET</span>
            <code>/api/events</code>
          </div>

          <p>Récupérer tous les événements</p>

          <pre style={styles.code}>
{`[
  {
    "id": "event-1",
    "name": "Température élevée",
    "triggered": false
  }
]`}
          </pre>
        </section>
      )}

      {/* ACTIONS */}
      {tab === "actions" && (
        <section style={styles.card}>
          <h2>Endpoints – Actions</h2>
          <p style={styles.muted}>Exécution des actions automatiques</p>

          <div style={styles.endpoint}>
            <span style={styles.post}>POST</span>
            <code>/api/actions</code>
          </div>

          <p>Déclencher une action</p>

          <pre style={styles.code}>
{`{
  "action": "Activer alarme",
  "target": "Salle A"
}`}
          </pre>
        </section>
      )}

      {/* CODES HTTP */}
      <section style={styles.card}>
        <h2>Codes de Réponse HTTP</h2>

        <ul style={styles.httpList}>
          <li><span style={styles.ok}>200</span> OK – Requête réussie</li>
          <li><span style={styles.ok}>201</span> Created – Ressource créée</li>
          <li><span style={styles.warn}>400</span> Bad Request</li>
          <li><span style={styles.warn}>401</span> Unauthorized</li>
          <li><span style={styles.warn}>404</span> Not Found</li>
          <li><span style={styles.err}>500</span> Server Error</li>
        </ul>
      </section>

    </div>
  );
};

export default Doc;

/* =======================
   STYLES CSS (INLINE)
======================= */

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    background: "#f5f7fb",
    minHeight: "100vh"
  },
  header: {
    marginBottom: "20px"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },
  muted: {
    color: "#6b7280",
    fontSize: "14px"
  },
  block: {
    marginTop: "10px"
  },
  code: {
    background: "#f1f5f9",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    overflowX: "auto"
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#e5e7eb"
  },
  activeTab: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff"
  },
  endpoint: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px"
  },
  get: {
    background: "#22c55e",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px"
  },
  post: {
    background: "#3b82f6",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px"
  },
  httpList: {
    listStyle: "none",
    padding: 0
  },
  ok: {
    background: "#22c55e",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    marginRight: "8px"
  },
  warn: {
    background: "#f97316",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    marginRight: "8px"
  },
  err: {
    background: "#ef4444",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    marginRight: "8px"
  }
};
