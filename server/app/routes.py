from flask import Blueprint, request, jsonify
from app.crypto import hash_fingerprint, derive_key, encrypt_data, decrypt_data
from app.db import get_fingerprint_table, insert_fingerprint
from app.logger import log_action
from fingerprint_utils import preprocess_image, extract_minutiae_features, hash_minutiae
import os
import hashlib
import numpy as np
from PIL import Image
import io
from flask import request, jsonify
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



bp = Blueprint('api', __name__)

@bp.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    fingerprint_file = request.files.get('fingerprint')

    if not fingerprint_file:
        return jsonify({"error": "Fingerprint required"}), 400

    # Process fingerprint to extract minutiae
    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)  # Same preprocessing function as encrypt
    minutiae = extract_minutiae_features(skeleton)

    # Generate a hash for the minutiae features
    fp_hash = hash_minutiae(minutiae)

    # Store the fingerprint hash in the database
    table = get_fingerprint_table()
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
        log_action(user_id, "encrypt", "fail")
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
        log_action(user_id, "decrypt", "fail")
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
