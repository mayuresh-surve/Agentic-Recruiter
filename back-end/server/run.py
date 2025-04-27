from app import create_app, extensions

app = create_app()
socketio = extensions.socketio

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5001)
