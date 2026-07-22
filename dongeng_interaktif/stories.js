// Database Cerita Dongeng Interaktif - Drako si Naga Baik
// Memfasilitasi pembelajaran pengenalan suku kata untuk anak TK (4-6 tahun)
// Dilengkapi kandidat kata rumpang dinamis (candidateBlanks) dari dalam teks cerita asli
// agar kata yang dihilangkan menjadi soal rumpang selalu diacak berbeda di setiap sesi permainan.

window.STORIES_DATA = [
  {
    id: "drako_naga_baik",
    title: "Drako si Naga Baik",
    description: "Kisah Drako, naga hijau kecil yang baik hati dan suka menolong teman-teman di hutan.",
    icon: "🐉",
    difficulty: "Mudah",
    color: "#e8f5e9",
    pages: [
      {
        pageNumber: 1,
        background: "linear-gradient(to bottom, #e8f5e9, #ffffff)",
        text: "Di sebuah hutan yang indah, hiduplah seekor naga kecil bernama Drako. Ia memiliki sisik berwarna hijau terang yang bersih dan sepasang mata bulat yang besar. Drako adalah naga yang sangat baik hati dan suka tersenyum.",
        illustration: "drako_scene1",
        candidateBlanks: [
          { word: "HUTAN", syllables: ["hu", "tan"], hintText: "Hutan tempat tinggal Drako", hintIcon: "🌲", hintColor: "#81c784" },
          { word: "NAGA", syllables: ["na", "ga"], hintText: "Naga hijau bersayap", hintIcon: "🐉", hintColor: "#81c784" },
          { word: "SISIK", syllables: ["si", "sik"], hintText: "Sisik naga berkilau", hintIcon: "🛡️", hintColor: "#a3e2f5" },
          { word: "HIJAU", syllables: ["hi", "jau"], hintText: "Warna hijau terang", hintIcon: "🟢", hintColor: "#81c784" },
          { word: "MATA", syllables: ["ma", "ta"], hintText: "Mata bulat besar", hintIcon: "👀", hintColor: "#ffd54f" },
          { word: "TERSENYUM", syllables: ["ter", "se", "nyum"], hintText: "Drako tersenyum ramah", hintIcon: "😊", hintColor: "#ffd54f" }
        ]
      },
      {
        pageNumber: 2,
        background: "linear-gradient(to bottom, #fffde7, #ffffff)",
        text: "Para hewan takut kepada Drako hanya karena ia seekor naga, padahal ia naga yang sangat baik. Saat Drako ingin menyapa kelinci di padang rumput, ia malah ketakutan dan masuk ke lubang. Ketika Drako berteduh, burung langsung terbang pergi karena cemas. Bahkan tupai di pohon menjatuhkan buah kenari lalu bersembunyi.",
        illustration: "drako_scene2",
        candidateBlanks: [
          { word: "TAKUT", syllables: ["ta", "kut"], hintText: "Ketakutan atau cemas", hintIcon: "😰", hintColor: "#b0bec5" },
          { word: "KELINCI", syllables: ["ke", "lin", "ci"], hintText: "Kelinci yang melompat", hintIcon: "🐇", hintColor: "#ff8a80" },
          { word: "RUMPUT", syllables: ["rum", "put"], hintText: "Padang rumput hijau", hintIcon: "🌱", hintColor: "#a5d6a7" },
          { word: "BURUNG", syllables: ["bu", "rung"], hintText: "Burung terbang tinggi", hintIcon: "🐦", hintColor: "#80d8ff" },
          { word: "TUPAI", syllables: ["tu", "pai"], hintText: "Tupai di atas pohon", hintIcon: "🐿️", hintColor: "#bcaaa4" },
          { word: "POHON", syllables: ["po", "hon"], hintText: "Pohon tinggi di hutan", hintIcon: "🌳", hintColor: "#81c784" }
        ]
      },
      {
        pageNumber: 3,
        background: "linear-gradient(to bottom, #eceff1, #ffffff)",
        text: "Di suatu hari, angin puyuh yang sangat kencang bertiup dan mengobrak-abrik tempat bermain para hewan. Seekor anak kelinci menangis karena balon merah kesayangannya tersangkut di dahan pohon. Sekelompok anak bebek terjebak di seberang jembatan kayu.",
        illustration: "drako_scene3",
        candidateBlanks: [
          { word: "PUYUH", syllables: ["pu", "yuh"], hintText: "Angin puyuh bertiup kencang", hintIcon: "🌪️", hintColor: "#cfd8dc" },
          { word: "KENCANG", syllables: ["ken", "cang"], hintText: "Angin bertiup kencang", hintIcon: "💨", hintColor: "#cfd8dc" },
          { word: "BALON", syllables: ["ba", "lon"], hintText: "Balon merah kesayangan", hintIcon: "🎈", hintColor: "#ff8a80" },
          { word: "DAHAN", syllables: ["da", "han"], hintText: "Dahan pohon tinggi", hintIcon: "🌿", hintColor: "#81c784" },
          { word: "BEBEK", syllables: ["be", "bek"], hintText: "Bebek kuning kecil", hintIcon: "🦆", hintColor: "#ffd54f" },
          { word: "JEMBATAN", syllables: ["jem", "ba", "tan"], hintText: "Jembatan kayu di sungai", hintIcon: "🌉", hintColor: "#90caf9" }
        ]
      },
      {
        pageNumber: 4,
        background: "linear-gradient(to bottom, #e1f5fe, #ffffff)",
        text: "Drako mengepakkan sayap kecilnya dan terbang ke dahan pohon. Dengan ujung cakar yang lembut, ia mengambil tali balon tanpa meletuskannya, lalu mendorong sarang burung pipit kembali ke posisi yang aman.",
        illustration: "drako_scene4",
        candidateBlanks: [
          { word: "SAYAP", syllables: ["sa", "yap"], hintText: "Sayap naga hijau", hintIcon: "🪽", hintColor: "#a3e2f5" },
          { word: "TERBANG", syllables: ["ter", "bang"], hintText: "Terbang tinggi ke pohon", hintIcon: "🕊️", hintColor: "#80d8ff" },
          { word: "CAKAR", syllables: ["ca", "kar"], hintText: "Cakar naga lembut", hintIcon: "🐾", hintColor: "#bcaaa4" },
          { word: "SARANG", syllables: ["sa", "rang"], hintText: "Sarang burung pipit", hintIcon: "🪺", hintColor: "#ffe082" },
          { word: "PIPIT", syllables: ["pi", "pit"], hintText: "Burung pipit kecil", hintIcon: "🐤", hintColor: "#80d8ff" },
          { word: "AMAN", syllables: ["a", "man"], hintText: "Kembali ke tempat aman", hintIcon: "✅", hintColor: "#a5d6a7" }
        ]
      },
      {
        pageNumber: 5,
        background: "linear-gradient(to bottom, #e8f5e9, #ffffff)",
        text: "Drako mengembalikan balon kepada si anak kelinci yang langsung berhenti menangis. Drako lalu bergegas ke jembatan kayu. Ia mendorong batang pohon tumbang dengan sekali dorongan hingga jembatan kembali bersih. Anak-anak bebek pun bisa seberang dengan aman.",
        illustration: "drako_scene5",
        candidateBlanks: [
          { word: "KELINCI", syllables: ["ke", "lin", "ci"], hintText: "Anak kelinci senang", hintIcon: "🐇", hintColor: "#ff8a80" },
          { word: "BERGEGAS", syllables: ["ber", "ge", "gas"], hintText: "Bergegas cepat menolong", hintIcon: "🏃", hintColor: "#ffd54f" },
          { word: "JEMBATAN", syllables: ["jem", "ba", "tan"], hintText: "Jembatan kayu sungai", hintIcon: "🌉", hintColor: "#90caf9" },
          { word: "BATANG", syllables: ["ba", "tang"], hintText: "Batang pohon tumbang", hintIcon: "🪵", hintColor: "#bcaaa4" },
          { word: "BERSIH", syllables: ["ber", "sih"], hintText: "Jembatan kembali bersih", hintIcon: "✨", hintColor: "#fff176" },
          { word: "SEBERANG", syllables: ["se", "be", "rang"], hintText: "Menyeberang jembatan", hintIcon: "🚶", hintColor: "#a5d6a7" }
        ]
      },
      {
        pageNumber: 6,
        background: "linear-gradient(to bottom, #f3e5f5, #ffffff)",
        text: "Sejak hari itu, tidak ada lagi hewan yang takut kepada Drako. Hutan menjadi sangat ramai karena hewan-hewan kini selalu berkumpul untuk bermain petak umpet bersama, berbagi buah, dan bergantian naik di atas punggung Drako yang kuat.",
        illustration: "drako_scene6",
        candidateBlanks: [
          { word: "HEWAN", syllables: ["he", "wan"], hintText: "Hewan-hewan di hutan", hintIcon: "🦊", hintColor: "#ffb74d" },
          { word: "TAKUT", syllables: ["ta", "kut"], hintText: "Ketakutan atau gemetar", hintIcon: "😰", hintColor: "#b0bec5" },
          { word: "RAMAI", syllables: ["ra", "mai"], hintText: "Hutan menjadi ramai", hintIcon: "🎉", hintColor: "#ffd54f" },
          { word: "UMPET", syllables: ["um", "pet"], hintText: "Bermain petak umpet", hintIcon: "🫣", hintColor: "#e1bee7" },
          { word: "BUAH", syllables: ["bu", "ah"], hintText: "Berbagi buah-buahan", hintIcon: "🍎", hintColor: "#ff8a80" },
          { word: "PUNGGUNG", syllables: ["pung", "gung"], hintText: "Punggung naga kuat", hintIcon: "🦖", hintColor: "#c8e6c9" }
        ]
      }
    ]
  }
];
