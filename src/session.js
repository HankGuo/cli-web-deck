const { spawn, execSync, spawnSync } = require('child_process');

class SessionManager {
  constructor(options = {}) {
    this.sessionName = options.sessionName || 'cli-deck-default';
    this.command = options.command || process.env.SHELL || 'bash';
    this.workspace = options.workspace || process.cwd();
    this.internalPort = options.internalPort || 39876;
    this.ttydProcess = null;
  }

  checkPrerequisites() {
    try {
      execSync('which tmux', { stdio: 'ignore' });
    } catch {
      throw new Error('tmux is required but not installed. Please install it (e.g. apt install tmux or brew install tmux).');
    }

    try {
      execSync('which ttyd', { stdio: 'ignore' });
    } catch {
      throw new Error('ttyd is required but not installed. Please install it (e.g. apt install ttyd or see https://github.com/tsl0922/ttyd).');
    }
  }

  hasTmuxSession() {
    const res = spawnSync('tmux', ['has-session', '-t', this.sessionName], { stdio: 'ignore' });
    return res.status === 0;
  }

  ensureTmuxSession() {
    if (!this.hasTmuxSession()) {
      console.log(`[Session] Creating new persistent tmux session "${this.sessionName}"...`);
      const args = [
        'new-session',
        '-d',
        '-s', this.sessionName,
        '-c', this.workspace,
        this.command
      ];
      const res = spawnSync('tmux', args, { stdio: 'inherit' });
      if (res.status !== 0) {
        throw new Error(`Failed to create tmux session "${this.sessionName}".`);
      }
    } else {
      console.log(`[Session] Existing tmux session "${this.sessionName}" detected. Re-attaching.`);
    }
  }

  startTTYD() {
    this.ensureTmuxSession();

    console.log(`[TTYD] Starting ttyd on 127.0.0.1:${this.internalPort}...`);
    const ttydArgs = [
      '-p', String(this.internalPort),
      '-i', '127.0.0.1',
      '-W', // writable
      '-t', 'fontSize=14',
      '-t', 'theme={"background": "#0d1117"}',
      'tmux', 'attach-session', '-t', this.sessionName
    ];

    this.ttydProcess = spawn('ttyd', ttydArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    this.ttydProcess.stdout.on('data', (d) => {
      // console.log(`[ttyd stdout] ${d}`);
    });

    this.ttydProcess.stderr.on('data', (d) => {
      // console.error(`[ttyd stderr] ${d}`);
    });

    this.ttydProcess.on('exit', (code, signal) => {
      console.log(`[TTYD] Process exited with code ${code}, signal ${signal}.`);
    });

    return this.ttydProcess;
  }

  resetSession() {
    console.log(`[Session] Resetting session "${this.sessionName}"...`);
    if (this.hasTmuxSession()) {
      spawnSync('tmux', ['kill-session', '-t', this.sessionName], { stdio: 'ignore' });
    }
    this.ensureTmuxSession();
  }

  stop() {
    if (this.ttydProcess) {
      try {
        this.ttydProcess.kill('SIGTERM');
      } catch {}
    }
  }
}

module.exports = SessionManager;
