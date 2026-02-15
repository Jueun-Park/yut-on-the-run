# yut-on-the-run MVP Development Roadmap

This document outlines the implementation plan for completing the MVP of yut-on-the-run, a single-player Korean traditional Yut game variant. The roadmap is organized into actionable milestones that build upon the existing GitHub Pages deployment infrastructure.

## Status

- ✅ GitHub Pages deployment workflow configured
- ✅ Vite base path set to `/yut-on-the-run/`
- ✅ Basic React + TypeScript + Vite template established

## Development Milestones

### Milestone 1: Infrastructure Setup

#### 1.1 Verify Deployment
- [x] Confirm GitHub Pages deployment is working
- [x] Test Vite base path configuration (`/yut-on-the-run/`)
- [x] Verify asset loading on deployed site
> pnpm version is pinned to 10.29.2 in `package.json` and the deployment workflow to unblock the Pages build.

#### 1.2 Setup Tailwind CSS
- [x] Install Tailwind CSS dependencies
  ```bash
  pnpm add -D tailwindcss postcss autoprefixer @tailwindcss/postcss
  ```
- [x] Configure `tailwind.config.js` with content paths
- [x] Add Tailwind directives to `src/index.css`
- [x] Test Tailwind classes in App.tsx

#### 1.3 (Optional) Setup shadcn/ui
- [x] Initialize shadcn/ui if desired for component library
- [x] Configure path aliases in tsconfig and vite.config
- [x] Add initial components (Button, Dialog, Switch, Label)
- [x] Implement Settings UI with theme toggle (Light/Dark/System)
- [x] Configure stone-themed design system with dark mode support

---

### Milestone 2: Core Game Engine

#### 2.1 Board Graph Module (`src/engine/board/`)
- [x] Define node types and interfaces
  - `BoardNode` type (O0-O20, C, A1-A4, B1-B4)
  - Node states and connections
- [x] Implement board graph structure
  - Outer path (O0-O20)
  - Center node (C)
  - Diagonal A (O5 → A1 → A2 → C → A3 → A4 → O15)
  - Diagonal B (O10 → B1 → B2 → C → B3 → B4 → O20)
- [x] Implement path-finding logic
  - Get next nodes from current position
  - Handle branching nodes (O5, O10, C)
  - Calculate step movement along paths
- [x] Export board graph utilities
- [x] Implement special node system
  - [x] Add node metadata for special node types (NORMAL, STICK, REFRESH)
  - [x] Implement special-node placement utility (exclude branch nodes O5, O10, C)
  - [x] Implement REFRESH utility to re-randomize special node locations

#### 2.2 Movement Rules Module (`src/engine/rules/`)
- [x] Implement move validation
  - Check valid moves from current position
  - Handle HOME spawning (O0 → O1+)
  - Branch selection at O5, O10, C
- [x] Implement move simulation
  - Calculate final position after N steps
  - Handle overshoot completion (O20+ → FINISHED)
  - Track path taken during move
- [x] Implement stacking rules
  - Auto-merge when landing on occupied node
  - No split moves for stacks
- [x] Implement finish detection
  - Detect when piece reaches FINISHED state
  - Handle overshoot rule (O20 + 1 step → FINISHED)

#### 2.3 Turn State Machine (`src/engine/state/`)
- [x] Define game state types
  - `GamePhase` enum: THROW, PLAY, REWARD, GAME_OVER
  - `PieceState`: HOME, ON_BOARD, FINISHED
  - `Stack` type with piece IDs
  - `HandToken` type (도/개/걸/윷/모)
- [x] Implement turn state
  - Current turn number
  - Phase tracking
  - Hand tokens array
  - Throws remaining counter
- [x] Implement state transitions
  - THROW → PLAY transition
  - PLAY → REWARD (on finish)
  - REWARD → PLAY (continue turn)
  - PLAY → THROW (new turn)
  - Any → GAME_OVER (4 pieces finished)
- [x] Add state validation and error handling
- [x] Implement stick inventory system
  - [x] Add 4 fixed stick slots to game state
  - [x] Track stick properties (Front/Back probabilities, effects)
- [x] Implement node event system
  - [x] Add pending event/choice state for STICK node offers
  - [x] Add STICK offer modal state (keep/replace or discard decision)
  - [x] Implement post-move node-event handling
  - [x] Add REFRESH event trigger and special node re-randomization

#### 2.4 RNG with 4-Stick Sampling (`src/engine/rng/`)
- [x] Implement 4-stick throw model
  - [x] Define stick interface (Front/Back probabilities, effects)
  - [x] Implement simultaneous 4-stick sampling
  - [x] Calculate backCount (number of Back results, 0..4)
  - [x] Map backCount to outcome:
    - backCount=1 → DO (1 step)
    - backCount=2 → GAE (2 steps)
    - backCount=3 → GEOL (3 steps)
    - backCount=4 → YUT (4 steps)
    - backCount=0 → MO (5 steps)
- [x] Add throw bonus logic (YUT/MO → +1 throw)
- [ ] Add seed-based RNG for reproducibility
  - [x] Accept seed input (string, max 10 characters)
  - [x] Normalize seed with `trim()` function
  - [x] Generate random seed if trimmed seed is empty
  - [x] Store and display seed for sharing
  - [ ] Ensure same seed + same choices = same game outcome (deterministic RNG integration pending)

#### 2.5 Reward System (`src/engine/rewards/`)
- [x] Calculate reward candidates based on stack size
  - k=1 piece → 3 artifact choices
  - k=2 pieces → 2 artifact choices
  - k=3 pieces → 1 artifact choice
  - k=4 pieces → 1 artifact choice
- [x] Define artifact interface (content TBD)
- [x] Implement artifact selection RNG
- [ ] Hook reward triggers to finish events
- [ ] Confirm artifacts awarded only on FINISH (not on special nodes)

---

### Milestone 3: UI Implementation

#### 3.1 Game Layout & Header (`src/components/`)
- [x] Create main game layout component
  - Mobile-first vertical layout
  - Sticky header (top)
  - Square board area (center)
  - Sticky action tray (bottom)
  - Desktop: same layout with side margins
- [x] Implement header with turn counter
- [x] Add game phase indicator
- [x] Style with Tailwind

#### 3.1.5 Settings UI (`src/components/Settings.tsx`)
- [x] Add Settings gear button (⚙️) in header
- [x] Implement Settings modal/panel
  - [x] Theme selection (Light/Dark/System)
  - [x] Theme persistence with localStorage
  - [ ] Seed input field (max 10 characters)
  - [ ] Input validation and character limit
  - [ ] "Play New Game with Seed" button
- [x] Implement seed handling
  - [x] Normalize seed with `trim()` on submission
  - [x] Generate random seed if trimmed seed is empty
  - [x] Display generated seed to user
  - [x] Store seed in game state for sharing
- [x] Style with Tailwind/shadcn/ui

#### 3.2 Throw Phase UI (`src/components/ThrowPhase.tsx`)
- [x] Display throws remaining counter (scaffolded in GameLayout)
- [x] Implement "Throw" button
  - Call RNG on click
  - Add result to hand
  - Update throws remaining
  - Handle 윷/모 bonus throws
- [x] Display accumulated hand tokens (scaffolded in GameLayout)
  - Show token type (도/개/걸/윷/모)
  - Show visual representation
- [x] Implement "Start Move" button (scaffolded in GameLayout)
  - Enable when throwsRemaining === 0
  - Transition to PLAY phase

#### 3.2.5 Throw Button "손맛" (Haptics UX)
- [x] Add haptics utility wrapper (no toggle)
  - [x] Use Web Vibration API (`navigator.vibrate`) when supported
  - [x] Silently no-op when API unavailable
  - [x] No user-facing vibration toggle setting
- [x] Implement Throw button rolling state machine with pointer events
  - [x] On pointer down: enter rolling state
  - [x] Minimum rolling duration: 0.5s
    - [x] If released before 0.5s, keep rolling and commit at 0.5s
  - [x] Maximum rolling duration: 3.0s
    - [x] Auto-commit at 3.0s even without release
  - [x] If released after 0.5s but before 3.0s, commit immediately on release
  - [x] Handle pointer up/cancel/leave events to trigger commit respecting min/max timers
- [x] Implement haptics timing
  - [x] Tick vibration every 500ms during rolling (suggested 5–10ms)
  - [x] Confirmation vibration once on commit (suggested 30–50ms)
  - [x] If tick and commit coincide, commit vibration takes priority; stop tick timer on commit
- [x] Ensure RNG consumed exactly once per committed throw
  - [x] Rolling visuals must NOT consume RNG
  - [x] RNG consumption occurs only at commit time

#### 3.3 Board Visualization (`src/components/Board.tsx`)
- [x] Create SVG board with traditional Yut board layout
  - Fixed coordinate layout

#### 3.4 Game State Management (`src/hooks/useGameState.tsx`, `src/engine/state/`)
- [x] Implement centralized state management with useReducer + Context
  - [x] Define `GameAction` union type with minimal actions
  - [x] Implement `gameReducer` for state transitions
  - [x] Create `GameStateProvider` component
  - [x] Provide `useGameState()` and `useGameDispatch()` hooks
- [x] Add seed normalization utilities
  - [x] `normalizeSeed()` function with trim and random generation
  - [x] `generateRandomSeed()` function (max 10 characters)
  - [x] Unit tests for seed utilities
- [x] Update GameState type
  - [x] Add `seed: string` field
  - [x] Add UI selection fields (`selectedNodeId`, `selectedTokenIndex`)
- [x] Implement minimal actions
  - [x] `NEW_GAME` (accept and normalize seed)
  - [x] `SET_PHASE`
  - [x] `INCREMENT_TURN` / `END_TURN`
  - [x] `SET_SELECTED_NODE` / `SET_SELECTED_TOKEN`
  - [x] `ADD_HAND_TOKEN` / `REMOVE_HAND_TOKEN`
  - [x] `SET_THROWS_REMAINING` / `DECREMENT_THROWS_REMAINING`
  - [x] `THROW_YUT` (RNG result consumption, bonus throws)
  - [x] `EXECUTE_MOVE` (move execution, auto-merge, auto turn advance, game over)
- [x] Update components to use reducer state
  - [x] Header displays turn and seed
  - [x] Action tray reads phase, throwsRemaining, hand from state
  - [x] Board dispatches SET_SELECTED_NODE on click
- [x] Write comprehensive unit tests for reducer
- [x] Maintain backward compatibility with existing tests

#### 3.5 Play Phase UI (`src/components/PlayPhase.tsx`)
  - O1 positioned at **bottom-right**
  - Outer path numbering **counter-clockwise** from O1 to O20
  - Emphasized (large) nodes: **O5, O10, O15, O20, C**
  - Draw connection lines from engine graph edges only (BOARD_GRAPH from -> to)
  - Do NOT draw decorative lines that are not edges
- [x] Implement node rendering
  - Each node has invisible circular touch target of at least 44px
  - Special nodes indicated by **icon + color** (ready for implementation)
  - Valid actions highlighted/enabled only (Constraint UI)
- [x] Implement coordinate system (BoardCoordinates.ts)
  - Normalized viewBox (0-1000) for responsive scaling
  - Proper positioning with O1 at bottom-right
  - Counter-clockwise numbering
  - Diagonal angles computed from outer ring positions
- [x] Add visual feedback
  - Hover states (via hit circles)
  - Selected state (blue highlight)
  - Movement preview: highlight **destination node only** (yellow/green highlight)
- [x] Implement GameStateProvider with phase management
  - Phase-driven UI scaffolding (THROW, PLAY, REWARD, GAME_OVER)
  - Selection state management for board interactions
  - Action callbacks for node clicks
- [x] Implement HOME area
  - Outside board UI (may not be rendered as board node)
  - Display count of unspawned pieces
- [x] Implement FINISHED area
  - Inside board at **bottom internal area**
  - Horizontal row of **4 slots**
  - Slots fill to represent count only (no piece identification)
- [x] Display pieces/stacks on nodes
  - Single piece: draw circular pawn smaller than node
  - Stacked (2+): show numeric badge 2/3/4 on pawn
  - Identical appearance for all pieces (no per-piece ID or color)
  - Highlight selectable stacks

#### 3.6 Play Phase UI (`src/components/PlayPhase.tsx`)
- [x] Display hand tokens as selectable buttons/chips
- [x] Implement immediate move execution flow (no confirm button)
  1. Player clicks token from hand
  2. System prompts: select stack or HOME
  3. Highlight enabled target nodes (Constraint UI)
  4. If branch node: highlight two candidate next nodes on board
  5. Player selects destination node
  6. **Immediate move execution** (no confirm button)
  7. Remove consumed token from hand
- [x] Implement target selection UI
  - Clickable stacks on board (only valid targets)
  - HOME button for spawning (when applicable)
  - Visual feedback for valid targets
- [ ] Implement on-board branch selection (no modal)
  - When branching required, highlight two candidate next nodes
  - Player taps one to select
  - Selection executes immediately
- [ ] Handle special node landings
  - **STICK landing**: mandatory modal blocks other input
  - **REFRESH landing**: toast notification

#### 3.5 Reward Modal (`src/components/RewardModal.tsx`)
- [ ] Create modal overlay
- [ ] Display N artifact candidates
- [ ] Implement selection UI
  - Show artifact descriptions
  - Allow one selection
  - Confirm and close
- [ ] Return to PLAY phase after selection

#### 3.6 Game Over Screen (`src/components/GameOver.tsx`)
- [ ] Display completion message
- [ ] Show total turn count
- [ ] Show game seed used
- [ ] Show game summary
  - Final positions (all FINISHED)
  - Artifacts collected
  - Final stick inventory (all 4 slots)
  - Key statistics
- [ ] Implement Copy Short button
  - [ ] Format: Single-line text with game name/mode, seed, and turn count
  - [ ] Example template: `윷판 달리기 클리어! Seed: abc123, 턴: 42`
  - [ ] Copy to clipboard using Clipboard API
  - [ ] Show success feedback on successful copy
- [ ] Implement Copy Long button
  - [ ] Format: Multi-line text with seed, turns, artifacts list, and sticks list
  - [ ] Example template:
    ```
    윷판 달리기 클리어!
    Seed: abc123
    턴: 42
    유물: 신속의 부적, 행운의 말발굽, 중앙 지름길
    윷가락: 기본 윷가락, 기본 윷가락, 행운 윷가락, 기본 윷가락
    ```
  - [ ] Copy to clipboard using Clipboard API
  - [ ] Show success feedback on successful copy
- [ ] Implement clipboard failure fallback
  - [ ] Detect Clipboard API failure or unavailability
  - [ ] Show text in selectable textarea
  - [ ] Display manual copy instruction: "텍스트를 선택하여 수동으로 복사하세요"
- [ ] Add "New Game" button

---

### Milestone 4: Testing

#### 4.1 Setup Test Infrastructure
- [x] Install testing dependencies (vitest, @testing-library/react)
  ```bash
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [x] Configure vitest in `vite.config.ts`
- [x] Add test scripts to `package.json`
- [x] Create test utilities and helpers
- [x] Setup PR check GitHub Actions workflow

#### 4.2 Board Module Tests (`src/engine/board/__tests__/`)
- [x] Test node connections
- [x] Test path-finding from each node
- [x] Test branch detection at O5, O10, C
- [x] Test path traversal with step counts
- [x] Test special node placement
  - [x] Verify branch nodes (O5, O10, C) excluded from special nodes
  - [x] Test REFRESH re-randomization utility
  - [x] Verify special nodes can move (NORMAL ↔ STICK/REFRESH)

#### 4.3 Movement Rules Tests (`src/engine/rules/__tests__/`)
- [x] Test HOME spawn scenarios
  - HOME + 도(1) → O1
  - HOME + 모(5) → O5
- [x] Test branch selection scenarios
  - O5 + 도(1) → O6 or A1
  - O10 + 도(1) → O11 or B1
  - C + 도(1) → A3 or B3
- [x] Test finish scenarios
  - O19 + 도(1) → O20 (not finished)
  - O20 + 도(1) → FINISHED (overshoot)
  - O19 + 개(2) → FINISHED (overshoot)
- [x] Test stacking scenarios
  - Two stacks landing on same node → merge
  - Merged stack moves together

#### 4.4 RNG Tests (`src/engine/rng/__tests__/`)
- [x] Test 4-stick sampling
  - [x] Test backCount calculation (0..4)
  - [x] Test backCount → outcome mapping (0→MO, 1→DO, 2→GAE, 3→GEOL, 4→YUT)
  - [x] Verify each stick samples independently
- [x] Test bonus throw logic (YUT/MO → +1 throw)

#### 4.5 State Machine Tests (`src/engine/state/__tests__/`)
- [x] Test phase transitions
- [x] Test game over detection
- [x] Test turn counter increments
- [x] Test hand token management
- [x] Test stick inventory management
  - [x] Verify 4 fixed slots
  - [x] Test stick replacement on STICK node
  - [x] Test discard option (no inventory change)
- [x] Test node event triggers
  - [x] STICK node: landing triggers offer
  - [x] REFRESH node: landing triggers re-randomization
  - [x] Verify "passing through" does NOT trigger
  - [x] Verify pieces already standing do NOT trigger after REFRESH

#### 4.6 Rewards Module Tests (`src/engine/rewards/__tests__/`)
- [x] Test reward choice calculation based on stack size
- [x] Test artifact candidate generation
- [ ] Verify artifacts only awarded on FINISH (not on special nodes)

---

### Milestone 5: Integration & Polish

#### 5.1 End-to-End Game Flow
- [ ] Test complete game playthrough
- [ ] Verify all phase transitions
- [ ] Ensure UI updates correctly
- [ ] Fix any integration bugs

#### 5.2 Error Handling
- [ ] Add input validation
- [ ] Handle edge cases gracefully
- [ ] Add user-friendly error messages
- [ ] Prevent invalid moves

#### 5.3 Documentation
- [ ] Update README with game instructions
- [ ] Add code documentation (JSDoc)
- [ ] Document game rules in UI
- [ ] Add inline help/tooltips

#### 5.4 Build & Deploy
- [ ] Test production build locally
- [ ] Verify GitHub Pages deployment
- [ ] Test on different browsers
- [ ] Verify asset paths work correctly

---

## Implementation Order

**Recommended sequence:**

1. **Week 1**: Infrastructure (M1) + Board Module (M2.1)
2. **Week 2**: Core Rules (M2.2, M2.3) + RNG (M2.4)
3. **Week 3**: UI Layout & Throw Phase (M3.1, M3.2, M3.3)
4. **Week 4**: Play Phase & Rewards (M3.4, M3.5, M3.6)
5. **Week 5**: Testing (M4)
6. **Week 6**: Integration & Polish (M5)

## Future Enhancements (Post-MVP)

- [ ] Special yut sticks (deck-building mechanic)
- [ ] Diverse artifact effects
- [ ] Undo/redo functionality
- [ ] Animation system
- [ ] Sound effects
- [ ] Pinch-zoom support (revisit after playtesting)
- [ ] Advanced mobile optimization
- [ ] Analytics/statistics tracking
- [ ] Leaderboard system
- [ ] Tutorial mode

---

## Getting Started

To begin development:

1. Verify the current setup:
   ```bash
   pnpm install
   pnpm run dev
   pnpm run build
   ```

2. Start with Milestone 1.2 (Tailwind setup)

3. Create the engine module structure:
   ```bash
   mkdir -p src/engine/{board,rules,state,rng,rewards}
   mkdir -p src/components
   ```

4. Follow the milestones in order, testing as you go

---

## Notes

- Keep changes minimal and focused
- Test each module independently before integration
- Follow existing code style (check `eslint.config.js`)
- Refer to `mvp-spec.md` for detailed game rules
- Use TypeScript strictly for type safety
