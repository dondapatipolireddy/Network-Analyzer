function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: color,
      borderRadius: "12px",
      padding: "20px",
      minWidth: "140px",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "28px", fontWeight: "bold", color: "#fff" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
        {title}
      </div>
    </div>
  );
}

export default StatCard;