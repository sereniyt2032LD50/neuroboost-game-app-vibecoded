class StroopGame {
    constructor() {
        this.overlay = document.getElementById('overlay-stroop');
        this.btnStart = document.getElementById('btn-start-stroop');
        this.timeDisplay = document.getElementById('stroop-time');
        this.scoreDisplay = document.getElementById('stroop-score');
        this.accDisplay = document.getElementById('stroop-acc');
        this.progress = document.getElementById('stroop-progress');
        this.flashEffect = document.getElementById('flash-stroop');
        
        this.taskText = document.getElementById('stroop-task-txt');
        this.wordText = document.getElementById('stroop-word-txt');
        this.optionsContainer = document.getElementById('stroop-options-box');
        
        this.score = 0;
        this.correctCount = 0;
        this.totalCount = 0;
        this.timeRemaining = 30.0;
        this.timer = null;
        this.correctAnswer = '';
        this.questionStartTime = 0;
        
        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.colorValues = {
            red: '#ff0055',
            blue: '#00f2fe',
            green: '#39ff14',
            yellow: '#ffd000'
        };

        this.btnStart.addEventListener('click', () => this.startGame());
        
        // Option buttons click listeners
        const optionButtons = this.optionsContainer.getElementsByClassName('btn-stroop');
        for (let btn of optionButtons) {
            btn.addEventListener('click', (e) => this.handleAnswer(e));
        }
    }

    startGame() {
        Sound.playClick();
        this.overlay.style.display = 'none';
        this.score = 0;
        this.correctCount = 0;
        this.totalCount = 0;
        this.timeRemaining = 30.0;
        this.updateStats();
        this.nextQuestion();
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), 100);
    }

    updateStats() {
        this.scoreDisplay.textContent = this.score;
        this.timeDisplay.textContent = Math.ceil(this.timeRemaining) + 's';
        this.progress.style.width = `${(this.timeRemaining / 30.0) * 100}%`;
        
        if (this.totalCount > 0) {
            const acc = Math.round((this.correctCount / this.totalCount) * 100);
            this.accDisplay.textContent = acc + '%';
        } else {
            this.accDisplay.textContent = '--%';
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
        // 1. Choose task: 'color' or 'meaning'
        const task = Math.random() < 0.5 ? 'color' : 'meaning';
        
        // 2. Choose word and color (force mismatch 75% of the time)
        const wordIndex = Math.floor(Math.random() * this.colors.length);
        let colorIndex = Math.floor(Math.random() * this.colors.length);
        
        if (Math.random() < 0.75) {
            // Mismatch
            while (colorIndex === wordIndex) {
                colorIndex = Math.floor(Math.random() * this.colors.length);
            }
        }
        
        const word = this.colors[wordIndex];
        const color = this.colors[colorIndex];
        
        // Set UI text and styles
        if (task === 'color') {
            this.taskText.textContent = 'MATCH COLOR';
            this.taskText.className = 'stroop-instruction'; // default cyan
            this.correctAnswer = color;
        } else {
            this.taskText.textContent = 'MATCH TEXT';
            this.taskText.className = 'stroop-instruction meaning'; // purple color
            this.correctAnswer = word;
        }
        
        this.wordText.textContent = word;
        this.wordText.style.color = this.colorValues[color];
        this.wordText.style.textShadow = `0 0 20px ${this.colorValues[color]}55`;
        
        this.questionStartTime = Date.now();
    }

    handleAnswer(e) {
        if (this.timeRemaining <= 0) return;
        
        const selectedColor = e.target.dataset.color;
        this.totalCount += 1;
        
        const elapsed = Date.now() - this.questionStartTime;
        
        if (selectedColor === this.correctAnswer) {
            // Correct answer
            this.correctCount += 1;
            
            // Speed bonus: up to 15 points, scales down to 0 after 2 seconds
            const speedBonus = Math.max(0, Math.round((2000 - elapsed) / 100));
            const points = 10 + speedBonus;
            
            this.score += points;
            Sound.playTone(600 + (points * 10), 'sine', 0.08, 0.08);
            this.triggerFlash('correct');
        } else {
            // Incorrect answer
            this.score = Math.max(0, this.score - 5);
            Sound.playIncorrect();
            this.triggerFlash('incorrect');
            
            // Shake play board
            const board = document.querySelector('#screen-game-stroop .game-play-board');
            if (board) {
                board.classList.add('shake');
                setTimeout(() => board.classList.remove('shake'), 300);
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
        Sound.playGameOver();
        
        const isNewHigh = Storage.saveScore('stroop', this.score);
        const accuracy = this.totalCount > 0 ? Math.round((this.correctCount / this.totalCount) * 100) : 0;
        
        this.overlay.style.display = 'flex';
        this.overlay.innerHTML = `
            <h2>Stroop Test Over</h2>
            <div style="font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
                Accuracy: <strong style="color: var(--cyan);">${accuracy}%</strong><br>
                Final Score: <strong style="color: var(--purple); font-size: 1.8rem;">${this.score}</strong>
                ${isNewHigh ? '<br><span style="color: var(--green); font-size: 0.95rem; font-weight: bold; text-shadow: 0 0 10px rgba(57,255,20,0.3);">🏆 NEW HIGH SCORE!</span>' : ''}
            </div>
            <button class="btn-start" id="btn-restart-stroop">Train Again</button>
        `;
        
        document.getElementById('btn-restart-stroop').addEventListener('click', () => {
            this.startGame();
        });
        
        if (window.Dashboard) {
            window.Dashboard.initDashboard();
        }
    }
}
