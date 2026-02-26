import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Actions.css";

import {
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTrash2,
} from "react-icons/fi";

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

  const [eventModal, setEventModal] = useState({
    open: false,
    command: null,
    lastEvent: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    commandId: null,
  });

  const itemsPerPage = 5;

  // ===================== Helpers =====================
  const showNotif = (message, type = "success") => {
    setShowNotification({ show: true, message, type });
    setTimeout(
      () => setShowNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const safeLower = (x) => String(x || "").toLowerCase();

  const renderEventText = (ev) => {
    if (!ev) return "Aucun événement récent";
    const t = ev.type || "event";
    const txt = ev.description || ev.message || "";
    return txt ? `${t} — ${txt}` : t;
  };

  // ===================== API =====================
  const fetchCommands = async () => {
    try {
      const res = await api.get("/commands");
      setCommands(Array.isArray(res.data) ? res.data : []);
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

  const executeCommand = async (id) => {
    try {
      await api.put(`/commands/${id}/execute`);
      showNotif("Commande envoyée pour exécution");
      fetchCommands();
    } catch (error) {
      console.error("Erreur execution", error);
      showNotif("Erreur lors de l'exécution", "error");
      fetchCommands();
    }
  };

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

  const deleteCommand = async () => {
    try {
      const id = deleteModal.commandId;
      if (!id) return;

      await api.delete(`/commands/${id}`);
      showNotif("Commande supprimée avec succès");
      setDeleteModal({ open: false, commandId: null });
      fetchCommands();
    } catch (error) {
      console.error("Erreur suppression", error);
      showNotif("Erreur lors de la suppression", "error");
    }
  };

  // ===================== Modals =====================
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

  const openDeleteModal = (id) => {
    setDeleteModal({ open: true, commandId: id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, commandId: null });
  };

  // ✅ MODIF : on utilise cmd.latestEvent (déjà filtré par capteurType côté backend)
  const openEventModal = (cmd) => {
    setEventModal({
      open: true,
      command: cmd,
      lastEvent: cmd.latestEvent || null,
    });

    // Si jamais backend ne renvoie pas latestEvent (debug)
    if (!cmd.latestEvent) {
      showNotif(
        "Aucun latestEvent reçu. Vérifie que /commands renvoie latestEvent.",
        "error"
      );
    }
  };

  const closeEventModal = () => {
    setEventModal({ open: false, command: null, lastEvent: null });
  };

  // ===================== Stats =====================
  const total = commands.length;
  const executed = commands.filter((c) => c.status === "EXECUTED").length;
  const pending = commands.filter((c) => c.status === "PENDING").length;
  const failed = commands.filter((c) => c.status === "FAILED").length;

  // ===================== Filtrage =====================
  const filteredCommands = commands.filter((c) => {
    const matchApp = filters.application
      ? safeLower(c.application).includes(safeLower(filters.application))
      : true;

    const matchDevice = filters.device
      ? safeLower(c.device).includes(safeLower(filters.device))
      : true;

    const matchSalle = filters.salle
      ? safeLower(c.codeSalle).includes(safeLower(filters.salle))
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
      {showNotification.show && (
        <div className={`notification ${showNotification.type}`}>
          {showNotification.message}
        </div>
      )}

      {/* ===================== MODAL REJET ===================== */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Rejeter la commande</h3>

            <div className="modal-info">
              <div>
                <strong>Salle :</strong> {rejectModal.command?.codeSalle}
              </div>
              <div>
                <strong>Actionneur :</strong> {rejectModal.command?.device}
              </div>
              <div>
                <strong>Commande :</strong> {rejectModal.command?.action}
              </div>
              <div>
                <strong>Événement détecté :</strong>{" "}
                {renderEventText(rejectModal.command?.latestEvent)}
              </div>
            </div>

            <label className="modal-label">Cause du rejet :</label>
            <textarea
              className="modal-textarea"
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((s) => ({ ...s, reason: e.target.value }))
              }
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeRejectModal}>
                Annuler
              </button>
              <button className="btn-danger" onClick={rejectCommand}>
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL DELETE ===================== */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Confirmer la suppression</h3>
            <p className="modal-text">
              Êtes-vous sûr de vouloir supprimer cette commande ?
            </p>
            <p className="modal-warning">Cette action est irréversible.</p>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeDeleteModal}>
                Annuler
              </button>
              <button className="btn-delete" onClick={deleteCommand}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EVENT ===================== */}
      {eventModal.open && eventModal.command && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="modal modal-medium" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Dernier événement pertinent</h3>

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
                <div className="info-row">
                  <span className="info-label">Capteur concerné</span>
                  <span className="info-value">
                    {eventModal.command.expectedSensorType || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h4 className="modal-subtitle">Événement détecté (même salle + même capteur)</h4>

              {eventModal.lastEvent ? (
                <div className="event-details">
                  <div className="info-row">
                    <span className="info-label">Type d'événement</span>
                    <span className="info-value">{eventModal.lastEvent.type}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Message</span>
                    <span className="info-value message-text">
                      {eventModal.lastEvent.description ||
                        eventModal.lastEvent.valeur ||
                        eventModal.lastEvent.value ||
                        "Aucun message"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Date et heure</span>
                    <span className="info-value">
                      {new Date(eventModal.lastEvent.timestamp).toLocaleString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }
                      )}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">CapteurType</span>
                    <span className="info-value">
                      {eventModal.lastEvent.capteurType || "—"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="no-event">
                  Aucun événement récent pour le capteur concerné
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeEventModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CARDS ===================== */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <FiClipboard className="stat-icon" />
          <div className="stat-content">
            <div className="stat-label">Commandes créées</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>
        <div className="stat-card green">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-content">
            <div className="stat-label">Exécutées</div>
            <div className="stat-value">{executed}</div>
          </div>
        </div>
        <div className="stat-card orange">
          <FiClock className="stat-icon" />
          <div className="stat-content">
            <div className="stat-label">En attente</div>
            <div className="stat-value">{pending}</div>
          </div>
        </div>
        <div className="stat-card red">
          <FiXCircle className="stat-icon" />
          <div className="stat-content">
            <div className="stat-label">Échec</div>
            <div className="stat-value">{failed}</div>
          </div>
        </div>
      </div>

      {/* ===================== Filters ===================== */}
      <div className="filters-bar">
        <input
          type="text"
          name="application"
          placeholder="Application..."
          value={filters.application}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="text"
          name="device"
          placeholder="Actionneur..."
          value={filters.device}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="text"
          name="salle"
          placeholder="Salle..."
          value={filters.salle}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="ALL">Tous statuts</option>
          <option value="PENDING">En attente</option>
          <option value="EXECUTED">Exécuté</option>
          <option value="FAILED">Échec</option>
        </select>
      </div>

      {/* ===================== Table ===================== */}
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {displayedCommands.map((cmd) => (
              <tr key={cmd._id}>
                <td>{cmd.application}</td>
                <td>{cmd.device}</td>

                <td
                  className="salle-cell clickable"
                  onClick={() => openEventModal(cmd)}
                  title="Cliquer pour voir le dernier événement pertinent"
                >
                  {cmd.codeSalle}
                </td>

                <td>{cmd.salleId?.type || "-"}</td>
                <td>{cmd.action}</td>

                <td>
                  <span className={`status-badge ${cmd.status.toLowerCase()}`}>
                    {cmd.status}
                  </span>
                </td>

                <td className="error-cell">
                  {cmd.status === "FAILED" ? cmd.error || cmd.reason || "—" : "—"}
                </td>

                <td>
                  <div className="action-buttons">
                    {cmd.status === "PENDING" ? (
                      <>
                        <button
                          className="execute-btn"
                          onClick={() => executeCommand(cmd._id)}
                        >
                          Exécuter
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => openRejectModal(cmd)}
                        >
                          Rejeter
                        </button>
                      </>
                    ) : (
                      <span className="no-action">-</span>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => openDeleteModal(cmd._id)}
                      title="Supprimer"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {displayedCommands.length === 0 && (
              <tr>
                <td colSpan="8" className="no-data">
                  Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================== Pagination ===================== */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>
          <span className="page-info">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}