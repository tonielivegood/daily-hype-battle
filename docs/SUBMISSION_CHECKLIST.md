# Submission Checklist: Daily Hype Battle

Use this checklist to ensure the app is polished and compliant before submitting it to the Reddit Hackathon judges.

---

## 🔗 Submission Links
* **App Listing Link**: `[Pending Deployment / Submission URL]`
* **Public Demo Post Link**: `[Pending Subreddit Demo Post URL]`
* **Demo Video (Under 60s)**: `[Pending Video Link]`

---

## 📋 Pre-Submission Checklist

### 1. Build & Code Quality
- [x] Run `npm run type-check` to verify TypeScript compile success.
- [x] Run `npm run lint` to verify ESLint passes with zero warnings or errors.
- [x] Run `npm run build` to verify production compiler bundles bundle correctly.
- [x] Verify all Redis calls use correct context parameters and key naming patterns.

### 2. Gameplay Loop Flow (Verification)
- [x] **Fresh State**: Fresh post opens at Splash screen showing the `🟢 Today’s board is open` badge.
- [x] **Arena Allocations**: points stepper increases/decreases in increments of 5, lock button activates at exactly 100 points, progress bar displays correct fill ratio.
- [x] **Lock Action**: selections freeze, Locked screen displays choices inside a ticket slip, daps stamp `"LOCKED"` chéo góc.
- [x] **Judge settlement**: Clicking settle triggers final rankings calculations, updates streak/badges in Redis, and routes to Results.
- [x] **Results hydration**: Reloading settled round displays Results screen immediately with no layout flicker.
- [x] **Meme Launchpad**: Users can submit one idea, edit/replace it (resets support count to 1), upvote other community entries.
- [x] **Manual Curation**: Curation snaps top 1-3 entries. Next Board preview generates exactly 5 cards.

### 3. Visual & UX Checks
- [x] **Desktop Inline View**: layout is centered at `max-w-[460px]`, fits neatly into Reddit post card area.
- [x] **Mobile Web View**: Tap targets are large, scrollbars are narrow, padding is responsive.
- [x] **Visual Consistency**: Unified "Meme Arcade Arena" theme (dark background, glowing purple outlines, monospaced receipt slips).

### 4. Safety & Policy Compliance
- [x] No casino, sports betting, crypto, token, or financial market language.
- [x] Safety footnote disclaimers are visible at the bottom of all screens.
- [x] Comment posting is completely optional and does not block gameplay.
