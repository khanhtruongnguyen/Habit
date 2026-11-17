import React from 'react';
import {
  BarChart3,
  Cloud,
  CloudOff,
  Flame,
  Gift,
  Palette,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Swords,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { AppState, TabId, ThemeId } from '../types';
import type { GistConfig } from '../utils/gistSync';
import {
  getGlobalActiveStreak,
  getLevelInfo,
  getTodayStr,
} from '../utils/gameLogic';

interface HeaderHUDProps {
  state: AppState;
  gistConfig: GistConfig;
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onToggleSound: () => void;
  onChangeTheme: (theme: ThemeId) => void;
  onOpenSos: () => void;
}

const THEMES: { id: ThemeId; label: string; dot: string }[] = [
  { id: 'obsidian', label: 'Hắc Diện', dot: '#10b981' },
  { id: 'cyber', label: 'Cyber Neon', dot: '#e879f9' },
  { id: 'matcha', label: 'Zen Matcha', dot: '#34d399' },
  { id: 'paper', label: 'Giấy Sáng', dot: '#0284c7' },
];

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  state,
  gistConfig,
  activeTab,
  onSelectTab,
  onToggleSound,
  onChangeTheme,
  onOpenSos,
}) => {
  const lvl = getLevelInfo(state.totalXp);
  const streak = getGlobalActiveStreak(state);
  const isDoubleXp = state.doubleXpDate === getTodayStr();

  const cycleTheme = () => {
    const idx = THEMES.findIndex((t) => t.id === state.theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    onChangeTheme(next.id);
  };

  const currentTheme = THEMES.find((t) => t.id === state.theme) || THEMES[0];

  const tabs: {
    id: TabId;
    label: string;
    mobileLabel: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'today',
      label: 'Chiến trường',
      mobileLabel: 'Hôm nay',
      icon: <Sparkles size={17} />,
    },
    {
      id: 'boss',
      label: 'Boss & Rương',
      mobileLabel: 'Boss',
      icon: <Swords size={17} />,
      badge: state.chestsAvailable > 0 ? state.chestsAvailable : undefined,
    },
    {
      id: 'focus',
      label: 'Tập trung',
      mobileLabel: 'Tập trung',
      icon: <Timer size={17} />,
    },
    {
      id: 'analytics',
      label: 'Phân tích',
      mobileLabel: 'Phân tích',
      icon: <BarChart3 size={17} />,
    },
    {
      id: 'shop',
      label: 'Cửa hàng & Đồng bộ',
      mobileLabel: 'Hồ sơ',
      icon: <ShoppingBag size={17} />,
    },
  ];

  const isGistConfigured = Boolean(gistConfig.token && gistConfig.gistId);

  return (
    <>
      <header style={{ marginBottom: 16 }}>
        {/* Top Character Command Bar */}
        <div
          className="card"
          style={{
            padding: '13px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Left: Avatar + Level + XP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 230,
              flex: '1 1 280px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                background:
                  'linear-gradient(135deg, var(--accent-good), var(--accent-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                boxShadow: '0 8px 20px -6px var(--accent-good-glow)',
                flexShrink: 0,
              }}
            >
              {lvl.rankIcon}
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                  {state.userName}
                </span>
                <span
                  className="pill"
                  style={{
                    color: 'var(--accent-primary)',
                    borderColor: 'rgba(56,189,248,0.35)',
                  }}
                >
                  Lv.{lvl.level} • {lvl.rankTitle}
                </span>
                {isDoubleXp && (
                  <span
                    className="pill"
                    style={{
                      color: '#f59e0b',
                      borderColor: 'rgba(245,158,11,0.45)',
                    }}
                  >
                    ⚡ x2 XP
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  marginTop: 6,
                }}
              >
                <div className="progress-track" style={{ height: 8, flex: 1 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${lvl.progressPct}%`,
                      background:
                        'linear-gradient(90deg, var(--accent-good), var(--accent-primary))',
                    }}
                  />
                </div>
                <span
                  className="mono"
                  style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                >
                  {lvl.xpInLevel}/{lvl.xpForNext} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right: Resources & Quick Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              flexWrap: 'wrap',
            }}
          >
            <div
              className="pill"
              title="Chuỗi ngày hoạt động liên tiếp"
              style={{
                padding: '6px 10px',
                color: '#fb923c',
                borderColor: 'rgba(251,146,60,0.3)',
              }}
            >
              <Flame size={14} />
              <span className="mono">{streak}d</span>
            </div>

            <div
              className="pill"
              title="Xu Kỷ Luật dùng để đổi thưởng"
              style={{
                padding: '6px 10px',
                color: '#fbbf24',
                borderColor: 'rgba(251,191,36,0.3)',
              }}
            >
              <span>🪙</span>
              <span className="mono">{state.coins}</span>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => onSelectTab('boss')}
              title="Rương Kỷ Luật đang chờ mở"
              style={{
                padding: '6px 10px',
                borderColor:
                  state.chestsAvailable > 0
                    ? 'rgba(168,85,247,0.6)'
                    : 'var(--border)',
                color:
                  state.chestsAvailable > 0
                    ? 'var(--accent-purple)'
                    : 'var(--text-muted)',
              }}
            >
              <Gift size={14} />
              <span className="mono">{state.chestsAvailable}</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => onSelectTab('shop')}
              title={
                isGistConfigured
                  ? 'Đồng bộ GitHub Gist đã kết nối'
                  : 'Thiết lập đồng bộ GitHub Gist'
              }
              style={{
                padding: '6px 10px',
                borderColor:
                  gistConfig.lastSyncStatus === 'error'
                    ? 'rgba(239,68,68,0.5)'
                    : isGistConfigured
                    ? 'rgba(16,185,129,0.45)'
                    : 'var(--border)',
                color:
                  gistConfig.lastSyncStatus === 'error'
                    ? 'var(--accent-danger)'
                    : isGistConfigured
                    ? 'var(--accent-good)'
                    : 'var(--text-muted)',
              }}
            >
              {gistConfig.lastSyncStatus === 'syncing' ? (
                <RefreshCw size={14} />
              ) : isGistConfigured ? (
                <Cloud size={14} />
              ) : (
                <CloudOff size={14} />
              )}
              <span style={{ fontSize: '0.75rem' }}>Gist</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={cycleTheme}
              title={`Đổi giao diện (Hiện tại: ${currentTheme.label})`}
              style={{ padding: '7px 10px' }}
            >
              <Palette size={14} style={{ color: currentTheme.dot }} />
              <span style={{ fontSize: '0.76rem' }}>{currentTheme.label}</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={onToggleSound}
              title={state.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              style={{ padding: '7px 9px' }}
            >
              {state.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            <button
              type="button"
              className="btn btn-sos"
              onClick={onOpenSos}
              style={{ padding: '8px 13px', fontWeight: 700 }}
            >
              <ShieldAlert size={15} />
              <span>SOS Cơn Thèm</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-tabs">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                className="btn"
                style={{
                  padding: '9px 15px',
                  borderRadius: 14,
                  whiteSpace: 'nowrap',
                  background: active
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(56,189,248,0.22))'
                    : 'var(--bg-card)',
                  borderColor: active ? 'var(--accent-good)' : 'var(--border)',
                  color: active ? 'var(--text-main)' : 'var(--text-muted)',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className="mono"
                    style={{
                      background: 'var(--accent-purple)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: 999,
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Điều hướng điện thoại">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTab(t.id)}
              className={`mobile-nav-btn ${active ? 'active' : ''}`}
            >
              {t.icon}
              <span>{t.mobileLabel}</span>
              {t.badge !== undefined && (
                <span
                  className="mono"
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 12,
                    background: 'var(--accent-purple)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    padding: '0 5px',
                    borderRadius: 999,
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
