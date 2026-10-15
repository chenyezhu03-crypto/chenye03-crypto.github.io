# 本机 / 局域网打开选岗助手

在**你自己电脑**上操作（不要用 Cloud Agent 里的 127.0.0.1，那和本机不是同一台机器）。

## 1. 准备（只需一次）

```bash
git clone https://github.com/chenyezhu03-crypto/chenye03-crypto.github.io.git
cd chenye03-crypto.github.io
npm install
```

## 2. 一键启动并打开浏览器

```bash
npm run pick
```

- 本机访问：<http://127.0.0.1:5173/pick>
- 终端里还会打印 **局域网地址**（形如 `http://192.168.x.x:5173/pick`），手机连同一 WiFi 可在浏览器打开。

## 3. 常见问题

| 现象 | 处理 |
|------|------|
| `ERR_CONNECTION_REFUSED` | 本机未运行 `npm run pick`，或终端已关、服务已停 |
| 端口被占用 | `PICK_PORT=5174 npm run pick` |
| 手机打不开局域网地址 | 检查电脑防火墙是否放行 Node/Vite；确认手机和电脑同一 WiFi |
| 仅本机、不要局域网 | `PICK_HOST=127.0.0.1 npm run pick` |

## 4. 不自动开浏览器

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

手动打开 <http://localhost:5173/pick>。
