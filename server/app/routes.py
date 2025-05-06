import os,jwt
from flask import Blueprint, request, jsonify
from app.crypto import hash_fingerprint, derive_key, encrypt_data, decrypt_data
from app.db import get_fingerprint_table, insert_fingerprint,get_logs_table
from app.logger import log_action
from fingerprint_utils import preprocess_image, extract_minutiae_features, hash_minutiae
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

    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)
    minutiae = extract_minutiae_features(skeleton)
    fp_hash = hash_minutiae(minutiae)

    table = get_fingerprint_table()
    existing_user = table.get_item(Key={'user_id': username}).get('Item')

    # Check if user exists
    if existing_user:
        # Check if blocked
        if existing_user.get('status') == 'blocked':
            return jsonify({"error": "You are blocked for using a different fingerprint."}), 403

        # Same fingerprint hash → legit user
        if existing_user['fingerprint_hash'] == fp_hash:
            return jsonify({"message": "Welcome back!"}), 200
        else:
            # Block the user immediately
            table.put_item(Item={
                'user_id': username,
                'status': 'blocked'
            })
            table.delete_item(Key={'user_id': username})
            log_action(username, "register", "fail-blocked")
            return jsonify({"error": "Fingerprint mismatch. You are now blocked."}), 409



    # Store the new user
    table.put_item(Item={'user_id': username, 'fingerprint_hash': fp_hash})
    log_action(username, "register", "success")
    return jsonify({"message": "User registered successfully"}), 201










@bp.route('/encrypt', methods=['POST'])
def encrypt():
    user_id = request.form['username']
    fingerprint_file = request.files.get('fingerprint')
    data_file = request.files.get('file')

    if not fingerprint_file or not data_file:
        return jsonify({"error": "Fingerprint and file required"}), 400

    table = get_fingerprint_table()
    user = table.get_item(Key={'user_id': user_id}).get('Item')

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if user is blocked
    if user.get('status') == 'blocked':
        return jsonify({"error": "You are blocked for using a different fingerprint."}), 403

    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)
    minutiae = extract_minutiae_features(skeleton)
    fp_hash = hash_minutiae(minutiae)

    if fp_hash != user['fingerprint_hash']:
        # Mark user as blocked before deletion
        table.put_item(Item={
            'user_id': user_id,
            'status': 'blocked'
        })
        table.delete_item(Key={'user_id': user_id})
        log_action(user_id, "encrypt", "fail-blocked")

        return jsonify({"error": "Fingerprint mismatch. User deleted and blocked."}), 403

    # Proceed with encryption
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
    encrypted_data = request.form['encrypted_data']
    salt = bytes.fromhex(request.form['salt'])
    nonce = bytes.fromhex(request.form['nonce'])
    tag = bytes.fromhex(request.form['tag'])

    if not fingerprint_file or not encrypted_data or not salt or not nonce or not tag:
        return jsonify({"error": "All fields are required"}), 400

    table = get_fingerprint_table()
    user = table.get_item(Key={'user_id': user_id}).get('Item')

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if user is blocked
    if user.get('status') == 'blocked':
        return jsonify({"error": "You are blocked for using a different fingerprint."}), 403

    image_bytes = fingerprint_file.read()
    skeleton = preprocess_image(image_bytes)
    minutiae = extract_minutiae_features(skeleton)
    fp_hash = hash_minutiae(minutiae)

    if fp_hash != user['fingerprint_hash']:
        # Block and delete the user
        table.put_item(Item={
            'user_id': user_id,
            'status': 'blocked'
        })
        table.delete_item(Key={'user_id': user_id})
        log_action(user_id, "decrypt", "fail-blocked")
        return jsonify({"error": "Fingerprint mismatch. User deleted and blocked."}), 403

    key = derive_key(fp_hash, salt)

    from Crypto.Cipher import AES
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)

    try:
        decrypted_data = cipher.decrypt_and_verify(bytes.fromhex(encrypted_data), tag)
        log_action(user_id, "decrypt", "success")
        return jsonify({
            "message": "Decryption successful",
            "decrypted_data": decrypted_data.decode()
        })
    except Exception as e:
        log_action(user_id, "decrypt", "fail-decryption-error")
        return jsonify({"error": "Decryption failed"}), 400


    


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



AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "just-jwt-secret-key")
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



from boto3.dynamodb.conditions import Attr

@bp.route('/delete_user', methods=['POST'])
def delete_user():
    try:
        data = request.get_json()
        username = data.get('username')

        if not username:
            return {'error': 'Username is required'}, 400

        # Delete fingerprint
        fingerprint_table = get_fingerprint_table()
        fingerprint_table.delete_item(Key={'user_id': username})

        # Scan logs table for all items with that username
        logs_table = get_logs_table()
        scan = logs_table.scan(
            FilterExpression=Attr('username').eq(username)
        )

        # Delete logs
        with logs_table.batch_writer() as batch:
            for item in scan.get('Items', []):
                batch.delete_item(Key={
                    'log_id': item['log_id']  # Use actual primary key from your schema
                })

        log_action("admin", "delete_user", "success")
        return {'message': f'User {username} and all logs deleted successfully.'}

    except Exception as e:
        log_action("admin", "delete_user", "fail")
        return {'error': str(e)}, 500
