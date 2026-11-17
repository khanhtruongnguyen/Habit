import React, { useState } from 'react';
import { Award, Gift, Shield, Sparkles, Swords, Zap } from 'lucide-react';
import type { AppState, ChestDropRecord } from '../types';
import { BOSS_ROSTER } from '../utils/gameLogic';

interface BossArenaProps {
  state: AppState;
  bossShaking: boolean;
  onOpenChest: () => ChestDropRecord | null;
  onActivateDoubleXp: () => void;
}

export const BossArena: React.FC<BossArenaProps> = ({
  state,
  bossShaking,
  onOpenChest,
  onActivateDoubleXp,
}) => {
  const [lastDrop, setLastDrop] = useState<ChestDropRecord | null>(null);

  const bossDef =
    BOSS_ROSTER[state.boss.currentBossIndex % BOSS_ROSTER.length];
  const hpPct = Math.max(
    0,
    Math.min(100, Math.round((state.boss.currentHp / bossDef.maxHp) * 100))
  );

  const handleChestClick = () => {
    const drop = onOpenChest();
    if (drop) setLastDrop(drop);
  };

  return (
    <div className="battle-grid">
      {/* Left: Boss Battle Card */}
      <section className="card" style={{ padding: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Swords size={20} style={{ color: '#f43f5e' }} />
            <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>
              Đấu Trường Boss Cám Dỗ
            </h2>
          </div>
          <span className="pill mono" style={{ color: '#fbbf24' }}>
            Tổng DMG: {state.boss.totalDamageDealt}
          </span>
        </div>

        {/* Boss Showcase */}
        <div
          style={{
            borderRadius: 20,
            padding: 20,
            background:
              'radial-gradient(circle at top, rgba(244,63,94,0.16), var(--bg-elevated))',
            border: '1px solid rgba(244,63,94,0.32)',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          <div
            className={bossShaking ? 'boss-shaking' : ''}
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              marginBottom: 10,
              filter: 'drop-shadow(0 10px 18px rgba(244,63,94,0.35))',
            }}
          >
            {bossDef.emoji}
          </div>

          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {bossDef.name}
          </div>
          <div
            style={{
              fontSize: '0.84rem',
              color: '#fb7185',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {bossDef.title}
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              margin: '10px auto 14px',
              maxWidth: 460,
              lineHeight: 1.5,
            }}
          >
            {bossDef.lore}
          </p>

          {/* Boss HP Bar */}
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                marginBottom: 6,
              }}
            >
              <span style={{ fontWeight: 700, color: '#fb7185' }}>
                HP Của Boss
              </span>
              <span className="mono" style={{ fontWeight: 700 }}>
                {state.boss.currentHp} / {bossDef.maxHp} HP ({hpPct}%)
              </span>
            </div>
            <div className="progress-track" style={{ height: 14 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${hpPct}%`,
                  background: 'linear-gradient(90deg, #ef4444, #f97316)',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 12,
              fontSize: '0.78rem',
            }}
          >
            <span className="pill">🎯 Điểm yếu: {bossDef.weakness}</span>
            <span className="pill" style={{ color: '#fbbf24' }}>
              🏆 Thưởng hạ gục: +{bossDef.rewardCoins} Xu & {bossDef.rewardChests} Rương
            </span>
          </div>
        </div>

        {/* Combat Tips & Recent Hits */}
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}
        >
          ⚔️ Hoàn thành <strong>Thói quen tốt</strong> để đánh thường •{' '}
          <strong>Từ chối thói quen xấu</strong> để tung{' '}
          <strong style={{ color: '#fbbf24' }}>Phản Đòn Chí Mạng (x1.5 DMG)</strong>!
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
            Nhật ký giao chiến gần đây
          </div>
          {state.boss.recentHits.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Chưa có đòn đánh nào. Hãy hoàn thành 1 thói quen hoặc từ chối 1 cám
              dỗ!
            </div>
          ) : (
            state.boss.recentHits.slice(0, 5).map((hit) => (
              <div
                key={hit.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 11,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  fontSize: '0.82rem',
                }}
              >
                <span>{hit.label}</span>
                <span
                  className="mono"
                  style={{
                    fontWeight: 800,
                    color: hit.isCrit ? '#fbbf24' : '#fb7185',
                  }}
                >
                  {hit.isCrit ? 'CRIT ' : ''}-{hit.damage} HP
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Right: Mystery Chests, Buffs & Trophy Case */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Mystery Loot Chest */}
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={20} style={{ color: 'var(--accent-purple)' }} />
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                Rương Kỷ Luật (Dopamine Lành Mạnh)
              </h2>
            </div>
            <span className="pill mono" style={{ color: 'var(--accent-purple)' }}>
              Đang có: {state.chestsAvailable} rương
            </span>
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              margin: '0 0 14px',
              lineHeight: 1.5,
            }}
          >
            Mỗi 5 hành động kỷ luật hoặc khi hạ Boss bạn sẽ nhận được 1 Rương Bí
            Ẩn chứa Xu thưởng, Khiên Đóng Băng Chuỗi, XP hoặc Cuộn Bí Kíp!
          </p>

          <button
            type="button"
            className="btn btn-primary"
            disabled={state.chestsAvailable <= 0}
            onClick={handleChestClick}
            style={{ width: '100%', padding: 13, fontSize: '0.96rem' }}
          >
            <Sparkles size={18} />
            <span>
              {state.chestsAvailable > 0
                ? `MỞ RƯƠNG NGAY (${state.chestsAvailable} rương)`
                : 'Hết rương — Hãy rèn thêm thói quen để nhận rương!'}
            </span>
          </button>

          {lastDrop && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 16,
                background:
                  'linear-gradient(135deg, rgba(168,85,247,0.16), rgba(56,189,248,0.14))',
                border: '1px solid rgba(168,85,247,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 34 }}>{lastDrop.emoji}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  {lastDrop.title}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}
                >
                  {lastDrop.detail}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Buffs & Badges */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1.02rem', fontWeight: 800 }}>
            🎒 Túi Trang Bị & Danh Hiệu
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🧊 Khiên Đóng Băng
              </div>
              <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 4 }}>
                {state.streakFreezes}
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ⚡ Thuốc x2 XP (40 Xu)
              </div>
              <button
                type="button"
                className="btn"
                onClick={onActivateDoubleXp}
                disabled={state.coins < 40}
                style={{ marginTop: 6, padding: '6px 10px', fontSize: '0.76rem' }}
              >
                <Zap size={13} />
                <span>Kích hoạt hôm nay</span>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
            Huy hiệu đã mở khóa ({state.unlockedBadges.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
            {state.unlockedBadges.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Hạ gục Boss để sưu tầm huy hiệu danh giá!
              </span>
            ) : (
              state.unlockedBadges.map((b) => (
                <span
                  key={b}
                  className="pill"
                  style={{
                    color: '#fbbf24',
                    borderColor: 'rgba(251,191,36,0.35)',
                  }}
                >
                  <Award size={13} /> {b}
                </span>
              ))
            )}
          </div>

          {/* Collected Quotes */}
          {state.collectedQuotes.length > 0 && (
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
                📜 Bí Kíp Tâm Pháp Đã Sưu Tầm ({state.collectedQuotes.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {state.collectedQuotes.slice(-3).map((q, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 12,
                      background: 'var(--bg-elevated)',
                      borderLeft: '3px solid var(--accent-purple)',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      color: 'var(--text-muted)',
                    }}
                  >
                    “{q}”
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Boss Progression Preview */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 10 }}>
            <Shield size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Lộ Trình Boss Cám Dỗ
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BOSS_ROSTER.map((b, idx) => {
              const defeated = state.boss.defeatedBossIds.includes(b.id);
              const isCurrent =
                state.boss.currentBossIndex % BOSS_ROSTER.length === idx;
              return (
                <div
                  key={b.id}
                  className="pill"
                  style={{
                    padding: '6px 10px',
                    borderColor: isCurrent
                      ? '#f43f5e'
                      : defeated
                      ? 'var(--accent-good)'
                      : 'var(--border)',
                    color: isCurrent
                      ? '#fb7185'
                      : defeated
                      ? 'var(--accent-good)'
                      : 'var(--text-muted)',
                  }}
                >
                  <span>{b.emoji}</span>
                  <span>{b.name}</span>
                  {defeated && <span>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
