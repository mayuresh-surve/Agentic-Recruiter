"""
Package that registers all Socket.IO event handlers.
Importing this module will ensure each handler submodule is loaded.
"""

# Ensure the Socket.IO extension is initialized
from ..extensions import socketio

# Import each handler module so their decorators execute
from . import connect
from . import conversations
from . import messages
from . import sequences
