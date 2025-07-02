# Nightfall MUD: Server Development Roadmap

This document outlines the major features, tasks, and milestones for the development of the Nightfall MUD server. It is intended to be a living document, updated as the project progresses.

## I. Completed Features

- [x] **Core Technical Architecture:** The foundational server infrastructure is in place.
- [x] **Database and Persistence:** Player data, character information, and world state are saved and loaded correctly.
- [x] **Account and Character System:** Players can create accounts and manage their characters.
- [x] **Class and Progression System:** The core class and level-up systems are functional.
- [x] **Core Gameplay and Combat:** Basic combat mechanics and gameplay loops are implemented.
- [x] **Modern UI Overhaul:** Chakra UI v3, global dark/gloomy theme, and a new map panel are fully implemented. The design system and theme tokens are enforced globally. All new UI/features must follow the NightfallMUD mood and palette.

## II. Immediate Roadmap

### 1. UI Refactoring

- [x] **Task:** Redesign the user interface to be more modern and intuitive (Chakra UI v3, dark/gloomy theme, global design system).
- [x] **Task:** Implement a responsive design that works on both desktop and mobile devices.
- [x] **Task:** Create a more visually appealing and immersive theme (NightfallMUD theme, enforced globally).

### 2. Quest System

- [ ] **Task:** Design and implement a robust questing system.
- [ ] **Task:** Create a variety of quest types, including kill quests, fetch quests, and escort quests.
- [ ] **Task:** Develop a system for tracking quest progress and rewards.

### 3. Map Fixes

- [ ] **Task:** Identify and fix any bugs or inconsistencies in the game map.
- [x] **Task:** Improve the map's visual representation and clarity (new MapPanel, gloomy palette, pulse/glow effects).
- [ ] **Task:** Add new areas and points of interest to the map.

### 4. Player Death & Respawn

- [x] **Task:** Implement a player death and respawn system.
- [x] **Task:** Determine the consequences of death, such as experience loss or item drops.
- [x] **Task:** Create a designated respawn area or system.

## III. Future Development

### 1. Gameplay Expansion

- [ ] **Attribute Impact Expansion:** Expand the impact of player attributes on gameplay.
- [ ] **Status Effects:** Implement a system for status effects, such as poison, stun, and haste.
- [ ] **Magic & Skill System:** Design and implement a comprehensive magic and skill system.

### 2. World & Content

- [ ] **World Content:** Add more content to the game world, including new zones, dungeons, and cities.
- [ ] **Social System:** Implement social features, such as guilds, parties, and chat channels.

### 3. Long-Term Goals

- [ ] **Player Housing:** Allow players to own and customize their own homes.
- [ ] **Crafting System:** Implement a system for crafting items and equipment.
- [ ] **Player-Driven Economy:** Create a dynamic and player-driven economy.
- [ ] **End-Game Content:** Develop challenging end-game content, such as raids and world bosses.

## Milestones

- [x] **Modern UI Overhaul with Chakra UI** ([dev-docs/007-modern-ui-overhaul.md](007-modern-ui-overhaul.md))
    - [x] Setup & Theme (global NightfallMUD theme, enforced)
    - [x] Panel Refactor (Attributes, Equipped, Inventory, Map, etc.)
    - [x] Button & Input Overhaul
    - [x] Tooltip Improvements
    - [x] Quality of Life (notifications, shortcuts, persistent state)
    - [x] New Panels & Features (Quest Log, Party, Chat, Settings, Help)
    - [x] Advanced UX (draggable/resizable panels, user preferences)
    - [x] Testing & Polish
    - [x] MapPanel: Modern, gloomy, pulse/glow effects, theme tokens