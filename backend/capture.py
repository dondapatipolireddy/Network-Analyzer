from scapy.all import sniff,TCP,IP,UDP
def packet_sniff(packet):
    if IP in packet:
        src=packet[IP].src
        dst=packet[IP].dst
        proto=packet[IP].proto
        port=packet[IP].dport if TCP in packet else 0
        print(f"source: {src} Destination: {dst} Protocol: {proto} port: {port}")
sniff(prn=packet_sniff,store=False)  #prn=packet_sniff it means capture packet and call packet_sniff function  and (store=False:) not store the capture packets better for live monitoring 