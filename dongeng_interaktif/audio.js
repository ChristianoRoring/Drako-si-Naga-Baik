// GameAudio - Sistem Pengelolaan Suara dan Narasi untuk Dongeng Interaktif "Drako si Naga Baik"
// Menyediakan BGM sintetis (Web Audio API), efek suara instan, & Narasi Bahasa Indonesia (Web Speech API)

class BGMPlayer {
  constructor(audioCtx, gainNode) {
    this.audioCtx = audioCtx;
    this.gainNode = gainNode;
    this.isPlaying = false;
    this.tempo = 90; // BPM lambat dan rileks
    this.currentStep = 0;
    this.timerId = null;

    // Melodi pentatonik C Mayor yang manis, tenang, dan ramah anak
    this.melody = [
      "C4", "E4", "G4", "A4", "G4", "E4", "C4", "D4",
      "E4", "G4", "C5", "A4", "G4", "E4", "D4", "C4",
      "E4", "G4", "A4", "C5", "A4", "G4", "E4", "D4",
      "C4", "D4", "E4", "G4", "E4", "D4", "C4", ""
    ];

    this.noteFreqs = {
      "C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.00, "A4": 440.00,
      "C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99, "A5": 880.00
    };
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.playNextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  playNextNote() {
    if (!this.isPlaying) return;

    const now = this.audioCtx.currentTime;
    const note = this.melody[this.currentStep];
    const freq = this.noteFreqs[note];

    if (freq && this.gainNode.gain.value > 0.01) {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.type = 'sine'; // Suara seruling/plink lembut
      osc.frequency.setValueAtTime(freq, now);

      // Volume envelope yang sangat lembut agar tidak menusuk telinga
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.2, now + 0.1); // Ramp up
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // Fade out panjang

      osc.start(now);
      osc.stop(now + 1.3);
    }

    this.currentStep = (this.currentStep + 1) % this.melody.length;
    const stepDuration = (60 / this.tempo) * 1000; // Jeda per ketuk
    this.timerId = setTimeout(() => this.playNextNote(), stepDuration);
  }
}

class GameAudio {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = window.speechSynthesis;
    this.useSpeechSynthesis = true;
    
    // Ambil volume yang disimpan atau gunakan nilai bawaan
    this.bgmVolume = parseFloat(localStorage.getItem("drako_vol_bgm")) !== null && !isNaN(parseFloat(localStorage.getItem("drako_vol_bgm"))) ? parseFloat(localStorage.getItem("drako_vol_bgm")) : 0.3;
    this.sfxVolume = parseFloat(localStorage.getItem("drako_vol_sfx")) !== null && !isNaN(parseFloat(localStorage.getItem("drako_vol_sfx"))) ? parseFloat(localStorage.getItem("drako_vol_sfx")) : 0.6;
    this.narratorVolume = parseFloat(localStorage.getItem("drako_vol_narrator")) !== null && !isNaN(parseFloat(localStorage.getItem("drako_vol_narrator"))) ? parseFloat(localStorage.getItem("drako_vol_narrator")) : 0.8;

    this.currentNarratorUtterance = null;
    this.indonesianVoice = null;

    // Audio nodes
    this.bgmGainNode = null;
    this.bgmPlayer = null;

    // Daftar pujian positif untuk anak
    this.praises = [
      "Hebat sekali!",
      "Luar biasa!",
      "Wah, kamu pintar!",
      "Hore, kamu berhasil!",
      "Keren sekali!",
      "Hebat! Betul sekali!"
    ];

    // Deteksi suara Bahasa Indonesia
    this.initVoice();
    if (this.speechSynth && typeof this.speechSynth.addEventListener === 'function') {
      this.speechSynth.addEventListener('voiceschanged', () => this.initVoice());
    }
  }

  // Inisialisasi AudioContext dan BGM
  initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Setup BGM Gain Node
      this.bgmGainNode = this.audioCtx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.audioCtx.currentTime);
      this.bgmGainNode.connect(this.audioCtx.destination);

      // Jalankan BGM Player
      this.bgmPlayer = new BGMPlayer(this.audioCtx, this.bgmGainNode);
      this.bgmPlayer.start();
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.bgmPlayer && !this.bgmPlayer.isPlaying) {
      this.bgmPlayer.start();
    }
  }

  initVoice() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    this.indonesianVoice = voices.find(voice => voice.lang.includes('id') || voice.lang.includes('ID'));
    if (!this.indonesianVoice) {
      this.indonesianVoice = voices.find(voice => voice.lang.startsWith('id'));
    }
  }

  // Setelan Volume 3 Kanal
  setBgmVolume(val) {
    this.bgmVolume = parseFloat(val);
    localStorage.setItem("drako_vol_bgm", this.bgmVolume);
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.audioCtx.currentTime);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = parseFloat(val);
    localStorage.setItem("drako_vol_sfx", this.sfxVolume);
  }

  setNarratorVolume(val) {
    this.narratorVolume = parseFloat(val);
    localStorage.setItem("drako_vol_narrator", this.narratorVolume);
  }

  // ----------------------------------------------------
  // EFEK SUARA SFX SINTETIS (Web Audio API)
  // ----------------------------------------------------

  // Suara Klik Ringan (ketukan tombol)
  playClick() {
    this.initContext();
    if (!this.audioCtx || this.sfxVolume <= 0.01) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  }

  // Suara Gelembung Pop (saat kartu diletakkan)
  playPop() {
    this.initContext();
    if (!this.audioCtx || this.sfxVolume <= 0.01) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  // Suara Chime Ceria (saat jawaban benar)
  playCorrect() {
    this.initContext();
    if (!this.audioCtx || this.sfxVolume <= 0.01) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio C Major (C5, E5, G5, C6)

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.sfxVolume, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.06 + 0.25);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  // Suara Lembut Peringatan (salah, tidak keras)
  playIncorrect() {
    this.initContext();
    if (!this.audioCtx || this.sfxVolume <= 0.01) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.25);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start();
    osc.stop(now + 0.3);
  }

  // Suara Transisi Lembut (kertas dibalik)
  playPageFlip() {
    this.initContext();
    if (!this.audioCtx || this.sfxVolume <= 0.01) return;

    const bufferSize = this.audioCtx.sampleRate * 0.25;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, this.audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1600, this.audioCtx.currentTime + 0.25);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start();
    noise.stop(this.audioCtx.currentTime + 0.25);
  }

  // Suara Terompet Kemenangan (halaman Result)
  playVictoryCelebration() {
    this.initContext();
    if (!this.audioCtx || this.sfxVolume <= 0.01) return;

    const now = this.audioCtx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.25 }, // C6
      { f: 880.00, d: 0.12 },  // A5
      { f: 1046.50, d: 0.4 }   // C6
    ];

    let currentOffset = 0;
    notes.forEach((note) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + currentOffset);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.sfxVolume, now + currentOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.005, now + currentOffset + note.d);

      osc.start(now + currentOffset);
      osc.stop(now + currentOffset + note.d);

      currentOffset += note.d + 0.04;
    });
  }

  // ----------------------------------------------------
  // NARRATOR & HINT VERBAL (Web Speech API)
  // ----------------------------------------------------

  stopSpeaking() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  speak(text, onStartCallback = null, onEndCallback = null) {
    this.stopSpeaking();
    this.initContext();

    if (!this.speechSynth || this.narratorVolume <= 0.01) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Bersihkan penanda rumpang seperti ___(1)___ atau ___
    const cleanedText = text.replace(/___\(\d+\)___/g, "...").replace(/___/g, "...").trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.volume = this.narratorVolume;
    utterance.rate = 0.78;  // Lambat agar mudah ditangkap anak TK
    utterance.pitch = 1.35; // Nada tinggi (imut/kartun)

    if (this.indonesianVoice) {
      utterance.voice = this.indonesianVoice;
      utterance.lang = this.indonesianVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }

    if (onStartCallback) utterance.onstart = onStartCallback;
    utterance.onend = () => { if (onEndCallback) onEndCallback(); };
    utterance.onerror = () => { if (onEndCallback) onEndCallback(); };

    this.currentNarratorUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  speakNarration(text, onStart, onEnd) {
    this.speak(text, onStart, onEnd);
  }

  speakWord(word, onStart, onEnd) {
    this.speak(word, onStart, onEnd);
  }

  speakSyllable(syllable, onStart, onEnd) {
    this.speak(syllable, onStart, onEnd);
  }

  speakRandomPraise(onStart, onEnd) {
    const praiseIndex = Math.floor(Math.random() * this.praises.length);
    this.speak(this.praises[praiseIndex], onStart, onEnd);
  }

  speakTryAgain(onStart, onEnd) {
    this.speak("Yuk, kita coba susun lagi! Kamu pasti bisa!", onStart, onEnd);
  }

  speakMascotGreeting(mascotName, onStart, onEnd) {
    this.speak(`Halo! Aku ${mascotName}. Mari kita baca cerita dan bermain bersama!`, onStart, onEnd);
  }
}

// Ekspos secara global
window.gameAudioInstance = new GameAudio();
