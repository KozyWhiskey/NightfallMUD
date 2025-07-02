# Task: Implement Player Death and Respawn System

**Date:** 2025-06-29
**Author:** Gemini
**Status:** Not Started

---

## 1. Overview

This task involves implementing a comprehensive player death and respawn system. The goal is to create a system that is fair, engaging, and fits within the overall design of the game.

## 2. Rationale

The current game loop lacks a critical component: a consequence for player death. This system will add a new layer of challenge and risk to the game, making it more engaging and rewarding.

## 3. Architectural Impact

- **Services:**
    - A new `DeathService` will be created to handle all aspects of player death and respawn.
    - The `CombatManager` will be modified to call the `DeathService` when a player's HP reaches zero.
- **Data Flow:**
    - When a player dies, the `DeathService` will be called with the player's data.
    - The `DeathService` will then process the death, including calculating experience loss, handling item drops, and respawning the player.
- **State Management:**
    - A new `isDead` state will be added to the player's data.
    - The `DeathService` will be responsible for setting and clearing this state.
- **API (if applicable):**
    - No new API endpoints will be required for this task.

## 4. Implementation Plan

1.  **Create `DeathService`:**
    - Create a new `DeathService` in `server/src/game/services/death.service.ts`.
    - This service will contain the following methods:
        - `handlePlayerDeath(player: Player)`: This method will be called when a player dies. It will handle experience loss, item drops, and respawning.
        - `calculateExperienceLoss(player: Player): number`: This method will calculate the amount of experience a player loses upon death.
        - `handleItemDrops(player: Player): void`: This method will handle the dropping of items from the player's inventory.
        - `respawnPlayer(player: Player): void`: This method will respawn the player at a designated location.
2.  **Modify `CombatManager`:**
    - Modify the `CombatManager` in `server/src/game/combat.manager.ts` to call the `DeathService` when a player's HP reaches zero.
3.  **Create Respawn Location:**
    - Create a designated respawn location in the game world.
    - This will likely involve adding a new room to the `haven` zone in `server/src/data/zones/haven.ts`.

## 5. Key Files to Modify

- `server/src/game/services/death.service.ts` (new file)
- `server/src/game/combat.manager.ts`
- `server/src/data/zones/haven.ts`

## 6. Potential Risks & Mitigation

- **Risk:** The death penalty may be too harsh or too lenient.
    - **Mitigation:** The death penalty will be configurable and can be adjusted based on player feedback.
- **Risk:** The respawn location may be too far from the player's death location.
    - **Mitigation:** The respawn location will be placed in a central and easily accessible location.

## 7. Testing Strategy

- [x] **Unit Tests:**
    - Create unit tests for the `DeathService` to ensure that it is working correctly.
- [ ] **Integration Tests:**
    - Create integration tests to ensure that the `DeathService` is correctly integrated with the `CombatManager`.
- [x] **Manual Testing Checklist:**
    - Manually test the death and respawn system to ensure that it is working as expected.

## 8. Rollback Plan

In case of failure, the changes will be reverted by deleting the `DeathService`, reverting the changes to the `CombatManager`, and removing the respawn location.

---

## Notes & Decisions

- **Experience Loss:** Players will lose 10% of their current level's experience upon death.
- **Item Drops:** Players will not drop any items upon death.
- **Respawn Location:** Players will respawn at the starting location in the `haven` zone.
