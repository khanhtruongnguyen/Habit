import React, { useEffect, useState } from 'react';
import {
  CloudRain,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react';
import type { FocusSession } from '../types';
import { ambientEngine } from '../utils/sound';
import type { AmbientKind } from '../utils/sound';

interface FocusArenaProps {
  sessions: FocusSession[];
  onCompleteFocus: (minutes: number, label: string) => void;
}

const PRESETS = [
  { minutes: 15, label: 'Khởi động nhanh (15p)' },
  { minutes: 25, label: 'Pomodoro chuẩn (25p)' },
  { minutes: 45, label: 'Deep Work (45p)' },
  { minutes: 60, label: 'Siêu tập trung (60p)' },
];

export const FocusArena: React.FC<FocusArenaProps> = ({
  sessions,
  onCompleteFocus,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [taskLabel, setTaskLabel] = useState('Học tập / Làm việc không xao nhãng');
  const [ambient, setAmbient] = useState<AmbientKind>('none');
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          onCompleteFocus(selectedMinutes, taskLabel.trim() || 'Phiên Tập Trung');
          return selectedMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, selectedMinutes, taskLabel, onCompleteFocus]);

  useEffect(() => {
    return () => {
      ambientEngine.stop();
    };
  }, []);

  const choosePreset = (mins: number) => {
    setRunning(false);
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const toggleAmbient = (kind: AmbientKind) => {
    if (ambient === kind) {
      ambientEngine.stop();
      setAmbient('none');
    } else {
      ambientEngine.start(kind, volume);
      setAmbient(kind);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    ambientEngine.setVolume(v);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const totalSecs = selectedMinutes * 60;
  const pct = Math.round(((totalSecs - secondsLeft) / totalSecs) * 100);

  const totalFocusedMinutes = sessions.reduce((a, s) => a + s.minutes, 0);

  return (
    <div className="battle-grid">
      {/* Left: Focus Timer */}
      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800 }}>
          ⏱️ Phòng Tập Trung Sâu (Deep Focus)
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Hoàn thành 1 phiên tập trung để cộng chỉ số <strong>Tập trung</strong>,
          nhận XP và gây sát thương lớn lên Boss!
        </p>

        {/* Preset pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {PRESETS.map((p) => (
            <button
              key={p.minutes}
              type="button"
              className="btn"
              onClick={() => choosePreset(p.minutes)}
              style={{
                padding: '7px 12px',
                fontSize: '0.8rem',
                borderColor:
                  selectedMinutes === p.minutes
                    ? 'var(--accent-primary)'
                    : 'var(--border)',
                color:
                  selectedMinutes === p.minutes
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Task label */}
        <input
          className="input"
          value={taskLabel}
          onChange={(e) => setTaskLabel(e.target.value)}
          placeholder="Bạn đang tập trung làm việc gì?"
          style={{ marginBottom: 20 }}
        />

        {/* Circular Timer Display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 16px',
            borderRadius: 22,
            background:
              'radial-gradient(circle, rgba(56,189,248,0.12), var(--bg-elevated))',
            border: '1px solid rgba(56,189,248,0.28)',
            marginBottom: 18,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: '3.6rem',
              fontWeight: 800,
              letterSpacing: 2,
              color: running ? 'var(--accent-primary)' : 'var(--text-main)',
            }}
          >
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {running
              ? '🔥 Đang trong vùng tập trung — đừng chạm điện thoại!'
              : `Tiến độ phiên: ${pct}% • Phần thưởng: +${Math.round(
                  selectedMinutes * 1.4
                )} XP`}
          </div>
          <div
            className="progress-track"
            style={{ width: '80%', maxWidth: 320, marginTop: 14, height: 8 }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-purple))',
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setRunning((r) => !r)}
            style={{ padding: '11px 22px', fontSize: '0.95rem' }}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            <span>{running ? 'Tạm dừng' : 'Bắt đầu tập trung'}</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => choosePreset(selectedMinutes)}
            style={{ padding: '11px 16px' }}
          >
            <RotateCcw size={16} />
            <span>Đặt lại</span>
          </button>

          {secondsLeft < totalSecs && (
            <button
              type="button"
              className="btn btn-good"
              onClick={() => {
                const elapsedMins = Math.max(
                  1,
                  Math.round((totalSecs - secondsLeft) / 60)
                );
                setRunning(false);
                setSecondsLeft(selectedMinutes * 60);
                onCompleteFocus(elapsedMins, taskLabel.trim() || 'Phiên Tập Trung');
              }}
              style={{ padding: '11px 16px' }}
            >
              <Sparkles size={16} />
              <span>Hoàn tất & Nhận thưởng</span>
            </button>
          )}
        </div>
      </section>

      {/* Right: Procedural Ambient Soundscape & Focus History */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.08rem', fontWeight: 800 }}>
            🎧 Âm Thanh Môi Trường (Tổng hợp Live)
          </h3>
          <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Âm thanh được tạo trực tiếp bằng Web Audio API — hoạt động ngay cả khi
            mất mạng.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <button
              type="button"
              className="btn"
              onClick={() => toggleAmbient('rain')}
              style={{
                flexDirection: 'column',
                padding: '14px 10px',
                borderColor:
                  ambient === 'rain' ? 'var(--accent-primary)' : 'var(--border)',
                color:
                  ambient === 'rain' ? 'var(--accent-primary)' : 'var(--text-main)',
              }}
            >
              <CloudRain size={22} />
              <span style={{ fontSize: '0.8rem' }}>Mưa rơi</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => toggleAmbient('brown')}
              style={{
                flexDirection: 'column',
                padding: '14px 10px',
                borderColor:
                  ambient === 'brown' ? 'var(--accent-shield)' : 'var(--border)',
                color:
                  ambient === 'brown' ? 'var(--accent-shield)' : 'var(--text-main)',
              }}
            >
              <Flame size={22} />
              <span style={{ fontSize: '0.8rem' }}>Tiếng ồn nâu</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => toggleAmbient('ocean')}
              style={{
                flexDirection: 'column',
                padding: '14px 10px',
                borderColor:
                  ambient === 'ocean' ? 'var(--accent-good)' : 'var(--border)',
                color:
                  ambient === 'ocean' ? 'var(--accent-good)' : 'var(--text-main)',
              }}
            >
              <Waves size={22} />
              <span style={{ fontSize: '0.8rem' }}>Sóng biển</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="range"
              min={0.05}
              max={0.75}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
            />
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {Math.round((volume / 0.75) * 100)}%
            </span>
          </div>
        </div>

        {/* Session Log */}
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800 }}>
              📚 Lịch Sử Phiên Tập Trung
            </h3>
            <span className="pill mono" style={{ color: 'var(--accent-primary)' }}>
              Tổng: {totalFocusedMinutes} phút
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                Chưa có phiên nào. Hãy hoàn thành phiên đầu tiên!
              </div>
            ) : (
              sessions.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 12px',
                    borderRadius: 12,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    fontSize: '0.83rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {s.date} • {s.minutes} phút
                    </div>
                  </div>
                  <span className="mono" style={{ color: 'var(--accent-good)', fontWeight: 700 }}>
                    +{s.xpEarned} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
