from packet_handler import start_capture
from database import init_db,get_top_ips
from scapy.all import sniff

def show_top_ips():
    print("\n--- TOP 5 MOST ACTIVE IPs ---")
    for ip, count in get_top_ips():
        print(f" ip :{ip} count: {count} packets")
    print("-----------------------------\n")

init_db()
print("Capturing packets... Press Ctrl+C to stop")
print("-" * 65)

try:
    start_capture()
except KeyboardInterrupt:
    pass
finally:
    print("\nStopped.")
    show_top_ips()
