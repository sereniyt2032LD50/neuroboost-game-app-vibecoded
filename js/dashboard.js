class NeuroDashboard {
    constructor() {
        this.navLogo = document.getElementById('nav-logo');
        this.btnNavDashboard = document.getElementById('btn-nav-dashboard');
        this.btnNavStats = document.getElementById('btn-nav-stats');
        
        this.screens = {
            dashboard: document.getElementById('screen-dashboard'),
            stats: document.getElementById('screen-stats'),
            matrix: document.getElementById('screen-game-matrix'),
            stroop: document.getElementById('screen-game-stroop'),
            schulte: document.getElementById('screen-game-schulte'),
            math: document.getElementById('screen-game-math')
        };
        
        // Game Instances
        this.games = {
            matrix: new MemoryMatrixGame(),
            stroop: new StroopGame(),
            schulte: new SchulteGame(),
            math: new MathRushGame()
        };

        this.activeGameKey = null;
        
        this.setupNavigation();
        this.initDashboard();
    }

    setupNavigation() {
        // Nav logo / Home click
        this.navLogo.addEventListener('click', () => {
            Sound.playClick();
            this.switchScreen('dashboard');
        });

        // Dashboard Navigation Button
        this.btnNavDashboard.addEventListener('click', () => {
            Sound.playClick();
            this.switchScreen('dashboard');
        });

        // Analytics Navigation Button
        this.btnNavStats.addEventListener('click', () => {
            Sound.playClick();
            this.switchScreen('stats');
            this.renderAnalytics();
        });

        // Game Card play triggers
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const gameKey = card.dataset.game;
                Sound.playClick();
                this.startSession(gameKey);
            });
        });

        // Quit triggers
        document.getElementById('btn-quit-matrix').addEventListener('click', () => this.quitActiveSession());
        document.getElementById('btn-quit-stroop').addEventListener('click', () => this.quitActiveSession());
        document.getElementById('btn-quit-schulte').addEventListener('click', () => this.quitActiveSession());
        document.getElementById('btn-quit-math').addEventListener('click', () => this.quitActiveSession());
    }

    switchScreen(screenKey) {
        // Update active nav button
        if (screenKey === 'dashboard') {
            this.btnNavDashboard.classList.add('active');
            this.btnNavStats.classList.remove('active');
        } else if (screenKey === 'stats') {
            this.btnNavDashboard.classList.remove('active');
            this.btnNavStats.classList.add('active');
        } else {
            this.btnNavDashboard.classList.remove('active');
            this.btnNavStats.classList.remove('active');
        }

        // Switch screen active classes
        Object.keys(this.screens).forEach(key => {
            if (key === screenKey) {
                this.screens[key].classList.add('active');
            } else {
                this.screens[key].classList.remove('active');
            }
        });
    }

    initDashboard() {
        // Get Stats
        const neuroScore = Storage.calculateNeuroScore();
        const streak = Storage.getStreak();
        const sessions = Storage.getSessionsCount();
        const highScores = Storage.getHighScores();

        // Update stats counters
        document.getElementById('val-neuro-score').textContent = neuroScore;
        document.getElementById('val-streak').textContent = `${streak}d`;
        document.getElementById('val-sessions').textContent = sessions;

        // Update individual high scores
        document.getElementById('high-matrix').textContent = highScores.matrix;
        document.getElementById('high-stroop').textContent = highScores.stroop;
        document.getElementById('high-schulte').textContent = highScores.schulte ? `${highScores.schulte}s` : '--';
        document.getElementById('high-math').textContent = highScores.math;
    }

    startSession(gameKey) {
        this.activeGameKey = gameKey;
        this.switchScreen(gameKey);
        
        // Reset overlay display
        const overlay = document.getElementById(`overlay-${gameKey}`);
        if (overlay) overlay.style.display = 'flex';
        
        // Re-inject standard intro text inside overlay in case it was overwritten by game over screen
        if (gameKey === 'matrix') {
            overlay.innerHTML = `
                <h2>Memory Matrix</h2>
                <p>Look at the grid pattern. After the squares disappear, click the positions they previously occupied. The board will expand as you succeed.</p>
                <button class="btn-start" id="btn-start-matrix">Initialize Grid</button>
            `;
            document.getElementById('btn-start-matrix').addEventListener('click', () => this.games.matrix.startGame());
        } else if (gameKey === 'stroop') {
            overlay.innerHTML = `
                <h2>Stroop Reflex</h2>
                <p>Pay strict attention to the colored word and instructions. You will be asked to either match the font color OR the written text meaning. Respond as fast as possible.</p>
                <button class="btn-start" id="btn-start-stroop">Start Reflex Test</button>
            `;
            document.getElementById('btn-start-stroop').addEventListener('click', () => this.games.stroop.startGame());
        } else if (gameKey === 'schulte') {
            overlay.innerHTML = `
                <h2>Schulte Grid</h2>
                <p>Click the numbers from 1 to 16 (or 1 to 25) in ascending order. Keep your focus on the center of the grid and use your peripheral vision to find targets quickly.</p>
                <button class="btn-start" id="btn-start-schulte">Initialize Grid</button>
            `;
            document.getElementById('btn-start-schulte').addEventListener('click', () => this.games.schulte.startGame());
        } else if (gameKey === 'math') {
            overlay.innerHTML = `
                <h2>Equation Rush</h2>
                <p>Determine whether the arithmetic equations shown on the screen are correct. Correct responses build your combo and extend the clock.</p>
                <button class="btn-start" id="btn-start-math">Initialize Equation Rush</button>
            `;
            document.getElementById('btn-start-math').addEventListener('click', () => this.games.math.startGame());
        }
    }

    quitActiveSession() {
        Sound.playClick();
        if (this.activeGameKey) {
            // Stop active timers
            const gameObj = this.games[this.activeGameKey];
            if (gameObj.timer) clearInterval(gameObj.timer);
            if (gameObj.gameActive !== undefined) gameObj.gameActive = false;
            if (gameObj.interactive !== undefined) gameObj.interactive = false;
            
            this.activeGameKey = null;
        }
        this.initDashboard();
        this.switchScreen('dashboard');
    }

    renderAnalytics() {
        const history = Storage.getHistory();
        const historyLog = document.getElementById('history-log');
        
        // 1. Render history list logs
        if (history.length === 0) {
            historyLog.innerHTML = `
                <div style="color: var(--text-secondary); border: none; justify-content: center; padding-top: 2rem; display: flex;">
                    No training sessions logged yet.
                </div>
            `;
        } else {
            historyLog.innerHTML = '';
            history.forEach(item => {
                const row = document.createElement('div');
                row.className = 'history-item';
                
                const gameName = this.formatGameName(item.game);
                const displayScore = item.game === 'schulte' ? `${item.score.toFixed(2)}s` : `${item.score} pts`;
                const dateFormatted = new Date(item.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                row.innerHTML = `
                    <div>
                        <div class="history-game">${gameName}</div>
                        <div class="history-date">${dateFormatted}</div>
                    </div>
                    <div class="history-score">${displayScore}</div>
                `;
                historyLog.appendChild(row);
            });
        }

        // 2. Draw custom Canvas chart
        this.drawAnalyticsChart(history);
    }

    formatGameName(key) {
        switch(key) {
            case 'matrix': return 'Memory Matrix';
            case 'stroop': return 'Stroop Reflex';
            case 'schulte': return 'Schulte Grid';
            case 'math': return 'Equation Rush';
            default: return key;
        }
    }

    normalizeScore(game, score) {
        if (game === 'matrix') return Math.min((score / 120) * 1000, 1000);
        if (game === 'stroop') return Math.min((score / 100) * 1000, 1000);
        if (game === 'math') return Math.min((score / 80) * 1000, 1000);
        if (game === 'schulte') {
            const maxSeconds = 35;
            const minSeconds = 8;
            if (score >= maxSeconds) return 200;
            if (score <= minSeconds) return 1000;
            return 200 + (1 - (score - minSeconds) / (maxSeconds - minSeconds)) * 800;
        }
        return score;
    }

    drawAnalyticsChart(history) {
        const canvas = document.getElementById('analytics-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Handle High DPI scaling
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Prep data (last 10 items in chronological order)
        const chartData = history.slice(0, 10).reverse().map((item, idx) => ({
            index: idx,
            normalized: this.normalizeScore(item.game, item.score),
            label: this.formatGameName(item.game),
            scoreRaw: item.game === 'schulte' ? `${item.score.toFixed(1)}s` : item.score
        }));

        if (chartData.length === 0) {
            // Draw placeholder text
            ctx.fillStyle = '#8b9bb4';
            ctx.font = '16px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Train a few times to display progress index', width / 2, height / 2);
            return;
        }

        // Layout bounds
        const padding = { top: 30, right: 30, bottom: 40, left: 50 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        // Draw Y-axis grid lines (0, 250, 500, 750, 1000 index)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '11px Share Tech Mono, monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const yLevels = [0, 250, 500, 750, 1000];
        yLevels.forEach(val => {
            const y = padding.top + graphHeight - (val / 1000) * graphHeight;
            
            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Label
            ctx.fillText(val, padding.left - 10, y);
        });

        // X-axis mapping function
        const getX = (idx) => {
            if (chartData.length === 1) return padding.left + graphWidth / 2;
            return padding.left + (idx / (chartData.length - 1)) * graphWidth;
        };

        // Y-axis mapping function
        const getY = (val) => {
            return padding.top + graphHeight - (val / 1000) * graphHeight;
        };

        // Draw Fill Gradient under line
        if (chartData.length > 1) {
            ctx.beginPath();
            ctx.moveTo(getX(0), getY(0));
            chartData.forEach(pt => {
                ctx.lineTo(getX(pt.index), getY(pt.normalized));
            });
            ctx.lineTo(getX(chartData.length - 1), getY(0));
            ctx.closePath();

            const fillGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + graphHeight);
            fillGrad.addColorStop(0, 'rgba(0, 242, 254, 0.15)');
            fillGrad.addColorStop(1, 'rgba(157, 78, 221, 0.0)');
            ctx.fillStyle = fillGrad;
            ctx.fill();
        }

        // Draw Line Path
        ctx.beginPath();
        chartData.forEach((pt, idx) => {
            if (idx === 0) {
                ctx.moveTo(getX(pt.index), getY(pt.normalized));
            } else {
                ctx.lineTo(getX(pt.index), getY(pt.normalized));
            }
        });
        
        ctx.lineWidth = 3;
        const lineGrad = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
        lineGrad.addColorStop(0, '#00f2fe');
        lineGrad.addColorStop(1, '#9d4edd');
        ctx.strokeStyle = lineGrad;
        ctx.stroke();

        // Draw Node Dots & text labels
        chartData.forEach(pt => {
            const cx = getX(pt.index);
            const cy = getY(pt.normalized);

            // Outer glow ring
            ctx.beginPath();
            ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 242, 254, 0.3)';
            ctx.fill();

            // Inner solid dot
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Label text (raw score)
            ctx.fillStyle = '#f1f3f9';
            ctx.font = '10px Share Tech Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(pt.scoreRaw, cx, cy - 12);

            // Short Game Initials on X-axis
            const labelInitials = pt.label.split(' ').map(w => w[0]).join('');
            ctx.fillStyle = '#8b9bb4';
            ctx.font = '11px Outfit, sans-serif';
            ctx.fillText(labelInitials, cx, padding.top + graphHeight + 18);
        });
    }
}

// Global Launcher
window.addEventListener('DOMContentLoaded', () => {
    window.Dashboard = new NeuroDashboard();
});
