import { useState, useEffect } from "react";
import "./Objects.css";
import api from "../../services/api";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

export default function Objects() {
  const [objects, setObjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [formData, setFormData] = useState({
    nomObjet: "",
    typeObjet: "capteur",
    categorie: "",
    statut: "actif"
  });

  const capteurs = ["temperature", "fumee", "presence", "consommation"];
  const actionneurs = ["climatisation", "alarme", "lighting"];

  const fetchObjects = async () => {
    const res = await api.get("/objects");
    setObjects(res.data);
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/objects", formData);
    setShowForm(false);
    setFormData({ nomObjet: "", typeObjet: "capteur", categorie: "", statut: "actif" });
    fetchObjects();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objet ?")) {
      await api.delete(`/objects/${id}`);
      fetchObjects();
    }
  };

  // DÉBUT DE LA MODIFICATION
  const startEdit = (obj) => {
    setEditingId(obj._id);
    setEditData(obj);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const saveEdit = async (id) => {
    await api.put(`/objects/${id}`, editData);
    setEditingId(null);
    fetchObjects();
  };

  const total = objects.length;
  const actif = objects.filter(o => o.statut === "actif").length;
  const inactif = objects.filter(o => o.statut === "inactif").length;

  return (
    <div className="objects-container">
      <div className="top-bar">
        <h2 className="page-title">Gestion des objets</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          + Ajouter un objet
        </button>
      </div>

      {showForm && (
        <form className="object-form" onSubmit={handleSubmit}>
          <input name="nomObjet" placeholder="Nom d'objet" onChange={handleChange} required />
          <select name="typeObjet" onChange={handleChange}>
            <option value="capteur">Capteur</option>
            <option value="actionneur">Actionneur</option>
          </select>
          <select name="categorie" onChange={handleChange} required>
            <option value="">Choisir catégorie</option>
            {(formData.typeObjet === "capteur" ? capteurs : actionneurs).map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
          <select name="statut" onChange={handleChange}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          <button className="save-btn">Enregistrer</button>
        </form>
      )}

      <div className="cards">
        <div className="card">
          <h3>Total Objets</h3>
          <p>{total}</p>
        </div>
        <div className="card">
          <h3>Actifs</h3>
          <p>{actif}</p>
        </div>
        <div className="card">
          <h3>Inactifs</h3>
          <p>{inactif}</p>
        </div>
      </div>

      <table className="objects-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {objects.map(obj => (
            <tr key={obj._id}>
              {editingId === obj._id ? (
                // LIGNE EN MODIFICATION
                <>
                  <td>
                    <input
                      className="edit-input"
                      name="nomObjet"
                      value={editData.nomObjet || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select
                      className="edit-select"
                      name="typeObjet"
                      value={editData.typeObjet || ""}
                      onChange={handleEditChange}
                    >
                      <option value="capteur">Capteur</option>
                      <option value="actionneur">Actionneur</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="edit-select"
                      name="categorie"
                      value={editData.categorie || ""}
                      onChange={handleEditChange}
                    >
                      {(editData.typeObjet === "capteur" ? capteurs : actionneurs).map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="edit-select"
                      name="statut"
                      value={editData.statut || ""}
                      onChange={handleEditChange}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </td>
                  <td>
                    <FaSave className="action-icon save" onClick={() => saveEdit(obj._id)} />
                    <FaTimes className="action-icon cancel" onClick={cancelEdit} />
                  </td>
                </>
              ) : (
                // LIGNE NORMALE
                <>
                  <td>{obj.nomObjet}</td>
                  <td>{obj.typeObjet}</td>
                  <td>{obj.categorie}</td>
                  <td>
                    <span className={`status ${obj.statut === "actif" ? "active" : "inactive"}`}>
                      {obj.statut}
                    </span>
                  </td>
                  <td>
                    <FaEdit className="action-icon edit" onClick={() => startEdit(obj)} />
                    <FaTrash className="action-icon delete" onClick={() => handleDelete(obj._id)} />
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}