import { useState } from "react";
import axios from "axios";

function AIChat() {

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I'm your Network IDS Assistant.\nAsk me anything about your network."
    }
  ]);

  const ask = async () => {

    if (!question.trim()) return;

    const q = question;

    setMessages(prev => [
      ...prev,
      { sender: "user", text: q }
    ]);

    setQuestion("");

    setLoading(true);

    try {

      const res = await axios.post(
        "http://localhost:5000/ask",
        { question: q }
      );

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: res.data.answer
        }
      ]);

    } catch {

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Error contacting AI."
        }
      ]);

    }

    setLoading(false);

  };

  return (
    <>

      {/* Floating Button */}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          border: "none",
          background: "#7c3aed",
          color: "white",
          fontSize: "30px",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0,0,0,.4)",
          zIndex: 9999
        }}
      >
        🤖
      </button>

      {open && (

        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          width: "380px",
          height: "550px",
          background: "#1e293b",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 20px rgba(0,0,0,.5)",
          zIndex: 9999
        }}>

          {/* Header */}

          <div style={{
            padding: "15px",
            background: "#7c3aed",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px"
          }}>

            🤖 Network AI

            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>

          </div>

          {/* Messages */}

          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "15px",
            background: "#0f172a"
          }}>

            {messages.map((m, i) => (

              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    m.sender === "user"
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: "12px"
                }}
              >

                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px",
                    borderRadius: "10px",
                    background:
                      m.sender === "user"
                        ? "#2563eb"
                        : "#334155",
                    color: "white",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {m.text}
                </div>

              </div>

            ))}

            {loading &&
              <div style={{ color: "#94a3b8" }}>
                Thinking...
              </div>
            }

          </div>

          {/* Input */}

          <div style={{
            display: "flex",
            padding: "10px",
            gap: "10px",
            background: "#1e293b"
          }}>

            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ask()}
              placeholder="Ask about your network..."
              style={{
                flex: 1,
                padding: "10px",
                background: "#0f172a",
                color: "white",
                border: "1px solid #334155",
                borderRadius: "8px"
              }}
            />

            <button
              onClick={ask}
              style={{
                background: "#7c3aed",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Send
            </button>

          </div>

        </div>

      )}

    </>
  );

}

export default AIChat;