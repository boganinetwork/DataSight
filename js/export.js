import { state, STORAGE_KEY_PREFIX } from "./state.js";
import { loadTableFromText } from "./db.js";
import { renderFileList } from "./ui.js";

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportCSV() {
  if (!state.lastResult || !state.lastResult.length) return;
  const cols = Object.keys(state.lastResult[0]);
  const csv = [cols.join(",")]
    .concat(
      state.lastResult.map((r) =>
        cols.map((c) => JSON.stringify(r[c] ?? "")).join(","),
      ),
    )
    .join("\n");
  downloadBlob(csv, "result.csv", "text/csv");
}

export function exportPNG() {
  if (!state.chartInstance) return;
  const link = document.createElement("a");
  link.download = "chart.png";
  link.href = document.getElementById("chart").toDataURL("image/png");
  link.click();
}

export function saveProject() {
  const sqlEl = document.getElementById("sql");
  const project = { tables: {}, sql: sqlEl.value };
  for (const name of Object.keys(state.tables)) {
    project.tables[name] = {
      meta: state.tables[name],
      content: localStorage.getItem(STORAGE_KEY_PREFIX + name),
    };
  }
  downloadBlob(JSON.stringify(project), "project.json", "application/json");
}

export async function loadProject(file) {
  const sqlEl = document.getElementById("sql");
  const project = JSON.parse(await file.text());
  for (const [name, t] of Object.entries(project.tables)) {
    await loadTableFromText(name, t.meta.filename, t.content, t.meta.kind);
  }
  sqlEl.value = project.sql || "";
  renderFileList();
}
