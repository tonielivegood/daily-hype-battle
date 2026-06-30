# Technical Architecture: Daily Hype Battle

This project runs on the **Reddit Devvit Developer Platform**, utilizing a custom React app in an iframe (Client-side) coupled with serverless Node.js backend handlers (Server-side).

---

## 📁 Architecture Overview

```
src/
├── client/          # Frontend Web Application (React, runs in iFrame)
├── server/          # Backend Application (Hono router running in serverless environment)
└── shared/          # Shared interfaces and config used by client & server
```

---

## 💻 Client (Frontend) Components

The frontend compiles to two separate static HTML targets configured in `devvit.json`:
1. **`splash.html`**: The Inline Feed view. Renders when the post is loaded in the Reddit home/subreddit feed. Keeps resources light for fast load. It contains hydration logic that checks status on load. If the user has locked picks or the round is settled, it immediately redirects and renders the correct view (`LockedScreen` or `ResultsScreen`) inline. Otherwise, it renders the static Splash screen.
2. **`game.html`**: The Expanded full-screen view. Renders inside the expanded modal when the player enters the game to allocate points.

### Key Client Files & Responsibilities:
*   [game.tsx](file:///e:/daily-hype-battle/src/client/game.tsx): Root component of the game view. Coordinates loading and routes states.
*   [splash.tsx](file:///e:/daily-hype-battle/src/client/splash.tsx): Root of the inline view. Hydrates server state on mount and routes immediately to `ResultsScreen`, `LockedScreen`, or static splash.
*   [hooks/useHype.ts](file:///e:/daily-hype-battle/src/client/hooks/useHype.ts): React state hook that performs network requests to check lock status, lock allocations, and trigger settlements.
*   [components/HypeBoard.tsx](file:///e:/daily-hype-battle/src/client/components/HypeBoard.tsx): Coordinates state for the 100-point allocation sliders.
*   [components/CandidateCard.tsx](file:///e:/daily-hype-battle/src/client/components/CandidateCard.tsx): UI stepper (`+` / `-` buttons) for an individual candidate.
*   [components/LockedScreen.tsx](file:///e:/daily-hype-battle/src/client/components/LockedScreen.tsx): Sorted overview of selections after they are submitted. Includes a Dev/Test-only button to settle the post.
*   [components/ResultsScreen.tsx](file:///e:/daily-hype-battle/src/client/components/ResultsScreen.tsx): Displays final standings (meme candidates ranking), alignment scoring breakdown, formula explanations, and recalculation triggers.
*   [data/candidates.ts](file:///e:/daily-hype-battle/src/client/data/candidates.ts): Hardcoded meme contenders list (data source).

---

## 🖥️ Server (Backend) API

The server runs Hono routed through Devvit context. It is divided into logical routes in `src/server/routes/`:

### Endpoints & Routing Structure:
*   `GET /api/hype`: Checks if the logged-in Reddit user has already locked picks for the current custom post, and whether the post has been settled. Returns `{ locked: boolean, allocations, settled: boolean, results, playerScore }`.
*   `POST /api/hype/lock`: Validates the payload, saves choices to Redis, and registers the username in the post-scoped voters list. Returns `200` on success.
*   `POST /api/hype/settle`: Aggregates allocations for all participants, computes final hype scores with freshness, heat, chaos, diversity, and crowd drag factors, and saves results. Returns settled payload.
*   `GET /api/launchpad`: Retrieve nominated meme submissions sorted by supportCount desc, then createdAt asc, plus `curatedPreview: CuratedLaunchpadPreview | null`.
*   `POST /api/launchpad/submit`: Validate and store a user nomination for tomorrow's contender card.
*   `POST /api/launchpad/support`: Toggle support/upvote for a user-nominated meme contender.
*   `POST /api/launchpad/curate`: Snapshot top 1-3 Launchpad nominees to curated-launchpad:${postId} Redis key.
*   `POST /internal/menu/post-create`: Subreddit moderator action endpoint to spawn a new battle post.
*   `POST /internal/triggers/on-app-install`: Trigger endpoint that automatically posts a Hype Battle when the app is installed.

---

## 💾 Redis Data Models

All state storage uses Devvit's serverless `@devvit/web/server` Redis API.

### 1. Locked Picks Key:
*   **Key Pattern**: `hype:{postId}:{username}`
*   **Type**: `STRING` (JSON-serialized Array of `HypeAllocation[]`)

### 2. Post-scoped Voters List:
*   **Key Pattern**: `voters:${postId}`
*   **Type**: `HASH` (Map of `{ [username]: 'true' }` fields)
*   **Purpose**: Tracks which usernames locked picks to aggregate votes on settlement.

### 3. Settled Results Key:
*   **Key Pattern**: `hype:results:${postId}`
*   **Type**: `STRING` (JSON-serialized `SettledResults` object)

### 4. Meme Launchpad Submissions List:
*   **Key Pattern**: `launchpad:${postId}`
*   **Type**: `HASH` (Map of `{ [submissionId]: JSONStringOfSubmission }`)
*   **Purpose**: Stores all user nominations for tomorrow's Hype Battle.

### 5. User Submission Mapper:
*   **Key Pattern**: `launchpad:user:${postId}:${username}`
*   **Type**: `STRING` (Stores the `submissionId` of the user's nomination for that post/round, enforcing one nomination per round).

### 6. Submission Supporters List:
*   **Key Pattern**: `launchpad:supporters:${postId}:${submissionId}`
*   **Type**: `HASH` (Map of `{ [username]: 'true' }` tracking which users supported/upvoted this nomination).

### 7. Curated Tomorrow's Board Preview Key:
*   **Key Pattern**: `curated-launchpad:${postId}`
*   **Type**: `STRING` (JSON-serialized `CuratedLaunchpadPreview` object containing top 1-3 LaunchpadSubmission items sorted by support count).

---

## 🚀 How to Run Local Playtest
1. Ensure your Devvit CLI is logged in:
   ```bash
   npm run login
   ```
2. Start the hot-reload Vite compilation and Devvit playtest:
   ```bash
   npm run dev
   ```
3. Open the playtest page, go to the subreddit `daily_hype_battle_dev`, and spawn a test post via the moderator action menu.

---

## ⚠️ Known Devvit Constraints
*   **No Wildcard Keys scanning**: Standard Redis `keys()` scanning is missing/unsupported in Devvit types. We map voters using a Redis Hash (`voters:${postId}`) and retrieve them with `hKeys()`.
*   **Context Scope**: `postId` is required for Hono server routes.
*   **Iframe height constraints**: Both inline view and modal view have physical boundaries. On desktop browser inline cards, layout elements can stretch. Consider a centering `max-width` container in polish passes.
