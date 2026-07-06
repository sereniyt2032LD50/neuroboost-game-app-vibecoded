class MemoryMatrixGame {
    constructor() {
        this.board = document.getElementById('matrix-grid-board');
        this.overlay = document.getElementById('overlay-matrix');
        this.btnStart = document.getElementById('btn-start-matrix');
        this.lvlDisplay = document.getElementById('matrix-lvl');
        this.scoreDisplay = document.getElementById('matrix-score');
        this.flashEffect = document.getElementById('flash-matrix');
        
        this.level = 1;
        this.score = 0;
        this.strikes = 0;
        this.gridSize = 3; // 3x3, 4x4, 5x5, 6x6
        this.targetCount = 3;
        this.targets = new Set();
        this.guesses = new Set();
        this.interactive = false;
        
        this.btnStart.addEventListener('click', () => this.startGame());
        
        // Quit button handler is handled in dashboard.js
    }

    startGame() {
        Sound.playClick();
        this.overlay.style.display = 'none';
        this.level = 1;
        this.score = 0;
        this.strikes = 0;
        this.updateStats();
        this.startRound();
    }

    updateStats() {
        this.lvlDisplay.textContent = this.level;
        this.scoreDisplay.textContent = this.score;
        
        // Update strikes UI
        for (let i = 1; i <= 3; i++) {
            const strikeIcon = document.getElementById(`strike-${i}`);
            if (strikeIcon) {
                if (i <= this.strikes) {
                    strikeIcon.className = 'fa-solid fa-circle-xmark';
                    strikeIcon.style.color = 'var(--red)';
                    strikeIcon.style.textShadow = '0 0 10px rgba(255, 0, 85, 0.5)';
                } else {
                    strikeIcon.className = 'fa-regular fa-circle';
                    strikeIcon.style.color = 'var(--text-secondary)';
                    strikeIcon.style.textShadow = 'none';
                }
            }
        }
    }

    determineGridConfig() {
        // Levels 1-2: 3x3 (3, 4 targets)
        // Levels 3-5: 4x4 (4, 5, 6 targets)
        // Levels 6-8: 5x5 (6, 7, 8 targets)
        // Levels 9+: 6x6 (8, 9, 10... targets)
        if (this.level <= 2) {
            this.gridSize = 3;
            this.targetCount = 2 + this.level;
        } else if (this.level <= 5) {
            this.gridSize = 4;
            this.targetCount = 1 + this.level;
        } else if (this.level <= 8) {
            this.gridSize = 5;
            this.targetCount = this.level;
        } else {
            this.gridSize = 6;
            this.targetCount = Math.min(8 + (this.level - 9), 18);
        }
    }

    startRound() {
        this.interactive = false;
        this.determineGridConfig();
        this.targets.clear();
        this.guesses.clear();
        this.board.innerHTML = '';
        
        // Set grid dimensions
        this.board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        const totalTiles = this.gridSize * this.gridSize;
        
        // Create tiles
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'matrix-tile';
            tile.dataset.index = i;
            tile.addEventListener('click', (e) => this.handleTileClick(e));
            this.board.appendChild(tile);
        }

        // Choose random target tile indexes
        while (this.targets.size < this.targetCount) {
            const randIndex = Math.floor(Math.random() * totalTiles);
            this.targets.add(randIndex);
        }

        // Show targets after a short delay
        setTimeout(() => {
            this.showTargets();
        }, 600);
    }

    showTargets() {
        const tiles = this.board.children;
        this.targets.forEach(index => {
            tiles[index].classList.add('active');
        });
        
        Sound.playTick();

        // Hide targets after exposure time
        // Exposure time: scales slightly faster as level increases, minimum 800ms
        const exposureTime = Math.max(1400 - (this.level * 40), 800);
        
        setTimeout(() => {
            this.hideTargets();
        }, exposureTime);
    }

    hideTargets() {
        const tiles = this.board.children;
        this.targets.forEach(index => {
            tiles[index].classList.remove('active');
        });
        this.interactive = true;
    }

    handleTileClick(e) {
        if (!this.interactive) return;
        
        const tile = e.target;
        const index = parseInt(tile.dataset.index);
        
        // If already clicked, ignore
        if (this.guesses.has(index)) return;

        if (this.targets.has(index)) {
            // Correct
            this.guesses.add(index);
            tile.classList.add('correct');
            Sound.playTone(600 + (this.guesses.size * 50), 'sine', 0.1, 0.08); // rising tone for combo

            if (this.guesses.size === this.targets.size) {
                // Round Won
                this.interactive = false;
                this.score += this.level * 10;
                this.level += 1;
                this.updateStats();
                
                // Flash success screen background
                this.triggerFlash('correct');
                Sound.playSuccess();
                
                setTimeout(() => {
                    this.startRound();
                }, 1000);
            }
        } else {
            // Incorrect
            this.interactive = false;
            tile.classList.add('incorrect');
            this.triggerFlash('incorrect');
            Sound.playIncorrect();
            
            // Show all actual targets so player learns
            const tiles = this.board.children;
            this.targets.forEach(idx => {
                if (!this.guesses.has(idx)) {
                    tiles[idx].classList.add('correct');
                }
            });
            
            this.strikes += 1;
            this.updateStats();

            setTimeout(() => {
                if (this.strikes >= 3) {
                    this.endGame();
                } else {
                    this.startRound();
                }
            }, 1500);
        }
    }

    triggerFlash(type) {
        this.flashEffect.className = `flash-effect flash-${type}`;
        this.flashEffect.style.opacity = '1';
        setTimeout(() => {
            this.flashEffect.style.opacity = '0';
        }, 200);
    }

    endGame() {
        Sound.playGameOver();
        const isNewHigh = Storage.saveScore('matrix', this.score);
        
        this.overlay.style.display = 'flex';
        this.overlay.innerHTML = `
            <h2>Training Complete</h2>
            <div style="font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
                Level Reached: <strong style="color: var(--cyan);">${this.level}</strong><br>
                Final Score: <strong style="color: var(--purple); font-size: 1.8rem;">${this.score}</strong>
                ${isNewHigh ? '<br><span style="color: var(--green); font-size: 0.95rem; font-weight: bold; text-shadow: 0 0 10px rgba(57,255,20,0.3);">🏆 NEW HIGH SCORE!</span>' : ''}
            </div>
            <button class="btn-start" id="btn-restart-matrix">Train Again</button>
        `;
        
        // Re-bind restart button
        document.getElementById('btn-restart-matrix').addEventListener('click', () => {
            this.startGame();
        });
        
        // Force refresh dashboard stats
        if (window.Dashboard) {
            window.Dashboard.initDashboard();
        }
    }
}
