import { state, STORAGE_KEY_PREFIX } from "./state.js";

const fileListEl = document.getElementById("file-list");
const tableHint = document.getElementById("table-hint");
const sqlEl = document.getElementById("sql");
const resultArea = document.getElementById("result-area");
const summaryEl = document.getElementById("summary-stats");

export function renderFileList() {
  fileListEl.innerHTML = "";
  const names = Object.keys(state.tables);
  tableHint.textContent = names.length ? names.join(", ") : "belum ada tabel";
  names.forEach((name) => {
    const row = document.createElement("div");
    row.className = "file-item";
    row.innerHTML = `<span>${name}</span>`;
    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = async (ev) => {
      ev.stopPropagation();
      await state.conn.query(`DROP TABLE IF EXISTS "${name}"`);
      delete state.tables[name];
      localStorage.removeItem(STORAGE_KEY_PREFIX + name);
      localStorage.setItem("do_tables", JSON.stringify(state.tables));
      renderFileList();
    };
    row.appendChild(del);
    row.onclick = () => {
      sqlEl.value = `select * from ${name} limit 100;`;
    };
    fileListEl.appendChild(row);
  });
}

export function renderTable(rows) {
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

export function renderSummaryStats(rows) {
  if (!rows.length) {
    summaryEl.textContent = "";
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
  summaryEl.innerHTML = parts.map((p) => `<div>${p}</div>`).join("");
}

export function setupFilter(rows, onFilterChange) {
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
      onFilterChange();
      return;
    }
    const uniqueVals = [...new Set(rows.map((r) => r[col]))].slice(0, 200);
    valEl.innerHTML =
      '<option value="">Semua nilai</option>' +
      uniqueVals.map((v) => `<option value="${v}">${v}</option>`).join("");
    onFilterChange();
  };
  valEl.onchange = onFilterChange;
}

export function setupTheme() {
  const el = document.getElementById("theme-accent");
  const savedAccent = localStorage.getItem("do_accent");
  if (savedAccent) {
    document.documentElement.style.setProperty("--accent", savedAccent);
    el.value = savedAccent;
  }
  el.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--accent", e.target.value);
    localStorage.setItem("do_accent", e.target.value);
  });
}
