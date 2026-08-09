import { state } from "./state.js";
import { initDB, loadTableFromText, sanitizeTableName } from "./db.js";
import { renderFileList, setupTheme } from "./ui.js";
import { runQuery, renderHistory } from "./query.js";
import { renderChart, renderDashboard } from "./chart.js";
import { exportCSV, exportPNG, saveProject, loadProject } from "./export.js";

const statusEl = document.getElementById("status");
const runBtn = document.getElementById("run-btn");
const sqlEl = document.getElementById("sql");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const chartTypeEl = document.getElementById("chart-type");
const chartXEl = document.getElementById("chart-x");
const chartYEl = document.getElementById("chart-y");
const dashboardView = document.getElementById("dashboard-view");

setupTheme();

uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async (e) => {
  for (const file of e.target.files) {
    const text = await file.text();
    const kind = file.name.endsWith(".json") ? "json" : "csv";
    const tableName = sanitizeTableName(file.name);
    try {
      await loadTableFromText(tableName, file.name, text, kind);
      statusEl.textContent = `tabel "${tableName}" dimuat`;
    } catch (err) {
      statusEl.textContent = "gagal memuat file";
      console.error(err);
    }
  }
  fileInput.value = "";
  renderFileList();
});

runBtn.addEventListener("click", runQuery);
sqlEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runQuery();
});
chartTypeEl.addEventListener("change", renderChart);
chartXEl.addEventListener("change", renderChart);
chartYEl.addEventListener("change", renderChart);

document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
document.getElementById("export-png-btn").addEventListener("click", exportPNG);
document
  .getElementById("save-project-btn")
  .addEventListener("click", saveProject);
document
  .getElementById("load-project-btn")
  .addEventListener("click", () =>
    document.getElementById("project-input").click(),
  );
document
  .getElementById("project-input")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await loadProject(file);
    e.target.value = "";
  });

document.getElementById("pin-chart-btn").addEventListener("click", () => {
  if (!sqlEl.value.trim()) return;
  state.dashboardItems.push({
    id: Date.now(),
    sql: sqlEl.value.trim(),
    chartType: chartTypeEl.value,
    xKey: chartXEl.value,
    yKey: chartYEl.value,
    title: sqlEl.value.trim().slice(0, 40),
  });
  localStorage.setItem("do_dashboard", JSON.stringify(state.dashboardItems));
  statusEl.textContent = "chart dipin ke dashboard";
});
document.getElementById("dashboard-toggle").addEventListener("click", () => {
  dashboardView.style.display = "block";
  renderDashboard();
});
document.getElementById("dashboard-close").addEventListener("click", () => {
  dashboardView.style.display = "none";
});

initDB(() => {
  statusEl.textContent = "siap";
  runBtn.disabled = false;
  renderFileList();
  renderHistory();
  const savedSql = localStorage.getItem("do_last_sql");
  if (savedSql) sqlEl.value = savedSql;
});
