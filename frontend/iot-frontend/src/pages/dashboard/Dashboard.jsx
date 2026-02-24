import StatsCards from "./components/StatsCards";
import Tables from "./components/Tables";
//import Charts from "./components/Charts";
import AlertSection from "./components/AlertSection";
import Teste from "./components/Teste";
//import OccupationCirculaire from "./components/OccupationCirculaire";

import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">
        Tableau de Bord IoT
      </h1>
       <StatsCards />
      <Teste />



      <Tables />
      <h1>-</h1>
      <AlertSection/>
    </div>
  );
}
/*import { useState, useEffect } from "react";

export default function Dashboard() {
  const [total, setTotal] = useState(0);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le total et les dernières données en parallèle
    Promise.all([
      fetch('http://localhost:5000/api/capteurs/total').then(res => res.json()),
      fetch('http://localhost:5000/api/capteurs/recentes').then(res => res.json())
    ])
    .then(([totalData, recentesData]) => {
      console.log("✅ Total reçu:", totalData);
      console.log("✅ Données récentes reçues:", recentesData);
      setTotal(totalData.total);
      setRecentes(recentesData);
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
      'temperature': '🌡️',
      'humidite': '💧',
      'luminosite': '💡',
      'mouvement': '🚶',
      'pression': '📈',
      'qualite_air': '🌬️',
      'energie': '⚡',
      'presence': '👤',
      'co2': '🏭',
      'bruit': '🔊'
    };
    return icons[type] || '📟';
  };

  return (
    <div style={{
      padding: "40px",
      background: "#f5f5f5",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{
        color: "#333",
        marginBottom: "30px",
        fontSize: "2.5em",
        textAlign: "center"
      }}>
        📊 Tableau de Bord IoT
      </h1>

      {/* Carte du total */
    /*}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        maxWidth: "600px",
        margin: "0 auto 30px auto"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "5em", marginBottom: "20px" }}>
            📡
          </div>

          <h2 style={{
            color: "white",
            margin: 0,
            fontSize: "1.5em",
            opacity: 0.9
          }}>
            CAPTEURS DANS LA BASE DE DONNÉES
          </h2>

          {loading ? (
            <div style={{ color: "white", fontSize: "2em", margin: "30px 0" }}>
              Chargement...
            </div>
          ) : (
            <div style={{
              fontSize: "6em",
              fontWeight: "bold",
              color: "white",
              margin: "20px 0",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
            }}>
              {total}
            </div>
          )}

          <div style={{
            background: "rgba(255,255,255,0.2)",
            padding: "15px",
            borderRadius: "10px",
            color: "white"
          }}>
            <p style={{ margin: "5px 0" }}>
              Collection MongoDB: <strong>capteurs</strong>
            </p>
            <p style={{ margin: "5px 0" }}>
              Statut: <strong>✅ Connecté</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tableau des 10 dernières données */
    /*}
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <h2 style={{
          color: "#333",
          margin: "0 0 20px 0",
          fontSize: "1.8em",
          borderBottom: "3px solid #667eea",
          paddingBottom: "10px"
        }}>
          📨 10 DERNIÈRES DONNÉES REÇUES
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Chargement des données...
          </div>
        ) : recentes.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px",
            background: "#f8f9fa",
            borderRadius: "10px",
            color: "#666"
          }}>
            <div style={{ fontSize: "4em", marginBottom: "20px" }}>📭</div>
            <h3>Aucune donnée disponible</h3>
            <p>Exécutez le script seed-data.js pour générer des données simulées</p>
            <pre style={{
              background: "#333",
              color: "#fff",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              textAlign: "left"
            }}>
              cd backend && node src/seed-data.js
            </pre>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95em"
            }}>
              <thead>
                <tr style={{ background: "#667eea", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Valeur</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Unité</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Salle</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((capteur, index) => (
                  <tr key={index} style={{
                    borderBottom: "1px solid #e0e0e0",
                    background: index % 2 === 0 ? "#f8f9fa" : "white",
                    transition: "background 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e8f0fe"}
                  onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#f8f9fa" : "white"}
                  >
                    <td style={{ padding: "12px 15px" }}>
                      <span style={{ fontSize: "1.2em", marginRight: "8px" }}>
                        {getIcon(capteur.type)}
                      </span>
                      {capteur.type}
                    </td>
                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>
                      {typeof capteur.value === 'number' ? capteur.value.toFixed(2) : capteur.value}
                    </td>
                    <td style={{ padding: "12px 15px", color: "#666" }}>
                      {capteur.unit || '-'}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      {capteur.salleId?.substring(0, 8) || 'N/A'}...
                    </td>
                    <td style={{ padding: "12px 15px", color: "#666" }}>
                      {formatDate(capteur.lastUpdate)}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <span style={{
                        background: capteur.status === 'actif' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85em'
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

        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ color: "#666" }}>
            ⏱️ Dernière mise à jour: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9em"
            }}
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* Message de confirmation */
    /*}
      {total > 0 && (
        <div style={{
          maxWidth: "1200px",
          margin: "20px auto 0",
          padding: "15px",
          background: "#4CAF50",
          color: "white",
          borderRadius: "10px",
          textAlign: "center",
          fontSize: "1.1em"
        }}>
          🎉 {total} capteurs trouvés • {recentes.length} dernières données affichées
        </div>
      )}
    </div>
  );
}
*?




/**--------------------------------------------------------------------------------------------------------------------------------- */
/*import api from "../../services/api";
import { useEffect, useState } from "react";


export default function Dashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.get("/data/latest").then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard IoT</h2>

    </div>
  );
}*/
/*
// frontend/src/pages/dashboard/Dashboard.jsx

import { useEffect, useState } from "react";
import api from "../../services/api";
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import Tables from './components/Tables';
import AlertSection from './components/AlertSection';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSensors: 27,
      todayEvents: 5,
      activeAlerts: 2,
      totalRooms: 10,
      activeActuators: 15
    },
    temperatureData: [
      { time: "08:00", value: 21.5 },
      { time: "09:00", value: 22.0 },
      { time: "10:00", value: 23.5 },
      { time: "11:00", value: 24.0 },
      { time: "12:00", value: 25.0 },
      { time: "13:00", value: 24.5 },
      { time: "14:00", value: 23.0 }
    ],
    occupancyData: [
      { salle: "INFO-A101", occupation: 85 },
      { salle: "INFO-A102", occupation: 60 },
      { salle: "INFO-A103", occupation: 45 },
      { salle: "INFO-B201", occupation: 30 },
      { salle: "INFO-B202", occupation: 75 }
    ],
    sensors: [
      { codeSalle: "INFO-A101", type: "temperature", value: 23.5, unit: "°C", status: "actif", lastUpdate: new Date() },
      { codeSalle: "INFO-A101", type: "presence", value: 1, unit: "bool", status: "actif", lastUpdate: new Date() }
    ],
    events: [
      { timestamp: new Date(), codeSalle: "INFO-A101", type: "alerte", message: "Température élevée", severite: "haute" }
    ],
    alerts: [
      { codeSalle: "INFO-A101", message: "Température critique: 34°C", severite: "haute", createdAt: new Date() }
    ]
  });

  useEffect(() => {
    // Appel API pour récupérer les vraies données
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Appels API réels (à décommenter quand les endpoints sont prêts)
        // const statsRes = await api.get("/dashboard/stats");
        // const sensorsRes = await api.get("/sensors");
        // const eventsRes = await api.get("/events/today");
        // const alertsRes = await api.get("/actions/alerts/active");
        // const tempRes = await api.get("/sensors/temperature/history");

        // setDashboardData({
        //   stats: statsRes.data,
        //   sensors: sensorsRes.data.slice(0, 10),
        //   events: eventsRes.data,
        //   alerts: alertsRes.data,
        //   temperatureData: tempRes.data
        // });

        // Simulation de chargement
        setTimeout(() => {
          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Chargement du dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Smart Campus</h1>
        <div className="time-range">
          <select>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      <StatsCards stats={dashboardData.stats} />

      <Charts
        temperatureData={dashboardData.temperatureData}
        occupancyData={dashboardData.occupancyData}
      />

      <Tables
        sensors={dashboardData.sensors}
        events={dashboardData.events}
      />

      <AlertSection
        alerts={dashboardData.alerts}
        recentEvents={dashboardData.events}
      />
    </div>
  );
}*/
