# Rune - Your Agentic Recruitment Assistant
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Rune is a Agentic Recruiter designed to assist recruiters throughout the recruitment lifecycle. It leverages the power of OpenAI to help with tasks like creating compelling job descriptions, strategizing candidate outreach, and managing recruitment plans.

## Features

* **Agentic Assistance:** Get AI-powered help for various recruitment tasks.
* **Job Description Generation:** Create effective job descriptions tailored to your needs.
* **Candidate Outreach Strategy:** Develop plans for reaching out to potential candidates.
* **Recruitment Plan Management:** Generate, update, and manage recruitment process plans.
* **User Authentication:** Secure access to your recruitment workspace.
* **Multiple Chat Sessions:** Manage different roles or recruitment drives with separate chat sessions for each user.

## Screenshots (Example Section)

Here are some glimpses of Rune in action:

**Main Chat Interface:**
![Rune Chat Interface](images/rune-chat-interface.png)
![Rune Chat Thinking](images/rune-generating-response.png)

**Plan Generation Example:**
![Rune Plan Generation](images/rune-plan-generated.png)

**Rune MVP:**
![Rune MVP](images/rune-working-prototype.gif)

## Tech Stack

### Frontend
* **Framework:** React (with ViteJS)
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Plain HTML
* **Microservice:** Dockerized

### Backend
* **Framework:** Flask
* **Real-time Communication:** Flask-SocketIO
* **Language:** Python
* **Microservice:** Dockerized

### Database
* **Type:** PostgreSQL (User-managed Docker container)

### APIs
* **AI:** OpenAI API (for query answering, plan generation, etc.)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Docker:** [Download & Install Docker](https://www.docker.com/get-started)
* **Docker Compose:** (Usually included with Docker Desktop)
* **Git:** (For cloning the repository)

## Getting Started

Follow these steps to get Rune up and running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/mayuresh-surve/Agentic-Recruiter.git
    ```

2.  **Set up and Run PostgreSQL Database:**
    Rune requires a PostgreSQL database. You'll need to run your own PostgreSQL container.

    * **Choose your database credentials:** Decide on a username, password, and database name. You will use these in the next step and when configuring the `DATABASE_URL`.
    * **Run the PostgreSQL container:** Open your terminal and run the following command, replacing `your_db_user`, `your_db_password`, and `your_db_name` with your chosen values:

        ```bash
        docker run -d \
          --name renu-postgres \
          -e POSTGRES_USER=your_db_user \
          -e POSTGRES_PASSWORD=your_db_password \
          -e POSTGRES_DB=your_db_name \
          -p 5432:5432 \
          postgres:15-alpine
        ```
        * `-d`: Runs the container in detached mode.
        * `--name renu-postgres`: Assigns a name to the container for easier management.
        * `-e POSTGRES_USER=...`: Sets the PostgreSQL superuser.
        * `-e POSTGRES_PASSWORD=...`: Sets the password for the superuser.
        * `-e POSTGRES_DB=...`: Creates a database with this name, owned by the user.
        * `-p 5432:5432`: Maps port 5432 on your host to port 5432 in the container.
        * `postgres:15-alpine`: Specifies the Docker image to use.

    * **To stop the container:** `docker stop renu-postgres`
    * **To start the container again:** `docker start renu-postgres`
    * **To view logs:** `docker logs renu-postgres`
    * **To remove the container (data will be lost unless you set up persistent volumes):** `docker rm renu-postgres`

3.  **Set up Environment Variables for Rune Application:**
    The Rune application (specifically the backend) needs to connect to the PostgreSQL database you just started and also requires an OpenAI API key.

    Create a `.env` file in the root directory of the cloned project (or as specified by your `docker-compose.yml` for service-specific environments). Add the following variables:

    ```env
    # For the Backend Service
    OPENAI_API_KEY=your_openai_api_key_here

    # --- Database Connection ---
    # Use the same user, password, and database name you chose when starting the Postgres container.
    # If your Rune backend (Docker Compose service) and Postgres container are running on the same Docker host:
    # - For Docker Desktop (Windows/Mac), use 'host.docker.internal' as the host.
    # - For Linux, 'localhost' or '127.0.0.1' might work if the backend container uses the host network,
    #   or use 'host.docker.internal' if available, or the host's IP address on the Docker bridge network (e.g., 172.17.0.1).
    #   'host.docker.internal' is generally the most reliable for connecting from a container to a service on the host.
    DATABASE_URL=postgresql://your_db_user:your_db_password@host.docker.internal:5432/your_db_name

    # Example using 'renu_pg_user', 'securepassword123', 'renudb':
    # DATABASE_URL=postgresql://renu_pg_user:securepassword123@host.docker.internal:5432/renudb

    # Add any other environment variables required by your frontend or backend
    # e.g., FLASK_APP=your_app.py, FLASK_DEBUG=True, etc. for the backend
    # e.g., VITE_API_BASE_URL=http://localhost:5001 for the frontend
    ```
    **Important:**
    * Replace `your_openai_api_key_here` with your actual OpenAI API key.
    * Replace `your_db_user`, `your_db_password`, and `your_db_name` in the `DATABASE_URL` with the exact same values you used when starting the `renu-postgres` container.
    * The hostname in `DATABASE_URL` (`host.docker.internal`) is crucial for allowing the Dockerized backend service to connect to the PostgreSQL container running on your host machine. If you encounter issues, you might need to adjust this based on your specific Docker networking setup (especially on Linux).

4.  **Build and Start the Rune Application Services with Docker Compose:**
    From the root directory of the project (where your `docker-compose.yml` file is located), run:
    ```bash
    docker-compose up --build
    ```
    The `--build` flag will ensure the Docker images for Rune's frontend and backend are built. You can omit it for subsequent runs if no code changes require a rebuild. To run in detached mode, use `docker-compose up -d --build`.

## Running the Application

Once the PostgreSQL container is running and the Rune Docker Compose services are up:

* **Frontend (Rune Chat UI):** Open your web browser and navigate to `http://localhost:5173`
* **Backend API:** The backend service will be running at `http://localhost:5001` (This is typically consumed by the frontend).

## Environment Variables

The following environment variables are used by the application:

* `OPENAI_API_KEY`: **Required.** Your API key for accessing OpenAI services.
* `DATABASE_URL`: **Required.** The connection string for the PostgreSQL database.
    * Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`
    * Ensure `USER`, `PASSWORD`, and `DATABASE_NAME` match your PostgreSQL setup.
    * `HOST` should typically be `host.docker.internal` to connect from the backend container to the Postgres container running on your Docker host.
    * `PORT` is usually `5432`.

## Troubleshooting

* **Database Connection Issues:**
    * Ensure your `renu-postgres` container is running (`docker ps`).
    * Double-check that the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in your `DATABASE_URL` environment variable exactly match those used when starting the `renu-postgres` container.
    * Verify the hostname and port in `DATABASE_URL`. `host.docker.internal:5432` is common for Docker Desktop. On Linux, if `host.docker.internal` doesn't work, try the IP address of your `docker0` bridge (often `172.17.0.1`) or ensure your Docker Compose services and the standalone Postgres container are on a shared custom Docker network.
    * Check the logs of your backend service (`docker-compose logs <backend-service-name>`) and the `renu-postgres` container (`docker logs renu-postgres`) for specific error messages.


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
