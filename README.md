# CLI Web Deck 🚀

<div align="center">

**Turn Any Server-Side CLI Tool or AI Agent into a Zero-Install Web Workspace**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=18](https://img.shields.io/badge/Node->=18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](https://github.com/HankGuo/cli-web-deck/pulls)

**[ 🇺🇸 English ](README.md)** · **[ 🇨🇳 简体中文 ](README.zh-CN.md)**

</div>

---

## 💡 Why CLI Web Deck?

### Motivation: Zero-Install Lightweight Computing
When working across different devices — such as ultrabooks, tablets, temporary travel laptops, or managed office workstations:
* **Inconvenient to Install Heavy Toolchains**: Setting up dedicated Python environments, Node.js runtimes, CUDA drivers, Docker, or complex AI CLI agent toolchains on every client device is cumbersome, time-consuming, or sometimes restricted by local device policies.
* **Separation of Compute and Display**: Your heavy compute, API keys, and model environments reside on your remote server or cloud VPS, but traditional remote tools lack modern web ergonomics like bidirectional drag-and-drop file transfers.
* **Session Persistence**: Long-running computational jobs, model planning sessions, or batch scripts can easily get disrupted when a laptop sleeps or changes Wi-Fi networks.

### The Solution
**“One remote machine, accessible from any browser with zero local installation.”**

**CLI Web Deck** bridges your remote server and modern web browsers:
1. **Instant Browser Access**: No local software installation needed on the client. Just open any modern web browser to interact directly with your server's CLI tools.
2. **Single-Port Simplicity**: Terminal WebSocket streaming, web UI, and file transfer endpoints are all multiplexed onto **one single HTTP port** (e.g. `8080`), making it trivial to run behind Nginx/Caddy or connect directly via server IP.
3. **Bidirectional Drag-and-Drop**: Drop datasets, documents, or scripts directly onto the browser window to stream them into your remote workspace; browse and download output reports with a single click.
4. **Persistent Sessions (`tmux`)**: Background tasks keep executing even if you close the browser tab or disconnect; re-opening the page instantly reconnects to your exact session.

---

## ⚡ Key Features

* **⚡ Universal CLI Compatibility**: Works with standard shells (`bash`, `zsh`), language REPLs (`python`, `ipython`), and modern AI CLI assistants (`claude`, `kimi`, `minimax`, `aider`, etc.).
* **🌐 Single-Port Multiplexing**: Eliminates the need to open and manage multiple firewall ports.
* **📁 Drag & Drop File Transfer**: Seamlessly upload files into the workspace without configuring external FTP/SFTP clients.
* **📦 Workspace File Explorer**: Built-in collapsible sidebar to inspect file sizes, timestamps, and download outputs.
* **🔒 Built-in Authentication**: Optional HTTP Basic Auth via `--auth "username:password"`.
* **🐳 Complete Deployment Ecosystem**: Includes `install.sh`, Dockerfile, Docker Compose, and Systemd unit templates.

---

## 🚀 Quickstart

### 1. Prerequisites
Ensure `tmux`, `ttyd`, and `Node.js (v18+)` are installed on your server:
```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y tmux ttyd curl

# macOS
brew install tmux ttyd
```

### 2. Clone and Run
```bash
git clone https://github.com/HankGuo/cli-web-deck.git
cd cli-web-deck
chmod +x ./bin/cli-web-deck

# 1. Basic: Run Linux Bash in browser
./bin/cli-web-deck --cmd "bash" --port 8080

# 2. Run a specific AI CLI in a custom workspace
./bin/cli-web-deck --cmd "kimi" --port 8010 --workspace ~/my-workspace

# 3. Run Python IPython with basic authentication
./bin/cli-web-deck --cmd "python3 -m IPython" --port 8888 --auth "admin:myPassword123"
```

Open your browser at `http://<YOUR_SERVER_IP_OR_DOMAIN>:8080`.

---

## ⚙️ Options & Flags

| Flag | Shorthand | Description | Default |
| :--- | :--- | :--- | :--- |
| `--cmd` | `-c` | Command to execute in terminal | Current `$SHELL` |
| `--port` | `-p` | Public port for HTTP/WebSocket traffic | `8080` |
| `--workspace` | `-w` | Directory for file transfers and execution | Current working dir |
| `--title` | `-t` | Custom title shown in the web console header | `"CLI Web Deck"` |
| `--auth` | `-a` | Basic Auth credentials (`user:pass`) | `None` (Public) |
| `--session` | `-s` | Identifier for the underlying tmux session | Auto-generated |
| `--host` | `-h` | Host interface to bind to | `0.0.0.0` |

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

A ready-to-use template is available in `templates/nginx.conf`:
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

## ⚠️ Security Notice & Disclaimer

1. **Authentication**: When exposing CLI Web Deck to public networks or the Internet, always enable `--auth` or place the service behind a secure reverse proxy with TLS/HTTPS.
2. **Compliance & Disclaimer**: CLI Web Deck is distributed under the MIT License as an open-source productivity utility. It is intended to streamline remote computing and terminal accessibility across lightweight devices. Users are responsible for adhering to their organization's IT and data security policies when accessing remote hosts. The author(s) assume no liability for misuse.

---

## 📄 License

Released under the [MIT License](LICENSE).
