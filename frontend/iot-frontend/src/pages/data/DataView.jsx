import api from "../../services/api";
import { useEffect, useState } from "react";

export default function DataView() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/data").then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>Données </h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
