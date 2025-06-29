
# Task: Refactor Item System for Dynamic, Database-Driven Generation

**Date:** 2025-06-28
**Author:** Gemini
**Status:** Not Started

---

## 1. Overview

This task will fundamentally refactor the item system to eliminate the flawed on-the-fly creation of `ItemTemplate`s. The new architecture will treat randomly generated items as ephemeral instances whose properties (name, description, stats) are derived from a combination of database-defined `BaseItemType` and `Affix` records, rather than being stored permanently in a template. This makes the system truly database-driven, scalable, and eliminates the unique name constraint violation.

## 2. Rationale

The current item generation system attempts to save every unique permutation of a randomly generated item as a new, permanent `ItemTemplate` in the database. This has proven to be a critical flaw for two reasons:

1.  **Stability:** It causes server crashes due to unique name constraint violations when the same random item is generated twice.
2.  **Scalability:** It bloats the `ItemTemplate` table with thousands of single-use records, which is inefficient and unmanageable.

The proposed refactor moves the source of truth for item properties from the `ItemTemplate` to the `Item` instance itself, which will store the rolled attributes and a reference to its base components. This is a standard and robust pattern for ARPG-style loot systems.

## 3. Architectural Impact

- **Database Schema (`schema.prisma`):**
    - The `Item` model will be significantly changed. It will no longer have a direct relation to `ItemTemplate` for randomly generated items. Instead, it will store:
        - A reference to its `BaseItemType`.
        - The generated name, description, and rarity.
        - A JSON blob (`attributes`) containing the final, rolled stats from its affixes.
    - The `ItemTemplate` model will be repurposed for **static, hand-crafted items only** (e.g., quest rewards, specific named drops).
- **Services:**
    - **`ItemGenerationService`:** Will be heavily modified. It will no longer return data for an `ItemTemplate`. Instead, it will return the complete data needed to create a new `Item` instance directly.
    - **`LootService`:** Will be simplified. It will call the `ItemGenerationService` and use the returned data to create a record in the `Item` table directly, bypassing the `ItemTemplate` table entirely for random loot.
- **Data Flow:**
    - **Current:** `MobDefeat -> LootService -> ItemGenerationService -> Create ItemTemplate -> Create Item`
    - **New:** `MobDefeat -> LootService -> ItemGenerationService -> Create Item`

## 4. Implementation Plan

1.  **Update Database Schema (`schema.prisma`):**
    - Add the following fields to the `Item` model:
        - `name: String`
        - `description: String`
        - `baseItemTypeId: Int?` (nullable, for random items)
        - `baseItemType: BaseItemType? @relation(...)`
        - `attributes: Json @default("{}")`
    - Make the `itemTemplateId` and `template` fields nullable, as they will only be used for static items.
2.  **Refactor `ItemGenerationService`:**
    - Modify the `generateRandomItem` method to return a complete `Prisma.ItemCreateInput` object, including the generated name, description, rarity, attributes, and the `baseItemTypeId`.
3.  **Refactor `LootService`:**
    - Update the `generateAndPlaceLoot` method. When a random item is generated, it will now directly call `prisma.item.create` with the data returned from the `ItemGenerationService`.
    - The old logic for finding or creating an `ItemTemplate` will be completely removed.
4.  **Update `GameEngine` and `Command` Context:**
    - The `CharacterWithRelations` type and any code that relies on `item.template` will need to be updated to handle cases where `template` is null. The item's properties (name, description, attributes) will now be read directly from the `Item` object itself.
5.  **Run Prisma Migration:**
    - Generate and apply a new Prisma migration to update the database schema.

## 5. Key Files to Modify

- `server/prisma/schema.prisma`
- `server/src/game/item-generator.service.ts`
- `server/src/game/loot.service.ts`
- `server/src/game/gameEngine.ts`
- `server/src/game/commands/command.interface.ts`
- Any command file that interacts with item properties (e.g., `examine.command.ts`, `inventory.command.ts`).

## 6. Potential Risks & Mitigation

- **Risk:** Breaking existing game logic that assumes every item has a template.
  - **Mitigation:** Carefully audit all code that accesses `item.template` and add logic to fall back to the properties on the `item` object itself. The `examine` and `inventory` commands are the most likely to be affected.
- **Risk:** Data migration issues with existing items in the database.
  - **Mitigation:** The schema changes are additive (new nullable fields), which should not cause data loss. A script could be written to backfill the new fields for existing items if needed, but for a development environment, a database reset (`prisma db push --force-reset`) is faster.

## 7. Testing Strategy

- [ ] **Unit Tests:** Update tests for `ItemGenerationService` and `LootService`.
- [ ] **Integration Tests:** Verify the end-to-end loot drop process.
- [ ] **Manual Testing Checklist:**
    - [ ] Kill a mob that drops random loot.
    - [ ] Verify the item appears in the room.
    - [ ] Pick up the item (`get`).
    - [ ] Check the item in your inventory (`i`).
    - [ ] Examine the item (`examine`).
    - [ ] Equip the item (`equip`).
    - [ ] Verify that stats are correctly applied.
    - [ ] Kill another mob of the same type and repeat the process to ensure no crashes.

## 8. Rollback Plan

- Revert the changes by checking out the previous commit from Git. The entire change will be developed on a separate branch.

---

## Notes & Decisions

*This section will be filled in as the task progresses.*
