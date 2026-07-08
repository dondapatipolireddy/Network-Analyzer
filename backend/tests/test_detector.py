import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from unittest.mock import patch
from detector import (
    check_port_scan, syn_flood_scan, check_arp_spoof,
    port_scan_tracking, syn_flood_tracking,
    arp_spoof_scanning, time_tracking, syn_time_tracking
)

def reset():
    port_scan_tracking.clear()
    syn_flood_tracking.clear()
    arp_spoof_scanning.clear()
    time_tracking.clear()
    syn_time_tracking.clear()

def test_1_normal_traffic_no_alert():
    reset()
    with patch('detector.save_alert') as mock:
        for port in range(80, 85):
            check_port_scan("10.0.0.1", port, "12:00:00")
        mock.assert_not_called()
    print("✅ Test 1: Normal traffic does not trigger alert")

def test_2_port_scan_detected():
    reset()
    with patch('detector.save_alert') as mock:
        for port in range(1, 17):
            check_port_scan("10.0.0.2", port, "12:00:00")
        mock.assert_called_once()
        assert mock.call_args[0][1] == "PORT_SCAN"
        assert mock.call_args[0][3] == "HIGH"
    print("✅ Test 2: Port scan correctly detected")

def test_3_whitelist_no_alert():
    reset()
    with patch('detector.save_alert') as mock:
        for port in range(1, 21):
            check_port_scan("192.168.31.1", port, "12:00:00")
        mock.assert_not_called()
    print("✅ Test 3: Whitelisted IP does not trigger alert")

def test_4_normal_syn_no_alert():
    reset()
    with patch('detector.save_alert') as mock:
        for _ in range(50):
            syn_flood_scan("10.0.0.3", "S", "12:00:00")
        mock.assert_not_called()
    print("✅ Test 4: Normal SYN count does not trigger alert")

def test_5_syn_flood_detected():
    reset()
    with patch('detector.save_alert') as mock:
        for _ in range(101):
            syn_flood_scan("10.0.0.4", "S", "12:00:00")
        mock.assert_called_once()
        assert mock.call_args[0][1] == "SYN_FLOOD"
        assert mock.call_args[0][3] == "HIGH"
    print("✅ Test 5: SYN flood correctly detected")

def test_6_non_syn_ignored():
    reset()
    with patch('detector.save_alert') as mock:
        for _ in range(200):
            syn_flood_scan("10.0.0.5", "A", "12:00:00")
        mock.assert_not_called()
    print("✅ Test 6: Non-SYN packets correctly ignored")

def test_7_normal_arp_no_alert():
    reset()
    with patch('detector.save_alert') as mock:
        check_arp_spoof("aa:bb:cc:dd:ee:ff", "192.168.1.1", "12:00:00")
        check_arp_spoof("aa:bb:cc:dd:ee:ff", "192.168.1.1", "12:00:00")
        mock.assert_not_called()
    print("✅ Test 7: Normal ARP does not trigger alert")

def test_8_arp_spoof_detected():
    reset()
    with patch('detector.save_alert') as mock:
        check_arp_spoof("aa:bb:cc:dd:ee:ff", "192.168.1.1", "12:00:00")
        check_arp_spoof("aa:bb:cc:dd:ee:ff", "192.168.1.2", "12:00:00")
        check_arp_spoof("aa:bb:cc:dd:ee:ff", "192.168.1.3", "12:00:00")
        mock.assert_called_once()
        assert mock.call_args[0][1] == "ARP_SPOOF"
        assert mock.call_args[0][3] == "MEDIUM"
    print("✅ Test 8: ARP spoof correctly detected")

def test_9_port_scan_resets_after_alert():
    reset()
    with patch('detector.save_alert') as mock:
        for port in range(1, 17):
            check_port_scan("10.0.0.6", port, "12:00:00")
        assert mock.call_count == 1
        for port in range(100, 105):
            check_port_scan("10.0.0.6", port, "12:00:00")
        assert mock.call_count == 1
    print("✅ Test 9: Port scan resets after alert fires")

def test_10_multiple_ips_independent():
    reset()
    with patch('detector.save_alert') as mock:
        for port in range(1, 6):
            check_port_scan("10.0.0.7", port, "12:00:00")
        for port in range(1, 17):
            check_port_scan("10.0.0.8", port, "12:00:00")
        assert mock.call_count == 1
        assert mock.call_args[0][2] == "10.0.0.8"
    print("✅ Test 10: Multiple IPs tracked independently")

if __name__ == "__main__":
    print("\n🔍 Running IDS Test Suite...\n")
    test_1_normal_traffic_no_alert()
    test_2_port_scan_detected()
    test_3_whitelist_no_alert()
    test_4_normal_syn_no_alert()
    test_5_syn_flood_detected()
    test_6_non_syn_ignored()
    test_7_normal_arp_no_alert()
    test_8_arp_spoof_detected()
    test_9_port_scan_resets_after_alert()
    test_10_multiple_ips_independent()
    print("\n✅ All 10 tests passed!\n")