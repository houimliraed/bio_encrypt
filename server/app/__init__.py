from flask import Flask
from flask_cors import CORS  # Import CORS

def create_app():
    app = Flask(__name__)

    # Explicitly enable CORS for all routes from your frontend URL
    CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:3000"}})

    from app.routes import bp
    app.register_blueprint(bp)

    return app
