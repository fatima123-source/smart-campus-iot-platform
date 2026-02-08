import api from "../../services/api";
import { useEffect, useState } from "react";

export default function Objects() {
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    api.get("/objects").then(res => setObjects(res.data));
  }, []);

  return (
    <div>
      <h2>Objets IoT</h2>
      <pre>{JSON.stringify(objects, null, 2)}</pre>
    </div>
  );
}
