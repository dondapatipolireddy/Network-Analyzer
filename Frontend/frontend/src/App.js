import { useState, useEffect } from "react";
import { fetchPackets, fetchAlerts, fetchStats } from "./api";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Packets from "./pages/Packets";
import Alerts from "./pages/Alerts";

function App() {
  const [packets, setPackets] = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [stats,   setStats]   = useState({});
  const [paused,  setPaused]  = useState(false);
  const [page,    setPage]    = useState("dashboard");

  useEffect(() => {
    if (paused) return;
    const load = async () => {
      try {
        const [p, a, s] = await Promise.all([
          fetchPackets(),
          fetchAlerts(),
          fetchStats()
        ]);
        setPackets(p.data);
        setAlerts(a.data);
        setStats(s.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "monospace" }}>
      <NavBar page={page} setPage={setPage} />
      <div style={{ padding: "24px" }}>
        {page === "dashboard" && <Dashboard packets={packets} alerts={alerts} stats={stats} />}
        {page === "packets"   && <Packets packets={packets} paused={paused} setPaused={setPaused} />}
        {page === "alerts"    && <Alerts alerts={alerts} />}
      </div>
    </div>
  );
}

export default App;