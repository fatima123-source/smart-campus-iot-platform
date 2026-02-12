import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/dashboard/Dashboard";
import DataView from "./pages/data/DataView";
import Objects from "./pages/objects/Objects";
import Events from "./pages/events/Events";
import Actions from "./pages/actions/Actions";
import Doc from "./pages/Doc/doc";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={collapsed ? "main collapsed" : "main"}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataView />} />
          <Route path="/objects" element={<Objects />} />
          <Route path="/events" element={<Events />} />
          <Route path="/actions" element={<Actions />} />

        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
