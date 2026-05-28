from flask import Flask,jsonify
from flask_cors import CORS
import threading
from packet_handler import start_capture
from database import (
    init_db,
    get_all_alerts,
    get_protocol_status,
    get_recent_packets,
    get_top_ips
)

app=Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({'status': 'IDS API running', 'version': '1.0'})

@app.route('/packets')
def packets():
    return jsonify(get_recent_packets(100))

@app.route('/alerts')
def get_alerts():
    return jsonify(get_all_alerts())

@app.route('/stats')
def get_stats():
    stats = get_protocol_status()
    result = {}
    for item in stats:
        result[item['_id']] = item['count']
    return jsonify(result)

@app.route('/top-ips')
def get_top():
    ips = get_top_ips()
    result = [{'ip': ip, 'count': count} for ip, count in ips]
    return jsonify(result)

@app.route('/live')
def get_live():
    return jsonify(get_recent_packets(10))

if __name__ == '__main__':
    init_db()

    capture_thread = threading.Thread(target=start_capture)    #python by default synchronous
    capture_thread.daemon = True                               # requires threading in node.js not 
    capture_thread.start()                                     # it is asynchronous
    print("Packet capture started in background...")
    print("API running at http://localhost:5000")

    app.run(debug=False, port=5000)