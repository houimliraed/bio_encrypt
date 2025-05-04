from flask import Blueprint, request, jsonify
from app.crypto import hash_fingerprint, derive_key, encrypt_data, decrypt_data
from app.db import get_fingerprint_table, insert_fingerprint,get_admin_table
from app.logger import log_action
from fingerprint_utils import preprocess_image, extract_minutiae_features, hash_minutiae
import os,jwt
import hashlib
import numpy as np
from PIL import Image
import io
from flask import request, jsonify
from app.db import get_logs_table
from app.db import get_logs_table
from datetime import datetime
import cv2
import numpy as np
from PIL import Image
import io
import os
from flask import request, jsonify
from fingerprint_utils import preprocess_image, extract_minutiae_features, hash_minutiae
from app.crypto import derive_key, encrypt_data  # assume you have these functions
from app.logger import log_action  # optional logging function

from fingerprint_utils import preprocess_image, extract_minutiae_features, hash_minutiae
import os
import boto3
from dotenv import load_dotenv
load_dotenv()
bp = Blueprint('api', __name__)

@bp.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    fingerprint_file = request.files.get('fingerprint')

    if not fingerprint_file:
        return jsonify({"error": "Fingerprint required"}), 400

    # Process fingerprint
    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)
    minutiae = extract_minutiae_features(skeleton)
    fp_hash = hash_minutiae(minutiae)

    table = get_fingerprint_table()

    # Check if username already exists
    if table.get_item(Key={'user_id': username}).get('Item'):
        return jsonify({"error": "User or fingerprint already exists"}), 409

    # Scan for duplicate fingerprint hash
    response = table.scan(
        FilterExpression='fingerprint_hash = :hval',
        ExpressionAttributeValues={':hval': fp_hash}
    )
    if response.get('Items'):
        return jsonify({"error": "Fingerprint already exists"}), 409

    # Store the new user
    table.put_item(Item={'user_id': username, 'fingerprint_hash': fp_hash})

    return jsonify({"message": "User registered successfully"})








@bp.route('/encrypt', methods=['POST'])
def encrypt():
    user_id = request.form['username']
    fingerprint_file = request.files.get('fingerprint')
    data_file = request.files.get('file')

    if not fingerprint_file or not data_file:
        return jsonify({"error": "Fingerprint and file required"}), 400

    table = get_fingerprint_table()
    item = table.get_item(Key={'user_id': user_id}).get('Item')
    if not item:
        return jsonify({"error": "User not found"}), 404

    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)
    minutiae = extract_minutiae_features(skeleton)
    fp_hash = hash_minutiae(minutiae)

    if fp_hash != item['fingerprint_hash']:
        log_action(user_id, "encrypt", "fail-blocked")
        return jsonify({"error": "Fingerprint mismatch"}), 403

    file_bytes = data_file.read()
    salt = os.urandom(16)
    key = derive_key(fp_hash, salt)

    from Crypto.Cipher import AES
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(file_bytes)

    log_action(user_id, "encrypt", "success")
    return jsonify({
        "message": "File encrypted successfully",
        "encrypted_data": ciphertext.hex(),
        "salt": salt.hex(),
        "nonce": cipher.nonce.hex(),
        "tag": tag.hex()
    })





@bp.route('/decrypt', methods=['POST'])
def decrypt():
    user_id = request.form['username']
    fingerprint_file = request.files.get('fingerprint')

    encrypted_hex = request.form.get('encrypted_data')
    salt_hex = request.form.get('salt')
    nonce_hex = request.form.get('nonce')
    tag_hex = request.form.get('tag')

    if not fingerprint_file or not encrypted_hex or not salt_hex or not nonce_hex or not tag_hex:
        return jsonify({"error": "All fields are required"}), 400

    table = get_fingerprint_table()
    item = table.get_item(Key={'user_id': user_id}).get('Item')
    if not item:
        return jsonify({"error": "User not found"}), 404

    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)
    minutiae = extract_minutiae_features(skeleton)
    fp_hash = hash_minutiae(minutiae)

    if fp_hash != item['fingerprint_hash']:
        log_action(user_id, "decrypt", "fail-blocked")
        return jsonify({"error": "Fingerprint mismatch"}), 403

    salt = bytes.fromhex(salt_hex)
    key = derive_key(fp_hash, salt)

    encrypted_bytes = bytes.fromhex(encrypted_hex)
    nonce = bytes.fromhex(nonce_hex)
    tag = bytes.fromhex(tag_hex)

    from Crypto.Cipher import AES
    try:
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        decrypted_data = cipher.decrypt_and_verify(encrypted_bytes, tag)
    except Exception as e:
        log_action(user_id, "decrypt", "fail")
        return jsonify({"error": "Decryption failed", "details": str(e)}), 400

    log_action(user_id, "decrypt", "success")
    return jsonify({
        "message": "File decrypted successfully",
        "decrypted_data": decrypted_data.decode('utf-8', errors='ignore')
    })


    


@bp.route('/logs', methods=['GET'])
def get_logs():
    table = get_logs_table()
    response = table.scan()
    logs = response.get('Items', [])

    # Optional filters
    username = request.args.get('username')
    status = request.args.get('status')
    action = request.args.get('action')

    if username:
        logs = [log for log in logs if log.get('username') == username]
    if status:
        logs = [log for log in logs if log.get('status') == status]
    if action:
        logs = [log for log in logs if log.get('action') == action]

    # Sort by timestamp descending
    logs = sorted(logs, key=lambda x: x.get('timestamp', ''), reverse=True)
    return jsonify(logs)


# Load the AWS Secret Key from the .env file
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Secret key for JWT token generation (Can also be stored in .env)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-default-jwt-secret-key")  # Default in case you don't have this in .env

@bp.route('/admin-login', methods=['POST'])
def admin_login():
    # Extract secret key from the request
    provided_secret = request.json.get('secret_key')

    if not provided_secret:
        return jsonify({"error": "Secret key required"}), 400

    # Compare provided secret with the stored AWS secret
    if provided_secret == AWS_SECRET_KEY:
        # Generate JWT token if the secret matches
        try:
            token = jwt.encode({'admin': True}, JWT_SECRET_KEY, algorithm='HS256')
            return jsonify({"message": "Access granted", "token": token}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to generate token: {str(e)}"}), 500
    else:
        return jsonify({"error": "Unauthorized access"}), 403