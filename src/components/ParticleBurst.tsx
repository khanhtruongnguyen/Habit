import React from 'react';

export interface FloatingFeedback {
  id: string;
  text: string;
  color: string;
}

interface ParticleBurstProps {
  feedbacks: FloatingFeedback[];
}

export const FloatingFeedbackLayer: React.FC<ParticleBurstProps> = ({
  feedbacks,
}) => {
  if (feedbacks.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 84,
        right: 24,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="toast-float"
          style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${f.color}`,
            color: f.color,
            padding: '8px 16px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: `0 8px 24px -4px ${f.color}55`,
          }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
};
