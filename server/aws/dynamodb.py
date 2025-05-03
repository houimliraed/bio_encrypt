import os
import boto3
from dotenv import load_dotenv

load_dotenv()

dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

table = dynamodb.Table('Fingerprints')

def insert_fingerprint(user_id, fingerprint_hash, timestamp):
    response = table.put_item(
        Item={
            'user_id': user_id,
            'fingerprint_hash': fingerprint_hash,
            'timestamp': timestamp
        }
    )
    return response

def get_fingerprint(user_id):
    return table.get_item(Key={'user_id': user_id})
