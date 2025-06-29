
# Task: Decouple Game Loop from Web Server

**Date:** 2025-06-28
**Author:** Gemini
**Status:** Not Started

---

## 1. Overview

This task involves refactoring the server architecture to separate the core game logic (the "game loop," state management, and command processing) from the web server and WebSocket communication layer. The `GameEngine` will be moved into a dedicated, stateful service that runs in its own process, while the Express server will become a stateless gateway for client connections.

## 2. Rationale

Currently, the game logic is tightly coupled with the WebSocket server instance. This design has two primary weaknesses:

1.  **Single Point of Failure:** If the web server crashes, the entire game state is lost, disconnecting all players and resetting all in-progress activities (like combat).
2.  **Scalability Bottleneck:** This architecture cannot be scaled horizontally. Running multiple server instances would create separate, isolated game worlds, preventing interaction between players connected to different instances.

Decoupling the game loop is the foundational step toward a more robust, scalable, and resilient microservices-based architecture.

## 3. Architectural Impact

- **Services:**
    - The existing `server.ts` will be split into two main services:
        1.  **`web.service.ts` (Stateless):** Manages HTTP/WebSocket connections, authenticates users, and forwards commands to the game service.
        2.  **`game.service.ts` (Stateful):** Contains the `GameEngine`, runs the main game tick, processes commands, and manages all in-memory game state.
- **Data Flow:**
    - **Current:** `Client -> WebSocket Server -> GameEngine -> WebSocket Server -> Client`
    - **New:** `Client -> Web Service -> Message Queue -> Game Service -> Message Queue -> Web Service -> Client`
    - We will use a simple in-process event emitter as a stand-in for a formal message queue initially to minimize complexity.
- **State Management:**
    - The `GameEngine` within `game.service.ts` will remain the single source of truth for all in-memory game state (e.g., combat status, non-persistent room state). The `web.service.ts` will no longer hold any game-related state.
- **API (if applicable):**
    - The external WebSocket API will remain the same. The internal communication protocol between the web and game services will be newly defined.

## 4. Implementation Plan

1.  **Create Service Directory:**
    - Create a new directory `server/src/services`.
2.  **Develop a Communication Bridge:**
    - Create a simple, in-memory event emitter (`ipc.emitter.ts`) to act as a communication bridge between the two services. This will allow them to pass messages (commands and events) back and forth within the same Node.js process for now.
3.  **Isolate the Game Service:**
    - Create `game.service.ts` in the new services directory.
    - Move the `GameEngine` class and all its dependencies (command handlers, combat manager, etc.) into this file or a subdirectory.
    - The `GameService` will initialize the `GameEngine` and listen for commands on the IPC emitter. When it processes a command, it will publish the resulting `GameEvent[]` back to the emitter.
4.  **Refactor the Web Service:**
    - Create `web.service.ts` in the new services directory.
    - This service will contain the Express server, WebSocket server, and all authentication logic.
    - Modify the WebSocket `message` handler: instead of calling `game.processCommand()` directly, it will now publish the command to the IPC emitter.
    - It will also subscribe to events from the game service via the emitter and forward them to the appropriate client sockets.
5.  **Create a New Entry Point:**
    - Modify the main `server.ts` to be a simple entry point that imports and starts both the `WebService` and the `GameService`.

## 5. Key Files to Modify

- **Create:**
    - `server/src/services/`
    - `server/src/services/ipc.emitter.ts`
    - `server/src/services/game.service.ts`
    - `server/src/services/web.service.ts`
- **Modify:**
    - `server/src/server.ts` (will become the main entry point)
    - `server/src/game/gameEngine.ts` (will be moved and may require minor adjustments)
- **Delete:**
    - Potentially none, as we are refactoring existing code into new files.

## 6. Potential Risks & Mitigation

- **Risk:** Introducing race conditions or message-ordering issues with the new event-driven communication.
  - **Mitigation:** Design the IPC emitter and event handling to process messages sequentially for each player to maintain order. Start with a simple, single-threaded model before exploring more complex parallel processing.
- **Risk:** Over-complicating the setup for a single-server deployment.
  - **Mitigation:** The initial implementation will use an in-process emitter, keeping the two "services" running within the same Node process. This contains the complexity while still achieving the desired architectural separation, making it easy to swap in a real message queue (like Redis Pub/Sub) later.

## 7. Testing Strategy

- [ ] **Unit Tests:** Update existing tests for command handlers to ensure they work with the new context.
- [ ] **Integration Tests:** Create new tests to verify the end-to-end flow: `WebSocket -> WebService -> IPCEmitter -> GameService -> IPCEmitter -> WebService -> WebSocket`.
- [ ] **Manual Testing Checklist:**
    - [ ] Connect to the server.
    - [ ] Select a character.
    - [ ] Execute all major commands (`look`, `move`, `say`, `get`, `drop`, `attack`, `equip`, `unequip`).
    - [ ] Verify that combat functions correctly.
    - [ ] Verify that messages are broadcast to other players in the same room.
    - [ ] Disconnect and reconnect.

## 8. Rollback Plan

- Revert the changes by checking out the previous commit from Git. The entire change will be developed on a separate branch to ensure `main` remains stable.

---

## Notes & Decisions

*This section will be filled in as the task progresses.*
