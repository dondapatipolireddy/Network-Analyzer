import AlertItem from "../components/AlertItem";

function Alerts({ alerts }) {
  const high   = alerts.filter(a => a.severity === "HIGH").length;
  const medium = alerts.filter(a => a.severity === "MEDIUM").length;
  const low    = alerts.filter(a => a.severity === "LOW").length;

  const exportCSV = () => {
    window.open("http://localhost:5000/export-alerts", "_blank");
  };

  const clearAlerts = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/clear-alerts",
        { method: "DELETE" }
      );
      const data = await res.json();
      console.log("Cleared:", data);
      window.location.reload();
    } catch (err) {
      console.error("Clear failed:", err);
      alert("Failed to clear alerts. Check backend is running.");
    }
  };

  return (
    <div>
      {/* Action buttons */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"20px" }}>
        <button onClick={exportCSV} style={{
          padding:"9px 20px",
          background:"#059669",
          border:"none", borderRadius:"8px",
          color:"#fff", cursor:"pointer",
          fontFamily:"monospace", fontSize:"13px"
        }}>
          ⬇ Export CSV
        </button>
        <button onClick={clearAlerts} style={{
          padding:"9px 20px",
          background:"#dc2626",
          border:"none", borderRadius:"8px",
          color:"#fff", cursor:"pointer",
          fontFamily:"monospace", fontSize:"13px"
        }}>
          🗑 Clear Alerts
        </button>
        <span style={{ marginLeft:"auto", fontSize:"13px", color:"#94a3b8", paddingTop:"9px" }}>
          {alerts.length} total alerts
        </span>
      </div>

      {/* Severity cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"20px" }}>
        <div style={{ background:"#450a0a", borderRadius:"10px", padding:"16px", textAlign:"center", border:"1px solid #dc2626" }}>
          <div style={{ fontSize:"28px", fontWeight:"bold", color:"#f87171" }}>{high}</div>
          <div style={{ fontSize:"12px", color:"#fca5a5", marginTop:"4px" }}>HIGH Severity</div>
        </div>
        <div style={{ background:"#431407", borderRadius:"10px", padding:"16px", textAlign:"center", border:"1px solid #ea580c" }}>
          <div style={{ fontSize:"28px", fontWeight:"bold", color:"#fb923c" }}>{medium}</div>
          <div style={{ fontSize:"12px", color:"#fdba74", marginTop:"4px" }}>MEDIUM Severity</div>
        </div>
        <div style={{ background:"#422006", borderRadius:"10px", padding:"16px", textAlign:"center", border:"1px solid #ca8a04" }}>
          <div style={{ fontSize:"28px", fontWeight:"bold", color:"#fbbf24" }}>{low}</div>
          <div style={{ fontSize:"12px", color:"#fcd34d", marginTop:"4px" }}>LOW Severity</div>
        </div>
      </div>

      {/* Alert count */}
      <div style={{ fontSize:"13px", color:"#94a3b8", marginBottom:"14px" }}>
        {alerts.length} total alerts detected
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div style={{ background:"#1e293b", borderRadius:"12px", padding:"40px", textAlign:"center", color:"#64748b", fontSize:"14px" }}>
          ✅ No alerts — network looks clean
        </div>
      ) : (
        alerts.map((a,i) => <AlertItem key={i} alert={a} />)
      )}
    </div>
  );
}

export default Alerts;