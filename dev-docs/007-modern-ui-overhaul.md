# Task: Modern UI Overhaul with Chakra UI

**Date:** 2024-06-29
**Author:** NightfallMUD Team (AI-generated)
**Status:** Not Started

---

## 1. Overview

Redesign the NightfallMUD client UI for a modern, polished, and user-friendly experience using Chakra UI. This includes establishing a standard theme, refactoring all panels and buttons, improving tooltips, and adding quality-of-life features and new panels.

## 2. Rationale

- Improve visual appeal and consistency
- Enhance accessibility and responsiveness
- Speed up development with a modern UI library
- Add new features and panels for better gameplay experience
- Address quality-of-life issues (tooltips, panel usability, etc.)

## 3. Architectural Impact

- **Services:** No major backend changes, but some API tweaks may be needed for new features.
- **Data Flow:** No major changes, but UI state may be managed with Chakra's hooks/context.
- **State Management:** Continue using Zustand, but integrate Chakra's theming/context where appropriate.
- **API:** No breaking changes expected.

## 4. Implementation Plan

1. **Setup & Theme**
    - Install Chakra UI and dependencies
    - Define a global theme (colors, fonts, spacing, dark mode)
    - Refactor global CSS to use Chakra's theme
2. **Panel Refactor**
    - Refactor Attributes, Equipped, Inventory, Map, and other panels to use Chakra's Card, Box, Flex, etc.
    - Add icons, headers, and improved layouts
    - Make panels responsive and visually appealing
3. **Button & Input Overhaul**
    - Replace all buttons and inputs with Chakra components
    - Add icons, hover/active effects, and group related actions
4. **Tooltip Improvements**
    - Use Chakra's Tooltip with smart positioning
    - Ensure tooltips never overflow or cover actionable elements
    - Add fade-in/out animation and delay
5. **Quality of Life**
    - Add notifications/toasts for important events
    - Add keyboard shortcuts for common actions
    - Add persistent UI state (localStorage)
    - Improve accessibility (contrast, font size, screen reader support)
6. **New Panels & Features**
    - Quest Log panel with progress and rewards
    - Party panel (if multiplayer)
    - Chat panel (global/local/party)
    - Settings panel (theme, accessibility, sound, etc.)
    - Help/Guide panel
    - Minimap toggle/expand
7. **Advanced UX**
    - Make panels draggable/resizable
    - Allow users to rearrange panels
    - Add user preferences for layout
8. **Testing & Polish**
    - Manual and automated testing
    - User feedback and iteration
    - Update documentation and screenshots

## 5. Key Files to Modify

- `client/package.json` (add Chakra UI)
- `client/src/main.tsx` (ChakraProvider)
- `client/src/theme.ts` (custom theme)
- `client/src/components/*` (all panels, buttons, tooltips, etc.)
- `client/src/stores/useGameStore.ts` (for persistent UI state)
- `client/src/App.css` (remove/reduce custom CSS)
- `dev-docs/server-roadmap.md` (update roadmap)

## 6. Potential Risks & Mitigation

- **Risk:** Chakra UI theming may conflict with existing custom CSS
  - **Mitigation:** Gradually migrate panels, remove old CSS as you go
- **Risk:** Some custom UI/UX may not be directly supported by Chakra
  - **Mitigation:** Use Chakra's `sx` prop or extend components as needed
- **Risk:** Refactor may introduce regressions
  - **Mitigation:** Test each panel after migration, use feature branches

## 7. Testing Strategy

- [ ] Unit Tests for new components
- [ ] Integration Tests for panel interactions
- [ ] Manual Testing Checklist:
    - [ ] All panels render correctly
    - [ ] Tooltips never overflow or cover buttons
    - [ ] Buttons and actions work as expected
    - [ ] Theme and dark mode work everywhere
    - [ ] Accessibility checks (contrast, keyboard nav, screen reader)

## 8. Rollback Plan

- Use git branches for all major refactors
- If issues arise, revert to previous stable branch
- Keep old CSS/components until new ones are fully tested

## 9. Roadmap Update

- Add "Modern UI Overhaul" milestone to `server-roadmap.md`
- Mark each phase as complete as you progress
- Add new features/panels to the roadmap as they are implemented

---

## Notes & Decisions

- **UI Library Chosen:** Chakra UI (with option to add custom CSS or Tailwind for unique elements)
- **Theme:** Dark, moody, with emerald/blue/gold accents
- **Panels to Prioritize:** Inventory, Attributes, Equipped, Map
- **Quality of Life:** Tooltips, notifications, keyboard shortcuts, persistent state
- **New Features:** Quest log, party, chat, settings, help
- **Accessibility:** High priority throughout

---

*This document will be updated as the UI overhaul progresses. See `server-roadmap.md` for milestone tracking.* 