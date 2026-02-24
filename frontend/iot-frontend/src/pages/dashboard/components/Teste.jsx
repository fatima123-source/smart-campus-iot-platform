import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

export default function HistoriqueCapteurs() {
  const [temperatureData, setTemperatureData] = useState([]);
  const [energieData, setEnergieData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonnees();
  }, []);

  const fetchDonnees = async () => {
    try {
      console.log("Chargement de l'historique des capteurs...");
      
      const response = await fetch('http://localhost:5000/api/historique/capteurs');
      const data = await response.json();
      
      console.log("✅ Données reçues:", data);
      
      if (data.length === 0) {
        console.log("⚠️ Aucune donnée");
        setLoading(false);
        return;
      }
      
      // 1. Données de température (ligne)
      const temps = data
        .filter(item => item.type === 'temperature')
        .map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          valeur: item.value,
          salle: item.topic?.split('/').pop() || 'Salle',
          unit: item.unit || '°C'
        }))
        .slice(-20); // 20 dernières mesures

      // 2. Données d'énergie (barres)
      const energies = data
        .filter(item => item.type === 'energie')
        .map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          consommation: item.value,
          salle: item.topic?.split('/').pop() || 'Salle',
          unit: item.unit || 'kWh'
        }))
        .slice(-15); // 15 dernières mesures

      // 3. Données d'occupation (circulaire - moyenne par salle)
      const presenceData = data.filter(item => item.type === 'presence');
      
      // Grouper par salle et calculer la moyenne
      const salleMap = new Map();
      presenceData.forEach(item => {
        const nomSalle = item.topic?.split('/').pop() || 'Salle inconnue';
        if (!salleMap.has(nomSalle)) {
          salleMap.set(nomSalle, {
            salle: nomSalle,
            valeurs: [],
            count: 0
          });
        }
        salleMap.get(nomSalle).valeurs.push(item.value);
        salleMap.get(nomSalle).count++;
      });

      // Calculer l'occupation moyenne par salle (en %)
      const occupation = Array.from(salleMap.values()).map(item => {
        const moyenne = item.valeurs.reduce((a, b) => a + b, 0) / item.valeurs.length;
        // Convertir en pourcentage (si présence binaire 0/1)
        const occupationValue = moyenne <= 1 ? Math.round(moyenne * 100) : Math.min(Math.round(moyenne), 100);
        return {
          salle: item.salle,
          occupation: occupationValue,
          mesures: item.count
        };
      });

      console.log("Températures:", temps.length);
      console.log("Énergies:", energies.length);
      console.log("Occupation:", occupation.length);

      setTemperatureData(temps);
      setEnergieData(energies);
      setOccupationData(occupation);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setLoading(false);
    }
  };

  // Couleurs pour le graphique circulaire
  const COLORS = ['#ff4444', '#ff8800', '#ffbb33', '#00C851', '#33b5e5', '#aa66cc', '#9933cc', '#2BBBAD', '#FF6D00', '#AA00FF'];

  const getColor = (occupation) => {
    if (occupation >= 80) return '#ff4444'; // Rouge
    if (occupation >= 60) return '#ff8800'; // Orange
    if (occupation >= 30) return '#ffbb33'; // Jaune
    return '#00C851'; // Vert
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Analyse des Capteurs</h1>
      
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <h3>Température</h3>
          <p>{temperatureData.length} mesures</p>
        </div>
        <div style={styles.statCard}>
          <h3>Énergie</h3>
          <p>{energieData.length} mesures</p>
        </div>
        <div style={styles.statCard}>
          <h3>Occupation</h3>
          <p>{occupationData.length} salles</p>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        {/* Graphique Température (Ligne) */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartIcon}></span>
            <h3>Évolution de la Température</h3>
          </div>
          
          {temperatureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
                <YAxis unit="°C" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="valeur" 
                  stroke="#ff7300" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Température (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>Aucune donnée de température</div>
          )}
        </div>

        {/* Graphique Énergie (Barres) */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartIcon}></span>
            <h3>Consommation Énergétique</h3>
          </div>
          
          {energieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
                <YAxis unit="kWh" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="consommation" 
                  fill="#82ca9d" 
                  name="Consommation (kWh)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>Aucune donnée d'énergie</div>
          )}
        </div>

        {/* Graphique Occupation (Circulaire) */}
        <div style={{...styles.chartCard, gridColumn: "span 2"}}>
          <div style={styles.chartHeader}>
            <span style={styles.chartIcon}></span>
            <h3>Occupation des Salles</h3>
          </div>
          
          {occupationData.length > 0 ? (
            <div style={styles.pieContainer}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={occupationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ salle, occupation }) => `${salle}: ${occupation}%`}
                    outerRadius={130}
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
              
              {/* Légende colorée */}
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

              {/* Tableau des occupations */}
              <div style={styles.occupationTable}>
                <h4 style={styles.tableTitle}>Détail par salle :</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Salle</th>
                      <th style={styles.th}>Occupation</th>
                      <th style={styles.th}>Mesures</th>
                      <th style={styles.th}>Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occupationData.map((item, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{item.salle}</td>
                        <td style={styles.td}>
                          <div style={styles.progressBar}>
                            <div style={{
                              ...styles.progressFill,
                              width: `${item.occupation}%`,
                              background: getColor(item.occupation)
                            }}></div>
                            <span style={styles.progressText}>{item.occupation}%</span>
                          </div>
                        </td>
                        <td style={styles.td}>{item.mesures}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: getColor(item.occupation),
                            color: 'white'
                          }}>
                            {item.occupation >= 80 ? '🔴 Saturée' :
                             item.occupation >= 60 ? '🟠 Occupée' :
                             item.occupation >= 30 ? '🟡 Moyenne' : '🟢 Faible'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={styles.noData}>Aucune donnée d'occupation</div>
          )}
        </div>
      </div>

      <button onClick={fetchDonnees} style={styles.refreshButton}>
        Actualiser les données
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    background: "#f5f5f5",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif"
  },
  title: {
    textAlign: "center",
    color: "#333",
    fontSize: "2.5em",
    marginBottom: "30px"
  },
  statsCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
    maxWidth: "800px",
    margin: "0 auto 30px auto"
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
    gap: "24px"
  },
  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
  },
  chartHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "10px"
  },
  chartIcon: {
    fontSize: "1.8em"
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
  occupationTable: {
    width: "100%",
    marginTop: "30px"
  },
  tableTitle: {
    color: "#333",
    marginBottom: "15px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    padding: "10px",
    background: "#f8f9fa",
    textAlign: "left",
    fontWeight: "600"
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #e0e0e0"
  },
  progressBar: {
    width: "100%",
    height: "20px",
    background: "#f0f0f0",
    borderRadius: "10px",
    position: "relative",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease"
  },
  progressText: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    color: "#fff",
    fontSize: "0.8em",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.85em"
  },
  noData: {
    textAlign: "center",
    padding: "60px",
    background: "#f8f9fa",
    borderRadius: "10px",
    color: "#666"
  },
  refreshButton: {
    display: "block",
    margin: "30px auto",
    padding: "12px 30px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1em",
    cursor: "pointer"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh"
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    marginBottom: "20px"
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