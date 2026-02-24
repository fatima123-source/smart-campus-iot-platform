

import { useState, useEffect } from "react";

export default function StatsCards() {
  const [stats, setStats] = useState({
    capteurs: 0,
    actionneurs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Récupération des statistiques...");
        
        // Récupérer les deux totaux en parallèle
        const [capteursRes, actionneursRes] = await Promise.all([
          fetch('http://localhost:5000/api/capteurs/total'),
          fetch('http://localhost:5000/api/actionneurs/total')
        ]);

        const capteursData = await capteursRes.json();
        const actionneursData = await actionneursRes.json();

        console.log("Capteurs reçus:", capteursData);
        console.log("Actionneurs reçus:", actionneursData);

        setStats({
          capteurs: capteursData.total || 0,
          actionneurs: actionneursData.total || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <div style={styles.spinner}></div>
        </div>
        <div style={styles.card}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.cardsContainer}>
      {/* Carte Capteurs */}
      <div 
        style={{
          ...styles.card,
          background: "linear-gradient(135deg, #3049ba 0%, #0a39b8 100%)"
        }}
      >
        <div style={styles.cardContent}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>📡</span>
          </div>
          <div style={styles.textContainer}>
            <h3 style={styles.cardTitle}>CAPTEURS</h3>
            <p style={styles.cardNumber}>{stats.capteurs}</p>
            <p style={styles.cardSub}>Dans la base de données</p>
          </div>
        </div>
      </div>

      {/* Carte Actionneurs */}
      <div 
        style={{
          ...styles.card,
          background: "linear-gradient(135deg, #277837 0%, #188a6b 100%)"
        }}
      >
        <div style={styles.cardContent}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>⚙️</span>
          </div>
          <div style={styles.textContainer}>
            <h3 style={styles.cardTitle}>ACTIONNEURS</h3>
            <p style={styles.cardNumber}>{stats.actionneurs}</p>
            <p style={styles.cardSub}>Dans la collection actionneurs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
    padding: "0 20px"
  },
  card: {
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    color: "white",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer"
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  iconContainer: {
    background: "rgba(255,255,255,0.2)",
    borderRadius: "50%",
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    fontSize: "3em"
  },
  textContainer: {
    flex: 1
  },
  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "1.1em",
    opacity: 0.9,
    letterSpacing: "1px",
    fontWeight: "600"
  },
  cardNumber: {
    margin: "0",
    fontSize: "3.5em",
    fontWeight: "bold",
    lineHeight: 1
  },
  cardSub: {
    margin: "10px 0 0",
    fontSize: "0.9em",
    opacity: 0.8
  },
  spinner: {
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "20px auto"
  }
};

// Ajouter l'animation au chargement
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    div[style*="cursor: pointer"]:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    }
  `;
  document.head.appendChild(style);
}


















