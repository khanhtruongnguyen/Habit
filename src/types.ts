export type ThemeId = 'obsidian' | 'cyber' | 'matcha' | 'paper';

export type TabId = 'today' | 'boss' | 'focus' | 'analytics' | 'shop';

export type HabitCategory =
  | 'health'
  | 'intellect'
  | 'discipline'
  | 'creativity'
  | 'finance';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'epic';

export type UrgeTrigger =
  | 'boredom'
  | 'stress'
  | 'tired'
  | 'fomo'
  | 'habitual'
  | 'social';

export type UrgeOutcome = 'resisted' | 'sos_victory' | 'slipped';

export type MoodType = 'fire' | 'calm' | 'neutral' | 'tired' | 'storm';

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  category: HabitCategory;
  targetCount: number;
  unit: string;
  xpReward: number;
  coinReward: number;
  difficulty: DifficultyLevel;
  miniVersion: string; // Quy tắc 2 phút
  stackTrigger?: string; // Thói quen neo: "Sau khi..."
  createdAt: string;
}

export interface BadHabit {
  id: string;
  title: string;
  emoji: string;
  savedMoneyPerRefusal: number; // VNĐ
  savedMinutesPerRefusal: number; // phút
  xpReward: number;
  coinReward: number;
  difficulty: DifficultyLevel;
  motto: string;
  defaultTrigger: UrgeTrigger;
  createdAt: string;
}

export interface DailyHabitLog {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>;
  miniWins: Record<string, boolean>;
}

export interface UrgeEvent {
  id: string;
  badHabitId: string;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  outcome: UrgeOutcome;
  trigger: UrgeTrigger;
  intensity: number; // 1 - 10
  note?: string;
}

export interface BossDefinition {
  id: string;
  name: string;
  title: string;
  emoji: string;
  maxHp: number;
  weakness: string;
  lore: string;
  rewardCoins: number;
  rewardChests: number;
  badgeName: string;
}

export interface BossProgress {
  currentBossIndex: number;
  currentHp: number;
  defeatedBossIds: string[];
  totalDamageDealt: number;
  recentHits: {
    id: string;
    label: string;
    damage: number;
    isCrit: boolean;
    timestamp: string;
  }[];
}

export interface RewardItem {
  id: string;
  title: string;
  emoji: string;
  costCoins: number;
  redeemedCount: number;
  description?: string;
}

export interface FocusSession {
  id: string;
  date: string;
  timestamp: string;
  minutes: number;
  label: string;
  xpEarned: number;
  damageDealt: number;
}

export interface DailyJournal {
  date: string;
  mood: MoodType;
  note: string;
}

export interface ChestDropRecord {
  id: string;
  timestamp: string;
  type: 'coins' | 'xp' | 'freeze' | 'quote' | 'badge';
  title: string;
  detail: string;
  emoji: string;
}

export interface AppState {
  version: number;
  userName: string;
  pactText: string;
  theme: ThemeId;
  soundEnabled: boolean;
  totalXp: number;
  coins: number;
  chestsAvailable: number;
  streakFreezes: number;
  doubleXpDate: string | null; // YYYY-MM-DD if active today
  unlockedBadges: string[];
  collectedQuotes: string[];
  chestHistory: ChestDropRecord[];
  habits: Habit[];
  badHabits: BadHabit[];
  habitLogs: Record<string, DailyHabitLog>; // keyed by YYYY-MM-DD
  urgeEvents: UrgeEvent[];
  boss: BossProgress;
  rewards: RewardItem[];
  focusSessions: FocusSession[];
  journals: Record<string, DailyJournal>; // keyed by YYYY-MM-DD
}
