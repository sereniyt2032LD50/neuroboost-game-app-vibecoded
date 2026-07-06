const Storage = {
    getHighScores() {
        return {
            matrix: parseInt(localStorage.getItem('nb_high_matrix')) || 0,
            stroop: parseInt(localStorage.getItem('nb_high_stroop')) || 0,
            schulte: parseFloat(localStorage.getItem('nb_high_schulte')) || null,
            math: parseInt(localStorage.getItem('nb_high_math')) || 0
        };
    },

    saveScore(game, score) {
        let isNewHigh = false;
        if (game === 'schulte') {
            const currentBest = parseFloat(localStorage.getItem('nb_high_schulte'));
            if (!currentBest || score < currentBest) {
                localStorage.setItem('nb_high_schulte', score);
                isNewHigh = true;
            }
        } else {
            const currentHigh = parseInt(localStorage.getItem(`nb_high_${game}`)) || 0;
            if (score > currentHigh) {
                localStorage.setItem(`nb_high_${game}`, score);
                isNewHigh = true;
            }
        }

        // Add history log entry
        const history = this.getHistory();
        history.unshift({
            game,
            score,
            date: new Date().toISOString()
        });
        localStorage.setItem('nb_history', JSON.stringify(history.slice(0, 50))); // Keep last 50 games

        // Update streak
        this.updateStreak();
        
        // Update Session counts
        const sessions = parseInt(localStorage.getItem('nb_sessions')) || 0;
        localStorage.setItem('nb_sessions', sessions + 1);

        return isNewHigh;
    },

    getHistory() {
        return JSON.parse(localStorage.getItem('nb_history')) || [];
    },

    getSessionsCount() {
        return parseInt(localStorage.getItem('nb_sessions')) || 0;
    },

    getStreak() {
        return parseInt(localStorage.getItem('nb_streak')) || 0;
    },

    updateStreak() {
        const lastPlayStr = localStorage.getItem('nb_last_play');
        const today = new Date().toDateString();
        let streak = parseInt(localStorage.getItem('nb_streak')) || 0;

        if (lastPlayStr) {
            const lastPlay = new Date(lastPlayStr).toDateString();
            if (lastPlay !== today) {
                const diffTime = Math.abs(new Date(today) - new Date(lastPlay));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    streak += 1;
                } else if (diffDays > 1) {
                    streak = 1;
                }
            }
        } else {
            streak = 1;
        }

        localStorage.setItem('nb_streak', streak);
        localStorage.setItem('nb_last_play', new Date().toISOString());
    },

    calculateNeuroScore() {
        const high = this.getHighScores();
        
        // Define realistic targets for 100% capacity
        // Matrix: 120 points (e.g. completing level 12)
        // Stroop: 100 points
        // Schulte: 8.0 seconds (lower is better, baseline is 35 seconds)
        // Math: 80 points
        
        const matrixNorm = Math.min((high.matrix / 120) * 1000, 1000);
        const stroopNorm = Math.min((high.stroop / 100) * 1000, 1000);
        
        let schulteNorm = 0;
        if (high.schulte) {
            // formula: map 35s to score 200, 8s or lower to score 1000
            const maxSeconds = 35;
            const minSeconds = 8;
            if (high.schulte >= maxSeconds) {
                schulteNorm = 200;
            } else if (high.schulte <= minSeconds) {
                schulteNorm = 1000;
            } else {
                schulteNorm = 200 + (1 - (high.schulte - minSeconds) / (maxSeconds - minSeconds)) * 800;
            }
        }
        
        const mathNorm = Math.min((high.math / 80) * 1000, 1000);

        let activeMetricsCount = 0;
        let sumNorm = 0;

        if (high.matrix > 0) { sumNorm += matrixNorm; activeMetricsCount++; }
        if (high.stroop > 0) { sumNorm += stroopNorm; activeMetricsCount++; }
        if (high.schulte !== null) { sumNorm += schulteNorm; activeMetricsCount++; }
        if (high.math > 0) { sumNorm += mathNorm; activeMetricsCount++; }

        if (activeMetricsCount === 0) return 0;
        return Math.round(sumNorm / activeMetricsCount);
    }
};
