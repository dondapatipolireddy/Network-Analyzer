from scapy.all import sniff,TCP,IP,UDP,ARP,ICMP
from database import init_db,save_packet,get_top_ips
from detector import check_port_scan,syn_flood_scan,check_arp_spoof
import datetime
def get_protocol(packet):
    if TCP in packet:
        port=packet[TCP].dport
        if port==443 : return "HTTPS" , port
        if port==80 : return "HTTP" , port
        if port==22 : return "SSH" , port
        if port==21 : return "FTP" , port
        return "TCP" , port
    if UDP in packet:
        port=packet[UDP].dport
        if port==53 : return "DNS" , port
        return "UDP" ,port
    if ICMP in packet:
        return "ICMP" , 0
    return "OTHER" , 0

def process_packet(packet):
    try:
        if ARP in packet:
            src = packet[ARP].psrc
            dst = packet[ARP].pdst
            src_mac=packet[ARP].hwsrc
            time = datetime.datetime.now().strftime('%H:%M:%S')
            size = len(packet)

            print(f"time : {time} source: {src} Destination: {dst} Protocol: ARP port: 0 size : {size}")
            check_arp_spoof(src_mac,src,time)
            save_packet(time, src, dst, "ARP", 0, size)

        elif IP in packet:

            src = packet[IP].src
            dst = packet[IP].dst

            proto, port = get_protocol(packet)

            time = datetime.datetime.now().strftime('%H:%M:%S')
            size = len(packet)

            if TCP in packet:
                flags = packet[TCP].flags
                syn_flood_scan(src, str(flags), time)

            if proto in ["TCP", "HTTP", "HTTPS", "SSH", "FTP"]:
                check_port_scan(src, port, time)

            print(f"time : {time} source: {src} Destination: {dst} Protocol: {proto} port: {port} size : {size}")

            save_packet(time, src, dst, proto, port, size)

    except Exception as e:
        print("Error:", e)

 #prn=packet_sniff it means capture packet and call packet_sniff function  and (store=False:)
 #  not store the capture packets better for live monitoring 

def show_top_ips():
    print("\n--- TOP 5 MOST ACTIVE IPs ---")
    for ip, count in get_top_ips():
        print(f" ip :{ip} count: {count} packets")
    print("-----------------------------\n")

init_db()
print("Capturing packets... Press Ctrl+C to stop")
print("-" * 65)

try:
    sniff(prn=process_packet, store=False)
except KeyboardInterrupt:
    pass
finally:
    print("\nStopped.")
    show_top_ips()
