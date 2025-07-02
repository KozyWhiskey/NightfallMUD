# NightfallMUD

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-%232D3748.svg?style=for-the-badge&logo=Prisma&logoColor=white)

A modern, web-based, multiplayer text adventure (MUD) built with a fully type-safe stack. It features a persistent world, a class-based character system, round-based tactical combat, and a modern, component-based user interface with interactive elements.

## About The Project

NightfallMUD is a foundational engine for a classic text-based RPG, reimagined with modern web technologies. This project blends the depth of traditional MUDs with the usability and intuitive interface of a modern web application.

The entire codebase is written in TypeScript, with a Node.js backend powering the game logic and a React frontend for the user interface. The project is architected using a scalable Command Pattern on the backend and a global Zustand store on the frontend to make adding new features clean and manageable.

### Core Features Implemented
* **Persistent World:** All account, character, item, and mob data is saved in a PostgreSQL database.
* **Secure Account System:** Full user registration and login flow using password hashing (`bcrypt`) and session management with JSON Web Tokens (JWT).
* **Class-Based Characters:** Players create characters by choosing from one of six distinct classes, each with unique starting stats.
* **Strategic, Round-Based Combat:** Combat resolves in 3-second "ticks," where players and mobs queue actions. This includes automatic aggression from hostile mobs.
* **Player-Driven Progression:** A full leveling-up system where players gain XP and manually assign attribute points.
* **Functional Equipment System:** A complete inventory and equipment system. Players can `equip` and `unequip` items, which directly modify their effective stats in combat.
* **Modern Interactive UI:**
    * A three-column layout with tabbed side panels for organized information display.
    * Panels for `Vitals`, `Attributes`, `Equipped` items, `Backpack`, and a static `Map`.
    * Players can interact via both classic text commands and clickable UI elements.
    * "Hover-for-stats" tooltips on inventory and equipped items.
    * **Chakra UI v3-based design system with a global, dark/gloomy NightfallMUD theme.**
    * **MapPanel with pulse/glow effects and "Gloom" color palette.**
    * **All UI and new features must follow the enforced theme and design tokens.**

## Built With

* **Frontend:** React, Vite, TypeScript, Zustand, Chakra UI v3
* **Backend:** Node.js, Express.js, TypeScript, `ws` (WebSockets)
* **Database:** PostgreSQL with Prisma (Next-generation ORM)
* **Authentication:** `bcrypt` (password hashing), `jsonwebtoken` (JWTs)
* **Deployment:** Render.com (Client/Server), Supabase (Database)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have Node.js and npm installed on your machine.

### Installation & Configuration

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/KozyWhiskey/NightfallMUD.git](https://github.com/KozyWhiskey/NightfallMUD.git)
    cd NightfallMUD
    ```
2.  **Install Server & Client Dependencies:**
    ```sh
    cd server && npm install
    cd ../client && npm install
    cd .. 
    ```
3.  **Set Up the Database:**
    * This project uses a PostgreSQL database. You can get a free one from a service like [Supabase](https://supabase.com).
    * From your Supabase project's database settings, get the **Connection Bouncer** URI string.

4.  **Configure Environment Variables:**
    * In the `NightfallMUD/server` directory, create a new file named `.env`.
    * Add your database connection string and a secret key for signing JWTs. **This file must not be committed to Git.**

    ```env
    # /server/.env
    DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
    JWT_SECRET="REPLACE_THIS_WITH_A_VERY_LONG_RANDOM_SECRET_STRING"
    ```

5.  **Apply the Database Schema:**
    * From the `NightfallMUD/server` directory, run this command to have Prisma build your database tables:
        ```sh
        npx prisma db push
        ```

6.  **Seed the Database with World Data:**
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

## Roadmap

The project is now a robust platform. Future features will focus on expanding content and deepening game mechanics. See the full **[Development Roadmap](https://github.com/KozyWhiskey/NightfallMUD/blob/main/ROADMAP.md)** for more details.
* **Mob Loot Drops:** Implement the designed loot table system.
* **Player Death & Respawn:** Create a meaningful consequence for reaching 0 HP.
* **Magic & Skill System:** Implement class-specific abilities.
* **Quest System:** Build out the "Quests" tab with NPCs, objectives, and rewards.
* **UI/UX:** All new UI and features must follow the global NightfallMUD theme and design system (see [client/src/theme.ts](client/src/theme.ts)).
