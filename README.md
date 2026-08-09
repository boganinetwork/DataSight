# Data Observatory

Private data analysis workspace yang jalan 100% di browser. Upload CSV/JSON, jalankan query SQL, buat chart — semua diproses di perangkatmu sendiri, tanpa server, tanpa data yang dikirim ke mana pun.

**Live demo:** <https://boganinetwork.github.io/DataSight/>

---

## Kenapa "private"?

Semua pemrosesan data terjadi di browser lewat [DuckDB-WASM](https://duckdb.org/docs/api/wasm/overview) — mesin database yang jalan sebagai WebAssembly. File yang kamu upload:

- Tidak pernah dikirim ke server manapun
- Tidak melewati backend apapun
- Hanya tersimpan di `localStorage` browser-mu sendiri (kalau autosave aktif)

Kalau kamu tutup tab tanpa export, dan tidak ada autosave, data hilang begitu saja — persis seperti aplikasi desktop offline.

---

## Fitur

### Data

- Upload file **CSV** dan **JSON** (drag file ke tombol upload, bisa multi-file sekaligus)
- Setiap file otomatis jadi 1 tabel database, siap di-query
- Auto-save tabel ke `localStorage` — reload halaman, data tetap ada

### Query & Analisis

- Editor SQL bebas, jalankan query apapun ke tabel yang sudah di-upload (termasuk `JOIN` antar tabel)
- Shortcut `Ctrl+Enter` / `Cmd+Enter` untuk menjalankan query
- Riwayat 20 query terakhir, tinggal klik untuk pakai ulang
- Statistik ringkas otomatis per kolom (min, max, rata-rata, jumlah unik, jumlah null)
- Filter interaktif pada hasil query tanpa perlu menulis ulang SQL

### Visualisasi

- Chart Bar, Line, Scatter, dan Pie dari hasil query
- Pilih kolom X dan Y secara bebas
- Pin chart ke **Dashboard** untuk melihat beberapa chart sekaligus dalam satu tampilan

### Export & Portabilitas

- Export hasil query ke CSV
- Export chart ke PNG
- **Save Project**: simpan seluruh tabel + query terakhir ke satu file `.json`
- **Load Project**: pulihkan workspace dari file project yang disimpan — cara resmi memindahkan data antar device (tidak ada sinkronisasi otomatis)

### AI (Opsional, Bring Your Own Key)

- Fitur "✨ AI" untuk mengubah pertanyaan bahasa natural menjadi query SQL
- Mendukung **Google Gemini** dan **Groq** (keduanya punya tingkatan API gratis)
- **Kamu memasukkan API key milikmu sendiri** — key disimpan di `localStorage` browser-mu, dikirim langsung ke provider AI terkait, tidak pernah melewati server pihak ketiga manapun di luar itu
- Pesan error/kuota habis ditampilkan apa adanya dari respons API provider
- Query hasil AI **tidak otomatis dijalankan** — selalu cek dulu sebelum klik "Jalankan"

---

## Cara Pakai

1. Buka <https://boganinetwork.github.io/DataSight/>
2. Klik **"+ Upload CSV / JSON"**, pilih file data kamu
3. Tulis query SQL di editor (nama tabel sesuai nama file yang diupload), lalu klik **"Jalankan ▸"**
4. Atur chart di panel kanan (tipe chart, kolom X/Y)
5. (Opsional) Klik **"✨ AI"**, pilih provider, masukkan API key kamu, lalu tulis pertanyaan dalam bahasa natural — query SQL akan otomatis terisi di editor
6. Export hasil (CSV/PNG) atau simpan seluruh workspace lewat **"Save Project"**

---

## Format File yang Didukung

| Format                 | Status                                                   |
| ---------------------- | -------------------------------------------------------- |
| CSV                    | ✅ Didukung                                              |
| JSON                   | ✅ Didukung                                              |
| Excel, Parquet, SQLite | ❌ Belum (dipertimbangkan untuk pengembangan berikutnya) |
| PDF, Word              | ❌ Tidak didukung — bukan format data tabular            |

---

## Batasan yang Perlu Diketahui

- **Kapasitas data**: dibatasi oleh `localStorage` browser (umumnya sekitar 5–10MB per situs). Dataset besar sebaiknya di-query lalu diexport, bukan disimpan penuh di autosave.
- **Tanpa sinkronisasi antar device**: gunakan fitur Save/Load Project untuk memindahkan workspace secara manual.
- **Fitur AI bergantung pada API key milikmu**: kuota, biaya (jika ada), dan ketersediaan sepenuhnya mengikuti ketentuan provider (Gemini/Groq) yang kamu pilih. Proyek ini tidak menanggung, tidak membatasi, dan tidak memonitor pemakaian key-mu.
- **AI bisa menghasilkan query yang salah/tidak akurat** — selalu tinjau sebelum menjalankan, terutama untuk data penting.

---

## Ketentuan Penggunaan

- Aplikasi ini **gratis digunakan sepenuhnya**, tanpa akun, tanpa langganan.
- Tidak ada jaminan (warranty) dalam bentuk apa pun — gunakan dengan risiko masing-masing, terutama untuk data yang bersifat kritikal.
- Karena semua pemrosesan terjadi lokal di browser, pengembang/pemilik repo **tidak memiliki akses maupun tanggung jawab** atas data yang kamu upload atau proses lewat aplikasi ini.
- Kalau proyek ini bermanfaat, donasi bersifat sukarela dan tidak wajib.

---

## Teknologi

- [DuckDB-WASM](https://duckdb.org/docs/api/wasm/overview) — mesin SQL yang jalan di browser lewat WebAssembly
- [Chart.js](https://www.chartjs.org/) — visualisasi data
- Vanilla JavaScript (ES Modules), HTML, CSS — tanpa framework, tanpa build step
- [GitHub Pages](https://pages.github.com/) — hosting statis

---

## Kontribusi

Repo ini open source. Issue dan pull request dipersilakan.
