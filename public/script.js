// State management
const state = {
    history: [],
    stats: {
        sitesAccessed: 0,
        bytesTransferred: 0,
        loadTimes: []
    }
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('matrixState');
    if (saved) {
        Object.assign(state, JSON.parse(saved));
        updateUI();
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('matrixState', JSON.stringify(state));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
    typeWriter();
});

// Setup event listeners
function setupEventListeners() {
    const urlForm = document.getElementById('urlForm');
    const modal = document.getElementById('contentModal');
    const closeBtn = document.querySelector('.close-btn');

    urlForm.addEventListener('submit', handleUrlSubmit);
    closeBtn.addEventListener('click', () => closeModal());
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Handle URL submission
async function handleUrlSubmit(e) {
    e.preventDefault();
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const statusMessage = document.getElementById('statusMessage');

    // Validate URL
    if (!isValidUrl(url)) {
        showStatus('Invalid URL format. Please use https://example.com', 'error');
        return;
    }

    try {
        showStatus('Accessing website...', 'success');
        const startTime = performance.now();

        // Simulate accessing the website
        await simulateAccess(url);

        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);

        // Update stats
        state.stats.sitesAccessed++;
        state.stats.bytesTransferred += Math.random() * 5000;
        state.stats.loadTimes.push(loadTime);

        // Add to history
        state.history.unshift({
            url: url,
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            loadTime: loadTime
        });

        // Keep only last 50 items
        if (state.history.length > 50) {
            state.history.pop();
        }

        saveState();
        updateUI();
        urlInput.value = '';

        showStatus(`✓ Successfully accessed in ${loadTime}ms`, 'success');
        setTimeout(() => showStatus('', ''), 3000);

        // Display content
        displayContent(url);

    } catch (error) {
        showStatus('Error accessing website: ' + error.message, 'error');
    }
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Simulate accessing website (for demo purposes)
function simulateAccess(url) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, Math.random() * 2000 + 500);
    });
}

// Display content in modal
function displayContent(url) {
    const modal = document.getElementById('contentModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2>Accessing: ${new URL(url).hostname}</h2>
        <div style="margin-top: 20px; padding: 20px; border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 3px;">
            <p><strong>URL:</strong> ${url}</p>
            <p><strong>Status:</strong> <span style="color: #00ff00;">Connected</span></p>
            <p style="margin-top: 15px; font-size: 0.9rem; color: rgba(0, 255, 0, 0.7);">
                This is a demo proxy interface. In a production environment, the website content would be loaded here.
            </p>
            <div style="margin-top: 20px; padding: 15px; background-color: rgba(0, 255, 0, 0.05); border-left: 3px solid #00ff00; border-radius: 3px;">
                <p><strong>Connection Info:</strong></p>
                <p>Host: ${new URL(url).hostname}</p>
                <p>Protocol: ${new URL(url).protocol}</p>
                <p>Data transferred: ~${Math.round(Math.random() * 500)}KB</p>
                <p>Response time: ${state.stats.loadTimes[state.stats.loadTimes.length - 1]}ms</p>
            </div>
        </div>
    `;

    openModal();
}

// Open modal
function openModal() {
    const modal = document.getElementById('contentModal');
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('contentModal');
    modal.classList.remove('active');
}

// Show status message
function showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

// Update UI
function updateUI() {
    updateStats();
    updateHistory();
}

// Update statistics
function updateStats() {
    const sitesAccessed = document.getElementById('sitesAccessed');
    const bytesTransferred = document.getElementById('bytesTransferred');
    const avgLoadTime = document.getElementById('avgLoadTime');

    sitesAccessed.textContent = state.stats.sitesAccessed;

    const bytes = Math.round(state.stats.bytesTransferred);
    if (bytes > 1024 * 1024) {
        bytesTransferred.textContent = (bytes / (1024 * 1024)).toFixed(2) + 'MB';
    } else if (bytes > 1024) {
        bytesTransferred.textContent = (bytes / 1024).toFixed(2) + 'KB';
    } else {
        bytesTransferred.textContent = bytes + 'B';
    }

    if (state.stats.loadTimes.length > 0) {
        const avg = Math.round(
            state.stats.loadTimes.reduce((a, b) => a + b, 0) / state.stats.loadTimes.length
        );
        avgLoadTime.textContent = avg + 'ms';
    }
}

// Update history
function updateHistory() {
    const historyList = document.getElementById('historyList');

    if (state.history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No history yet. Enter a URL to get started.</p>';
        return;
    }

    historyList.innerHTML = state.history.map((item, index) => `
        <div class="history-item" onclick="accessHistoryItem('${item.url}')">
            <div>
                <div class="history-url">${item.url}</div>
                <div style="font-size: 0.8rem; color: rgba(0, 255, 0, 0.5); margin-top: 5px;">${item.date} at ${item.timestamp}</div>
            </div>
            <div class="history-time">${item.loadTime}ms</div>
        </div>
    `).join('');
}

// Access history item
function accessHistoryItem(url) {
    document.getElementById('urlInput').value = url;
    document.getElementById('urlForm').dispatchEvent(new Event('submit'));
}

// Typewriter effect for header
function typeWriter() {
    const header = document.querySelector('.tagline');
    const text = header.textContent;
    header.textContent = '';
    let index = 0;

    const type = () => {
        if (index < text.length) {
            header.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    };

    type();
}

// Matrix code rain effect (optional)
function addMatrixEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.05; z-index: 0;';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    const charSize = 20;
    const columns = Math.floor(canvas.width / charSize);
    const drops = new Array(columns).fill(canvas.height);

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff00';
        ctx.font = `${charSize}px monospace`;

        for (let i = 0; i < columns; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * charSize, drops[i] * charSize);

            if (drops[i] * charSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        requestAnimationFrame(draw);
    };

    draw();
}

// Uncomment to enable matrix code rain effect
// addMatrixEffect();
