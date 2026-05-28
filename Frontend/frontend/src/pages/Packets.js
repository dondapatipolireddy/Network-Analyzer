import { useState } from "react";

function Packets({ packets, paused, setPaused }) {
  const [filter, setFilter] = useState("");

  const protoColor = (proto) => {
    const colors = {
      HTTP: "#2563eb", HTTPS: "#16a34a", DNS: "#d97706",
      ARP: "#7c3aed", TCP: "#0891b2", UDP: "#c2410c"
    };
    return colors[proto] || "#6b7280";
  };

  const filtered = packets.filter(p =>
    p.src_ip?.includes(filter) ||
    p.dst_ip?.includes(filter) ||
    p.protocol?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input
          placeholder="Filter by IP or protocol..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            flex: 1, padding: "10px 14px",
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "8px", color: "#e2e8f0",
            fontFamily: "monospace", fontSize: "13px"
          }}
        />
        <button onClick={() => setPaused(!paused)} style={{
          padding: "10px 20px",
          background: paused ? "#16a34a" : "#dc2626",
          border: "none", borderRadius: "8px",
          color: "#fff", cursor: "pointer",
          fontFamily: "monospace", fontSize: "13px"
        }}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 1fr 80px 70px 70px",
          padding: "10px 16px", background: "#0f172a",
          fontSize: "11px", color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          <span>Time</span><span>Source IP</span><span>Dest IP</span>
          <span>Protocol</span><span>Port</span><span>Size</span>
        </div>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {filtered.slice(0, 100).map((p, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 1fr 80px 70px 70px",
              padding: "8px 16px", fontSize: "12px",
              borderBottom: "1px solid #0f172a",
              background: i % 2 === 0 ? "#1e293b" : "#162032"
            }}>
              <span style={{ color: "#64748b" }}>{p.timestamp}</span>
              <span style={{ color: "#38bdf8" }}>{p.src_ip}</span>
              <span style={{ color: "#94a3b8" }}>{p.dst_ip}</span>
              <span style={{
                background: protoColor(p.protocol), color: "#fff",
                borderRadius: "4px", padding: "1px 6px",
                fontSize: "11px", display: "inline-block"
              }}>{p.protocol}</span>
              <span style={{ color: "#94a3b8" }}>{p.port}</span>
              <span style={{ color: "#64748b" }}>{p.size}B</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Packets;