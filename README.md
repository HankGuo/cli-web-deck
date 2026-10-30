# CLI Web Deck 🚀

> **Turn any command-line tool into a beautiful, production-ready web console with terminal, drag-and-drop file upload, and persistent session management.**

[English](#english) | [中文说明](#中文说明)

---

<a name="english"></a>
## Overview

**CLI Web Deck** is a lightweight, zero-dependency universal framework that bridges any command-line application (CLI) to a modern browser interface. 

Whether you are running an AI coding assistant (`claude`, `kimi`, `minimax`, `aider`, `gemini`), an interactive data shell (`python`, `ipython`, `R`), or standard system utilities (`bash`, `htop`), CLI Web Deck allows users to interact with it directly in the browser over a **single HTTP/WebSocket port**, with zero cloud lock-in.

### Key Features

* **⚡ Any CLI Command**: If it runs in a terminal, it runs in CLI Web Deck.
* **🌐 Single-Port Architecture**: Web UI, WebSocket terminal, and file transfer APIs all multiplexed onto one single port. Direct IP (`http://1.2.3.4:8080`) or domain supported.
* **🔄 Persistent Sessions (`tmux`)**: Disconnected? Accidental tab close? Your process keeps running in the background. Reconnecting automatically restores your exact terminal state.
* **📁 Drag & Drop File Transfer**: Drop files anywhere on the browser window to upload directly into your workspace.
* **📦 File Explorer & Downloader**: Integrated collapsible file drawer to browse, view sizes, and download outputs with one click.
* **🔒 Optional Basic Auth**: Protect public instances with `--auth "user:password"`.
* **🐳 Docker & Systemd Ready**: Run natively, as a system service, or via Docker Compose.

---

## Quickstart (Under 1 Minute)

### 1. Prerequisites
Ensure `tmux`, `ttyd`, and `Node.js (v18+)` are installed:
```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y tmux ttyd curl

# macOS
brew install tmux ttyd
```

### 2. Run Directly
Clone and run any command:
```bash
git clone https://github.com/HankGuo/cli-web-deck.git
cd cli-web-deck
chmod +x ./bin/cli-web-deck

# Run standard bash
./bin/cli-web-deck --cmd "bash" --port 8080

# Run an AI CLI or custom tool in a custom workspace
./bin/cli-web-deck --cmd "python3 -m IPython" --port 8888 --workspace ~/data-lab

# Run with authentication on a public server IP
./bin/cli-web-deck --cmd "bash" --port 8080 --auth "admin:mySecretPass"
```

Open your browser at `http://<YOUR_SERVER_IP>:8080`.

---

## Options & Flags

| Flag | Shorthand | Description | Default |
| :--- | :--- | :--- | :--- |
| `--cmd` | `-c` | Command to run in terminal | `$SHELL` (bash) |
| `--port` | `-p` | Public port for Web Console | `8080` |
| `--workspace` | `-w` | Directory for file uploads and commands | Current dir |
| `--title` | `-t` | Title displayed in the web header | `"CLI Web Deck"` |
| `--auth` | `-a` | Basic Auth credentials (`user:pass`) | `None` (Public) |
| `--session` | `-s` | Custom tmux session identifier | Auto-generated |
| `--host` | `-h` | Network interface to bind | `0.0.0.0` |

---

## Docker Usage

```bash
docker build -t cli-web-deck .
docker run -d -p 8080:8080 -v $(pwd)/workspace:/workspace cli-web-deck
```

Or using Docker Compose:
```bash
docker compose -f templates/docker-compose.yml up -d
```

---

## Production Deployment (Nginx Reverse Proxy)

A production-ready reverse proxy template is provided in `templates/nginx.conf`:
```nginx
server {
    listen 80;
    server_name console.yourdomain.com;
    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```

---

<a name="中文说明"></a>
## 中文说明

**CLI Web Deck** 是一个将任意命令行终端程序转化为现代化 Web 应用的通用轻量级框架。

### 核心亮点
1. **支持任意命令行**：AI Agent 工具、编程语言 REPL、运维监控脚本均可一键转为 Web 控制台。
2. **单端口极简通信**：页面、终端 WebSocket 与文件上传接口全部收敛于单个端口，防火墙与公网 IP 直连友好。
3. **tmux 会话持久化**：断网或关闭网页不中断任务执行，重连即可无缝继续。
4. **全屏文件拖拽上传**：将本地文件直接拖入浏览器窗口，秒级流式写入工作区。
5. **开箱即用**：提供 Docker、Systemd 守护进程与 Nginx 反向代理模板。

### 典型命令
```bash
# 启动交互式终端
cli-web-deck --cmd "bash" --port 8080

# 运行指定 AI 智能体 CLI 并挂载专属工作区
cli-web-deck --cmd "kimi" --port 8010 --workspace /data/kimi-workspace

# 开启密码保护
cli-web-deck --cmd "htop" --port 9090 --auth "admin:password123"
```

---

## License

MIT License © 2026 HankGuo
