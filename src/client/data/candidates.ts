import type { HypeCandidate } from '../../shared/types';

export const CANDIDATES: HypeCandidate[] = [
  {
    id: 'frog-vibes',
    emoji: '🐸',
    name: 'Frog Vibes',
    tag: '#ribbiting',
    pitch: 'Chill energy only. Hop on.',
  },
  {
    id: 'dumpster-fire',
    emoji: '🔥',
    name: 'Dumpster Fire',
    tag: '#iconic',
    pitch: "Everything's fine. It's fine.",
  },
  {
    id: 'skull-moment',
    emoji: '💀',
    name: 'Skull Moment',
    tag: '#deadmeme',
    pitch: 'So dead it came back to life.',
  },
  {
    id: 'chaos-duck',
    emoji: '🦆',
    name: 'Chaos Duck',
    tag: '#quack',
    pitch: 'Unpredictable. Unstoppable. Duck.',
  },
  {
    id: 'taco-tuesday',
    emoji: '🌮',
    name: 'Taco Tuesday',
    tag: '#crunch',
    pitch: "It's always Tuesday somewhere.",
  },
];

export const VALID_CANDIDATE_IDS = new Set(CANDIDATES.map((c) => c.id));

export const TOTAL_HYPE_POINTS = 100;
