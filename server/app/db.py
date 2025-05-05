import os
import boto3
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# 🔐 Initialize DynamoDB client securely
dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

# Tables
FINGERPRINT_TABLE_NAME = "Fingerprints"
LOGS_TABLE_NAME = "BiocryptoLogs"
ADMIN_TABLE_NAME = "admins"
# Get Table References
def get_fingerprint_table():
    return dynamodb.Table(FINGERPRINT_TABLE_NAME)
def get_logs_table():
    return dynamodb.Table(LOGS_TABLE_NAME)


#Insert Fingerprint Record
def insert_fingerprint(user_id, fingerprint_hash, timestamp):
    try:
        table = get_fingerprint_table()
        response = table.put_item(
            Item={
                'user_id': user_id,
                'fingerprint_hash': fingerprint_hash,
                'timestamp': timestamp
            }
        )
        return response
    except Exception as e:
        print(f"Error inserting fingerprint: {e}")
        return {"error": str(e)}

def get_fingerprint(user_id):
    try:
        table = get_fingerprint_table()
        response = table.get_item(Key={'user_id': user_id})
        return response.get('Item', None)  # Return None if no item found
    except Exception as e:
        print(f"Error retrieving fingerprint: {e}")
        return {"error": str(e)}

def log_action(username, action, status, reason=None):
    try:
        table = get_logs_table()
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'username': username,
            'action': action,
            'status': status
        }
        if reason:
            log_entry['reason'] = reason

        response = table.put_item(Item=log_entry)
        return response
    except Exception as e:
        print(f"Error logging action: {e}")
        return {"error": str(e)}
