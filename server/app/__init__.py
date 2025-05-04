from flask import Flask
from flask_cors import CORS  # Import CORS
def create_app():
    app = Flask(__name__)
    CORS(app)
    CORS(app, resources={r"/register": {"origins": "http://localhost:3000"}})
    from app.routes import bp
    app.register_blueprint(bp)

    return app
