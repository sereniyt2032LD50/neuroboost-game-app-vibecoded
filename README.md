# NeuroBoost Hub 🧠

**NeuroBoost Hub** is a premium, web-based cognitive development and brain training dashboard built with HTML, Vanilla CSS, and JavaScript. Designed with a futuristic, cyberpunk aesthetic, it offers players four interactive scientific mini-games targeting different cognitive areas, custom local performance analytics, and programmatically synthesized real-time sound effects.

---

## 🎮 The Mini-Games

NeuroBoost Hub targets key cognitive areas through four custom-built training rooms:

1.  **Memory Matrix** *(Spatial Memory)*: Flash patterns appear on grids of increasing dimensions (from $3 \times 3$ to $6 \times 6$). Recall and select the target tiles without striking out.
2.  **Stroop Reflex** *(Selective Attention)*: Colored words flash on the screen with instructions to match either the text spelling or the color itself. Fast response times and accuracy build your score.
3.  **Schulte Grid** *(Focus Speed)*: Locate and select scrambled numbers from 1 to 16 ($4 \times 4$ layout) and 1 to 25 ($5 \times 5$ layout) in ascending order. Peripheral vision is key; misclicks add time penalties.
4.  **Equation Rush** *(Quantitative Processing)*: Rapid-fire arithmetic equations test your logic and mental math. Correct responses build a combo multiplier and add time extensions to the ticking clock.

---

## 🚀 Key Features

*   **Integrated Neuro-Index**: A unified score mapping your cognitive performance, calculated as a normalized, weighted average of your high scores.
*   **Performance Analytics**: A built-in line chart drawn on an HTML5 `<canvas>` that maps your score progression over your last 10 sessions.
*   **Programmatic Sound Synthesis**: Programmatic sound effects generated in real-time via the browser's native **Web Audio API**—no external audio files, images, or CDNs are required to run the sound system.
*   **Daily Streaks & Tracking**: Logs completed sessions, high scores, and calculates daily play streaks to encourage routine practice.
*   **Glassmorphic Cyberpunk Theme**: Features smooth animations, screen shake feedback on incorrect entries, glassmorphic container blurs, and neon accent colors.

---

## 📁 Repository Structure

```text
neuroboost/
├── index.html          # Core single-page application framework
├── style.css           # Custom cyberpunk stylesheet & responsive layouts
├── LICENSE             # MIT License
├── README.md           # Project documentation
└── js/
    ├── audio.js        # Sound synthesizer using Web Audio API
    ├── storage.js      # Score logging, streak calculation, & local storage
    ├── dashboard.js    # UI navigation & custom canvas line chart renderer
    ├── matrix.js       # Memory Matrix game logic
    ├── stroop.js       # Stroop Reflex game logic
    ├── schulte.js      # Schulte Grid game logic
    └── math.js         # Equation Rush game logic
```

---

## ⚙️ Running Locally

NeuroBoost Hub runs entirely client-side. There are no build steps or external dependencies.

### Option 1: File Protocol (Direct Play)
Simply double-click the `index.html` file in your file explorer to launch the game in any modern web browser.

### Option 2: Local HTTP Server (Recommended)
Starting a local server is recommended for consistent `LocalStorage` behavior across certain browsers.

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```
Then open your browser and navigate to **`http://localhost:8000`**.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
