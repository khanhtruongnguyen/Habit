import React, { useEffect, useState } from 'react';
import { Dices, ShieldCheck, Waves, X } from 'lucide-react';
import type { BadHabit, UrgeTrigger } from '../types';
import { MICRO_CHALLENGES, TRIGGER_META } from '../utils/gameLogic';
import { sfx } from '../utils/sound';

interface UrgeSurfingModalProps {
  badHabits: BadHabit[];
  initialBadHabitId: string | null;
  soundEnabled: boolean;
  onClose: () => void;
  onCompleteVictory: (payload: {
    badHabitId: string;
    trigger: UrgeTrigger;
    intensity: number;
    fullSurf: boolean;
  }) => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const UrgeSurfingModal: React.FC<UrgeSurfingModalProps> = ({
  badHabits,
  initialBadHabitId,
  soundEnabled,
  onClose,
  onCompleteVictory,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialBadHabitId || badHabits[0]?.id || ''
  );
  const [trigger, setTrigger] = useState<UrgeTrigger>('stress');
  const [intensity, setIntensity] = useState<number>(7);
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [challengeIdx, setChallengeIdx] = useState<number>(() =>
    Math.floor(Math.random() * MICRO_CHALLENGES.length)
  );

  // Breathing 12-second cycle: 4s inhale, 4s hold, 4s exhale
  const elapsed = 90 - secondsLeft;
  const cyclePos = elapsed % 12;
  const phase: BreathPhase =
    cyclePos < 4 ? 'inhale' : cyclePos < 8 ? 'hold' : 'exhale';

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 90 || secondsLeft <= 0) return;
    const pos = (90 - secondsLeft) % 12;
    if (pos === 0) sfx.breathCue(soundEnabled, 'inhale');
    else if (pos === 4) sfx.breathCue(soundEnabled, 'hold');
    else if (pos === 8) sfx.breathCue(soundEnabled, 'exhale');
  }, [secondsLeft, soundEnabled]);

  const rollChallenge = () => {
    setChallengeIdx((prev) => (prev + 1 + Math.floor(Math.random() * 3)) % MICRO_CHALLENGES.length);
  };

  const phaseText =
    phase === 'inhale'
      ? 'HÍT VÀO SÂU...'
      : phase === 'hold'
      ? 'GIỮ NHẸ...'
      : 'THỞ RA CHẬM...';

  const orbScale = phase === 'inhale' ? 1.24 : phase === 'hold' ? 1.26 : 0.88;
  const fullSurfDone = secondsLeft === 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Waves size={22} style={{ color: '#fb7185' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              SOS Lướt Sóng Cơn Thèm (90 Giây)
            </h3>
          </div>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{ padding: 6 }}
          >
            <X size={16} />
          </button>
        </div>

        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            margin: '0 0 16px',
            lineHeight: 1.5,
          }}
        >
          Khoa học thần kinh cho thấy một cơn xung động chỉ kéo dài{' '}
          <strong>90 giây</strong> nếu bạn quan sát nó mà không hành động. Hãy
          thở cùng vòng tròn bên dưới!
        </p>

        {/* Breathing Circle Arena */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '22px 12px',
            borderRadius: 20,
            background:
              'radial-gradient(circle, rgba(244,63,94,0.12), rgba(15,23,42,0.5))',
            border: '1px solid rgba(244,63,94,0.28)',
            marginBottom: 16,
          }}
        >
          <div
            className="breath-orb"
            style={{
              width: 132,
              height: 132,
              borderRadius: '50%',
              transform: `scale(${fullSurfDone ? 1.1 : orbScale})`,
              background: fullSurfDone
                ? 'linear-gradient(135deg, #10b981, #38bdf8)'
                : 'linear-gradient(135deg, #f43f5e, #f59e0b)',
              boxShadow: fullSurfDone
                ? '0 0 42px rgba(16,185,129,0.55)'
                : '0 0 42px rgba(244,63,94,0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 800 }}>
              {fullSurfDone ? '✓' : `${secondsLeft}s`}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.92 }}>
              {fullSurfDone ? 'SÓNG ĐÃ TAN!' : phaseText}
            </div>
          </div>
        </div>

        {/* Micro-Challenge Roulette */}
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
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
              }}
            >
              🎯 HÀNH ĐỘNG CHUYỂN HƯỚNG NGAY:
            </span>
            <button
              type="button"
              className="btn"
              onClick={rollChallenge}
              style={{ padding: '4px 9px', fontSize: '0.74rem' }}
            >
              <Dices size={13} />
              <span>Đổi việc khác</span>
            </button>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.45 }}>
            {MICRO_CHALLENGES[challengeIdx]}
          </div>
        </div>

        {/* Context Selectors */}
        <div className="form-2-col" style={{ marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Đang đối mặt với
            </label>
            <select
              className="input"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ marginTop: 4 }}
            >
              {badHabits.length === 0 ? (
                <option value="">Cám dỗ chung</option>
              ) : (
                badHabits.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.emoji} {b.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Nguyên nhân kích hoạt
            </label>
            <select
              className="input"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as UrgeTrigger)}
              style={{ marginTop: 4 }}
            >
              {(Object.keys(TRIGGER_META) as UrgeTrigger[]).map((t) => (
                <option key={t} value={t}>
                  {TRIGGER_META[t].emoji} {TRIGGER_META[t].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}
          >
            <span>Độ mạnh cơn thèm:</span>
            <span className="mono" style={{ color: '#fb7185', fontWeight: 700 }}>
              {intensity}/10
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f43f5e' }}
          />
        </div>

        <button
          type="button"
          className="btn btn-shield"
          style={{ width: '100%', padding: 13, fontSize: '0.96rem' }}
          onClick={() =>
            onCompleteVictory({
              badHabitId: selectedId || badHabits[0]?.id || 'general',
              trigger,
              intensity,
              fullSurf: fullSurfDone,
            })
          }
        >
          <ShieldCheck size={18} />
          <span>
            {fullSurfDone
              ? 'HOÀN TẤT 90s — CHIẾN THẮNG TUYỆT ĐỐI! (+2x Thưởng)'
              : 'Cơn thèm đã dịu — TÔI ĐÃ CHIẾN THẮNG!'}
          </span>
        </button>
      </div>
    </div>
  );
};
