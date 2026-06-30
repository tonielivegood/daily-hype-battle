# Gameplay Specification: Daily Hype Battle

## One-Liner
Daily Hype Battle is a fun, lightweight interactive Reddit experience where users allocate 100 fictional "Hype Points" each day to support their favorite meme candidates and see how their choices align with the subreddit community.

---

## Core Daily Loop
1. **Reset & Launch (Future)**: Every day, a new battle post is generated with a fresh set of meme candidates.
2. **Pitches & Exploration**: Users explore candidate cards, emojis, tags, and pitches in their Reddit feed.
3. **Point Allocation**: Users distribute exactly 100 Hype Points across the candidates.
4. **Lock Selections**: Users lock their allocation to seal their picks for the day.
5. **Results & Settlement (Future)**: Once the day ends, points are aggregated to determine the community's Hype Champion, rewarding users who accurately predicted/boosted the winning memes.

---

## Player Actions Each Day
* **Enter the Arena**: Click the call-to-action button in the Reddit feed to expand the game view.
* **Allocate Hype**: Use the stepper controls (`+` and `-`) to add or remove points for each candidate in increments of 5.
* **Lock Picks**: Submit the allocation once exactly 100 Hype Points have been distributed.
* **Review Selections**: View the locked picks ordered by highest points.

---

## Hype Points Allocation Rules
* **Total Points**: Every user receives exactly **100 Hype Points** per day/post.
* **Granularity**: Points must be allocated in increments of **5 points**.
* **Distribution**: Users can put all 100 points into a single candidate, or split them across multiple candidates (e.g., 50/30/20, 20/20/20/20/20).
* **Validation**: The "Lock" button is disabled unless the sum of points allocated is exactly 100. The server rejects any payload where total != 100.

---

## Locked State Rules
* **Immutability**: Once a user locks their picks, the transaction is final. The server enforces a strict lock-once rule per user per post.
* **Persistence**: Locked selections are stored in Redis and persist across refreshes, tab closures, or app restarts. 
* **State Transition**: The UI immediately transitions to a `LockedScreen` showing their locked picks and instructs them to return later/tomorrow for the community results.

---

## Future Results & Settlement Rules
* **Aggregation**: The server will periodically (or at the end of the day) sum all allocated hype points across all users.
* **Hype Score**: A candidate's final hype score is the sum of all points allocated to them.
* **Winning Meme**: The candidate with the highest total hype score is crowned the Hype Champion.
* **User Score / Alignment**: Users will receive a personal "Alignment Score" showing how closely their picks matched the crowd's final rankings.

---

## Future Launchpad & User Meme Rules
* **Submissions**: Subreddit members will be able to submit their own custom memes (name, emoji, pitch) to be featured in upcoming Hype Battles.
* **Curation**: Moderators or community votes will curate the daily lineup from the Launchpad queue.

---

## Comment & Reddit Upvote Integration Rules
* **Social Heat**: Users will have the option to post their locked allocations directly to the Reddit comment thread to spark discussion.
* **Optionality**: Commenting is strictly social and optional. It must never block progression, and no core reward or gameplay functionality is locked behind posting a comment.
* **Upvoting**: Users are encouraged to upvote the post to increase visibility, but gameplay mechanics are not tied directly to upvotes.

---

## Safety & Disclaimer Language
* All screens and disclosures must display the following or equivalent wording:
  > **Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.**
