from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import threading
import csv
import io
import os

from packet_handler import start_capture
from rag_engine import answer_question
from database import (
    init_db,
    get_all_alerts,
    get_protocol_status,
    get_recent_packets,
    get_top_ips,
    alerts_collection,
    packets_collection
)

app = Flask(__name__)
CORS(app)


# ── HOME ──────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        "status": "IDS API running",
        "version": "1.0"
    })


# ── PACKETS ───────────────────────────────────────────
@app.route('/packets')
def get_packets():
    return jsonify(get_recent_packets(100))


# ── ALERTS ────────────────────────────────────────────
@app.route('/alerts')
def get_alerts():
    return jsonify(get_all_alerts())


# ── STATS ─────────────────────────────────────────────
@app.route('/stats')
def get_stats():
    protocol_stats = get_protocol_status()
    result = {}
    for item in protocol_stats:
        result[item["_id"]] = item["count"]
    return jsonify(result)


# ── TOP IPS ───────────────────────────────────────────
@app.route('/top-ips')
def get_top():
    ips = get_top_ips()
    result = []
    for ip, count in ips:
        result.append({"ip": ip, "count": count})
    return jsonify(result)


# ── LIVE ──────────────────────────────────────────────
@app.route('/live')
def get_live():
    return jsonify(get_recent_packets(10))


# ── EXPORT ALERTS CSV ─────────────────────────────────
@app.route('/export-alerts')
def export_alerts():
    alerts = get_all_alerts()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'Timestamp', 'Type', 'Source IP', 'Severity', 'Description'
    ])
    for alert in alerts:
        writer.writerow([
            alert.get('timestamp', ''),
            alert.get('type', ''),
            alert.get('src_ip', ''),
            alert.get('severity', ''),
            alert.get('description', '')
        ])
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={
            'Content-Disposition': 'attachment;filename=alerts.csv'
        }
    )


# ── EXPORT PACKETS CSV ────────────────────────────────
@app.route('/export-packets')
def export_packets():
    packets_data = get_recent_packets(1000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'Timestamp', 'Source IP', 'Dest IP', 'Protocol', 'Port', 'Size'
    ])
    for p in packets_data:
        writer.writerow([
            p.get('timestamp', ''),
            p.get('src_ip', ''),
            p.get('dst_ip', ''),
            p.get('protocol', ''),
            p.get('port', ''),
            p.get('size', '')
        ])
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={
            'Content-Disposition': 'attachment;filename=packets.csv'
        }
    )


# ── CLEAR ALERTS ──────────────────────────────────────
@app.route('/clear-alerts', methods=['DELETE'])
def clear_alerts():
    try:
        result = alerts_collection.delete_many({})
        return jsonify({
            'status': 'cleared',
            'deleted': result.deleted_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── CLEAR PACKETS ─────────────────────────────────────
@app.route('/clear-packets', methods=['DELETE'])
def clear_packets():
    try:
        result = packets_collection.delete_many({})
        return jsonify({
            'status': 'cleared',
            'deleted': result.deleted_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── UPLOAD PCAP ───────────────────────────────────────
@app.route('/upload-pcap', methods=['POST'])
def upload_pcap():
    from werkzeug.utils import secure_filename
    from scapy.all import rdpcap, IP, TCP, UDP, ICMP

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    if not file.filename.endswith('.pcap'):
        return jsonify({'error': 'Only .pcap files allowed'}), 400

    upload_folder = 'uploads'
    os.makedirs(upload_folder, exist_ok=True)
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        pkts = rdpcap(filepath)
        results = {
            'total_packets': len(pkts),
            'protocols': {},
            'top_ips': {}
        }
        for packet in pkts:
            if IP in packet:
                src = packet[IP].src
                if TCP in packet:    proto = "TCP"
                elif UDP in packet:  proto = "UDP"
                elif ICMP in packet: proto = "ICMP"
                else:                proto = "OTHER"
                results['protocols'][proto] = results['protocols'].get(proto, 0) + 1
                results['top_ips'][src]     = results['top_ips'].get(src, 0) + 1

        results['top_ips'] = dict(
            sorted(
                results['top_ips'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        )
        os.remove(filepath)
        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── AI ASSISTANT ──────────────────────────────────────
@app.route('/ask', methods=['POST'])
def ask():
    data     = request.get_json()
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        prompt, context = answer_question(question)

        final_prompt = f"""
You are an AI Network Security Assistant.
You have access to real-time network monitoring data.

Network Data:
{context}

User Question:
{question}

Answer clearly in simple English.
Be specific with IP addresses, counts and timestamps from the data.
"""
        try:
            import ollama
            response = ollama.chat(
                model="gemma3:1b",
                messages=[{
                    "role": "user",
                    "content": final_prompt
                }]
            )
            answer = response["message"]["content"]

        except Exception:
            # Fallback if Ollama not running
            q = question.lower()
            total_packets = packets_collection.count_documents({})
            total_alerts  = alerts_collection.count_documents({})

            recent = list(alerts_collection.find(
                {}, {'_id': 0}
            ).sort('created_at', -1).limit(5))

            pipeline = [
                {'$group': {'_id': '$src_ip', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$limit': 1}
            ]
            from database import packets_collection as pc
            top_ip = list(pc.aggregate(pipeline))

            if 'alert' in q or 'attack' in q or 'threat' in q:
                if total_alerts == 0:
                    answer = "No alerts detected. Network looks clean."
                else:
                    types = list(set([a.get('type') for a in recent]))
                    ips   = list(set([a.get('src_ip') for a in recent]))
                    answer = f"Found {total_alerts} alerts. Types: {', '.join(types)}. IPs: {', '.join(ips)}."

            elif 'ip' in q or 'active' in q:
                if top_ip:
                    answer = f"Most active IP: {top_ip[0]['_id']} with {top_ip[0]['count']} packets."
                else:
                    answer = "No packet data yet."

            elif 'protocol' in q:
                pipeline2 = [
                    {'$group': {'_id': '$protocol', 'count': {'$sum': 1}}},
                    {'$sort': {'count': -1}},
                    {'$limit': 5}
                ]
                protos = list(pc.aggregate(pipeline2))
                if protos:
                    answer = "Top protocols: " + ', '.join([f"{p['_id']}({p['count']})" for p in protos])
                else:
                    answer = "No protocol data yet."

            elif 'safe' in q or 'status' in q:
                if total_alerts == 0:
                    answer = f"Network SAFE. {total_packets} packets, 0 alerts."
                else:
                    answer = f"ATTENTION: {total_alerts} alerts detected. Check alerts page."

            else:
                answer = f"Status: {total_packets} packets, {total_alerts} alerts. Ask about IPs, protocols or attacks."

        return jsonify({
            'answer': answer,
            'context': context
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── START ─────────────────────────────────────────────
if __name__ == '__main__':
    init_db()

    capture_thread = threading.Thread(target=start_capture)
    capture_thread.daemon = True
    capture_thread.start()

    print("Packet capture started in background...")
    print("API running at http://localhost:5000")
    print("\nEndpoints:")
    print("  GET  /packets")
    print("  GET  /alerts")
    print("  GET  /stats")
    print("  GET  /top-ips")
    print("  GET  /live")
    print("  GET  /export-alerts")
    print("  GET  /export-packets")
    print("  DELETE /clear-alerts")
    print("  DELETE /clear-packets")
    print("  POST /upload-pcap")
    print("  POST /ask")

    app.run(host="0.0.0.0", port=5000, debug=False)