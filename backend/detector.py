from collections import defaultdict
import datetime
from database import save_alert

port_scan_tracking=defaultdict(set)
syn_flood_tracking=defaultdict(int)
time_tracking=defaultdict(str)

PORTSCAN_THRESHOLD=15
TIME_WINDOW=5

def check_port_scan(src_ip,dest_port,timestamp):
    now=datetime.datetime.now()
    if src_ip in time_tracking:
        first_seen=time_tracking[src_ip]
        diff=now-first_seen
        if diff>TIME_WINDOW:
            port_scan_tracking[src_ip].clear()
            time_tracking[src_ip]=now
    else:
        time_tracking[src_ip]=now

    port_scan_tracking[src_ip].add(dest_port)

    if len(port_scan_tracking)>=PORTSCAN_THRESHOLD:
        alert_msg = f"PORT SCAN DETECTED from {src_ip} — hit {len(port_scan_tracker[src_ip])} ports"
        print(f"\n🚨 ALERT: {alert_msg}\n")
        save_alert(timestamp, "PORT_SCAN", src_ip, "HIGH", alert_msg)
        port_scan_tracking[src_ip].clear()  # reset after alert