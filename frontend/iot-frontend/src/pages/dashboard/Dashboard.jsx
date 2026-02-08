import api from "../../services/api";
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
}
