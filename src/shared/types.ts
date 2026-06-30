export type HypeCandidate = {
  id: string;
  emoji: string;
  name: string;
  tag: string;
  pitch: string;
};

export type HypeAllocation = {
  candidateId: string;
  points: number;
};

export type LockHypeRequest = {
  allocations: HypeAllocation[];
};

export type LockHypeResponse = {
  status: 'locked';
  allocations: HypeAllocation[];
};

export type SettledCandidateResult = {
  candidateId: string;
  name: string;
  emoji: string;
  playerBoosts: number;
  pitchHeat: number;
  freshness: number;
  pickerDiversity: number;
  tinyChaos: number;
  crowdDrag: number;
  finalHype: number;
};

export type SettledResults = {
  settledAt: string;
  winningMemeId: string;
  candidates: SettledCandidateResult[];
};

export type LeaderboardEntry = {
  username: string;
  score: number;
};

export type GetHypeResponse = {
  locked: boolean;
  allocations: HypeAllocation[] | null;
  settled: boolean;
  results: SettledResults | null;
  playerScore: number | null;
  streak: number;
  badges: string[];
  leaderboard: LeaderboardEntry[];
  username: string;
};

export type HypeErrorResponse = {
  status: 'error';
  message: string;
};

export type LaunchpadSubmission = {
  id: string;
  postId: string;
  authorUsername: string;
  emoji: string;
  name: string;
  tag: string;
  pitch: string;
  why: string;
  supportCount: number;
  createdAt: string;
};

export type SubmitLaunchpadRequest = {
  emoji: string;
  name: string;
  tag: string;
  pitch: string;
  why: string;
  isEdit?: boolean;
};

export type SupportLaunchpadRequest = {
  submissionId: string;
};

export type CuratedLaunchpadPreview = {
  postId: string;
  curatedAt: string;
  curatedBy: string;
  nominees: LaunchpadSubmission[];
};

export type CurateLaunchpadResponse = {
  curatedPreview: CuratedLaunchpadPreview;
};

export type GetLaunchpadResponse = {
  submissions: LaunchpadSubmission[];
  userSubmissionId: string | null;
  supportedSubmissionIds: string[];
  curatedPreview: CuratedLaunchpadPreview | null;
};
