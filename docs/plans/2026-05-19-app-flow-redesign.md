# room-reader App Flow Redesign Implementation Plan

> **For Hermes:** Use test-driven-development. Implement task-by-task and verify after each behavior.

**Goal:** Convert room-reader from a dashboard-like one-page layout into an actual app flow: choose topic → register audience → enter rehearsal room → finish to final report.

**Architecture:** Keep one Next.js App Router page for hackathon speed, but introduce an explicit `step` state machine: `topic`, `audience`, `room`, `report`. The existing deterministic engine stays unchanged except it receives the currently registered audience. UI sections become screen components shown one at a time instead of all stacked together.

**Tech Stack:** Next.js App Router, React client state, TypeScript, CSS-only visuals, Vitest + React Testing Library.

---

## Product direction

Current problem: page looks like a dashboard with every control visible at once. Desired product: a guided rehearsal app.

Flow:
1. Topic setup screen: headline, topic cards, safety note, continue button.
2. Audience setup screen: registered audience cards, add/remove persona, comedy rubric when relevant, continue into room.
3. Rehearsal room screen: immersive stage, audience agents seated/waiting, mic/textarea, demo seed, start/end rehearsal. The user should feel they “entered a room”.
4. Report screen: clean final report with scores, persona reactions, hardest questions, rewrite, and “Rehearse revised version” returning to room.

Constraints:
- No auth/database requirement.
- No secrets.
- STT fallback remains.
- Safety copy remains visible.
- Comedy rubric remains first-class.
- Keep deterministic mock engine.

---

## Task 1: Add failing screen-flow tests

**Objective:** Tests prove the app no longer exposes every section as a dashboard and requires user progression.

**Files:**
- Modify: `tests/page.test.tsx`

**Test behaviors:**
- Initial render shows topic setup and “Continue to audience setup”.
- Initial render does not show rehearsal textarea or final report.
- Clicking continue shows registered audience setup and “Enter rehearsal room”.
- Clicking enter shows rehearsal room, textarea, and audience agents waiting.
- Running room check shows report screen.

**Command:**
`npm run test -- tests/page.test.tsx`

**Expected RED:** fails because current UI shows all dashboard sections at once.

---

## Task 2: Refactor `app/page.tsx` to a step state machine

**Objective:** Replace dashboard layout with screen-based app flow.

**Files:**
- Modify: `app/page.tsx`

**Implementation details:**
- Add `type AppStep = 'topic' | 'audience' | 'room' | 'report';`
- Add step state: `const [step, setStep] = useState<AppStep>('topic');`
- Topic selection screen should render only topic selector/safety/hero and continue CTA.
- Audience screen should render audience editor, comedy rubric, back/enter room buttons.
- Room screen should render stage + rehearsal input; after Run Room Check set report and step `'report'`.
- Report screen should render final report; “Rehearse revised version” sets transcript, clears report, step `'room'`.
- Topic change should reset registered personas, transcript, report, and keep/return to audience appropriately.

**Command:**
`npm run test -- tests/page.test.tsx`

**Expected GREEN:** page flow tests pass.

---

## Task 3: Make visual style app-like, not dashboard-like

**Objective:** Introduce full-screen app shell, step progress, focused screen panels, immersive room.

**Files:**
- Modify: `app/globals.css`

**Implementation details:**
- Add `.app-shell`, `.topbar`, `.stepper`, `.screen`, `.screen-card`, `.screen-actions`, `.room-screen`, `.room-stage-layout`.
- Use Linear-inspired dark app chrome: near-black background, subtle borders, indigo accent, generous whitespace.
- In room screen, stage dominates; input is a side/control panel, not just another dashboard card.
- Hide irrelevant sections per screen.

**Verification:**
Browser visual check: first screen should look like an app onboarding step, not a dashboard.

---

## Task 4: Full verification

**Commands:**
- `./scripts/verify.sh`
- Browser manual: topic → audience → room → report → rehearse revised.

**Expected:** all checks pass; no console errors.
