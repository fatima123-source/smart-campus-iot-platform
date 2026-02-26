import { useState, useEffect } from "react";

export default function AlertSection() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous'); // 'tous', 'urgents', 'vider'

  useEffect(() => {
    fetchEvenements();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchEvenements, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvenements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/evenements');
      const data = await response.json();
      console.log("Événements reçus:", data);
      
      // Ajouter les propriétés manquantes aux événements
      const enrichedData = data.map(event => ({
        ...event,
        urgent: event.type === 'salle_pleine',
        icone: event.type === 'salle_pleine' ? '' : 
               event.type === 'salle_vide' ? '' : '',
        couleur: event.type === 'salle_pleine' ? '#e74c3c' : 
                 event.type === 'salle_vide' ? '#f39c12' : '#3498db'
      }));
      
      setEvenements(enrichedData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur:", error);
      setLoading(false);
    }
  };

  // Filtrer les événements
  const evenementsFiltres = evenements.filter(event => {
    if (filtre === 'urgents') return event.urgent;
    if (filtre === 'vider') return event.type === 'salle_vide';
    return true;
  });

  // Compter par type
  const stats = {
    total: evenements.length,
    urgents: evenements.filter(e => e.urgent).length,
    vides: evenements.filter(e => e.type === 'salle_vide').length
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <span style={styles.headerIcon}></span>
          <h2 style={styles.title}>Événements Récents</h2>
        </div>
        
        <div style={styles.stats}>
          <span style={{...styles.badge, background: '#e74c3c'}}>
             {stats.urgents}
          </span>
          <span style={{...styles.badge, background: '#f39c12'}}>
            {stats.vides}
          </span>
          <span style={{...styles.badge, background: '#3498db'}}>
            {stats.total}
          </span>
        </div>
      </div>

      <div style={styles.filtres}>
        <button 
          onClick={() => setFiltre('tous')}
          style={{
            ...styles.filtreBtn,
            background: filtre === 'tous' ? '#667eea' : '#f0f0f0',
            color: filtre === 'tous' ? 'white' : '#333'
          }}
        >
          Tous ({stats.total})
        </button>
        <button 
          onClick={() => setFiltre('urgents')}
          style={{
            ...styles.filtreBtn,
            background: filtre === 'urgents' ? '#e74c3c' : '#f0f0f0',
            color: filtre === 'urgents' ? 'white' : '#333'
          }}
        >
           Urgents ({stats.urgents})
        </button>
        <button 
          onClick={() => setFiltre('vider')}
          style={{
            ...styles.filtreBtn,
            background: filtre === 'vider' ? '#f39c12' : '#f0f0f0',
            color: filtre === 'vider' ? 'white' : '#333'
          }}
        >
           Salles vides ({stats.vides})
        </button>
      </div>

      <div style={styles.eventsList}>
        {evenementsFiltres.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}></div>
            <p>Aucun événement à afficher</p>
          </div>
        ) : (
          evenementsFiltres.map((event, index) => (
            <div 
              key={index}
              style={{
                ...styles.eventCard,
                borderLeft: `5px solid ${event.couleur || '#3498db'}`,
                background: event.urgent ? '#fff5f5' : 'white'
              }}
            >
              <div style={styles.eventHeader}>
                <span style={styles.eventIcon}>{event.icone || ''}</span>
                <span style={styles.eventType}>{event.type || 'inconnu'}</span>
                <span style={styles.eventTime}>{formatDate(event.timestamp)}</span>
              </div>
              
              <div style={styles.eventMessage}>
                <strong>{event.salle || 'Salle inconnue'}</strong>
              </div>
              
              <div style={styles.eventDetails}>
                {event.temperature && (
                  <span style={styles.detail}>
                  {event.temperature}°C
                  </span>
                )}
                {event.humidite && (
                  <span style={styles.detail}>
                    {event.humidite}%
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={fetchEvenements}
        style={styles.refreshButton}
      >
      Actualiser
      </button>
    </div>
  );
}

const styles = {
  container: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    maxWidth: "1200px",
    margin: "0 auto 30px auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "2px solid #f0f0f0"
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  headerIcon: {
    fontSize: "1.8em"
  },
  title: {
    margin: 0,
    color: "#333",
    fontSize: "1.5em"
  },
  stats: {
    display: "flex",
    gap: "10px"
  },
  badge: {
    padding: "5px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.9em",
    fontWeight: "bold"
  },
  filtres: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  filtreBtn: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9em",
    transition: "all 0.2s"
  },
  eventsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "400px",
    overflowY: "auto",
    paddingRight: "10px"
  },
  eventCard: {
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s",
    cursor: "pointer"
  },
  eventHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px"
  },
  eventIcon: {
    fontSize: "1.2em"
  },
  eventType: {
    fontSize: "0.9em",
    color: "#666",
    textTransform: "uppercase"
  },
  eventTime: {
    marginLeft: "auto",
    fontSize: "0.85em",
    color: "#999"
  },
  eventMessage: {
    fontSize: "1.1em",
    marginBottom: "8px"
  },
  eventDetails: {
    display: "flex",
    gap: "15px",
    fontSize: "0.9em"
  },
  detail: {
    color: "#666"
  },
  notification: {
    color: "#e74c3c",
    marginLeft: "auto"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#666"
  },
  emptyIcon: {
    fontSize: "3em",
    marginBottom: "10px"
  },
  refreshButton: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    background: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background 0.2s"
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "40px"
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite"
  }
};

// Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  div[style*="cursor: pointer"]:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(style);