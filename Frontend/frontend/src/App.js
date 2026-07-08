import { useState, useEffect } from "react";
import { fetchPackets, fetchAlerts, fetchStats } from "./api";
import toast, { Toaster } from "react-hot-toast";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Packets from "./pages/Packets";
import Alerts from "./pages/Alerts";

function App() {
  const [packets,        setPackets]        = useState([]);
  const [alerts,         setAlerts]         = useState([]);
  const [stats,          setStats]          = useState({});
  const [paused,         setPaused]         = useState(false);
  const [page,           setPage]           = useState("dashboard");
  const [prevAlertCount, setPrevAlertCount] = useState(0);
  const [loading,        setLoading]        = useState(true);  // ← NEW
  const [error,          setError]          = useState("");    // ← NEW

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
        setLoading(false);   // ← NEW
        setError("");        // ← NEW

        if (a.data.length > prevAlertCount && prevAlertCount > 0) {
          const newAlert = a.data[0];
          toast.error(
            `🚨 ${newAlert.type} detected from ${newAlert.src_ip}`,
            { duration: 4000, position:"top-right" }
          );
        }
        setPrevAlertCount(a.data.length);

      } catch (err) {
        setError("Cannot connect to backend. Make sure api.py is running.");  // ← NEW
        setLoading(false);   // ← NEW
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [paused, prevAlertCount]);

  // Loading screen
  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"monospace" }}>
        <div style={{ fontSize:"32px", marginBottom:"16px" }}>🛡</div>
        <div style={{ fontSize:"16px", color:"#38bdf8", marginBottom:"8px" }}>Network IDS</div>
        <div style={{ fontSize:"13px", color:"#64748b" }}>Connecting to backend...</div>
        <div style={{ marginTop:"24px", width:"200px", height:"3px", background:"#1e293b", borderRadius:"2px", overflow:"hidden" }}>
          <div style={{ width:"60%", height:"100%", background:"#38bdf8", borderRadius:"2px", animation:"slide 1.5s infinite" }}></div>
        </div>
        <style>{`
          @keyframes slide {
            0% { transform: translateX(-100%) }
            100% { transform: translateX(300%) }
          }
        `}</style>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"monospace" }}>
        <div style={{ fontSize:"32px", marginBottom:"16px" }}>⚠️</div>
        <div style={{ fontSize:"14px", color:"#f87171", marginBottom:"8px" }}>Connection Failed</div>
        <div style={{ fontSize:"12px", color:"#64748b", marginBottom:"20px" }}>{error}</div>
        <button onClick={() => { setLoading(true); setError(""); }} style={{ padding:"8px 20px", background:"#38bdf8", border:"none", borderRadius:"8px", color:"#0f172a", cursor:"pointer", fontFamily:"monospace", fontSize:"13px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", color:"#e2e8f0", fontFamily:"monospace" }}>
      <Toaster />
      <NavBar page={page} setPage={setPage} alerts={alerts} />
      <div style={{ padding:"24px" }}>
        {page === "dashboard" && <Dashboard packets={packets} alerts={alerts} stats={stats} />}
        {page === "packets"   && <Packets packets={packets} paused={paused} setPaused={setPaused} />}
        {page === "alerts"    && <Alerts alerts={alerts} />}
      </div>
    </div>
  );
}

export default App;