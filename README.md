
# NightfallMUD

A modern, web-based, multiplayer text adventure (MUD) built with a fully type-safe stack. It features a persistent, account-based world, a real-time combat system, and a component-based UI with interactive elements.

## About The Project

NightfallMUD is a foundational engine for a classic text-based RPG, reimagined with modern web technologies. This project blends the depth of traditional MUDs with the usability and intuitive interface of a modern web application.

The entire codebase is written in TypeScript, with a Node.js backend powering the game logic and a React frontend for the user interface.

### Core Features Implemented

  * **Persistent World:** All character, item, and mob data is saved in a PostgreSQL database, so progress is never lost.
  * **Secure Account System:** Full user registration and login flow using password hashing (`bcrypt`) and session management with JSON Web Tokens (JWT).
  * **Account vs. Character Separation:** A proper architecture where a single user `Account` can have multiple game `Character`s.
  * **Real-time Multiplayer:** Uses WebSockets for instant communication and updates between players.
  * **Component-Based UI:** The frontend is broken into logical React components for stats, inventory, and game messages.
  * **Interactive UI:** Move between rooms, get items, and manage inventory with clickable buttons in addition to text commands.
  * **Core RPG Stat System:** Characters have a full set of D\&D-style attributes (Strength, Dexterity, HP, etc.) that are used in gameplay.
  * **Combat System:** A complete, turn-based combat loop. Players can `attack` mobs, damage is calculated based on stats, mobs retaliate, and rewards (XP/gold) are granted upon victory.

## Built With

  * **Frontend:** React, Vite, TypeScript, WebSockets API
  * **Backend:** Node.js, Express.js, TypeScript, `ws` (WebSockets)
  * **Database:** PostgreSQL with Prisma (Next-generation ORM)
  * **Authentication:** `bcrypt` (password hashing), `jsonwebtoken` (JWTs)
  * **Deployment:** Render.com (Client/Server), Supabase (Database)

## Getting Started

To get a local copy up and running, follow these steps.

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

      * This project uses a PostgreSQL database. You can get a free one from a service like [Supabase](https://supabase.com).
      * Once created, you will need your database **Connection String**.

5.  **Configure Environment Variables:**

      * In the `NightfallMUD/server` directory, create a new file named `.env`.
      * Add your database connection string and a secret key for signing JWTs. **This file must not be committed to Git.**

    <!-- end list -->

    ```env
    # /server/.env

    # Your full PostgreSQL connection string from your database provider
    DATABASE_URL="postgresql://user:password@host:port/database"

    # A long, random, secret string for signing tokens
    JWT_SECRET="REPLACE_THIS_WITH_A_VERY_LONG_RANDOM_SECRET_STRING"
    ```

6.  **Apply the Database Schema:**

      * From the `NightfallMUD/server` directory, run this command to have Prisma build your database tables:
        ```sh
        npx prisma db push
        ```

7.  **Seed the Database with World Data:**

      * To populate your database with the initial set of rooms, items, and mobs, run the seed command:
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
      * Your browser should automatically open to the game client, where you can register a new account.

## Usage

Once in the game, you can use text commands or their clickable UI equivalents.

  * `look`: See the description of your current room.
  * `move <direction>`: Move in an available direction.
  * `say <message>`: Speak to other players in the room.
  * `inventory` or `i`: Check the items you are carrying.
  * `get <item>`: Pick up an item from the room.
  * `drop <item>`: Drop an item from your inventory.
  * `examine <item>`: Look at an item in your inventory or in the room.
  * `attack <target>`: Attack a mob in the room.

## Roadmap

This project is a solid foundation. The next steps are focused on deepening the gameplay systems.

  * [ ] **Leveling Up System:** Allow characters to level up and improve their stats when they gain enough XP.
  * [ ] **Clickable Combat:** Make mob names in the UI clickable to initiate an attack.
  * [ ] **Mob Loot Drops:** Allow mobs to drop items upon defeat.
  * [ ] **Skills & Magic:** Implement a system for characters to learn and use unique abilities.
  * [ ] **Equipment System:** Allow players to `equip` items from their inventory to boost their stats.
  * [ ] **Quests:** An NPC and questing system to give players goals.
  * [ ] **World Building:** Add more rooms, items, mobs, and secrets to the world.

See the [open issues](https://www.google.com/search?q=https://github.com/YOUR_USERNAME/NightfallMUD/issues) for a full list of proposed features.