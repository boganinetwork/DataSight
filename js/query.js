import { state } from "./state.js";
import { renderTable, renderSummaryStats, setupFilter } from "./ui.js";
import { populateChartColumns, renderChart } from "./chart.js";

const sqlEl = document.getElementById("sql");
const resultArea = document.getElementById("result-area");
const historyEl = document.getElementById("query-history");

export function renderHistory() {
  historyEl.innerHTML = '<option value="">Riwayat query…</option>';
  state.queryHistory.forEach((q, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = q.length > 50 ? q.slice(0, 50) + "…" : q;
    historyEl.appendChild(opt);
  });
}

function pushHistory(sql) {
  state.queryHistory = state.queryHistory.filter((q) => q !== sql);
  state.queryHistory.unshift(sql);
  state.queryHistory = state.queryHistory.slice(0, 20);
  localStorage.setItem("do_query_history", JSON.stringify(state.queryHistory));
  renderHistory();
}

historyEl.addEventListener("change", () => {
  const idx = historyEl.value;
  if (idx !== "") sqlEl.value = state.queryHistory[idx];
});

export function applyFilter() {
  const col = document.getElementById("filter-col").value;
  const val = document.getElementById("filter-val").value;
  state.lastResult =
    !col || !val
      ? state.rawResult
      : state.rawResult.filter((r) => String(r[col]) === val);
  renderTable(state.lastResult);
  renderSummaryStats(state.lastResult);
  populateChartColumns(state.lastResult);
  renderChart();
}

export async function runQuery() {
  const sql = sqlEl.value.trim();
  if (!sql) return;
  localStorage.setItem("do_last_sql", sql);
  pushHistory(sql);
  resultArea.innerHTML = "";
  try {
    const arrowResult = await state.conn.query(sql);
    const rows = arrowResult.toArray().map((r) => r.toJSON());
    state.rawResult = rows;
    state.lastResult = rows;
    renderTable(rows);
    renderSummaryStats(rows);
    setupFilter(rows, applyFilter);
    populateChartColumns(rows);
    renderChart();
  } catch (err) {
    resultArea.innerHTML = `<div class="error">${err.message}</div>`;
  }
}

document.getElementById("filter-clear").addEventListener("click", () => {
  document.getElementById("filter-col").value = "";
  document.getElementById("filter-val").innerHTML = "";
  applyFilter();
});
