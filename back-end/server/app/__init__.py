from flask import Flask # type: ignore
from .config import DevConfig, ProdConfig, TestConfig
from .extensions import db, migrate, socketio, cors
from .api.auth import auth_bp
from . import sockets
from flask import session as flask_session # type: ignore


def create_app(config_name=None):
    app = Flask(__name__, static_folder=None)
    cfg = {
        "development": DevConfig,
        "production":  ProdConfig,
        "testing":     TestConfig
    }.get(config_name, DevConfig)
    app.config.from_object(cfg)

    # initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    cors.init_app(app)

    app.register_blueprint(auth_bp)

    return app
