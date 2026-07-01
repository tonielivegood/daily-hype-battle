# Project Roadmap: Daily Hype Battle

This roadmap outlines the phased development of the Daily Hype Battle Reddit application from its current MVP skeleton to a fully-featured, community-driven interactive game.

---

## 📍 Current Phase: Future / Post-Submission (Active)

---

## 🗺️ Phases

### 🎯 Phase 1: Hype Board Allocation Lock (Completed)
*   [x] Set up two-view architecture: inline Feed splash & expanded Modal game board.
*   [x] Establish 100-point stepper distribution mechanism on the frontend.
*   [x] Write server-side locks validator and persist user selections to Redis.
*   [x] Create Moderator action to spawn battle posts.
*   [x] Enforce safety disclosures and avoid banned financial terms.

### 🎯 Phase 2: Results & Demo Settlement (Completed)
*   [x] Create server endpoint to aggregate locked allocations for a specific post.
*   [x] Calculate community-wide vote distribution percentages.
*   [x] Implement "Settle Demo Round" and persistence (saves to `hype:results:${postId}`).
*   [x] Show Results screen with winning meme, score breakdown, and player performance score.
*   [x] Explain the Crowd Drag penalty in the UI (15% penalty for maximum popularity).
*   [x] Handle hydration routing on app load/refresh (shows ResultsScreen or LockedScreen immediately).
*   [x] Implement safe voter sync fallback to support older locked posts.

### 🎯 Phase 3: Leaderboard, Streaks, & Badges (Completed)
*   [x] Store user-specific persistent lifetime performance stats in Redis (streak).
*   [x] Build a player leaderboard on Results screen showing alignment scores.
*   [x] Track consecutive daily voting streaks.
*   [x] Design and award 3 custom badges: Meme Prophet, Contrarian Spark, First Lock.

### 🎯 Phase 4: Meme Launchpad & Art Direction Upgrades (Completed)
*   [x] Create a Meme Launchpad submission screen for user-nominated meme contenders.
*   [x] Implement duplicate meme name checks and input constraints validation.
*   [x] Add upvote/support voting mechanism for nominations.
*   [x] Sort candidates by support count desc and highlight the "Top Pick".
*   [x] Refine "Meme Arcade Arena" design system: glowing selected contender lanes, ticket/slip receipt.
*   [x] Align vertical CTA buttons stack and clean taglines.
*   [x] Implement Replace/Edit nomination flow with support reset to prevent exploits.
*   [x] Separate user's nomination from Community Nominees to resolve duplication.
*   [x] Establish playfield visual system: central arcade board (`.arcade-board`), glowing ring (`.arena-ring`), contender card (`.contender-lane`), ticket receipt (`.arcade-ticket`), locked stamp (`.ticket-stamp`), and champion podium stage (`.podium-stage`).

### 🎯 Phase 5A: Daily Round Loop & Curation Preview (Completed)
*   [x] Add clear daily-round loop status headers and guidelines on Splash, Arena, and Locked screens.
*   [x] Implement turn-ready Lock button copy states at 100 Hype Points.
*   [x] Display live "Leading for Tomorrow" nominee on the Results screen dynamically.
*   [x] Embed "Leading for Tomorrow" and "Top Nominee" badges inside the Launchpad list.

### 🎯 Phase 5B: Manual Daily Curation & Tomorrow’s Board Preview (Completed)
*   [x] Add `curated-launchpad:${postId}` string key to Redis models schema.
*   [x] Implement `POST /api/launchpad/curate` endpoint to curate and snapshot top 1-3 nominees.
*   [x] Upgrade `GET /api/launchpad` to fetch and return curated preview snapshot.
*   [x] Expose **Judge / Mod Curation Panel** near the bottom of Meme Launchpad screen.
*   [x] Upgrade Results screen watch section to display curated top 1-3 contender cards, with a fallback to the live top contender.

### 🎯 Phase 5C: Manual Round Control & Daily Loop Hardening (Completed)
*   [x] Add compact round status strip visible on Splash, Arena, Locked, Results, and Launchpad.
*   [x] Expose visually secondary "Judge Tools" block on Locked, Results, and Launchpad screens.
*   [x] Create safe Preview Next Board dynamic generator using curated nominees filled with defaults.

### 🎯 Phase 5D: Submission Readiness & Demo Packaging (Completed)
*   [x] Create/update comprehensive README.md explaining boundaries, play mechanics, and CLI scripts.
*   [x] Create docs/SUBMISSION_CHECKLIST.md to track final compliance, code quality, and QA steps.
*   [x] Create docs/DEMO_SCRIPT.md laying out a 60-second walkthrough plan for hackathon judges.
*   [x] Create docs/DEMO_POST_COPY.md detailing Reddit post template layouts and comments copy.
*   [x] Postpone background scheduled triggers for demo safety.

### 🎯 Phase 5E: Daily Curation & Cron Scheduler (Future / Post-Submission)
*   [ ] Build a moderator curation panel to view, approve, and queue user submissions.
*   [ ] Auto-select approved submissions for upcoming daily battle cards.
*   [ ] Implement a cron-like trigger or scheduled job to automatically post a new battle round every 24 hours.
*   [ ] Handle locking/ending the previous day's post and calculating final settlement results automatically.

### 🎯 Phase 6: Reddit Comment Optional Social Heat
*   [ ] Offer a button at locking state: "Post Picks to Comments".
*   [ ] Integrate with Devvit's Reddit comment poster API to submit formatted text comments (e.g., *"🐸 Frog Vibes: 50pts | 💀 Skull Moment: 50pts. Let's go!"*).
*   [ ] Ensure commenting is completely optional and does not gate gameplay progress.

### 🎯 Phase 7A: Retention Hook & Daily Ritual Loop Upgrade (Completed)
*   [x] Create a reusable `DailyLoopRail` showing the 4 steps of the daily game ritual.
*   [x] Integrate `DailyLoopRail` across Splash, HypeBoard, LockedScreen, ResultsScreen, and LaunchpadScreen.
*   [x] Implement Option A: smart redirect for settled first-time visitors to go directly to ResultsScreen.
*   [x] Add clipboard Shareable Recap helper on ResultsScreen with copy manual fallbacks.
*   [x] Refine copy and guides on all screens to create a daily ritual loop.
*   [x] Ensure all round controls are visually secondary and clearly marked.

### 🎯 Phase 7C: Readability & Visual Hierarchy Pass (Completed)
*   [x] Enforce mobile viewport compatibility (max-width `460px` container) and layout stability.
*   [x] Implement custom typographic scale using clamp dynamic utilities (`text-game-xs` to `text-game-hero`).
*   [x] Upgrade readability and contrast of Slate dim/muted colors.
*   [x] Scale up buttons, contender names, and point values across Splash, Arena, Locked, Results, and Launchpad.

### 🎯 Phase 8A: Public Player Loop + Missed-Round Hook Polish (Completed)
*   [x] Establish Global Round State Clarity badges (open, locked, spoken, forming) on top of key screens.
*   [x] Improve Settled / Missed-Round Results UX for non-voting visitors with explicit banners and CTAs.
*   [x] Streamline Hype Arena dynamic locked buttons and instructions.
*   [x] Wrap Round Controls in a collapsed togglable accordion section near the bottom.
*   [x] Perform a final cleanup to remove developer jargon (test, demo, judge) from the player canvas.

### 🎯 Phase 8B: Fresh Demo Post + First 30 Seconds Polish (Completed)
*   [x] Upgrade Splash screen typography hierarchy and copy.
*   [x] Enhance Hype Arena progress labels and helpers for 30-second play clarity.
*   [x] Complete text safety audits to secure disclaimers and clean candidate details.
*   [x] Synchronize docs, post copies, scripts, and README walkthrough instructions.
