from pymongo import MongoClient
import datetime

client=MongoClient('mongodb://localhost:27017/')
db=client['Network_Analyzer']
packets_collection=db['packets']
alerts_collection=db['alerts']

def init_db():
    print("MongoDB connected. Database ready.")

def save_packet(timestamp,src_ip,dest_ip,proto,port,size):
    try:
        packets_collection.insert_one(
            {
                'timestamp':timestamp,
                'src_ip':src_ip,
                'dest_ip':dest_ip,
                'proto':proto,
                'port':port,
                'size':size,
                'created_at': datetime.datetime.now()
            }
        )
    except Exception as e:
        print("MongoDB Error:", e)



def save_alert(time_stamp,alert_type,src_ip,severity,description):
    alerts_collection.insert_one(
        {
            'timestamp': time_stamp,
            'type': alert_type,
            'src_ip': src_ip,
            'severity': severity,
            'description': description,
            'created_at': datetime.datetime.now()
        }
    )


def get_all_alerts():
    alerts = list(alerts_collection.find(
        {}, {'_id': 0}
    ).sort('created_at', -1))
    return alerts



def get_top_ips():
    pipeline=[
        {'$group': {'_id': '$src_ip', 'count' : { '$sum': 1}}},
        {'$sort' : {'count' : -1}},
        {'$limit': 5}
    ]
    results=list(packets_collection.aggregate(pipeline))
    return [(r['_id'],r['count']) for r in results]

def get_recent_packets(limit=100):
    packets=list(packets_collection.find({},{'_id': 0}).sort('created_at', -1).limit(limit))  
    # find( filter,projection )  filter means based on condition show like 'protocol':'HTTPS'
    # projection means which show which now show if "0" not shown if "1" it shown
    return packets

def get_protocol_status():
    pipeline=[
        {'$group': {'_id':'$proto', 'count' : {'$sum':1}}},
        {'$sort' : {'count' : -1}}
    ]
    return list(packets_collection.aggregate(pipeline))

