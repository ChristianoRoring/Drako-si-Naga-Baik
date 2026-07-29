// GameAudio - Sistem Pengelolaan Suara dan Narasi untuk Dongeng Interaktif "Drako si Naga Baik"
// Menyediakan BGM sintetis (Web Audio API), efek suara instan, & Narasi Bahasa Indonesia (Web Speech API)

class BGMPlayer {
  constructor(audioCtx, gainNode) {
    this.audioCtx = audioCtx;
    this.gainNode = gainNode;
    this.isPlaying = false;
    this.tempo = 168; // Tempo super cepat, energik, dan penuh semangat (Ultra Upbeat)
    this.currentStep = 0;
    this.timerId = null;

    // Melodi C Major super riang dan lincah (Super Mario / Arcade Adventure Style)
    this.melody = [
      "C5", "E5", "G5", "C6",  "E6", "D6", "C6", "G5",
      "A5", "C6", "G5", "E5",  "F5", "A5", "G5", "E5",
      "C5", "E5", "G5", "C6",  "E6", "D6", "C6", "A5",
      "F5", "A5", "G5", "E5",  "D5", "G5", "C6", ""
    ];

    this.bassline = [
      "C3", "C3", "G3", "G3",  "A3", "A3", "E3", "E3",
      "F3", "F3", "C3", "C3",  "G3", "G3", "G3", "G3",
      "C3", "C3", "E3", "E3",  "F3", "F3", "C3", "C3",
      "F3", "F3", "G3", "G3",  "G3", "G3", "C3", "C3"
    ];

    this.noteFreqs = {
      "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
      "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
      "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
      "C6": 1046.50, "D6": 1174.66, "E6": 1318.51
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

  playKick(now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playSnare(now) {
    // Component 1: Pitch sweep punch
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    osc.connect(oscGain);
    oscGain.connect(this.gainNode);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);
    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.06);

    // Component 2: Noise snare rattle
    const bufferSize = this.audioCtx.sampleRate * 0.06;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    noise.start(now);
  }

  playHiHat(now) {
    const bufferSize = this.audioCtx.sampleRate * 0.025;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.07, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    noise.start(now);
  }

  playNextNote() {
    if (!this.isPlaying) return;

    const now = this.audioCtx.currentTime;
    const note = this.melody[this.currentStep];
    const bassNote = this.bassline[this.currentStep];

    const noteFreq = this.noteFreqs[note];
    const bassFreq = this.noteFreqs[bassNote];

    if (this.gainNode && this.gainNode.gain.value > 0.005) {
      // 1. Melodi Utama (Bright Arcade Marimba)
      if (noteFreq) {
        const osc = this.audioCtx.createOscillator();
        const subOsc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.connect(noteGain);
        subOsc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.type = 'triangle'; // Lead marimba
        subOsc.type = 'square'; // Layer gemerlap 8-bit
        osc.frequency.setValueAtTime(noteFreq, now);
        subOsc.frequency.setValueAtTime(noteFreq * 2, now); // 1 oktav di atasnya

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.18, now + 0.008);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.22);
        subOsc.stop(now + 0.22);
      }

      // 2. Bassline Bouncy Staccato
      if (bassFreq) {
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();

        bassOsc.connect(bassGain);
        bassGain.connect(this.gainNode);

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.15, now + 0.008);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        bassOsc.start(now);
        bassOsc.stop(now + 0.18);
      }

      // 3. Modul Drum Kit Sintetis (Kick, Snare & Hi-Hat Beat)
      // Kick drum di setiap beat utama (step 0, 4, 8, 12, 16, 20, 24, 28)
      if (this.currentStep % 4 === 0) {
        this.playKick(now);
      }
      // Snare drum tegas di backbeat (step 2, 6, 10, 14, 18, 22, 26, 30)
      if (this.currentStep % 4 === 2) {
        this.playSnare(now);
      }
      // Hi-Hat garing lincah di setiap ketukan 8th note
      this.playHiHat(now);
    }

    this.currentStep = (this.currentStep + 1) % this.melody.length;
    const stepDuration = (60 / this.tempo) * 1000;
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
    
    // Kecepatan narator dibuat lebih lincah dan bersemangat (1.05x)
    const savedSpeed = parseFloat(localStorage.getItem("drako_speed_narrator"));
    this.narratorSpeed = (savedSpeed && !isNaN(savedSpeed) && savedSpeed >= 1.0) ? savedSpeed : 1.05;

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
    
    // Cari suara Bahasa Indonesia berdasarkan kode bahasa atau nama suara
    this.indonesianVoice = voices.find(voice => {
      const lang = voice.lang.toLowerCase();
      const name = voice.name.toLowerCase();
      return lang === "id" || 
             lang === "id-id" || 
             lang.startsWith("id-") || 
             lang.startsWith("id_") ||
             name.includes("indonesia") || 
             name.includes("indonesian");
    });

    if (this.indonesianVoice) {
      console.log("Suara Bahasa Indonesia Aktif:", this.indonesianVoice.name, "[" + this.indonesianVoice.lang + "]");
    } else {
      console.warn("Suara Bahasa Indonesia asli tidak ditemukan. Menggunakan fallback transliterasi.");
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

  setNarratorSpeed(val) {
    this.narratorSpeed = parseFloat(val);
    localStorage.setItem("drako_speed_narrator", this.narratorSpeed);
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

  speak(text, onStartCallback = null, onEndCallback = null, isPhonetic = false) {
    this.stopSpeaking();
    this.initContext();

    if (!this.speechSynth || this.narratorVolume <= 0.01) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Selalu coba deteksi/segarkan suara Bahasa Indonesia sebelum berbicara
    this.initVoice();

    // Bersihkan penanda rumpang seperti ___(1)___ atau ___
    let cleanedText = text.replace(/___\(\d+\)___/g, "...").replace(/___/g, "...").trim();

    // Jalankan aturan transliterasi hanya jika teks bukan string fonetik siap-pakai
    if (!isPhonetic) {
      // Koreksi fonetik universal agar dibaca dengan logat Indonesia murni pada mesin suara default (terutama jika fallback ke English)
      // 1. Ubah huruf 'c' yang tidak diikuti 'h' menjadi 'ch' agar dibaca 'c' Indonesia (bukan 'k' atau 's' Inggris)
      cleanedText = cleanedText.replace(/c(?!h)/gi, (match) => match === 'C' ? 'Ch' : 'ch');
      // 2. Ubah 'sy' menjadi 'sh' agar dibaca 'sy' tebal Indonesia (bukan 's-y' Inggris)
      cleanedText = cleanedText.replace(/sy/gi, (match) => match === 'SY' ? 'SH' : (match === 'Sy' ? 'Sh' : 'sh'));

      if (!this.indonesianVoice) {
        // Transliterasi dinamis jika terpaksa menggunakan mesin suara luar (seperti English fallback)
        // a. Ubah diftong 'au' menjadi 'ow' agar dibaca 'au' (hijau -> heejow -> hi-jow)
        cleanedText = cleanedText.replace(/au/gi, 'ow');
        // b. Ubah diftong 'ai' menjadi 'ahy' agar dibaca 'ai/ei' (tupai -> toopahy -> too-pie)
        cleanedText = cleanedText.replace(/ai/gi, 'ahy');
        // c. Ubah 'a' diikuti konsonan menjadi 'aa' agar dibaca 'ah' (bukan 'ei' Inggris)
        cleanedText = cleanedText.replace(/([b-df-hj-np-tv-z])a([b-df-hj-np-tv-z]|$)/gi, '$1aa$2');
        // d. Ubah 'o' menjadi 'oh' agar tidak dibaca 'ou' atau 'u' Inggris
        cleanedText = cleanedText.replace(/o([b-df-hj-np-tv-z]|$)/gi, 'oh$1');
        // e. Ubah 'e' di suku kata pendek menjadi 'eh' agar tidak dibaca 'i' Inggris
        cleanedText = cleanedText.replace(/e([b-df-hj-np-tv-z]|$)/gi, 'eh$1');
        // f. Ubah 'i' di suku kata pendek menjadi 'ee' agar tidak dibaca 'ai' Inggris
        cleanedText = cleanedText.replace(/i([b-df-hj-np-tv-z]|$)/gi, 'ee$1');
        // g. Ubah 'u' di suku kata pendek menjadi 'uu' agar tidak dibaca 'yu' Inggris
        cleanedText = cleanedText.replace(/u([b-df-hj-np-tv-z]|$)/gi, 'uu$1');
        
        // Koreksi kata khusus Drako -> Drahko (mencegah 'Dreyko' Inggris)
        cleanedText = cleanedText.replace(/drako/gi, "drahko");
        // Koreksi kata khusus puyuh -> puyooh (mencegah 'pu-ye-u' Inggris)
        cleanedText = cleanedText.replace(/puyuh/gi, "puyooh");
      }
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.volume = this.narratorVolume;
    utterance.rate = this.narratorSpeed;  // Kecepatan membaca dinamis sesuai pengaturan slider
    utterance.pitch = 1.05; // Diturunkan ke 1.05 agar suara terdengar ekspresif, hangat, ramah anak, dan tidak robotik/cempreng

    if (this.indonesianVoice) {
      utterance.voice = this.indonesianVoice;
      utterance.lang = this.indonesianVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }

    let callbackCalled = false;
    const triggerEnd = () => {
      if (!callbackCalled) {
        callbackCalled = true;
        if (onEndCallback) onEndCallback();
      }
    };

    if (onStartCallback) {
      let startCalled = false;
      utterance.onstart = () => {
        if (!startCalled) {
          startCalled = true;
          onStartCallback();
        }
      };
    }
    utterance.onend = triggerEnd;
    utterance.onerror = triggerEnd;

    this.currentNarratorUtterance = utterance;
    console.log("TTS Speaking [isPhonetic=" + isPhonetic + "]:", cleanedText);
    this.speechSynth.speak(utterance);
  }

  speakNarration(text, onStart, onEnd) {
    this.speak(text, onStart, onEnd);
  }

  speakWord(word, onStart, onEnd) {
    this.speak(word, onStart, onEnd);
  }

  speakSyllable(syllable, onStart, onEnd) {
    let phonetic = "";
    if (this.indonesianVoice) {
      // Walau menggunakan suara Indonesia asli, beberapa suku kata pendek (seperti 'hi', 'he')
      // sering terdeteksi oleh kamus internal TTS sebagai kata bahasa Inggris (Hi = Hai, he = hi).
      // Kita tambahkan 'h' lembut di belakang agar dibaca sesuai ejaan asli Indonesia.
      const s = syllable.toLowerCase().trim();
      const idSyllableMap = {
        // Benturan vokal 'i' (dibaca 'ai' jika mentah)
        "hi": "hih",
        
        // Benturan vokal 'e' (dibaca 'i' atau 'ei' jika mentah)
        "he": "heh",
        "me": "meh",
        "we": "weh",
        "be": "beh",
        "ke": "keh",
        "se": "seh",
        "pe": "peh",
        "te": "teh",
        
        // Benturan vokal 'o' (dibaca 'u' atau 'ou' jika mentah)
        "do": "doh",
        "go": "goh",
        "so": "soh",
        "to": "toh",
        "no": "noh",
        "ko": "koh",
        
        // Benturan pelafalan yuh (dibaca 'ye-u' di beberapa TTS Android)
        "yuh": "iuh",
        "yu": "yuh",
        
        // Benturan lainnya
        "by": "bi"
      };
      phonetic = idSyllableMap[s] || syllable;
    } else {
      phonetic = this.getPhoneticSyllable(syllable);
    }
    this.speak(phonetic, onStart, onEnd, true); // Set isPhonetic = true agar bypass penggantian regex global
  }

  getPhoneticSyllable(syllable) {
    let s = syllable.toLowerCase().trim();
    
    // Ganti 'c' yang tidak diikuti 'h' dengan 'ch' agar dibaca 'ch' (seperti "cha" / "ca")
    s = s.replace(/c(?!h)/g, "ch");
    
    // Ganti 'sy' dengan 'sh'
    s = s.replace(/sy/g, "sh");
    
    // Map suku kata dengan akhiran 'e' agar dibaca e-pepet/e-taling Indonesia (bukan 'i' Inggris)
    if (s.endsWith("e") && s.length <= 3) {
      return s + "h"; // be -> beh, che -> cheh, ke -> keh, se -> seh, dll
    }

    // Map suku kata dengan akhiran 'i' menjadi 'ee' agar dibaca 'i' (bukan 'ai' Inggris)
    if (s.endsWith("i") && s.length <= 3) {
      return s.slice(0, -1) + "ee"; // hi -> hee, bi -> bee, chi -> chee, dll
    }

    // Map suku kata dengan akhiran 'a' menjadi 'ah' agar dibaca 'a' (bukan 'ei' Inggris)
    if (s.endsWith("a") && s.length <= 3) {
      return s + "h"; // na -> nah, ga -> gah, cha -> chah (mencegah 'naa' dibaca terputus 'na'a')
    }

    // Map suku kata dengan akhiran 'u' menjadi 'oo' agar dibaca 'u' (bukan 'yu' Inggris)
    if (s.endsWith("u") && s.length <= 3) {
      return s.slice(0, -1) + "oo"; // tu -> too, bu -> boo, chu -> choo, dll
    }

    // Map suku kata dengan akhiran 'uh' menjadi 'ooh' agar dibaca 'uh' (yuh -> yooh, puh -> pooh)
    if (s.endsWith("uh") && s.length <= 4) {
      return s.slice(0, -2) + "ooh"; // yuh -> yooh, puh -> pooh, ruh -> rooh
    }

    // Map suku kata dengan akhiran 'o' agar dibaca 'o' (bukan 'u' atau 'ou' Inggris)
    if (s.endsWith("o") && s.length <= 3) {
      return s.slice(0, -1) + "oh"; // to -> toh, do -> doh, go -> goh, ko -> koh, dll
    }

    const customMap = {
      "me": "meh",
      "he": "heh",
      "hi": "hee",
      "be": "beh",
      "we": "weh",
      "by": "bee"
    };

    return customMap[s] || s;
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
