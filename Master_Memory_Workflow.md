---
type: memory
kind: project
name: "master-web-persona-5"
description: "Memory terpusat Web persona 5 — portfolio tema Persona 5 Royal, Vite + vanilla TypeScript strict, DOM 100% dinamis; dokumen lama TIDAK sinkron kode"
scope: project
project: "Web persona 5"
status: active
updated: 2026-09-26
tags: ["memory/project", "project/Web persona 5"]
---

# Master Memory Workflow — Web persona 5

> Memory terpusat proyek ini, disusun 23 September 2026. **Temuan utama: `DOCUMENTATION.md`
> dan `AGENTS.md` jauh melebih-lebihkan keadaan kode.** Keduanya diarsipkan verbatim di bawah,
> dan bagian **R5** mencabut klaim yang tidak benar. Kalau konflik: **kode di `src/` + dokumen ini yang berlaku.**

**Lokasi:** `C:\Users\Daffa\Desktop\Folder Space AI\Folder Space Semester 7\Web persona 5`
**Isi sebenarnya:** portfolio game-developer kelas AAA bertema Persona 5 Royal (persona
"DAFFA // JOKER", Lead Game Systems Engineer). Rendering DOM **100% dinamis** via TypeScript.
**Status:** aktif, ter-git (4 commit di jalur `main`, terakhir 2026-09-12 `4252a7e` "update"), sudah pernah di-build (`dist/` ada).
**Perbatasan yang mudah terlewat:** status "ter-git" itu tidak berlaku untuk dokumen ini sendiri —
dokumen ini untracked, dan hasil kerja setelah commit terakhir (23–25 Sep) juga belum di-commit. Baca **R0** di bawah.

## R0. ⚠️ Risiko Terbuka Utama — baca sebelum memakai dokumen ini

**Item terbuka nomor 1 proyek ini: dokumen ini belum pernah masuk git sama sekali.**

| Fakta (diukur 2026-09-25) | Bukti |
|---|---|
| `Master_Memory_Workflow.md` berstatus **untracked** — belum pernah `git add`, jadi tidak ada di commit mana pun maupun di GitHub | `git ls-files` menolaknya; `git status` menampilkan `?? Master_Memory_Workflow.md` |
| **Nol** commit `docs(memory)` — seluruh 4 commit `main` (`first commit`, `upfate`, `update`, `update`) bukan commit memory | `git log --pretty=%s \| grep -c docs(memory)` = 0 |
| Working tree memegang **21 berkas terlacak yang belum di-commit** (+2.004 / −1.222 baris): 19 modified + 2 deleted (`DOCUMENTATION.md`, `scripts/screenshot-footer.png`) | `git diff --stat` |
| **6 berkas untracked**: dokumen ini, 4 ikon SVG di `public/images/p5r/ui/` (25 Sep 20:18), dan `scripts/screenshot-bottom-clean.png` (berkas 12 Sep yang tidak pernah di-`add`) | `git status --untracked-files=all` |
| Remote **ada** dan terkonfigurasi: `origin` = `https://github.com/daffa-789/Web-persona-5.git`; `origin/main` menunjuk ke commit yang sama dengan `main` (0/0 ahead-behind menurut pelacakan lokal — belum diverifikasi dengan `fetch`) | `git remote -v`, `git status -sb` |

Rentang waktu kerja yang belum masuk git: screenshot 12 Sep → penulisan ulang `AGENTS.md` 23 Sep →
kode dan set ikon 25 Sep. Angka "24–26 Sep" di bagian lain dokumen ini mengacu ke gelombang terakhir.

**Konsekuensinya:** riwayat yang sudah ter-commit aman (4 commit `main` itu juga ada di `origin/main`),
tetapi **seluruh isi dokumen ini plus hasil kerja pasca-commit hanya ada di satu berkas pada satu disk** —
tidak ada salinan di commit, tidak ada di GitHub. Bagian yang benar-benar tidak punya tempat lain:
**R7b** (hasil audit Playwright 38/38, pemangkasan set ikon 14 → 4, jebakan SHOWTIME), **R5**
(daftar klaim palsu), dan **R0** ini — hasil kerja sintesis yang tidak bisa dibaca ulang dari kode.

**Batas ketelitian catatan di atas:** dua dokumen yang diarsipkan verbatim di bawah bukan harta tunggal —
`DOCUMENTATION.md` (292 baris) dan `AGENTS.md` versi 81 baris masih bisa diambil dari commit `4252a7e`
(`git show 4252a7e:DOCUMENTATION.md`). Yang benar-benar cuma punya satu salinan: isi dokumen ini sendiri
dan seluruh perubahan yang belum di-commit.

**Yang perlu dilakukan (urut):** (1) `git add Master_Memory_Workflow.md` + commit, (2) commit 21 berkas
di working tree + 6 berkas untracked, (3) `git push` ke `origin` supaya salinan kedua ada di luar disk ini.
Belum ada satu pun langkah itu dijalankan per 2026-09-25.

**Catatan soal `updated: 2026-09-26` di frontmatter:** tanggal itu dibiarkan apa adanya, padahal saat
bagian ini ditulis jam riil masih 2026-09-25 (~23:00 WIB) dan berkas ini terakhir berubah 25 Sep 20:23.
Angka "26" di R7b dan di frontmatter = batas waktu pekerjaan, bukan tanggal verifikasi; angka-angka di
R0/R1 di atas mengukur keadaan per 2026-09-25.

## R1. Angka Kunci

| Aspek | Nilai |
|---|---|
| Stack | **Vite + vanilla TypeScript strict** — TANPA framework UI |
| Dependensi runtime | **1**: `canvas-confetti` (devDeps: typescript ^5.4, vite ^5.2, @types/canvas-confetti) |
| `package.json` | name **`persona3-reload-portfolio`** (bukan "persona5"), version **1.0.0** — dokumen mengklaim 2.0.0 |
| Kode | **10.177 baris di 13 berkas `src/`** = TS **5.843 baris** (12 berkas `.ts`) + CSS **4.334 baris** (`src/styles/p5r-style.css`) — diukur ulang 2026-09-25; angka lama "TS 5.152 + CSS 3.867" tertinggal oleh pekerjaan setelah 23 Sep |
| Perintah | `npm run dev` (Vite port **5173**, host true, open false) · `npm run build` (`tsc && vite build`) · `npm run preview` |
| Vite config | outDir `dist`, sourcemap true, target esnext, publicDir `public` |
| Aset publik | 8 audio `.mp3`, 3 PNG (`joker_render`, `phantom_thieves_logo`, `morgana.png`), 1 `.ttf` (`Persona5MenuFontPrototype-Regular`), **+ 4 SVG ikon** di `public/images/p5r/ui/` (`p5-pointer-asterisk`, `p5-chevron-tip`, `p5-padlock`, `p5-metaverse-eye` — lihat R7b; keempatnya masih untracked) |
| Font (Google Fonts CDN) | Anton, Bebas Neue, Dela Gothic One, Montserrat, Syne, JetBrains Mono |

## R2. Arsitektur Nyata

`index.html` (body hanya `<div id="app">` + `/src/main.ts`) → `src/main.ts` (bootstrap, AOA modal,
vital bars, hover SFX, entrance) → `src/renderer.ts` (inject seluruh DOM shell/modal/section) →
modul `src/ui/*`, `src/audio/p5rAudio.ts`, `src/config/portfolio.ts`, `src/transitions/transitions.ts`,
`src/utils/p5Confetti.ts`, `src/styles/p5r-style.css`.

`src/config/portfolio.ts` = **sumber data utama**; URL sosial yang kosong (`url:""`) membuat kartu
ber-class `.slink-card-locked`.

## R3. Fitur yang BENAR-BENAR berfungsi

5 tab konten (DOSSIER, SKILLS, HEISTS, CONFIDANTS, CALLING CARD) · navigasi ribbon miring +
keyboard/mouse · cinematic entrance · header HUD · **All-Out Attack modal** (di `main.ts`) ·
**Morgana navigator** · advice modal · audio **channel-separated** (hover vs action) + synth fallback
Web Audio API · social-link "Confidant locked/offline resilience" dengan toast in-universe · confetti.

## R4. Struktur `src/` yang Ada (13 berkas)

`main.ts` · `renderer.ts` · `audio/p5rAudio.ts` · `config/portfolio.ts` ·
`transitions/transitions.ts` · `utils/p5Confetti.ts` · `styles/p5r-style.css` ·
`ui/adviceModal.ts` · `ui/entrance.ts` · `ui/header.ts` · `ui/helpModal.ts` ·
`ui/monaNavigator.ts` · `ui/navigation.ts`.

## R5. ⚠️ Klaim Dokumen yang TIDAK ADA di Kode (cabut dari memori)

- **15 modul yang didokumentasikan tapi tidak ada file-nya:** `ui/commandPalette.ts`,
  `scheduleModal.ts`, `browserSandboxModal.ts`, `grillMeModal.ts`, `teamworkModal.ts`,
  `learnCodexModal.ts`, `boostMode.ts`, `heistModal.ts`, `heists.ts`, `skills.ts`, `confidants.ts`,
  `dossier.ts`, `callingCard.ts`, `allOutAttack.ts`, `allOutAttackModal.ts`.
  → "**6 sistem slash**" dan "**Command Palette**" **tidak ada** di kode sekarang.
- **`scripts/`** hanya berisi **8 file PNG screenshot**, bukan `.mjs`. Semua `test-*.mjs` yang disebut
  di `DOCUMENTATION.md` §"Skrip Pengujian" **tidak ada**. `.gitignore` menunjuk folder `tests/` yang juga tidak ada.
- `AGENTS.md` meminta SFX disimpan sebagai **`.mp3` DAN `.wav`** — kenyataannya
  `public/audio/sfx/` hanya berisi `.mp3`, tidak ada satu pun `.wav`.
- Aset nyata tapi tidak tercatat di dokumen: `public/fonts/Persona5MenuFontPrototype-Regular.ttf`,
  `public/images/p5r/morgana.png`.

**Aturan kerja:** jangan pakai `DOCUMENTATION.md` sebagai peta file — pakai isi `src/` aktual.

## R6. Aturan Desain Wajib (dari `AGENTS.md`; sebagian merujuk sistem yang belum ada — lihat R5)

1. **Tipografi adalah invariant:** Bebas Neue untuk ribbon (`letter-spacing .05em`, uppercase,
   `skewX(-12deg) rotate(-8deg)`) · Anton untuk display (`-0.04em`) · Dela Gothic One untuk header
   ransom-note dengan rotasi per-huruf −4…+4 deg · JetBrains Mono untuk telemetri `.25em`.
2. **Framing kartu:** `.p5-card-frame` = L-bracket crimson `#E60012` kiri-atas + gold `#FFDE00`
   kanan-bawah; strip telemetri wajib `◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99`;
   blackout 60 ms sebelum polygon wipe.
3. **Audio 2 tingkat** (file `.mp3` lokal + fallback synth Web Audio) dan **anti-tabrakan**:
   pisahkan `playHoverChannel` vs `playActionChannel`, throttle 100–120 ms.
   Akuisisi aset: ripping resmi kena Cloudflare/`.cpk`/`.awb`; sumber fan repo GitHub
   (`Hum2a/…`, `ffaneto/persona5-website-theme`).
4. **Pacing transisi:** jangan menunda wipe sampai melebihi timeout cleanup JS; hit-area buffer
   `::before { inset: -6px -12px -6px -32px }`; `element.animate()` untuk stance; staggered reveal 0.04 s.
5. **Navigator Morgana** `#p5-mona-navigator` (kiri-bawah, z 60, container `pointer-events:none`) ·
   modal `.p5-modal-backdrop` (z 9980–9999, dismiss dengan ESC).
6. **Keyboard/controller:** panah + WASD, cek `document.activeElement`, ESC/Backspace → `goBack()`,
   `#p5-back-btn`, `#p5-controller-hud`.
7. **Sub-agent kena quota 429** → lanjutkan eksekusi langsung di sesi utama.

## R7. Gotchas

- Nama paket (`persona3-reload-portfolio`) tidak cocok dengan tema produk (Persona 5 Royal) —
  warisan dari proyek awal; ubah hanya kalau memang perlu.
- Semua data konten ada di satu berkas `config/portfolio.ts`; jangan hardcode di komponen.

## R7b. Motion Director (dibangun 25–26 September 2026)

`src/transitions/transitions.ts` bukan lagi helper wipe — ia **director** dengan 4 varian,
masing-masing berupa cue yang bisa dibatalkan: `slash-cut` (tab→tab), `shutter-blackout`
(buka modal), `ransom-assemble` (header section), `kinetic-exit` (tutup modal).

**Invariant yang sudah dibuktikan Playwright (38/38 checks, stabil lintas run):**
- Cue menunggu `animationend`, bukan menebak durasi; timer hanya jaring pengaman.
  Alasannya: frame yang datang teluh membuat layer dicabut di tengah sapuan → wipe
  berubah jadi hard cut.
- **State yang sudah commit tidak boleh ikut batal.** `onSettle` (selalu jalan) memisahkan
  perubahan state dari animasi kosmetik (`onAbort` hanya membatalkan staging). Tanpa ini,
  transisi yang di-preempt meninggalkan dua `.tab-pane.active` sekaligus atau modal yang
  tak pernah tersembunyi.
- Tabel `MOTION` = satu-satunya sumber pacing; delay CSS harus <= window cleanup JS.
  Cover 120 ms (delay 0/15/30) → swap 215 ms → release 200 ms (delay 0/40/80) → 490 ms.
- `transition: all` sudah 0 di seluruh stylesheet (16 titik diganti daftar properti eksplisit).
- `prefers-reduced-motion` dihormati: overlay tidak dibangun sama sekali, ribbon langsung tampil.

**Pelajaran desain (jangan diulang):** ikon hasil gambar tangan yang lemah justru merusak
tampilan yang sudah bersih. Set ikon dipangkas dari 14 → **4** (`p5-pointer-asterisk`,
`p5-chevron-tip`, `p5-padlock`, `p5-metaverse-eye`) dan hanya itu yang dirujuk `src/`.
Yang dibuang: tarot frame, speech tail, alert, help, corner ornament, ribbon tail.
Tes kini **menurunkan daftar ikon dari aplikasi itu sendiri**, jadi tidak bisa basi.

**Jebakan yang pernah menjebak:** tombol SHOWTIME sempat memakai `.btn-theurgy-strike`
(`display:block; width:100%`) → kotaknya 1439×237 px dan border crimson-nya yang di-skew
menggambar garis diagonal liar menyeberangi seluruh viewport. Kelas CTA lama jangan dipakai
ulang untuk elemen kecil di dalam ribbon.

## R8. Aturan Memory Proyek Ini

Berkas ini satu-satunya memory terpusat proyek. `AGENTS.md` diserap ke sini — kalau file instruksi
agen masih dibutuhkan oleh tooling, kembalikan sebagai pointer pendek ke dokumen ini, bukan sebagai memory kedua.

---

## Peta Dokumen Proyek

Berkas ini adalah **satu-satunya memory terpusat** untuk proyek `Web persona 5`.
Perubahan berarti dicatat di sini lewat commit `docs(memory): catat …`.

**Koreksi 2026-09-25:** konvensi `docs(memory): catat …` itu **belum pernah dijalankan sekali pun** —
dari 4 commit `main` tidak ada satu pun berjudul `docs(memory)`, dan berkas ini sendiri masih untracked,
jadi sampai hari ini perubahan memory tidak tercatat di git sama sekali. Lihat R0.
Untuk sementara, aturan "catat perubahan berarti" dipenuhi lewat baris bertanda **Koreksi <tanggal>:**
di dalam berkas ini, bukan lewat commit.

### Diserap ke arsip di bawah (file aslinya dihapus)
- `Web persona 5` root: `DOCUMENTATION.md` → **file aslinya dihapus**
  (dihapus dari working tree; salinan lamanya 292 baris masih ada di commit `4252a7e`)

### Dibiarkan (bukan memory)
- `AGENTS.md` — sengaja dibiarkan, bukan memory

**Koreksi 2026-09-25 soal dua entri di atas:** `AGENTS.md` sudah tidak "dibiarkan" dalam arti utuh —
berkasnya ditulis ulang di tempat dari **81 baris menjadi 8 baris** (diff `+6 / −79`) dan kini hanya
menunjuk ke dokumen ini; bentuk penunjuk pendek itu memang disengaja, jadi jangan "dipulihkan" ke
81 baris. Versi lamanya tetap terbaca di dua tempat: commit `4252a7e` (`git show 4252a7e:AGENTS.md`,
81 baris) dan arsip `<details>` di bawah (potongan 78 baris yang disalin saat konsolidasi 23 Sep).

---

## Arsip Dokumen Sumber (verbatim)

Isi setiap sumber dipertahankan apa adanya; separator hanya menandai batas antar dokumen.
Diarsipkan saat konsolidasi memory 2026-09-23 (generator satu-kali pakai, sudah dihapus)

**Koreksi 2026-09-25 (cara membaca arsip):** kedua blok di bawah dibekukan per 23 September dan tidak
disunting. `DOCUMENTATION.md` di dalamnya adalah dokumen yang klaimnya sudah dicabut R5 ("6 sistem
slash", "Command Palette", 15 modul tak berbentuk file, `scripts/*.mjs`, versi 2.0.0 — semuanya fiksi
atau kedaluwarsa), dan `AGENTS.md` di dalamnya adalah versi **81 baris** sedangkan berkas di root kini
8 baris pointer. Aturan arsip soal "simpan SFX sebagai `.mp3` DAN `.wav`" juga tidak berlaku:
`public/audio/sfx/` hanya berisi `.mp3`. Yang berlaku = R0–R8 dokumen ini + isi `src/`.

<!-- ARCHIVE-BEGIN -->
<details>
<summary>DOCUMENTATION.md · 292 baris · disalin verbatim</summary>

<!-- BEGIN SOURCE: DOCUMENTATION.md -->

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

<!-- END SOURCE: DOCUMENTATION.md -->
</details>
<details>
<summary>AGENTS.md · 78 baris · disalin verbatim</summary>

<!-- BEGIN SOURCE: AGENTS.md -->

# Workspace Guidelines: Persona 5 Royal Web Development

These guidelines reflect learned project conventions, design invariants, and technical workflows for this Persona 5 Royal web portfolio.

---

## 1. Typography Invariants
- **Command & Navigation Ribbons**: Use `Bebas Neue` with `letter-spacing: 0.05em`, `text-transform: uppercase`, and `transform: skewX(-12deg) rotate(-8deg)`.
- **Primary Display Titles & Finishing Touch (AOA)**: Use `Anton` (`--font-display`) with negative kerning (`letter-spacing: -0.04em`) and dynamic `skewX(-12deg)`.
- **Ransom-Note Paper Cutout Headers**: Use `Dela Gothic One` with per-character rotation (-4deg to +4deg) and alternating paper-cutout backgrounds (`r-bg-red`, `r-bg-white`, `r-bg-black`).
- **Telemetry, System Stats & Meters**: Use `JetBrains Mono` with wide tracking (`letter-spacing: 0.25em`).

---

## 2. Audio Engine & SFX Integration
- **Two-Tier Audio Architecture**:
  1. **Primary**: High-fidelity local `.mp3` / `.wav` sound files located in `public/audio/sfx/`.
  2. **Fallback**: Zero-latency procedural Web Audio API synthesizer for instant fallback if browser autoplay policy blocks HTMLAudioElement playback.
- **Audio Asset Acquisition**:
  - Direct scraping from game rips often encounters Cloudflare protection or proprietary `.cpk`/`.awb` containers.
  - Source verified, pre-extracted game audio from high-fidelity open-source fan projects and browser mods on GitHub (e.g., `Hum2a/Persona-5-Royal-Main-Menu-Opera-GX-Mod`, `Chavafei/Persona_5_menu_in_Godot`, `ffaneto/persona5-website-theme`).
  - Always store audio assets in both `.mp3` and `.wav` formats in `public/audio/sfx/`.

---

## 3. UI Framing & Comic Accents
- **Card Brackets (`.p5-card-frame`)**:
  - Top-left corner: Crimson L-bracket (`#E60012`).
  - Bottom-right corner: Royal Gold L-bracket (`#FFDE00`).
  - Ensure all main content panels, cards, and interactive containers apply `.p5-card-frame`.
- **Data Readout Strips (`.p5-data-strip`)**:
  - Every project card must include the infiltration log telemetry strip: `◆ INFILTRATION-LOG ◆ STATUS: ACTIVE ◆ CLEARANCE: LV.99`.
- **Section Transition Pacing**:
  - Always precede dramatic polygon wipes with a brief 60ms screen blackout to simulate high-contrast camera shutter flash.

---

## 4. Subagent Quota & Execution Resilience
- If background subagents hit API quota limits (`RESOURCE_EXHAUSTED / 429`), immediately pivot to executing and verifying the implementation directly in the primary session to maintain continuous execution.

---

## 5. Audio Collision Prevention & Channel Separation
- Separate sound effects into dedicated channels (`playHoverChannel` vs `playActionChannel`).
- Hover channel must throttle events (minimum 100–120ms cooldown) and pause/reset any currently playing hover sound when a new one begins to prevent auditory cacophony during rapid mouse sweeps.
- Action channel must pause previous action clips so confirms, cancels, and slashes hit crisply without muddy reverberation.

---

## 6. Keyboard & Controller Navigation Invariants
- Provide dual input support: Mouse + full Keyboard controls (`ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` and `W`/`A`/`S`/`D`).
- Input Protection: Always check `document.activeElement` for `input`, `textarea`, or `select` before intercepting keyboard shortcuts.
- Cancel/Return Navigation: Pressing `ESC` or `Backspace` must close active modals first, then navigate back through `tabHistory` with authentic Persona cancel sound (`menu_back.wav` / `menu_back.mp3`).
- On-Screen Prompts: Include an authentic Persona 5 Back Button (`#p5-back-btn`) and Controller Prompt Bar (`#p5-controller-hud`).

---

## 7. Transition Pacing, Kinetic Entrances & Hitbox Anchoring
- **Wipe Pacing & Animation Synchronization**:
  - Never place artificial CSS animation delays on wipe-out layers that exceed JS cleanup timeouts. Wipe-out must execute smoothly upon tab swap at midpoint (~160ms) without premature DOM removal.
  - Pair the diagonal comic slash with a synchronized light beam (`.p5r-slash-cutline`) and subtle micro-punch recoil on `.main-content`.
- **Mouse Hover Hitbox Anchoring**:
  - Elements that translate horizontally on hover (such as ribbon buttons `translateX(18px)`) must incorporate an extended hit-area buffer (`::before { inset: -6px -12px -6px -32px; }`) so cursor movement never slips off the element and causes recursive hover-jitter loops.
- **Dynamic Stance Kinetic Transitions**:
  - Animate character stance reactions using the Web Animations API (`element.animate()`) preserving custom rotational and positional offsets rather than rigid CSS `@keyframes` that force scale resets.
- **Staggered Content Reveal**:
  - Newly activated tabs must reveal their section headers with comic slide-in and child cards with staggered pop-in (`0.04s` stagger increments) to match Persona 5's energetic menu feel.

---

## 8. Tactical Field Navigator & Modal System Invariants
- **Morgana Field Advisor (`#p5-mona-navigator`)**:
  - Stationed bottom-left (`z-index: 60`), non-blocking with `pointer-events: none` on container and `pointer-events: auto` on interactive speech bubble and avatar button.
  - Listens to `p5r:tabchange`, high alert telemetry (>80%), and audio toggles to speak contextual Phantom Thief lines.
  - Clicking avatar cycles practical keyboard tips and lore.
- **Modal Dialog Hierarchies (`.p5-modal-backdrop`)**:
  - All application modals (Field Manual, Palace Heist Blueprint, All-Out Attack) must share unified backdrop blur (`z-index: 9980-9999`) and respect `ESC` key dismiss with `menu_back.mp3`.
  - Always trap or isolate scroll when modal is active, and reset input focus gracefully upon dismissal.

<!-- END SOURCE: AGENTS.md -->
</details>
<!-- ARCHIVE-END -->
