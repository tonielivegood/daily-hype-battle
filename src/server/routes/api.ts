import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
} from '../../shared/api';
import type {
  GetHypeResponse,
  HypeAllocation,
  HypeErrorResponse,
  LockHypeRequest,
  LockHypeResponse,
  SettledCandidateResult,
  SettledResults,
  LeaderboardEntry,
  LaunchpadSubmission,
  SubmitLaunchpadRequest,
  SupportLaunchpadRequest,
  GetLaunchpadResponse,
  CuratedLaunchpadPreview,
  CurateLaunchpadResponse,
} from '../../shared/types';

type ErrorResponse = {
  status: 'error';
  message: string;
};

// Valid candidate IDs (must match the client-side seed data)
const VALID_IDS = new Set([
  'frog-vibes',
  'dumpster-fire',
  'skull-moment',
  'chaos-duck',
  'taco-tuesday',
]);

const TOTAL_HYPE_POINTS = 100;

export const api = new Hono();

// ─── Counter endpoints (preserved from template) ────────────────────────────

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId: postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({
    count,
    postId,
    type: 'increment',
  });
});

api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({
    count,
    postId,
    type: 'decrement',
  });
});

// ─── Hype Battle endpoints ──────────────────────────────────────────────────

/** Build the Redis key for a user's hype allocation on a given post. */
const hypeKey = (postId: string, username: string): string =>
  `hype:${postId}:${username}`;

/** Helper to calculate player alignment score */
const calculatePlayerScore = (
  allocations: HypeAllocation[],
  candidates: SettledCandidateResult[]
): number => {
  let score = 0;
  for (const alloc of allocations) {
    const cand = candidates.find((c) => c.candidateId === alloc.candidateId);
    if (cand) {
      score += (alloc.points * cand.finalHype) / 100;
    }
  }
  return Math.round(score * 10) / 10; // Round to 1 decimal place
};

/**
 * GET /api/hype
 * Check whether the current user has already locked their hype for this post, and if round is settled.
 */
api.get('/hype', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    const [stored, resultsStr, streakStr, leaderboardMap, firstVoter] = await Promise.all([
      redis.get(hypeKey(postId, username)),
      redis.get(`hype:results:${postId}`),
      redis.get(`streak:${username}`),
      redis.hGetAll(`leaderboard:${postId}`),
      redis.get(`first_voter:${postId}`),
    ]);

    let allocations: HypeAllocation[] | null = null;
    let locked = false;
    if (stored) {
      allocations = JSON.parse(stored);
      locked = true;
    }

    let settled = false;
    let results: SettledResults | null = null;
    let playerScore: number | null = null;
    const badges: string[] = [];
    const leaderboard: LeaderboardEntry[] = [];

    // Parse leaderboard entries
    if (leaderboardMap) {
      for (const [voter, scoreStr] of Object.entries(leaderboardMap)) {
        leaderboard.push({
          username: voter,
          score: parseFloat(scoreStr) || 0,
        });
      }
      leaderboard.sort((a, b) => b.score - a.score);
    }

    if (resultsStr) {
      settled = true;
      results = JSON.parse(resultsStr);
      if (allocations && results) {
        playerScore = calculatePlayerScore(allocations, results.candidates);

        // Calculate badges
        // 1. Meme Prophet: user boosted the winning meme
        const winnerId = results.winningMemeId;
        const winnerAlloc = allocations.find((a) => a.candidateId === winnerId);
        if (winnerAlloc && winnerAlloc.points > 0) {
          badges.push('Meme Prophet');
        }

        // 2. Contrarian Spark: boosted candidate in top 2 that wasn't the most crowded
        const maxBoosts = Math.max(...results.candidates.map((c) => c.playerBoosts));
        const top2Ids = results.candidates.slice(0, 2).map((c) => c.candidateId);
        const hasContrarian = allocations.some((alloc) => {
          if (alloc.points === 0) return false;
          const cand = results!.candidates.find((c) => c.candidateId === alloc.candidateId);
          if (!cand) return false;
          const isTop2 = top2Ids.includes(alloc.candidateId);
          const isNotMostCrowded = cand.playerBoosts < maxBoosts;
          return isTop2 && isNotMostCrowded;
        });
        if (hasContrarian) {
          badges.push('Contrarian Spark');
        }

        // 3. First Lock: user was first to lock picks
        if (firstVoter === username) {
          badges.push('First Lock');
        }
      }
    }

    const streak = streakStr ? parseInt(streakStr, 10) : 0;

    return c.json<GetHypeResponse>({
      locked,
      allocations,
      settled,
      results,
      playerScore,
      streak,
      badges,
      leaderboard,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error('GET /api/hype error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to load hype: ${message}` },
      500
    );
  }
});

/**
 * POST /api/hype/lock
 * Validate and save the user's hype allocations.
 */
api.post('/hype/lock', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    // Check if already settled
    const settledStr = await redis.get(`hype:results:${postId}`);
    if (settledStr) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'This round has already been settled and is closed.' },
        403
      );
    }

    // Check if already locked
    const existing = await redis.get(hypeKey(postId, username));
    if (existing) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'You already locked your hype for this post' },
        409
      );
    }

    // Parse and validate the request body
    const body: LockHypeRequest = await c.req.json();
    const { allocations } = body;

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Allocations must be a non-empty array' },
        400
      );
    }

    // Validate candidate IDs
    for (const alloc of allocations) {
      if (!VALID_IDS.has(alloc.candidateId)) {
        return c.json<HypeErrorResponse>(
          { status: 'error', message: `Invalid candidate: ${alloc.candidateId}` },
          400
        );
      }
      if (typeof alloc.points !== 'number' || alloc.points < 0) {
        return c.json<HypeErrorResponse>(
          { status: 'error', message: `Invalid points for ${alloc.candidateId}` },
          400
        );
      }
    }

    // Validate total = 100
    const total = allocations.reduce((sum, a) => sum + a.points, 0);
    if (total !== TOTAL_HYPE_POINTS) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: `Total must be exactly ${TOTAL_HYPE_POINTS}, got ${total}` },
        400
      );
    }

    // Check if voter list is empty before lock to set First Lock badge candidate
    const existingVoters = await redis.hKeys(`voters:${postId}`);
    const isFirstLock = !existingVoters || existingVoters.length === 0;

    // Load and increment streak
    const streakStr = await redis.get(`streak:${username}`);
    const currentStreak = streakStr ? parseInt(streakStr, 10) : 0;
    const nextStreak = currentStreak + 1;

    // Save to Redis and track voter in hash
    const promises: Promise<unknown>[] = [
      redis.set(hypeKey(postId, username), JSON.stringify(allocations)),
      redis.hSet(`voters:${postId}`, { [username]: 'true' }),
      redis.set(`streak:${username}`, nextStreak.toString()),
    ];

    if (isFirstLock) {
      promises.push(redis.set(`first_voter:${postId}`, username));
    }

    await Promise.all(promises);

    return c.json<LockHypeResponse>({
      status: 'locked',
      allocations,
    });
  } catch (error) {
    console.error('POST /api/hype/lock error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to lock hype: ${message}` },
      500
    );
  }
});

/**
 * POST /api/hype/settle
 * Calculate final hype scores and settle the round for the current post.
 */
api.post('/hype/settle', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    // 1. Get all locked voters for this post from Redis Hash keys
    let voters = await redis.hKeys(`voters:${postId}`);

    // Fallback: If the current user has locked picks but is not in the voter list, add them.
    const currentUserHasLock = await redis.get(hypeKey(postId, username));
    if (currentUserHasLock) {
      const isVoterRegistered = voters.includes(username);
      if (!isVoterRegistered) {
        await redis.hSet(`voters:${postId}`, { [username]: 'true' });
        voters = [...voters, username];
      }
    }

    if (voters.length === 0) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'No allocations have been locked yet. Lock your hype first!' },
        400
      );
    }

    // 2. Fetch all allocations
    const allAllocations: HypeAllocation[][] = [];
    for (const voter of voters) {
      if (voter) {
        const val = await redis.get(hypeKey(postId, voter));
        if (val) {
          allAllocations.push(JSON.parse(val));
        }
      }
    }

    // 3. Initialize metrics with default 0s
    const playerBoosts: Record<string, number> = {};
    const pickerCounts: Record<string, number> = {};
    for (const id of VALID_IDS) {
      playerBoosts[id] = 0;
      pickerCounts[id] = 0;
    }

    // Accumulate player boosts and diversity
    for (const allocList of allAllocations) {
      for (const alloc of allocList) {
        if (VALID_IDS.has(alloc.candidateId)) {
          playerBoosts[alloc.candidateId] = (playerBoosts[alloc.candidateId] ?? 0) + alloc.points;
          if (alloc.points > 0) {
            pickerCounts[alloc.candidateId] = (pickerCounts[alloc.candidateId] ?? 0) + 1;
          }
        }
      }
    }

    // 4. Candidate metadata & placeholder modifiers
    const CANDIDATE_METADATA: Record<string, { name: string; emoji: string }> = {
      'frog-vibes': { name: 'Frog Vibes', emoji: '🐸' },
      'dumpster-fire': { name: 'Dumpster Fire', emoji: '🔥' },
      'skull-moment': { name: 'Skull Moment', emoji: '💀' },
      'chaos-duck': { name: 'Chaos Duck', emoji: '🦆' },
      'taco-tuesday': { name: 'Taco Tuesday', emoji: '🌮' },
    };

    const PITCH_HEAT: Record<string, number> = {
      'frog-vibes': 15,
      'dumpster-fire': 25,
      'skull-moment': 10,
      'chaos-duck': 20,
      'taco-tuesday': 30,
    };

    const FRESHNESS: Record<string, number> = {
      'frog-vibes': 20,
      'dumpster-fire': 10,
      'skull-moment': 5,
      'chaos-duck': 15,
      'taco-tuesday': 25,
    };

    // 5. Calculate Crowd Drag (15% penalty on player boosts for the candidate with max boosts)
    const maxBoosts = Math.max(...Object.values(playerBoosts));

    // 6. Calculate Final Hype for each candidate
    const candidates: SettledCandidateResult[] = [];
    let winningMemeId = '';
    let maxFinalHype = -1;

    for (const id of VALID_IDS) {
      const meta = CANDIDATE_METADATA[id] ?? { name: id, emoji: '❓' };
      const boosts = playerBoosts[id] ?? 0;
      const pitchHeat = PITCH_HEAT[id] ?? 0;
      const freshness = FRESHNESS[id] ?? 0;
      const diversity = (pickerCounts[id] ?? 0) * 10;
      const tinyChaos = Math.floor(Math.random() * 11); // 0 to 10 points

      // Crowd drag penalty: if it has the max boosts and max is > 0
      const isMaxPopular = boosts === maxBoosts && maxBoosts > 0;
      const crowdDrag = isMaxPopular ? Math.floor(boosts * 0.15) : 0;

      const finalHype = Math.max(
        0,
        boosts + pitchHeat + freshness + diversity + tinyChaos - crowdDrag
      );

      candidates.push({
        candidateId: id,
        name: meta.name,
        emoji: meta.emoji,
        playerBoosts: boosts,
        pitchHeat,
        freshness,
        pickerDiversity: diversity,
        tinyChaos,
        crowdDrag,
        finalHype,
      });

      if (finalHype > maxFinalHype) {
        maxFinalHype = finalHype;
        winningMemeId = id;
      }
    }

    // Sort candidates by final hype descending
    candidates.sort((a, b) => b.finalHype - a.finalHype);

    const settledResults: SettledResults = {
      settledAt: new Date().toISOString(),
      winningMemeId,
      candidates,
    };

    // Calculate and save player scores to Post-Scoped Leaderboard
    const leaderboardScores: Record<string, string> = {};
    for (const voter of voters) {
      if (voter) {
        const val = await redis.get(hypeKey(postId, voter));
        if (val) {
          const voterAllocations: HypeAllocation[] = JSON.parse(val);
          const score = calculatePlayerScore(voterAllocations, candidates);
          leaderboardScores[voter] = score.toString();
        }
      }
    }

    // 7. Save settled results to Redis and update post-scoped leaderboard
    const settlePromises: Promise<unknown>[] = [
      redis.set(`hype:results:${postId}`, JSON.stringify(settledResults)),
    ];
    if (Object.keys(leaderboardScores).length > 0) {
      settlePromises.push(redis.hSet(`leaderboard:${postId}`, leaderboardScores));
    }
    await Promise.all(settlePromises);

    // Calculate player score for current user, streak, first Lock and badges
    const userStored = await redis.get(hypeKey(postId, username));
    let userAllocations: HypeAllocation[] | null = null;
    let locked = false;
    let playerScore: number | null = null;
    if (userStored) {
      userAllocations = JSON.parse(userStored);
      locked = true;
      playerScore = calculatePlayerScore(userAllocations!, candidates);
    }

    // Load streak, first voter
    const [streakStr, firstVoter] = await Promise.all([
      redis.get(`streak:${username}`),
      redis.get(`first_voter:${postId}`),
    ]);
    const streak = streakStr ? parseInt(streakStr, 10) : 0;

    // Badges calculation
    const badges: string[] = [];
    if (userAllocations) {
      const winnerId = settledResults.winningMemeId;
      const winnerAlloc = userAllocations.find((a) => a.candidateId === winnerId);
      if (winnerAlloc && winnerAlloc.points > 0) {
        badges.push('Meme Prophet');
      }

      const top2Ids = candidates.slice(0, 2).map((c) => c.candidateId);
      const hasContrarian = userAllocations.some((alloc) => {
        if (alloc.points === 0) return false;
        const cand = candidates.find((c) => c.candidateId === alloc.candidateId);
        if (!cand) return false;
        const isTop2 = top2Ids.includes(alloc.candidateId);
        const isNotMostCrowded = cand.playerBoosts < maxBoosts;
        return isTop2 && isNotMostCrowded;
      });
      if (hasContrarian) {
        badges.push('Contrarian Spark');
      }

      if (firstVoter === username) {
        badges.push('First Lock');
      }
    }

    // Format leaderboard entries
    const leaderboard: LeaderboardEntry[] = Object.entries(leaderboardScores)
      .map(([voter, scoreStr]) => ({
        username: voter,
        score: parseFloat(scoreStr) || 0,
      }))
      .sort((a, b) => b.score - a.score);

    return c.json<GetHypeResponse>({
      locked,
      allocations: userAllocations,
      settled: true,
      results: settledResults,
      playerScore,
      streak,
      badges,
      leaderboard,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error('POST /api/hype/settle error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to settle: ${message}` },
      500
    );
  }
});

/**
 * GET /api/launchpad
 * Retrieve all submissions for the current post, sorted by supportCount desc, then createdAt asc.
 */
api.get('/launchpad', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    // 1. Fetch user's submission ID
    const userSubmissionId = await redis.get(`launchpad:user:${postId}:${username}`);

    // 2. Fetch all submissions from Hash
    const rawSubmissions = await redis.hGetAll(`launchpad:${postId}`);
    const submissions: LaunchpadSubmission[] = [];
    const supportedSubmissionIds: string[] = [];

    if (rawSubmissions) {
      const promises = Object.values(rawSubmissions).map(async (str) => {
        const sub: LaunchpadSubmission = JSON.parse(str);
        
        // Fetch support count for this submission
        const supportCount = await redis.hLen(`launchpad:supporters:${postId}:${sub.id}`);
        sub.supportCount = supportCount || 0;

        // Check if current user supported this submission
        const isSupported = await redis.hGet(`launchpad:supporters:${postId}:${sub.id}`, username);
        if (isSupported) {
          supportedSubmissionIds.push(sub.id);
        }

        submissions.push(sub);
      });
      await Promise.all(promises);
    }

    // Sort submissions: supportCount desc, then createdAt asc
    submissions.sort((a, b) => {
      if (b.supportCount !== a.supportCount) {
        return b.supportCount - a.supportCount;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // 3. Fetch curated preview from Redis string
    const rawCurated = await redis.get(`curated-launchpad:${postId}`);
    const curatedPreview: CuratedLaunchpadPreview | null = rawCurated
      ? JSON.parse(rawCurated)
      : null;

    return c.json<GetLaunchpadResponse>({
      submissions,
      userSubmissionId: userSubmissionId ?? null,
      supportedSubmissionIds,
      curatedPreview,
    });
  } catch (error) {
    console.error('GET /api/launchpad error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to load Launchpad: ${message}` },
      500
    );
  }
});

/**
 * POST /api/launchpad/curate
 * Snapshot the top 1-3 nominees for tomorrow's board.
 */
api.post('/launchpad/curate', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    // Fetch all submissions from Hash
    const rawSubmissions = await redis.hGetAll(`launchpad:${postId}`);
    const submissions: LaunchpadSubmission[] = [];

    if (rawSubmissions) {
      const promises = Object.values(rawSubmissions).map(async (str) => {
        const sub: LaunchpadSubmission = JSON.parse(str);
        
        // Fetch support count for this submission
        const supportCount = await redis.hLen(`launchpad:supporters:${postId}:${sub.id}`);
        sub.supportCount = supportCount || 0;

        submissions.push(sub);
      });
      await Promise.all(promises);
    }

    if (submissions.length === 0) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'No nominees yet. Ask the crowd to launch tomorrow’s contender.' },
        400
      );
    }

    // Sort submissions: supportCount desc, then createdAt asc
    submissions.sort((a, b) => {
      if (b.supportCount !== a.supportCount) {
        return b.supportCount - a.supportCount;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Take top 3
    const topNominees = submissions.slice(0, 3);

    const curatedPreview: CuratedLaunchpadPreview = {
      postId,
      curatedAt: new Date().toISOString(),
      curatedBy: username,
      nominees: topNominees,
    };

    // Save curated preview to Redis as a JSON string
    await redis.set(`curated-launchpad:${postId}`, JSON.stringify(curatedPreview));

    return c.json<CurateLaunchpadResponse>({ curatedPreview });
  } catch (error) {
    console.error('POST /api/launchpad/curate error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to curate Launchpad: ${message}` },
      500
    );
  }
});

/**
 * POST /api/launchpad/submit
 * Nominate a new meme idea for a future Hype Battle.
 */
api.post('/launchpad/submit', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    // 1. Get body and destructure including isEdit
    const body: SubmitLaunchpadRequest = await c.req.json();
    const { emoji, name, tag, pitch, why, isEdit } = body;

    // 2. Enforce one submission per user per post unless editing
    const existingSubId = await redis.get(`launchpad:user:${postId}:${username}`);
    if (existingSubId && !isEdit) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'You have already submitted an idea for this round!' },
        409
      );
    }
    if (isEdit && !existingSubId) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'No existing submission found to edit!' },
        404
      );
    }

    const cleanEmoji = emoji?.trim() || '';
    const cleanName = name?.trim() || '';
    let cleanTag = tag?.trim() || '';
    if (cleanTag && !cleanTag.startsWith('#')) {
      cleanTag = '#' + cleanTag;
    }
    const cleanPitch = pitch?.trim() || '';
    const cleanWhy = why?.trim() || '';

    const emojiCount = Array.from(cleanEmoji).length;
    if (emojiCount === 0 || emojiCount > 2) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Emoji is required (1-2 icons)' },
        400
      );
    }
    if (!cleanName || cleanName.length < 3 || cleanName.length > 32) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Name is required (3-32 chars)' },
        400
      );
    }
    if (!cleanTag || cleanTag.length < 2 || cleanTag.length > 18) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Tag is required (2-18 chars)' },
        400
      );
    }
    if (!cleanPitch || cleanPitch.length < 10 || cleanPitch.length > 90) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Pitch is required (10-90 chars)' },
        400
      );
    }
    if (!cleanWhy || cleanWhy.length < 10 || cleanWhy.length > 120) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Why-it-burns details required (10-120 chars)' },
        400
      );
    }

    // Link/URL detection check
    const urlPattern = /https?:\/\/[^\s]+/;
    if (urlPattern.test(cleanPitch) || urlPattern.test(cleanWhy)) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'URLs are not allowed in meme pitches.' },
        400
      );
    }

    // 3. Enforce no duplicate meme names per post (exclude own if editing)
    const rawSubmissions = await redis.hGetAll(`launchpad:${postId}`);
    if (rawSubmissions) {
      for (const str of Object.values(rawSubmissions)) {
        const sub: LaunchpadSubmission = JSON.parse(str);
        if (isEdit && sub.id === existingSubId) {
          continue;
        }
        if (sub.name.toLowerCase() === cleanName.toLowerCase()) {
          return c.json<HypeErrorResponse>(
            { status: 'error', message: 'A candidate with this name has already been nominated!' },
            400
          );
        }
      }
    }

    // 4. Create or update submission object
    const submissionId = isEdit && existingSubId ? existingSubId : 'sub_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const newSubmission: LaunchpadSubmission = {
      id: submissionId,
      postId,
      authorUsername: username,
      emoji: cleanEmoji,
      name: cleanName,
      tag: cleanTag,
      pitch: cleanPitch,
      why: cleanWhy,
      supportCount: 1, // resets/initializes back to 1
      createdAt: new Date().toISOString(),
    };

    // 5. Store to Redis
    const promises: Promise<unknown>[] = [
      redis.hSet(`launchpad:${postId}`, { [submissionId]: JSON.stringify(newSubmission) }),
      redis.set(`launchpad:user:${postId}:${username}`, submissionId),
    ];
    if (isEdit) {
      promises.push(redis.del(`launchpad:supporters:${postId}:${submissionId}`));
    }
    promises.push(redis.hSet(`launchpad:supporters:${postId}:${submissionId}`, { [username]: 'true' }));
    await Promise.all(promises);

    return c.json<LaunchpadSubmission>(newSubmission);
  } catch (error) {
    console.error('POST /api/launchpad/submit error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to submit Launchpad idea: ${message}` },
      500
    );
  }
});

/**
 * POST /api/launchpad/support
 * Toggle support for a Launchpad submission.
 */
api.post('/launchpad/support', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<HypeErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Could not identify current user' },
        400
      );
    }

    const body: SupportLaunchpadRequest = await c.req.json();
    const { submissionId } = body;

    if (!submissionId) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'submissionId is required' },
        400
      );
    }

    // Verify submission exists
    const subStr = await redis.hGet(`launchpad:${postId}`, submissionId);
    if (!subStr) {
      return c.json<HypeErrorResponse>(
        { status: 'error', message: 'Submission not found' },
        404
      );
    }

    // Toggle support
    const isSupported = await redis.hGet(`launchpad:supporters:${postId}:${submissionId}`, username);
    if (isSupported) {
      await redis.hDel(`launchpad:supporters:${postId}:${submissionId}`, [username]);
    } else {
      await redis.hSet(`launchpad:supporters:${postId}:${submissionId}`, { [username]: 'true' });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('POST /api/launchpad/support error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<HypeErrorResponse>(
      { status: 'error', message: `Failed to support idea: ${message}` },
      500
    );
  }
});
