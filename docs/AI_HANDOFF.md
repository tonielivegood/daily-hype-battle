# AI Handoff: Daily Hype Battle

Welcome to the next coding session. This document contains the current state of the Daily Hype Battle project after completing **Phase 10 (Daily Loop, Rally, & Player Motivation)** and **Phase 11A (Meme Identity & Creator Ownership Foundation)**.

---

## 🚩 Current Project Status
We have successfully implemented the Meme Identity Foundation, bringing taglines, frame themes, web image URLs, and creator credits to all nomination preview lineups and active campaigning cards.

*   **Current App State**:
    1.  **Meme Identity Builder**: The Meme Launchpad form includes fields for a Custom Tagline (max 50 chars), an optional Meme Image URL, and a Frame Style selector (Neon, Cursed, Wholesome, Chaos, Classic).
    2.  **Live Meme Card Preview**: Renders a miniature card layout in real time showing the card border styles, loaded custom web images (or emoji fallbacks), tags, pitches, and creator credits.
    3.  **Active Campaigning Dashboard**: Replaced the custom text layouts on the Launchpad with a polished campaigning card featuring the unified `MemeCard` layout, support vote trackers, and clipboard rally text shortcuts.
    4.  **Community Nominee Thumbnail Fallbacks**: High-density list views (Launchpad list, Locked screen stakes, Results screen previews) show the custom image thumbnail if present. If the image fails to load, it automatically and silently falls back to the emoji icon via inline DOM `onError` hooks.
    5.  **Creator Credits & Stakes**: Displaying nominee author credits (`Created by u/username`) and flagging the current player's submission as `Your Contender` across results, locked previews, and launchpad card grids.
    6.  **Tagline Comments**: `Copy Rally Comment` buttons carry custom taglines if specified by the creator, defaulting back to the pitch if tagline is blank.

*   **Compilation & Quality checks**:
    *   `npm run type-check` compiles with 0 errors (fully compatible with `exactOptionalPropertyTypes: true`).
    *   `npm run lint` lints with 0 warnings or errors.
    *   `npm run build` bundles correctly using Vite.

---

## 💾 Curation Engine & Core Safety Specs
1.  **No Logic Changes**: Absolutely no gameplay allocation, lock/settle parameters, scoring formulas, or Redis schemas were modified.
2.  **Optional Identity Schema**: Extended the `LaunchpadSubmission` and `HypeCandidate` types with optional parameters: `imageUrl?: string`, `frameTheme?: string`, `tagline?: string`, `creatorUsername?: string`, and `createdAtMs?: number`.
3.  **URL Safety**: Added backend and frontend URL validation. Images must start with `http://` or `https://` web protocols. Text inputs (pitch, why, tagline) reject web links/URLs to prevent comment/description spam.
4.  **Vocabulary Hardening**: Forbidden words checking covers taglines to ensure no betting, cryptocurrency, stocks, or financial jargon leaks into community boards.

---

## 🎯 Recommended Next Phase: Phase 11B (Local File Uploads)
1.  **Local Image Upload support**: Once Devvit supports local assets/image uploads natively inside WebView sandboxes, replace the optional image URL input with a local file picker drag-and-drop area.
2.  **Redis Image Data considerations**: Avoid storing large raw base64 data strings directly in Redis keys. Ensure uploads are handled via Devvit Media upload APIs or transient URL asset hashes to keep Redis size low.
