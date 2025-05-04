from app.db import get_logs_table
from datetime import datetime

def log_action(username, action, status):
    table = get_logs_table()
    table.put_item(Item={
        "log_id": f"{username}_{datetime.utcnow().isoformat()}",
        "username": username,
        "action": action,
        "status": status,
        "timestamp": datetime.utcnow().isoformat()
    })
