from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["Network_Analyzer"]


def get_network_context(question):
    context_parts = []

    # ---------- Total Counts ----------
    total_packets = db["packets"].count_documents({})
    total_alerts = db["alerts"].count_documents({})

    context_parts.append(f"Total packets: {total_packets}")
    context_parts.append(f"Total alerts: {total_alerts}")

    # ---------- Top Active IPs ----------
    pipeline = [
        {"$group": {"_id": "$src_ip", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]

    top_ips = list(db["packets"].aggregate(pipeline))

    print("TOP IPS:", top_ips)

    if top_ips:
        context_parts.append("\nTop Active IPs:")

        for ip in top_ips:
            context_parts.append(
                f"{ip['_id']} : {ip['count']} packets"
            )

    # ---------- Protocol Distribution ----------
    pipeline = [
    {'$group': {'_id': '$proto', 'count': {'$sum': 1}}},
    {'$sort': {'count': -1}}
]

    protocols = list(db["packets"].aggregate(pipeline))

    if protocols:
        context_parts.append("\nProtocol Distribution:")

        for p in protocols:
            context_parts.append(
                f"{p['_id']} : {p['count']} packets"
            )

    # ---------- Recent Alerts ----------
    alerts = list(
        db["alerts"]
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(5)
    )

    if alerts:
        context_parts.append("\nRecent Alerts:")

        for a in alerts:
            context_parts.append(
                f"{a.get('type')} from {a.get('src_ip')} "
                f"Severity:{a.get('severity')}"
            )

    return "\n".join(context_parts)


def answer_question(question):

    context = get_network_context(question)

    print("\n========== CONTEXT ==========")
    print(context)
    print("=============================\n")

    prompt = f"""
You are Network AI, a cybersecurity assistant for a Network IDS Dashboard.

The information below comes directly from the database.

IMPORTANT RULES

1. Never ignore the provided data.
2. Never say there are no active IPs if Top Active IPs are listed.
3. Never say there are zero packets if Total packets is greater than zero.
4. Never invent information.
5. If the answer exists in the context, answer using it exactly.
6. Be short and clear.

NETWORK DATA

{context}

USER QUESTION

{question}

ANSWER:
"""

    return prompt, context