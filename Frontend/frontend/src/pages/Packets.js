import { useState, useEffect } from "react";

const protoColor = (proto) => ({
  HTTP:"#2563eb", HTTPS:"#16a34a", DNS:"#d97706",
  ARP:"#7c3aed", TCP:"#0891b2", UDP:"#c2410c",
  ICMP:"#be185d", SSH:"#065f46"
}[proto] || "#6b7280");

const geoCache = {};

async function getGeoInfo(ip) {
  if (geoCache[ip]) return geoCache[ip];
  if (ip.startsWith('192.168') || ip.startsWith('10.') || 
      ip.startsWith('127.') || ip === '0.0.0.0') {
    geoCache[ip] = { country: 'Local', flag: '🏠' };
    return geoCache[ip];
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode`);
    const data = await res.json();
    const flag = data.countryCode 
      ? String.fromCodePoint(...[...data.countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
      : '🌐';
    geoCache[ip] = { country: data.country || 'Unknown', flag };
    return geoCache[ip];
  } catch {
    geoCache[ip] = { country: 'Unknown', flag: '🌐' };
    return geoCache[ip];
  }
}

function Packets({ packets, paused, setPaused }) {
  const [filter,   setFilter]   = useState("");
  const [geoData,  setGeoData]  = useState({});
  const [loading,  setLoading]  = useState(false);

  // Geo lookup for unique IPs
  useEffect(() => {
    const uniqueIPs = [...new Set(packets.map(p => p.src_ip))];
    uniqueIPs.forEach(async (ip) => {
      if (!geoData[ip]) {
        const info = await getGeoInfo(ip);
        setGeoData(prev => ({ ...prev, [ip]: info }));
      }
    });
  }, [packets]);

  const filtered = packets.filter(p =>
    p.src_ip?.includes(filter) ||
    p.dst_ip?.includes(filter) ||
    p.protocol?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      {/* Controls */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"14px" }}>
        <input
          placeholder="Filter by IP or protocol..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ flex:1, padding:"9px 14px", background:"#1e293b", border:"1px solid #334155", borderRadius:"8px", color:"#e2e8f0", fontFamily:"monospace", fontSize:"13px", outline:"none" }}
        />
        <button onClick={() => setPaused(!paused)} style={{
          padding:"9px 20px",
          background: paused ? "#16a34a" : "#dc2626",
          border:"none", borderRadius:"8px",
          color:"#fff", cursor:"pointer",
          fontFamily:"monospace", fontSize:"13px"
        }}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display:"flex", gap:"16px", marginBottom:"14px", fontSize:"12px", color:"#64748b" }}>
        <span>Total: <strong style={{ color:"#38bdf8" }}>{packets.length}</strong></span>
        <span>Showing: <strong style={{ color:"#38bdf8" }}>{filtered.length}</strong></span>
        <span>Unique IPs: <strong style={{ color:"#38bdf8" }}>{new Set(packets.map(p=>p.src_ip)).size}</strong></span>
      </div>

      {/* Table */}
      <div style={{ background:"#1e293b", borderRadius:"12px", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"70px 1fr 80px 1fr 70px 55px 55px", padding:"9px 16px", background:"#0f172a", fontSize:"10px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>
          <span>Time</span>
          <span>Source IP</span>
          <span>Country</span>
          <span>Dest IP</span>
          <span>Protocol</span>
          <span>Port</span>
          <span>Size</span>
        </div>
        <div style={{ maxHeight:"65vh", overflowY:"auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"30px", textAlign:"center", color:"#64748b", fontSize:"13px" }}>
              {packets.length === 0 ? "Waiting for packets..." : "No packets match filter"}
            </div>
          ) : (
            filtered.map((p,i) => {
              const geo = geoData[p.src_ip];
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"70px 1fr 80px 1fr 70px 55px 55px", padding:"7px 16px", fontSize:"12px", borderBottom:"1px solid #0f172a", background:i%2===0?"#1e293b":"#162032" }}>
                  <span style={{ color:"#64748b" }}>{p.timestamp}</span>
                  <span style={{ color:"#38bdf8" }}>{p.src_ip}</span>
                  <span style={{ fontSize:"11px" }}>
                    {geo ? `${geo.flag} ${geo.country}` : '...'}
                  </span>
                  <span style={{ color:"#94a3b8" }}>{p.dst_ip}</span>
                  <span>
                    <span style={{ background:protoColor(p.protocol), color:"#fff", borderRadius:"4px", padding:"1px 6px", fontSize:"10px" }}>
                      {p.protocol}
                    </span>
                  </span>
                  <span style={{ color:"#94a3b8" }}>{p.port}</span>
                  <span style={{ color:"#64748b" }}>{p.size}B</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Packets;