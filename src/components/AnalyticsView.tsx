import React, { useState } from 'react';
import type { AppState, MoodType, UrgeTrigger } from '../types';
import {
  MOOD_META,
  TRIGGER_META,
  analyzeShieldMetrics,
  computeCharacterStats,
  getDateOffsetStr,
  getTodayStr,
  isHabitDoneOnDate,
} from '../utils/gameLogic';

interface AnalyticsViewProps {
  state: AppState;
  onSaveJournal: (date: string, mood: MoodType, note: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  state,
  onSaveJournal,
}) => {
  const todayStr = getTodayStr();
  const existingJournal = state.journals[todayStr];
  const [mood, setMood] = useState<MoodType>(existingJournal?.mood || 'calm');
  const [note, setNote] = useState<string>(existingJournal?.note || '');
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    good: number;
    refusals: number;
  } | null>(null);

  const stats = computeCharacterStats(state);
  const shield = analyzeShieldMetrics(state);

  // Build SVG Radar Chart (5 axes)
  const axes = [
    { label: 'Sức bền', value: stats.vitality, color: '#10b981' },
    { label: 'Trí tuệ', value: stats.intellect, color: '#38bdf8' },
    { label: 'Ý chí', value: stats.willpower, color: '#f59e0b' },
    { label: 'Tập trung', value: stats.focus, color: '#a855f7' },
    { label: 'Kỷ luật', value: stats.discipline, color: '#22c55e' },
  ];

  const cx = 130;
  const cy = 125;
  const maxR = 82;
  const pointFor = (idx: number, val: number) => {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / axes.length;
    const r = (val / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((a, idx) => {
      const p = pointFor(idx, a.value);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  // Build 84-day heatmap (12 weeks x 7 days)
  const days84 = Array.from({ length: 84 }, (_, i) => {
    const offset = 83 - i;
    const d = getDateOffsetStr(offset);
    const log = state.habitLogs[d];
    const good = log
      ? state.habits.filter((h) => isHabitDoneOnDate(h, log)).length
      : 0;
    const refusals = state.urgeEvents.filter(
      (e) =>
        e.date === d &&
        (e.outcome === 'resisted' || e.outcome === 'sos_victory')
    ).length;
    return { date: d, good, refusals, score: good + refusals * 1.5 };
  });

  const getHeatColor = (score: number) => {
    if (score <= 0) return 'var(--bg-elevated)';
    if (score < 2.5) return 'rgba(16, 185, 129, 0.28)';
    if (score < 5) return 'rgba(16, 185, 129, 0.52)';
    if (score < 7.5) return 'rgba(16, 185, 129, 0.78)';
    return '#10b981';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Row 1: Radar Chart + Trigger Intelligence */}
      <div className="battle-grid">
        {/* Character Radar */}
        <section className="card" style={{ padding: 22 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>
            🧬 Chỉ Số Chiến Binh Kỷ Luật
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Mỗi nhóm thói quen & lần từ chối cám dỗ sẽ bồi đắp trực tiếp vào 5
            năng lực cốt lõi.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <svg width="260" height="250" viewBox="0 0 260 250">
              {[25, 50, 75, 100].map((ring) => {
                const pts = axes
                  .map((_, i) => {
                    const p = pointFor(i, ring);
                    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={ring}
                    points={pts}
                    fill="none"
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                    strokeDasharray={ring === 100 ? 'none' : '3 3'}
                  />
                );
              })}

              {axes.map((a, i) => {
                const outer = pointFor(i, 100);
                const lbl = pointFor(i, 124);
                return (
                  <g key={a.label}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="var(--border)"
                      strokeWidth="1"
                    />
                    <text
                      x={lbl.x}
                      y={lbl.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--text-muted)"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {a.label}
                    </text>
                  </g>
                );
              })}

              <polygon
                points={polygonPoints}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              {axes.map((a, i) => {
                const p = pointFor(i, a.value);
                return (
                  <circle
                    key={a.label}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill={a.color}
                    stroke="#0b0f19"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 165 }}>
              {axes.map((a) => (
                <div
                  key={a.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 10px',
                    borderRadius: 10,
                    background: 'var(--bg-elevated)',
                    fontSize: '0.84rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{a.label}</span>
                  <span className="mono" style={{ fontWeight: 800, color: a.color }}>
                    {a.value}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trigger & Time Intelligence */}
        <section className="card" style={{ padding: 22 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>
            🧠 Giải Mã Cơn Thèm & Điểm Yếu
          </h2>
          <div
            style={{
              padding: '11px 13px',
              borderRadius: 14,
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.83rem',
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            🔎 <strong>Chẩn đoán AI cục bộ:</strong> Tác nhân hay kích hoạt nhất
            là{' '}
            <strong>
              {TRIGGER_META[shield.topTrigger].emoji}{' '}
              {TRIGGER_META[shield.topTrigger].label}
            </strong>{' '}
            vào khung giờ <strong>{shield.peakBucket.label}</strong>. Tỷ lệ đứng
            vững của bạn hiện đạt{' '}
            <strong className="mono" style={{ color: 'var(--accent-good)' }}>
              {shield.resistanceRate}%
            </strong>
            !
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
            Thống kê theo Tác nhân (Thắng vs Trượt)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {(Object.keys(TRIGGER_META) as UrgeTrigger[]).map((t) => {
              const c = shield.triggerCounts[t];
              const total = c.wins + c.slips;
              const winPct = total > 0 ? Math.round((c.wins / total) * 100) : 0;
              return (
                <div key={t} style={{ fontSize: '0.8rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 3,
                    }}
                  >
                    <span>
                      {TRIGGER_META[t].emoji} {TRIGGER_META[t].label}
                    </span>
                    <span className="mono" style={{ color: 'var(--text-muted)' }}>
                      {c.wins} thắng / {c.slips} trượt
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: 6 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${total > 0 ? winPct : 0}%`,
                        background: 'var(--accent-shield)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Row 2: 84-Day Heatmap + Daily Micro-Journal */}
      <div className="battle-grid">
        {/* Heatmap */}
        <section className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800 }}>
              🗓️ Bản Đồ Kỷ Luật 84 Ngày Gần Nhất
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {hoveredDay
                ? `${hoveredDay.date}: ${hoveredDay.good} thói quen tốt • ${hoveredDay.refusals} lần từ chối`
                : 'Rê chuột vào ô để xem chi tiết'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(14, minmax(0, 1fr))',
              gap: 6,
            }}
          >
            {days84.map((d) => (
              <div
                key={d.date}
                onMouseEnter={() =>
                  setHoveredDay({
                    date: d.date,
                    good: d.good,
                    refusals: d.refusals,
                  })
                }
                title={`${d.date}: ${d.good} thói quen tốt, ${d.refusals} lần từ chối`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 6,
                  background: getHeatColor(d.score),
                  border:
                    d.date === todayStr
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'transform 0.12s ease',
                }}
              />
            ))}
          </div>
        </section>

        {/* Daily Mood & Micro-Journal */}
        <section className="card" style={{ padding: 22 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.12rem', fontWeight: 800 }}>
            📓 Nhật Ký Tinh Thần Hôm Nay
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Ghi lại tâm trạng & 1 bài học ngắn để hiểu nhịp năng lượng của bạn.
          </p>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(Object.keys(MOOD_META) as MoodType[]).map((m) => {
              const meta = MOOD_META[m];
              const active = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  className="btn"
                  onClick={() => setMood(m)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.78rem',
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

          <textarea
            className="input"
            rows={3}
            placeholder="Hôm nay bạn tự hào nhất về điều gì? Hoặc điều gì đã kích hoạt cơn thèm?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ resize: 'vertical', marginBottom: 10 }}
          />

          <button
            type="button"
            className="btn btn-good"
            onClick={() => onSaveJournal(todayStr, mood, note)}
          >
            Lưu Nhật Ký Hôm Nay
          </button>

          {Object.values(state.journals).length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Object.values(state.journals)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 3)
                .map((j) => (
                  <div
                    key={j.date}
                    style={{
                      padding: '8px 11px',
                      borderRadius: 11,
                      background: 'var(--bg-elevated)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span className="mono" style={{ color: 'var(--text-muted)', marginRight: 8 }}>
                      {j.date}
                    </span>
                    <span>{MOOD_META[j.mood].emoji} </span>
                    <span>{j.note || '(Chỉ ghi tâm trạng)'}</span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
