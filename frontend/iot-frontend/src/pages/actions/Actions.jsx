import api from "../../services/api";

export default function Actions() {
  const sendAction = () => {
    api.post("/actions", {
      action: "TURN_OFF_LIGHT",
      room: "Salle_A"
    });
  };

  return (
    <div>
      <h2>Actions & Commandes</h2>

    </div>
  );
}
