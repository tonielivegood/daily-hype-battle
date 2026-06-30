# Daily Hype Battle 🏆

> **"Pick today’s meme. Launch tomorrow’s contender."**

Daily Hype Battle is a playful, interactive, Reddit-native mini-game built on the Devvit platform. Each day, subreddit members enter the arena to support their favorite meme contenders by distributing exactly 100 fictional Hype Points. Players can also nominate their own meme ideas to the Meme Launchpad and upvote community ideas to shape future round candidate lists.

---

## 🚫 What the Game is NOT
* **NO Real Money**: The game uses strictly fictional Hype Points. No entry fees or real cash payouts.
* **NO Cryptocurrencies**: No tokens, minting, or wallets.
* **NO Betting / Gambling**: No betting lines, odds, or real-world wagering.
* **NO Real Reddit Karma**: Points and victories inside this application are strictly in-game and do not modify the user's actual Reddit post/comment karma.

---

## 🎮 How to Play in under 30 Seconds
1. **Enter the Arena**: Click the primary CTA button in your feed to expand the game canvas.
2. **Spend Exactly 100 Hype Points**: Use the `+` / `-` buttons to allocate Hype Points across today's 5 meme contenders in steps of 5.
3. **Lock Your Hype**: Click **"Ready to lock your hype 🔒"** once you have spent exactly 100 points.
4. **Reveal Results (Demo Settle)**: Click **"Settle Demo Round (Judge Action)"** under Judge Panel to aggregate results and see who is crowned today's champion.
5. **Nominate Tomorrow's Contender**: Go to the **Meme Launchpad** to nominate next candidates, edit your entries, and support community nominees.

---

## 🛠️ Core Gameplay & Retention Mechanics
* **Locked Selections**: Picks are saved to Redis and persist after page refreshes or tab closures.
* **Meme Standings Calculations**: Settle algorithm aggregates community allocations and applies multipliers like freshness, quality, chaos, and picker split, while penalizing maximum popularity (Crowd Drag).
* **Earned Badges & Streaks**: Tracks consecutive daily voting streaks and awards titles like *Meme Prophet* (voted for champion), *Contrarian Spark* (supported underdog top 2), and *First Lock* (first voter in the round).
* **Player Leaderboard**: Ranked standings of the top alignment scores in the subreddit community.
* **Curation Preview Terminal**: A judge dashboard to manually snap community nominees into tomorrow's round lineup preview.

---

## 💻 Tech Stack
* **Backend**: Node.js v22 (Devvit serverless environment), Hono, Redis persistence.
* **WebView Client**: React 19, Tailwind CSS 4, Vite compiler (compiled to sandboxed iframe target).
* **End-to-End Type Safety**: Shared typescript interfaces for API requests/responses.

---

## ⚙️ Project Commands
Make sure you have Node.js v22 installed.
* `npm install`: Install dependencies.
* `npm run dev`: Starts the Devvit hot-reload local development server.
* `npm run type-check`: Validates TypeScript build types (`tsc --build`).
* `npm run lint`: Runs ESLint check across all TS/TSX source files.
* `npm run build`: Compiles production Hite client bundle and Devvit server scripts.

---

## 🧪 Demo & Playtesting Steps
1. Log in your Devvit CLI: `npm run login`.
2. Start development playtest server: `npm run dev`.
3. Open the console playtest URL, visit the development subreddit `daily_hype_battle_dev`.
4. Click the Moderator action menu on a post to spawn a test Daily Hype Battle card.
5. Explore the game loop: Splash -> Hype Arena (0/100 -> 100/100 points) -> Lock -> Settle -> Results & Leaderboard.
6. Open the Launchpad to nominate a meme (choose presets or custom emoji chips) and toggle *Preview Next Board* to view tomorrow's mock board!
