import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function Charts() {
  const [temperatureData, setTemperatureData] = useState([]);
  const [energieData, setEnergieData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 Chargement des données des graphiques...");
        
        // Utiliser les BONNES routes
        const [tempsRes, energieRes, occupationRes] = await Promise.all([
          fetch('http://localhost:5000/api/capteurs/temperature'),
          fetch('http://localhost:5000/api/capteurs/energie'),
          fetch('http://localhost:5000/api/salles/occupation-simple')  // ← Changé ici !
        ]);

        const tempsData = await tempsRes.json();
        const energieData = await energieRes.json();
        const occupationData = await occupationRes.json();

        console.log("📊 Données température:", tempsData);
        console.log("📊 Données énergie:", energieData);
        console.log("📊 Données occupation:", occupationData);

        // Formater les données de température
        const temps = tempsData.map(item => ({
          time: new Date(item.lastUpdate).toLocaleTimeString(),
          valeur: item.value,
          salle: item.salleId?.substring(0, 6) || 'N/A'
        }));

        // Formater les données d'énergie
        const energies = energieData.map(item => ({
          time: new Date(item.lastUpdate).toLocaleTimeString(),
          consommation: item.value,
          salle: item.salleId?.substring(0, 6) || 'N/A'
        }));

        setTemperatureData(temps);
        setEnergieData(energies);
        setOccupationData(occupationData);
        setLoading(false);
      } catch (error) {
        console.error("❌ Erreur chargement graphiques:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Couleurs pour le graphique circulaire
  const getColor = (occupation) => {
    if (occupation >= 80) return '#ff4444';
    if (occupation >= 60) return '#ff8800';
    if (occupation >= 30) return '#ffbb33';
    return '#00C851';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement des graphiques...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.sectionTitle}>📈 ANALYSE DES DONNÉES</h2>
      
      <div style={styles.chartsGrid}>
        {/* Graphique Température */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartIcon}>🌡️</span>
            <h3 style={styles.chartTitle}>Évolution de la Température</h3>
          </div>
          
          {temperatureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="valeur" stroke="#ff7300" name="Température °C" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>Aucune donnée température</div>
          )}
        </div>

        {/* Graphique Consommation */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartIcon}>⚡</span>
            <h3 style={styles.chartTitle}>Consommation Électrique</h3>
          </div>
          
          {energieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={energieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="consommation" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>Aucune donnée consommation</div>
          )}
        </div>

        {/* Graphique Circulaire - Occupation */}
        <div style={{...styles.chartCard, gridColumn: "span 2"}}>
          <div style={styles.chartHeader}>
            <span style={styles.chartIcon}>🏢</span>
            <h3 style={styles.chartTitle}>Occupation des Salles</h3>
          </div>
          
          {occupationData.length > 0 ? (
            <div style={styles.pieContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occupationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ salle, occupation }) => `${salle}: ${occupation}%`}
                    outerRadius={100}
                    dataKey="occupation"
                    nameKey="salle"
                  >
                    {occupationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.occupation)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Taux d'occupation"]} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Légende */}
              <div style={styles.legendContainer}>
                <div style={styles.legendItem}>
                  <span style={{...styles.legendColor, background: '#ff4444'}}></span>
                  <span>Saturée (≥80%)</span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{...styles.legendColor, background: '#ff8800'}}></span>
                  <span>Occupée (60-79%)</span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{...styles.legendColor, background: '#ffbb33'}}></span>
                  <span>Moyenne (30-59%)</span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{...styles.legendColor, background: '#00C851'}}></span>
                  <span>Faible (0-29%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.noData}>Aucune donnée d'occupation</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "30px auto",
    padding: "0 20px"
  },
  sectionTitle: {
    color: "#333",
    fontSize: "1.8em",
    marginBottom: "20px",
    borderBottom: "3px solid #667eea",
    paddingBottom: "10px"
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "24px"
  },
  chartCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  chartHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: "15px"
  },
  chartIcon: {
    fontSize: "1.8em"
  },
  chartTitle: {
    margin: 0,
    color: "#333",
    fontSize: "1.2em"
  },
  pieContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  legendContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap"
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9em"
  },
  legendColor: {
    width: "20px",
    height: "20px",
    borderRadius: "4px"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px"
  },
  noData: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#f8f9fa",
    borderRadius: "10px",
    color: "#666"
  }
};

// Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);