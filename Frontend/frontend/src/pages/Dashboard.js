import StatCard from "../components/StatCard";
import AIChat from "../components/AIChat";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { useState, useEffect } from "react";

const COLORS = ["#16a34a","#2563eb","#d97706","#7c3aed","#0891b2","#c2410c","#be185d","#6b7280"];

function Dashboard({ packets, alerts, stats }) {
  const [timeData, setTimeData] = useState([]);

  useEffect(() => {
    const now = new Date();
    const label = now.toLocaleTimeString();
    setTimeData(prev => {
      const updated = [...prev, { time: label, packets: packets.length }];
      return updated.slice(-20);
    });
  }, [packets]);

  const topIPs = [...new Map(
    packets.map(p => [p.src_ip, packets.filter(x => x.src_ip === p.src_ip).length])
  ).entries()].sort((a,b) => b[1]-a[1]).slice(0,5);

  const pieData = Object.entries(stats).map(([name, value]) => ({ name, value }));

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
        <StatCard title="Total Packets"  value={packets.length} color="#1d4ed8" />
        <StatCard title="Total Alerts"   value={alerts.length}  color="#dc2626" />
        <StatCard title="Active IPs"     value={new Set(packets.map(p=>p.src_ip)).size} color="#059669" />
        <StatCard title="Protocols Seen" value={Object.keys(stats).length} color="#7c3aed" />
      </div>

      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"16px" }}>

        {/* Line Chart */}
        <div style={{ background:"#1e293b", borderRadius:"12px", padding:"20px" }}>
          <div style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"16px" }}>
            Packets Over Time
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill:"#64748b", fontSize:10 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:10 }} />
              <Tooltip
                contentStyle={{ background:"#0f172a", border:"1px solid #334155", borderRadius:"8px" }}
                labelStyle={{ color:"#94a3b8" }}
                itemStyle={{ color:"#38bdf8" }}
              />
              <Line type="monotone" dataKey="packets" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ background:"#1e293b", borderRadius:"12px", padding:"20px" }}>
          <div style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"16px" }}>
            Protocol Distribution
          </div>
          {pieData.length === 0 ? (
            <div style={{ height:"200px", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", fontSize:"13px" }}>
              Waiting for packets...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background:"#0f172a", border:"1px solid #334155", borderRadius:"8px" }}
                  itemStyle={{ color:"#94a3b8" }}
                />
                <Legend formatter={(value) => <span style={{ color:"#94a3b8", fontSize:"11px" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Active IPs */}
      <div style={{ background:"#1e293b", borderRadius:"12px", padding:"20px", marginBottom:"16px" }}>
        <div style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"14px" }}>
          Top Active IPs
        </div>
        {topIPs.length === 0 ? (
          <span style={{ color:"#64748b", fontSize:"13px" }}>Waiting for data...</span>
        ) : (
          topIPs.map(([ip,count],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"#0f172a", borderRadius:"8px", marginBottom:"8px", fontSize:"13px" }}>
              <span style={{ color:"#38bdf8" }}>{ip}</span>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:`${Math.min(count*2, 100)}px`, height:"4px", background:"#38bdf8", borderRadius:"2px" }}></div>
                <span style={{ color:"#94a3b8" }}>{count} packets</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Chat */}
      <AIChat />

      {/* Recent Alerts */}
      <div style={{ background:"#1e293b", borderRadius:"12px", padding:"20px", marginTop:"16px" }}>
        <div style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"14px" }}>
          Recent Alerts
        </div>
        {alerts.length === 0 ? (
          <div style={{ color:"#64748b", fontSize:"13px" }}>✅ No alerts — network is clean</div>
        ) : (
          alerts.slice(0,5).map((a,i) => (
            <div key={i} style={{ background:a.severity==="HIGH"?"#450a0a":"#431407", borderLeft:`3px solid ${a.severity==="HIGH"?"#dc2626":"#ea580c"}`, borderRadius:"8px", padding:"12px 16px", marginBottom:"10px" }}>
              <div style={{ fontSize:"13px", color:a.severity==="HIGH"?"#f87171":"#fb923c", fontWeight:"bold", marginBottom:"4px" }}>
                🚨 {a.type}
              </div>
              <div style={{ fontSize:"12px", color:"#94a3b8" }}>{a.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;