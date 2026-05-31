function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: color,
      borderRadius: "12px",
      padding: "28px 20px",
      textAlign: "center",
      width: "100%"
    }}>
      <div style={{
        fontSize: "42px",
        fontWeight: "bold",
        color: "#fff",
        lineHeight: "1"
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "13px",
        color: "rgba(255,255,255,0.75)",
        marginTop: "8px",
        fontFamily: "monospace"
      }}>
        {title}
      </div>
    </div>
  );
}

export default StatCard;