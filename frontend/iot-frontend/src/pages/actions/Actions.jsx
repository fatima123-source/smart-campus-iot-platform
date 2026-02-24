// Actions.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Actions.css";

export default function Actions() {
  const [commands, setCommands] = useState([]);
  const [filters, setFilters] = useState({
    application: "",
    device: "",
    salle: "",
    status: "ALL",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotification, setShowNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    command: null,
    reason: "",
  });

  // 🔵 Nouveau state pour le modal d'événement (ouvert par clic sur salle)
  const [eventModal, setEventModal] = useState({
    open: false,
    command: null,
    lastEvent: null,
  });

  const [lastEvent, setLastEvent] = useState(null);
  const itemsPerPage = 5;

  // 🔵 Charger commandes
  const fetchCommands = async () => {
    try {
      const res = await api.get("/commands");
      setCommands(res.data);
    } catch (error) {
      console.error("Erreur chargement commandes", error);
      showNotif("Erreur lors du chargement", "error");
    }
  };

  useEffect(() => {
    fetchCommands();
    const interval = setInterval(fetchCommands, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔔 Notifications
  const showNotif = (message, type = "success") => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => setShowNotification({ show: false, message: "", type: "" }), 3000);
  };

  // 🔵 Exécuter commande
  const executeCommand = async (id) => {
    try {
      await api.put(`/commands/${id}/execute`);
      showNotif("Commande exécutée avec succès");
      fetchCommands();
    } catch (error) {
      console.error("Erreur execution", error);
      showNotif("Erreur lors de l'exécution", "error");
    }
  };

  // 🔵 Rejeter commande
  const rejectCommand = async () => {
    try {
      const id = rejectModal.command?._id;
      if (!id) return;

      await api.put(`/commands/${id}/reject`, { reason: rejectModal.reason });
      showNotif("Commande rejetée");
      closeRejectModal();
      fetchCommands();
    } catch (error) {
      console.error("Erreur rejet", error);
      showNotif("Erreur lors du rejet", "error");
    }
  };

  // 🔵 Ouvrir modal rejet
  const openRejectModal = (cmd) => {
    setRejectModal({
      open: true,
      command: cmd,
      reason: "",
    });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, command: null, reason: "" });
  };

  // 🔵 Ouvrir modal d'événement (au clic sur salle)
  const openEventModal = async (cmd) => {
    setEventModal({
      open: true,
      command: cmd,
      lastEvent: null,
    });

    if (cmd.salleId?._id) {
      try {
        const res = await api.get(`/events/last?salleId=${cmd.salleId._id}`);
        setEventModal(prev => ({
          ...prev,
          lastEvent: res.data
        }));
      } catch (error) {
        console.error("Erreur récupération événement", error);
        showNotif("Impossible de récupérer le dernier événement", "error");
      }
    }
  };

  const closeEventModal = () => {
    setEventModal({ open: false, command: null, lastEvent: null });
  };

  // 🔵 Statistiques
  const total = commands.length;
  const executed = commands.filter((c) => c.status === "EXECUTED").length;
  const pending = commands.filter((c) => c.status === "PENDING").length;
  const failed = commands.filter((c) => c.status === "FAILED").length;

  // 🔵 Filtrage
  const filteredCommands = commands.filter((c) => {
    const matchApp = filters.application
      ? c.application.toLowerCase().includes(filters.application.toLowerCase())
      : true;
    const matchDevice = filters.device
      ? (c.device || "").toLowerCase().includes(filters.device.toLowerCase())
      : true;
    const matchSalle = filters.salle
      ? (c.codeSalle || "").toLowerCase().includes(filters.salle.toLowerCase())
      : true;
    const matchStatus = filters.status !== "ALL" ? c.status === filters.status : true;
    return matchApp && matchDevice && matchSalle && matchStatus;
  });

  const totalPages = Math.ceil(filteredCommands.length / itemsPerPage);
  const displayedCommands = filteredCommands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  return (
    <div className="actions-container">
      {/* Notification */}
      {showNotification.show && (
        <div className={`notification ${showNotification.type}`}>
          {showNotification.message}
        </div>
      )}

      {/* Modal Rejet (inchangé) */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Rejeter la commande</h3>

            <div className="modal-info">
              <div><strong>Salle :</strong> {rejectModal.command?.codeSalle}</div>
              <div><strong>Actionneur :</strong> {rejectModal.command?.device}</div>
              <div><strong>Commande :</strong> {rejectModal.command?.action}</div>
            </div>

            <label className="modal-label">Cause du rejet :</label>
            <textarea
              className="modal-textarea"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value }))}
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeRejectModal}>Annuler</button>
              <button className="btn-danger" onClick={rejectCommand}>Confirmer le rejet</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 MODAL Événement (ouvert par clic sur salle) */}
      {eventModal.open && eventModal.command && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="modal modal-medium" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Dernier événement de la salle</h3>

            {/* Informations de la commande */}
            <div className="modal-section">
              <h4 className="modal-subtitle">Informations de la commande</h4>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Salle</span>
                  <span className="info-value">{eventModal.command.codeSalle}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Actionneur</span>
                  <span className="info-value">{eventModal.command.device}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Application</span>
                  <span className="info-value">{eventModal.command.application}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Commande</span>
                  <span className="info-value">{eventModal.command.action}</span>
                </div>
              </div>
            </div>

            {/* Événement */}
            <div className="modal-section">
              <h4 className="modal-subtitle">Événement détecté</h4>
              {eventModal.lastEvent ? (
                <div className="event-details">
                  <div className="info-row">
                    <span className="info-label">Type d'événement</span>
                    <span className="info-value">{eventModal.lastEvent.type}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Message</span>
                    <span className="info-value message-text">
                      {eventModal.lastEvent.description || eventModal.lastEvent.valeur || "Aucun message"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date et heure</span>
                    <span className="info-value">
                      {new Date(eventModal.lastEvent.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="no-event">Aucun événement récent pour cette salle</p>
              )}
            </div>

            {/* Bouton de fermeture */}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeEventModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-label">Commandes créées</div><div className="stat-value">{total}</div></div>
        <div className="stat-card green"><div className="stat-label">Exécutées</div><div className="stat-value">{executed}</div></div>
        <div className="stat-card orange"><div className="stat-label">En attente</div><div className="stat-value">{pending}</div></div>
        <div className="stat-card red"><div className="stat-label">Échec</div><div className="stat-value">{failed}</div></div>
      </div>

      {/* Filtres */}
      <div className="filters-bar">
        <input type="text" name="application" placeholder="Application..." value={filters.application} onChange={handleFilterChange} className="filter-input" />
        <input type="text" name="device" placeholder="Actionneur..." value={filters.device} onChange={handleFilterChange} className="filter-input" />
        <input type="text" name="salle" placeholder="Salle..." value={filters.salle} onChange={handleFilterChange} className="filter-input" />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
          <option value="ALL">Tous statuts</option>
          <option value="PENDING">En attente</option>
          <option value="EXECUTED">Exécuté</option>
          <option value="FAILED">Échec</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="table-wrapper">
        <table className="actions-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Actionneur</th>
              <th>Salle</th>
              <th>Type</th>
              <th>Commande</th>
              <th>Statut</th>
              <th>Cause</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedCommands.map((cmd) => (
              <tr key={cmd._id}>
                <td>{cmd.application}</td>
                <td>{cmd.device}</td>
                {/* Cellule Salle cliquable - style normal mais curseur pointeur */}
                <td
                  className="salle-cell clickable"
                  onClick={() => openEventModal(cmd)}
                  title="Cliquer pour voir le dernier événement"
                >
                  {cmd.codeSalle}
                </td>
                <td>{cmd.salleId?.type || "-"}</td>
                <td>{cmd.action}</td>
                <td><span className={`status-badge ${cmd.status.toLowerCase()}`}>{cmd.status}</span></td>
                <td className="error-cell">{cmd.status === "FAILED" ? cmd.error || cmd.reason || "—" : "—"}</td>
                <td>
                  {cmd.status === "PENDING" ? (
                    <div className="action-buttons">
                      <button className="execute-btn" onClick={() => executeCommand(cmd._id)}>
                        Exécuter
                      </button>
                      <button className="reject-btn" onClick={() => openRejectModal(cmd)}>
                        Rejeter
                      </button>
                    </div>
                  ) : "-"}
                </td>
              </tr>
            ))}
            {displayedCommands.length === 0 && <tr><td colSpan="8" className="no-data">Aucune commande trouvée</td></tr>}
          </tbody>
        </table>
      </div>


      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p-1))} disabled={currentPage === 1}>←</button>
          <span className="page-info">Page {currentPage} / {totalPages}</span>
          <button className="page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>→</button>
        </div>
      )}
    </div>
  );
}