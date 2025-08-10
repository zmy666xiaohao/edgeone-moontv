/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';

import PageLayout from '@/components/PageLayout';

type LocalAdminConfig = {
  siteName: string;
  announcement: string;
  imageProxy: string;
  doubanProxy: string;
  disableYellow: boolean;
  homepagePasswordOverride: string;
};

const LS_KEY = 'moontv_admin_local_config';

function loadLocal(): LocalAdminConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as LocalAdminConfig;
  } catch { }
  const R = (typeof window !== 'undefined' && (window as any).RUNTIME_CONFIG) || {};
  return {
    siteName: R.SITE_NAME || 'MoonTV',
    announcement: '',
    imageProxy: R.IMAGE_PROXY || '',
    doubanProxy: R.DOUBAN_PROXY || '',
    disableYellow: Boolean(R.DISABLE_YELLOW_FILTER || false),
    homepagePasswordOverride: '',
  };
}

export default function AdminStaticPage() {
  const [cfg, setCfg] = useState<LocalAdminConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCfg(loadLocal());
  }, []);

  const save = () => {
    if (!cfg) return;
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const exportJson = () => {
    if (!cfg) return;
    const data = {
      siteName: cfg.siteName,
      announcement: cfg.announcement,
      image_proxy: cfg.imageProxy,
      douban_proxy: cfg.doubanProxy,
      disable_yellow: cfg.disableYellow,
      homepage_password: cfg.homepagePasswordOverride,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'moontv-static-config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setCfg((prev) => {
        const p = prev || loadLocal();
        return {
          siteName: data.siteName ?? p.siteName,
          announcement: data.announcement ?? p.announcement,
          imageProxy: data.image_proxy ?? p.imageProxy,
          doubanProxy: data.douban_proxy ?? p.doubanProxy,
          disableYellow: Boolean(data.disable_yellow ?? p.disableYellow),
          homepagePasswordOverride:
            data.homepage_password ?? p.homepagePasswordOverride,
        } as LocalAdminConfig;
      });
    } catch { }
  };

  if (!cfg) return null;

  return (
    <PageLayout activePath='/admin'>
      <div className='max-w-3xl mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold mb-6'>静态配置面板</h1>
        <p className='text-sm text-gray-500 mb-6'>本页面不使用 /api/*。配置仅保存在本地浏览器；可导出 JSON 合并到 config.json 后重新构建。</p>

        <div className='space-y-5'>
          <div>
            <label className='block text-sm font-medium mb-2'>站点名称</label>
            <input className='w-full border rounded px-3 py-2' value={cfg.siteName} onChange={(e) => setCfg({ ...cfg, siteName: e.target.value })} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>公告</label>
            <textarea className='w-full border rounded px-3 py-2' rows={3} value={cfg.announcement} onChange={(e) => setCfg({ ...cfg, announcement: e.target.value })} />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>图片代理前缀</label>
              <input className='w-full border rounded px-3 py-2' placeholder='https://imageproxy.example.com/?url=' value={cfg.imageProxy} onChange={(e) => setCfg({ ...cfg, imageProxy: e.target.value })} />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>豆瓣/下游代理前缀</label>
              <input className='w-full border rounded px-3 py-2' placeholder='https://your-proxy.example.com/fetch?url=' value={cfg.doubanProxy} onChange={(e) => setCfg({ ...cfg, doubanProxy: e.target.value })} />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <input id='disableYellow' type='checkbox' checked={cfg.disableYellow} onChange={(e) => setCfg({ ...cfg, disableYellow: e.target.checked })} />
            <label htmlFor='disableYellow' className='text-sm'>关闭黄色过滤（本地）</label>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>覆盖站点密码（仅本地）</label>
            <input className='w-full border rounded px-3 py-2' type='password' placeholder='留空则使用 config.json 的密码' value={cfg.homepagePasswordOverride} onChange={(e) => setCfg({ ...cfg, homepagePasswordOverride: e.target.value })} />
          </div>
        </div>

        <div className='mt-6 flex gap-3'>
          <button className='px-4 py-2 rounded bg-green-600 text-white' onClick={save}>{saved ? '已保存' : '保存到本地'}</button>
          <button className='px-4 py-2 rounded bg-gray-100' onClick={exportJson}>导出 JSON</button>
          <label className='px-4 py-2 rounded bg-gray-100 cursor-pointer'>导入 JSON
            <input className='hidden' type='file' accept='application/json' onChange={(e) => e.target.files && e.target.files[0] && importJson(e.target.files[0])} />
          </label>
        </div>

        <div className='mt-8 text-xs text-gray-500'>线上要全站生效：请把导出的 JSON 合并到仓库 `config.json`，并运行 `pnpm gen:runtime && pnpm build`。</div>
      </div>
    </PageLayout>
  );
}


