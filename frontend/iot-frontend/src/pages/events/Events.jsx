// src/pages/events/Events.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ récupérer les événements
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get("http://localhost:5000/api/events");
        console.log(res.data); // <-- vérifie la structure dans la console du navigateur
        setEvents(res.data);
      } catch (err) {
        console.error("Erreur fetch events :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading)
    return <p style={{ padding: "20px" }}>Chargement des événements...</p>;

  // ✅ Notification basée sur le dernier événement
  const latestEvent = events[0];
  let alertMessage = null;

  if (latestEvent) {
    if (
      latestEvent.capteurType === "temperature" &&
      latestEvent.valeur > 30
    ) {
      alertMessage = "⚠️ Température élevée détectée !";
    } else if (latestEvent.type === "ALERT") {
      alertMessage = "🚨 Alerte critique détectée !";
    }
  }

  // ✅ S'abonner à un événement
  const subscribe = async (eventId) => {
    try {
      await axios.post("http://localhost:5000/api/subscriptions", {
        appName: "WebApp",
        eventId: eventId,
      });

      alert("✅ Abonné à cet événement !");
    } catch (err) {
      console.error(err);
      alert("Erreur abonnement");
    }
  };

  // ✅ Notifier événement
  const notify = async (eventId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/notifications/notify/${eventId}`
      );

      alert("🔔 Notification envoyée !");
    } catch (err) {
      console.error(err);
      alert("Erreur notification");
    }
  };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", background: "#f0f9ff" }}>
      <h2 style={{ marginBottom: "20px" }}>📊 Événements Smart Campus</h2>

      {alertMessage && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          {alertMessage}
        </div>
      )}

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Salle</th>
              <th style={thStyle}>Capteur</th>
              <th style={thStyle}>Valeur</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((e, index) => (
              <tr
                key={e._id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff",
                }}
              >
                <td style={tdStyle}>{e.type}</td>
                <td style={tdStyle}>{e.salle?.name || "Salle inconnue"}</td>
                <td style={tdStyle}>{e.capteurType}</td>
                <td style={{ ...tdStyle, fontWeight: "600", color: "#059669" }}>
                  {e.valeur}
                </td>
                <td style={tdStyle}>{e.description}</td>
                <td style={tdStyle}>
                  {new Date(e.timestamp).toLocaleString()}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => subscribe(e._id)}
                    style={buttonStyleGreen}
                  >
                    S'abonner
                  </button>
                  <button
                    onClick={() => notify(e._id)}
                    style={buttonStyleOrange}
                  >
                    Notifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ styles réutilisables
const thStyle = {
  backgroundColor: "#0ea5e9",
  color: "white",
  padding: "14px",
};

const tdStyle = {
  padding: "12px",
};

const buttonStyleGreen = {
  marginRight: "8px",
  padding: "6px 10px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const buttonStyleOrange = {
  padding: "6px 10px",
  background: "#f97316",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};