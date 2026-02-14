import { useState } from "react";

const ApiDoc = () => {
  const [activeTab, setActiveTab] = useState("capteurs");
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = {
    capteurs: [
      {
        method: "GET",
        path: "/api/sensors",
        description: "Récupérer tous les capteurs",
        response: `[
  {
    "id": "sensor-001",
    "name": "Capteur température",
    "type": "temperature",
    "value": 22.5,
    "location": "Salle A101"
  }
]`
      },
      {
        method: "POST",
        path: "/api/sensors",
        description: "Créer un nouveau capteur",
        body: `{
  "name": "Capteur humidité",
  "type": "humidity",
  "location": "Salle B202"
}`,
        response: `{
  "id": "sensor-002",
  "name": "Capteur humidité",
  "type": "humidity",
  "value": null,
  "location": "Salle B202"
}`
      },
      {
        method: "PUT",
        path: "/api/sensors/:id",
        description: "Mettre à jour un capteur",
        body: `{
  "value": 45.2
}`,
        response: `{
  "id": "sensor-001",
  "name": "Capteur température",
  "type": "temperature",
  "value": 45.2,
  "location": "Salle A101"
}`
      },
      {
        method: "DELETE",
        path: "/api/sensors/:id",
        description: "Supprimer un capteur",
        response: `{
  "message": "Capteur supprimé"
}`
      }
    ],
    evenements: [
      {
        method: "GET",
        path: "/api/events",
        description: "Récupérer tous les événements",
        response: `[
  {
    "id": "event-001",
    "name": "Température élevée",
    "condition": "temperature > 30",
    "actions": ["notification"],
    "active": true
  }
]`
      },
      {
        method: "POST",
        path: "/api/events",
        description: "Créer un événement",
        body: `{
  "name": "Détection mouvement",
  "condition": "motion = true",
  "actions": ["allumer lumières"]
}`,
        response: `{
  "id": "event-002",
  "name": "Détection mouvement",
  "condition": "motion = true",
  "actions": ["allumer lumières"],
  "active": true
}`
      }
    ],
    actions: [
      {
        method: "GET",
        path: "/api/commands",
        description: "Récupérer toutes les commandes",
        response: `[
  {
    "application": "AppFSR",
    "device": "Climatiseur",
    "codeSalle" : "BIO-B102"
    "action": "SET_TEMP",
    "value": "23"
  }
]`
      },
      {
        method: "POST",
        path: "/api/commands",
        description: "Créer une commande",
        body: `{
  "application": "Climatisation",
  "device": "Climatiseur",
  "action": "éteindre"
}`,
        response: `{
  "id": "cmd-002",
  "application": "Climatisation",
  "device": "Climatiseur",
  "action": "éteindre",
  "status": "PENDING"
}`
      },
      {
        method: "PUT",
        path: "/api/commands/:id/execute",
        description: "Exécuter une commande",
        response: `{
  "id": "cmd-002",
  "status": "EXECUTED",
  "message": "Commande exécutée"
}`
      }
    ]
  };

  const getMethodStyle = (method) => {
    const styles = {
      GET: { background: "#e8f5e9", color: "#2e7d32" },
      POST: { background: "#e3f2fd", color: "#1565c0" },
      PUT: { background: "#fff3e0", color: "#ef6c00" },
      DELETE: { background: "#ffebee", color: "#c62828" }
    };
    return styles[method] || styles.GET;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Documentation API</h1>
        <p style={styles.subtitle}>Smart Campus </p>
      </div>

      {/* Base URL */}
      <div style={styles.baseUrlCard}>
        <div style={styles.baseUrlContent}>
          <span style={styles.baseUrlLabel}>Base URL</span>
          <code style={styles.baseUrl}>https://api.smart-campus.university/v1</code>
          <button
            onClick={() => copyToClipboard("https://api.smart-campus.university", "baseurl")}
            style={styles.copyButton}
          >
            {copied === "baseurl" ? "✓" : "Copier"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "capteurs" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("capteurs")}
        >
          Capteurs
        </button>
        <button
          style={activeTab === "evenements" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("evenements")}
        >
          Événements
        </button>
        <button
          style={activeTab === "actions" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("actions")}
        >
          Actions
        </button>
      </div>

      {/* Endpoints */}
      <div style={styles.endpointsContainer}>
        {endpoints[activeTab].map((endpoint, index) => {
          const methodStyle = getMethodStyle(endpoint.method);
          return (
            <div key={index} style={styles.endpointCard}>
              {/* En-tête avec méthode et chemin */}
              <div style={styles.endpointHeader}>
                <div style={styles.endpointPath}>
                  <span style={{
                    ...styles.method,
                    background: methodStyle.background,
                    color: methodStyle.color
                  }}>
                    {endpoint.method}
                  </span>
                  <code style={styles.path}>{endpoint.path}</code>
                </div>
              </div>

              {/* Description */}
              <p style={styles.description}>{endpoint.description}</p>

              {/* Corps de la requête (si existe) */}
              {endpoint.body && (
                <div style={styles.block}>
                  <div style={styles.blockHeader}>
                    <span style={styles.blockTitle}>Corps de la requête</span>
                    <button
                      onClick={() => copyToClipboard(endpoint.body, `body-${activeTab}-${index}`)}
                      style={styles.smallCopyButton}
                    >
                      {copied === `body-${activeTab}-${index}` ? "✓" : "Copier"}
                    </button>
                  </div>
                  <pre style={styles.code}>{endpoint.body}</pre>
                </div>
              )}

              {/* Réponse */}
              <div style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockTitle}>Réponse</span>
                  <button
                    onClick={() => copyToClipboard(endpoint.response, `response-${activeTab}-${index}`)}
                    style={styles.smallCopyButton}
                  >
                    {copied === `response-${activeTab}-${index}` ? "✓" : "Copier"}
                  </button>
                </div>
                <pre style={styles.code}>{endpoint.response}</pre>
              </div>

              {/* Séparateur sauf pour le dernier */}
              {index < endpoints[activeTab].length - 1 && <hr style={styles.divider} />}
            </div>
          );
        })}
      </div>

      {/* Codes HTTP */}
      <div style={styles.httpCard}>
        <h3 style={styles.httpTitle}>Codes de réponse HTTP</h3>
        <div style={styles.httpGrid}>
          <div style={styles.httpItem}>
            <span style={{...styles.httpCode, background: "#2e7d32"}}>200</span>
            <span>OK</span>
          </div>
          <div style={styles.httpItem}>
            <span style={{...styles.httpCode, background: "#2e7d32"}}>201</span>
            <span>Créé</span>
          </div>
          <div style={styles.httpItem}>
            <span style={{...styles.httpCode, background: "#ef6c00"}}>400</span>
            <span>Requête invalide</span>
          </div>
          <div style={styles.httpItem}>
            <span style={{...styles.httpCode, background: "#ef6c00"}}>401</span>
            <span>Non authentifié</span>
          </div>
          <div style={styles.httpItem}>
            <span style={{...styles.httpCode, background: "#ef6c00"}}>404</span>
            <span>Non trouvé</span>
          </div>
          <div style={styles.httpItem}>
            <span style={{...styles.httpCode, background: "#c62828"}}>500</span>
            <span>Erreur serveur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: "#f5f7fa",
    minHeight: "100vh"
  },
  header: {
    marginBottom: "30px"
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#1a2639",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "16px",
    color: "#5a6a7e",
    margin: 0
  },
  baseUrlCard: {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eef2f6"
  },
  baseUrlContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap"
  },
  baseUrlLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#5a6a7e",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  baseUrl: {
    background: "#f0f4f8",
    padding: "8px 15px",
    borderRadius: "6px",
    fontSize: "15px",
    color: "#2c3e50",
    fontFamily: "monospace",
    flex: 1
  },
  copyButton: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
    borderBottom: "2px solid #eef2f6",
    paddingBottom: "10px"
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    background: "transparent",
    fontSize: "16px",
    color: "#5a6a7e",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "all 0.2s"
  },
  activeTab: {
    padding: "10px 20px",
    border: "none",
    background: "#3b82f6",
    fontSize: "16px",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px"
  },
  endpointsContainer: {
    marginBottom: "30px"
  },
  endpointCard: {
    background: "white",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eef2f6"
  },
  endpointHeader: {
    marginBottom: "15px"
  },
  endpointPath: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  method: {
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
    minWidth: "60px",
    textAlign: "center"
  },
  path: {
    fontSize: "15px",
    color: "#2c3e50",
    fontFamily: "monospace"
  },
  description: {
    fontSize: "15px",
    color: "#5a6a7e",
    margin: "0 0 20px 0"
  },
  block: {
    marginTop: "20px"
  },
  blockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  blockTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#5a6a7e"
  },
  code: {
    background: "#1e2b3a",
    color: "#e5e9f0",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "monospace",
    overflowX: "auto",
    margin: 0,
    lineHeight: "1.5"
  },
  smallCopyButton: {
    background: "transparent",
    border: "1px solid #d0d9e5",
    borderRadius: "4px",
    padding: "4px 10px",
    fontSize: "12px",
    color: "#5a6a7e",
    cursor: "pointer"
  },
  divider: {
    border: "none",
    borderTop: "1px solid #eef2f6",
    margin: "25px 0 15px 0"
  },
  httpCard: {
    background: "white",
    borderRadius: "10px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eef2f6"
  },
  httpTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a2639",
    margin: "0 0 20px 0"
  },
  httpGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px"
  },
  httpItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  httpCode: {
    padding: "4px 8px",
    borderRadius: "4px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    minWidth: "45px",
    textAlign: "center"
  }
};

export default ApiDoc;