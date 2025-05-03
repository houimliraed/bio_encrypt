import sys
import os
from flask import Flask
from aws.dynamodb import insert_fingerprint, get_fingerprint
from dotenv import load_dotenv
from routes.fingerprint_routes import fingerprint_bp


load_dotenv()
app = Flask(__name__)
app.register_blueprint(fingerprint_bp)

if __name__ == "__main__":
    app.run(debug=True)