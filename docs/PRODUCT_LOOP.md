# Product Guardrail & Loop Design: Daily Hype Battle

This document outlines the product loops, motivational mechanics, and safety guidelines for the Daily Hype Battle Reddit mini-game.

---

## 🔄 The Core Daily Loop

Daily Hype Battle is structured as a 24-hour community ritual:

```
[Today] Pick Meme Contenders ➔ Spend exactly 100 Hype Points ➔ Lock Picks
                                                                │
[Launchpad] Nominate / Support Contenders for Tomorrow's Board 🎛️
                                                                │
[Tomorrow] Settle / Reveal Champion ➔ View Alignment Score, Streak, & Badges
```

### 1. The Arena Loop (Today)
*   **Entrance**: Players expand the Reddit inline post and click `"Enter the Arena 🔥"`.
*   **Point Allocation**: Players distribute exactly **100 fictional Hype Points** across 5 active meme candidates.
*   **The Lock Step**: Sealing allocations locks the player's picks to Redis, generating a verified ticket receipt.
*   **Tomorrow Motivation**: Encourages users to return tomorrow to see how the crowd aligned and if they pick the champion.

### 2. The Reveal Loop (Tomorrow)
*   **Crowning the Champion**: When the round settles, the community's combined point allocations determine the winner.
*   **Score and Streak**: Players view their individual alignment scores and consecutive daily streaks.
*   **Badges**: Dynamic badges are awarded based on voting behavior:
    *   *Meme Prophet*: Voted for the winning champion.
    *   *Contrarian Spark*: Supported underdog runner-ups.
    *   *First Lock*: Locked in selections first.
*   **Leaderboard**: Ranked standings of community alignment scores.

### 3. The Launchpad Loop (Tomorrow's Board)
*   **Nomination**: Any player can submit one meme contender per round on the Meme Launchpad.
*   **Curation**: Subreddit moderators snapshot the top upvoted community submissions to populate the next day's card board.
*   **Preview**: The upcoming card preview forms dynamically at the bottom of the Results and Locked screens.

### 4. The Founder Loop (Creator Motivation)
*   **Meme Identity Builder**: Launchpad nominations allow players to define taglines, optional web image URLs, and choose custom frame theme styles (Neon, Cursed, Wholesome, Chaos, Classic) to establish a distinct contender identity with real-time card previews.
*   **Recognition**: Nominee items explicitly state `Created by u/username` to give original creators credit.
*   **Contender Status**: For a user's own nomination, the UI labels it `Your Contender` and renders the custom frame theme border, driving personal interest in promoting the post to gather upvotes.

---

## 🎯 Returning-Player Motivations

1.  **Consecutive Streaks**: A visual daily streak counts consecutive rounds played, making players want to protect their record.
2.  **Earned Badges**: Rewards distinct voting styles (e.g., predicting the winner vs. backing the underdog).
3.  **Launchpad Campaigning**: Players who nominate contenders want to return to rally votes and check if their meme made the next board.
4.  **Leaderboard Standing**: Climbing the subreddit leaderboard builds friendly competition.

---

## 🚫 Safety Guardrails & Vocabulary

To comply with Reddit's policy guidelines, the application strictly uses **playful and recreational vocabulary**:

*   **Fictional Points Only**: Hype points have zero financial, monetary, or physical value.
*   **No Real Money**: There are no entry fees, buy-ins, cash rewards, or payout systems.
*   **No Cryptocurrencies**: No blockchain, NFTs, token minting, staking, or wallet integrations.
*   **No Betting/Gambling**: No odds, point spreads, real-world wagering, bookmaking, or slot mechanics.
*   **No Reddit Karma Impact**: Alignment scores and wins within this application do not modify the user's actual Reddit post or comment karma.

### Approved Terminology
*   **Yes**: *Hype Points, meme contenders, lock picks, reveal, launchpad, support, founder, streak, badges, alignment score, board.*
*   **No**: *Betting, wager, gambling, portfolio, investing, cash-out, crypto, coin, token, stock, trading, profit, loss.*
