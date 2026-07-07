class MathRushGame {
    constructor() {
        this.overlay = document.getElementById('overlay-math');
        this.btnStart = document.getElementById('btn-start-math');
        this.timeDisplay = document.getElementById('math-time');
        this.scoreDisplay = document.getElementById('math-score');
        this.comboDisplay = document.getElementById('math-combo');
        this.progress = document.getElementById('math-progress');
        this.flashEffect = document.getElementById('flash-math');
        
        this.equationDisplay = document.getElementById('math-expr');
        this.btnYes = document.getElementById('btn-math-yes');
        this.btnNo = document.getElementById('btn-math-no');
        
        this.score = 0;
        this.comboCount = 0;
        this.timeRemaining = 30.0;
        this.timer = null;
        this.isEquationTrue = false;
        
        this.btnStart.addEventListener('click', () => this.startGame());
        this.btnYes.addEventListener('click', () => this.handleAnswer(true));
        this.btnNo.addEventListener('click', () => this.handleAnswer(false));

        // Bind keyboard event handler
        this.boundKeyHandler = this.handleKeyDown.bind(this);
    }

    startGame() {
        Sound.playClick();
        this.overlay.style.display = 'none';
        this.score = 0;
        this.comboCount = 0;
        this.timeRemaining = 30.0;
        this.updateStats();
        this.nextQuestion();
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), 100);

        // Bind keyboard listener
        window.addEventListener('keydown', this.boundKeyHandler);
    }

    cleanup() {
        window.removeEventListener('keydown', this.boundKeyHandler);
    }

    getComboMultiplier() {
        if (this.comboCount >= 25) return 8;
        if (this.comboCount >= 15) return 5;
        if (this.comboCount >= 10) return 3;
        if (this.comboCount >= 5) return 2;
        return 1;
    }

    updateStats() {
        this.scoreDisplay.textContent = this.score;
        this.timeDisplay.textContent = Math.ceil(this.timeRemaining) + 's';
        this.progress.style.width = `${(this.timeRemaining / 30.0) * 100}%`;
        
        const mult = this.getComboMultiplier();
        this.comboDisplay.textContent = `${mult}x`;
        if (mult > 1) {
            this.comboDisplay.style.color = 'var(--cyan)';
            this.comboDisplay.style.textShadow = '0 0 10px rgba(0, 242, 254, 0.4)';
        } else {
            this.comboDisplay.style.color = 'var(--text-secondary)';
            this.comboDisplay.style.textShadow = 'none';
        }
    }

    tick() {
        this.timeRemaining -= 0.1;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.updateStats();
            this.endGame();
        } else {
            this.updateStats();
        }
    }

    nextQuestion() {
        // Decide difficulty based on score
        let expr = '';
        let result = 0;
        
        const randType = Math.random();
        
        if (this.score < 100) {
            // Level 1: Simple Addition / Subtraction
            const val1 = Math.floor(Math.random() * 15) + 1;
            const val2 = Math.floor(Math.random() * 15) + 1;
            const isAdd = Math.random() < 0.5;
            
            if (isAdd) {
                expr = `${val1} + ${val2}`;
                result = val1 + val2;
            } else {
                const high = Math.max(val1, val2);
                const low = Math.min(val1, val2);
                expr = `${high} - ${low}`;
                result = high - low;
            }
        } else if (this.score < 300) {
            // Level 2: Double-digit + Simple Multiplication
            const isMult = Math.random() < 0.4;
            if (isMult) {
                const val1 = Math.floor(Math.random() * 10) + 2;
                const val2 = Math.floor(Math.random() * 9) + 2;
                expr = `${val1} &times; ${val2}`;
                result = val1 * val2;
            } else {
                const val1 = Math.floor(Math.random() * 50) + 10;
                const val2 = Math.floor(Math.random() * 40) + 10;
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    expr = `${val1} + ${val2}`;
                    result = val1 + val2;
                } else {
                    expr = `${val1} - ${val2}`;
                    result = val1 - val2;
                }
            }
        } else {
            // Level 3: Three operators or larger multiplication
            const isThreeOp = Math.random() < 0.5;
            if (isThreeOp) {
                const val1 = Math.floor(Math.random() * 8) + 2;
                const val2 = Math.floor(Math.random() * 6) + 2;
                const val3 = Math.floor(Math.random() * 15) + 2;
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    expr = `${val1} &times; ${val2} + ${val3}`;
                    result = (val1 * val2) + val3;
                } else {
                    expr = `${val1} &times; ${val2} - ${val3}`;
                    result = (val1 * val2) - val3;
                }
            } else {
                const val1 = Math.floor(Math.random() * 15) + 5;
                const val2 = Math.floor(Math.random() * 12) + 3;
                expr = `${val1} &times; ${val2}`;
                result = val1 * val2;
            }
        }

        // Mismatch half the time
        this.isEquationTrue = Math.random() < 0.5;
        let displayResult = result;
        
        if (!this.isEquationTrue) {
            let offset = Math.floor(Math.random() * 5) + 1; // 1 to 5
            if (Math.random() < 0.5) offset = -offset;
            
            // Adjust offset to avoid negative/empty values
            displayResult = Math.max(1, result + offset);
            
            // Just in case offset makes it true, force incorrect
            if (displayResult === result) {
                displayResult += 2;
            }
        }

        this.equationDisplay.innerHTML = `${expr} = ${displayResult}`;
    }

    handleKeyDown(e) {
        if (this.timeRemaining <= 0) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.handleAnswer(false);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.handleAnswer(true);
        }
    }

    handleAnswer(userSaysTrue) {
        if (this.timeRemaining <= 0) return;
        
        const isCorrect = (userSaysTrue === this.isEquationTrue);
        
        if (isCorrect) {
            // Correct answer
            this.comboCount += 1;
            const mult = this.getComboMultiplier();
            const pointsAdded = 10 * mult;
            this.score += pointsAdded;
            
            // Add time reward: +1.5s, capped at 30.0s
            this.timeRemaining = Math.min(30.0, this.timeRemaining + 1.5);
            
            Sound.playTone(500 + (this.comboCount * 20), 'sine', 0.08, 0.08);
            this.triggerFlash('correct');
            
            // UX floating indicators
            window.showFloatingIndicator(this.scoreDisplay, `+${pointsAdded}`, true);
            window.showFloatingIndicator(this.timeDisplay, `+1.5s`, true);
        } else {
            // Incorrect answer
            this.comboCount = 0;
            
            // Time penalty: -3.0s
            this.timeRemaining = Math.max(0, this.timeRemaining - 3.0);
            
            Sound.playIncorrect();
            this.triggerFlash('incorrect');
            
            // UX floating indicators
            window.showFloatingIndicator(this.timeDisplay, `-3.0s`, false);
            
            const boardEl = document.querySelector('#screen-game-math .game-play-board');
            if (boardEl) {
                boardEl.classList.add('shake');
                setTimeout(() => boardEl.classList.remove('shake'), 300);
            }
        }
        
        this.updateStats();
        this.nextQuestion();
    }

    triggerFlash(type) {
        this.flashEffect.className = `flash-effect flash-${type}`;
        this.flashEffect.style.opacity = '1';
        setTimeout(() => {
            this.flashEffect.style.opacity = '0';
        }, 150);
    }

    endGame() {
        clearInterval(this.timer);
        this.cleanup();
        Sound.playGameOver();
        
        const isNewHigh = Storage.saveScore('math', this.score);
        
        this.overlay.style.display = 'flex';
        this.overlay.innerHTML = `
            <h2>Equation Rush Over</h2>
            <div style="font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
                Final Score: <strong style="color: var(--purple); font-size: 1.8rem;">${this.score}</strong>
                ${isNewHigh ? '<br><span style="color: var(--green); font-size: 0.95rem; font-weight: bold; text-shadow: 0 0 10px rgba(57,255,20,0.3);">🏆 NEW HIGH SCORE!</span>' : ''}
            </div>
            <button class="btn-start" id="btn-restart-math">Train Again</button>
        `;
        
        document.getElementById('btn-restart-math').addEventListener('click', () => {
            this.startGame();
        });
        
        if (window.Dashboard) {
            window.Dashboard.initDashboard();
        }
    }
}
