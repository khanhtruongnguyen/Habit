import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Coins,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
import type {
  BadHabit,
  DifficultyLevel,
  UrgeEvent,
  UrgeTrigger,
} from '../types';
import {
  DIFFICULTY_META,
  TRIGGER_META,
  formatMinutes,
  formatVND,
} from '../utils/gameLogic';

interface ShieldPanelProps {
  badHabits: BadHabit[];
  urgeEvents: UrgeEvent[];
  todayStr: string;
  onRefuseBadHabit: (bad: BadHabit, trigger?: UrgeTrigger) => void;
  onSlipBadHabit: (bad: BadHabit, trigger: UrgeTrigger) => void;
  onStartSosForHabit: (badHabitId: string) => void;
  onAddBadHabit: (bad: Omit<BadHabit, 'id' | 'createdAt'>) => void;
  onUpdateBadHabit: (bad: BadHabit) => void;
  onDeleteBadHabit: (id: string) => void;
}

const BAD_EMOJI_PRESETS = [
  '📵',
  '🧋',
  '🦉',
  '🛒',
  '🚬',
  '🎮',
  '🍔',
  '☕',
  '🎰',
  '💤',
  '🤬',
  '🍫',
];

export const ShieldPanel: React.FC<ShieldPanelProps> = ({
  badHabits,
  urgeEvents,
  todayStr,
  onRefuseBadHabit,
  onSlipBadHabit,
  onStartSosForHabit,
  onAddBadHabit,
  onUpdateBadHabit,
  onDeleteBadHabit,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBad, setEditingBad] = useState<BadHabit | null>(null);
  const [slipTarget, setSlipTarget] = useState<BadHabit | null>(null);
  const [slipTrigger, setSlipTrigger] = useState<UrgeTrigger>('stress');

  // Add / Edit form state
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📵');
  const [savedMoney, setSavedMoney] = useState(0);
  const [savedMinutes, setSavedMinutes] = useState(20);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [xpReward, setXpReward] = useState(DIFFICULTY_META.medium.xp + 5);
  const [coinReward, setCoinReward] = useState(DIFFICULTY_META.medium.coins + 2);
  const [defaultTrigger, setDefaultTrigger] = useState<UrgeTrigger>('boredom');
  const [motto, setMotto] = useState('');

  const openCreateModal = () => {
    setEditingBad(null);
    setTitle('');
    setEmoji('📵');
    setSavedMoney(0);
    setSavedMinutes(20);
    setDifficulty('medium');
    setXpReward(DIFFICULTY_META.medium.xp + 5);
    setCoinReward(DIFFICULTY_META.medium.coins + 2);
    setDefaultTrigger('boredom');
    setMotto('');
    setModalOpen(true);
  };

  const openEditModal = (b: BadHabit) => {
    setEditingBad(b);
    setTitle(b.title);
    setEmoji(b.emoji);
    setSavedMoney(b.savedMoneyPerRefusal);
    setSavedMinutes(b.savedMinutesPerRefusal);
    setDifficulty(b.difficulty);
    setXpReward(b.xpReward);
    setCoinReward(b.coinReward);
    setDefaultTrigger(b.defaultTrigger);
    setMotto(b.motto);
    setModalOpen(true);
  };

  const handleDifficultyChange = (nextDiff: DifficultyLevel) => {
    setDifficulty(nextDiff);
    setXpReward(DIFFICULTY_META[nextDiff].xp + 5);
    setCoinReward(DIFFICULTY_META[nextDiff].coins + 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Omit<BadHabit, 'id' | 'createdAt'> = {
      title: title.trim(),
      emoji: emoji.trim() || '📵',
      savedMoneyPerRefusal: Math.max(0, savedMoney),
      savedMinutesPerRefusal: Math.max(0, savedMinutes),
      xpReward: Math.max(0, xpReward),
      coinReward: Math.max(0, coinReward),
      difficulty,
      defaultTrigger,
      motto:
        motto.trim() ||
        'Cơn thèm chỉ là một làn sóng — đứng vững 90 giây là bạn thắng!',
    };

    if (editingBad) {
      onUpdateBadHabit({ ...editingBad, ...payload });
    } else {
      onAddBadHabit(payload);
    }
    setModalOpen(false);
    setEditingBad(null);
  };

  return (
    <section className="card" style={{ padding: 18 }}>
      {/* Header */}
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
                background: 'var(--accent-shield)',
                boxShadow: '0 0 12px var(--accent-shield)',
                flexShrink: 0,
              }}
            />
            <h2 style={{ margin: 0, fontSize: '1.14rem', fontWeight: 800 }}>
              Khiên Bản Lĩnh — Từ Chối Thói Quen Xấu
            </h2>
          </div>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            Mỗi lần bạn nói <strong>KHÔNG</strong> với cám dỗ là một chiến thắng
            thật sự — bấm nút để cộng Khiên & cứu thời gian, tiền bạc!
          </p>
        </div>

        <button
          type="button"
          className="btn btn-shield"
          onClick={openCreateModal}
          style={{ flexShrink: 0 }}
        >
          <Plus size={16} />
          <span>Thêm cám dỗ</span>
        </button>
      </div>

      {/* Bad Habit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {badHabits.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border)',
              borderRadius: 16,
            }}
          >
            <Shield size={28} style={{ opacity: 0.6, marginBottom: 8 }} />
            <div>
              Chưa có thói quen xấu nào cần theo dõi. Hãy thêm một thói quen để
              rèn bản lĩnh từ chối!
            </div>
          </div>
        ) : (
          badHabits.map((b) => {
            const events = urgeEvents.filter((e) => e.badHabitId === b.id);
            const wins = events.filter(
              (e) => e.outcome === 'resisted' || e.outcome === 'sos_victory'
            );
            const slips = events.filter((e) => e.outcome === 'slipped');
            const todayWins = wins.filter((e) => e.date === todayStr).length;
            const totalAttempts = wins.length + slips.length;
            const rate =
              totalAttempts > 0
                ? Math.round((wins.length / totalAttempts) * 100)
                : 100;

            const savedMoneyTotal = wins.length * b.savedMoneyPerRefusal;
            const savedMinsTotal = wins.length * b.savedMinutesPerRefusal;
            const diffMeta = DIFFICULTY_META[b.difficulty];

            return (
              <div
                key={b.id}
                className="card-interactive"
                style={{
                  borderRadius: 18,
                  padding: '14px',
                  background: 'var(--bg-elevated)',
                  border:
                    todayWins > 0
                      ? '1px solid rgba(245, 158, 11, 0.45)'
                      : '1px solid var(--border)',
                }}
              >
                {/* Top row: Icon + Title + Edit/Delete */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {b.emoji}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem' }}>
                        {b.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.77rem',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                          marginTop: 3,
                        }}
                      >
                        “{b.motto}”
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => openEditModal(b)}
                      title="Chỉnh sửa thông số thói quen xấu"
                      style={{ padding: 6, color: 'var(--text-muted)' }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => onDeleteBadHabit(b.id)}
                      title="Xóa"
                      style={{ padding: 6, color: 'var(--text-dim)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Metrics Strip */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 11,
                    marginBottom: 12,
                  }}
                >
                  <span
                    className="pill mono"
                    style={{
                      color: '#fbbf24',
                      borderColor: 'rgba(251,191,36,0.35)',
                    }}
                  >
                    🛡️ Tổng từ chối: {wins.length} lần
                    {todayWins > 0 ? ` (Hôm nay +${todayWins})` : ''}
                  </span>
                  <span
                    className="pill mono"
                    style={{
                      color:
                        rate >= 75
                          ? 'var(--accent-good)'
                          : 'var(--accent-shield)',
                    }}
                  >
                    Kháng cự: {rate}%
                  </span>
                  {savedMoneyTotal > 0 && (
                    <span className="pill mono" style={{ color: '#22c55e' }}>
                      <Coins size={12} /> Cứu {formatVND(savedMoneyTotal)}
                    </span>
                  )}
                  {savedMinsTotal > 0 && (
                    <span className="pill mono" style={{ color: '#38bdf8' }}>
                      <Clock size={12} /> Cứu {formatMinutes(savedMinsTotal)}
                    </span>
                  )}
                  <span
                    className="pill mono"
                    style={{ color: diffMeta.color }}
                  >
                    +{b.xpReward} XP
                  </span>
                  <span className="pill mono" style={{ color: '#fbbf24' }}>
                    🪙 +{b.coinReward} Xu
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-shield"
                    onClick={() => onRefuseBadHabit(b)}
                    style={{ flex: '1 1 200px', padding: '10px 14px' }}
                  >
                    <ShieldCheck size={17} />
                    <span>TÔI ĐÃ TỪ CHỐI! (+1 Khiên)</span>
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => onStartSosForHabit(b.id)}
                    style={{
                      padding: '10px 12px',
                      borderColor: 'rgba(239,68,68,0.4)',
                      color: '#fb7185',
                    }}
                    title="Mở chế độ vượt qua cơn thèm 90 giây"
                  >
                    <Waves size={15} />
                    <span>SOS</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger-ghost"
                    onClick={() => {
                      setSlipTarget(b);
                      setSlipTrigger(b.defaultTrigger);
                    }}
                    style={{ padding: '10px 11px', fontSize: '0.8rem' }}
                    title="Ghi nhận trung thực nếu lỡ vi phạm để phân tích nguyên nhân"
                  >
                    <AlertTriangle size={14} />
                    <span>Lỡ trượt</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Honest Slip Modal */}
      {slipTarget && (
        <div className="modal-backdrop" onClick={() => setSlipTarget(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                💛 Ghi Nhận Trung Thực — Không Phán Xét
              </h3>
              <button
                type="button"
                className="btn"
                onClick={() => setSlipTarget(null)}
                style={{ padding: 6 }}
              >
                <X size={16} />
              </button>
            </div>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              Một lần vấp ngã không xóa đi hàng chục lần bạn đã đứng vững. Chọn
              nguyên nhân khiến bạn trượt <strong>{slipTarget.title}</strong> để
              hệ thống giúp bạn phòng tránh lần sau:
            </p>

            <div className="form-2-col" style={{ marginBottom: 16 }}>
              {(Object.keys(TRIGGER_META) as UrgeTrigger[]).map((t) => {
                const m = TRIGGER_META[t];
                const active = slipTrigger === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className="btn"
                    onClick={() => setSlipTrigger(t)}
                    style={{
                      justifyContent: 'flex-start',
                      borderColor: active
                        ? 'var(--accent-shield)'
                        : 'var(--border)',
                      background: active
                        ? 'rgba(245,158,11,0.14)'
                        : 'var(--bg-elevated)',
                    }}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-elevated)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginBottom: 16,
              }}
            >
              💡 <strong>Mẹo cho lần tới:</strong>{' '}
              {TRIGGER_META[slipTrigger].tip}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setSlipTarget(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onSlipBadHabit(slipTarget, slipTrigger);
                  setSlipTarget(null);
                }}
              >
                Lưu & Làm Lại Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Bad Habit Modal */}
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
                {editingBad
                  ? '✏️ Chỉnh Sửa Thói Quen Xấu'
                  : '🛡️ Thêm Thói Quen Xấu Cần Từ Chối'}
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
                  {BAD_EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className="btn"
                      onClick={() => setEmoji(em)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '1.1rem',
                        borderColor:
                          emoji === em ? 'var(--accent-shield)' : 'var(--border)',
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
                  Tên cám dỗ / Thói quen xấu *
                </label>
                <input
                  className="input"
                  placeholder="Ví dụ: Cắn móng tay, Uống nước ngọt có ga..."
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
                    Mức độ cám dỗ (gợi ý XP & Xu)
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
                          {DIFFICULTY_META[k].label} ({DIFFICULTY_META[k].xp + 5}{' '}
                          XP / {DIFFICULTY_META[k].coins + 2} Xu)
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Tác nhân hay gặp
                  </label>
                  <select
                    className="input"
                    value={defaultTrigger}
                    onChange={(e) =>
                      setDefaultTrigger(e.target.value as UrgeTrigger)
                    }
                    style={{ marginTop: 5 }}
                  >
                    {(Object.keys(TRIGGER_META) as UrgeTrigger[]).map((t) => (
                      <option key={t} value={t}>
                        {TRIGGER_META[t].emoji} {TRIGGER_META[t].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-2-col">
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    🪙 Xu thưởng mỗi lần từ chối
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
                    ⚡ XP thưởng mỗi lần từ chối
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
                    Tiền tiết kiệm / 1 lần từ chối (VNĐ)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step={5000}
                    value={savedMoney}
                    onChange={(e) => setSavedMoney(Number(e.target.value) || 0)}
                    style={{ marginTop: 5 }}
                  />
                </div>
                <div>
                  <label
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Thời gian cứu được / lần (phút)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step={5}
                    value={savedMinutes}
                    onChange={(e) =>
                      setSavedMinutes(Number(e.target.value) || 0)
                    }
                    style={{ marginTop: 5 }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  Câu thần chú nhắc bản thân
                </label>
                <input
                  className="input"
                  placeholder="Ví dụ: Đừng đánh đổi mục tiêu dài hạn lấy 5 phút thỏa mãn."
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  style={{ marginTop: 5 }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-shield"
                style={{ padding: 12 }}
              >
                {editingBad ? <Check size={16} /> : <ShieldCheck size={16} />}
                <span>
                  {editingBad
                    ? 'Lưu Thay Đổi'
                    : 'Kích Hoạt Khiên Theo Dõi'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
