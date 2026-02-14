import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Actions() {
  const [commands, setCommands] = useState([]);

  // 🔵 Charger les commandes
const fetchCommands = async () => {
  try {
    const res = await api.get("/commands");
    console.log("DATA:", res.data); // 👈 ajoute ça
    setCommands(res.data);
  } catch (error) {
    console.error("Erreur chargement commandes", error);
  }
};


  useEffect(() => {
    fetchCommands();
  }, []);

  // 🔵 Exécuter commande
  const executeCommand = async (id) => {
    try {
      await api.put(`/commands/${id}/execute`);
      fetchCommands(); // refresh tableau
    } catch (error) {
      console.error("Erreur execution", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Actions & Commandes</h2>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Application</th>
            <th>Actionneur</th>
            <th>Salle</th>
            <th>Type Salle</th>
            <th>Commande</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {commands.map((cmd) => (
            <tr key={cmd._id}>
              <td>{cmd.application}</td>
              <td>{cmd.device}</td>
              <td>{cmd.codeSalle}</td>
              <td>{cmd.salleId?.type || "N/A"}</td>
              <td>{cmd.action}</td>

              <td
                style={{
                  color:
                    cmd.status === "EXECUTED"
                      ? "green"
                      : cmd.status === "FAILED"
                      ? "red"
                      : "orange",
                  fontWeight: "bold"
                }}
              >
                {cmd.status}
              </td>

              <td>
                {cmd.status === "PENDING" ? (
                  <button onClick={() => executeCommand(cmd._id)}>
                    Exécuter
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
