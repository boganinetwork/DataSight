import { state } from "./state.js";

const chartTypeEl = document.getElementById("chart-type");
const chartXEl = document.getElementById("chart-x");
const chartYEl = document.getElementById("chart-y");

export function populateChartColumns(rows) {
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

export function renderChart() {
  if (!state.lastResult || !state.lastResult.length) return;
  const type = chartTypeEl.value;
  const xKey = chartXEl.value,
    yKey = chartYEl.value;
  const labels = state.lastResult.map((r) => r[xKey]);
  const data = state.lastResult.map((r) => Number(r[yKey]) || 0);
  if (state.chartInstance) state.chartInstance.destroy();
  const ctx = document.getElementById("chart").getContext("2d");
  state.chartInstance = new Chart(ctx, {
    type: type === "scatter" ? "scatter" : type,
    data:
      type === "scatter"
        ? {
            datasets: [
              {
                label: yKey,
                data: state.lastResult.map((r) => ({
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
              x: { ticks: { color: "#6b6d70" }, grid: { color: "#2c2e31" } },
              y: { ticks: { color: "#6b6d70" }, grid: { color: "#2c2e31" } },
            },
    },
  });
}

export async function renderDashboard() {
  const grid = document.getElementById("dashboard-grid");
  grid.innerHTML = "";
  for (const item of state.dashboardItems) {
    const card = document.createElement("div");
    card.style.cssText =
      "background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:10px;";
    card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <span style="font-size:11px;color:var(--text-muted);font-family:var(--mono);">${item.title}</span>
      <button data-id="${item.id}" class="dash-remove">✕</button></div>
      <canvas id="dash-chart-${item.id}" height="180"></canvas>`;
    grid.appendChild(card);
    card.querySelector(".dash-remove").addEventListener("click", () => {
      state.dashboardItems = state.dashboardItems.filter(
        (d) => d.id !== item.id,
      );
      localStorage.setItem(
        "do_dashboard",
        JSON.stringify(state.dashboardItems),
      );
      renderDashboard();
    });
    try {
      const result = await state.conn.query(item.sql);
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
      card.querySelector("canvas").outerHTML =
        `<div class="error">${err.message}</div>`;
    }
  }
}
