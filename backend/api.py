from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import ollama

from packet_handler import start_capture
from rag_engine import answer_question
from database import (
    init_db,
    get_all_alerts,
    get_protocol_status,
    get_recent_packets,
    get_top_ips
)

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return jsonify({
        "status": "IDS API running",
        "version": "1.0"
    })


@app.route('/packets')
def packets():
    return jsonify(get_recent_packets(100))


@app.route('/alerts')
def alerts():
    return jsonify(get_all_alerts())


@app.route('/stats')
def stats():
    protocol_stats = get_protocol_status()

    result = {}
    for item in protocol_stats:
        result[item["_id"]] = item["count"]

    return jsonify(result)


@app.route('/top-ips')
def top_ips():
    ips = get_top_ips()

    result = []

    for ip, count in ips:
        result.append({
            "ip": ip,
            "count": count
        })

    return jsonify(result)


@app.route('/live')
def live():
    return jsonify(get_recent_packets(10))


@app.route('/ask', methods=["POST"])
def ask():

    data = request.get_json()

    question = data.get("question", "")

    # Get RAG context
    prompt, context = answer_question(question)

    final_prompt = f"""
You are an AI Network Security Assistant.

Network Data:
{context}

User Question:
{question}

Answer clearly in simple English.
"""

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": final_prompt
                }
            ]
        )

        answer = response["message"]["content"]

        return jsonify({
            "answer": answer,
            "context": context
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    init_db()

    capture_thread = threading.Thread(target=start_capture)
    capture_thread.daemon = True
    capture_thread.start()

    print("Packet capture started...")
    print("Flask running on http://localhost:5000")

    app.run(host="0.0.0.0", port=5000, debug=False)