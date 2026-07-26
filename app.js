// Game Dongeng Interaktif "Drako si Naga Baik" - app.js
// Mengendalikan alur permainan, rendering SVG Drako & Ilustrasi Scene secara dinamis,
// Sistem drag & drop pointer multi-target, tap-to-place, dan sinkronisasi modal pengaturan.

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------
  // STATE MANAGEMENT GAME
  // ----------------------------------------------------
  const gameState = {
    currentScreen: "welcome",
    activeStory: null,
    currentPageIndex: 0,
    // Status 3 kata rumpang pada scene aktif
    blanksState: [],
    // Lencana/progres (tersimpan lokal)
    storyCompleted: localStorage.getItem("drako_completed") === "true",
    isSpeakingNarration: false
  };

  const MASCOT_NAME = "Drako";
  const audio = window.gameAudioInstance;

  // Inisialisasi ikon Lucide
  lucide.createIcons();

  // ----------------------------------------------------
  // ELEMEN DOM
  // ----------------------------------------------------
  const screens = {
    welcome: document.getElementById("screen-welcome"),
    gameBoard: document.getElementById("screen-game-board"),
    victory: document.getElementById("screen-victory")
  };

  const welcomeMascot = document.getElementById("welcome-mascot");
  const victoryMascotBox = document.getElementById("victory-mascot-box");
  const storyIllustrationContainer = document.getElementById("story-illustration-container");
  const storyNarrationDisplay = document.getElementById("story-narration-display");
  const btnReadNarration = document.getElementById("btn-read-narration");
  const gameSceneLabel = document.getElementById("game-scene-label");
  const gameProgressDots = document.getElementById("game-progress-dots");
  const btnNextScene = document.getElementById("btn-next-scene");
  
  const interactionBlocksContainer = document.getElementById("interaction-blocks-container");

  // Modal Settings
  const settingsModal = document.getElementById("settings-modal");
  const sliderBgm = document.getElementById("slider-bgm");
  const sliderNarrator = document.getElementById("slider-narrator");
  const sliderSfx = document.getElementById("slider-sfx");
  const btnSettingsClose = document.getElementById("btn-settings-close");

  // Tutorial Modal/Overlay
  const tutorialOverlay = document.getElementById("tutorial-overlay");
  const btnTutorialStart = document.getElementById("btn-tutorial-start");

  // ----------------------------------------------------
  // RENDERING MASKOT DRAKO (SVG DINAMIS)
  // ----------------------------------------------------
  function renderDrako(container, mood = "neutral") {
    if (!container) return;
    let faceExpression = "";
    let groupTransform = "";
    let leftWingTransform = "";
    let rightWingTransform = "";

    if (mood === "happy") {
      // Mata tersenyum melengkung, mulut tertawa gembira, pipi merona merah
      faceExpression = `
        <!-- Mata Tersenyum -->
        <path d="M 38 42 Q 45 35 52 42" stroke="#37474f" stroke-width="4.5" stroke-linecap="round" fill="none" />
        <path d="M 58 42 Q 65 35 72 42" stroke="#37474f" stroke-width="4.5" stroke-linecap="round" fill="none" />
        <!-- Blush Pipi -->
        <circle cx="32" cy="50" r="7" fill="#ff8a80" opacity="0.8" />
        <circle cx="78" cy="50" r="7" fill="#ff8a80" opacity="0.8" />
        <!-- Mulut Tertawa -->
        <path d="M 47 54 Q 55 68 63 54 Z" fill="#e53935" />
      `;
      groupTransform = "translate(0, -3) scale(1, 1.02)";
      leftWingTransform = "rotate(15 25 50)";
      rightWingTransform = "rotate(-15 85 50)";
    } else if (mood === "talking") {
      // Mata bulat ceria, mulut terbuka bulat kecil
      faceExpression = `
        <!-- Mata Bulat -->
        <circle cx="44" cy="42" r="5" fill="#37474f" />
        <circle cx="42" cy="40" r="2" fill="#ffffff" />
        <circle cx="66" cy="42" r="5" fill="#37474f" />
        <circle cx="64" cy="40" r="2" fill="#ffffff" />
        <!-- Blush Pipi -->
        <circle cx="32" cy="50" r="5" fill="#ff8a80" opacity="0.6" />
        <circle cx="78" cy="50" r="5" fill="#ff8a80" opacity="0.6" />
        <!-- Mulut Terbuka -->
        <circle cx="55" cy="56" r="6" fill="#d32f2f" />
        <circle cx="55" cy="56" r="3" fill="#ff8a80" />
      `;
      leftWingTransform = "rotate(5 25 50)";
      rightWingTransform = "rotate(-5 85 50)";
    } else if (mood === "confused") {
      // Alis miring cemas, mata bingung, mulut cemberut datar
      faceExpression = `
        <!-- Alis Miring -->
        <path d="M 37 35 L 47 39" stroke="#37474f" stroke-width="3" stroke-linecap="round" />
        <path d="M 73 35 L 63 39" stroke="#37474f" stroke-width="3" stroke-linecap="round" />
        <!-- Mata Bingung -->
        <circle cx="44" cy="44" r="5" fill="#37474f" />
        <circle cx="66" cy="44" r="5" fill="#37474f" />
        <!-- Mulut Flat -->
        <path d="M 48 58 Q 55 53 62 58" stroke="#37474f" stroke-width="4" stroke-linecap="round" fill="none" />
      `;
      leftWingTransform = "rotate(-10 25 50)";
      rightWingTransform = "rotate(10 85 50)";
    } else {
      // Default: netral senyum imut
      faceExpression = `
        <!-- Mata Berbinar -->
        <circle cx="44" cy="42" r="5" fill="#37474f" />
        <circle cx="42" cy="40" r="2" fill="#ffffff" />
        <circle cx="66" cy="42" r="5" fill="#37474f" />
        <circle cx="64" cy="40" r="2" fill="#ffffff" />
        <!-- Pipi Merona -->
        <circle cx="32" cy="50" r="5" fill="#ff8a80" opacity="0.5" />
        <circle cx="78" cy="50" r="5" fill="#ff8a80" opacity="0.5" />
        <!-- Mulut Senyum -->
        <path d="M 48 54 Q 55 60 62 54" stroke="#37474f" stroke-width="4" stroke-linecap="round" fill="none" />
      `;
    }

    const svgString = `
      <svg viewBox="0 0 100 100" class="story-illustration-svg">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#81c784" />
            <stop offset="100%" stop-color="#4caf50" />
          </linearGradient>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffb74d" />
            <stop offset="100%" stop-color="#ff7043" />
          </linearGradient>
        </defs>
        <!-- Group wrapper untuk seluruh bagian tubuh Drako agar animasi stabil -->
        <g transform="${groupTransform}">
          <!-- Sayap Naga Oranye -->
          <path d="M 25 45 C 10 32, 5 60, 25 55 Z" fill="url(#wingGrad)" transform="${leftWingTransform}" />
          <path d="M 85 45 C 100 32, 105 60, 85 55 Z" fill="url(#wingGrad)" transform="${rightWingTransform}" />
          <!-- Ekor Naga Hijau -->
          <path d="M 28 82 Q 8 92, 16 98" stroke="#4caf50" stroke-width="8" stroke-linecap="round" fill="none" />
          <circle cx="16" cy="98" r="4" fill="#ffb74d" /> <!-- Ujung Ekor -->
          <!-- Badan Naga -->
          <path d="M 28 85 C 28 62, 82 62, 82 85 Z" fill="url(#bodyGrad)" />
          <ellipse cx="55" cy="78" rx="16" ry="10" fill="#fff8e1" /> <!-- Perut -->
          <!-- Kepala Naga -->
          <circle cx="55" cy="46" r="26" fill="url(#bodyGrad)" stroke="#388e3c" stroke-width="1.5" />
          <!-- Tanduk / Durian Kepala -->
          <polygon points="45,21 50,11 55,21" fill="url(#wingGrad)" />
          <polygon points="55,21 60,11 65,21" fill="url(#wingGrad)" />
          <polygon points="35,26 38,16 44,24" fill="url(#wingGrad)" />
          <polygon points="75,26 72,16 66,24" fill="url(#wingGrad)" />
          <!-- Moncong -->
          <ellipse cx="55" cy="55" rx="12" ry="7" fill="url(#bodyGrad)" />
          <circle cx="51" cy="53" r="1.8" fill="#2e7d32" />
          <circle cx="59" cy="53" r="1.8" fill="#2e7d32" />
          <!-- Ekspresi Wajah -->
          ${faceExpression}
        </g>
      </svg>
    `;
    container.innerHTML = svgString;
  }

  // ----------------------------------------------------
  // RENDERING SCENE ILLUSTRATIONS (SVG DINAMIS)
  // ----------------------------------------------------
  function renderSceneIllustration(container, illustrationId) {
    if (!container) return;

    let svgContent = "";

    // Mini Drako template untuk disematkan di dalam scene
    const miniDrakoSVG = (x, y, scale = 1, mood = "neutral") => {
      let face = "";
      if (mood === "happy") {
        face = `
          <path d="M -3 -2 Q 0 -5, 3 -2" stroke="#37474f" stroke-width="1.5" stroke-linecap="round" fill="none" />
          <path d="M 5 -2 Q 8 -5, 11 -2" stroke="#37474f" stroke-width="1.5" stroke-linecap="round" fill="none" />
          <path d="M 1 4 Q 4 10, 7 4 Z" fill="#e53935" />
        `;
      } else if (mood === "confused") {
        face = `
          <circle cx="0" cy="0" r="1.8" fill="#37474f" />
          <circle cx="8" cy="0" r="1.8" fill="#37474f" />
          <line x1="1" y1="4" x2="7" y2="4" stroke="#37474f" stroke-width="1.5" stroke-linecap="round" />
        `;
      } else {
        face = `
          <circle cx="0" cy="0" r="1.8" fill="#37474f" />
          <circle cx="8" cy="0" r="1.8" fill="#37474f" />
          <path d="M 2 4 Q 4 6, 6 4" stroke="#37474f" stroke-width="1.2" stroke-linecap="round" fill="none" />
        `;
      }

      return `
        <g id="drako-character" transform="translate(${x}, ${y}) scale(${scale})">
          <!-- Ekor -->
          <path d="M -15 15 Q -25 20, -20 25" stroke="#4caf50" stroke-width="5" stroke-linecap="round" fill="none" />
          <!-- Sayap -->
          <path d="M -10 -5 C -20 -15, -25 -2, -10 5 Z" fill="#ff7043" />
          <path d="M 18 -5 C 28 -15, 33 -2, 18 5 Z" fill="#ff7043" />
          <!-- Tubuh -->
          <path d="M -10 25 C -10 10, 18 10, 18 25 Z" fill="#4caf50" />
          <ellipse cx="4" cy="22" rx="7" ry="4" fill="#fff8e1" />
          <!-- Kepala -->
          <circle cx="4" cy="4" r="13" fill="#4caf50" stroke="#388e3c" stroke-width="1" />
          <!-- Tanduk -->
          <polygon points="-1,-9 1,-15 4,-9" fill="#ff7043" />
          <polygon points="4,-9 6,-15 9,-9" fill="#ff7043" />
          <!-- Moncong -->
          <ellipse cx="4" cy="8" rx="7" ry="4" fill="#4caf50" />
          <!-- Wajah -->
          ${face}
        </g>
      `;
    };

    switch (illustrationId) {
      // Scene 1 — Hutan Indah Perkenalan Drako
      case "drako_scene1":
        svgContent = `
          <!-- Langit -->
          <rect width="100" height="100" fill="url(#skyGrad)" />
          <!-- Awan -->
          <path d="M 10 25 C 10 20, 20 20, 25 25 C 30 20, 40 20, 40 25 L 40 28 L 10 28 Z" fill="#ffffff" opacity="0.8" />
          <path d="M 65 20 C 65 15, 75 15, 80 20 C 85 15, 95 15, 95 20 L 95 23 L 65 23 Z" fill="#ffffff" opacity="0.8" />
          <!-- Matahari Bersinar -->
          <circle cx="85" cy="20" r="8" fill="#ffe082" />
          <circle cx="85" cy="20" r="6" fill="#ffca28" />
          <!-- Bukit Belakang -->
          <path d="M 0 90 Q 30 65, 70 85 T 100 80 L 100 100 L 0 100 Z" fill="#66bb6a" opacity="0.6" />
          <path d="M 0 85 Q 50 78, 100 85 L 100 100 L 0 100 Z" fill="url(#treeGrad)" />
          <!-- Pohon Rindang Detil -->
          <g transform="translate(15, 45)" filter="url(#shadow)">
            <rect x="4" y="25" width="4" height="20" fill="url(#trunkGrad)" />
            <circle cx="6" cy="18" r="14" fill="url(#treeGrad)" />
            <circle cx="-2" cy="14" r="10" fill="#81c784" opacity="0.8" />
            <circle cx="14" cy="14" r="10" fill="#388e3c" opacity="0.8" />
          </g>
          <g transform="translate(80, 40)" filter="url(#shadow)">
            <rect x="3" y="30" width="3" height="20" fill="url(#trunkGrad)" />
            <circle cx="5" cy="20" r="12" fill="url(#treeGrad)" />
            <circle cx="12" cy="18" r="8" fill="#81c784" opacity="0.8" />
          </g>
          <!-- Semak & Bunga -->
          <path d="M -5 95 Q 10 90, 25 95 L 25 100 L -5 100 Z" fill="#4caf50" />
          <circle cx="10" cy="94" r="2.5" fill="#ff4081" />
          <circle cx="18" cy="92" r="2" fill="#ffeb3b" />
          <!-- Drako Bahagia -->
          ${miniDrakoSVG(48, 52, 1.25, "happy")}
          <!-- Kupu-Kupu Terbang -->
          <g transform="translate(30, 35) scale(0.4)">
            <path d="M 0 0 C 5 -10, 15 -10, 10 0 C 8 5, 2 3, 0 0 Z" fill="#ea80fc" />
            <path d="M 0 0 C -5 -10, -15 -10, -10 0 C -8 5, -2 3, 0 0 Z" fill="#ea80fc" />
          </g>
          <g transform="translate(68, 45) scale(0.35)">
            <path d="M 0 0 C 5 -10, 15 -10, 10 0 Z" fill="#80d8ff" />
            <path d="M 0 0 C -5 -10, -15 -10, -10 0 Z" fill="#80d8ff" />
          </g>
        `;
        break;

      // Scene 2 — Ketakutan Para Hewan
      case "drako_scene2":
        svgContent = `
          <rect width="100" height="100" fill="url(#sunsetGrad)" />
          <!-- Awan Sore -->
          <path d="M 20 25 C 20 22, 28 22, 32 25 L 50 25 L 20 25" stroke="#ffe082" stroke-width="2" opacity="0.5" />
          <path d="M 0 85 Q 50 80, 100 85 L 100 100 L 0 100 Z" fill="url(#treeGrad)" />
          <!-- Pohon Tua Rindang (Tupai & Burung) -->
          <g transform="translate(8, 25)" filter="url(#shadow)">
            <!-- Batang & Cabang -->
            <path d="M 8 60 L 8 25 Q 20 20, 25 15" stroke="url(#trunkGrad)" stroke-width="6" fill="none" stroke-linecap="round" />
            <path d="M 8 35 Q -10 30, -15 25" stroke="url(#trunkGrad)" stroke-width="4" fill="none" stroke-linecap="round" />
            <!-- Daun -->
            <circle cx="25" cy="12" r="14" fill="url(#treeGrad)" />
            <circle cx="-14" cy="22" r="11" fill="url(#treeGrad)" />
            <circle cx="5" cy="20" r="16" fill="url(#treeGrad)" />
            <!-- Lubang Tupai -->
            <ellipse cx="6" cy="40" rx="3.5" ry="5.5" fill="#3e2723" />
          </g>
          <!-- Lubang Kelinci di Kanan -->
          <ellipse cx="85" cy="88" rx="10" ry="5" fill="#3e2723" filter="url(#shadow)" />
          <!-- Kelinci Melompat Ketakutan -->
          <g transform="translate(85, 84) scale(0.55)">
            <ellipse cx="0" cy="0" rx="7" ry="10" fill="#eceff1" />
            <!-- Telinga miring -->
            <ellipse cx="-3" cy="-12" rx="2" ry="7" fill="#eceff1" transform="rotate(-20 -3 -12)" />
            <ellipse cx="3" cy="-12" rx="2" ry="7" fill="#eceff1" transform="rotate(10 3 -12)" />
            <!-- Ekor bulat -->
            <circle cx="0" cy="5" r="2.5" fill="#eceff1" />
          </g>
          <!-- Burung Terbang Pergi Cepat -->
          <g transform="translate(30, 20) scale(0.6)" filter="url(#shadow)">
            <!-- Sayap mengepak -->
            <path d="M 0 0 Q -8 -15, -18 -8 Q -10 2, 0 0 Q 8 -15, 18 -8 Q 10 2, 0 0" fill="#29b6f6" />
            <circle cx="0" cy="-3" r="2.5" fill="#29b6f6" />
            <polygon points="1,-3 4,-5 2,-1" fill="#ffa726" />
          </g>
          <!-- Tupai Ketakutan memegang Acorn di pohon -->
          <g transform="translate(14, 62) scale(0.5)">
            <!-- Badan & Ekor -->
            <ellipse cx="-6" cy="4" rx="4" ry="7" fill="#e65100" transform="rotate(30 -6 4)" /> <!-- Ekor -->
            <ellipse cx="0" cy="2" rx="6" ry="7" fill="#b55a00" />
            <circle cx="0" cy="-6" r="4.5" fill="#b55a00" />
            <!-- Kenari (Acorn) -->
            <circle cx="4" cy="5" r="2" fill="#8d6e63" />
            <!-- Mata Cemas -->
            <circle cx="1.5" cy="-7" r="0.8" fill="#37474f" />
          </g>
          <!-- Drako Sedih/Bingung -->
          ${miniDrakoSVG(52, 54, 1.15, "confused")}
        `;
        break;

      // Scene 3 — Badai Datang
      case "drako_scene3":
        svgContent = `
          <!-- Langit Badai Gelap -->
          <rect width="100" height="100" fill="url(#stormGrad)" />
          <!-- Petir Kuning -->
          <polygon points="75,5 82,18 76,20 84,32 72,22 78,20" fill="#ffeb3b" opacity="0.9" filter="url(#shadow)" />
          <!-- Awan Mendung -->
          <path d="M -10 15 C 10 5, 30 5, 45 15 C 60 5, 80 5, 95 15 L 110 25 L -10 25 Z" fill="#37474f" opacity="0.8" />
          <!-- Garis Hujan Diagonal -->
          <line x1="20" y1="0" x2="10" y2="40" stroke="#b0bec5" stroke-width="0.5" opacity="0.4" />
          <line x1="50" y1="0" x2="40" y2="50" stroke="#b0bec5" stroke-width="0.5" opacity="0.4" />
          <line x1="80" y1="0" x2="70" y2="40" stroke="#b0bec5" stroke-width="0.5" opacity="0.4" />
          <line x1="95" y1="10" x2="85" y2="60" stroke="#b0bec5" stroke-width="0.5" opacity="0.4" />
          <!-- Pusaran Angin Puyuh -->
          <path d="M 30 35 Q 15 45, 35 48 T 10 58 T 40 68 T 20 78" fill="none" stroke="#cfd8dc" stroke-width="3" stroke-linecap="round" opacity="0.6" />
          <!-- Daratan Kiri & Kanan -->
          <path d="M 0 85 L 42 85 L 48 100 L 0 100 Z" fill="#66bb6a" />
          <path d="M 0 85 L 40 85 L 45 100 L 0 100 Z" fill="#558b2f" />
          <path d="M 72 85 L 100 85 L 100 100 L 66 100 Z" fill="#558b2f" />
          <!-- Sungai mengalir deras -->
          <rect x="39" y="85" width="34" height="15" fill="url(#waterGrad)" />
          <path d="M 39 88 Q 56 83, 73 88" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.7" />
          <path d="M 39 94 Q 56 90, 73 94" stroke="#ffffff" stroke-width="1.0" fill="none" opacity="0.5" />
          
          <!-- Jembatan Kayu Terhalang Batang Kayu Besar -->
          <rect x="36" y="83" width="39" height="4" rx="1.5" fill="#8d6e63" filter="url(#shadow)" />
          <rect x="42" y="78" width="26" height="6" rx="2" fill="url(#trunkGrad)" transform="rotate(12 42 78)" filter="url(#shadow)" />
          
          <!-- Pohon di Kiri (Tempat balon tersangkut) -->
          <g transform="translate(10, 30)" filter="url(#shadow)">
            <!-- Batang & Cabang -->
            <path d="M 0 55 Q 10 40, 5 15" stroke="url(#trunkGrad)" stroke-width="5" fill="none" stroke-linecap="round" />
            <path d="M 5 25 Q 22 20, 26 23" stroke="url(#trunkGrad)" stroke-width="3" fill="none" stroke-linecap="round" />
            <!-- Daun Rindang -->
            <circle cx="5" cy="10" r="10" fill="url(#treeGrad)" />
            <circle cx="26" cy="23" r="6" fill="url(#treeGrad)" />
          </g>
          
          <!-- Balon Merah Tersangkut di Dahan Pohon Kiri -->
          <g transform="translate(32, 49) scale(0.65)" filter="url(#shadow)">
            <ellipse cx="0" cy="0" rx="8" ry="10" fill="#ff5252" />
            <polygon points="-2,10 2,10 0,7" fill="#ff5252" />
            <path d="M 0 10 Q -4 20, -2 30" stroke="#37474f" stroke-width="1" fill="none" />
          </g>
          
          <!-- Anak Kelinci Menangis di bawah pohon melihat ke balon -->
          <g transform="translate(26, 80) scale(0.55)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="8" ry="6" fill="#eceff1" />
            <!-- Kepala mendongak ke atas -->
            <circle cx="0" cy="-2" r="5.5" fill="#eceff1" />
            <!-- Telinga layu/sedih -->
            <ellipse cx="-4" cy="-8" rx="1.8" ry="5.5" fill="#eceff1" transform="rotate(-30 -4 -8)" />
            <ellipse cx="2" cy="-9" rx="1.8" ry="5.5" fill="#eceff1" transform="rotate(-15 2 -9)" />
            <!-- Mata nangis (biru/pink) -->
            <circle cx="-1.5" cy="-2" r="0.8" fill="#29b6f6" />
            <!-- Air mata jatuh -->
            <path d="M -1.5 0 L -1.5 4" stroke="#29b6f6" stroke-width="0.8" />
          </g>
          
          <!-- Anak Bebek Terjebak di Seberang (Kanan) -->
          <g transform="translate(80, 77) scale(0.55)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="6" ry="4" fill="#ffeb3b" />
            <circle cx="-3" cy="0" r="3.5" fill="#ffeb3b" />
            <polygon points="-7,0 -5,-2 -6,2" fill="#ff9800" />
            <!-- Tanda sedih/cemas -->
            <path d="M 3 -3 Q 5 -5, 7 -3" stroke="#d32f2f" stroke-width="1" fill="none" />
          </g>
          <g transform="translate(88, 79) scale(0.48)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="6" ry="4" fill="#ffeb3b" />
            <circle cx="-3" cy="0" r="3.5" fill="#ffeb3b" />
            <polygon points="-7,0 -5,-2 -6,2" fill="#ff9800" />
          </g>
          
          <!-- Drako cemas di Kiri -->
          ${miniDrakoSVG(42, 54, 1.0, "confused")}
        `;
        break;

      // Scene 4 — Drako Menolong Sayap & Cakar
      case "drako_scene4":
        svgContent = `
          <rect width="100" height="100" fill="url(#skyGrad)" />
          <!-- Awan Putih Lembut -->
          <path d="M 10 20 Q 25 15, 40 20 T 70 20" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.6" stroke-linecap="round" />
          <path d="M 0 85 Q 50 82, 100 85 L 100 100 L 0 100 Z" fill="url(#treeGrad)" />
          
          <!-- Dahan Tinggi dengan Sarang Burung dan Banyak Daun Rindang -->
          <g transform="translate(10, 30)" filter="url(#shadow)">
            <!-- Batang & Cabang Utama -->
            <path d="M 0 60 L 0 10 Q 20 5, 36 10" stroke="url(#trunkGrad)" stroke-width="6" fill="none" stroke-linecap="round" />
            <!-- Rimbun Daun Hijau -->
            <circle cx="0" cy="5" r="12" fill="url(#treeGrad)" />
            <circle cx="16" cy="5" r="10" fill="url(#treeGrad)" />
            <circle cx="32" cy="8" r="9" fill="#81c784" opacity="0.9" />
            <circle cx="24" cy="-2" r="8" fill="#4caf50" />
            
            <!-- Sarang Burung Pipit -->
            <ellipse cx="28" cy="18" rx="8" ry="4.5" fill="#d7ccc8" stroke="#a1887f" stroke-width="1.5" />
            <!-- Anak burung kecil di sarang -->
            <circle cx="26" cy="14" r="3.2" fill="#29b6f6" />
            <polygon points="27,13 30,11 29,15" fill="#ffa726" />
          </g>
          
          <!-- Balon Merah Tersangkut dan Sedang Diambil Drako -->
          <g transform="translate(42, 38) scale(0.68)" filter="url(#shadow)">
            <ellipse cx="0" cy="0" rx="8" ry="10" fill="#ff5252" />
            <polygon points="-2,10 2,10 0,7" fill="#ff5252" />
            <path d="M 0 10 Q -4 18, -2 26" stroke="#37474f" stroke-width="1" fill="none" />
          </g>
          
          <!-- Drako Terbang Mengepakkan Sayap Mengambil Tali Balon -->
          ${miniDrakoSVG(53, 38, 1.25, "happy")}
          
          <!-- Anak Kelinci di Bawah, Mendongak Berharap -->
          <g transform="translate(22, 80) scale(0.55)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="8" ry="6" fill="#eceff1" />
            <circle cx="2" cy="-2" r="5.5" fill="#eceff1" />
            <ellipse cx="0" cy="-8" rx="1.8" ry="5.5" fill="#eceff1" transform="rotate(-15 0 -8)" />
            <ellipse cx="4" cy="-8" rx="1.8" ry="5.5" fill="#eceff1" transform="rotate(10 4 -8)" />
            <circle cx="3" cy="-2" r="0.8" fill="#ff4081" />
          </g>
        `;
        break;

      // Scene 5 — Jembatan Kayu & Batang Pohon
      case "drako_scene5":
        svgContent = `
          <rect width="100" height="100" fill="url(#skyGrad)" />
          <!-- Matahari Ceria -->
          <circle cx="15" cy="18" r="6" fill="#fff9c4" opacity="0.7" />
          <circle cx="15" cy="18" r="4.5" fill="#ffe082" />
          <!-- Daratan Hijau & Sungai Indah -->
          <path d="M 0 85 L 36 85 L 42 100 L 0 100 Z" fill="#81c784" />
          <path d="M 72 85 L 100 85 L 100 100 L 66 100 Z" fill="#81c784" />
          <rect x="34" y="85" width="40" height="15" fill="url(#waterGrad)" />
          <!-- Jembatan Kayu utuh bersih -->
          <rect x="31" y="83" width="44" height="4" rx="2" fill="url(#trunkGrad)" filter="url(#shadow)" />
          <line x1="36" y1="87" x2="36" y2="100" stroke="#5d4037" stroke-width="1.5" />
          <line x1="70" y1="87" x2="70" y2="100" stroke="#5d4037" stroke-width="1.5" />
          <!-- Batang Pohon tumbang disingkirkan ke bawah -->
          <rect x="40" y="93" width="22" height="5" rx="1.5" fill="#5d4037" transform="rotate(15 40 93)" opacity="0.8" />
          
          <!-- Bebek-bebek berbaris menyeberang bahagia -->
          <g transform="translate(48, 75) scale(0.55)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="6" ry="4" fill="#ffeb3b" />
            <circle cx="4" cy="0" r="3" fill="#ffeb3b" />
            <polygon points="6,0 9,-2 7,2" fill="#ff9800" />
          </g>
          <g transform="translate(58, 76) scale(0.48)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="6" ry="4" fill="#ffeb3b" />
            <circle cx="4" cy="0" r="3" fill="#ffeb3b" />
            <polygon points="6,0 9,-2 7,2" fill="#ff9800" />
          </g>
          
          <!-- Kelinci berdiri senang di daratan kiri memegang balon merahnya -->
          <g transform="translate(12, 76) scale(0.52)" filter="url(#shadow)">
            <ellipse cx="0" cy="5" rx="8" ry="6" fill="#eceff1" />
            <circle cx="4" cy="-2" r="5" fill="#eceff1" />
            <ellipse cx="2" cy="-9" rx="1.6" ry="5" fill="#eceff1" />
            <ellipse cx="6" cy="-9" rx="1.6" ry="5" fill="#eceff1" />
            <circle cx="4" cy="-2" r="0.6" fill="#ff4081" />
            <!-- Balon merah dipegang -->
            <ellipse cx="-12" cy="-18" rx="7" ry="9" fill="#ff5252" />
            <path d="M -12 -9 Q -10 -2, 0 4" stroke="#37474f" stroke-width="1.2" fill="none" />
          </g>
          
          <!-- Drako Mendorong Senang -->
          ${miniDrakoSVG(24, 53, 1.15, "happy")}
        `;
        break;

      // Scene 6 — Hutan Ramai Persahabatan
      case "drako_scene6":
        svgContent = `
          <rect width="100" height="100" fill="#f3e5f5" />
          <circle cx="15" cy="18" r="8" fill="#fff9c4" opacity="0.6" />
          <path d="M 0 85 Q 50 80, 100 85 L 100 100 L 0 100 Z" fill="#81c784" />
          <!-- Semua Hewan berkumpul bahagia -->
          <!-- Kelinci di Kiri -->
          <g transform="translate(24, 76) scale(0.55)">
            <ellipse cx="0" cy="5" rx="8" ry="6" fill="#eceff1" />
            <circle cx="6" cy="-4" r="5" fill="#eceff1" />
            <ellipse cx="4" cy="-11" rx="2" ry="5" fill="#eceff1" />
            <ellipse cx="8" cy="-11" rx="2" ry="5" fill="#eceff1" />
          </g>
          <!-- Tupai di Kanan -->
          <g transform="translate(76, 78) scale(0.55)">
            <ellipse cx="0" cy="0" rx="8" ry="6" fill="#a1887f" />
            <circle cx="-6" cy="-6" r="5" fill="#a1887f" />
            <ellipse cx="8" cy="2" rx="4" ry="8" fill="#a1887f" />
          </g>
          <!-- Drako Bahagia dengan Kelinci kecil di Punggungnya -->
          ${miniDrakoSVG(50, 48, 1.3, "happy")}
          <!-- Kelinci naik di punggung Drako -->
          <g transform="translate(48, 62) scale(0.4)">
            <ellipse cx="0" cy="5" rx="8" ry="6" fill="#eceff1" />
            <circle cx="6" cy="-4" r="5" fill="#eceff1" />
            <ellipse cx="4" cy="-11" rx="2" ry="5" fill="#eceff1" />
          </g>
        `;
        break;

      default:
        svgContent = `
          <rect width="100" height="100" fill="#f5f5f5" />
          <circle cx="50" cy="50" r="25" fill="#e0e0e0" />
        `;
    }

    container.innerHTML = `
      <svg viewBox="0 0 100 100" class="story-illustration-svg">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#bbdefb" />
            <stop offset="60%" stop-color="#e3f2fd" />
            <stop offset="100%" stop-color="#fff9c4" />
          </linearGradient>
          <linearGradient id="stormGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#37474f" />
            <stop offset="70%" stop-color="#546e7a" />
            <stop offset="100%" stop-color="#90a4ae" />
          </linearGradient>
          <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff7043" />
            <stop offset="50%" stop-color="#ffb74d" />
            <stop offset="100%" stop-color="#fff9c4" />
          </linearGradient>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ff8a80" />
            <stop offset="25%" stop-color="#ffd54f" />
            <stop offset="50%" stop-color="#a5d6a7" />
            <stop offset="75%" stop-color="#80d8ff" />
            <stop offset="100%" stop-color="#ea80fc" />
          </linearGradient>
          <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4caf50" />
            <stop offset="100%" stop-color="#1b5e20" />
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#8d6e63" />
            <stop offset="100%" stop-color="#5d4037" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4dd0e1" />
            <stop offset="100%" stop-color="#00acc1" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity="0.15" />
          </filter>
        </defs>
        ${svgContent}
      </svg>
    `;
  }

  // ----------------------------------------------------
  // MANAJEMEN LAYAR & NAVIGASI
  // ----------------------------------------------------
  function showScreen(screenId) {
    audio.playClick();
    audio.stopSpeaking();

    // Sembunyikan semua layar
    Object.keys(screens).forEach(key => {
      screens[key].classList.remove("active");
      screens[key].style.display = "none";
    });

    const targetScreen = screens[screenId];
    if (targetScreen) {
      targetScreen.style.display = gameState.currentScreen === "welcome" && screenId === "gameBoard" ? "grid" : "flex";
      targetScreen.offsetHeight; // force reflow
      targetScreen.classList.add("active");
      gameState.currentScreen = screenId;
    }

    // Trigger visual spesifik layar
    if (screenId === "welcome") {
      renderDrako(welcomeMascot, "happy");
      setTimeout(() => {
        audio.speakMascotGreeting(MASCOT_NAME);
      }, 500);
    } else if (screenId === "victory") {
      renderDrako(victoryMascotBox, "happy");
      audio.playVictoryCelebration();
      triggerConfetti();
      
      // Simpan progres selesai
      gameState.storyCompleted = true;
      localStorage.setItem("drako_completed", "true");
    }
  }

  // ----------------------------------------------------
  // LOGIKA ALUR GAMEPLAY
  // ----------------------------------------------------
  function startStory() {
    gameState.activeStory = window.STORIES_DATA[0];
    gameState.currentPageIndex = 0;
    audio.playPageFlip();
    showScreen("gameBoard");

    // 1. Tampilkan Overlay Petunjuk Bermain
    if (tutorialOverlay) {
      tutorialOverlay.classList.add("active");
    }

    // 2. Bacakan Petunjuk Bermain secara lengkap oleh Narator
    const tutorialText = "Halo! Mari bantu Drako melengkapi cerita! Caranya, eja suku kata di sebelah kanan dengan benar, lalu tarik kartu kata yang sudah jadi ke dalam kotak rumpang di sebelah kiri. Selamat bermain!";
    
    audio.stopSpeaking();
    setTimeout(() => {
      audio.speak(tutorialText);
    }, 400);

    // 3. Muat scene 0 di latar belakang, namun lewati pembacaan otomatis ceritanya agar tidak tumpang tindih dengan tutorial
    loadScene(0, true);
  }

  function loadScene(pageIndex, skipAutoNarration = false) {
    const story = gameState.activeStory;
    if (!story || pageIndex >= story.pages.length) {
      showScreen("victory");
      return;
    }

    gameState.currentPageIndex = pageIndex;
    const page = story.pages[pageIndex];

    // Pilih 4 kata unik secara acak dari candidateBlanks di scene ini
    const candidatePool = [...page.candidateBlanks];
    const shuffledCandidates = shuffleArray(candidatePool);
    const chosen4 = shuffledCandidates.slice(0, 4);

    // Urutkan 4 kata yang terpilih sesuai posisi kemunculannya di teks cerita asli
    chosen4.sort((a, b) => {
      const posA = page.text.toLowerCase().indexOf(a.word.toLowerCase());
      const posB = page.text.toLowerCase().indexOf(b.word.toLowerCase());
      return posA - posB;
    });

    // Buat teks rumpang dinamis untuk ditampilkan di layar
    let dynamicText = page.text;
    chosen4.forEach((cand, idx) => {
      const regex = new RegExp("\\b" + cand.word + "\\b", "i");
      dynamicText = dynamicText.replace(regex, `___(${idx + 1})___`);
    });

    gameState.activeSceneText = dynamicText;
    gameState.placedCards = new Array(chosen4.length).fill(null);

    // Reset status perakitan 4 kata rumpang dengan suku kata pengecoh (distractors)
    gameState.blanksState = chosen4.map((b, idx) => {
      // Kumpulan suku kata pengecoh umum
      const distractorPool = ["lu", "ki", "da", "me", "ba", "ro", "ti", "sa", "pa", "ma", "ku", "ri", "te", "wo", "fa", "bu", "to", "yu", "ce", "ko"];
      // Pastikan suku kata pengecoh tidak sama dengan suku kata asli dari kata target
      const availableDistractors = distractorPool.filter(s => !b.syllables.includes(s));
      
      // Jumlah pengecoh: 2 buah untuk kata pendek (<= 2 suku kata), 1 buah untuk kata panjang (>= 3 suku kata)
      const numDistractors = b.syllables.length <= 2 ? 2 : 1;
      const chosenDistractors = [];
      const shuffledDistPool = shuffleArray([...availableDistractors]);
      for (let i = 0; i < numDistractors && i < shuffledDistPool.length; i++) {
        chosenDistractors.push(shuffledDistPool[i]);
      }

      // Gabungkan suku kata asli dengan suku kata pengecoh untuk diacak
      let syllablesToShuffle = [...b.syllables, ...chosenDistractors];
      let shuffled = shuffleArray([...syllablesToShuffle]);
      
      // Pastikan suku kata asli tidak langsung berurutan benar di bagian awal
      let attempts = 0;
      const isSequenceCorrect = (arr, target) => {
        for (let i = 0; i < target.length; i++) {
          if (arr[i] !== target[i]) return false;
        }
        return true;
      };
      
      while (isSequenceCorrect(shuffled, b.syllables) && syllablesToShuffle.length > 1 && attempts < 10) {
        shuffled = shuffleArray([...syllablesToShuffle]);
        attempts++;
      }
      
      if (isSequenceCorrect(shuffled, b.syllables) && syllablesToShuffle.length > 1) {
        shuffled.reverse();
      }

      return {
        index: idx + 1,
        word: b.word,
        syllables: [...b.syllables],
        shuffledSyllables: shuffled,
        assembledSyllables: new Array(b.syllables.length).fill(null),
        isSpelledCorrectly: false,
        isPlacedInBlank: false,
        hintText: b.hintText,
        hintIcon: b.hintIcon,
        hintColor: b.hintColor
      };
    });

    // Set urutan acak untuk merender 4 blok soal di panel kanan (garansi teracak & bukan urut 0, 1, 2, 3)
    let order = shuffleArray([0, 1, 2, 3]);
    if (JSON.stringify(order) === JSON.stringify([0, 1, 2, 3])) {
      order = [3, 0, 2, 1];
    }
    gameState.blockRenderOrder = order;

    // 1. Label header & progress dots
    gameSceneLabel.textContent = `Scene ${pageIndex + 1} / ${story.pages.length}`;
    
    // Render progress dots
    gameProgressDots.innerHTML = "";
    story.pages.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = `progress-dot ${idx === pageIndex ? 'active' : (idx < pageIndex ? 'completed' : '')}`;
      gameProgressDots.appendChild(dot);
    });

    // 2. Render Ilustrasi
    renderSceneIllustration(storyIllustrationContainer, page.illustration);

    // 3. Render Teks Cerita Rumpang
    renderNarrationTextWithBlanks(dynamicText);

    // 4. Render 4 Blok Soal di Panel Kanan
    renderInteractionBlocks();

    // 5. Reset Tombol Selanjutnya
    btnNextScene.disabled = true;
    btnNextScene.classList.remove("active-bounce");

    // 6. Ucapkan Narasi Cerita secara otomatis jika tidak dilewati (tutorial sedang berjalan)
    if (!skipAutoNarration) {
      setTimeout(() => {
        playCurrentSceneNarration();
      }, 700);
    }
  }

  // Mengacak array (Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Efek ledakan partikel visual (Confetti/Burst)
  function triggerParticleBurst(x, y) {
    const colors = ["#ff7043", "#ffb74d", "#66bb6a", "#a3e2f5", "#ba68c8", "#ffeb3b"];
    const shapes = ["⭐", "✨", "🎈", "🌸", "🟢", "🟡"];
    const container = document.body;

    for (let i = 0; i < 16; i++) {
      const particle = document.createElement("div");
      particle.className = "game-particle";
      
      const isEmoji = Math.random() > 0.5;
      if (isEmoji) {
        particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        particle.style.fontSize = (Math.random() * 8 + 12) + "px";
      } else {
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = "50%";
        particle.style.width = (Math.random() * 8 + 6) + "px";
        particle.style.height = particle.style.width;
      }

      particle.style.position = "fixed";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "9999";

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      particle.style.setProperty("--dx", dx + "px");
      particle.style.setProperty("--dy", dy + "px");

      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 800);
    }
  }

  function renderNarrationTextWithBlanks(rawText) {
    let html = rawText;
    // Ganti rumpang secara dinamis sesuai dengan jumlah blanksState terpilih (4 rumpang)
    for (let i = 1; i <= gameState.blanksState.length; i++) {
      const regex = new RegExp(`___\\(${i}\\)___`, "g");
      html = html.replace(regex, `<span class="word-drop-blank" id="blank-${i}" data-index="${i}">?</span>`);
    }
    storyNarrationDisplay.innerHTML = html;

    // Setup area drop zona blank
    setupBlankDropZones();
  }

  function playCurrentSceneNarration() {
    audio.stopSpeaking();

    // Ubah ikon tombol menjadi stop (square)
    btnReadNarration.innerHTML = `<i data-lucide="square"></i>`;
    lucide.createIcons();
    btnReadNarration.classList.add("speaking");

    // Ganti tanda rumpang dengan penanda verbal singkat "titik-titik"
    let textToSpeak = (gameState.activeSceneText || "").replace(/___\(\d+\)___/g, " titik-titik ");

    audio.speakNarration(
      textToSpeak,
      () => {
        gameState.isSpeakingNarration = true;
      },
      () => {
        gameState.isSpeakingNarration = false;
        btnReadNarration.classList.remove("speaking");
        btnReadNarration.innerHTML = `<i data-lucide="volume-2"></i>`;
        lucide.createIcons();
      }
    );
  }

  // ----------------------------------------------------
  // RENDERING & LOGIKA BLOK SUKU KATA
  // ----------------------------------------------------
  function renderInteractionBlocks() {
    interactionBlocksContainer.innerHTML = "";

    // Gunakan urutan acak yang disimpan di state agar konsisten saat re-render dalam scene yang sama
    if (!gameState.blockRenderOrder || gameState.blockRenderOrder.length !== gameState.blanksState.length) {
      gameState.blockRenderOrder = shuffleArray(gameState.blanksState.map((_, i) => i));
    }

    gameState.blockRenderOrder.forEach((blockIdx) => {
      const bState = gameState.blanksState[blockIdx];
      const blockEl = document.createElement("div");
      blockEl.className = `interaction-block ${bState.isSpelledCorrectly ? 'completed-spelled' : ''}`;
      blockEl.id = `block-${blockIdx}`;

      // Baris Atas: Tombol Hint, Gambar, & Label ejaan
      const headerRow = document.createElement("div");
      headerRow.className = "block-header-row";

      const hintBtn = document.createElement("button");
      hintBtn.className = "btn-hint-bubble";
      hintBtn.innerHTML = `💡 Hint`;
      
      const hintImg = document.createElement("div");
      hintImg.className = "hint-image-placeholder";
      hintImg.id = `hint-img-${blockIdx}`;
      hintImg.textContent = "?";

      const label = document.createElement("span");
      label.className = "hint-text-label";
      label.id = `hint-label-${blockIdx}`;
      label.textContent = "- ".repeat(bState.syllables.length).trim();

      headerRow.appendChild(hintBtn);
      headerRow.appendChild(hintImg);
      headerRow.appendChild(label);

      // Baris Bawah: Area kerja slot & Reservoir Suku kata
      const workRow = document.createElement("div");
      workRow.className = "block-work-row";

      const slotsContainer = document.createElement("div");
      slotsContainer.className = "block-slots-container";
      slotsContainer.id = `slots-container-${blockIdx}`;

      // Buat Slots
      bState.syllables.forEach((_, sIdx) => {
        const slot = document.createElement("div");
        slot.className = `block-slot ${bState.isSpelledCorrectly ? 'correct-snap' : ''}`;
        slot.dataset.blockIndex = blockIdx;
        slot.dataset.slotIndex = sIdx;
        slotsContainer.appendChild(slot);
      });

      const tilesContainer = document.createElement("div");
      tilesContainer.className = "block-tiles-container";
      tilesContainer.id = `tiles-container-${blockIdx}`;

      workRow.appendChild(slotsContainer);
      workRow.appendChild(tilesContainer);

      blockEl.appendChild(headerRow);
      blockEl.appendChild(workRow);
      interactionBlocksContainer.appendChild(blockEl);

      // Isi reservoir suku kata
      renderSyllablesForBlock(blockIdx);

      // Event listener Hint
      hintBtn.addEventListener("click", () => revealHint(blockIdx));
      hintImg.addEventListener("click", () => {
        if (hintImg.classList.contains("hint-image-revealed")) {
          audio.speakWord(bState.word);
        }
      });
    });
  }

  function renderSyllablesForBlock(blockIdx) {
    const tilesContainer = document.getElementById(`tiles-container-${blockIdx}`);
    if (!tilesContainer) return;

    tilesContainer.innerHTML = "";
    const bState = gameState.blanksState[blockIdx];

    if (bState.isSpelledCorrectly) {
      if (!bState.isPlacedInBlank) {
        // Tampilkan tombol kata utuh yang siap ditarik/ditekan
        const compCard = document.createElement("div");
        compCard.className = "block-word-complete-card";
        compCard.id = `complete-card-${blockIdx}`;
        compCard.innerHTML = `<span>${bState.word}</span> 🎁`;
        
        setupCompleteCardDragAndDrop(compCard, blockIdx);
        tilesContainer.appendChild(compCard);
      } else {
        tilesContainer.innerHTML = `<span style="color: var(--color-success-dark); font-weight:700; font-size:14px;">Tersusun! ✨</span>`;
      }
      return;
    }

    // Jika belum tersusun benar, tampilkan suku kata acak
    bState.shuffledSyllables.forEach((syl, idx) => {
      const card = document.createElement("div");
      card.className = "block-syllable-card";
      card.textContent = syl;
      card.dataset.syllable = syl;
      card.dataset.blockIndex = blockIdx;
      card.dataset.cardIndex = idx;

      setupSyllableDragAndDrop(card, blockIdx);
      tilesContainer.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // SISTEM INTERAKSI HINT
  // ----------------------------------------------------
  function revealHint(blockIdx) {
    audio.playClick();
    const bState = gameState.blanksState[blockIdx];
    const hintImg = document.getElementById(`hint-img-${blockIdx}`);
    
    if (hintImg && !hintImg.classList.contains("hint-image-revealed")) {
      hintImg.className = "hint-image-revealed";
      hintImg.textContent = bState.hintIcon;
      
      const label = document.getElementById(`hint-label-${blockIdx}`);
      if (label) {
        label.textContent = bState.hintText;
      }
    }
    
    // Bicara kata utuh
    audio.speakWord(bState.word);
  }

  // ----------------------------------------------------
  // DETEKSI HOVER & DRAG-DROP SUKU KATA
  // ----------------------------------------------------
  function checkSlotHover(x, y, blockIdx) {
    const slots = document.querySelectorAll(`.block-slot[data-block-index="${blockIdx}"]`);
    slots.forEach(slot => {
      const rect = slot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      // Toleransi deteksi slot 55px
      if (dist < 55) {
        slot.classList.add("dragover");
      } else {
        slot.classList.remove("dragover");
      }
    });
  }

  function clearAllSlotHover(blockIdx) {
    const slots = document.querySelectorAll(`.block-slot[data-block-index="${blockIdx}"]`);
    slots.forEach(slot => slot.classList.remove("dragover"));
  }

  function setupSyllableDragAndDrop(card, blockIdx) {
    let startX = 0, startY = 0;
    let initialRect = null;
    let ghost = null;
    let isDragging = false;
    const dragOffsetY = 50; // Jarak offset ke atas agar tidak tertutup jempol anak di HP

    card.addEventListener("pointerdown", (e) => {
      // Jangan jalankan jika sudah di slot
      if (card.classList.contains("placed")) {
        // Klik di slot mengembalikan kartu ke bawah
        returnSyllableToReservoir(card, blockIdx);
        return;
      }

      audio.initContext();
      startX = e.clientX;
      startY = e.clientY;
      initialRect = card.getBoundingClientRect();

      card.setPointerCapture(e.pointerId);
      isDragging = false;
    });

    card.addEventListener("pointermove", (e) => {
      if (!card.hasPointerCapture(e.pointerId)) return;

      const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));

      if (!isDragging && dist > 10) {
        isDragging = true;
        document.body.classList.add("dragging-active"); // Kunci scroll layar HP saat menyeret suku kata

        ghost = card.cloneNode(true);
        ghost.className = "block-syllable-card dragging-ghost";
        ghost.style.width = initialRect.width + "px";
        ghost.style.height = initialRect.height + "px";
        ghost.style.left = (e.clientX - initialRect.width / 2) + "px";
        ghost.style.top = (e.clientY - initialRect.height / 2 - dragOffsetY) + "px";
        document.body.appendChild(ghost);

        card.style.opacity = "0.2";
      }

      if (isDragging && ghost) {
        ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + "px";
        ghost.style.top = (e.clientY - ghost.offsetHeight / 2 - dragOffsetY) + "px";
        checkSlotHover(e.clientX, e.clientY - dragOffsetY, blockIdx);
      }
    });

    card.addEventListener("pointerup", (e) => {
      if (!card.hasPointerCapture(e.pointerId)) return;
      card.releasePointerCapture(e.pointerId);

      card.style.opacity = "1";
      document.body.classList.remove("dragging-active"); // Lepas kunci scroll
      clearAllSlotHover(blockIdx);

      if (isDragging) {
        if (ghost) {
          handleSyllableDrop(card, e.clientX, e.clientY - dragOffsetY, blockIdx);
          ghost.remove();
          ghost = null;
        }
      } else {
        // Hanya ucapkan suaranya, tidak menempatkan di slot secara otomatis
        audio.speakSyllable(card.dataset.syllable);
      }
      isDragging = false;
    });

    card.addEventListener("pointercancel", (e) => {
      if (card.hasPointerCapture(e.pointerId)) {
        card.releasePointerCapture(e.pointerId);
      }
      card.style.opacity = "1";
      document.body.classList.remove("dragging-active");
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      clearAllSlotHover(blockIdx);
      isDragging = false;
    });
  }

  function handleSyllableTap(card, blockIdx) {
    audio.speakSyllable(card.dataset.syllable);
    
    // Cari slot kosong pertama di blok yang bersangkutan
    const slots = Array.from(document.querySelectorAll(`.block-slot[data-block-index="${blockIdx}"]`));
    const emptySlot = slots.find(slot => !slot.hasChildNodes());

    if (emptySlot) {
      placeSyllableInSlot(card, emptySlot, blockIdx);
    }
  }

  function handleSyllableDrop(card, dropX, dropY, blockIdx) {
    const slots = document.querySelectorAll(`.block-slot[data-block-index="${blockIdx}"]`);
    let snappedSlot = null;
    let minDist = 9999;

    slots.forEach(slot => {
      const rect = slot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(dropX - centerX, 2) + Math.pow(dropY - centerY, 2));

      // Toleransi drop 60px
      if (dist < 60 && dist < minDist) {
        minDist = dist;
        snappedSlot = slot;
      }
    });

    if (snappedSlot) {
      placeSyllableInSlot(card, snappedSlot, blockIdx);
    } else {
      audio.playClick();
    }
  }

  function placeSyllableInSlot(card, slot, blockIdx) {
    const slotIdx = parseInt(slot.dataset.slotIndex);
    const syllable = card.dataset.syllable;

    // Jika slot sudah ada kartunya, kembalikan kartu lama ke bawah
    if (slot.hasChildNodes()) {
      const oldCard = slot.firstElementChild;
      oldCard.classList.remove("placed");
      const tilesContainer = document.getElementById(`tiles-container-${blockIdx}`);
      if (tilesContainer) tilesContainer.appendChild(oldCard);
      
      const oldSlotIdx = parseInt(oldCard.parentElement.dataset.slotIndex);
      gameState.blanksState[blockIdx].assembledSyllables[oldSlotIdx] = null;
    }

    card.className = "block-syllable-card placed";
    slot.appendChild(card);
    audio.playPop();

    gameState.blanksState[blockIdx].assembledSyllables[slotIdx] = syllable;

    // Cek ejaan kata blok
    checkBlockSpelling(blockIdx);
  }

  function returnSyllableToReservoir(card, blockIdx) {
    card.classList.remove("placed");
    const slot = card.parentElement;
    const slotIdx = parseInt(slot.dataset.slotIndex);

    const tilesContainer = document.getElementById(`tiles-container-${blockIdx}`);
    if (tilesContainer) {
      tilesContainer.appendChild(card);
    }

    gameState.blanksState[blockIdx].assembledSyllables[slotIdx] = null;
    audio.playClick();
  }

  // ----------------------------------------------------
  // VALIDASI KATA BLOK
  // ----------------------------------------------------
  function checkBlockSpelling(blockIdx) {
    const bState = gameState.blanksState[blockIdx];
    if (bState.isSpelledCorrectly) return; // Guard agar tidak terpicu dua kali
    const allFilled = bState.assembledSyllables.every(syl => syl !== null);
    if (!allFilled) return;

    const assembledWord = bState.assembledSyllables.join("").toUpperCase();
    const targetWord = bState.word.replace(/-/g, "").toUpperCase(); // bandingkan secara case-insensitive & hilangkan semua strip

    if (assembledWord === targetWord) {
      handleBlockSpellingCorrect(blockIdx);
    } else {
      setTimeout(() => {
        handleBlockSpellingIncorrect(blockIdx);
      }, 500);
    }
  }

  function handleBlockSpellingCorrect(blockIdx) {
    const bState = gameState.blanksState[blockIdx];
    bState.isSpelledCorrectly = true;
    audio.playCorrect();

    // Efek ledakan partikel sukses
    const blockEl = document.getElementById(`block-${blockIdx}`);
    if (blockEl) {
      const rect = blockEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      triggerParticleBurst(centerX, centerY);
    }

    // Ganti label header menjadi warna hijau terang
    const label = document.getElementById(`hint-label-${blockIdx}`);
    if (label) {
      label.textContent = bState.word;
      label.style.color = "var(--color-success-dark)";
    }

    // Paksa gambar hint muncul
    const hintImg = document.getElementById(`hint-img-${blockIdx}`);
    if (hintImg) {
      hintImg.className = "hint-image-revealed";
      hintImg.textContent = bState.hintIcon;
    }

    // Set kelas sukses di slots
    const slots = document.querySelectorAll(`.block-slot[data-block-index="${blockIdx}"]`);
    slots.forEach(slot => slot.classList.add("correct-snap"));

    // Tambah kelas sukses ke card block utama
    document.getElementById(`block-${blockIdx}`).classList.add("completed-spelled");

    // Beri pujian dan ubah ke tombol utuh
    setTimeout(() => {
      audio.speakRandomPraise(null, () => {
        audio.speakWord(bState.word);
        renderSyllablesForBlock(blockIdx);
      });
    }, 300);
  }

  function handleBlockSpellingIncorrect(blockIdx) {
    const bState = gameState.blanksState[blockIdx];
    const blockEl = document.getElementById(`block-${blockIdx}`);
    blockEl.classList.add("wiggle");
    audio.playIncorrect();

    audio.speakTryAgain();

    setTimeout(() => {
      blockEl.classList.remove("wiggle");

      // Kembalikan semua kartu dalam slot ke reservoir
      const slots = document.querySelectorAll(`.block-slot[data-block-index="${blockIdx}"]`);
      slots.forEach(slot => {
        if (slot.hasChildNodes()) {
          const card = slot.firstElementChild;
          card.classList.remove("placed");
          const tilesContainer = document.getElementById(`tiles-container-${blockIdx}`);
          if (tilesContainer) tilesContainer.appendChild(card);
        }
      });

      bState.assembledSyllables.fill(null);
    }, 600);
  }

  // ----------------------------------------------------
  // DRAG & DROP KATA UTUH KE KALIMAT RUMPANG
  // ----------------------------------------------------
  function checkBlankHover(x, y, blockIdx) {
    const blanks = storyNarrationDisplay.querySelectorAll(".word-drop-blank");
    blanks.forEach(blank => {
      const rect = blank.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      if (dist < 80) {
        blank.classList.add("dragover");
      } else {
        blank.classList.remove("dragover");
      }
    });
  }

  function setupBlankDropZones() {
    const blanks = storyNarrationDisplay.querySelectorAll(".word-drop-blank");
    blanks.forEach(blank => {
      blank.addEventListener("click", () => {
        const targetBlankIdx = parseInt(blank.dataset.index) - 1;
        const placedIdx = gameState.placedCards[targetBlankIdx];
        if (placedIdx !== null && placedIdx !== undefined) {
          // Kembalikan kartu kata ke reservoir block-nya
          gameState.placedCards[targetBlankIdx] = null;
          gameState.blanksState[placedIdx].isPlacedInBlank = false;

          // Reset visual blank
          blank.className = "word-drop-blank";
          blank.innerHTML = "?";

          // Refresh block
          renderSyllablesForBlock(placedIdx);
          audio.playClick();
        }
      });
    });
  }

  function setupCompleteCardDragAndDrop(cardEl, blockIdx) {
    let startX = 0, startY = 0;
    let initialRect = null;
    let ghost = null;
    let isDragging = false;
    const dragOffsetY = 50; // Offset ke atas untuk HP

    cardEl.addEventListener("pointerdown", (e) => {
      audio.initContext();
      startX = e.clientX;
      startY = e.clientY;
      initialRect = cardEl.getBoundingClientRect();

      cardEl.setPointerCapture(e.pointerId);
      isDragging = false;
    });

    cardEl.addEventListener("pointermove", (e) => {
      if (!cardEl.hasPointerCapture(e.pointerId)) return;

      const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));

      if (!isDragging && dist > 10) {
        isDragging = true;
        document.body.classList.add("dragging-active"); // Kunci scroll layar HP saat menyeret kata utuh

        ghost = cardEl.cloneNode(true);
        ghost.className = "block-word-complete-card dragging-ghost";
        ghost.style.width = initialRect.width + "px";
        ghost.style.height = initialRect.height + "px";
        ghost.style.left = (e.clientX - initialRect.width / 2) + "px";
        ghost.style.top = (e.clientY - initialRect.height / 2 - dragOffsetY) + "px";
        document.body.appendChild(ghost);

        cardEl.style.opacity = "0.2";
      }

      if (isDragging && ghost) {
        ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + "px";
        ghost.style.top = (e.clientY - ghost.offsetHeight / 2 - dragOffsetY) + "px";
        checkBlankHover(e.clientX, e.clientY - dragOffsetY, blockIdx);
      }
    });

    cardEl.addEventListener("pointerup", (e) => {
      if (!cardEl.hasPointerCapture(e.pointerId)) return;
      cardEl.releasePointerCapture(e.pointerId);

      cardEl.style.opacity = "1";
      document.body.classList.remove("dragging-active"); // Lepas kunci scroll
      const blanks = storyNarrationDisplay.querySelectorAll(".word-drop-blank");
      blanks.forEach(b => b.classList.remove("dragover"));

      if (isDragging) {
        if (ghost) {
          handleCompleteCardDrop(cardEl, e.clientX, e.clientY - dragOffsetY, blockIdx);
          ghost.remove();
          ghost = null;
        }
      } else {
        // Hanya ucapkan kata lengkapnya saat diklik, tidak menempatkan secara otomatis
        audio.speakWord(gameState.blanksState[blockIdx].word);
      }
      isDragging = false;
    });

    cardEl.addEventListener("pointercancel", (e) => {
      if (cardEl.hasPointerCapture(e.pointerId)) {
        cardEl.releasePointerCapture(e.pointerId);
      }
      cardEl.style.opacity = "1";
      document.body.classList.remove("dragging-active");
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      const blanks = storyNarrationDisplay.querySelectorAll(".word-drop-blank");
      blanks.forEach(b => b.classList.remove("dragover"));
      isDragging = false;
    });
  }

  function handleCompleteCardDrop(cardEl, dropX, dropY, blockIdx) {
    const blanks = storyNarrationDisplay.querySelectorAll(".word-drop-blank");
    let snappedBlank = null;
    let minDist = 9999;

    blanks.forEach(blank => {
      const rect = blank.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(dropX - centerX, 2) + Math.pow(dropY - centerY, 2));

      if (dist < 80 && dist < minDist) {
        minDist = dist;
        snappedBlank = blank;
      }
    });

    if (snappedBlank) {
      const targetBlankIdx = parseInt(snappedBlank.dataset.index) - 1;
      snapWordToBlank(blockIdx, targetBlankIdx);
    } else {
      audio.playClick();
    }
  }

  function snapWordToBlank(blockIdx, targetBlankIdx) {
    const bState = gameState.blanksState[blockIdx];
    const isCorrect = (blockIdx === targetBlankIdx);

    // 1. Jika penempatan salah, tolak penempelan, getarkan rumpang merah, dan biarkan kartu kembali ke reservoir kanan
    if (!isCorrect) {
      audio.playIncorrect();
      const blank = document.getElementById(`blank-${targetBlankIdx + 1}`);
      if (blank) {
        blank.classList.add("incorrect");
        setTimeout(() => {
          blank.classList.remove("incorrect");
        }, 400);
      }
      renderSyllablesForBlock(blockIdx);
      return;
    }

    // 2. Jika benar, lakukan penempatan kartu ke blank tujuan
    
    // Jika kartu ini sebelumnya ada di blank lain (tidak seharusnya terjadi karena correct-only snap, tapi untuk keamanan):
    const oldBlankIdx = gameState.placedCards.indexOf(blockIdx);
    if (oldBlankIdx !== -1) {
      gameState.placedCards[oldBlankIdx] = null;
      const oldBlank = document.getElementById(`blank-${oldBlankIdx + 1}`);
      if (oldBlank) {
        oldBlank.className = "word-drop-blank";
        oldBlank.innerHTML = "?";
      }
    }

    // Pasang kartu di blank tujuan
    gameState.placedCards[targetBlankIdx] = blockIdx;
    bState.isPlacedInBlank = true;

    // Update visual blank tujuan menjadi hijau sukses
    const blank = document.getElementById(`blank-${targetBlankIdx + 1}`);
    if (blank) {
      blank.className = "word-drop-blank filled correct";
      blank.innerHTML = `<span>${bState.word}</span>`;
      audio.playPop();
    }

    // Refresh block tiles
    renderSyllablesForBlock(blockIdx);

    // 3. Cek kelengkapan & kebenaran scene (selesai jika 4 blank terisi dengan benar secara berurutan)
    const allCorrect = gameState.placedCards.every((placedIdx, idx) => placedIdx === idx);
    if (allCorrect) {
      handleSceneCompleted();
    }
  }

  // ----------------------------------------------------
  // PENYELESAIAN SCENE & ANIMASI REWARD
  // ----------------------------------------------------
  function handleSceneCompleted() {
    audio.playCorrect();

    // 1. Animasikan Box Ilustrasi (Micro-animation zoom/glow)
    storyIllustrationContainer.classList.add("wiggle");
    const drakoInIllustration = document.getElementById("drako-character");
    if (drakoInIllustration) {
      // berikan lompatan kecil pada Drako di SVG
      drakoInIllustration.style.transform = "translate(50px, 42px) scale(1.2)";
    }

    setTimeout(() => {
      storyIllustrationContainer.classList.remove("wiggle");
    }, 600);

    // 2. Bacakan Narasi Lengkap Scene
    setTimeout(() => {
      const page = gameState.activeStory.pages[gameState.currentPageIndex];
      let completeText = page.text;

      // SorotVisualKata
      const wordSpans = storyNarrationDisplay.querySelectorAll(".word-span");
      audio.speakNarration(
        completeText,
        () => {
          gameState.isSpeakingNarration = true;
          // Ubah ikon tombol menjadi stop (square)
          btnReadNarration.innerHTML = `<i data-lucide="square"></i>`;
          lucide.createIcons();
          btnReadNarration.classList.add("speaking");
        },
        () => {
          gameState.isSpeakingNarration = false;
          btnReadNarration.classList.remove("speaking");
          btnReadNarration.innerHTML = `<i data-lucide="volume-2"></i>`;
          lucide.createIcons();
          
          // Aktifkan tombol Selanjutnya
          btnNextScene.disabled = false;
          btnNextScene.classList.add("active-bounce");
        }
      );
    }, 800);
  }

  // ----------------------------------------------------
  // EFEK CONFETTI BINTANG (VICTORY SCREEN)
  // ----------------------------------------------------
  function triggerConfetti() {
    const canvas = document.getElementById("victory-canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const particles = [];
    const colors = ["#ff7043", "#ffb74d", "#66bb6a", "#a3e2f5", "#ba68c8", "#ffeb3b"];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 2.5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height) alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.r % 2 === 0) {
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        } else {
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (alive && gameState.currentScreen === "victory") {
        requestAnimationFrame(draw);
      }
    }

    draw();
  }

  // ----------------------------------------------------
  // EVENT BINDINGS BUTTON & MODAL SETTINGS
  // ----------------------------------------------------

  // Inisialisasi Audio Context pada klik pertama di manapun
  document.body.addEventListener("pointerdown", () => {
    audio.initContext();
  }, { once: true });

  // Home -> Play
  document.getElementById("btn-welcome-play").addEventListener("click", () => {
    // Bacakan judul cerita terlebih dahulu sebelum masuk ke scene
    audio.speakWord("Drako si naga baik", null, () => {
      startStory();
    });
  });

  // Tutup Tutorial Overlay -> Mulai Scene 1
  const startGameplayAfterTutorial = () => {
    audio.playClick();
    audio.stopSpeaking();
    if (tutorialOverlay) {
      tutorialOverlay.classList.remove("active");
    }
    // Mainkan suara narasi Scene 1 secara normal setelah jeda kecil
    setTimeout(() => {
      playCurrentSceneNarration();
    }, 350);
  };

  if (btnTutorialStart) {
    btnTutorialStart.addEventListener("click", startGameplayAfterTutorial);
  }

  // Welcome / Gameplay / Victory -> Settings Modal
  const openSettings = () => {
    audio.playClick();
    settingsModal.classList.add("active");
    // Sync slider values
    sliderBgm.value = audio.bgmVolume;
    sliderNarrator.value = audio.narratorVolume;
    sliderSfx.value = audio.sfxVolume;
  };

  document.getElementById("btn-welcome-settings").addEventListener("click", openSettings);
  document.getElementById("btn-game-settings").addEventListener("click", openSettings);
  document.getElementById("btn-victory-settings").addEventListener("click", openSettings);

  // Close Settings Modal
  btnSettingsClose.addEventListener("click", () => {
    audio.playClick();
    settingsModal.classList.remove("active");
  });

  // Slider Event Listeners
  sliderBgm.addEventListener("input", (e) => {
    audio.setBgmVolume(e.target.value);
  });
  sliderNarrator.addEventListener("input", (e) => {
    audio.setNarratorVolume(e.target.value);
  });
  sliderSfx.addEventListener("input", (e) => {
    audio.setSfxVolume(e.target.value);
  });

  // Gameplay -> Kembali ke Menu Utama
  document.getElementById("btn-game-back").addEventListener("click", () => {
    if (confirm("Ingin kembali ke halaman beranda? Progres scene ini akan hilang.")) {
      showScreen("welcome");
    }
  });

  // Gameplay -> Lanjut Scene
  btnNextScene.addEventListener("click", () => {
    audio.playClick();
    const nextIdx = gameState.currentPageIndex + 1;
    loadScene(nextIdx);
  });

  // Ulang / Hentikan (Skip) Narasi
  btnReadNarration.addEventListener("click", () => {
    if (gameState.isSpeakingNarration) {
      // Hentikan/Skip narasi
      audio.stopSpeaking();
      gameState.isSpeakingNarration = false;
      btnReadNarration.classList.remove("speaking");
      btnReadNarration.innerHTML = `<i data-lucide="volume-2"></i>`;
      lucide.createIcons();

      // Bersihkan sorotan visual kata
      const wordSpans = storyNarrationDisplay.querySelectorAll(".word-span");
      wordSpans.forEach(span => span.classList.remove("speaking-highlight"));

      // Jika scene sudah selesai dikerjakan, pastikan tombol "Selanjutnya" tetap aktif
      const allFilled = gameState.blanksState.every(b => b.isPlacedInBlank);
      if (allFilled) {
        btnNextScene.disabled = false;
        btnNextScene.classList.add("active-bounce");
      }
    } else {
      playCurrentSceneNarration();
    }
  });

  // Victory -> Kembali ke Awal
  document.getElementById("btn-victory-home").addEventListener("click", () => {
    showScreen("welcome");
  });

  // ----------------------------------------------------
  // MULAI INITIAL RUN GAME!
  // ----------------------------------------------------
  showScreen("welcome");
});
