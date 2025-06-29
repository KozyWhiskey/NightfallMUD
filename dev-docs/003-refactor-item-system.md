# Task: Refactor Item System for Scalable Generation

**Date:** June 28, 2025
**Author:** Gemini CLI
**Status:** Not Started

---

## 1. Overview

Refactor the game's item system to support a scalable, database-driven approach for item generation. This includes enabling random item creation, incorporating affixes, prefixes, and unique attributes, and facilitating the easy addition of new item types and characteristics (e.g., life steal, elemental damage).

## 2. Rationale

The current item generation process relies on static data and is not suitable for dynamic or random item generation. It lacks the flexibility to incorporate advanced item properties like affixes, prefixes, and unique attributes, which are crucial for a richer itemization and loot experience. A new, database-driven system is necessary to support more complex itemization, scalable content creation, and diverse loot drops.

## 3. Architectural Impact

-   **Services:** Introduction of new services for item generation, affix/prefix management, and dynamic item property calculation. Significant modifications to existing services that interact with items, such as `loot.service.ts`, `item-generator.service.ts`, and various game commands.
-   **Data Flow:** Item data will primarily be sourced from a relational database. Item creation will involve querying the database for base item types, available affixes, prefixes, and unique properties, then dynamically combining them to generate a complete item instance.
-   **State Management:** The increased complexity and dynamic nature of item data will require updates to how items are structured, stored, and managed within player inventories, character equipment, and the overall game world state.
-   **API (if applicable):** Potential adjustments to existing API endpoints or the introduction of new ones related to item retrieval, display, and management to accommodate the new item structure.

## 4. Implementation Plan

1.  **Database Schema Design:** Design and implement a new database schema to store base item definitions, affixes, prefixes, and unique item properties. This will likely involve new tables and relationships (e.g., `BaseItems`, `Affixes`, `Prefixes`, `ItemProperties`, `ItemInstances`).
2.  **Data Migration:** Develop scripts or a process to migrate existing static item data into the new database structure. This step is critical for preserving existing game content.
3.  **Core Item Generation Service Development:** Create a new, robust `ItemGenerationService` responsible for:
    *   Retrieving base item data from the database.
    *   Randomly selecting and applying affixes and prefixes based on item rarity, level, and type.
    *   Incorporating unique item attributes.
    *   Constructing a complete item object with all calculated properties.
4.  **Item Property Calculation Logic:** Implement a system to dynamically calculate an item's final statistics and derived properties (e.g., total damage, armor, bonus stats) based on its base type, applied affixes, prefixes, and unique attributes. This should be extensible for new characteristics like "life steal" or "elemental damage."
5.  **Integration with Loot System:** Update `server/src/game/loot.service.ts` to utilize the new `ItemGenerationService` for generating loot drops.
6.  **Client-Side Item Display Updates:** Modify client-side components (e.g., `InventoryPanel.tsx`, `Tooltip.tsx`, `CombatPanel.tsx`) to correctly parse and display the new, more complex item data, including affixes, prefixes, and unique properties.
7.  **Refactor Game Commands:** Update relevant game commands (e.g., `inventory.command.ts`, `equip.command.ts`, `unequip.command.ts`, `drop.command.ts`, `get.command.ts`, `examine.command.ts`) to interact seamlessly with the new item data structure and generation logic.

## 5. Key Files to Modify

-   `server/prisma/schema.prisma` (New tables for items, affixes, prefixes, properties)
-   `server/prisma/seed.ts` (For initial database population with item data)
-   `server/src/data/items.ts` (Likely to be removed or significantly refactored to use database data)
-   `server/src/data/types.ts` (New TypeScript interfaces/types for the new item structure)
-   `server/src/game/item-generator.service.ts` (Significant refactor/rewrite to use database and new generation logic)
-   `server/src/game/loot.service.ts` (Modifications to integrate with the new item generation)
-   `server/src/game/commands/*.command.ts` (Commands that interact with items, e.g., `inventory`, `equip`, `examine`)
-   `client/src/types.ts` (New TypeScript interfaces/types for client-side item representation)
-   `client/src/components/InventoryPanel.tsx` (Updates to display new item properties)
-   `client/src/components/Tooltip.tsx` (Updates to display detailed item information)
-   Potentially new files for specific affix/prefix logic or item property calculations within `server/src/game/`.

## 6. Potential Risks & Mitigation

-   **Risk:** Complexity of database schema design and data migration.
    -   **Mitigation:** Thorough planning of the schema, incremental development, and robust migration scripts with extensive testing to ensure data integrity.
-   **Risk:** Performance impact due to increased database queries for item generation and property calculation.
    -   **Mitigation:** Implement caching mechanisms for frequently accessed item data (e.g., base item definitions, common affixes). Optimize database queries and consider indexing strategies.
-   **Risk:** Backward compatibility issues with existing player inventories and saved game states.
    -   **Mitigation:** Plan for a clear and well-tested migration path for existing player data. This might involve a one-time conversion script or a system that can handle both old and new item formats during a transition period.
-   **Risk:** Difficulty in balancing item properties and ensuring a fair and engaging loot experience.
    -   **Mitigation:** Implement robust configuration for affix/prefix weights and property ranges. Develop tools or scripts for testing item generation distributions.

## 7. Testing Strategy

-   **Unit Tests:** Develop comprehensive unit tests for the new `ItemGenerationService`, affix/prefix application logic, and item property calculation functions to ensure correctness and predictability.
-   **Integration Tests:** Create integration tests to verify the end-to-end flow of item generation, loot drops, inventory management, equipping/unequipping, and how items interact within combat scenarios.
-   **Manual Testing Checklist:**
    -   Verify that new items are generated correctly with appropriate affixes/prefixes.
    -   Test equipping and unequipping various item types.
    -   Confirm that item properties (stats, damage, etc.) are correctly calculated and displayed.
    -   Verify loot drops in different game areas.
    -   Check client-side display of item tooltips and inventory details.

## 8. Rollback Plan

In case of critical failure or unforeseen issues, the rollback plan involves:
1.  Reverting any database schema changes to the previous version.
2.  Restoring the previous item generation logic and related services from version control.
3.  Reverting client-side changes related to item display.
4.  If data migration involved destructive changes, restoring the database from a pre-migration backup.

---

## Notes & Decisions

*A log of any important decisions made during the implementation process.*
