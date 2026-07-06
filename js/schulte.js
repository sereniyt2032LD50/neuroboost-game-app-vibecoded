class SchulteGame {
    constructor() {
        this.board = document.getElementById('schulte-grid-board');
        this.overlay = document.getElementById('overlay-schulte');
        this.btnStart = document.getElementById('btn-start-schulte');
        this.timeDisplay = document.getElementById('schulte-time');
        this.targetDisplay = document.getElementById('schulte-target');
        this.lvlDisplay = document.getElementById('schulte-lvl');
        this.flashEffect = document.getElementById('flash-schulte');
        
        this.level = 1; // 1 = 4x4, 2 = 5x5
        this.targetNumber = 1;
        this.maxNumber = 16;
        this.gridSize = 4;
        
        this.startTime = 0;
        this.elapsedTime = 0.0;
        this.timer = null;
        this.lvl1Time = 0.0;
        this.gameActive = false;
        
        this.btnStart.addEventListener('click', () => this.startGame());
    }

    startGame() {
        Sound.playClick();
        this.overlay.style.display = 'none';
        this.level = 1;
        this.lvl1Time = 0.0;
        this.elapsedTime = 0.0;
        this.gameActive = true;
        this.startLevel();
    }

    startLevel() {
        this.targetNumber = 1;
        if (this.level === 1) {
            this.gridSize = 4;
            this.maxNumber = 16;
            this.lvlDisplay.textContent = '4 x 4';
        } else {
            this.gridSize = 5;
            this.maxNumber = 25;
            this.lvlDisplay.textContent = '5 x 5';
        }
        
        this.targetDisplay.textContent = this.targetNumber;
        this.board.innerHTML = '';
        this.board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        // Generate and scramble numbers
        const numbers = [];
        for (let i = 1; i <= this.maxNumber; i++) {
            numbers.push(i);
        }
        this.shuffle(numbers);
        
        // Draw tiles
        numbers.forEach(num => {
            const tile = document.createElement('div');
            tile.className = 'schulte-tile';
            tile.textContent = num;
            tile.dataset.number = num;
            tile.addEventListener('click', (e) => this.handleTileClick(e));
            this.board.appendChild(tile);
        });

        // Initialize / Resume timer
        this.startTime = Date.now() - (this.elapsedTime * 1000);
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), 30);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    tick() {
        if (!this.gameActive) return;
        this.elapsedTime = (Date.now() - this.startTime) / 1000;
        this.timeDisplay.textContent = this.elapsedTime.toFixed(2) + 's';
    }

    handleTileClick(e) {
        if (!this.gameActive) return;
        
        const tile = e.target;
        const number = parseInt(tile.dataset.number);
        
        if (number === this.targetNumber) {
            // Correct click
            tile.classList.add('correct');
            
            // Success audio feedback (ascending tone)
            const pitch = 300 + (this.targetNumber * (500 / this.maxNumber));
            Sound.playTone(pitch, 'sine', 0.1, 0.08);
            
            if (this.targetNumber === this.maxNumber) {
                // Completed the current grid
                if (this.level === 1) {
                    // Progress to level 2
                    clearInterval(this.timer);
                    this.lvl1Time = this.elapsedTime;
                    this.level = 2;
                    Sound.playLevelUp();
                    
                    // Brief overlay banner showing time
                    this.board.innerHTML = `
                        <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--green); text-shadow: 0 0 10px rgba(57,255,20,0.3);">
                            <h2 style="margin-bottom: 0.5rem;">4x4 Grid Solved!</h2>
                            <p style="color: var(--text-secondary);">Time: ${this.lvl1Time.toFixed(2)}s</p>
                            <p style="color: var(--cyan); margin-top: 1rem; font-size: 1.1rem; font-weight: bold; letter-spacing: 1px;">PREPARING 5x5 GRID...</p>
                        </div>
                    `;
                    this.gameActive = false;
                    
                    setTimeout(() => {
                        this.gameActive = true;
                        this.startLevel();
                    }, 2000);
                } else {
                    // Game finished!
                    this.endGame();
                }
            } else {
                this.targetNumber += 1;
                this.targetDisplay.textContent = this.targetNumber;
            }
        } else {
            // Incorrect click (penalty + audio buzz)
            Sound.playIncorrect();
            this.triggerFlash('incorrect');
            
            // Add 1.5s time penalty to current timer
            this.startTime -= 1500; 
            
            // Flash red on incorrect tile
            tile.classList.add('incorrect');
            setTimeout(() => tile.classList.remove('incorrect'), 300);
            
            const boardEl = document.querySelector('#screen-game-schulte .game-play-board');
            if (boardEl) {
                boardEl.classList.add('shake');
                setTimeout(() => boardEl.classList.remove('shake'), 300);
            }
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
        this.gameActive = false;
        clearInterval(this.timer);
        Sound.playGameOver();
        
        const finalTime = parseFloat(this.elapsedTime.toFixed(2));
        const isNewHigh = Storage.saveScore('schulte', finalTime);
        
        this.overlay.style.display = 'flex';
        this.overlay.innerHTML = `
            <h2>Schulte Grid Solved</h2>
            <div style="font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
                4x4 Time: <strong style="color: var(--text-primary);">${this.lvl1Time.toFixed(2)}s</strong><br>
                Total Time: <strong style="color: var(--purple); font-size: 1.8rem;">${finalTime}s</strong>
                ${isNewHigh ? '<br><span style="color: var(--green); font-size: 0.95rem; font-weight: bold; text-shadow: 0 0 10px rgba(57,255,20,0.3);">🏆 NEW BEST TIME!</span>' : ''}
            </div>
            <button class="btn-start" id="btn-restart-schulte">Train Again</button>
        `;
        
        document.getElementById('btn-restart-schulte').addEventListener('click', () => {
            this.startGame();
        });
        
        if (window.Dashboard) {
            window.Dashboard.initDashboard();
        }
    }
}
