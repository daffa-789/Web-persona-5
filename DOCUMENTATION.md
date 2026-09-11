# 📁 DOCUMENTATION — Persona 5 Royal Web Portfolio

> **Proyek**: Portfolio Interaktif bertema Persona 5 Royal  
> **Persona**: DAFFA · Codename: **JOKER** · Lead Game Systems Engineer & Architecture  
> **Stack**: Vite + Vanilla TypeScript · 100% Dynamic DOM Rendering via TS · Tanpa framework UI  
> **Versi**: 2.0.0 (Royal Slash Systems Edition)

---

## 🎯 Gambaran Umum / Project Overview

Website ini adalah **portfolio game developer kelas AAA** yang dirancang dengan estetika autentik **Persona 5 Royal** dari Atlus. Seluruh elemen visual, sistem audio dua tingkat (local audio + procedural Web Audio API synthesizer), transisi *comic slash wipe*, dan navigasi keyboard/mouse dibangun dengan standar arsitektur game profesional.

Seluruh tampilan HTML dibangun **100% secara dinamis menggunakan TypeScript** (`src/renderer.ts`), sehingga file `index.html` hanya bertindak sebagai wadah mounting root minimal (`<div id="app"></div>`). Tidak ada konten HTML statis yang di-hardcode di `index.html`.

Portfolio ini mencakup:
- **DOSSIER** (`#tab-profile`): Dokumen intelijen operasi Phantom Thieves, bio, status vital bars (HP/SP), radar stat 5-axis.
- **SKILLS** (`#tab-skills`): Radar parameter combat RPG, tabel 10 elemental affinity game engine, dan skill category badges.
- **HEISTS** (`#tab-projects`): Portofolio proyek AAA/indie engine sebagai operasi Palace, lengkap dengan Palace Infiltration Blueprint Modal.
- **CONFIDANTS** (`#tab-experience`): Pengalaman kerja & rekam jejak industri bergaya kartu tarot Confidant (Rank 1 s.d. MAX).
- **CALLING CARD** (`#tab-contact`): Form dispatch surat ancaman teatrikal Phantom Thieves, kartu Confidant social links yang aman dari broken links, dan All-Out Attack cinematic finish.
- **6 SISTEM SLASH & COMMAND PALETTE**: Sistem evaluasi teknis, penjadwalan interview, benchmark fisika, dan codex arsitektur.

---

## 🗂️ Struktur Proyek / Project Structure

```
Web persona 5/
├── 📄 index.html              ← Root mounting minimal (<div id="app"></div>) — 100% dinamis via TS
├── 📄 package.json            ← Dependensi & npm scripts
├── 📄 tsconfig.json           ← Konfigurasi TypeScript (strict mode)
├── 📄 vite.config.ts          ← Konfigurasi Vite bundler
├── 📄 AGENTS.md               ← Design invariants & workspace guidelines (P5R guidelines)
├── 📄 DOCUMENTATION.md        ← Dokumentasi lengkap arsitektur dan sistem
│
├── 📁 src/                    ← Source code TypeScript
│   ├── 📄 main.ts             ← App bootstrap, inisialisasi semua sub-sistem & entrance
│   ├── 📄 renderer.ts         ← 100% Dynamic DOM Renderer (App Shell, Modals, Sections, Cards)
│   │
│   ├── 📁 audio/
│   │   └── 📄 p5rAudio.ts     ← Audio engine dua tingkat: file lokal .mp3 + procedural Web Audio synth
│   │
│   ├── 📁 config/
│   │   └── 📄 portfolio.ts    ← ⭐ Sumber data utama portfolio (edit data profil, heists, skills di sini)
│   │
│   ├── 📁 styles/
│   │   └── 📄 p5r-style.css   ← Design system CSS lengkap (Bebas Neue, Anton, Dela Gothic One, animations)
│   │
│   ├── 📁 transitions/
│   │   └── 📄 transitions.ts  ← Comic slash wipe, 60ms blackout shutter, staggered reveal
│   │
│   └── 📁 ui/
│       ├── 📄 navigation.ts           ← Navigasi central: ribbon, keyboard shortcut, back button, routing
│       ├── 📄 header.ts               ← Header HUD: BGM, Mute, Volume, Alert Level, Calendar
│       ├── 📄 entrance.ts             ← Cinematic entrance sequence saat website pertama kali dimuat
│       ├── 📄 monaNavigator.ts        ← Morgana companion (field advisor di kiri bawah)
│       ├── 📄 commandPalette.ts       ← Metaverse Command Palette ([/], Ctrl+K)
│       ├── 📄 scheduleModal.ts        ← [S] /schedule — Palace Heist & Interview Scheduler
│       ├── 📄 browserSandboxModal.ts  ← [B] /browser — 120 FPS Particle Physics Benchmark
│       ├── 📄 grillMeModal.ts         ← [G] /grill-me — Velvet Room Technical Interrogation
│       ├── 📄 teamworkModal.ts        ← [T] /teamwork-preview — Studio Collaboration & Agile Pipelines
│       ├── 📄 learnCodexModal.ts      ← [L] //learn — Phantom Thieves Knowledge Codex
│       ├── 📄 boostMode.ts            ← [O] /boost — Palace Overclock 120 FPS Turbo Mode
│       ├── 📄 adviceModal.ts          ← ⭐ /advice & /sarannya — Strategic Career Advice for Daffa
│       ├── 📄 heistModal.ts           ← Modal Blueprint Proyek (detail arsitektur game)
│       ├── 📄 helpModal.ts            ← Modal Field Manual (panduan keyboard & kontrol)
│       ├── 📄 heists.ts               ← Komponen logic section HEISTS
│       ├── 📄 skills.ts               ← Komponen logic section SKILLS
│       ├── 📄 confidants.ts           ← Komponen logic section CONFIDANTS
│       ├── 📄 dossier.ts              ← Komponen logic section DOSSIER
│       ├── 📄 callingCard.ts          ← Animasi Calling Card & form submit
│       ├── 📄 allOutAttack.ts         ← Trigger finisher All-Out Attack
│       └── 📄 allOutAttackModal.ts    ← Modal All-Out Attack dengan animasi per karakter
│
├── 📁 public/                 ← Aset statis browser
│   ├── 📁 audio/
│   │   ├── 🎵 last_surprise.mp3          ← BGM utama looping ("Last Surprise")
│   │   └── 📁 sfx/                       ← Sound Effects lokal (.mp3)
│   │       ├── 🔊 aoa_finish.mp3         ← Suara finisher All-Out Attack
│   │       ├── 🔊 aoa_start.mp3          ← Suara shatter All-Out Attack
│   │       ├── 🔊 gun_cock.mp3           ← Suara kokang pistol (hover entrance)
│   │       ├── 🔊 menu_back.mp3          ← Suara cancel / ESC / Backspace
│   │       ├── 🔊 menu_navigate.mp3      ← Suara navigasi ribbon / transisi tab
│   │       ├── 🔊 menu_open.mp3          ← Suara buka menu / modal
│   │       └── 🔊 menu_select.mp3        ← Suara konfirmasi / pilih item
│   │
│   └── 📁 images/
│       └── 📁 p5r/
│           ├── 🖼️ joker_render.png         ← Karakter Joker render transparan
│           └── 🖼️ phantom_thieves_logo.png   ← Logo resmi Phantom Thieves
│
├── 📁 scripts/                ← Skrip otomatisasi & pengujian CDP Headless Chrome
│   ├── 📄 test-slash-systems.mjs    ← E2E test untuk seluruh 6 slash systems & Command Palette
│   ├── 📄 test-browser.mjs          ← E2E test navigasi ribbon, keyboard, dan back button
│   ├── 📄 test-audio-isolation.mjs  ← E2E test channel separation audio & format check
│   ├── 📄 test-new-systems.mjs      ← E2E test Morgana advisor, Help modal, dan Heist modal
│   ├── 📄 test-callingcard.mjs      ← E2E test pengiriman Calling Card & animasi AOA
│   └── 📄 test-responsive.mjs       ← E2E test layout pada resolusi Mobile, Tablet, dan Desktop
│
└── 📁 dist/                   ← Hasil build Vite untuk deployment produksi
```

---

## ⚡ Arsitektur 100% TypeScript DOM Rendering (`index.html` Minimalis)

Sesuai dengan instruksi user, `index.html` tidak memuat markup konten hardcoded:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>DAFFA // Persona 5 Royal — Lead Game Systems Engineer & Architecture Portfolio</title>
  <!-- Fonts & Master Stylesheet -->
  <link rel="stylesheet" href="/src/styles/p5r-style.css" />
</head>
<body class="bg-black text-white antialiased overflow-x-hidden">
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Fungsi `renderAppShell()` pada [`src/renderer.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/renderer.ts) bertugas menginjeksi seluruh tree DOM secara programatik:
1. **Background & Overlay Layers**: Comic halftone dots, hazard tape barcode, screen blackout shutter.
2. **Top Header HUD**: Brand title, calendar date & weather widget, security alert meter, volume slider, BGM toggle, mute button, Command Palette quick-launcher, and quick action chips.
3. **Slanted Command Ribbon**: 5 tombol menu utama bergaya ribbon bersudut miring (`skewX(-12deg) rotate(-8deg)`).
4. **All 5 Core Content Sections**: DOSSIER, SKILLS, HEISTS, CONFIDANTS, dan CALLING CARD.
5. **Back Button & Controller HUD**: Tombol Persona Back (`#p5-back-btn`) dan Controller HUD bar (`#p5-controller-hud`).
6. **All Modal Overlays**: All-Out Attack, Field Manual, Palace Heist Blueprint, Schedule, Browser Sandbox, Technical Interrogation, Teamwork Preview, Knowledge Codex, dan Metaverse Command Palette.

---

## 🛠️ Sistem Slash Baru & Fitur Interaktif

Aplikasi dilengkapi dengan 6 sistem slash interaktif yang dapat diakses melalui URL hash (e.g. `/#schedule`), keyboard shortcut, tombol HUD, maupun Metaverse Command Palette:

| Command | Shortcut | Modul | Deskripsi & Fungsionalitas |
|---------|----------|-------|-----------------------------|
| `/` or `Ctrl+K` | `/` | [`commandPalette.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/commandPalette.ts) | **Metaverse Command Palette**: Pencarian cepat, akses instan ke seluruh tab, modal, audio toggle, dan slash actions dengan navigasi keyboard panah atas/bawah dan Enter. |
| `/schedule` | `[S]` | [`scheduleModal.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/scheduleModal.ts) | **Palace Heist & Interview Scheduler**: Sistem penjadwalan interview / technical briefing dengan pemilihan tanggal kalender Metaverse, slot waktu, target objektif studio, dan konfirmasi stempel autentik. |
| `/browser` | `[B]` | [`browserSandboxModal.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/browserSandboxModal.ts) | **In-Browser 120 FPS Physics Engine Benchmark**: Simulasi canvas interaktif partikel kinetik dengan toggle gravitasi, spawn ledakan partikel pada klik, deteksi tabrakan batas layar, dan meter FPS real-time. |
| `/grill-me` | `[G]` | [`grillMeModal.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/grillMeModal.ts) | **Velvet Room Technical Interrogation Challenge**: Uji kompetensi arsitektur game engineer (ECS vs OOP, multi-threading job systems, cache locality & DOD, shader rendering pipelines) dengan tab interaktif dan rating kesulitan. |
| `/teamwork-preview` | `[T]` | [`teamworkModal.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/teamworkModal.ts) | **Studio Teamwork & Agile Cooperation**: Cetak biru kolaborasi lintas disiplin studio (Art Pipeline, Game Designers, Technical Audio, QA/Automation, Lead Engineering) dan standar Git workflow. |
| `//learn` | `[L]` | [`learnCodexModal.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/learnCodexModal.ts) | **Phantom Thieves Knowledge Codex**: Panduan teknis mendalam mengenai arsitektur game engine C++, data-oriented design, lock-free ring buffers, dan render graph optimization. |
| `/boost` | `[O]` | [`boostMode.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/ui/boostMode.ts) | **Palace Overclock 120 FPS Turbo Mode**: Mode overclocking ekstrem dengan garis kecepatan komik (radial speed-lines), alert security spike ke 99%, dan parameter tempur karakter di-overdrive hingga 120%. |

---

## 🔒 Penanganan Social Links Kosong (Confidant Locked Architecture)

User belum menghubungkan akun publik untuk beberapa platform (seperti Itch.io, LinkedIn, Steam, ArtStation). Sistem mengimplementasikan pola **Confidant Frequency Offline Resilience**:

1. **State Konfigurasi**: Pada [`src/config/portfolio.ts`](file:///c:/Users/Daffa/Desktop/Web%20persona%205/src/config/portfolio.ts), seluruh URL media sosial disetel kosong (`url: ""`).
2. **Locked Visual Feedback**: Kartu Confidant dirender dengan kelas `.slink-card-locked`, menampilkan ikon gembok `🔒 PENDING // OFFLINE` serta styling grayscale semi-transparan dengan aksen border abu-abu baja.
3. **Flip Card Back Face**: Ketika di-hover atau diflip, sisi belakang menampilkan status `FREQUENCY OFFLINE 🔒`.
4. **Prevent Broken Links**: Mengklik kartu yang terkunci tidak akan memicu navigasi ke URL 404. Sebagai gantinya, sistem:
   - Memutar suara cancel autentik Persona 5 (`menu_back.mp3`).
   - Memunculkan **P5 In-Universe Toast Notification** di tengah layar:
     > `CONFIDANT FREQUENCY OFFLINE`  
     > *Joker has not yet linked a public [Platform] account. Dispatch a Calling Card below or schedule a briefing!*
   - Morgana memberikan komentar pendukung di pojok kiri bawah.

---

## ⌨️ Navigasi & Hirarki Pembatalan (`goBack()`)

Portfolio mendukung kendali ganda: Mouse dan full Keyboard dengan proteksi form input (mengetik di input/textarea tidak akan memicu shortcut menu).

### Daftar Lengkap Keyboard Shortcuts

| Tombol | Fungsi |
|--------|--------|
| `← / A` | Pindah ke Tab sebelumnya |
| `→ / D` | Pindah ke Tab berikutnya |
| `↑ / W` | Pindah ke Tab sebelumnya (alias) |
| `↓ / S` | Pindah ke Tab berikutnya (alias) |
| `1` | Buka tab DOSSIER |
| `2` | Buka tab SKILLS |
| `3` | Buka tab HEISTS |
| `4` | Buka tab CONFIDANTS |
| `5` | Buka tab CALLING CARD |
| `/` or `Ctrl+K` | Buka Metaverse Command Palette |
| `S` | Buka Palace Heist Scheduler (`/schedule`) |
| `B` | Buka In-Browser Physics Engine Benchmark (`/browser`) |
| `G` | Buka Technical Due Diligence Challenge (`/grill-me`) |
| `T` | Buka Studio Teamwork Preview (`/teamwork-preview`) |
| `L` | Buka Phantom Thieves Knowledge Codex (`//learn`) |
| `O` | Toggle Palace Overclock 120 FPS Boost Mode (`/boost`) |
| `?` | Buka Field Manual (Panduan Kontrol) |
| `ESC / Backspace` | Menjalankan hirarki `goBack()` untuk menutup modal aktif atau mundur ke tab sebelumnya |

### Hirarki Dismissal `goBack()`
Ketika `ESC`, `Backspace`, atau tombol Back (`#p5-back-btn`) ditekan, sistem mengevaluasi hierarki secara berurutan:
1. Menutup **Metaverse Command Palette** (jika aktif)
2. Menutup modal **All-Out Attack** (jika aktif)
3. Menutup modal **Palace Heist Scheduler** (jika aktif)
4. Menutup modal **Browser Physics Benchmark** (jika aktif)
5. Menutup modal **Studio Teamwork Preview** (jika aktif)
6. Menutup modal **Knowledge Codex** (jika aktif)
7. Menutup modal **Technical Interrogation** (jika aktif)
8. Menutup modal **Palace Heist Blueprint** (jika aktif)
9. Menutup modal **Field Manual** (jika aktif)
10. Jika seluruh modal tertutup: kembali ke tab sebelumnya berdasarkan riwayat navigasi (`tabHistory`)
11. Fallback: kembali ke tab utama **DOSSIER**

---

## 🔊 Sistem Audio & Kanal Suara (Channel Separation)

Audio dirancang mengikuti aturan ketat `AGENTS.md`:
- **Hover Channel** (`playHoverChannel`):
  - Dibatasi dengan cooldown minimum 120ms (`navThrottleMs`).
  - Membatalkan suara hover sebelumnya agar sapuan mouse cepat tidak menimbulkan tabrakan audio.
  - Ditekan secara otomatis jika ada aksi utama yang sedang aktif dalam 200ms pertama serangan.
- **Action Channel** (`playActionChannel`):
  - Memotong suara aksi sebelumnya agar efek konfirmasi, tebasan, dan buka menu terdengar tajam dan bersih.
- **Procedural Synthesizer Fallback**:
  - Jika browser memblokir audio atau file media lokal tidak terunduh, Web Audio API procedural synthesizer menghasilkan nada acid-jazz funk synthesizer dan gelombang suara analog secara instan dengan zero-latency.

---

## 💡 Rekomendasi & Saran Pengembangan Selanjutnya untuk Daffa

Berikut adalah saran strategis dan teknis ("sarannya") untuk meningkatkan portfolio dan daya tarik profesional Daffa di mata studio game AAA maupun indie internasional:

### 1. Downloadable PDF "Calling Card CV" Generator
- **Konsep**: Tambahkan tombol di header atau section Dossier bertuliskan `DOWNLOAD CALLING CARD (CV)`.
- **Implementasi**: Gunakan pustaka ringan seperti `jspdf` atau `html2canvas` untuk menghasilkan resume 1-2 halaman yang diformat persis seperti surat Calling Card Phantom Thieves resmi (stempel merah wax seal, font stencil, layout clean untuk ATS friendly di halaman 2).
- **Keunggulan**: Memberi kesan yang sangat mendalam kepada recruiter studio game saat mereka ingin mendiskusikan profil Daffa secara offline.

### 2. WebGL / WebGPU 3D Shader Background
- **Konsep**: Integrasikan background canvas 3D ringan menggunakan Three.js atau raw WebGL/WebGPU shader.
- **Implementasi**: Tampilkan poligon merah/hitam bergaya Persona 5 yang bereaksi dinamis terhadap kursor mouse atau audio beats dari lagu *Last Surprise*.
- **Keunggulan**: Memperlihatkan kemampuan Daffa sebagai Graphics / Engine Programmer secara langsung di browser tanpa membebani performa (target 60-120 FPS).

### 3. Audio Spectrum Visualizer pada Header HUD
- **Konsep**: Hubungkan `AudioContext.createAnalyser()` ke elemen visualizer equalizer spektrum audio di samping tombol BGM.
- **Implementasi**: Buat 16 bar equalizer vertikal merah/emas yang menari mengikuti ritme bassline acid-jazz Persona 5 secara real-time.

### 4. Interactive Architecture Graph Viewer untuk Proyek Heist
- **Konsep**: Di dalam Palace Infiltration Blueprint Modal (`heistModal.ts`), tambahkan visualisasi diagram alur arsitektur interaktif (node graph) yang menunjukkan hubungan antar modul engine game (e.g. `PhysicsSystem` -> `JobScheduler` -> `RenderPipeline`).
- **Keunggulan**: Membuktikan pemahaman arsitektur sistem tingkat tinggi kepada lead engineer yang melakukan interview.

### 5. Strategi Aktivasi Akun Media Sosial
- **Itch.io**: Unggah minimal 1 prototype game web/playable demo (bisa berupa build WebGL Unity/Godot kecil) agar status Confidant Itch.io dapat diaktifkan dari "LOCKED" menjadi "RANK 1".
- **LinkedIn**: Pasang headline bertarget: `Game Systems Architect & Engine Developer | C++, Unity, Unreal Engine`. Tautkan URL portfolio web ini di bagian Featured Section LinkedIn.
- **GitHub**: Buat repository publik dengan README bergaya markdown Persona 5 yang menyematkan link ke live portfolio ini.

---

## 🧪 Skrip Pengujian & Verifikasi Kualitas

Seluruh sistem diverifikasi menggunakan skrip otomatisasi CDP (Chrome DevTools Protocol):

```bash
# Menjalankan build produksi TypeScript
npm run build

# Menjalankan pengujian 10 sistem core (Goal, Schedule, Browser, Grill-Me, Teamwork, Learn, Boost, Palette, Socials, Advice)
node scripts/test-all-systems.mjs

# Menjalankan pengujian 6 sistem slash & Command Palette
node scripts/test-slash-systems.mjs

# Menjalankan pengujian navigasi ribbon, keyboard, dan back button
node scripts/test-browser.mjs

# Menjalankan pengujian channel separation audio & format
node scripts/test-audio-isolation.mjs

# Menjalankan pengujian modal blueprint, advisor Morgana, dan Field Manual
node scripts/test-new-systems.mjs

# Menjalankan pengujian pengiriman Calling Card & reset form state
node scripts/test-callingcard.mjs

# Menjalankan pengujian responsive layout (Mobile 375px, Tablet 768px, Desktop 1440px)
node scripts/test-responsive.mjs

# Menjalankan pengujian real mouse click hit-testing via CDP
node scripts/test-click.mjs

# Menjalankan pengujian transisi timeline comic wipe (450ms budget)
node scripts/test-timeline.mjs
```

---

*Last updated: September 2026 · DAFFA // JOKER · Lead Game Systems Engineer · Persona 5 Royal Portfolio*
