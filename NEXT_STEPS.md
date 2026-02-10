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
- [ ] Initialize shadcn/ui if desired for component library
- [ ] Configure path aliases in tsconfig and vite.config
- [ ] Add initial components (Button, Card, Modal)

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

#### 2.4 RNG with Weighted Table (`src/engine/rng/`)
- [x] Implement probability table for yut throws
  ```typescript
  // 도(1): 20%, 개(2): 33%, 걸(3): 27%, 윷(4): 13%, 모(5): 7%
  const YUT_PROBABILITY_TABLE = [
    { result: 'DO', steps: 1, probability: 0.20 },
    { result: 'GAE', steps: 2, probability: 0.33 },
    { result: 'GEOL', steps: 3, probability: 0.27 },
    { result: 'YUT', steps: 4, probability: 0.13 },
    { result: 'MO', steps: 5, probability: 0.07 },
  ];
  ```
- [x] Implement cumulative probability sampling
  - Generate random float [0, 1)
  - Map to cumulative probability ranges
  - Return corresponding result
- [x] Add throw bonus logic (윷/모 → +1 throw)
- [ ] (Future) Add seed-based RNG for reproducibility

#### 2.5 Reward System (`src/engine/rewards/`)
- [x] Calculate reward candidates based on stack size
  - k=1 piece → 3 artifact choices
  - k=2 pieces → 2 artifact choices
  - k=3 pieces → 1 artifact choice
  - k=4 pieces → 1 artifact choice
- [x] Define artifact interface (content TBD)
- [x] Implement artifact selection RNG
- [ ] Hook reward triggers to finish events

---

### Milestone 3: UI Implementation

#### 3.1 Game Layout & Header (`src/components/`)
- [ ] Create main game layout component
- [ ] Implement header with turn counter
- [ ] Add game phase indicator
- [ ] Style with Tailwind

#### 3.2 Throw Phase UI (`src/components/ThrowPhase.tsx`)
- [ ] Display throws remaining counter
- [ ] Implement "Throw" button
  - Call RNG on click
  - Add result to hand
  - Update throws remaining
  - Handle 윷/모 bonus throws
- [ ] Display accumulated hand tokens
  - Show token type (도/개/걸/윷/모)
  - Show visual representation
- [ ] Implement "Start Move" button
  - Enable when throwsRemaining === 0
  - Transition to PLAY phase

#### 3.3 Board Visualization (`src/components/Board.tsx`)
- [ ] Create board layout
  - Visualize outer path (O1-O20)
  - Visualize center (C)
  - Visualize diagonals (A1-A4, B1-B4)
  - HOME area for unspawned pieces
  - FINISHED area for completed pieces
- [ ] Display pieces/stacks on nodes
  - Show stack size
  - Highlight selectable stacks
- [ ] Add visual feedback
  - Hover states
  - Selected state
  - Move preview (optional)

#### 3.4 Play Phase UI (`src/components/PlayPhase.tsx`)
- [ ] Display hand tokens as selectable buttons/chips
- [ ] Implement token selection flow
  1. Player clicks token from hand
  2. System prompts: select stack or HOME
  3. If branch node: prompt branch selection
  4. Execute move and update board
  5. Remove consumed token from hand
- [ ] Implement target selection UI
  - Clickable stacks on board
  - HOME button for spawning
  - Visual feedback for valid targets
- [ ] Implement branch selection modal
  - Show available paths at O5, O10, C
  - Display path options clearly
  - Confirm selection

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
- [ ] Show game summary
  - Final positions (all FINISHED)
  - Artifacts collected
  - Key statistics
- [ ] Add "Copy Summary" button
- [ ] Add "New Game" button

---

### Milestone 4: Testing

#### 4.1 Setup Test Infrastructure
- [ ] Install testing dependencies (vitest, @testing-library/react)
  ```bash
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [ ] Configure vitest in `vite.config.ts`
- [ ] Add test scripts to `package.json`
- [ ] Create test utilities and helpers

#### 4.2 Board Module Tests (`src/engine/board/__tests__/`)
- [ ] Test node connections
- [ ] Test path-finding from each node
- [ ] Test branch detection at O5, O10, C
- [ ] Test path traversal with step counts

#### 4.3 Movement Rules Tests (`src/engine/rules/__tests__/`)
- [ ] Test HOME spawn scenarios
  - HOME + 도(1) → O1
  - HOME + 모(5) → O5
- [ ] Test branch selection scenarios
  - O5 + 도(1) → O6 or A1
  - O10 + 도(1) → O11 or B1
  - C + 도(1) → A3 or B3
- [ ] Test finish scenarios
  - O19 + 도(1) → O20 (not finished)
  - O20 + 도(1) → FINISHED (overshoot)
  - O19 + 개(2) → FINISHED (overshoot)
- [ ] Test stacking scenarios
  - Two stacks landing on same node → merge
  - Merged stack moves together

#### 4.4 RNG Tests (`src/engine/rng/__tests__/`)
- [ ] Test probability distribution (statistical)
- [ ] Test bonus throw logic (윷/모)
- [ ] Test result mapping

#### 4.5 State Machine Tests (`src/engine/state/__tests__/`)
- [ ] Test phase transitions
- [ ] Test game over detection
- [ ] Test turn counter increments
- [ ] Test hand token management

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
- [ ] Seed-based RNG for reproducibility
- [ ] Undo/redo functionality
- [ ] Animation system
- [ ] Sound effects
- [ ] Mobile optimization
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
