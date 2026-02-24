import { useState, useEffect } from "react";

export default function Tables() {
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/capteurs/recentes')
      .then(res => res.json())
      .then(data => {
        setRecentes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("❌ Erreur:", error);
        setLoading(false);
      });
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Fonction pour obtenir l'icône selon le type de capteur
  const getIcon = (type) => {
    const icons = {
      'temperature': '',
      'humidite': '',
      'luminosite': '',
      'mouvement': '',
      'pression': '',
      'qualite_air': '',
      'energie': '',
      'presence': '',
      'co2': '',
      'bruit': '',
      'light': '',
      'ac': '',
      'alarm': ''
    };
    return icons[type] || '';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        DERNIÈRES DONNÉES REÇUES
      </h2>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : recentes.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}></div>
          <h3>Aucune donnée disponible</h3>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Valeur</th>
                <th style={styles.th}>Unité</th>
               <th style={styles.th}>Salle</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map((capteur, index) => (
                <tr key={index} style={{
                  ...styles.tableRow,
                  background: index % 2 === 0 ? "#f8f9fa" : "white"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#e8f0fe"}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#f8f9fa" : "white"}
                >
                  <td style={styles.td}>
                    <span style={styles.icon}>{getIcon(capteur.type)}</span>
                    {capteur.type}
                  </td>
                  <td style={{...styles.td, fontWeight: "bold"}}>
                    {typeof capteur.value === 'number' ? capteur.value.toFixed(2) : capteur.value}
                  </td>
                  <td style={{...styles.td, color: "#666"}}>
                    {capteur.unit || '-'}
                  </td>
                  <td style={styles.td}>
                    {capteur.salleId?.substring(0, 8) || 'N/A'}...
                  </td>
                  <td style={{...styles.td, color: "#666"}}>
                    {formatDate(capteur.lastUpdate)}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.status,
                      background: capteur.status === 'actif' ? '#4CAF50' : '#f44336'
                    }}>
                      {capteur.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.updateTime}>
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </span>
        <button 
          onClick={() => window.location.reload()}
          style={styles.refreshButton}
        >
          Rafraîchir
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  title: {
    color: "#333",
    margin: "0 0 20px 0",
    fontSize: "1.8em",
    borderBottom: "3px solid #2249f6",
    paddingBottom: "10px"
  },
  tableContainer: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95em"
  },
  tableHeader: {
    background: "#2a4ef2",
    color: "white"
  },
  th: {
    padding: "15px",
    textAlign: "left"
  },
  tableRow: {
    borderBottom: "1px solid #e0e0e0",
    transition: "background 0.2s",
    cursor: "pointer"
  },
  td: {
    padding: "12px 15px"
  },
  icon: {
    fontSize: "1.2em",
    marginRight: "8px"
  },
  status: {
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.85em"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px"
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #2447e7",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    margin: "0 auto"
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px",
    background: "#f8f9fa",
    borderRadius: "10px",
    color: "#666"
  },
  emptyIcon: {
    fontSize: "4em",
    marginBottom: "20px"
  },
  footer: {
    marginTop: "20px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  updateTime: {
    color: "#666"
  },
  refreshButton: {
    background: "#2146ed",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9em"
  }
};