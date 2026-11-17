import React, { useState } from 'react';
import {
  Check,
  Flame,
  Link2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import type {
  DailyHabitLog,
  DifficultyLevel,
  Habit,
  HabitCategory,
} from '../types';
import {
  CATEGORY_META,
  DIFFICULTY_META,
  getHabitStreak,
  isHabitDoneOnDate,
} from '../utils/gameLogic';

interface HabitPanelProps {
  habits: Habit[];
  logs: Record<string, DailyHabitLog>;
  todayStr: string;
  onIncrementHabit: (habit: Habit) => void;
  onDecrementHabit: (habit: Habit) => void;
  onMiniWinHabit: (habit: Habit) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onUpdateHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
}

const EMOJI_PRESETS = [
  '💧',
  '📖',
  '🏋️',
  '🧘',
  '⚡',
  '📒',
  '🥗',
  '🏃',
  '✍️',
  '🎯',
  '🛌',
  '🎸',
];

export const HabitPanel: React.FC<HabitPanelProps> = ({
  habits,
  logs,
  todayStr,
  onIncrementHabit,
  onDecrementHabit,
  onMiniWinHabit,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  const [filterCat, setFilterCat] = useState<'all' | HabitCategory>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [category, setCategory] = useState<HabitCategory>('discipline');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [xpReward, setXpReward] = useState(DIFFICULTY_META.medium.xp);
  const [coinReward, setCoinReward] = useState(DIFFICULTY_META.medium.coins);
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState('lần');
  const [miniVersion, setMiniVersion] = useState('');
  const [stackTrigger, setStackTrigger] = useState('');

  const todayLog = logs[todayStr] || {
    date: todayStr,
    counts: {},
    miniWins: {},
  };

  const completedToday = habits.filter((h) =>
    isHabitDoneOnDate(h, todayLog)
  ).length;
  const pct =
    habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const filtered =
    filterCat === 'all'
      ? habits
      : habits.filter((h) => h.category === filterCat);

  const openCreateModal = () => {
    setEditingHabit(null);
    setTitle('');
    setEmoji('🎯');
    setCategory('discipline');
    setDifficulty('medium');
    setXpReward(DIFFICULTY_META.medium.xp);
    setCoinReward(DIFFICULTY_META.medium.coins);
    setTargetCount(1);
    setUnit('lần');
    setMiniVersion('');
    setStackTrigger('');
    setModalOpen(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabit(h);
    setTitle(h.title);
    setEmoji(h.emoji);
    setCategory(h.category);
    setDifficulty(h.difficulty);
    setXpReward(h.xpReward);
    setCoinReward(h.coinReward);
    setTargetCount(h.targetCount);
    setUnit(h.unit);
    setMiniVersion(h.miniVersion);
    setStackTrigger(h.stackTrigger || '');
    setModalOpen(true);
  };

  const handleDifficultyChange = (nextDiff: DifficultyLevel) => {
    setDifficulty(nextDiff);
    setXpReward(DIFFICULTY_META[nextDiff].xp);
    setCoinReward(DIFFICULTY_META[nextDiff].coins);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload: Omit<Habit, 'id' | 'createdAt'> = {
      title: title.trim(),
      emoji: emoji.trim() || '🎯',
      category,
      targetCount: Math.max(1, targetCount),
      unit: unit.trim() || 'lần',
      xpReward: Math.max(0, xpReward),
      coinReward: Math.max(0, coinReward),
      difficulty,
      miniVersion:
        miniVersion.trim() || 'Làm phiên bản siêu nhỏ trong đúng 2 phút',
      stackTrigger: stackTrigger.trim() || undefined,
    };

    if (editingHabit) {
      onUpdateHabit({ ...editingHabit, ...payload });
    } else {
      onAddHabit(payload);
    }
    setModalOpen(false);
    setEditingHabit(null);
  };

  return (
    <section className="card" style={{ padding: 18 }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--accent-good)',
                boxShadow: '0 0 12px var(--accent-good)',
                flexShrink: 0,
              }}
            />
            <h2 style={{ margin: 0, fontSize: '1.14rem', fontWeight: 800 }}>
              Thói Quen Tốt — Rèn Luyện
            </h2>
          </div>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            Hoàn thành mục tiêu hoặc dùng <strong>Quy tắc 2 phút</strong> khi
            năng lượng thấp để giữ chuỗi.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-good"
          onClick={openCreateModal}
          style={{ flexShrink: 0 }}
        >
          <Plus size={16} />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Progress Summary */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 7,
            fontSize: '0.84rem',
          }}
        >
          <span style={{ fontWeight: 600 }}>
            Tiến độ hôm nay:{' '}
            <span className="mono" style={{ color: 'var(--accent-good)' }}>
              {completedToday}/{habits.length}
            </span>
          </span>
          <span
            className="mono"
            style={{
              fontWeight: 700,
              color: pct === 100 ? '#fbbf24' : 'var(--accent-good)',
            }}
          >
            {pct}% {pct === 100 && habits.length > 0 ? '🏆 QUÉT SẠCH!' : ''}
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background:
                'linear-gradient(90deg, var(--accent-good), #34d399)',
            }}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() => setFilterCat('all')}
          style={{
            padding: '5px 10px',
            fontSize: '0.76rem',
            borderColor:
              filterCat === 'all' ? 'var(--accent-good)' : 'var(--border)',
            color:
              filterCat === 'all' ? 'var(--accent-good)' : 'var(--text-muted)',
          }}
        >
          Tất cả ({habits.length})
        </button>
        {(Object.keys(CATEGORY_META) as HabitCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = filterCat === cat;
          return (
            <button
              key={cat}
              type="button"
              className="btn"
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '5px 10px',
                fontSize: '0.76rem',
                borderColor: active ? meta.color : 'var(--border)',
                color: active ? meta.color : 'var(--text-muted)',
              }}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Habit List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border)',
              borderRadius: 16,
            }}
          >
            <Sparkles size={28} style={{ opacity: 0.6, marginBottom: 8 }} />
            <div>Chưa có thói quen nào trong nhóm này. Hãy thêm mới!</div>
          </div>
        ) : (
          filtered.map((h) => {
            const count = todayLog.counts[h.id] || 0;
            const isMini = !!todayLog.miniWins[h.id];
            const isDone = count >= h.targetCount;
            const streak = getHabitStreak(h, logs);
            const catMeta = CATEGORY_META[h.category];
            const diffMeta = DIFFICULTY_META[h.difficulty];

            return (
              <div
                key={h.id}
                className="card-interactive"
                style={{
                  borderRadius: 16,
                  padding: '13px 14px',
                  border: `1px solid ${
                    isDone
                      ? 'rgba(16, 185, 129, 0.45)'
                      : isMini
                      ? 'rgba(56, 189, 248, 0.4)'
                      : 'var(--border)'
                  }`,
                  background: isDone
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'var(--bg-elevated)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      flex: '1 1 220px',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {h.emoji}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.94rem',
                          textDecoration: isDone ? 'line-through' : 'none',
                          opacity: isDone ? 0.85 : 1,
                        }}
                      >
                        {h.title}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                          marginTop: 5,
                        }}
                      >
                        <span
                          className="pill"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            color: catMeta.color,
                          }}
                        >
                          {catMeta.emoji} {catMeta.label}
                        </span>
                        <span
                          className="pill mono"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            color: diffMeta.color,
                          }}
                        >
                          +{h.xpReward} XP
                        </span>
                        <span
                          className="pill mono"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            color: '#fbbf24',
                          }}
                        >
                          🪙 +{h.coinReward} Xu
                        </span>
                        {streak > 0 && (
                          <span
                            className="pill mono"
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              color: '#fb923c',
                            }}
                          >
                            <Flame size={11} /> {streak}d
                          </span>
                        )}
                        {h.targetCount > 1 && (
                          <span
                            className="mono"
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {count}/{h.targetCount} {h.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    {count > 0 && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => onDecrementHabit(h)}
                        title="Giảm 1 bước"
                        style={{
                          padding: '7px 9px',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        -1
                      </button>
                    )}

                    <button
                      type="button"
                      className={`btn ${isDone ? 'btn-good' : ''}`}
                      onClick={() => onIncrementHabit(h)}
                      disabled={isDone}
                      style={{
                        padding: '8px 13px',
                        borderColor: isDone
                          ? 'transparent'
                          : 'rgba(16,185,129,0.45)',
                        color: isDone ? '#fff' : 'var(--accent-good)',
                      }}
                    >
                      <Check size={16} />
                      <span>
                        {isDone
                          ? 'Đã xong'
                          : h.targetCount > 1
                          ? `+1 ${h.unit}`
                          : 'Hoàn thành'}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => openEditModal(h)}
                      title="Chỉnh sửa thông số thói quen"
                      style={{
                        padding: '7px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => onDeleteHabit(h.id)}
                      title="Xóa thói quen"
                      style={{
                        padding: '7px',
                        color: 'var(--text-dim)',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Habit Stacking + 2-Minute Mini Win Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginTop: 9,
                    paddingTop: 8,
                    borderTop: '1px dashed var(--border)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {h.stackTrigger ? (
                      <>
                        <Link2
                          size={12}
                          style={{ color: 'var(--accent-primary)' }}
                        />
                        <span>Neo: {h.stackTrigger}</span>
                      </>
                    ) : (
                      <span>⚡ Bản 2 phút: {h.miniVersion}</span>
                    )}
                  </div>

                  {!isDone && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => onMiniWinHabit(h)}
                      disabled={isMini}
                      title={`Bản 2 phút: ${h.miniVersion}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.73rem',
                        color: isMini
                          ? 'var(--accent-primary)'
                          : 'var(--text-muted)',
                        borderColor: isMini
                          ? 'var(--accent-primary)'
                          : 'var(--border)',
                      }}
                    >
                      <Zap size={12} />
                      <span>{isMini ? 'Đã giữ chuỗi (2p)' : 'Bản 2 phút'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Good Habit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {editingHabit
                  ? '✏️ Chỉnh Sửa Thói Quen Tốt'
                  : '✨ Tạo Thói Quen Tốt Mới'}
              </h3>
              <button
                type="button"
                className="btn"
                onClick={() => setModalOpen(false)}
                style={{ padding: 6 }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 13 }}
            >
              <div>
                <label
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  Biểu tượng
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginTop: 6,
                  }}
                >
                  {EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className="btn"
                      onClick={() => setEmoji(em)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '1.1rem',
                        borderColor:
                          emoji === em ? 'var(--accent-good)' : 'var(--border)',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  Tên thói quen *
                </label>
                <input
                  className="input"
                  placeholder="Ví dụ: Học tiếng Anh 20 phút..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ marginTop: 5 }}
                />
              </div>

              <div className="form-2-col">
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Lĩnh vực
                  </label>
                  <select
                    className="input"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as HabitCategory)
                    }
                    style={{ marginTop: 5 }}
                  >
                    {(Object.keys(CATEGORY_META) as HabitCategory[]).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_META[k].emoji} {CATEGORY_META[k].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Độ khó (gợi ý XP & Xu)
                  </label>
                  <select
                    className="input"
                    value={difficulty}
                    onChange={(e) =>
                      handleDifficultyChange(e.target.value as DifficultyLevel)
                    }
                    style={{ marginTop: 5 }}
                  >
                    {(Object.keys(DIFFICULTY_META) as DifficultyLevel[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {DIFFICULTY_META[k].label} ({DIFFICULTY_META[k].xp}{' '}
                          XP / {DIFFICULTY_META[k].coins} Xu)
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="form-2-col">
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    🪙 Số Xu nhận được
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={500}
                    value={coinReward}
                    onChange={(e) =>
                      setCoinReward(Math.max(0, Number(e.target.value) || 0))
                    }
                    style={{ marginTop: 5 }}
                  />
                </div>
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    ⚡ Số XP nhận được
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={1000}
                    value={xpReward}
                    onChange={(e) =>
                      setXpReward(Math.max(0, Number(e.target.value) || 0))
                    }
                    style={{ marginTop: 5 }}
                  />
                </div>
              </div>

              <div className="form-2-col">
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Số lần / ngày
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={50}
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value) || 1)}
                    style={{ marginTop: 5 }}
                  />
                </div>
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Đơn vị
                  </label>
                  <input
                    className="input"
                    placeholder="lần, ly, trang..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ marginTop: 5 }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  Quy tắc 2 phút (khi quá mệt vẫn làm được)
                </label>
                <input
                  className="input"
                  placeholder="Ví dụ: Mở sách đọc 1 trang hoặc nghe 1 đoạn ngắn"
                  value={miniVersion}
                  onChange={(e) => setMiniVersion(e.target.value)}
                  style={{ marginTop: 5 }}
                />
              </div>

              <div>
                <label
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  Neo thói quen (tùy chọn)
                </label>
                <input
                  className="input"
                  placeholder="Ví dụ: Ngay sau khi đánh răng buổi sáng"
                  value={stackTrigger}
                  onChange={(e) => setStackTrigger(e.target.value)}
                  style={{ marginTop: 5 }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-good"
                style={{ padding: 12 }}
              >
                {editingHabit ? <Check size={16} /> : <Plus size={16} />}
                <span>
                  {editingHabit ? 'Lưu Thay Đổi' : 'Tạo Thói Quen'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
