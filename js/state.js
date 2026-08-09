export const state = {
  db: null,
  conn: null,
  tables: JSON.parse(localStorage.getItem("do_tables") || "{}"),
  lastResult: null,
  rawResult: null,
  chartInstance: null,
  queryHistory: JSON.parse(localStorage.getItem("do_query_history") || "[]"),
  dashboardItems: JSON.parse(localStorage.getItem("do_dashboard") || "[]"),
};
export const STORAGE_KEY_PREFIX = "do_file_";
