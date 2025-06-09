
# NightfallMUD

A modern, web-based, multiplayer text adventure (MUD) built with a fully type-safe stack. It features a persistent world powered by PostgreSQL and real-time communication via WebSockets.

## About The Project

NightfallMUD is a foundational engine for a classic text-based RPG. This project was built to explore modern web technologies and apply them to a timeless game genre. The backend is built with Node.js and Express, the frontend with React, and the entire codebase is written in TypeScript for robustness and maintainability.

Currently implemented features include:

  * Real-time, multiplayer interaction in a shared world.
  * A persistent world state via a PostgreSQL database.
  * Core gameplay mechanics: room-based movement, looking at surroundings, and seeing other players.
  * Player-to-player communication with a `say` command.
  * A complete item lifecycle: `get`, `drop`, and `inventory` management.

## Built With

This project is built on a modern, fully type-safe technology stack.

**Frontend:**

  * [React](https://reactjs.org/)
  * [Vite](https://vitejs.dev/)
  * [TypeScript](https://www.typescriptlang.org/)

**Backend:**

  * [Node.js](https://nodejs.org/)
  * [Express.js](https://expressjs.com/)
  * [TypeScript](https://www.typescriptlang.org/)
  * [WebSockets (`ws`)](https://www.google.com/search?q=%5Bhttps://github.com/websockets/ws%5D\(https://github.com/websockets/ws\))
  * [Prisma](https://www.prisma.io/) (Next-generation ORM)

**Database:**

  * [PostgreSQL](https://www.postgresql.org/) (Hosted on [Supabase](https://supabase.com/))

**Deployment:**

  * [Render.com](https://render.com/) for hosting the frontend client and backend server.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have Node.js and npm installed on your machine.

  * npm
    ```sh
    npm install npm@latest -g
    ```

### Installation & Configuration

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/YOUR_USERNAME/NightfallMUD.git
    cd NightfallMUD
    ```

2.  **Install Server Dependencies:**

    ```sh
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**

    ```sh
    cd ../client
    npm install
    ```

4.  **Set Up the Database:**

      * This project is configured to use a PostgreSQL database. You can get a free one from [Supabase](https://supabase.com), which is what this project was developed with.
      * Once you have your database, you'll get a **Connection String**.

5.  **Configure Environment Variables:**

      * In the `NightfallMUD/server` directory, create a new file named `.env`.
      * Add your database connection string to this file. **This file should not be committed to Git.**
        ```
        # /server/.env
        DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
        ```
        *(If you are using the Supabase Connection Bouncer, your URL will look something like `postgresql://...pooler.supabase.com:5432/postgres`)*

6.  **Apply the Database Schema:**

      * From the `NightfallMUD/server` directory, run this command to have Prisma build your database tables:
        ```sh
        npx prisma db push
        ```

7.  **Seed the Database with World Data:**

      * To populate your database with the initial set of rooms and items, run the seed command:
        ```sh
        npx prisma db seed
        ```

### Running the Application

You will need to run the backend and frontend in two separate terminals.

1.  **Run the Backend Server:**
      * In a terminal pointed at `NightfallMUD/server`:
        ```sh
        npm run dev
        ```
2.  **Run the Frontend Client:**
      * In a second terminal pointed at `NightfallMUD/client`:
        ```sh
        npm run dev
        ```
      * Your browser should automatically open to the game client.

## Usage

Once the game is running, you can use the following commands in the input box:

  * `look`: See the description of your current room, who is there, and what items are on the ground.
  * `move <direction>`: Move in a valid direction (e.g., `move north`).
  * `say <message>`: Say something to everyone in your current room.
  * `inventory` or `i`: Check the items you are carrying.
  * `get <item>`: Pick up an item from the room.
  * `drop <item>`: Drop an item from your inventory into the room.

## Roadmap

This project is a foundation with many possibilities for expansion. Future features could include:

  * [ ] Player stats and character classes
  * [ ] A robust combat system
  * [ ] NPCs (Non-Player Characters) and mob AI
  * [ ] A questing system
  * [ ] Skills and magic
  * [ ] Game Master (GM) tools for building the world directly in the database

See the [open issues](https://www.google.com/search?q=https://github.com/YOUR_USERNAME/NightfallMUD/issues) for a full list of proposed features (and known issues).

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.