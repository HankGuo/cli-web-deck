document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State & Elements
  const deckTitleEl = document.getElementById('deck-title');
  const deckCmdEl = document.getElementById('deck-cmd');
  const fileListEl = document.getElementById('file-list');
  const fileInputEl = document.getElementById('file-input');
  const dropOverlayEl = document.getElementById('drop-overlay');
  const inlineDropzoneEl = document.getElementById('inline-dropzone');
  const sidebarEl = document.getElementById('files-sidebar');
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnResetSession = document.getElementById('btn-reset-session');
  const btnRefreshFiles = document.getElementById('btn-refresh-files');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const terminalFrame = document.getElementById('terminal-frame');

  // Load Status
  fetch('/api/status')
    .then(r => r.json())
    .then(data => {
      if (data.title) {
        deckTitleEl.innerText = data.title;
        document.title = `${data.title} · Console`;
      }
      if (data.command) deckCmdEl.innerText = data.command;
    })
    .catch(() => {});

  // 2. File Explorer & Download
  function loadFiles() {
    fetch('/api/files')
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.files || data.files.length === 0) {
          fileListEl.innerHTML = '<li class="file-empty">Workspace is empty. Drop files here!</li>';
          return;
        }

        fileListEl.innerHTML = data.files.map(f => {
          const sizeStr = formatBytes(f.size);
          const downloadUrl = `/api/files/${encodeURIComponent(f.name)}`;
          return `
            <li>
              <a class="file-item" href="${downloadUrl}" download title="${f.name}">
                <div class="file-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span class="file-name">${escapeHtml(f.name)}</span>
                </div>
                <span class="file-size">${sizeStr}</span>
              </a>
            </li>
          `;
        }).join('');
      })
      .catch(() => {
        fileListEl.innerHTML = '<li class="file-empty">Failed to load files</li>';
      });
  }

  loadFiles();
  btnRefreshFiles.addEventListener('click', loadFiles);

  // 3. File Upload Engine (Streaming binary x-filename)
  async function uploadFiles(files) {
    if (!files || files.length === 0) return;

    let count = 0;
    for (const file of files) {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'x-filename': encodeURIComponent(file.name)
          },
          body: file
        });
        const json = await res.json();
        if (json.success) count++;
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    showToast(`Uploaded ${count} file(s) to workspace`);
    loadFiles();
  }

  fileInputEl.addEventListener('change', (e) => {
    uploadFiles(e.target.files);
    fileInputEl.value = '';
  });

  // Drag and Drop (Fullscreen & Inline)
  window.addEventListener('dragenter', (e) => {
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      dropOverlayEl.classList.add('active');
    }
  });

  dropOverlayEl.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null || e.relatedTarget === document.documentElement) {
      dropOverlayEl.classList.remove('active');
    }
  });

  dropOverlayEl.addEventListener('dragover', (e) => e.preventDefault());

  dropOverlayEl.addEventListener('drop', (e) => {
    e.preventDefault();
    dropOverlayEl.classList.remove('active');
    if (e.dataTransfer && e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  });

  inlineDropzoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    inlineDropzoneEl.classList.add('dragover');
  });

  inlineDropzoneEl.addEventListener('dragleave', () => {
    inlineDropzoneEl.classList.remove('dragover');
  });

  inlineDropzoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    inlineDropzoneEl.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  });

  // 4. Session Controls (Restart / Reset)
  btnResetSession.addEventListener('click', () => {
    if (!confirm('Are you sure you want to restart this CLI session? All active tasks will terminate.')) {
      return;
    }

    fetch('/api/session/reset', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          showToast('Session restarted. Reconnecting terminal...');
          terminalFrame.src = '/terminal/?t=' + Date.now();
        } else {
          alert('Failed to reset: ' + res.error);
        }
      });
  });

  // 5. Sidebar & Fullscreen Toggles
  btnToggleSidebar.addEventListener('click', () => {
    sidebarEl.classList.toggle('collapsed');
    btnToggleSidebar.classList.toggle('active', !sidebarEl.classList.contains('collapsed'));
  });

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Helpers
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
});
