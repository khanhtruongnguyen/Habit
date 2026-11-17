import type {
  AppState,
  BadHabit,
  BossDefinition,
  ChestDropRecord,
  DailyHabitLog,
  DifficultyLevel,
  Habit,
  HabitCategory,
  MoodType,
  UrgeEvent,
  UrgeTrigger,
} from '../types';

export function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDateOffsetStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

export function formatMinutes(totalMins: number): string {
  if (totalMins < 60) return `${Math.round(totalMins)} phút`;
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export const CATEGORY_META: Record<
  HabitCategory,
  { label: string; emoji: string; color: string }
> = {
  health: { label: 'Sức khỏe', emoji: '💪', color: '#10b981' },
  intellect: { label: 'Trí tuệ', emoji: '🧠', color: '#38bdf8' },
  discipline: { label: 'Kỷ luật', emoji: '⚔️', color: '#f59e0b' },
  creativity: { label: 'Sáng tạo', emoji: '🎨', color: '#a855f7' },
  finance: { label: 'Tài chính', emoji: '💰', color: '#22c55e' },
};

export const DIFFICULTY_META: Record<
  DifficultyLevel,
  { label: string; xp: number; coins: number; dmg: number; color: string }
> = {
  easy: { label: 'Dễ', xp: 15, coins: 8, dmg: 25, color: '#34d399' },
  medium: { label: 'Trung bình', xp: 25, coins: 14, dmg: 45, color: '#38bdf8' },
  hard: { label: 'Khó', xp: 40, coins: 22, dmg: 75, color: '#f59e0b' },
  epic: { label: 'Sử thi', xp: 65, coins: 35, dmg: 120, color: '#ec4899' },
};

export const TRIGGER_META: Record<
  UrgeTrigger,
  { label: string; emoji: string; tip: string }
> = {
  boredom: {
    label: 'Buồn chán',
    emoji: '🥱',
    tip: 'Não bạn đang đói kích thích — hãy đổi tư thế hoặc đứng dậy 60 giây.',
  },
  stress: {
    label: 'Căng thẳng',
    emoji: '🌋',
    tip: 'Cơn thèm là tín hiệu cần nghỉ ngơi thật sự, không phải dopamine giả.',
  },
  tired: {
    label: 'Mệt mỏi',
    emoji: '🪫',
    tip: 'Khi thiếu năng lượng, ý chí yếu đi. Hãy uống nước hoặc chợp mắt 15 phút.',
  },
  fomo: {
    label: 'FOMO / Tò mò',
    emoji: '📱',
    tip: 'Thứ bạn sợ bỏ lỡ thường chẳng thay đổi cuộc đời bạn sau 24 giờ nữa.',
  },
  habitual: {
    label: 'Phản xạ quen tay',
    emoji: '🤖',
    tip: 'Đặt chướng ngại vật 20 giây (để điện thoại xa tầm tay, tắt thông báo).',
  },
  social: {
    label: 'Môi trường / Rủ rê',
    emoji: '👥',
    tip: 'Giữ vững ranh giới 1 lần = tự tin hơn 10 lần cho những lần sau.',
  },
};

export const MOOD_META: Record<
  MoodType,
  { label: string; emoji: string; color: string }
> = {
  fire: { label: 'Bùng nổ', emoji: '🔥', color: '#f97316' },
  calm: { label: 'Bình tĩnh', emoji: '🧘', color: '#10b981' },
  neutral: { label: 'Ổn định', emoji: '🌤️', color: '#38bdf8' },
  tired: { label: 'Hơi đuối', emoji: '😮‍💨', color: '#a855f7' },
  storm: { label: 'Bão tố', emoji: '⚡', color: '#ef4444' },
};

export const MICRO_CHALLENGES: string[] = [
  'Uống ngay 1 ly nước lọc đầy — cảm nhận sự mát lạnh đi xuống cổ họng.',
  'Đứng dậy và hít đất 10 cái (hoặc squat 15 cái) để đốt adrenaline dư thừa!',
  'Nhìn ra cửa sổ hoặc vật ở xa 6 mét trong 20 giây để reset thị giác.',
  'Viết ra 1 câu duy nhất: "Nếu mình chiều theo cơn thèm này, 1 giờ nữa mình sẽ thấy thế nào?"',
  'Đặt điện thoại úp xuống bàn và bước sang phòng khác 60 giây.',
  'Thả lỏng hai vai, siết chặt nắm tay 5 giây rồi thả ra hoàn toàn — lặp lại 3 lần.',
  'Mở một bản nhạc không lời và dọn sạch 3 món đồ ngay trước mặt bạn.',
];

export const BOSS_ROSTER: BossDefinition[] = [
  {
    id: 'boss_procrastination',
    name: 'Lãnh Chúa Trì Hoãn',
    title: 'Kẻ Thì Thầm "Để Mai Làm"',
    emoji: '🦥',
    maxHp: 600,
    weakness: 'Quy tắc 2 phút & Phiên tập trung',
    lore: 'Hắn sống bằng những kế hoạch bị dời sang ngày mai. Mỗi thói quen bạn hoàn thành là một nhát kiếm chém tan lớp sương mù lười biếng.',
    rewardCoins: 120,
    rewardChests: 1,
    badgeName: 'Kẻ Diệt Trì Hoãn',
  },
  {
    id: 'boss_dopamine',
    name: 'Bóng Ma Dopamine Rẻ Tiền',
    title: 'Bậc Thầy Cuộn Vô Thức',
    emoji: '👁️‍🗨️',
    maxHp: 950,
    weakness: 'Khiên Từ Chối & Thở 90 giây',
    lore: 'Được sinh ra từ hàng nghìn video ngắn và thông báo vô nghĩa. Hắn cực kỳ sợ hãi mỗi khi bạn bấm nút TỪ CHỐI.',
    rewardCoins: 180,
    rewardChests: 2,
    badgeName: 'Thợ Săn Dopamine',
  },
  {
    id: 'boss_sugar',
    name: 'Ác Quỷ Đường Ngọt & Cú Đêm',
    title: 'Kẻ Đánh Cắp Giấc Ngủ',
    emoji: '🦇',
    maxHp: 1300,
    weakness: 'Thói quen Sức khỏe & Từ chối sau 21h',
    lore: 'Hắn dụ dỗ bạn bằng trà sữa lúc nửa đêm và thêm 1 tập phim nữa. Chỉ có kỷ luật sắt mới đóng băng được đôi cánh của hắn.',
    rewardCoins: 240,
    rewardChests: 2,
    badgeName: 'Hộ Vệ Đêm Trường',
  },
  {
    id: 'boss_chaos',
    name: 'Ma Vương Hỗn Loạn',
    title: 'Kẻ Phá Hủy Chuỗi Ngày',
    emoji: '🌋',
    maxHp: 1800,
    weakness: 'Combo nhiều ngày liên tiếp',
    lore: 'Trùm cuối của những ngày mất động lực. Đánh bại hắn chứng minh bạn không còn phụ thuộc vào cảm hứng nhất thời.',
    rewardCoins: 350,
    rewardChests: 3,
    badgeName: 'Huyền Thoại Tự Chủ',
  },
];

export const MYSTERY_QUOTES: string[] = [
  'Kỷ luật là chọn giữa thứ bạn muốn NGAY LÚC NÀY và thứ bạn muốn NHẤT trong đời.',
  'Mỗi lần bạn nói KHÔNG với một cám dỗ, não bộ bạn khắc sâu thêm một đường rãnh của bản lĩnh.',
  'Đừng đếm ngày không trượt — hãy đếm số lần bạn đứng vững khi cơn sóng ập đến.',
  'Một chiến thắng 2 phút hôm nay giá trị hơn một kế hoạch hoàn hảo không bao giờ bắt đầu.',
  'Cơn thèm chỉ kéo dài trung bình 90 giây nếu bạn không nuôi nó bằng sự chú ý.',
  'Bạn không cần phải hoàn hảo 100%, bạn chỉ cần không bỏ cuộc sau một ngày vấp ngã.',
  'Tự do thực sự không phải là làm mọi thứ mình thích, mà là không làm nô lệ cho những xung động của chính mình.',
];

export function getLevelInfo(totalXp: number) {
  let level = 1;
  let xpRemaining = Math.max(0, totalXp);
  while (true) {
    const needed = 120 + (level - 1) * 55;
    if (xpRemaining < needed) {
      const ranks = [
        { min: 1, title: 'Tân Binh Tỉnh Thức', icon: '🌱' },
        { min: 3, title: 'Chiến Binh Rèn Luyện', icon: '⚔️' },
        { min: 6, title: 'Kẻ Gác Khiên Đêm', icon: '🛡️' },
        { min: 10, title: 'Hiệp Sĩ Ý Chí', icon: '🦁' },
        { min: 15, title: 'Bậc Thầy Tự Chủ', icon: '⚡' },
        { min: 22, title: 'Huyền Thoại Kỷ Luật', icon: '👑' },
      ];
      const rank =
        [...ranks].reverse().find((r) => level >= r.min) || ranks[0];
      return {
        level,
        xpInLevel: xpRemaining,
        xpForNext: needed,
        progressPct: Math.min(100, Math.round((xpRemaining / needed) * 100)),
        rankTitle: rank.title,
        rankIcon: rank.icon,
      };
    }
    xpRemaining -= needed;
    level++;
  }
}

export function isHabitDoneOnDate(
  habit: Habit,
  log: DailyHabitLog | undefined
): boolean {
  if (!log) return false;
  const count = log.counts[habit.id] || 0;
  const mini = !!log.miniWins[habit.id];
  return count >= habit.targetCount || mini;
}

export function getHabitStreak(
  habit: Habit,
  logs: Record<string, DailyHabitLog>
): number {
  let streak = 0;
  const todayStr = getTodayStr();
  const startOffset = isHabitDoneOnDate(habit, logs[todayStr]) ? 0 : 1;

  for (let i = startOffset; i < 365; i++) {
    const d = getDateOffsetStr(i);
    if (isHabitDoneOnDate(habit, logs[d])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getGlobalActiveStreak(state: AppState): number {
  if (state.habits.length === 0 && state.urgeEvents.length === 0) return 0;
  let streak = 0;
  const todayStr = getTodayStr();

  const hasActivityOn = (d: string) => {
    const log = state.habitLogs[d];
    const doneHabit =
      log && state.habits.some((h) => isHabitDoneOnDate(h, log));
    const refusedBad = state.urgeEvents.some(
      (e) =>
        e.date === d &&
        (e.outcome === 'resisted' || e.outcome === 'sos_victory')
    );
    return Boolean(doneHabit || refusedBad);
  };

  const startOffset = hasActivityOn(todayStr) ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    if (hasActivityOn(getDateOffsetStr(i))) streak++;
    else break;
  }
  return streak;
}

export function computeCharacterStats(state: AppState) {
  let vitality = 25;
  let intellect = 25;
  let discipline = 25;
  let willpower = 25;

  const habitMap = new Map(state.habits.map((h) => [h.id, h]));

  Object.values(state.habitLogs).forEach((log) => {
    Object.entries(log.counts).forEach(([hId, cnt]) => {
      const h = habitMap.get(hId);
      if (!h || cnt <= 0) return;
      const done = cnt >= h.targetCount || log.miniWins[hId];
      const bonus = done ? 4 : 1;
      if (h.category === 'health') vitality += bonus;
      else if (h.category === 'intellect' || h.category === 'creativity')
        intellect += bonus;
      else discipline += bonus;
    });
  });

  state.urgeEvents.forEach((ev) => {
    if (ev.outcome === 'resisted') willpower += 4;
    else if (ev.outcome === 'sos_victory') willpower += 8;
  });

  const focusScore =
    25 +
    state.focusSessions.reduce(
      (acc, s) => acc + Math.max(2, Math.round(s.minutes / 8)),
      0
    );

  return {
    vitality: Math.min(100, vitality),
    intellect: Math.min(100, intellect),
    willpower: Math.min(100, willpower),
    focus: Math.min(100, focusScore),
    discipline: Math.min(100, discipline),
  };
}

export function analyzeShieldMetrics(state: AppState) {
  const badMap = new Map(state.badHabits.map((b) => [b.id, b]));
  const todayStr = getTodayStr();

  let totalRefusals = 0;
  let totalSosWins = 0;
  let totalSlips = 0;
  let todayRefusals = 0;
  let moneySaved = 0;
  let minutesSaved = 0;

  const triggerCounts: Record<UrgeTrigger, { wins: number; slips: number }> = {
    boredom: { wins: 0, slips: 0 },
    stress: { wins: 0, slips: 0 },
    tired: { wins: 0, slips: 0 },
    fomo: { wins: 0, slips: 0 },
    habitual: { wins: 0, slips: 0 },
    social: { wins: 0, slips: 0 },
  };

  const timeBuckets: Record<
    'morning' | 'afternoon' | 'evening' | 'night',
    { label: string; wins: number; slips: number }
  > = {
    morning: { label: 'Sáng (5h-12h)', wins: 0, slips: 0 },
    afternoon: { label: 'Chiều (12h-18h)', wins: 0, slips: 0 },
    evening: { label: 'Tối (18h-22h)', wins: 0, slips: 0 },
    night: { label: 'Khuya (22h-5h)', wins: 0, slips: 0 },
  };

  state.urgeEvents.forEach((ev) => {
    const isWin = ev.outcome === 'resisted' || ev.outcome === 'sos_victory';
    const hour = new Date(ev.timestamp).getHours();
    const bucket =
      hour >= 5 && hour < 12
        ? 'morning'
        : hour >= 12 && hour < 18
        ? 'afternoon'
        : hour >= 18 && hour < 22
        ? 'evening'
        : 'night';

    if (isWin) {
      totalRefusals++;
      if (ev.outcome === 'sos_victory') totalSosWins++;
      if (ev.date === todayStr) todayRefusals++;
      const bad = badMap.get(ev.badHabitId);
      if (bad) {
        moneySaved += bad.savedMoneyPerRefusal;
        minutesSaved += bad.savedMinutesPerRefusal;
      }
      triggerCounts[ev.trigger].wins++;
      timeBuckets[bucket].wins++;
    } else {
      totalSlips++;
      triggerCounts[ev.trigger].slips++;
      timeBuckets[bucket].slips++;
    }
  });

  const totalAttempts = totalRefusals + totalSlips;
  const resistanceRate =
    totalAttempts > 0 ? Math.round((totalRefusals / totalAttempts) * 100) : 100;

  // Find top trigger
  let topTrigger: UrgeTrigger = 'boredom';
  let maxTriggerTotal = -1;
  (Object.keys(triggerCounts) as UrgeTrigger[]).forEach((t) => {
    const sum = triggerCounts[t].wins + triggerCounts[t].slips;
    if (sum > maxTriggerTotal) {
      maxTriggerTotal = sum;
      topTrigger = t;
    }
  });

  // Find peak danger time bucket
  let peakBucketKey: keyof typeof timeBuckets = 'evening';
  let maxBucketTotal = -1;
  (Object.keys(timeBuckets) as (keyof typeof timeBuckets)[]).forEach((k) => {
    const sum = timeBuckets[k].wins + timeBuckets[k].slips;
    if (sum > maxBucketTotal) {
      maxBucketTotal = sum;
      peakBucketKey = k;
    }
  });

  return {
    totalRefusals,
    totalSosWins,
    totalSlips,
    todayRefusals,
    moneySaved,
    minutesSaved,
    resistanceRate,
    triggerCounts,
    timeBuckets,
    topTrigger,
    peakBucket: timeBuckets[peakBucketKey],
  };
}

export function openMysteryChest(state: AppState): {
  drop: ChestDropRecord;
  patch: Partial<AppState>;
} {
  const roll = Math.random();
  const timestamp = new Date().toISOString();

  if (roll < 0.28) {
    const bonusCoins = 45 + Math.floor(Math.random() * 55);
    return {
      drop: {
        id: uid('drop'),
        timestamp,
        type: 'coins',
        title: `Túi Vàng Kỷ Luật (+${bonusCoins} Xu)`,
        detail: 'Dùng xu tại Cửa Hàng Tự Thưởng để đổi phần thưởng đời thực!',
        emoji: '🪙',
      },
      patch: { coins: state.coins + bonusCoins },
    };
  }

  if (roll < 0.55) {
    return {
      drop: {
        id: uid('drop'),
        timestamp,
        type: 'freeze',
        title: 'Khiên Đóng Băng Chuỗi (+1)',
        detail: 'Bảo vệ tinh thần vào những ngày bận rộn không thể hoàn thành hết.',
        emoji: '🧊',
      },
      patch: { streakFreezes: state.streakFreezes + 1 },
    };
  }

  if (roll < 0.8) {
    const bonusXp = 70 + Math.floor(Math.random() * 60);
    return {
      drop: {
        id: uid('drop'),
        timestamp,
        type: 'xp',
        title: `Bình Tinh Hoa Ý Chí (+${bonusXp} XP)`,
        detail: 'Kinh nghiệm bùng nổ giúp chiến binh của bạn thăng cấp nhanh hơn!',
        emoji: '⚗️',
      },
      patch: { totalXp: state.totalXp + bonusXp },
    };
  }

  const remainingQuotes = MYSTERY_QUOTES.filter(
    (q) => !state.collectedQuotes.includes(q)
  );
  const pickedQuote =
    remainingQuotes[Math.floor(Math.random() * remainingQuotes.length)] ||
    MYSTERY_QUOTES[Math.floor(Math.random() * MYSTERY_QUOTES.length)];

  return {
    drop: {
      id: uid('drop'),
      timestamp,
      type: 'quote',
      title: 'Cuộn Bí Kíp Tâm Pháp',
      detail: `"${pickedQuote}"`,
      emoji: '📜',
    },
    patch: {
      collectedQuotes: state.collectedQuotes.includes(pickedQuote)
        ? state.collectedQuotes
        : [...state.collectedQuotes, pickedQuote],
      coins: state.coins + 25,
    },
  };
}

export function createSeedState(): AppState {
  const habits: Habit[] = [
    {
      id: 'h_water',
      title: 'Uống đủ nước tinh khiết',
      emoji: '💧',
      category: 'health',
      targetCount: 6,
      unit: 'ly',
      xpReward: 20,
      coinReward: 10,
      difficulty: 'easy',
      miniVersion: 'Uống ngay 1 ly đầy vào buổi sáng',
      stackTrigger: 'Ngay sau khi thức dậy',
      createdAt: getDateOffsetStr(20),
    },
    {
      id: 'h_read',
      title: 'Đọc sách nâng tầm tư duy',
      emoji: '📖',
      category: 'intellect',
      targetCount: 1,
      unit: 'phiên',
      xpReward: 30,
      coinReward: 16,
      difficulty: 'medium',
      miniVersion: 'Đọc đúng 2 trang sách',
      stackTrigger: 'Sau bữa tối 30 phút',
      createdAt: getDateOffsetStr(20),
    },
    {
      id: 'h_workout',
      title: 'Vận động / Chạy bộ / Gym',
      emoji: '🏋️',
      category: 'health',
      targetCount: 1,
      unit: 'buổi',
      xpReward: 45,
      coinReward: 24,
      difficulty: 'hard',
      miniVersion: 'Hít đất 10 cái hoặc giãn cơ 2 phút',
      stackTrigger: 'Ngay sau giờ làm/học',
      createdAt: getDateOffsetStr(20),
    },
    {
      id: 'h_meditate',
      title: 'Thiền định & Thở tĩnh tâm',
      emoji: '🧘',
      category: 'discipline',
      targetCount: 1,
      unit: 'lần',
      xpReward: 25,
      coinReward: 14,
      difficulty: 'medium',
      miniVersion: 'Hít thở sâu 5 nhịp không chạm điện thoại',
      stackTrigger: 'Trước khi mở máy tính làm việc',
      createdAt: getDateOffsetStr(18),
    },
    {
      id: 'h_deepwork',
      title: 'Học kỹ năng / Làm việc sâu 45p',
      emoji: '⚡',
      category: 'creativity',
      targetCount: 2,
      unit: 'block',
      xpReward: 40,
      coinReward: 22,
      difficulty: 'hard',
      miniVersion: 'Mở tài liệu và làm đúng 5 phút đầu tiên',
      createdAt: getDateOffsetStr(15),
    },
    {
      id: 'h_expense',
      title: 'Ghi chép chi tiêu trong ngày',
      emoji: '📒',
      category: 'finance',
      targetCount: 1,
      unit: 'lần',
      xpReward: 15,
      coinReward: 10,
      difficulty: 'easy',
      miniVersion: 'Kiểm tra số dư và ghi 1 khoản lớn nhất',
      createdAt: getDateOffsetStr(14),
    },
  ];

  const badHabits: BadHabit[] = [
    {
      id: 'b_shortvid',
      title: 'Lướt TikTok / Reels / Shorts vô thức',
      emoji: '📵',
      savedMoneyPerRefusal: 0,
      savedMinutesPerRefusal: 35,
      xpReward: 35,
      coinReward: 18,
      difficulty: 'hard',
      motto: 'Đừng đổi 35 phút cuộc đời lấy 10 giây cười nhạt.',
      defaultTrigger: 'boredom',
      createdAt: getDateOffsetStr(20),
    },
    {
      id: 'b_sugar',
      title: 'Trà sữa / Đồ ngọt / Ăn vặt đêm',
      emoji: '🧋',
      savedMoneyPerRefusal: 55000,
      savedMinutesPerRefusal: 15,
      xpReward: 30,
      coinReward: 16,
      difficulty: 'medium',
      motto: 'Cơn thèm ngọt qua sau 5 phút, sức khỏe ở lại nhiều năm.',
      defaultTrigger: 'stress',
      createdAt: getDateOffsetStr(20),
    },
    {
      id: 'b_latenight',
      title: 'Thức khuya quá 23h30 không lý do',
      emoji: '🦉',
      savedMoneyPerRefusal: 0,
      savedMinutesPerRefusal: 60,
      xpReward: 45,
      coinReward: 25,
      difficulty: 'epic',
      motto: 'Ngày mai bắt đầu từ giờ đi ngủ tối nay.',
      defaultTrigger: 'habitual',
      createdAt: getDateOffsetStr(18),
    },
    {
      id: 'b_impulsebuy',
      title: 'Chốt đơn mua sắm bốc đồng',
      emoji: '🛒',
      savedMoneyPerRefusal: 180000,
      savedMinutesPerRefusal: 20,
      xpReward: 40,
      coinReward: 22,
      difficulty: 'hard',
      motto: 'Chờ 48 giờ — nếu vẫn cần hãy mua, 90% là không cần.',
      defaultTrigger: 'fomo',
      createdAt: getDateOffsetStr(16),
    },
  ];

  // Build 18 days of realistic history (skipping today partly so user has actions to play today!)
  const habitLogs: Record<string, DailyHabitLog> = {};
  const urgeEvents: UrgeEvent[] = [];

  const triggers: UrgeTrigger[] = [
    'boredom',
    'stress',
    'tired',
    'fomo',
    'habitual',
  ];

  for (let d = 18; d >= 1; d--) {
    const dateStr = getDateOffsetStr(d);
    const counts: Record<string, number> = {};
    const miniWins: Record<string, boolean> = {};

    habits.forEach((h, idx) => {
      // Realistic completion pattern ~75%
      const seed = (d * 7 + idx * 13) % 10;
      if (seed < 7) {
        counts[h.id] = h.targetCount;
      } else if (seed === 7) {
        miniWins[h.id] = true;
        counts[h.id] = 1;
      } else {
        counts[h.id] = 0;
      }
    });

    habitLogs[dateStr] = { date: dateStr, counts, miniWins };

    // 1-2 urge events per historical day
    const numUrges = d % 2 === 0 ? 2 : 1;
    for (let u = 0; u < numUrges; u++) {
      const b = badHabits[(d + u) % badHabits.length];
      const trig = triggers[(d + u * 2) % triggers.length];
      const outcome =
        (d + u) % 6 === 0
          ? 'slipped'
          : (d + u) % 4 === 0
          ? 'sos_victory'
          : 'resisted';
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      dt.setHours(u === 0 ? 15 : 21, 15 + u * 20, 0, 0);

      urgeEvents.push({
        id: `seed_u_${d}_${u}`,
        badHabitId: b.id,
        timestamp: dt.toISOString(),
        date: dateStr,
        outcome,
        trigger: trig,
        intensity: 4 + ((d + u) % 6),
      });
    }
  }

  // Add slight progress for today so dashboard feels responsive right away
  const today = getTodayStr();
  habitLogs[today] = {
    date: today,
    counts: { h_water: 2, h_meditate: 1 },
    miniWins: {},
  };

  return {
    version: 1,
    userName: 'Chiến Binh Tỉnh Thức',
    pactText:
      'Tôi rèn luyện mỗi ngày không phải để hoàn hảo, mà để trở thành phiên bản làm chủ chính mình.',
    theme: 'obsidian',
    soundEnabled: true,
    totalXp: 685,
    coins: 215,
    chestsAvailable: 2,
    streakFreezes: 1,
    doubleXpDate: null,
    unlockedBadges: ['Khởi Nguyên Kỷ Luật'],
    collectedQuotes: [MYSTERY_QUOTES[0], MYSTERY_QUOTES[2]],
    chestHistory: [],
    habits,
    badHabits,
    habitLogs,
    urgeEvents,
    boss: {
      currentBossIndex: 0,
      currentHp: 215,
      defeatedBossIds: [],
      totalDamageDealt: 385,
      recentHits: [
        {
          id: 'h_init_1',
          label: 'Từ chối Trà sữa đêm (Phản đòn!)',
          damage: 65,
          isCrit: true,
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: 'h_init_2',
          label: 'Thiền định & Thở tĩnh tâm',
          damage: 45,
          isCrit: false,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    },
    rewards: [
      {
        id: 'rw_1',
        title: '1 Tập phim / Anime thư giãn không tội lỗi',
        emoji: '🎬',
        costCoins: 80,
        redeemedCount: 1,
        description: 'Tận hưởng trọn vẹn sau khi xong việc!',
      },
      {
        id: 'rw_2',
        title: 'Ly Cà phê Specialty / Matcha ngon',
        emoji: '🍵',
        costCoins: 110,
        redeemedCount: 0,
        description: 'Tự thưởng cho tuần kỷ luật rực rỡ.',
      },
      {
        id: 'rw_3',
        title: 'Mua 1 cuốn sách hoặc món đồ yêu thích',
        emoji: '🎁',
        costCoins: 280,
        redeemedCount: 0,
        description: 'Phần thưởng lớn từ Xu Kỷ Luật tích lũy.',
      },
    ],
    focusSessions: [
      {
        id: 'fs_1',
        date: getDateOffsetStr(2),
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        minutes: 25,
        label: 'Deep Work: Đọc & Ghi chú',
        xpEarned: 35,
        damageDealt: 50,
      },
      {
        id: 'fs_2',
        date: getDateOffsetStr(1),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        minutes: 45,
        label: 'Hoàn thành mục tiêu cốt lõi',
        xpEarned: 60,
        damageDealt: 90,
      },
    ],
    journals: {
      [getDateOffsetStr(1)]: {
        date: getDateOffsetStr(1),
        mood: 'fire',
        note: 'Từ chối lướt mạng lúc tối khuya và đi ngủ sớm, sáng nay đầu óc nhẹ hẳn!',
      },
    },
  };
}

export function createEmptyState(): AppState {
  return {
    version: 1,
    userName: 'Chiến Binh Mới',
    pactText:
      'Mỗi hành động nhỏ hôm nay là một phiếu bầu cho con người tôi muốn trở thành.',
    theme: 'obsidian',
    soundEnabled: true,
    totalXp: 0,
    coins: 50,
    chestsAvailable: 1,
    streakFreezes: 0,
    doubleXpDate: null,
    unlockedBadges: [],
    collectedQuotes: [],
    chestHistory: [],
    habits: [],
    badHabits: [],
    habitLogs: {},
    urgeEvents: [],
    boss: {
      currentBossIndex: 0,
      currentHp: BOSS_ROSTER[0].maxHp,
      defeatedBossIds: [],
      totalDamageDealt: 0,
      recentHits: [],
    },
    rewards: [
      {
        id: 'rw_default',
        title: '1 Giờ giải trí tự do',
        emoji: '🎮',
        costCoins: 80,
        redeemedCount: 0,
      },
    ],
    focusSessions: [],
    journals: {},
  };
}
