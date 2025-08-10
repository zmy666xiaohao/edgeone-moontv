/* eslint-disable no-console */
'use client';

import { useEffect, useMemo, useState } from 'react';

function setAuthCookie(value: Record<string, unknown>): void {
  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `auth=${encoded}; path=/; expires=${expires.toUTCString()}; samesite=lax`;
  } catch (_) {
    // ignore
  }
}

function getAuthFromCookie(): { password?: string } | null {
  try {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const trimmed = cookie.trim();
      const i = trimmed.indexOf('=');
      if (i > 0) acc[trimmed.substring(0, i)] = trimmed.substring(i + 1);
      return acc;
    }, {} as Record<string, string>);
    const raw = cookies['auth'];
    if (!raw) return null;
    let decoded = decodeURIComponent(raw);
    if (decoded.includes('%')) decoded = decodeURIComponent(decoded);
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}

export default function GlobalPasswordGate() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const homepagePassword = useMemo(() => {
    if (!mounted) return '';
    try {
      const raw = localStorage.getItem('moontv_admin_local_config');
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj.homepagePasswordOverride === 'string' && obj.homepagePasswordOverride.trim()) {
          return obj.homepagePasswordOverride.trim();
        }
      }
    } catch { }
    return (window as any).RUNTIME_CONFIG?.HOMEPAGE_PASSWORD || '';
  }, [mounted]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    // 无密码则不拦截
    if (!homepagePassword) return;
    const auth = getAuthFromCookie();
    // 仅在 cookie 密码与当前有效密码一致时放行
    if (auth?.password === homepagePassword) {
      setAuthed(true);
    } else {
      setAuthed(false);
    }
  }, [homepagePassword]);

  // 若未挂载或未设置密码，不显示门
  if (!mounted || !homepagePassword) return null;

  if (authed) return null;

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4'>访问验证</h2>
        <label className='block text-sm text-gray-600 dark:text-gray-300 mb-2'>请输入访问密码</label>
        <input
          type='password'
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500'
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          autoFocus
        />
        {error && <div className='mt-2 text-sm text-red-500'>{error}</div>}
        <button
          className='mt-5 w-full rounded-md bg-green-600 hover:bg-green-700 text-white py-2 transition-colors'
          onClick={() => {
            if (!input) {
              setError('密码不得为空');
              return;
            }
            if (input !== homepagePassword) {
              setError('密码错误');
              return;
            }
            setAuthCookie({ password: input, role: 'user' });
            setAuthed(true);
          }}
        >
          确认
        </button>
      </div>
    </div>
  );
}


