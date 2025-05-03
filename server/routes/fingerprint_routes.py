from flask import Blueprint,request,jsonify,hashlib
from aws.dynamodb import insert_fingerprint,get_fingerprint
from datetime import datetime


fingerprint_bp = Blueprint('fingerprint', __name__)

@fingerprint_bp.route("/add_fingerprint",methods=["POST"])
def add_fingerprint():
    fingerprint_data = request.get_json()
    user_id = fingerprint_data.get('user_id')
    fingerprint = fingerprint_data.get('fingerprint_id')

    if not user_id or not fingerprint:
        return(jsonify({'message':"error ! something is missing"}),400)    
    else:
        timestamp = datetime.now().isoformat()
        hashed_fingerprint = hashlib.sha256(fingerprint.encode()).hexadigest()
        insert_fingerprint(user_id,hashed_fingerprint,timestamp)
        return(jsonify({'message':"finger print stored successfuly ! "}),201)



@fingerprint_bp.route("/get_fingerprint/<user_id>",methods=["GET"])
def retrive_fingerprint(user_id):
    response = get_fingerprint(user_id)
    item = response.get('Item')
    if not item:
        return jsonify({'message': 'Fingerprint not found'}), 404
    return jsonify(item), 200