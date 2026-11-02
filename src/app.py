
"""
This module takes care of starting the API Server,
Loading the DB and Adding the endpoints.
"""

import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

static_file_dir = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    "../dist/"
)

app = Flask(__name__)
app.url_map.strict_slashes = False

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
allowed_origins = [
    "https://pluxis.onrender.com",
    "https://crispy-engine-97v5w95xv5vgfp9v6-3000.app.github.dev",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS",
            ],
            "allow_headers": [
                "Content-Type",
                "Authorization",
            ],
            "supports_credentials": False,
            "max_age": 600,
        }
    },
)

# ---------------------------------------------------------
# DATABASE
# ---------------------------------------------------------

db_url = os.getenv("DATABASE_URL")

if db_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace(
        "postgres://",
        "postgresql://",
    )
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ---------------------------------------------------------
# JWT
# ---------------------------------------------------------

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "dev-pluxis-secret",
)

jwt = JWTManager(app)

# ---------------------------------------------------------
# DATABASE / MIGRATIONS
# ---------------------------------------------------------

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# ---------------------------------------------------------
# ADMIN / COMMANDS
# ---------------------------------------------------------

setup_admin(app)
setup_commands(app)

# ---------------------------------------------------------
# API BLUEPRINT
# ---------------------------------------------------------

app.register_blueprint(api, url_prefix="/api")

# ---------------------------------------------------------
# ERROR HANDLER
# ---------------------------------------------------------

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# ---------------------------------------------------------
# FRONTEND
# ---------------------------------------------------------

@app.route("/")
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)

    return send_from_directory(static_file_dir, "index.html")


@app.route("/<path:path>", methods=["GET"])
def serve_any_other_file(path):
    requested_path = os.path.join(static_file_dir, path)

    if not os.path.isfile(requested_path):
        path = "index.html"

    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=True,
    )
