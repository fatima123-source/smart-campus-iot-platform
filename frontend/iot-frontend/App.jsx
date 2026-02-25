import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import EventsPage from "./pages/events/Events.jsx"; // <- ton Events.jsx

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard avec menu */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
