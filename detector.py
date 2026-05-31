from collections import defaultdict
import datetime
from database import save_alert

port_scan_tracking = defaultdict(set)
syn_flood_tracking = defaultdict(int)
arp_spoof_scanning = defaultdict(set)
time_tracking      = {}
syn_time_tracking  = {}

PORTSCAN_THRESHOLD = 15
TIME_WINDOW        = 5
SYN_WINDOW         = 10
SYN_THRESHOLD      = 100
ARP_THRESHOLD      = 3
WHITELIST          = ['192.168.31.1', '192.168.31.156', '127.0.0.1']

def check_port_scan(src_ip, dest_port, timestamp):
    if src_ip in WHITELIST:
        return
    now = datetime.datetime.now()
    if src_ip in time_tracking:
        diff = (now - time_tracking[src_ip]).seconds
        if diff > TIME_WINDOW:
            port_scan_tracking[src_ip].clear()
            time_tracking[src_ip] = now
    else:
        time_tracking[src_ip] = now
    port_scan_tracking[src_ip].add(dest_port)
    if len(port_scan_tracking[src_ip]) >= PORTSCAN_THRESHOLD:
        alert_msg = f"PORT SCAN DETECTED from {src_ip} hit {len(port_scan_tracking[src_ip])} ports"
        print(alert_msg)
        save_alert(timestamp, "PORT_SCAN", src_ip, "HIGH", alert_msg)
        port_scan_tracking[src_ip].clear()

def syn_flood_scan(src_ip, flags, timestamp):
    if flags != 'S':
        return
    now = datetime.datetime.now()
    if src_ip in syn_time_tracking:
        diff = (now - syn_time_tracking[src_ip]).seconds
        if diff > SYN_WINDOW:
            syn_flood_tracking[src_ip] = 0
            syn_time_tracking[src_ip]  = now
    else:
        syn_time_tracking[src_ip] = now
    syn_flood_tracking[src_ip] += 1
    if syn_flood_tracking[src_ip] >= SYN_THRESHOLD:
        alert_msg = f"SYN FLOOD from {src_ip} {syn_flood_tracking[src_ip]} SYNs"
        print(alert_msg)
        save_alert(timestamp, "SYN_FLOOD", src_ip, "HIGH", alert_msg)
        syn_flood_tracking[src_ip] = 0

def check_arp_spoof(mac, src_ip, timestamp):
    arp_spoof_scanning[mac].add(src_ip)
    if len(arp_spoof_scanning[mac]) >= ARP_THRESHOLD:
        alert_msg = f"ARP SPOOF MAC {mac} claiming {len(arp_spoof_scanning[mac])} IPs"
        print(alert_msg)
        save_alert(timestamp, "ARP_SPOOF", mac, "MEDIUM", alert_msg)
        arp_spoof_scanning[mac].clear()
