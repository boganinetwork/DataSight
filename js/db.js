import * as duckdb from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/+esm";
import { state, STORAGE_KEY_PREFIX } from "./state.js";

export async function initDB(onReady) {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: "text/javascript",
    }),
  );
  const worker = new Worker(workerUrl);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  state.db = new duckdb.AsyncDuckDB(logger, worker);
  await state.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);
  state.conn = await state.db.connect();

  for (const [name, meta] of Object.entries(state.tables)) {
    const content = localStorage.getItem(STORAGE_KEY_PREFIX + name);
    if (content) {
      await loadTableFromText(name, meta.filename, content, meta.kind, false);
    }
  }
  onReady();
}

export async function loadTableFromText(
  tableName,
  filename,
  text,
  kind,
  persist = true,
) {
  await state.db.registerFileText(filename, text);
  const readFn = kind === "json" ? "read_json_auto" : "read_csv_auto";
  await state.conn.query(`DROP TABLE IF EXISTS "${tableName}"`);
  await state.conn.query(
    `CREATE TABLE "${tableName}" AS SELECT * FROM ${readFn}('${filename}')`,
  );
  state.tables[tableName] = { filename, kind };
  if (persist) {
    localStorage.setItem(STORAGE_KEY_PREFIX + tableName, text);
    localStorage.setItem("do_tables", JSON.stringify(state.tables));
  }
}

export function sanitizeTableName(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();
}
