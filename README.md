# MoonTV（静态化版本）

> 纯前端、可静态托管的影视聚合播放器。已移除 Node.js 端依赖与服务端数据库，适配 EdgeOne Pages 等仅托管静态文件的平台。

## 版本要点
- 静态导出：`next.config.js` 使用 `output: 'export'`，构建产物输出到 `out/`
- 纯前端数据流：搜索、详情、豆瓣均在浏览器端直接请求第三方源
- 全站密码：通过 `GlobalPasswordGate` 在前端拦截（首页/播放/搜索/Admin 等统一一次登录）
- 本地持久化：播放记录、收藏、搜索历史、跳片设置、管理员覆盖配置均使用 `localStorage`
- 代理支持：可在 `config.json` 配置 `douban_proxy` / `downstream_proxy` / `image_proxy` 解决 CORS
- 已移除广告调用；播放器保留 M3U8 级别的切片过滤
- 关闭 PWA：为避免与静态导出冲突，已禁用 `next-pwa`

---

## 快速开始（本地）
1) 安装依赖
```bash
pnpm install
```

2) 配置 `config.json`
```json
{
  "site_name": "MoonTV",
  "homepage_password": "your_password",
  "douban_proxy": "",
  "image_proxy": "",
  "downstream_proxy": "",
  "cache_time": 7200,
  "api_site": {
    "example": {
      "api": "https://example.com/api.php/provide/vod",
      "name": "示例站点",
      "detail": "https://example.com"
    }
  }
}
```

3) 启动
```bash
pnpm gen:runtime && pnpm gen:manifest
pnpm dev
```
首次访问会提示输入首页密码。

---

## 构建（静态导出）
```bash
pnpm gen:runtime && pnpm gen:manifest && pnpm build
```
说明：
- `next.config.js` 已启用 `output: 'export'`
- 构建产物位于 `out/`（我们也启用了 `trailingSlash: true` 以生成目录型路由）
- 已禁用 `next-pwa`，避免与静态导出冲突

---

## EdgeOne Pages 部署
在 EdgeOne Pages 控制台新建项目并配置：
- 框架预设：Other
- 根目录：`/`
- 输出目录：`out`
- 安装命令：`pnpm install --frozen-lockfile`
- 编译命令：`pnpm gen:runtime && pnpm gen:manifest && pnpm build`

注意事项：
- 不要使用 `npx next export -o out`（部分环境该参数会报 "unknown option -o"）
- 构建成功后应看到 `index.html`、`admin/index.html`、`search/index.html`、`play/index.html` 等文件
- 若第三方接口被 CORS 限制，给 `config.json` 配置代理前缀：
```json
{
  "douban_proxy": "https://your-proxy.example.com/fetch?url=",
  "downstream_proxy": "https://your-proxy.example.com/fetch?url=",
  "image_proxy": "https://your-proxy.example.com/image?url="
}
```

---

## 如何修改首页密码（两种方式）
- 方式 A（全站生效，推荐）：
  1) 编辑仓库根目录 `config.json` 的 `homepage_password`
  2) 运行 `pnpm gen:runtime && pnpm gen:manifest && pnpm build`
  3) 推送后在 EdgeOne 重新部署，所有访问使用新密码

- 方式 B（本机临时覆盖）：
  1) 打开站点 `/admin`
  2) 点击“修改站点密码”，输入并保存
  3) 写入浏览器 `localStorage.moontv_admin_local_config.homepagePasswordOverride`，只对当前浏览器生效
  4) 如需全站同步：在 Admin 点击“导出 JSON”，将内容合并回仓库 `config.json` 后重新部署

补充：
- 登录状态存于 Cookie `auth`；当 `config.json` 或本地覆盖的密码与 Cookie 中不一致时，会强制重新登录
- 想立即重登，可在右上角用户菜单“退出登录”，或清理 `auth` Cookie

---

## 常见问题（FAQ）
- 构建成功但页面空白/404：
  - 确认 `next.config.js` 已禁用 PWA（本仓库已处理）
  - 确认 EdgeOne 输出目录是 `out`
  - 确认 `out` 内存在对应页面的 `index.html`
- 豆瓣/资源搜索失败：
  - 多数为 CORS 所致，配置 `douban_proxy` / `downstream_proxy`
  - 公共代理可能不稳定，建议自建简单转发代理
- 首页没弹密码框：
  - 该浏览器已有 `auth` Cookie；先退出登录或清 Cookie，再刷新

---

## 目录说明（关键文件）
- `config.json`：站点配置（首页密码、代理前缀、数据源等）
- `scripts/convert-config.js`：构建前将 `config.json` 注入到 `src/lib/runtime.ts`
- `src/components/GlobalPasswordGate.tsx`：全站密码门
- `src/lib/douban.client.ts`、`src/lib/downstream.ts`：前端直连第三方数据源，带代理回退
- `next.config.js`：静态导出、关闭 PWA、输出目录及图片配置

---

## 免责声明
本项目仅用于技术学习与交流，不提供任何存储与传播影视内容的服务。请遵守当地法律法规，勿将部署的站点对外公开或用于商业用途。
