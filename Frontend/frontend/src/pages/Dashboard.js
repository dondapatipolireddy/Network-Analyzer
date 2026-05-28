import StatCard from "../components/StatCard";

function Dashboard({ packets, alerts, stats }) {
  const protoColor = (proto) => {
    const colors = {
      HTTP: "#2563eb", HTTPS: "#16a34a", DNS: "#d97706",
      ARP: "#7c3aed", TCP: "#0891b2", UDP: "#c2410c",
      ICMP: "#be185d", SSH: "#065f46"
    };
    return colors[proto] || "#6b7280";
  };

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
        <StatCard title="Total Packets"  value={packets.length}  color="#1d4ed8" />
        <StatCard title="Total Alerts"   value={alerts.length}   color="#dc2626" />
        <StatCard title="Active IPs"     value={new Set(packets.map(p => p.src_ip)).size} color="#059669" />
        <StatCard title="Protocols Seen" value={Object.keys(stats).length} color="#7c3aed" />
      </div>


      <div style={{
        background: "#1e293b", borderRadius: "12px",
        padding: "20px", marginBottom: "20px"
      }}>
        <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "14px" }}>
          Protocol Distribution
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(stats).map(([proto, count]) => (
            <div key={proto} style={{
              background: protoColor(proto),
              borderRadius: "8px", padding: "8px 16px",
              fontSize: "13px", color: "#fff"
            }}>
              {proto}: {count}
            </div>
          ))}
        </div>
      </div> 

      {/* Recent Alerts */}
      <div style={{
        background: "#1e293b", borderRadius: "12px", padding: "20px"
      }}>
        <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "14px" }}>
          Recent Alerts
        </div>
        {alerts.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "13px" }}>
            No alerts yet — system monitoring...
          </div>
        ) : (
          alerts.slice(0, 5).map((a, i) => (
            <div key={i} style={{
              background: "#450a0a",
              borderLeft: "3px solid #dc2626",
              borderRadius: "6px",
              padding: "10px 14px", marginBottom: "8px",
              fontSize: "13px"
            }}>
              <span style={{ color: "#f87171" }}>🚨 {a.type}</span>
              <span style={{ color: "#94a3b8", marginLeft: "12px" }}>{a.description}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;