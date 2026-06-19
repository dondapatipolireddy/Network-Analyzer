import { useState } from "react";
import axios from "axios";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/ask",
        { question }
      );
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background:"#1e293b", borderRadius:"12px", padding:"20px", marginTop:"16px" }}>
      <div style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"14px" }}>
        🤖 Ask AI About Your Network
      </div>
      
      <div style={{ display:"flex", gap:"10px", marginBottom:"14px" }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Which IP caused most alerts? Is my network safe?"
          style={{ flex:1, padding:"9px 14px", background:"#0f172a", border:"1px solid #334155", borderRadius:"8px", color:"#e2e8f0", fontFamily:"monospace", fontSize:"13px", outline:"none" }}
        />
        <button onClick={ask} disabled={loading} style={{
          padding:"9px 20px",
          background:"#7c3aed",
          border:"none", borderRadius:"8px",
          color:"#fff", cursor:"pointer",
          fontFamily:"monospace", fontSize:"13px"
        }}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div style={{ background:"#0f172a", borderRadius:"8px", padding:"14px", fontSize:"13px", color:"#94a3b8", lineHeight:"1.6" }}>
          {answer}
        </div>
      )}

      <div style={{ marginTop:"10px", display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {[
          "Which IP caused most alerts?",
          "Is my network under attack?",
          "What protocols are most active?",
          "Summarize today's network activity"
        ].map((q, i) => (
          <button key={i} onClick={() => { setQuestion(q); }} style={{
            padding:"5px 12px",
            background:"transparent",
            border:"1px solid #334155",
            borderRadius:"20px",
            color:"#64748b",
            cursor:"pointer",
            fontFamily:"monospace",
            fontSize:"11px"
          }}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AIChat;