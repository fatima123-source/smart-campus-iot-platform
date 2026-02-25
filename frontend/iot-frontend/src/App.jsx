import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import EventsPage from "./pages/events/Events.jsx"; // <- ton Events.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />         {/* Dashboard principal */}
        <Route path="/events" element={<EventsPage />} /> {/* Page Événements */}
      </Routes>
    </Router>
  );
}

export default App;
