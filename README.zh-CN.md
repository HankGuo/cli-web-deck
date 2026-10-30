# CLI Web Deck 🚀

<div align="center">

**把你在任何电脑上顺手的 CLI 与 AI 智能体，直接暴露为一个属于你的 Web 工作台**  
*无需对接飞书、微信或复杂的机器人通道，只要有浏览器，就能直接调遣你在主力机上配置好的智能体。*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=18](https://img.shields.io/badge/Node->=18-brightgreen.svg)](https://nodejs.org)
[![Platform: Linux | macOS | WSL2](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20WSL2-blueviolet.svg)](#-操作系统兼容性说明)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](https://github.com/HankGuo/cli-web-deck/pulls)

**[ 🇺🇸 English ](README.md)** · **[ 🇨🇳 简体中文 ](README.zh-CN.md)**

<br/>

<img src="assets/diagram.svg" alt="CLI Web Deck Architecture" width="100%" />

</div>

---

## 💡 核心设计思想：我们在做什么？

你平时肯定有一台**配置最顺手、工具最齐全、API Key 和脚本都在的主力电脑**（可能是家里的高配台式机、办公室的主力工作站，或是自己的云主机）。上面跑着你调教好的各种优秀 CLI 工具与 AI 智能体：
* **Claude Code** (Anthropic 官方编码智能体)
* **Codex / LLM CLI** (OpenAI / 本地大模型命令行)
* **Kimi Code** (月之暗面超长上下文智能体)
* **MiniMax Code** (极速出稿与自动化编排智能体)
* **Aider / IPython / 数据分析脚本**

平时想在其他设备（出差轻薄本、平板、临时借用的电脑、受管办公机）上使用这套顺手的能力时，传统的做法是：
* 给它对接一个**飞书机器人、微信公众号或 Slack Bot** —— 但接入流程极其繁琐，消息格式受限，不支持全屏交互，且大文件传输很不方便；
* 或者开一套笨重缓慢的远程桌面（VNC / RDP）。

### CLI Web Deck 的解法
**“等同于为你主力机上的 CLI Agent，暴露一个专属的纯净 Web 通道。”**

你顺手的 Agent 在哪台电脑上，运行一次 `cli-web-deck`，就能把该环境直接化为一个极简、高颜值的 Web 页面：
* **免去 IM 机器人对接**：不用去飞书/微信开放平台申请开发者账号与 Webhook；
* **原汁原味原生终端体验**：浏览器里就是全功能终端，支持全键盘快捷键、ANSI 彩色与实时流式吐字；
* **双向文件无感流转**：把数据表格直接**拖入浏览器**即可传给远端 Agent；产出的分析报告与交付物在侧边栏**一键下载**；
* **单例会话保活**：基于底层单例 `tmux` 会话，关掉网页下班回家，远端任务照样跑，换台设备打开浏览器瞬间接回原现场。

---

## ⚡ 核心设计优势（解决常见工程顾虑）

针对生产环境与长时间挂机运行，CLI Web Deck 在架构上做了严密设计：

### 1. 严格的单例会话守护（防进程无限蔓延）
* **常见顾虑**：如果开多个网页标签页，或者频繁按 F5 刷新，服务器会不会无限创建新的 agent 进程，导致 CPU/内存暴涨卡死？
* **架构保障**：`cli-web-deck` 强制实施**单例会话绑定机制**。每一个启动的端口和工作区严格绑定唯一的 `tmux` 会话名。无论同时打开 1 个还是 10 个网页标签页，均接入同一个正在运行的后台会话，**绝不会无限重复创建进程**，彻底杜绝服务器资源雪崩。

### 2. 单端口全功能多路复用（Single-Port Multiplexing）
* 将现代 Web 控制台、终端 WebSocket 数据流、文件流式上传 API 以及文件下载服务**全部收敛于单个端口**（如 `8080`）。
* 对外暴露时无需配置繁琐的多端口映射，无论是服务器公网 IP 直连，还是套在现有 Nginx / Caddy 域名后，都极为清爽。

### 3. 流式无缓冲大文件双向拖拽
* 文件上传采用纯流式管道（Streaming Pipe）写入工作区磁盘，不在 Node 进程内存中做全量堆积，传输几十兆乃至上百兆的大型数据集或工程文件毫无压力。

---

## 💻 操作系统兼容性说明 (OS Support Matrix)

为确保稳定可靠，特此明确本框架在不同操作系统下的验证情况：

| 操作系统环境 | 支持状态 | 说明与建议 |
| :--- | :--- | :--- |
| **Linux (Ubuntu / Debian / CentOS / Arch / Alpine)** | **原生完全支持 (Verified & Recommended)** | 首选运行环境。依赖的 `tmux` 与 `ttyd` 均有原生二进制包，性能最高。 |
| **macOS (Apple Silicon M系列 / Intel x86)** | **原生完全支持 (Verified & Recommended)** | 经充分验证。直接通过 `brew install tmux ttyd` 即可开箱即用。 |
| **Windows + WSL2 (Linux 子系统)** | **完全支持 (Recommended for Windows)** | 在 WSL2（如 Ubuntu on Windows）中运行体验与原生 Linux 完全一致，强烈推荐。 |
| **Windows + Docker Desktop** | **完全支持 (Recommended for Windows)** | 通过 Docker 容器运行，与底层操作系统解耦，开箱即用。 |
| **Windows 原生 (PowerShell / CMD 直接运行)** | **⚠️ 未经测试 (Experimental / Untested)** | 因核心依赖于 POSIX 进程标准的 `tmux` 与 PTY 机制，目前**未在 Windows 原生命令行环境下进行过测试**。在 Windows 机器上，请务必通过 **WSL2** 或 **Docker** 运行。 |

---

## 🚀 极速上手

### 1. 宿主机依赖安装
在放有你 Agent 的机器（Linux / macOS / WSL2）上安装必要工具：
```bash
# Ubuntu / Debian / WSL2
sudo apt update && sudo apt install -y tmux ttyd curl

# macOS
brew install tmux ttyd
```

### 2. 启动你的 Web 通道
```bash
git clone https://github.com/HankGuo/cli-web-deck.git
cd cli-web-deck
chmod +x ./bin/cli-web-deck

# 1. 启动 Claude Code 并挂载专属工作区
./bin/cli-web-deck --cmd "claude" --port 8080 --workspace ~/projects/ai-work

# 2. 启动 Kimi Code 或 MiniMax Code
./bin/cli-web-deck --cmd "kimi" --port 8010 --workspace ~/kimi-workspace

# 3. 启动交互式 Python 数据分析环境，并开启账号密码保护
./bin/cli-web-deck --cmd "python3 -m IPython" --port 8888 --auth "admin:myPassword123"
```

在任意设备的浏览器中输入 `http://<机器IP或域名>:8080`，即可开始使用。

---

## ⚙️ 参数选项速查

| 参数 | 缩写 | 作用说明 | 默认值 |
| :--- | :--- | :--- | :--- |
| `--cmd` | `-c` | 需要暴露的终端命令（如 `claude`、`kimi`、`bash` 等） | 当前系统的 `$SHELL` |
| `--port` | `-p` | 浏览器访问的 Web 端口（单端口复用） | `8080` |
| `--workspace` | `-w` | 关联的工作区目录（上传文件与产出保存于此） | 当前运行目录 |
| `--title` | `-t` | 浏览器顶部栏显示的标题名称 | `"CLI Web Deck"` |
| `--auth` | `-a` | 访问安全口令（格式：`用户名:密码`） | `None`（公开） |
| `--session` | `-s` | 指定底层 tmux 会话名称 | 自动生成 |
| `--host` | `-h` | 服务绑定的网络监听接口 | `0.0.0.0` |

---

## 🐳 Docker 部署（可选）

如果你习惯容器化管理：
```bash
docker build -t cli-web-deck .
docker run -d -p 8080:8080 -v $(pwd)/workspace:/workspace cli-web-deck
```

或者使用 Docker Compose：
```bash
docker compose -f templates/docker-compose.yml up -d
```

---

## 🛡️ 生产级反向代理（Nginx 模板）

如需配合独立域名或已有 Nginx：
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

## ⚠️ 潜在风险、安全与合规免责声明

在将服务部署并接入网络时，请充分知悉以下技术与安全事项：

1. **执行权限控制（严禁以 Root 启动）**：
   * 浏览器终端内的执行权限严格继承自启动 `cli-web-deck` 的系统用户；
   * **严禁在公网或生产服务器上以 `root` 超级用户权限运行本程序**。建议创建独立的非特权系统用户（如 `agent-user`）并设置只读沙箱。
2. **公网暴露防护（强密码与 TLS）**：
   * 若绑定到 `0.0.0.0` 并拥有公网 IP 或域名，**必须开启 `--auth "user:pass"` 设置高强度认证口令**，或在前端 Nginx/Caddy 配置 SSL/TLS 证书加密；
   * 避免明文 HTTP 暴露导致敏感指令或文件被拦截。
3. **计算与 API 资源限额**：
   * 自主型智能体（如 Claude Code、Aider 等）在连续执行循环任务时，可能消耗大量 CPU 算力或产生较高的第三方 LLM Token 调用费用；请在智能体自身配置文件中设定好预算上限与最大执行步数。
4. **开源免责声明**：
   * 本项目遵循 [MIT License](LICENSE) 协议发布，仅作为个人或团队连接自有主机的通用生产力工具；
   * 使用者在部署与使用时，须严格遵守所在组织的网络合规准则、信息安全规范及法律法规；开发者不对因配置不当、密码泄露或违规使用造成的任何数据损失或安全事件承担责任。

---

## 📄 License

MIT License © 2026 HankGuo
