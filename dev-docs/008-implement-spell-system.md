# Task: Implement Spell System

**Date:** 2024-06-29
**Author:** [Your Name]
**Status:** Not Started

---

## 1. Overview

Implement a data-driven spell system for NightfallMUD, enabling characters to cast spells with various effects, casting times, and acquisition methods. The system will support class and universal spells, integrate with the combat round loop, and allow for easy expansion and balancing via a master spell database.

## 2. Rationale

A robust spell system is essential for class diversity, combat depth, and player progression. A data-driven approach allows for rapid iteration, balancing, and content creation without code changes, supporting both class-specific and universal spells.

## 3. Architectural Impact

- **Services:**
  - New spell service for managing spell definitions, casting logic, and effect resolution.
  - Integration with combat manager and character progression systems.
- **Data Flow:**
  - Spells defined in a master database (JSON or TypeScript object).
  - Spell casting requests flow from player input to spell service, then to combat manager for resolution.
- **State Management:**
  - Player state updated to track casting/channeling/interrupted status.
  - Cooldowns and ongoing effects managed per character.
- **API (if applicable):**
  - Endpoints for learning spells, casting spells, and retrieving spellbook data (if exposed to client).

## 4. Implementation Plan

1.  **Define Spell & Effect Data Structures**
2.  **Create Master Spell Database**
3.  **Implement Spell Service (backend)**
4.  **Integrate Spell Casting with Combat Loop**
5.  **Handle Spell Interruption & Channeling**
6.  **Implement Spell Acquisition (Class/Universal)**
7.  **Expose Spellbook to Client (optional)**
8.  **Add Example Spells for Each Class**
9.  **Testing & Balancing**

## 5. Key Files to Modify

- `server/src/game/spell.service.ts` (new)
- `server/src/game/combat.manager.ts`
- `server/src/game/class.data.ts`
- `server/src/game/progression.service.ts`
- `server/src/data/spells.ts` (new)
- `server/src/data/types.ts` (extend for spell/effect types)
- `client/src/components/SpellbookPanel.tsx` (optional, new)
- `client/src/stores/useGameStore.ts` (if exposing spellbook)

## 6. Potential Risks & Mitigation

- **Risk:** Spell interruption logic may introduce bugs in combat flow.
  - **Mitigation:** Write unit/integration tests for casting and interruption scenarios.
- **Risk:** Data-driven approach may lead to malformed spell definitions.
  - **Mitigation:** Validate spell data on load and provide clear error messages.
- **Risk:** Balancing spells may be time-consuming.
  - **Mitigation:** Start with a small set of spells and iterate based on playtesting.

## 7. Testing Strategy

- [ ] Unit Tests for spell service and combat integration
- [ ] Integration Tests for casting, interruption, and channeling
- [ ] Manual Testing Checklist:
  - [ ] Cast instant, standard, and channeled spells
  - [ ] Interrupt spells via damage
  - [ ] Learn spells via class progression and items
  - [ ] Verify cooldowns and mana costs

## 8. Rollback Plan

- Revert changes to combat manager, character state, and remove spell service and data files.
- Restore previous combat and ability systems if needed.

## 9. Roadmap Update

- After completion, update `server-roadmap.md` to reflect the addition of the spell system and any new milestones for spell expansion.

---

## Notes & Decisions

- Spell interruption formula: (d100 + Resolve) >= (Damage Taken + 20)
- Spells are defined in a master database for easy expansion.
- Both class and universal spells are supported, with different acquisition methods.
- Example spells provided for each class as initial content. 