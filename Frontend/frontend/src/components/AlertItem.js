function AlertItem({ alert }) {
  const color = {
    HIGH:   "#dc2626",
    MEDIUM: "#ea580c",
    LOW:    "#ca8a04"
  }[alert.severity] || "#6b7280";

  return (
    <div style={{
      background: "#1e293b",
      borderLeft: `4px solid ${color}`,
      borderRadius: "8px",
      padding: "14px 18px",
      marginBottom: "10px"
    }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "6px" }}>
        <span style={{
          background: color, color: "#fff",
          borderRadius: "4px", padding: "2px 10px",
          fontSize: "11px", fontWeight: "bold"
        }}>
          {alert.severity}
        </span>
        <span style={{ color: "#f87171", fontSize: "13px", fontWeight: "bold" }}>
          {alert.type}
        </span>
        <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "auto" }}>
          {alert.timestamp}
        </span>
      </div>
      <div style={{ fontSize: "13px", color: "#94a3b8" }}>
        {alert.description}
      </div>
      <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
        Source: {alert.src_ip}
      </div>
    </div>
  );
}

export default AlertItem;