from pymongo import MongoClient
from datetime import datetime
import json

client = MongoClient('mongodb://localhost:27017/')
db = client['network_analyzer']

def get_network_context(question):
    context_parts = []

    # Get recent alerts
    alerts = list(db['alerts'].find(
        {}, {'_id': 0}
    ).sort('created_at', -1).limit(20))
    
    if alerts:
        context_parts.append(f"Recent alerts ({len(alerts)} total):")
        for a in alerts[:5]:
            context_parts.append(
                f"- {a.get('type')} from {a.get('src_ip')} "
                f"severity {a.get('severity')} at {a.get('timestamp')}"
            )

    # Get protocol stats
    pipeline = [
        {'$group': {'_id': '$protocol', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
    ]
    stats = list(db['packets'].aggregate(pipeline))
    if stats:
        context_parts.append("\nProtocol distribution:")
        for s in stats:
            context_parts.append(f"- {s['_id']}: {s['count']} packets")

    # Get top IPs
    pipeline2 = [
        {'$group': {'_id': '$src_ip', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 5}
    ]
    top_ips = list(db['packets'].aggregate(pipeline2))
    if top_ips:
        context_parts.append("\nTop active IPs:")
        for ip in top_ips:
            context_parts.append(f"- {ip['_id']}: {ip['count']} packets")

    # Get total counts
    total_packets = db['packets'].count_documents({})
    total_alerts  = db['alerts'].count_documents({})
    context_parts.append(f"\nTotal packets captured: {total_packets}")
    context_parts.append(f"Total alerts fired: {total_alerts}")

    return "\n".join(context_parts)

def answer_question(question):
    context = get_network_context(question)
    
    prompt = f"""You are a cybersecurity analyst assistant.
You have access to real-time network monitoring data.

Current network data:
{context}

User question: {question}

Answer based on the network data provided above.
Be specific with IP addresses, counts, and timestamps.
If data is not available say so clearly."""

    return prompt, context