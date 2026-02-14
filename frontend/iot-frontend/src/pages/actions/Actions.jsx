import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Actions.css";

export default function Actions() {
  const [commands, setCommands] = useState([]);
  const [filters, setFilters] = useState({
    application: "",
    device: "",
    salle: "",
    status: "ALL"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotification, setShowNotification] = useState({
    show: false,
    message: "",
    type: ""
  });

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

  // 🔵 AUTO REFRESH toutes les 2 secondes
  useEffect(() => {
    fetchCommands(); // premier chargement

    const interval = setInterval(() => {
      fetchCommands(); // rafraîchissement auto
    }, 5000);

    return () => clearInterval(interval); // nettoyage
  }, []);

  // 🔔 Notification
  const showNotif = (message, type = "success") => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => {
      setShowNotification({ show: false, message: "", type: "" });
    }, 3000);
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

  // 🔵 Statistiques
  const total = commands.length;
  const executed = commands.filter(c => c.status === "EXECUTED").length;
  const pending = commands.filter(c => c.status === "PENDING").length;
  const failed = commands.filter(c => c.status === "FAILED").length;

  // 🔵 Filtrage réel
  const filteredCommands = commands.filter((c) => {
    const matchApp = filters.application
      ? c.application.toLowerCase().includes(filters.application.toLowerCase())
      : true;

    const matchDevice = filters.device
      ? c.device.toLowerCase().includes(filters.device.toLowerCase())
      : true;

    const matchSalle = filters.salle
      ? c.codeSalle.toLowerCase().includes(filters.salle.toLowerCase())
      : true;

    const matchStatus =
      filters.status !== "ALL" ? c.status === filters.status : true;

    return matchApp && matchDevice && matchSalle && matchStatus;
  });

  // 🔵 Pagination
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

      {/* 🔔 Notification */}
      {showNotification.show && (
        <div className={`notification ${showNotification.type}`}>
          {showNotification.message}
        </div>
      )}

      {/* 🔵 CARTES STATISTIQUES */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Commandes créées</div>
          <div className="stat-value">{total}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Exécutées</div>
          <div className="stat-value">{executed}</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-label">En attente</div>
          <div className="stat-value">{pending}</div>
        </div>

        <div className="stat-card red">
          <div className="stat-label">Échec</div>
          <div className="stat-value">{failed}</div>
        </div>
      </div>

      {/* 🔵 FILTRES */}
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

      {/* 🔵 TABLEAU */}
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
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {displayedCommands.map((cmd) => (
              <tr key={cmd._id}>
                <td>{cmd.application}</td>
                <td>{cmd.device}</td>
                <td>{cmd.codeSalle}</td>
                <td>{cmd.salleId?.type || "-"}</td>
                <td>{cmd.action}</td>

                <td>
                  <span className={`status-badge ${cmd.status.toLowerCase()}`}>
                    {cmd.status}
                  </span>
                </td>

                <td>
                  {cmd.status === "PENDING" ? (
                    <button
                      onClick={() => executeCommand(cmd._id)}
                      className="execute-btn"
                    >
                      Exécuter
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}

            {displayedCommands.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">
                  Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔵 PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ←
          </button>

          <span className="page-info">
            Page {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
