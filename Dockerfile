FROM node:20-bookworm-slim

# Install system dependencies: ttyd and tmux
RUN apt-get update && apt-get install -y --no-install-recommends \
    ttyd \
    tmux \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application files
COPY package.json ./
COPY bin ./bin
COPY src ./src

RUN chmod +x ./bin/cli-web-deck && npm link

# Default workspace directory
WORKDIR /workspace

EXPOSE 8080

CMD ["cli-web-deck", "--cmd", "bash", "--port", "8080", "--workspace", "/workspace"]
