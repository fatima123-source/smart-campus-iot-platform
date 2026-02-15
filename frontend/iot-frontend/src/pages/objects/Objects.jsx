import { useState, useEffect } from "react";
import "./Objects.css";
import api from "../../services/api";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Objects() {
  const [objects, setObjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nomObjet: "",
    type: "temperature",
    statut: "actif"
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // ======================
  // Charger objets
  // ======================
  const fetchObjects = async () => {
    try {
      const res = await api.get("/objects");
      setObjects(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  // ======================
  // Handle input formulaire ajout
  // ======================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ======================
  // Handle input modification inline
  // ======================
  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  // ======================
  // Ajouter objet
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/objects", formData);
      setShowForm(false);
      setFormData({ nomObjet: "", type: "temperature", statut: "actif" });
      fetchObjects();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // Modifier objet
  // ======================
  const handleEditSubmit = async (id) => {
    try {
      await api.put(`/objects/${id}`, editData);
      setEditId(null);
      fetchObjects();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // Supprimer objet
  // ======================
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce capteur ?")) {
      try {
        await api.delete(`/objects/${id}`);
        fetchObjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ======================
  // Calcul des statistiques
  // ======================
  const total = objects.length;
  const actif = objects.filter(o => o.statut === "actif").length;
  const inactif = objects.filter(o => o.statut === "inactif").length;

  return (
    <div className="objects-container">

      <div className="header">
        <h2>Gestion des Capteurs</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
  + Ajouter un objet
</button>
      </div>

      {/* FORMULAIRE AJOUT */}
      {showForm && (
        <form className="object-form" onSubmit={handleSubmit}>
          <input type="text" name="nomObjet" placeholder="Nom du capteur" onChange={handleChange} required />
          <select name="type" onChange={handleChange}>
            <option value="temperature">Température</option>
            <option value="fumee">Fumée</option>
            <option value="presence">Présence</option>
            <option value="consomation">Consommation</option>
          </select>
          <select name="statut" onChange={handleChange}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          <button type="submit">Enregistrer</button>
        </form>
      )}

      {/* STATISTIQUES */}
      <div className="stats-cards">
        <div className="card">
          <h3>Total Capteurs</h3>
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

      {/* TABLEAU OBJETS */}
      <table className="objects-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Dernière MaJ</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {objects.map(obj => (
            <tr key={obj._id}>
              {editId === obj._id ? (
                <>
                  <td><input type="text" name="nomObjet" defaultValue={obj.nomObjet} onChange={handleEditChange} /></td>
                  <td>
                    <select name="type" defaultValue={obj.type} onChange={handleEditChange}>
                      <option value="temperature">Température</option>
                      <option value="fumee">Fumée</option>
                      <option value="presence">Présence</option>
                      <option value="consomation">Consommation</option>
                    </select>
                  </td>
                  <td>
                    <select name="statut" defaultValue={obj.statut} onChange={handleEditChange}>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </td>
                  <td>{obj.updatedAt ? new Date(obj.updatedAt).toLocaleString() : "-"}</td>
                  <td>
                    <button onClick={() => handleEditSubmit(obj._id)}>Enregistrer</button>
                    <button onClick={() => setEditId(null)}>Annuler</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{obj.nomObjet}</td>
                  <td>{obj.type}</td>
                  <td>{obj.statut}</td>
                  <td>{obj.updatedAt ? new Date(obj.updatedAt).toLocaleString() : "-"}</td>
                  <td>
                    <FaEdit className="action-icon" onClick={() => { setEditId(obj._id); setEditData(obj); }} />
                    <FaTrash className="action-icon" onClick={() => handleDelete(obj._id)} />
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