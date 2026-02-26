import { useState, useEffect } from "react";
import "./Objects.css";
import api from "../../services/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import { LayoutGrid } from "lucide-react";
import { Boxes } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { XCircle } from "lucide-react";

export default function Objects() {

  const [objects, setObjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nomObjet: "",
    typeObjet: "capteur",
    categorie: "",
    statut: "actif"
  });

  /* ================= LISTES ================= */

  const capteurs = ["temperature", "fumee", "presence", "consommation"];

  const actionneurs = [
    "climatisation",
    "alarme",
    "lighting"
  ];

  /* ================= LOAD ================= */

  const fetchObjects = async () => {
    const res = await api.get("/objects");
    setObjects(res.data);
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  /* ================= HANDLE ================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* ================= ADD ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/objects", formData);

    setShowForm(false);
    setFormData({
      nomObjet: "",
      typeObjet: "capteur",
      categorie: "",
      statut: "actif"
    });

    fetchObjects();
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    await api.delete(`/objects/${id}`);
    fetchObjects();
  };

  /* ================= STATS ================= */

  const total = objects.length;
  const actif = objects.filter(o => o.statut === "actif").length;
  const inactif = objects.filter(o => o.statut === "inactif").length;

  return (
    <div className="objects-container">

      {/* TOP BAR */}
      <div className="top-bar">
        <h2 className="page-title">
          <LayoutGrid size={28} style={{marginRight:"10px"}} />
        Gestion des objets</h2>

        <button
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Ajouter un objet
        </button>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <form className="object-form" onSubmit={handleSubmit}>

          <input
            name="nomObjet"
            placeholder="Nom d'objet"
            onChange={handleChange}
            required
          />

          {/* TYPE OBJET */}
          <select name="typeObjet" onChange={handleChange}>
            <option value="capteur">Capteur</option>
            <option value="actionneur">Actionneur</option>
          </select>

          {/* CATEGORIE DYNAMIQUE */}
          <select name="categorie" onChange={handleChange} required>

            <option value="">Choisir catégorie</option>

            {(formData.typeObjet === "capteur"
              ? capteurs
              : actionneurs
            ).map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          {/* STATUT */}
          <select name="statut" onChange={handleChange}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>

          <button className="save-btn">Enregistrer</button>

        </form>
      )}

      {/* CARTES */}
      <div className="cards">
        <div className="card">
          <Boxes size={32} className="card-icon" />
          <h3>Total Objets</h3>
          <p>{total}</p>
        </div>

        <div className="card">
          <CheckCircle size={32} className="card-icon" />
          <h3>Actifs</h3>
          <p>{actif}</p>
        </div>

        <div className="card">
          <XCircle size={32} className="card-icon" />
          <h3>Inactifs</h3>
          <p>{inactif}</p>
        </div>
      </div>

      {/* TABLEAU */}
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
              <td>{obj.nomObjet}</td>
              <td>{obj.typeObjet}</td>
              <td>{obj.categorie}</td>

              <td>
                <span className={`status ${obj.statut === "actif" ? "active" : "inactive"}`}>
                  {obj.statut}
                </span>
              </td>

              <td>
                <FaTrash
                  className="action-icon"
                  onClick={() => handleDelete(obj._id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}