function NavBar({ page, setPage, alerts }) {
  return (
    <div style={{ background:"#1e293b", padding:"14px 24px", display:"flex", alignItems:"center", gap:"20px", borderBottom:"1px solid #334155", position:"sticky", top:0, zIndex:100 }}>
      <span style={{ fontSize:"16px", fontWeight:"bold", color:"#38bdf8" }}>
        🛡 Network IDS
      </span>
      {["dashboard","packets","alerts"].map(p => (
        <button key={p} onClick={() => setPage(p)} style={{
          background: page===p ? "#38bdf8" : "transparent",
          color: page===p ? "#0f172a" : "#94a3b8",
          border:"none", borderRadius:"8px",
          padding:"6px 16px", cursor:"pointer",
          fontFamily:"monospace", fontSize:"13px",
          position:"relative"
        }}>
          {p}
          {p === "alerts" && alerts.length > 0 && (
            <span style={{
              position:"absolute", top:"-6px", right:"-6px",
              background:"#dc2626", color:"#fff",
              borderRadius:"50%", width:"18px", height:"18px",
              fontSize:"10px", display:"flex",
              alignItems:"center", justifyContent:"center",
              fontWeight:"bold"
            }}>
              {alerts.length > 99 ? "99+" : alerts.length}
            </span>
          )}
        </button>
      ))}
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"16px" }}>
        <span style={{ fontSize:"11px", color:"#64748b" }}>
          {new Date().toLocaleTimeString()}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e" }}></div>
          <span style={{ fontSize:"11px", color:"#22c55e" }}>live</span>
        </div>
      </div>
    </div>
  );
}

export default NavBar;