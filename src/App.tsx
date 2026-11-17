import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck, Sparkles, Swords, Wallet } from 'lucide-react';
import { AnalyticsView } from './components/AnalyticsView';
import { BossArena } from './components/BossArena';
import { FocusArena } from './components/FocusArena';
import { HabitPanel } from './components/HabitPanel';
import { HeaderHUD } from './components/HeaderHUD';
import { FloatingFeedbackLayer } from './components/ParticleBurst';
import type { FloatingFeedback } from './components/ParticleBurst';
import { ShieldPanel } from './components/ShieldPanel';
import { ShopAndProfile } from './components/ShopAndProfile';
import { UrgeSurfingModal } from './components/UrgeSurfingModal';
import type {
  AppState,
  BadHabit,
  ChestDropRecord,
  Habit,
  MoodType,
  RewardItem,
  TabId,
  ThemeId,
  UrgeTrigger,
} from './types';
import {
  BOSS_ROSTER,
  DIFFICULTY_META,
  analyzeShieldMetrics,
  createEmptyState,
  createSeedState,
  formatMinutes,
  formatVND,
  getTodayStr,
  isHabitDoneOnDate,
  openMysteryChest,
  uid,
} from './utils/gameLogic';
import {
  loadGistConfig,
  pullFromGist,
  pushToGist,
  saveGistConfig,
} from './utils/gistSync';
import type { GistConfig } from './utils/gistSync';
import { sfx } from './utils/sound';

const STORAGE_KEY = 'rentam_app_state_v1';

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.habits)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return createSeedState();
}

export function App() {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [gistConfig, setGistConfig] = useState<GistConfig>(loadGistConfig);
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [bossShaking, setBossShaking] = useState(false);
  const [sosModal, setSosModal] = useState<{
    open: boolean;
    badHabitId: string | null;
  }>({ open: false, badHabitId: null });
  const skipNextAutoSyncRef = useRef(true);

  const todayStr = getTodayStr();

  // Sync theme to document root & persist state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  const pushFeedback = useCallback((text: string, color: string) => {
    const id = uid('fb');
    setFeedbacks((prev) => [...prev.slice(-4), { id, text, color }]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1550);
  }, []);

  const handleUpdateGistConfig = useCallback((patch: Partial<GistConfig>) => {
    setGistConfig((prev) => {
      const next = { ...prev, ...patch };
      saveGistConfig(next);
      return next;
    });
  }, []);

  const handlePushGist = useCallback(async () => {
    if (!gistConfig.token.trim()) return;
    setGistConfig((p) => ({
      ...p,
      lastSyncStatus: 'syncing',
      lastError: null,
    }));
    try {
      const res = await pushToGist(gistConfig.token, gistConfig.gistId, state);
      setGistConfig((prev) => {
        const next: GistConfig = {
          ...prev,
          gistId: res.gistId,
          lastSyncedAt: res.syncedAt,
          lastSyncStatus: 'ok',
          lastError: null,
        };
        saveGistConfig(next);
        return next;
      });
      pushFeedback('☁️ Đã đẩy dữ liệu lên GitHub Gist!', '#38bdf8');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ Gist';
      setGistConfig((prev) => ({
        ...prev,
        lastSyncStatus: 'error',
        lastError: msg,
      }));
    }
  }, [gistConfig.token, gistConfig.gistId, state, pushFeedback]);

  const handlePullGist = useCallback(async () => {
    if (!gistConfig.gistId.trim()) return;
    setGistConfig((p) => ({
      ...p,
      lastSyncStatus: 'syncing',
      lastError: null,
    }));
    try {
      const res = await pullFromGist(gistConfig.token, gistConfig.gistId);
      skipNextAutoSyncRef.current = true;
      setState(res.state);
      setGistConfig((prev) => {
        const next: GistConfig = {
          ...prev,
          lastSyncedAt: res.syncedAt,
          lastSyncStatus: 'ok',
          lastError: null,
        };
        saveGistConfig(next);
        return next;
      });
      pushFeedback('☁️ Đã tải dữ liệu từ Gist về máy!', '#10b981');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải từ Gist';
      setGistConfig((prev) => ({
        ...prev,
        lastSyncStatus: 'error',
        lastError: msg,
      }));
    }
  }, [gistConfig.token, gistConfig.gistId, pushFeedback]);

  // Debounced auto-sync to Gist when enabled
  useEffect(() => {
    if (skipNextAutoSyncRef.current) {
      skipNextAutoSyncRef.current = false;
      return;
    }
    if (!gistConfig.autoSync || !gistConfig.token.trim() || !gistConfig.gistId.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      pushToGist(gistConfig.token, gistConfig.gistId, state)
        .then((res) => {
          setGistConfig((prev) => {
            const next: GistConfig = {
              ...prev,
              lastSyncedAt: res.syncedAt,
              lastSyncStatus: 'ok',
              lastError: null,
            };
            saveGistConfig(next);
            return next;
          });
        })
        .catch((err) => {
          setGistConfig((prev) => ({
            ...prev,
            lastSyncStatus: 'error',
            lastError: err instanceof Error ? err.message : 'Auto-sync lỗi',
          }));
        });
    }, 3500);
    return () => clearTimeout(timer);
  }, [state, gistConfig.autoSync, gistConfig.token, gistConfig.gistId]);

  const applyBossDamage = (
    prev: AppState,
    damage: number,
    label: string,
    isCrit: boolean
  ): { boss: AppState['boss']; bonusCoins: number; bonusChests: number; newBadge?: string; bossDefeatedName?: string } => {
    const currentDef =
      BOSS_ROSTER[prev.boss.currentBossIndex % BOSS_ROSTER.length];
    let nextHp = prev.boss.currentHp - damage;
    let nextBossIndex = prev.boss.currentBossIndex;
    const nextDefeated = [...prev.boss.defeatedBossIds];
    let bonusCoins = 0;
    let bonusChests = 0;
    let newBadge: string | undefined;
    let bossDefeatedName: string | undefined;

    if (nextHp <= 0) {
      bossDefeatedName = currentDef.name;
      bonusCoins = currentDef.rewardCoins;
      bonusChests = currentDef.rewardChests;
      if (!nextDefeated.includes(currentDef.id)) {
        nextDefeated.push(currentDef.id);
      }
      if (!prev.unlockedBadges.includes(currentDef.badgeName)) {
        newBadge = currentDef.badgeName;
      }
      nextBossIndex = prev.boss.currentBossIndex + 1;
      const upcomingDef = BOSS_ROSTER[nextBossIndex % BOSS_ROSTER.length];
      nextHp = upcomingDef.maxHp;
    }

    const hitRecord = {
      id: uid('hit'),
      label,
      damage,
      isCrit,
      timestamp: new Date().toISOString(),
    };

    return {
      boss: {
        currentBossIndex: nextBossIndex,
        currentHp: nextHp,
        defeatedBossIds: nextDefeated,
        totalDamageDealt: prev.boss.totalDamageDealt + damage,
        recentHits: [hitRecord, ...prev.boss.recentHits].slice(0, 12),
      },
      bonusCoins,
      bonusChests,
      newBadge,
      bossDefeatedName,
    };
  };

  const triggerShake = () => {
    setBossShaking(true);
    setTimeout(() => setBossShaking(false), 420);
  };

  // --- GOOD HABIT HANDLERS ---
  const handleIncrementHabit = (habit: Habit) => {
    const isDouble = state.doubleXpDate === todayStr;
    const todayLog = state.habitLogs[todayStr] || {
      date: todayStr,
      counts: {},
      miniWins: {},
    };
    const prevCount = todayLog.counts[habit.id] || 0;
    if (prevCount >= habit.targetCount) return;

    const nextCount = prevCount + 1;
    const completedNow = nextCount >= habit.targetCount;
    const xpGain = completedNow
      ? habit.xpReward * (isDouble ? 2 : 1)
      : Math.round(habit.xpReward / Math.max(2, habit.targetCount));
    const coinGain = completedNow ? habit.coinReward : 2;
    const dmg = completedNow
      ? DIFFICULTY_META[habit.difficulty].dmg
      : 10;

    if (completedNow) sfx.habitDone(state.soundEnabled);
    else sfx.habitStep(state.soundEnabled);

    triggerShake();

    let bossDefeatedToast: string | undefined;
    setState((prev) => {
      const log = prev.habitLogs[todayStr] || {
        date: todayStr,
        counts: {},
        miniWins: {},
      };
      const bossRes = applyBossDamage(
        prev,
        dmg,
        completedNow ? `Hoàn thành: ${habit.title}` : `Tiến độ: ${habit.title}`,
        false
      );
      if (bossRes.bossDefeatedName) {
        bossDefeatedToast = `🏆 HẠ GỤC ${bossRes.bossDefeatedName.toUpperCase()}!`;
      }

      // Award chest every 120 total damage milestone crossed
      const prevMilestone = Math.floor(prev.boss.totalDamageDealt / 220);
      const nextMilestone = Math.floor(
        bossRes.boss.totalDamageDealt / 220
      );
      const milestoneChest = nextMilestone > prevMilestone ? 1 : 0;

      return {
        ...prev,
        totalXp: prev.totalXp + xpGain,
        coins: prev.coins + coinGain + bossRes.bonusCoins,
        chestsAvailable:
          prev.chestsAvailable + bossRes.bonusChests + milestoneChest,
        unlockedBadges: bossRes.newBadge
          ? [...prev.unlockedBadges, bossRes.newBadge]
          : prev.unlockedBadges,
        boss: bossRes.boss,
        habitLogs: {
          ...prev.habitLogs,
          [todayStr]: {
            date: todayStr,
            counts: { ...log.counts, [habit.id]: nextCount },
            miniWins: log.miniWins,
          },
        },
      };
    });

    pushFeedback(`+${xpGain} XP • +${coinGain} Xu`, '#10b981');
    if (bossDefeatedToast) {
      pushFeedback(bossDefeatedToast, '#fbbf24');
    }
  };

  const handleDecrementHabit = (habit: Habit) => {
    setState((prev) => {
      const log = prev.habitLogs[todayStr];
      if (!log) return prev;
      const cur = log.counts[habit.id] || 0;
      if (cur <= 0) return prev;
      return {
        ...prev,
        habitLogs: {
          ...prev.habitLogs,
          [todayStr]: {
            ...log,
            counts: { ...log.counts, [habit.id]: cur - 1 },
          },
        },
      };
    });
  };

  const handleMiniWinHabit = (habit: Habit) => {
    sfx.habitStep(state.soundEnabled);
    const xpGain = Math.round(habit.xpReward * 0.5);
    const coinGain = Math.max(4, Math.round(habit.coinReward * 0.5));

    setState((prev) => {
      const log = prev.habitLogs[todayStr] || {
        date: todayStr,
        counts: {},
        miniWins: {},
      };
      if (log.miniWins[habit.id]) return prev;
      const bossRes = applyBossDamage(
        prev,
        18,
        `Bản 2 phút: ${habit.title}`,
        false
      );
      return {
        ...prev,
        totalXp: prev.totalXp + xpGain,
        coins: prev.coins + coinGain + bossRes.bonusCoins,
        chestsAvailable: prev.chestsAvailable + bossRes.bonusChests,
        boss: bossRes.boss,
        habitLogs: {
          ...prev.habitLogs,
          [todayStr]: {
            ...log,
            miniWins: { ...log.miniWins, [habit.id]: true },
          },
        },
      };
    });

    pushFeedback(`⚡ Giữ chuỗi 2 phút! +${xpGain} XP`, '#38bdf8');
  };

  const handleAddHabit = (h: Omit<Habit, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      habits: [
        { ...h, id: uid('hab'), createdAt: todayStr },
        ...prev.habits,
      ],
    }));
    pushFeedback('✨ Đã thêm thói quen tốt!', '#10b981');
  };

  const handleDeleteHabit = (id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
    }));
  };

  const handleUpdateHabit = (updated: Habit) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === updated.id ? updated : h)),
    }));
    pushFeedback('✏️ Đã cập nhật thói quen tốt!', '#38bdf8');
  };

  // --- BAD HABIT REFUSAL & SOS HANDLERS ---
  const handleRefuseBadHabit = (bad: BadHabit, trigger?: UrgeTrigger) => {
    sfx.shieldDeflect(state.soundEnabled);
    triggerShake();

    const isDouble = state.doubleXpDate === todayStr;
    const xpGain = bad.xpReward * (isDouble ? 2 : 1);
    const coinGain = bad.coinReward;
    const critDmg = Math.round(DIFFICULTY_META[bad.difficulty].dmg * 1.5);

    let defeatedName: string | undefined;
    setState((prev) => {
      const bossRes = applyBossDamage(
        prev,
        critDmg,
        `🛡️ Phản đòn: Từ chối ${bad.title}`,
        true
      );
      defeatedName = bossRes.bossDefeatedName;

      const prevRefusals = prev.urgeEvents.filter(
        (e) => e.outcome === 'resisted' || e.outcome === 'sos_victory'
      ).length;
      const bonusMilestoneChest = (prevRefusals + 1) % 5 === 0 ? 1 : 0;

      return {
        ...prev,
        totalXp: prev.totalXp + xpGain,
        coins: prev.coins + coinGain + bossRes.bonusCoins,
        chestsAvailable:
          prev.chestsAvailable + bossRes.bonusChests + bonusMilestoneChest,
        unlockedBadges: bossRes.newBadge
          ? [...prev.unlockedBadges, bossRes.newBadge]
          : prev.unlockedBadges,
        boss: bossRes.boss,
        urgeEvents: [
          ...prev.urgeEvents,
          {
            id: uid('urge'),
            badHabitId: bad.id,
            timestamp: new Date().toISOString(),
            date: todayStr,
            outcome: 'resisted',
            trigger: trigger || bad.defaultTrigger,
            intensity: 6,
          },
        ],
      };
    });

    pushFeedback(
      `🛡️ +1 KHIÊN! +${xpGain} XP • CRIT -${critDmg} HP`,
      '#f59e0b'
    );
    if (defeatedName) {
      pushFeedback(`🏆 HẠ GỤC ${defeatedName.toUpperCase()}!`, '#fbbf24');
    }
  };

  const handleSlipBadHabit = (bad: BadHabit, trigger: UrgeTrigger) => {
    sfx.slip(state.soundEnabled);
    setState((prev) => ({
      ...prev,
      urgeEvents: [
        ...prev.urgeEvents,
        {
          id: uid('urge'),
          badHabitId: bad.id,
          timestamp: new Date().toISOString(),
          date: todayStr,
          outcome: 'slipped',
          trigger,
          intensity: 8,
        },
      ],
    }));
    pushFeedback('💛 Đã ghi nhận — Đứng dậy ngay nhé!', '#94a3b8');
  };

  const handleSosVictory = (payload: {
    badHabitId: string;
    trigger: UrgeTrigger;
    intensity: number;
    fullSurf: boolean;
  }) => {
    sfx.chestOpen(state.soundEnabled);
    triggerShake();

    const mult = payload.fullSurf ? 2 : 1.3;
    const xpGain = Math.round(45 * mult);
    const coinGain = Math.round(25 * mult);
    const critDmg = Math.round(95 * mult);
    const bad = state.badHabits.find((b) => b.id === payload.badHabitId);

    setState((prev) => {
      const bossRes = applyBossDamage(
        prev,
        critDmg,
        `🌊 Lướt sóng SOS: ${bad ? bad.title : 'Cám dỗ'}`,
        true
      );
      return {
        ...prev,
        totalXp: prev.totalXp + xpGain,
        coins: prev.coins + coinGain + bossRes.bonusCoins,
        chestsAvailable: prev.chestsAvailable + bossRes.bonusChests,
        unlockedBadges: bossRes.newBadge
          ? [...prev.unlockedBadges, bossRes.newBadge]
          : prev.unlockedBadges,
        boss: bossRes.boss,
        urgeEvents: [
          ...prev.urgeEvents,
          {
            id: uid('urge'),
            badHabitId: payload.badHabitId,
            timestamp: new Date().toISOString(),
            date: todayStr,
            outcome: 'sos_victory',
            trigger: payload.trigger,
            intensity: payload.intensity,
          },
        ],
      };
    });

    setSosModal({ open: false, badHabitId: null });
    pushFeedback(
      `🌊 CHIẾN THẮNG SOS! +${xpGain} XP • +${coinGain} Xu`,
      '#f59e0b'
    );
  };

  const handleAddBadHabit = (bad: Omit<BadHabit, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      badHabits: [
        { ...bad, id: uid('bad'), createdAt: todayStr },
        ...prev.badHabits,
      ],
    }));
    pushFeedback('🛡️ Đã thêm cám dỗ vào Khiên Bản Lĩnh!', '#f59e0b');
  };

  const handleDeleteBadHabit = (id: string) => {
    setState((prev) => ({
      ...prev,
      badHabits: prev.badHabits.filter((b) => b.id !== id),
    }));
  };

  const handleUpdateBadHabit = (updated: BadHabit) => {
    setState((prev) => ({
      ...prev,
      badHabits: prev.badHabits.map((b) => (b.id === updated.id ? updated : b)),
    }));
    pushFeedback('✏️ Đã cập nhật thói quen xấu!', '#f59e0b');
  };

  // --- BOSS, CHESTS, FOCUS, SHOP ---
  const handleOpenChest = (): ChestDropRecord | null => {
    if (state.chestsAvailable <= 0) return null;
    sfx.chestOpen(state.soundEnabled);
    const { drop, patch } = openMysteryChest(state);
    setState((prev) => ({
      ...prev,
      ...patch,
      chestsAvailable: Math.max(0, prev.chestsAvailable - 1),
      chestHistory: [drop, ...prev.chestHistory].slice(0, 20),
    }));
    pushFeedback(`${drop.emoji} ${drop.title}`, '#a855f7');
    return drop;
  };

  const handleActivateDoubleXp = () => {
    if (state.coins < 40) return;
    sfx.coinSpend(state.soundEnabled);
    setState((prev) => ({
      ...prev,
      coins: prev.coins - 40,
      doubleXpDate: todayStr,
    }));
    pushFeedback('⚡ Đã kích hoạt x2 XP cả ngày hôm nay!', '#fbbf24');
  };

  const handleCompleteFocus = (minutes: number, label: string) => {
    sfx.chestOpen(state.soundEnabled);
    triggerShake();
    const xpEarned = Math.round(minutes * 1.4);
    const coinEarned = Math.max(8, Math.round(minutes * 0.6));
    const damageDealt = Math.round(minutes * 2);

    setState((prev) => {
      const bossRes = applyBossDamage(
        prev,
        damageDealt,
        `⏱️ Tập trung ${minutes}p: ${label}`,
        false
      );
      return {
        ...prev,
        totalXp: prev.totalXp + xpEarned,
        coins: prev.coins + coinEarned + bossRes.bonusCoins,
        chestsAvailable: prev.chestsAvailable + bossRes.bonusChests,
        boss: bossRes.boss,
        focusSessions: [
          {
            id: uid('focus'),
            date: todayStr,
            timestamp: new Date().toISOString(),
            minutes,
            label,
            xpEarned,
            damageDealt,
          },
          ...prev.focusSessions,
        ],
      };
    });

    pushFeedback(
      `⏱️ Xong ${minutes}p tập trung! +${xpEarned} XP`,
      '#38bdf8'
    );
  };

  const handleSaveJournal = (date: string, mood: MoodType, note: string) => {
    sfx.habitStep(state.soundEnabled);
    setState((prev) => ({
      ...prev,
      journals: {
        ...prev.journals,
        [date]: { date, mood, note },
      },
    }));
    pushFeedback('📓 Đã lưu nhật ký hôm nay!', '#10b981');
  };

  const handleRedeemReward = (rw: RewardItem) => {
    if (state.coins < rw.costCoins) return;
    sfx.coinSpend(state.soundEnabled);
    setState((prev) => ({
      ...prev,
      coins: prev.coins - rw.costCoins,
      rewards: prev.rewards.map((item) =>
        item.id === rw.id
          ? { ...item, redeemedCount: item.redeemedCount + 1 }
          : item
      ),
    }));
    pushFeedback(`🎉 Đã đổi: ${rw.emoji} ${rw.title}!`, '#fbbf24');
  };

  const handleAddReward = (rw: Omit<RewardItem, 'id' | 'redeemedCount'>) => {
    setState((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { ...rw, id: uid('rw'), redeemedCount: 0 }],
    }));
  };

  const handleDeleteReward = (id: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((r) => r.id !== id),
    }));
  };

  // --- COMPUTED METRICS FOR TODAY'S OVERVIEW ---
  const todayLog = state.habitLogs[todayStr];
  const completedGoodToday = state.habits.filter((h) =>
    isHabitDoneOnDate(h, todayLog)
  ).length;
  const shield = analyzeShieldMetrics(state);
  const currentBoss =
    BOSS_ROSTER[state.boss.currentBossIndex % BOSS_ROSTER.length];
  const bossHpPct = Math.max(
    0,
    Math.min(100, Math.round((state.boss.currentHp / currentBoss.maxHp) * 100))
  );

  return (
    <div className="app-shell">
      <FloatingFeedbackLayer feedbacks={feedbacks} />

      <HeaderHUD
        state={state}
        gistConfig={gistConfig}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleSound={() =>
          setState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
        }
        onChangeTheme={(theme: ThemeId) =>
          setState((p) => ({ ...p, theme }))
        }
        onOpenSos={() => setSosModal({ open: true, badHabitId: null })}
      />

      {/* TODAY BATTLEGROUND */}
      {activeTab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Personal Pact + Quick KPI Strip */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.09), rgba(245,158,11,0.09))',
            }}
          >
            <div style={{ fontSize: '0.88rem', lineHeight: 1.45, flex: '1 1 320px' }}>
              <span
                style={{
                  fontWeight: 800,
                  color: 'var(--accent-good)',
                  marginRight: 8,
                }}
              >
                📜 Lời thề:
              </span>
              <span style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>
                “{state.pactText}”
              </span>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => setActiveTab('boss')}
              style={{
                padding: '7px 13px',
                borderColor: 'rgba(244,63,94,0.4)',
                fontSize: '0.8rem',
              }}
            >
              <span>{currentBoss.emoji}</span>
              <span>
                {currentBoss.name}:{' '}
                <strong className="mono" style={{ color: '#fb7185' }}>
                  {state.boss.currentHp} HP
                </strong>
              </span>
            </button>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="stats-4-grid">
            <div className="card" style={{ padding: '14px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                }}
              >
                <span>Thói quen tốt hôm nay</span>
                <Sparkles size={15} style={{ color: 'var(--accent-good)' }} />
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.55rem',
                  fontWeight: 800,
                  color: 'var(--accent-good)',
                  marginTop: 6,
                }}
              >
                {completedGoodToday}/{state.habits.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {state.habits.length > 0
                  ? `${Math.round(
                      (completedGoodToday / state.habits.length) * 100
                    )}% hoàn thành`
                  : 'Hãy thêm thói quen'}
              </div>
            </div>

            <div className="card" style={{ padding: '14px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                }}
              >
                <span>Số lần từ chối cám dỗ</span>
                <ShieldCheck size={15} style={{ color: 'var(--accent-shield)' }} />
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.55rem',
                  fontWeight: 800,
                  color: 'var(--accent-shield)',
                  marginTop: 6,
                }}
              >
                {shield.totalRefusals} lần
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Hôm nay: +{shield.todayRefusals} • Kháng cự {shield.resistanceRate}%
              </div>
            </div>

            <div className="card" style={{ padding: '14px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                }}
              >
                <span>Kho báu đã cứu được</span>
                <Wallet size={15} style={{ color: '#22c55e' }} />
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#22c55e',
                  marginTop: 6,
                }}
              >
                {formatVND(shield.moneySaved)}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                & {formatMinutes(shield.minutesSaved)} đời sống quý giá
              </div>
            </div>

            <div
              className="card card-interactive"
              onClick={() => setActiveTab('boss')}
              style={{ padding: '14px 16px', cursor: 'pointer' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                }}
              >
                <span>Boss Tuần Này</span>
                <Swords size={15} style={{ color: '#fb7185' }} />
              </div>
              <div
                style={{
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  marginTop: 7,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentBoss.emoji} {currentBoss.name}
              </div>
              <div className="progress-track" style={{ height: 7, marginTop: 9 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${bossHpPct}%`,
                    background: 'linear-gradient(90deg, #ef4444, #f97316)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 2-Column Battle Grid */}
          <div className="battle-grid">
            <HabitPanel
              habits={state.habits}
              logs={state.habitLogs}
              todayStr={todayStr}
              onIncrementHabit={handleIncrementHabit}
              onDecrementHabit={handleDecrementHabit}
              onMiniWinHabit={handleMiniWinHabit}
              onAddHabit={handleAddHabit}
              onUpdateHabit={handleUpdateHabit}
              onDeleteHabit={handleDeleteHabit}
            />

            <ShieldPanel
              badHabits={state.badHabits}
              urgeEvents={state.urgeEvents}
              todayStr={todayStr}
              onRefuseBadHabit={handleRefuseBadHabit}
              onSlipBadHabit={handleSlipBadHabit}
              onStartSosForHabit={(id) =>
                setSosModal({ open: true, badHabitId: id })
              }
              onAddBadHabit={handleAddBadHabit}
              onUpdateBadHabit={handleUpdateBadHabit}
              onDeleteBadHabit={handleDeleteBadHabit}
            />
          </div>
        </div>
      )}

      {activeTab === 'boss' && (
        <BossArena
          state={state}
          bossShaking={bossShaking}
          onOpenChest={handleOpenChest}
          onActivateDoubleXp={handleActivateDoubleXp}
        />
      )}

      {activeTab === 'focus' && (
        <FocusArena
          sessions={state.focusSessions}
          onCompleteFocus={handleCompleteFocus}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView state={state} onSaveJournal={handleSaveJournal} />
      )}

      {activeTab === 'shop' && (
        <ShopAndProfile
          state={state}
          gistConfig={gistConfig}
          onUpdateGistConfig={handleUpdateGistConfig}
          onPushGist={handlePushGist}
          onPullGist={handlePullGist}
          onRedeemReward={handleRedeemReward}
          onAddReward={handleAddReward}
          onDeleteReward={handleDeleteReward}
          onUpdateProfile={(userName, pactText) => {
            setState((p) => ({
              ...p,
              userName: userName.trim() || p.userName,
              pactText: pactText.trim() || p.pactText,
            }));
            pushFeedback('✨ Đã cập nhật hồ sơ!', '#38bdf8');
          }}
          onResetEmpty={() => {
            setState(createEmptyState());
            pushFeedback('🌱 Đã đặt lại hành trình mới!', '#10b981');
          }}
          onLoadDemo={() => {
            setState(createSeedState());
            pushFeedback('✨ Đã nạp lại dữ liệu mẫu!', '#38bdf8');
          }}
          onImportState={(newState) => {
            setState(newState);
            pushFeedback('💾 Đã khôi phục bản sao lưu!', '#10b981');
          }}
        />
      )}

      {/* SOS 90-Second Urge Surfing Overlay */}
      {sosModal.open && (
        <UrgeSurfingModal
          badHabits={state.badHabits}
          initialBadHabitId={sosModal.badHabitId}
          soundEnabled={state.soundEnabled}
          onClose={() => setSosModal({ open: false, badHabitId: null })}
          onCompleteVictory={handleSosVictory}
        />
      )}
    </div>
  );
}

export default App;
