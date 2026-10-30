# CLI Web Deck 🚀

> **Access Powerful CLI & AI Agents From Any Restrictive Corporate Network — Just One VPS and a Web Browser.**  
> **突破封闭受限网络，一台 VPS + 任意浏览器即可畅享高级 AI 智能体与终端能力。**

[English](#english) | [中文说明 (解决什么痛点？)](#中文说明)

---

<a name="english"></a>
## 💡 What Problem Does This Solve?

### The Pain Point in Enterprise & Regulated Environments
In many modern workplaces — financial institutions, pharmaceutical enterprises, hospitals, corporate intranets, and locked-down office machines:
* **Strict Network Firewalls**: Outbound SSH (`port 22`), custom ports, and VPN tunnels are strictly blocked.
* **Locked-Down Workstations**: You cannot install Node.js, Python, Git, or modern AI CLI agents (`claude`, `kimi`, `minimax`, `aider`, `gemini-cli`) on your restricted office laptop.
* **File Transfer Restrictions**: Traditional file transfer tools (`scp`, `sftp`, `ftp`, USB drives) are disabled.
* **Yet, you have one thing**: **A standard web browser that can access HTTP / HTTPS.**

### The Solution
**CLI Web Deck** acts as a lightweight, zero-dependency bridge between your remote server and your browser:
1. **One VPS / Fixed IP is all you need**: Deploy your tools on a cloud VPS or home server.
2. **Accessible Anywhere**: As long as you can open a browser, you get a full-fledged terminal workspace.
3. **Single-Port Simplicity**: Terminal WebSocket, web interface, and file upload/download APIs are all multiplexed onto **ONE single port** (e.g. `8080` or `443`). No complex firewall rules.
4. **Frictionless File Transfer**: Drag and drop input tables, datasets, or documents from your locked-down laptop directly into the remote workspace. Download generated reports, graphs, and artifacts with one click.
5. **Session Persistence**: Network hiccups or closed browser tabs won't kill your tasks. Behind the scenes, `tmux` keeps your AI agents and scripts running 24/7.

---

## ⚡ Key Features

* **⚡ Any CLI Command**: If it runs in a terminal, it runs in CLI Web Deck (`bash`, `kimi`, `claude`, `minimax`, `python`, `htop`, etc.).
* **🌐 Single-Port Multiplexing**: Web UI, WebSocket terminal, and file APIs on one single port. Direct IP (`http://1.2.3.4:8080`) or domain + SSL supported out of the box.
* **🔄 Persistent Sessions (`tmux`)**: Disconnected? Accidental tab close? Your process keeps running in the background. Reconnecting automatically restores your exact terminal state.
* **📁 Drag & Drop File Transfer**: Drop files anywhere on the browser window to upload directly into your remote workspace.
* **📦 Built-in File Explorer & Downloader**: Integrated collapsible file drawer to browse, view file sizes, and download outputs with one click.
* **🔒 Optional Basic Auth**: Protect public instances with `--auth "user:password"`.
* **🐳 Docker & Systemd Ready**: Run natively, as a system service, or via Docker Compose.

---

## 🚀 Quickstart (Under 1 Minute)

### 1. Prerequisites
Ensure `tmux`, `ttyd`, and `Node.js (v18+)` are installed on your server:
```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y tmux ttyd curl

# macOS
brew install tmux ttyd
```

### 2. Run Directly
```bash
git clone https://github.com/HankGuo/cli-web-deck.git
cd cli-web-deck
chmod +x ./bin/cli-web-deck

# Run standard bash
./bin/cli-web-deck --cmd "bash" --port 8080

# Run an AI CLI or custom tool in a custom workspace
./bin/cli-web-deck --cmd "kimi" --port 8010 --workspace ~/kimi-workspace

# Run with authentication on a public server IP
./bin/cli-web-deck --cmd "bash" --port 8080 --auth "admin:mySecretPass"
```

Open your browser at `http://<YOUR_SERVER_IP>:8080`.

---

## ⚙️ Options & Flags

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

## 🐳 Docker Deployment

```bash
docker build -t cli-web-deck .
docker run -d -p 8080:8080 -v $(pwd)/workspace:/workspace cli-web-deck
```

Or using Docker Compose:
```bash
docker compose -f templates/docker-compose.yml up -d
```

---

## 🛡️ Production Deployment (Nginx Reverse Proxy)

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
## 🇨🇳 中文说明：解决什么痛点？

### 典型痛点场景
在很多企业、金融机构、医药临床研发、外企或严格管控的内网办公环境中：
1. **网络高度封闭**：办公电脑处于受限网络中，企业网关直接屏蔽了 SSH（22端口）、各种自定义端口及传统 VPN 协议。
2. **终端权限受限**：办公机无法自由安装 Node.js、Python、Git 以及各种新兴的高级 AI 智能体命令行（如 Claude Code、Kimi CLI、MiniMax Code、Aider 等）。
3. **文件流转受阻**：无法使用 SCP / SFTP / FTP 或 U 盘自由传输数据。
4. **但办公机往往只有一个口子是畅通的**：**标准的 Web 浏览器，能访问 HTTP/HTTPS 网页。**

### CLI Web Deck 的解题思路
**“一台 VPS，只要有浏览器，处处皆是开发机与 AI 超算。”**

用户只需要一台能够联网的 VPS 云服务器（或者一台有公网固定 IP / 域名的主机），在上面运行 `cli-web-deck`：
* **单端口穿透**：网页界面、终端 WebSocket、文件拖拽上传与下载全部跑在**单个 HTTP 端口**上。在封闭网络中无需申请多端口开放，公网 IP 直连或域名反代均可无缝访问。
* **双向文件拖拽交互**：受限办公机里的 Excel、需求文档直接往浏览器网页里一拖，瞬间流式写入远端工作区；Agent 生成的报表、代码、PPT 成果在网页侧边栏直接一键下载。
* **tmux 会话永续**：办公电脑合盖下班、网络突然波动、网页误关闭，远端的复杂大模型推理和批量计算仍在后台平稳运行；重新打开浏览器瞬间接回原现场。

### 常用运行示例
```bash
# 1. 最基础：把 Linux Bash 终端直接搬上浏览器
cli-web-deck --cmd "bash" --port 8080

# 2. 运行 Kimi / MiniMax / Claude 等 AI Agent，指定独立工作区
cli-web-deck --cmd "kimi" --port 8010 --workspace /data/kimi-workspace

# 3. 运行 Python 交互式数据分析环境，并开启基础账号密码认证
cli-web-deck --cmd "python3 -m IPython" --port 8888 --auth "admin:myPassword123"
```

---

## 📄 License

MIT License © 2026 HankGuo
