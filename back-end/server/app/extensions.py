from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate 
from flask_socketio import SocketIO 
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins=["http://localhost:5173"])
cors = CORS(origins=["http://localhost:5173"],
            supports_credentials=True)
