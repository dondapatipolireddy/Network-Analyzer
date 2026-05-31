function NavBar({ page, setPage }) {
  return (
    <div style={{ background:"#1e293b", padding:"14px 24px", display:"flex", alignItems:"center", gap:"20px", borderBottom:"1px solid #334155" }}>
      <span style={{ fontSize:"16px", fontWeight:"bold", color:"#38bdf8" }}>
        🛡 Network IDS
      </span>
      {["dashboard","packets","alerts"].map(p => (
        <button key={p} onClick={() => setPage(p)} style={{
          background: page===p ? "#38bdf8" : "transparent",
          color: page===p ? "#0f172a" : "#94a3b8",
          border:"none", borderRadius:"8px",
          padding:"6px 16px", cursor:"pointer",
          fontFamily:"monospace", fontSize:"13px"
        }}>
          {p}
        </button>
      ))}
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e" }}></div>
        <span style={{ fontSize:"11px", color:"#22c55e" }}>live</span>
      </div>
    </div>
  );
}

export default NavBar;