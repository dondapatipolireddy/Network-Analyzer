import AlertItem from "../components/AlertItem";

function Alerts({ alerts }) {
  return (
    <div>
      <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "16px" }}>
        {alerts.length} total alerts detected
      </div>
      {alerts.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "40px", textAlign: "center",
          color: "#64748b", fontSize: "14px"
        }}>
          ✅ No alerts — network looks clean
        </div>
      ) : (
        alerts.map((a, i) => <AlertItem key={i} alert={a} />)
      )}
    </div>
  );
}

export default Alerts;