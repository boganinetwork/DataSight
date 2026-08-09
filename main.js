import * as duckdb from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/+esm";

const statusEl = document.getElementById("status");
const runBtn = document.getElementById("run-btn");
const sqlEl = document.getElementById("sql");
const resultArea = document.getElementById("result-area");
const fileListEl = document.getElementById("file-list");
const tableHint = document.getElementById("table-hint");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const chartTypeEl = document.getElementById("chart-type");
const chartXEl = document.getElementById("chart-x");
const chartYEl = document.getElementById("chart-y");

let db, conn;
let tables = JSON.parse(localStorage.getItem("do_tables") || "{}"); // {tableName: {filename, kind}}
let lastResult = null;
let rawResult = null;
let chartInstance = null;
const STORAGE_KEY_PREFIX = "do_file_";

// --- Export CSV ---
document.getElementById("export-csv-btn").addEventListener("click", () => {
  if (!lastResult || !lastResult.length) return;
  const cols = Object.keys(lastResult[0]);
  const csv = [cols.join(",")]
    .concat(
      lastResult.map((r) =>
        cols.map((c) => JSON.stringify(r[c] ?? "")).join(","),
      ),
    )
    .join("\n");
  downloadBlob(csv, "result.csv", "text/csv");
});

// --- Export Chart PNG ---
document.getElementById("export-png-btn").addEventListener("click", () => {
  if (!chartInstance) return;
  const link = document.createElement("a");
  link.download = "chart.png";
  link.href = document.getElementById("chart").toDataURL("image/png");
  link.click();
});

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// --- Save Project (.json) ---
document.getElementById("save-project-btn").addEventListener("click", () => {
  const project = { tables: {}, sql: sqlEl.value };
  for (const name of Object.keys(tables)) {
    project.tables[name] = {
      meta: tables[name],
      content: localStorage.getItem(STORAGE_KEY_PREFIX + name),
    };
  }
  downloadBlob(JSON.stringify(project), "project.json", "application/json");
});

// --- Load Project (.json) ---
document.getElementById("load-project-btn").addEventListener("click", () => {
  document.getElementById("project-input").click();
});
document
  .getElementById("project-input")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const project = JSON.parse(await file.text());
    for (const [name, t] of Object.entries(project.tables)) {
      await loadTableFromText(name, t.meta.filename, t.content, t.meta.kind);
    }
    sqlEl.value = project.sql || "";
    renderFileList();
    e.target.value = "";
  });

// --- Query History ---
let queryHistory = JSON.parse(localStorage.getItem("do_query_history") || "[]");
const historyEl = document.getElementById("query-history");

function renderHistory() {
  historyEl.innerHTML = '<option value="">Riwayat query…</option>';
  queryHistory.forEach((q, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = q.length > 50 ? q.slice(0, 50) + "…" : q;
    historyEl.appendChild(opt);
  });
}

function pushHistory(sql) {
  queryHistory = queryHistory.filter((q) => q !== sql); // hindari duplikat
  queryHistory.unshift(sql);
  queryHistory = queryHistory.slice(0, 20); // simpan 20 terakhir
  localStorage.setItem("do_query_history", JSON.stringify(queryHistory));
  renderHistory();
}

historyEl.addEventListener("change", () => {
  const idx = historyEl.value;
  if (idx !== "") sqlEl.value = queryHistory[idx];
});

renderHistory();

let dashboardItems = JSON.parse(localStorage.getItem("do_dashboard") || "[]");
const dashboardView = document.getElementById("dashboard-view");
const dashboardGrid = document.getElementById("dashboard-grid");

document.getElementById("dashboard-toggle").addEventListener("click", () => {
  dashboardView.style.display = "block";
  renderDashboard();
});
document.getElementById("dashboard-close").addEventListener("click", () => {
  dashboardView.style.display = "none";
});
document.getElementById("pin-chart-btn").addEventListener("click", () => {
  if (!sqlEl.value.trim()) return;
  dashboardItems.push({
    id: Date.now(),
    sql: sqlEl.value.trim(),
    chartType: chartTypeEl.value,
    xKey: chartXEl.value,
    yKey: chartYEl.value,
    title: sqlEl.value.trim().slice(0, 40),
  });
  localStorage.setItem("do_dashboard", JSON.stringify(dashboardItems));
  statusEl.textContent = "chart dipin ke dashboard";
});

async function renderDashboard() {
  dashboardGrid.innerHTML = "";
  for (const item of dashboardItems) {
    const card = document.createElement("div");
    card.style.cssText =
      "background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:10px;";
    card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
<span style="font-size:11px;color:var(--text-muted);font-family:var(--mono);">${item.title}</span>
<button data-id="${item.id}" class="dash-remove" style="font-size:11px;">✕</button></div>
<canvas id="dash-chart-${item.id}" height="180"></canvas>`;
    dashboardGrid.appendChild(card);
    card.querySelector(".dash-remove").addEventListener("click", () => {
      dashboardItems = dashboardItems.filter((d) => d.id !== item.id);
      localStorage.setItem("do_dashboard", JSON.stringify(dashboardItems));
      renderDashboard();
    });
    try {
      const result = await conn.query(item.sql);
      const rows = result.toArray().map((r) => r.toJSON());
      const labels = rows.map((r) => r[item.xKey]);
      const data = rows.map((r) => Number(r[item.yKey]) || 0);
      const ctx = document
        .getElementById(`dash-chart-${item.id}`)
        .getContext("2d");
      new Chart(ctx, {
        type: item.chartType === "scatter" ? "scatter" : item.chartType,
        data:
          item.chartType === "scatter"
            ? {
                datasets: [
                  {
                    label: item.yKey,
                    data: rows.map((r) => ({
                      x: Number(r[item.xKey]),
                      y: Number(r[item.yKey]),
                    })),
                    backgroundColor: "#4d8cff",
                  },
                ],
              }
            : {
                labels,
                datasets: [
                  {
                    label: item.yKey,
                    data,
                    backgroundColor: "#4d8cff",
                    borderColor: "#4d8cff",
                  },
                ],
              },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: "#9a9c9f" } } },
          scales:
            item.chartType === "pie"
              ? {}
              : {
                  x: { ticks: { color: "#6b6d70" } },
                  y: { ticks: { color: "#6b6d70" } },
                },
        },
      });
    } catch (err) {
      dashboardGrid.lastChild.querySelector("canvas").outerHTML =
        `<div class="error">${err.message}</div>`;
    }
  }
}

async function initDB() {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: "text/javascript",
    }),
  );
  const worker = new Worker(workerUrl);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);
  conn = await db.connect();
  statusEl.textContent = "siap";
  runBtn.disabled = false;

  // restore tabel tersimpan dari sesi sebelumnya
  for (const [name, meta] of Object.entries(tables)) {
    const content = localStorage.getItem(STORAGE_KEY_PREFIX + name);
    if (content) {
      await loadTableFromText(name, meta.filename, content, meta.kind, false);
    }
  }
  renderFileList();
  const savedSql = localStorage.getItem("do_last_sql");
  if (savedSql) sqlEl.value = savedSql;
}

async function loadTableFromText(
  tableName,
  filename,
  data,
  kind,
  persist = true,
) {
  if (kind === "parquet") {
    await db.registerFileBuffer(filename, new Uint8Array(data));
  } else {
    await db.registerFileText(filename, data);
  }
  const readFn =
    kind === "json"
      ? "read_json_auto"
      : kind === "parquet"
        ? "read_parquet"
        : "read_csv_auto";
  await conn.query(`DROP TABLE IF EXISTS "${tableName}"`);
  await conn.query(
    `CREATE TABLE "${tableName}" AS SELECT * FROM ${readFn}('${filename}')`,
  );
  tables[tableName] = { filename, kind };
  if (persist && kind !== "parquet") {
    localStorage.setItem(STORAGE_KEY_PREFIX + tableName, data);
    localStorage.setItem("do_tables", JSON.stringify(tables));
  }
}

function sanitizeTableName(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();
}

uploadBtn.addEventListener("click", () => fileInput.click());
const SIZE_WARNING_MB = 3;

fileInput.addEventListener("change", async (e) => {
  for (const file of e.target.files) {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > SIZE_WARNING_MB) {
      const proceed = confirm(
        `"${file.name}" berukuran ${sizeMB.toFixed(1)}MB. File besar berisiko gagal disimpan otomatis (localStorage browser terbatas ~5-10MB total). Lanjutkan upload?`,
      );
      if (!proceed) continue;
    }
    const kind = file.name.endsWith(".json")
      ? "json"
      : file.name.endsWith(".parquet")
        ? "parquet"
        : "csv";
    const data =
      kind === "parquet" ? await file.arrayBuffer() : await file.text();
    const tableName = sanitizeTableName(file.name);
    statusEl.textContent = `⏳ Memuat "${file.name}"…`;
    try {
      await loadTableFromText(tableName, file.name, data, kind);
      statusEl.textContent = `✓ tabel "${tableName}" dimuat`;
    } catch (err) {
      statusEl.textContent = "Gagal memuat file";
      console.error(err);
    }
  }
  fileInput.value = "";
  renderFileList();
});

function renderFileList() {
  fileListEl.innerHTML = "";
  const names = Object.keys(tables);
  if (names.length === 0) {
    tableHint.textContent = "belum ada tabel";
    return;
  }
  tableHint.textContent = names.join(", ");
  names.forEach((name) => {
    const row = document.createElement("div");
    row.className = "file-item";
    row.innerHTML = `<span>${name}</span>`;
    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = async (ev) => {
      ev.stopPropagation();
      if (
        !confirm(`Hapus tabel "${name}"? Data ini akan hilang dari workspace.`)
      )
        return;
      await conn.query(`DROP TABLE IF EXISTS "${name}"`);
      delete tables[name];
      localStorage.removeItem(STORAGE_KEY_PREFIX + name);
      localStorage.setItem("do_tables", JSON.stringify(tables));
      renderFileList();
    };
    row.appendChild(del);
    row.onclick = () => {
      sqlEl.value = `select * from ${name} limit 100;`;
    };
    fileListEl.appendChild(row);
  });
}

async function runQuery() {
  const sql = sqlEl.value.trim();
  if (!sql) return;
  localStorage.setItem("do_last_sql", sql);
  pushHistory(sql);
  resultArea.innerHTML = "";
  try {
    const arrowResult = await conn.query(sql);
    const rows = arrowResult.toArray().map((r) => r.toJSON());
    rawResult = rows;
    lastResult = rows;
    setupFilter(rows);
    renderTable(rows);
    renderSummaryStats(rows);
    populateChartColumns(rows);
    renderChart();
  } catch (err) {
    resultArea.innerHTML = `<div class="error">${friendlyErrorMessage(err.message)}</div>`;
  }
}

function friendlyErrorMessage(msg) {
  if (/does not exist/i.test(msg) && /Table/i.test(msg)) {
    return `Tabel tidak ditemukan. Cek nama tabel — tabel yang tersedia: ${Object.keys(tables).join(", ") || "(belum ada)"}.`;
  }
  if (/syntax error/i.test(msg)) {
    return `Ada kesalahan penulisan SQL. Periksa kembali query kamu.\n\nDetail teknis: ${msg}`;
  }
  if (/Binder Error/i.test(msg) && /column/i.test(msg)) {
    return `Nama kolom tidak ditemukan di tabel ini. Cek ejaan kolom.\n\nDetail teknis: ${msg}`;
  }
  return msg;
}

function renderTable(rows) {
  if (!rows.length) {
    resultArea.innerHTML =
      '<div class="empty">Query berhasil, tidak ada baris.</div>';
    return;
  }
  const cols = Object.keys(rows[0]);
  let html =
    "<table><thead><tr>" +
    cols.map((c) => `<th>${c}</th>`).join("") +
    "</tr></thead><tbody>";
  for (const row of rows.slice(0, 500)) {
    html +=
      "<tr>" + cols.map((c) => `<td>${row[c] ?? ""}</td>`).join("") + "</tr>";
  }
  html += "</tbody></table>";
  resultArea.innerHTML = html;
}

function renderSummaryStats(rows) {
  const el = document.getElementById("summary-stats");
  if (!rows.length) {
    el.textContent = "";
    return;
  }
  const cols = Object.keys(rows[0]);
  const parts = cols.map((col) => {
    const values = rows.map((r) => r[col]);
    const nonNull = values.filter(
      (v) => v !== null && v !== undefined && v !== "",
    );
    const nullCount = values.length - nonNull.length;
    const numeric = nonNull.map(Number).filter((v) => !isNaN(v));
    if (numeric.length === nonNull.length && numeric.length > 0) {
      const min = Math.min(...numeric).toLocaleString();
      const max = Math.max(...numeric).toLocaleString();
      const avg = (
        numeric.reduce((a, b) => a + b, 0) / numeric.length
      ).toLocaleString(undefined, { maximumFractionDigits: 2 });
      return `${col}: min ${min} · max ${max} · avg ${avg} · null ${nullCount}`;
    }
    return `${col}: ${new Set(nonNull).size} unik · null ${nullCount}`;
  });
  el.innerHTML = parts.map((p) => `<div>${p}</div>`).join("");
}

function setupFilter(rows) {
  const filterControls = document.getElementById("filter-controls");
  const colEl = document.getElementById("filter-col");
  const valEl = document.getElementById("filter-val");
  if (!rows.length) {
    filterControls.style.display = "none";
    return;
  }
  filterControls.style.display = "flex";
  const cols = Object.keys(rows[0]);
  colEl.innerHTML =
    '<option value="">Filter kolom…</option>' +
    cols.map((c) => `<option value="${c}">${c}</option>`).join("");
  colEl.onchange = () => {
    const col = colEl.value;
    if (!col) {
      valEl.innerHTML = "";
      applyFilter();
      return;
    }
    const uniqueVals = [...new Set(rows.map((r) => r[col]))].slice(0, 200);
    valEl.innerHTML =
      '<option value="">Semua nilai</option>' +
      uniqueVals.map((v) => `<option value="${v}">${v}</option>`).join("");
    applyFilter();
  };
  valEl.onchange = applyFilter;
}

function applyFilter() {
  const col = document.getElementById("filter-col").value;
  const val = document.getElementById("filter-val").value;
  if (!col || !val) {
    lastResult = rawResult;
  } else {
    lastResult = rawResult.filter((r) => String(r[col]) === val);
  }
  renderTable(lastResult);
  renderSummaryStats(lastResult);
  populateChartColumns(lastResult);
  renderChart();
}

document.getElementById("filter-clear").addEventListener("click", () => {
  document.getElementById("filter-col").value = "";
  document.getElementById("filter-val").innerHTML = "";
  applyFilter();
});

function populateChartColumns(rows) {
  chartXEl.innerHTML = "";
  chartYEl.innerHTML = "";
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  cols.forEach((c) => {
    chartXEl.innerHTML += `<option value="${c}">${c}</option>`;
    chartYEl.innerHTML += `<option value="${c}">${c}</option>`;
  });
  if (cols.length > 1) chartYEl.value = cols[1];
}

function renderChart() {
  if (!lastResult || !lastResult.length) return;
  const type = chartTypeEl.value;
  const xKey = chartXEl.value,
    yKey = chartYEl.value;
  const labels = lastResult.map((r) => r[xKey]);
  const data = lastResult.map((r) => Number(r[yKey]) || 0);
  if (chartInstance) chartInstance.destroy();
  const ctx = document.getElementById("chart").getContext("2d");
  const cfg = {
    type: type === "scatter" ? "scatter" : type,
    data:
      type === "scatter"
        ? {
            datasets: [
              {
                label: yKey,
                data: lastResult.map((r) => ({
                  x: Number(r[xKey]),
                  y: Number(r[yKey]),
                })),
                backgroundColor: "#4d8cff",
              },
            ],
          }
        : {
            labels,
            datasets: [
              {
                label: yKey,
                data,
                backgroundColor: "#4d8cff",
                borderColor: "#4d8cff",
              },
            ],
          },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#9a9c9f" } } },
      scales:
        type === "pie"
          ? {}
          : {
              x: {
                ticks: { color: "#6b6d70" },
                grid: { color: "#2c2e31" },
              },
              y: {
                ticks: { color: "#6b6d70" },
                grid: { color: "#2c2e31" },
              },
            },
    },
  };
  chartInstance = new Chart(ctx, cfg);
}

runBtn.addEventListener("click", runQuery);
sqlEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runQuery();
});
chartTypeEl.addEventListener("change", renderChart);
chartXEl.addEventListener("change", renderChart);
chartYEl.addEventListener("change", renderChart);

document.getElementById("ai-toggle").addEventListener("click", () => {
  const panel = document.getElementById("ai-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
});

const savedProvider = localStorage.getItem("do_ai_provider");
const savedKey = localStorage.getItem("do_ai_key");
if (savedProvider) document.getElementById("ai-provider").value = savedProvider;
if (savedKey) document.getElementById("ai-key").value = savedKey;
document
  .getElementById("ai-provider")
  .addEventListener("change", (e) =>
    localStorage.setItem("do_ai_provider", e.target.value),
  );
document
  .getElementById("ai-key")
  .addEventListener("input", (e) =>
    localStorage.setItem("do_ai_key", e.target.value),
  );

async function askAI() {
  const provider = document.getElementById("ai-provider").value;
  const key = document.getElementById("ai-key").value.trim();
  const prompt = document.getElementById("ai-prompt").value.trim();
  const statusBox = document.getElementById("ai-status");
  if (!key) {
    statusBox.textContent = "Isi API key dulu.";
    return;
  }
  if (!prompt) return;

  const schema =
    Object.keys(tables)
      .map((t) => `${t}`)
      .join(", ") || "(belum ada tabel)";
  const systemPrompt = `Kamu adalah generator SQL untuk DuckDB. Tabel yang tersedia: ${schema}. Jawab HANYA dengan satu query SQL valid, tanpa penjelasan, tanpa markdown.`;

  statusBox.textContent = "⏳ Meminta AI…";
  document.getElementById("ai-ask").disabled = true;
  try {
    let sql;
    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: `${systemPrompt}\n\nPertanyaan: ${prompt}` }] },
            ],
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Gagal memanggil Gemini");
      sql = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Gagal memanggil Groq");
      sql = data.choices?.[0]?.message?.content;
    }
    sql = sql.replace(/```sql|```/g, "").trim();
    sqlEl.value = sql;
    statusBox.textContent = "Query terisi, cek dulu sebelum dijalankan.";
  } catch (err) {
    statusBox.textContent = `Error: ${err.message}`;
  } finally {
    document.getElementById("ai-ask").disabled = false;
  }
}
document.getElementById("ai-ask").addEventListener("click", askAI);

document.getElementById("template-toggle").addEventListener("click", () => {
  const panel = document.getElementById("template-panel");
  const isOpening = panel.style.display === "none";
  panel.style.display = isOpening ? "block" : "none";
  if (isOpening) populateTemplateTables();
});

function populateTemplateTables() {
  const sel = document.getElementById("template-table");
  sel.innerHTML = Object.keys(tables)
    .map((t) => `<option value="${t}">${t}</option>`)
    .join("");
  sel.onchange = () => renderTemplateList(sel.value);
  if (sel.value) renderTemplateList(sel.value);
}

async function renderTemplateList(tableName) {
  const listEl = document.getElementById("template-list");
  listEl.innerHTML = "Memuat kolom…";
  if (!tableName) {
    listEl.innerHTML = "Belum ada tabel.";
    return;
  }

  const colInfo = await conn.query(`DESCRIBE "${tableName}"`);
  const cols = colInfo.toArray().map((r) => r.toJSON());
  const numericTypes = [
    "INTEGER",
    "BIGINT",
    "DOUBLE",
    "FLOAT",
    "DECIMAL",
    "HUGEINT",
  ];
  const numCols = cols
    .filter((c) => numericTypes.some((t) => c.column_type.includes(t)))
    .map((c) => c.column_name);
  const textCols = cols
    .filter((c) => !numericTypes.some((t) => c.column_type.includes(t)))
    .map((c) => c.column_name);
  const dateCols = cols
    .filter(
      (c) =>
        c.column_type.includes("DATE") || c.column_type.includes("TIMESTAMP"),
    )
    .map((c) => c.column_name);

  const templates = [];
  if (textCols[0] && numCols[0]) {
    templates.push({
      label: `Total ${numCols[0]} per ${textCols[0]}`,
      sql: `select ${textCols[0]}, sum(${numCols[0]}) as total\nfrom ${tableName}\ngroup by ${textCols[0]}\norder by total desc;`,
    });
    templates.push({
      label: `Top 10 baris berdasarkan ${numCols[0]}`,
      sql: `select *\nfrom ${tableName}\norder by ${numCols[0]} desc\nlimit 10;`,
    });
  }
  if (dateCols[0] && numCols[0]) {
    templates.push({
      label: `Tren ${numCols[0]} per bulan (${dateCols[0]})`,
      sql: `select date_trunc('month', ${dateCols[0]}) as bulan, sum(${numCols[0]}) as total\nfrom ${tableName}\ngroup by bulan\norder by bulan;`,
    });
  }
  templates.push({
    label: `Jumlah baris per ${textCols[0] || "kolom pertama"}`,
    sql: `select ${textCols[0] || cols[0].column_name}, count(*) as jumlah\nfrom ${tableName}\ngroup by ${textCols[0] || cols[0].column_name}\norder by jumlah desc;`,
  });

  listEl.innerHTML = "";
  templates.forEach((t) => {
    const btn = document.createElement("button");
    btn.textContent = t.label;
    btn.style.cssText = "text-align:left;font-size:12px;padding:6px 8px;";
    btn.onclick = () => {
      sqlEl.value = t.sql;
    };
    listEl.appendChild(btn);
  });
}

const sidebarEl = document.querySelector(".sidebar");

["dragenter", "dragover"].forEach((evt) => {
  sidebarEl.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    sidebarEl.style.background = "var(--panel2)";
  });
});
["dragleave", "drop"].forEach((evt) => {
  sidebarEl.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    sidebarEl.style.background = "";
  });
});

sidebarEl.addEventListener("drop", async (e) => {
  const files = [...e.dataTransfer.files].filter(
    (f) =>
      f.name.endsWith(".csv") ||
      f.name.endsWith(".json") ||
      f.name.endsWith(".parquet"),
  );
  if (!files.length) {
    statusEl.textContent = "File harus .csv, .json, atau .parquet";
    return;
  }
  for (const file of files) {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > SIZE_WARNING_MB) {
      const proceed = confirm(
        `"${file.name}" berukuran ${sizeMB.toFixed(1)}MB. File besar berisiko gagal disimpan otomatis (localStorage browser terbatas ~5-10MB total). Lanjutkan upload?`,
      );
      if (!proceed) continue;
    }
    const kind = file.name.endsWith(".json")
      ? "json"
      : file.name.endsWith(".parquet")
        ? "parquet"
        : "csv";
    const data =
      kind === "parquet" ? await file.arrayBuffer() : await file.text();
    const tableName = sanitizeTableName(file.name);
    statusEl.textContent = `⏳ Memuat "${file.name}"…`;
    try {
      await loadTableFromText(tableName, file.name, data, kind);
      statusEl.textContent = `✓ tabel "${tableName}" dimuat`;
    } catch (err) {
      statusEl.textContent = "Gagal memuat file";
      console.error(err);
    }
  }
  renderFileList();
});

initDB();
