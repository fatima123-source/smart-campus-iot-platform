import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function OccupationCirculaire() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalle, setSelectedSalle] = useState(null);

  useEffect(() => {
    fetchOccupation();
  }, []);

  const fetchOccupation = async () => {
    try {
      console.log("Chargement de l'occupation des salles...");
      
      const response = await fetch('http://localhost:5000/api/salles/occupation-complete');
      const data = await response.json();
      
      console.log("Données reçues:", data);
      setData(data);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setLoading(false);
    }
  };

  // Couleurs en dégradé du rouge (saturé) au vert (faible)
  const getColor = (occupation) => {
    if (occupation >= 80) return '#ff4444'; // Rouge vif
    if (occupation >= 60) return '#ff8800'; // Orange
    if (occupation >= 40) return '#ffbb33'; // Jaune
    if (occupation >= 20) return '#00C851'; // Vert clair
    return '#007E33'; // Vert foncé
  };

  // Format personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={styles.tooltip}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.nom}</p>
          <p style={{ margin: '5px 0', color: getColor(data.occupation) }}>
            Taux: {data.occupation}%
          </p>
          {data.mesures && (
            <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: '#666' }}>
              {data.mesures} mesures
            </p>
          )}
          {data.capacite && (
            <p style={{ margin: '2px 0 0', fontSize: '0.9em', color: '#666' }}>
               Capacité: {data.capacite} personnes
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Légende personnalisée
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={styles.legendList}>
        {payload.map((entry, index) => (
          <li key={`item-${index}`} style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: entry.color }} />
            <span style={styles.legendText}>
              {entry.payload.nom} : {entry.payload.occupation}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement de l'occupation...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Occupation des Salles</h2>
      
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ nom, occupation, percent }) => 
                `${nom}: ${occupation}% (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={150}
              innerRadius={60}
              fill="#8884d8"
              dataKey="occupation"
              nameKey="nom"
              onClick={(entry) => setSelectedSalle(entry)}
              onMouseEnter={(entry) => setSelectedSalle(entry)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.occupation)}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau récapitulatif */}
      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>Détail par salle</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Salle</th>
              <th style={styles.th}>Taux d'occupation</th>
              <th style={styles.th}>Niveau</th>
              <th style={styles.th}>Mesures</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{item.nom}</strong>
                  {item.code && <div style={{ fontSize: '0.85em', color: '#666' }}>{item.code}</div>}
                </td>
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
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    background: getColor(item.occupation),
                    color: 'white'
                  }}>
                    {item.occupation >= 80 ? '🔴 Saturée' :
                     item.occupation >= 60 ? '🟠 Occupée' :
                     item.occupation >= 40 ? '🟡 Moyenne' :
                     item.occupation >= 20 ? '🟢 Faible' : '🟢 Très faible'}
                  </span>
                </td>
                <td style={styles.td}>{item.mesures || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={fetchOccupation} style={styles.refreshButton}>
        🔄 Actualiser
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "1200px",
    margin: "30px auto"
  },
  title: {
    color: "#333",
    fontSize: "2em",
    marginBottom: "20px",
    borderBottom: "3px solid #667eea",
    paddingBottom: "10px"
  },
  chartWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px"
  },
  legendList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    listStyle: "none",
    padding: 0,
    marginTop: "20px"
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9em"
  },
  legendColor: {
    width: "16px",
    height: "16px",
    borderRadius: "4px"
  },
  legendText: {
    color: "#333"
  },
  tooltip: {
    background: "white",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    border: "1px solid #e0e0e0"
  },
  tableContainer: {
    marginTop: "30px"
  },
  tableTitle: {
    color: "#333",
    fontSize: "1.3em",
    marginBottom: "15px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    padding: "12px",
    background: "#f8f9fa",
    textAlign: "left",
    fontWeight: "600"
  },
  tr: {
    borderBottom: "1px solid #e0e0e0"
  },
  td: {
    padding: "12px"
  },
  progressBar: {
    width: "150px",
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
  refreshButton: {
    display: "block",
    margin: "30px auto 0",
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
    padding: "60px"
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