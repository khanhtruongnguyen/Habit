import type { AppState } from '../types';

export const GIST_CONFIG_STORAGE_KEY = 'rentam_gist_config_v1';
const GIST_FILENAME = 'rentam-data.json';

export interface GistConfig {
  token: string;
  gistId: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
  lastSyncStatus: 'idle' | 'syncing' | 'ok' | 'error';
  lastError: string | null;
}

export function loadGistConfig(): GistConfig {
  try {
    const raw = localStorage.getItem(GIST_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GistConfig>;
      return {
        token: parsed.token || '',
        gistId: parsed.gistId || '',
        autoSync: Boolean(parsed.autoSync),
        lastSyncedAt: parsed.lastSyncedAt || null,
        lastSyncStatus: 'idle',
        lastError: null,
      };
    }
  } catch {
    // ignore storage errors
  }
  return {
    token: '',
    gistId: '',
    autoSync: false,
    lastSyncedAt: null,
    lastSyncStatus: 'idle',
    lastError: null,
  };
}

export function saveGistConfig(cfg: GistConfig): void {
  try {
    localStorage.setItem(
      GIST_CONFIG_STORAGE_KEY,
      JSON.stringify({
        token: cfg.token,
        gistId: cfg.gistId,
        autoSync: cfg.autoSync,
        lastSyncedAt: cfg.lastSyncedAt,
      })
    );
  } catch {
    // ignore storage quota errors
  }
}

function parseGitHubError(status: number, bodyText: string): string {
  if (status === 401) {
    return 'GitHub Token không hợp lệ hoặc đã hết hạn (401).';
  }
  if (status === 403) {
    return 'Token thiếu quyền `gist` hoặc đã chạm giới hạn API GitHub (403).';
  }
  if (status === 404) {
    return 'Không tìm thấy Gist ID này hoặc Token không có quyền truy cập (404).';
  }
  try {
    const j = JSON.parse(bodyText) as { message?: string };
    if (j.message) return `GitHub API (${status}): ${j.message}`;
  } catch {
    // ignore
  }
  return `Lỗi GitHub API (HTTP ${status}).`;
}

export async function pushToGist(
  token: string,
  gistId: string,
  state: AppState
): Promise<{ gistId: string; syncedAt: string }> {
  const cleanToken = token.trim();
  const cleanId = gistId.trim();
  if (!cleanToken) {
    throw new Error('Vui lòng nhập GitHub Personal Access Token (quyền gist).');
  }

  const payload = {
    description: 'RÈN TÂM — Dữ liệu đồng bộ Thói Quen & Khiên Bản Lĩnh',
    ...(cleanId ? {} : { public: false }),
    files: {
      [GIST_FILENAME]: {
        content: JSON.stringify(state, null, 2),
      },
    },
  };

  const url = cleanId
    ? `https://api.github.com/gists/${encodeURIComponent(cleanId)}`
    : 'https://api.github.com/gists';

  const res = await fetch(url, {
    method: cleanId ? 'PATCH' : 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${cleanToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(parseGitHubError(res.status, txt));
  }

  const data = (await res.json()) as { id: string };
  return {
    gistId: data.id,
    syncedAt: new Date().toISOString(),
  };
}

export async function pullFromGist(
  token: string,
  gistId: string
): Promise<{ state: AppState; syncedAt: string }> {
  const cleanToken = token.trim();
  const cleanId = gistId.trim();
  if (!cleanId) {
    throw new Error('Vui lòng nhập Gist ID để tải dữ liệu về.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (cleanToken) {
    headers.Authorization = `Bearer ${cleanToken}`;
  }

  const res = await fetch(
    `https://api.github.com/gists/${encodeURIComponent(cleanId)}`,
    { headers }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(parseGitHubError(res.status, txt));
  }

  const data = (await res.json()) as {
    files?: Record<string, { content?: string; raw_url?: string; truncated?: boolean }>;
  };

  const files = data.files || {};
  const targetFile =
    files[GIST_FILENAME] ||
    Object.values(files).find((f) => f && typeof f.content === 'string');

  if (!targetFile) {
    throw new Error('Gist này không chứa tệp dữ liệu RÈN TÂM.');
  }

  let rawJson = targetFile.content || '';
  if (targetFile.truncated && targetFile.raw_url) {
    const rawRes = await fetch(targetFile.raw_url);
    rawJson = await rawRes.text();
  }

  const parsed = JSON.parse(rawJson) as AppState;
  if (!parsed || !Array.isArray(parsed.habits) || !Array.isArray(parsed.badHabits)) {
    throw new Error('Nội dung JSON trong Gist không đúng định dạng RÈN TÂM.');
  }

  return {
    state: parsed,
    syncedAt: new Date().toISOString(),
  };
}
