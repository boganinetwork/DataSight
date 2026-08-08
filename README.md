# Data Observatory

> **A private data analysis workspace that runs entirely in your browser.**

Data Observatory adalah aplikasi analisis data 100% client-side yang memberikan Anda kekuatan untuk menggali insight dari data Anda tanpa pernah meninggalkan perangkat. Tidak ada server, tidak ada upload data, tidak ada tracking—hanya Anda dan data Anda.

![Data Observatory Screenshot](./screenshot.png)

## 🎯 Fitur Utama

### ✨ Analisis Data Privat

- **100% Client-Side**: Semua pemrosesan terjadi di browser Anda. Data tidak pernah dikirim ke server manapun.
- **Offline-Ready**: Bekerja tanpa koneksi internet setelah aplikasi dimuat.
- **Zero Data Leakage**: Tidak ada tracking, analytics, atau data collection.

### 📊 Upload & Query Data

- **Multi-Format Support**: CSV, JSON, Excel (.xlsx)
- **Auto Type Detection**: Otomatis mendeteksi tipe kolom (numeric, text, date, boolean)
- **Drag & Drop Upload**: Upload file dengan mudah
- **Multiple Tables**: Upload dan query multiple dataset sekaligus

### 🔍 SQL Query Engine

- **SQL.js (SQLite in WASM)**: Engine SQL penuh di browser
- **Real-Time Execution**: Query dijalankan instant dengan performance metrics
- **Full SQL Support**: SELECT, WHERE, GROUP BY, JOIN, aggregations, dll
- **Keyboard Shortcut**: Ctrl+Enter untuk execute query

### 📈 Data Visualization

- **4 Chart Types**: Bar, Line, Scatter, Pie
- **Interactive Charts**: Hover untuk melihat detail
- **Auto-Detection**: Otomatis memilih kolom untuk X/Y axis
- **Export as PNG**: Download chart sebagai gambar

### 💾 Data Persistence

- **Auto-Save**: Workspace otomatis disimpan ke localStorage
- **Query History**: Akses kembali query sebelumnya
- **Export Results**: Download hasil query sebagai CSV
- **Save/Load Projects**: Simpan workspace sebagai JSON file

---

## 🚀 Quick Start

### Akses Online

Buka aplikasi di browser Anda:

```link
https://yourusername.github.io/DataSight
```

### Atau Jalankan Lokal

```bash
# Clone repository
git clone https://github.com/yourusername/DataSight.git
cd DataSight

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Buka http://localhost:3000
```

---

## 📖 Panduan Penggunaan

### 1️⃣ Upload Data

**Cara 1: Klik tombol Upload** (Ready)

- Klik tombol **"Upload"** di header
- Pilih file CSV, JSON, atau Excel
- Tunggu file ter-parse dan muncul di sidebar

**Cara 2: Drag & Drop** (Coming Soon)

- Drag file langsung ke area aplikasi

**Format yang Didukung:**

- **CSV**: Standard comma-separated values
- **JSON**: Array of objects, e.g., `[{"name": "John", "age": 30}, ...]`
- **Excel**: .xlsx files (first sheet akan digunakan)

### 2️⃣ Tulis & Jalankan Query

**Di SQL Editor:**

```sql
-- Contoh 1: Lihat semua data
SELECT * FROM sales LIMIT 10;

-- Contoh 2: Aggregation
SELECT region, SUM(revenue) as total_revenue
FROM sales
GROUP BY region
ORDER BY total_revenue DESC;

-- Contoh 3: Filter & Join
SELECT s.product, s.revenue, c.customer_name
FROM sales s
JOIN customers c ON s.customer_id = c.id
WHERE s.revenue > 1000;
```

**Cara Jalankan:**

- Klik tombol **"Execute"** atau tekan **Ctrl+Enter**
- Hasil muncul di panel Results

### 3️⃣ Visualisasi Data

**Automatic Chart Generation:**

- Setelah query dijalankan, chart otomatis ditampilkan
- Pilih chart type: Bar, Line, Scatter, atau Pie
- Hover untuk melihat detail

**Customize Chart:**

- Klik icon chart type di atas chart
- Pilih tipe yang diinginkan

### 4️⃣ Export Hasil

**Export Query Results:**

- Klik tombol **Download** di panel Results
- File CSV akan didownload

**Export Chart:**

- Klik tombol **Download** di panel Chart
- Chart disimpan sebagai PNG

### 5️⃣ Query History

**Akses History:**

- Klik icon **History** di header (kanan atas)
- Drawer akan membuka dengan daftar query terakhir
- Klik query untuk replay atau delete

---

## 🛠️ Fitur Lanjutan

### Keyboard Shortcuts

| Shortcut     | Fungsi         |
| ------------ | -------------- |
| `Ctrl+Enter` | Execute query  |
| `Ctrl+B`     | Toggle sidebar |
| `Esc`        | Close drawer   |

### Column Type Detection

Aplikasi otomatis mendeteksi tipe data:

- **Numeric (№)**: Numbers, integers, decimals
- **Text (T)**: Strings, names
- **Date (📅)**: ISO dates, timestamps
- **Boolean (✓)**: True/false, 1/0

### Data Limits

- **File Size**: Up to browser memory (typically 100MB+)
- **Rows**: Unlimited (limited by browser RAM)
- **Query Complexity**: Full SQL support

---

## 🔒 Privacy & Security

### Apa yang Terjadi dengan Data Anda?

✅ **Disimpan Lokal**: Hanya di browser Anda  
✅ **Tidak Dikirim**: Tidak ada koneksi ke server  
✅ **Tidak Disimpan**: Data hilang saat refresh (kecuali Anda save)  
✅ **Tidak Tracked**: Tidak ada analytics atau cookies

### Bagaimana Cara Menjaga Data Aman?

1. **Gunakan HTTPS**: Akses aplikasi via HTTPS saja
2. **Jangan Share Tab**: Jangan biarkan orang lain akses tab browser Anda
3. **Clear Browser**: Hapus cache/cookies jika khawatir
4. **Export & Backup**: Simpan query/results penting sebagai file

---

## 🏗️ Tech Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| **Frontend**      | React 19 + TypeScript      |
| **Styling**       | Tailwind CSS 4 + shadcn/ui |
| **Database**      | SQL.js (SQLite in WASM)    |
| **Data Parsing**  | SheetJS, PapaParse         |
| **Visualization** | Recharts, D3.js            |
| **Storage**       | localStorage, IndexedDB    |
| **Export**        | html2canvas, jsPDF         |

### Mengapa Tech Stack Ini?

- **React**: Modern, component-based, fast
- **SQL.js**: Full SQL engine di browser, no backend needed
- **Recharts**: Beautiful, responsive charts
- **Tailwind**: Rapid styling, consistent design
- **localStorage**: Persistent state tanpa server

---

## 📝 Contoh Use Cases

### 1. Analisis Penjualan

```sql
-- Total revenue per region
SELECT region, COUNT(*) as transactions, SUM(amount) as revenue
FROM sales
GROUP BY region
ORDER BY revenue DESC;
```

### 2. Customer Analytics

```sql
-- Top 10 customers by spending
SELECT customer_name, COUNT(*) as purchases, SUM(amount) as total_spent
FROM orders
GROUP BY customer_id, customer_name
ORDER BY total_spent DESC
LIMIT 10;
```

### 3. Time Series Analysis

```sql
-- Daily revenue trend
SELECT DATE(order_date) as date, SUM(amount) as daily_revenue
FROM orders
GROUP BY DATE(order_date)
ORDER BY date;
```

### 4. Data Cleaning

```sql
-- Find duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING count > 1;
```

---

## ⚙️ Instalasi & Development

### Prerequisites

- Node.js 18+
- pnpm (atau npm/yarn)

### Setup Lokal

```bash
# Clone repository
git clone https://github.com/yourusername/DataSight.git
cd DataSight

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build untuk production
pnpm build

# Preview production build
pnpm preview
```

### Project Structure

```text
DataSight/
├── client/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities (database, export, storage)
│   │   ├── pages/            # Page components
│   │   ├── App.tsx           # Main app
│   │   └── index.css         # Global styles
│   ├── public/               # Static files
│   └── index.html
├── package.json
└── README.md
```

### Key Files

- **`client/src/lib/database.ts`**: SQL.js wrapper, query execution
- **`client/src/lib/fileParser.ts`**: CSV/JSON/Excel parsing
- **`client/src/lib/export.ts`**: Export to CSV/PNG
- **`client/src/components/ChartViewer.tsx`**: Chart visualization
- **`client/src/pages/Home.tsx`**: Main workspace

---

## 🐛 Troubleshooting

### File tidak ter-upload

**Masalah**: File tidak muncul di sidebar setelah upload  
**Solusi**:

- Pastikan format file benar (CSV, JSON, atau .xlsx)
- Cek console browser untuk error message
- Coba dengan file yang lebih kecil terlebih dahulu

### Query error

**Masalah**: "Query error: syntax error"  
**Solusi**:

- Cek syntax SQL (SQL.js menggunakan SQLite syntax)
- Pastikan nama tabel benar (case-sensitive)
- Lihat contoh query di atas

### Chart tidak muncul

**Masalah**: "Execute a query with numeric data to visualize"  
**Solusi**:

- Query harus return minimal 1 numeric column
- Cek tipe kolom di Results table
- Coba query berbeda dengan numeric data

### Data hilang setelah refresh

**Masalah**: Data tidak tersimpan setelah refresh browser  
**Solusi**:

- Ini normal—data disimpan di memory browser
- Gunakan "Export Results" untuk backup
- Atau "Save Project" untuk menyimpan workspace

### Browser crash dengan file besar

**Masalah**: Browser freeze/crash dengan file >100MB  
**Solusi**:

- Split file menjadi beberapa bagian lebih kecil
- Gunakan CSV daripada Excel untuk file besar
- Upgrade RAM browser atau gunakan browser lain

---

## 🚀 Roadmap

### Phase 2 (Coming Soon)

- [ ] Multi-file JOIN support
- [ ] Save/load project as JSON
- [ ] Advanced query history dengan timestamps
- [ ] Parquet file support

### Phase 3

- [ ] Dashboard: arrange multiple charts
- [ ] Interactive filters (dropdown, slider)
- [ ] Custom chart themes & colors
- [ ] Summary statistics (min/max/mean/null count)

### Phase 4

- [ ] Pre-built analysis templates
- [ ] Collaborative sharing (read-only links)
- [ ] Data transformation tools
- [ ] Advanced SQL editor dengan autocomplete

---

## 💝 Support

Jika Anda menemukan Data Observatory berguna, pertimbangkan untuk:

- **⭐ Star repository** di GitHub
- **☕ Buy Me a Coffee**: [buymeacoffee.com](https://buymeacoffee.com)
- **💖 Ko-fi**: [ko-fi.com](https://ko-fi.com)
- **🐛 Report bugs** atau suggest features di GitHub Issues
- **📢 Share** dengan teman/kolega

---

## 📄 License

Data Observatory adalah **open source** dan gratis untuk digunakan, dimodifikasi, dan didistribusikan.

**License**: MIT (lihat LICENSE file)

---

## 🙏 Credits

Built with ❤️ untuk developer dan analyst yang menghargai privacy.

**Technologies**:

- [SQL.js](https://sql.js.org/) - SQLite in WASM
- [React](https://react.dev/) - UI library
- [Recharts](https://recharts.org/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library

---

## 📞 Contact & Community

- **GitHub Issues**: Report bugs atau request features
- **Discussions**: Join community discussions
- **Email**: [your-email@example.com]
- **Twitter**: [@yourhandle]

---

## FAQ

### Q: Apakah data saya aman?

**A**: Ya, 100% aman. Data tidak pernah meninggalkan browser Anda. Tidak ada server, tidak ada upload, tidak ada tracking.

### Q: Bisakah saya menggunakan ini offline?

**A**: Ya, setelah aplikasi dimuat sekali, Anda bisa menggunakannya offline.

### Q: Berapa ukuran file maksimal yang bisa saya upload?

**A**: Tergantung RAM browser Anda. Biasanya 100MB+ bisa ditangani.

### Q: Apakah saya bisa share hasil analysis dengan orang lain?

**A**: Ya, export hasil sebagai CSV atau screenshot chart. Atau save workspace sebagai JSON file untuk dibagikan.

### Q: Apakah ini open source?

**A**: Ya, source code tersedia di GitHub. Anda bisa fork, modify, dan self-host.

### Q: Apakah ada versi mobile?

**A**: Aplikasi responsive dan bisa digunakan di tablet/mobile, tapi optimasi untuk desktop.

### Q: Bagaimana cara contribute?

**A**: Fork repository, buat branch baru, commit changes, dan buat pull request.

---

## Changelog

### v1.0.0 (Initial Release)

- ✅ File upload (CSV, JSON, Excel)
- ✅ SQL query execution
- ✅ Multi-chart visualization
- ✅ Export to CSV/PNG
- ✅ Query history
- ✅ localStorage persistence
- ✅ Dark theme with cyan accents

---

**🚀 Happy analyzing!**

_Data Observatory: Your data, your rules, your device._
