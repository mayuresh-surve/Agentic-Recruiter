# Helix Project

This repository contains two main components:

1. **Backend**: A Flask server running on port **5001**.
2. **Frontend**: A Vite‑powered React application located in `front-end/helix`.

Environment variables are defined in a root-level `.env` file.

---

## Prerequisites

- **Python 3.8+**
- **Node.js 16+** and **npm** (or **yarn**)
- **Git**

---

## Environment Variables

At the root of the project, create a file named `.env` with the following entries:

```ini
# Flask backend
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql+psycopg2://<user>:<password>@<host>/<db_name>     # or your preferred database URL
OPENAI_API_KEY=your-open-ai-key

# Vite front-end
VITE_API_URL=http://localhost:5001  # URL of your Flask API
```

Adjust values as needed for your environment.

---

## Backend Setup (Flask)

1. **Create and activate a virtual environment**:
   ```bash
   cd back-end/server
   python3 -m venv venv
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate    # Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database** (if using Flask‑Migrate or SQLite):
   ```bash
   flask db upgrade   # if using migrations
   # or
   python run.py       # which may create the SQLite file
   ```

4. **Run the server**:
   ```bash
   python run.py
   ```

Your backend API will be available at `http://localhost:5001`.

---

## Frontend Setup (Vite + React)

1. **Install dependencies**:
   ```bash
   cd front-end/helix
   npm install
   # or
   yarn install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open in browser**:
   Visit `http://localhost:5173` (default Vite port).

Your React app will proxy API calls (e.g. `/auth/*`, `/api/*`) to `VITE_API_URL` defined in `.env`.

---

## Available Scripts

### Backend

- **`flask run`**: Launches the Flask server.
- **`python run.py`**: Alternative entrypoint if configured.
- **`flask db migrate`**, **`flask db upgrade`**: Database migration commands (if using Flask‑Migrate).

### Frontend

- **`npm run dev`**: Start Vite dev server.
- **`npm run build`**: Build production assets into `dist/`.
- **`npm preview`**: Preview the production build locally.

---

## Cross‑Origin Resource Sharing (CORS)

If you encounter CORS issues:

- Ensure your Flask app has:
  ```python
  from flask_cors import CORS
  CORS(app, origins=["http://localhost:5173"])
  ```

- Or configure `cors_allowed_origins="*"` in your `SocketIO` initialization.

---
