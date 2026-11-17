import React, { useRef, useState } from 'react';
import {
  Cloud,
  CloudDownload,
  CloudUpload,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import type { AppState, RewardItem } from '../types';
import type { GistConfig } from '../utils/gistSync';

interface ShopAndProfileProps {
  state: AppState;
  gistConfig: GistConfig;
  onUpdateGistConfig: (patch: Partial<GistConfig>) => void;
  onPushGist: () => Promise<void>;
  onPullGist: () => Promise<void>;
  onRedeemReward: (reward: RewardItem) => void;
  onAddReward: (reward: Omit<RewardItem, 'id' | 'redeemedCount'>) => void;
  onDeleteReward: (id: string) => void;
  onUpdateProfile: (userName: string, pactText: string) => void;
  onResetEmpty: () => void;
  onLoadDemo: () => void;
  onImportState: (newState: AppState) => void;
}

export const ShopAndProfile: React.FC<ShopAndProfileProps> = ({
  state,
  gistConfig,
  onUpdateGistConfig,
  onPushGist,
  onPullGist,
  onRedeemReward,
  onAddReward,
  onDeleteReward,
  onUpdateProfile,
  onResetEmpty,
  onLoadDemo,
  onImportState,
}) => {
  const [rTitle, setRTitle] = useState('');
  const [rEmoji, setREmoji] = useState('🎁');
  const [rCost, setRCost] = useState(100);
  const [userName, setUserName] = useState(state.userName);
  const [pactText, setPactText] = useState(state.pactText);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rTitle.trim()) return;
    onAddReward({
      title: rTitle.trim(),
      emoji: rEmoji.trim() || '🎁',
      costCoins: Math.max(10, rCost),
    });
    setRTitle('');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rentam-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (
          parsed &&
          Array.isArray(parsed.habits) &&
          Array.isArray(parsed.badHabits)
        ) {
          onImportState(parsed as AppState);
          setImportMsg('Khôi phục dữ liệu thành công!');
        } else {
          setImportMsg('File JSON không đúng định dạng RÈN TÂM.');
        }
      } catch {
        setImportMsg('Không thể đọc file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyGistId = () => {
    if (!gistConfig.gistId) return;
    navigator.clipboard?.writeText(gistConfig.gistId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    });
  };

  const isSyncing = gistConfig.lastSyncStatus === 'syncing';

  return (
    <div className="battle-grid">
      {/* Left: Real-life Reward Shop */}
      <section className="card" style={{ padding: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} style={{ color: '#fbbf24' }} />
            <h2 style={{ margin: 0, fontSize: '1.14rem', fontWeight: 800 }}>
              Cửa Hàng Tự Thưởng Đời Thực
            </h2>
          </div>
          <span className="pill mono" style={{ color: '#fbbf24' }}>
            🪙 {state.coins} Xu
          </span>
        </div>

        <p
          style={{
            margin: '0 0 14px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          Dùng Xu Kỷ Luật kiếm được từ thói quen tốt và từ chối cám dỗ để đổi
          lấy phần thưởng lành mạnh mà bạn tự đặt ra!
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {state.rewards.map((rw) => {
            const canBuy = state.coins >= rw.costCoins;
            return (
              <div
                key={rw.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: '1 1 180px' }}>
                  <span style={{ fontSize: 26 }}>{rw.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      {rw.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Đã đổi: {rw.redeemedCount} lần
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    className={`btn ${canBuy ? 'btn-shield' : ''}`}
                    disabled={!canBuy}
                    onClick={() => onRedeemReward(rw)}
                    style={{ padding: '7px 12px', fontSize: '0.82rem' }}
                  >
                    <span>🪙 {rw.costCoins}</span>
                    <span>Đổi ngay</span>
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => onDeleteReward(rw.id)}
                    style={{ padding: 7, color: 'var(--text-dim)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Reward */}
        <form onSubmit={handleAddReward} className="reward-form-grid">
          <input
            className="input"
            value={rEmoji}
            onChange={(e) => setREmoji(e.target.value)}
            maxLength={4}
            title="Emoji"
          />
          <input
            className="input"
            placeholder="Thêm phần thưởng mới..."
            value={rTitle}
            onChange={(e) => setRTitle(e.target.value)}
            required
          />
          <input
            className="input"
            type="number"
            min={10}
            step={10}
            value={rCost}
            onChange={(e) => setRCost(Number(e.target.value) || 50)}
            title="Giá xu"
          />
          <button
            type="submit"
            className="btn btn-good"
            style={{ padding: '10px 14px' }}
          >
            <Plus size={16} />
          </button>
        </form>
      </section>

      {/* Right: GitHub Gist Sync + Personal Pact + Backup */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* GitHub Gist Sync Card */}
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cloud size={20} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800 }}>
                Đồng Bộ Đám Mây (GitHub Gist)
              </h2>
            </div>
            {gistConfig.lastSyncedAt && (
              <span
                className="pill mono"
                style={{ fontSize: '0.72rem', color: 'var(--accent-good)' }}
              >
                ✓{' '}
                {new Date(gistConfig.lastSyncedAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <p
            style={{
              margin: '0 0 12px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Đồng bộ dữ liệu giữa <strong>máy tính & điện thoại</strong> bằng
            Secret Gist cá nhân trên GitHub. Token chỉ lưu cục bộ trên máy bạn,
            không bao giờ bị đẩy lên Gist.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                GitHub Personal Access Token (cần quyền <code>gist</code>)
              </label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <input
                  className="input mono"
                  type={showToken ? 'text' : 'password'}
                  placeholder="ghp_... hoặc github_pat_..."
                  value={gistConfig.token}
                  onChange={(e) =>
                    onUpdateGistConfig({ token: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowToken((v) => !v)}
                  title={showToken ? 'Ẩn token' : 'Hiện token'}
                  style={{ padding: '0 11px', flexShrink: 0 }}
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                Gist ID (Để trống khi Đẩy lần đầu để tự tạo Secret Gist mới)
              </label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <input
                  className="input mono"
                  placeholder="Dán Gist ID để đồng bộ từ máy khác..."
                  value={gistConfig.gistId}
                  onChange={(e) =>
                    onUpdateGistConfig({ gistId: e.target.value })
                  }
                />
                {gistConfig.gistId && (
                  <button
                    type="button"
                    className="btn"
                    onClick={handleCopyGistId}
                    title="Sao chép Gist ID"
                    style={{ padding: '0 11px', flexShrink: 0 }}
                  >
                    <Copy size={15} />
                    {copiedId && (
                      <span style={{ fontSize: '0.72rem' }}>Đã chép</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '6px 2px',
              }}
            >
              <input
                type="checkbox"
                checked={gistConfig.autoSync}
                onChange={(e) =>
                  onUpdateGistConfig({ autoSync: e.target.checked })
                }
                style={{ accentColor: 'var(--accent-good)', width: 16, height: 16 }}
              />
              <span>
                Tự động đẩy lên Gist sau mỗi thay đổi (chờ 3.5 giây)
              </span>
            </label>

            <div className="form-2-col">
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSyncing || !gistConfig.token.trim()}
                onClick={onPushGist}
              >
                <CloudUpload size={16} />
                <span>{isSyncing ? 'Đang xử lý...' : 'Đẩy lên Gist'}</span>
              </button>

              <button
                type="button"
                className="btn btn-good"
                disabled={isSyncing || !gistConfig.gistId.trim()}
                onClick={onPullGist}
              >
                <CloudDownload size={16} />
                <span>Tải từ Gist về</span>
              </button>
            </div>

            {gistConfig.lastSyncStatus === 'error' && gistConfig.lastError && (
              <div
                style={{
                  padding: '9px 12px',
                  borderRadius: 11,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: 'var(--accent-danger)',
                  fontSize: '0.8rem',
                }}
              >
                ⚠️ {gistConfig.lastError}
              </div>
            )}

            <details
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-elevated)',
                borderRadius: 12,
                padding: '9px 12px',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                📖 Hướng dẫn lấy GitHub Token (30 giây)
              </summary>
              <ol style={{ margin: '8px 0 2px', paddingLeft: 18, lineHeight: 1.55 }}>
                <li>
                  Vào GitHub → <strong>Settings</strong> →{' '}
                  <strong>Developer settings</strong> →{' '}
                  <strong>Personal access tokens</strong> →{' '}
                  <strong>Tokens (classic)</strong>.
                </li>
                <li>
                  Chọn <strong>Generate new token (classic)</strong>, tích duy
                  nhất quyền <code>gist</code> rồi tạo Token.
                </li>
                <li>
                  Dán Token vào ô trên và bấm <strong>Đẩy lên Gist</strong> — hệ
                  thống sẽ tự tạo Secret Gist và điền Gist ID cho bạn. Trên điện
                  thoại, dán cùng Token &amp; Gist ID đó rồi bấm{' '}
                  <strong>Tải từ Gist về</strong>!
                </li>
              </ol>
            </details>
          </div>
        </div>

        {/* Personal Pact */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800 }}>
            <FileText
              size={18}
              style={{ verticalAlign: 'middle', marginRight: 6 }}
            />
            Hồ Sơ & Hợp Đồng Kỷ Luật
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                Biệt danh Chiến binh
              </label>
              <input
                className="input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>

            <div>
              <label
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                Lời thề cá nhân (Hiển thị trên Bảng Điều Khiển)
              </label>
              <textarea
                className="input"
                rows={3}
                value={pactText}
                onChange={(e) => setPactText(e.target.value)}
                style={{ marginTop: 4, resize: 'vertical' }}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onUpdateProfile(userName, pactText)}
            >
              <Sparkles size={15} />
              <span>Cập Nhật Hồ Sơ</span>
            </button>
          </div>
        </div>

        {/* Backup / Reset */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.02rem', fontWeight: 800 }}>
            💾 Dữ Liệu & Sao Lưu Tệp JSON
          </h3>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            Dữ liệu luôn tự lưu trong trình duyệt. Bạn có thể xuất JSON dự
            phòng, nạp lại dữ liệu mẫu, hoặc xóa sạch để bắt đầu mới từ đầu.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" className="btn" onClick={handleExport}>
              <Download size={15} />
              <span>Xuất JSON</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={15} />
              <span>Nhập JSON</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />

            <button type="button" className="btn" onClick={onLoadDemo}>
              <Sparkles size={15} />
              <span>Nạp dữ liệu mẫu</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-ghost"
              onClick={() => {
                if (
                  window.confirm(
                    'Bạn có chắc muốn xóa toàn bộ dữ liệu để bắt đầu mới từ đầu?'
                  )
                ) {
                  onResetEmpty();
                }
              }}
            >
              <RotateCcw size={15} />
              <span>Bắt đầu từ đầu (Trống)</span>
            </button>
          </div>

          {importMsg && (
            <div
              style={{
                marginTop: 10,
                fontSize: '0.82rem',
                color: 'var(--accent-primary)',
              }}
            >
              {importMsg}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
