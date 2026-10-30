# CLI Web Deck 🚀

<div align="center">

**将任意服务端命令行与 AI 智能体，转化为免安装的现代化浏览器工作台**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=18](https://img.shields.io/badge/Node->=18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](https://github.com/HankGuo/cli-web-deck/pulls)

**[ 🇺🇸 English ](README.md)** · **[ 🇨🇳 简体中文 ](README.zh-CN.md)**

</div>

---

## 💡 为什么需要 CLI Web Deck？

### 典型使用场景：轻量终端与免配置办公
在日常开发、数据分析与 AI 工具协作中，我们常常遇到以下情况：
* **不便在本地安装复杂环境**：在使用轻薄本、出差临时电脑、平板设备或受管工作机时，本地往往不具备或不方便安装繁重的底层运行时（如特定版本的 Python、Node.js、CUDA、Docker）以及各类庞大的 CLI 智能体依赖包。
* **远端算力与本地界面的割裂**：算力、模型凭据与脚本存放在云端 VPS 或团队服务器上，但传统工具难以直接提供友好的文件双向拖拽与开箱即用的 Web 交互。
* **会话保持诉求**：长时间运行的数据处理或 AI 规划任务，容易因为本地设备休眠、网络切换而意外中断。

### 解题思路
**“一台远端主机，只要有浏览器，处处皆可免安装操作。”**

**CLI Web Deck** 在远端服务器与现代浏览器之间搭起了一座轻量桥梁：
1. **浏览器即用，零本地安装**：无需在当前使用的终端机上安装任何开发工具，打开浏览器即可流畅操控服务器上的完整 CLI 流程。
2. **单端口极简通信**：终端交互、WebSocket 实时传输与文件双向流转全部复用在**单个 HTTP 端口**（例如 `8080`），方便通过公网 IP 或标准 Nginx / Caddy 域名轻松反代。
3. **直观的双向文件流转**：支持直接将本地数据文件拖入浏览器窗口，流式上传至工作区；并在侧边栏直接查看和一键下载产出的分析报告与成果。
4. **会话永续保障**：底层基于 `tmux` 会话管理，本地关闭浏览器、合上电脑屏幕均不影响远端任务持续执行，重新连接瞬间恢复原上下文。

---

## ⚡ 核心功能特性

* **⚡ 兼容任意命令行**：支持系统终端（`bash`、`zsh`）、语言环境（`python`、`ipython`、`node`）以及各类新兴 AI CLI 智能体（`claude`、`kimi`、`minimax`、`aider` 等）。
* **🌐 单端口多路复用**：页面 UI、终端数据流与文件管理均收敛于单一端口，无论是公网 IP 直连还是域名挂载均无复杂配置。
* **📁 全屏与侧栏文件拖拽**：支持将文件直接拖放至网页任意位置，流式写入远端工作区，突破传统终端文件传输繁琐的痛点。
* **📦 工作区成果浏览器**：内置可折叠侧边栏，支持实时文件列表刷新、体积查看与单键下载。
* **🔒 灵活安全认证**：支持一键开启 HTTP Basic Auth 访问口令认证（`--auth "user:pass"`）。
* **🐳 完善的工程生态**：提供一键安装脚本、Docker 镜像、Docker Compose 及 Systemd 守护进程模板。

---

## 🚀 极速上手

### 1. 环境准备
确保服务器已安装 `tmux`、`ttyd` 与 `Node.js (v18+)`：
```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y tmux ttyd curl

# macOS
brew install tmux ttyd
```

### 2. 获取代码与运行
```bash
git clone https://github.com/HankGuo/cli-web-deck.git
cd cli-web-deck
chmod +x ./bin/cli-web-deck

# 1. 最基础：把 Linux Bash 终端直接搬上浏览器
./bin/cli-web-deck --cmd "bash" --port 8080

# 2. 运行指定 AI 智能体 CLI 并挂载专属工作区
./bin/cli-web-deck --cmd "kimi" --port 8010 --workspace ~/my-workspace

# 3. 运行 Python 数据分析环境，并开启基础账号密码认证
./bin/cli-web-deck --cmd "python3 -m IPython" --port 8888 --auth "admin:myPassword123"
```

在本地浏览器中打开 `http://<服务器IP或域名>:8080` 即可开始使用。

---

## ⚙️ 参数配置说明

| 参数 | 缩写 | 作用说明 | 默认值 |
| :--- | :--- | :--- | :--- |
| `--cmd` | `-c` | 需要暴露的终端命令（如 `bash`、`python3` 等） | 当前 `$SHELL` |
| `--port` | `-p` | 外部访问的 HTTP/WS 端口 | `8080` |
| `--workspace` | `-w` | 文件上传与命令执行的工作区路径 | 当前运行目录 |
| `--title` | `-t` | Web 界面顶部展示的自定义应用标题 | `"CLI Web Deck"` |
| `--auth` | `-a` | 访问安全凭据（格式为 `用户名:密码`） | `None`（公开） |
| `--session` | `-s` | 指定绑定的底层 tmux 会话名称 | 自动生成 |
| `--host` | `-h` | 服务监听的网络接口 | `0.0.0.0` |

---

## 🐳 Docker 容器化部署

```bash
docker build -t cli-web-deck .
docker run -d -p 8080:8080 -v $(pwd)/workspace:/workspace cli-web-deck
```

或使用 Docker Compose 启动：
```bash
docker compose -f templates/docker-compose.yml up -d
```

---

## 🛡️ 生产级反向代理（Nginx 模板）

项目中提供了开箱即用的反代配置 `templates/nginx.conf`：
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

## ⚠️ 安全提示与免责声明

1. **安全认证建议**：当服务暴露于公网时，请务必启用 `--auth` 参数设置强口令，或将其部署于反向代理之后并配置 HTTPS/TLS 证书。
2. **合规使用声明**：本软件为基于 MIT 协议发布的开源通用开发工具，旨在提升跨终端与轻量设备下的开发与运维效率。使用者在使用本工具接入远程主机或网络时，应严格遵守所在机构的网络安全规范与数据管理制度。使用者应对其运行的命令及传输的数据独立承担全部责任。

---

## 📄 开源许可

本项目遵循 [MIT License](LICENSE) 协议发布。
