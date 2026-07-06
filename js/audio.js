class AudioSynth {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('neuroboost_muted') === 'true';
        this.updateUI();
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('neuroboost_muted', this.muted);
        this.updateUI();
        if (!this.muted) {
            this.init();
            this.playClick();
        }
    }

    updateUI() {
        const btn = document.getElementById('sound-btn');
        if (btn) {
            if (this.muted) {
                btn.classList.add('muted');
                btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                btn.classList.remove('muted');
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        }
    }

    playTone(frequency, type, duration, gainStart = 0.1) {
        if (this.muted) return;
        this.init();
        
        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            
            gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    playClick() {
        this.playTone(800, 'sine', 0.08, 0.08);
    }

    playSuccess() {
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.playTone(523.25, 'sine', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.1), 80); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.1), 160); // G5
    }

    playIncorrect() {
        this.playTone(180, 'sawtooth', 0.25, 0.15);
        setTimeout(() => this.playTone(130, 'sawtooth', 0.35, 0.15), 100);
    }

    playTick() {
        this.playTone(1200, 'sine', 0.03, 0.04);
    }

    playLevelUp() {
        // Futuristic majestic ascending chord
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'triangle', 0.4, 0.08);
            }, idx * 60);
        });
    }

    playGameOver() {
        const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sawtooth', 0.3, 0.1);
            }, idx * 150);
        });
    }
}

// Global instance
const Sound = new AudioSynth();
document.addEventListener('click', () => Sound.init(), { once: true });
document.getElementById('sound-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    Sound.toggleMute();
});
