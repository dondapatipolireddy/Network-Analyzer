import axios from "axios";

const BASE = "http://localhost:5000";

export const fetchPackets = () => axios.get(`${BASE}/packets`);
export const fetchAlerts  = () => axios.get(`${BASE}/alerts`);
export const fetchStats   = () => axios.get(`${BASE}/stats`);
export const fetchTopIPs  = () => axios.get(`${BASE}/top-ips`);
export const fetchLive    = () => axios.get(`${BASE}/live`);