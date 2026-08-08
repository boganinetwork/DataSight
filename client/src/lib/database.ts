/**
 * SQL.js Database Wrapper
 * Client-side SQL execution engine using SQL.js
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import wasmBinary from 'sql.js/dist/sql-wasm.wasm?url';
import { Column, ColumnType, QueryResult, Table } from './types';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export async function initializeDatabase() {
  if (!SQL) {
    try {
      SQL = await initSqlJs({
        locateFile: () => wasmBinary,
      });
    } catch (error) {
      console.error('Failed to load SQL.js:', error);
      throw new Error('Failed to initialize SQL engine');
    }
  }
  if (!db) {
    db = new SQL.Database();
  }
  return db;
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

/**
 * Detect column type from sample values
 */
export function detectColumnType(values: any[]): ColumnType {
  const samples = values.filter(v => v != null).slice(0, 100);
  
  if (samples.length === 0) return 'unknown';
  
  const numericCount = samples.filter(v => !isNaN(Number(v))).length;
  const dateCount = samples.filter(v => !isNaN(Date.parse(String(v)))).length;
  const booleanCount = samples.filter(v => 
    v === true || v === false || v === 'true' || v === 'false' || v === 1 || v === 0
  ).length;
  
  if (numericCount / samples.length > 0.8) return 'numeric';
  if (booleanCount / samples.length > 0.8) return 'boolean';
  if (dateCount / samples.length > 0.8) return 'date';
  
  return 'text';
}

/**
 * Create a table from data
 */
export function createTable(
  tableName: string,
  data: Record<string, any>[],
  columns?: Column[]
): Table {
  if (data.length === 0) {
    throw new Error('Cannot create table from empty data');
  }

  const db = getDatabase();
  const keys = Object.keys(data[0]);
  
  // Detect column types if not provided
  const detectedColumns: Column[] = columns || keys.map(key => ({
    name: key,
    type: detectColumnType(data.map(row => row[key])),
    nullable: data.some(row => row[key] == null),
  }));

  // Build CREATE TABLE statement
  const columnDefs = detectedColumns
    .map(col => {
      let sqlType = 'TEXT';
      if (col.type === 'numeric') sqlType = 'REAL';
      if (col.type === 'boolean') sqlType = 'INTEGER';
      if (col.type === 'date') sqlType = 'TEXT';
      return `"${col.name}" ${sqlType}`;
    })
    .join(', ');

  const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs})`;
  
  try {
    db.run(createTableSQL);
  } catch (e) {
    console.error('Error creating table:', e);
    throw e;
  }

  // Insert data
  const placeholders = keys.map(() => '?').join(', ');
  const insertSQL = `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`;
  
  const stmt = db.prepare(insertSQL);
  for (const row of data) {
    const values = keys.map(key => row[key]);
    stmt.bind(values);
    stmt.step();
    stmt.reset();
  }
  stmt.free();

  return {
    id: tableName,
    name: tableName,
    columns: detectedColumns,
    rowCount: data.length,
    data,
  };
}

/**
 * Execute a SQL query
 */
export async function executeQuery(sql: string): Promise<QueryResult> {
  const db = getDatabase();
  const startTime = performance.now();

  try {
    const stmt = db.prepare(sql);
    const rows: Record<string, any>[] = [];
    const columnNames: string[] = [];

    // Get column names from the first row
    let isFirstRow = true;
    while (stmt.step()) {
      if (isFirstRow) {
        const row = stmt.getAsObject();
        columnNames.push(...Object.keys(row));
        isFirstRow = false;
      }
      rows.push(stmt.getAsObject());
    }

    stmt.free();

    // Detect column types from results
    const columns: Column[] = columnNames.map(name => ({
      name,
      type: detectColumnType(rows.map(r => r[name])),
      nullable: rows.some(r => r[name] == null),
    }));

    const executionTime = performance.now() - startTime;

    return {
      columns,
      rows,
      executionTime,
      rowCount: rows.length,
    };
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

/**
 * List all tables in the database
 */
export function listTables(): string[] {
  const db = getDatabase();
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => row[0] as string);
}

/**
 * Get table schema
 */
export function getTableSchema(tableName: string): Column[] {
  const db = getDatabase();
  const result = db.exec(`PRAGMA table_info("${tableName}")`);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    name: row[1] as string,
    type: (row[2] as string).toLowerCase().includes('int') ? 'numeric' : 'text',
    nullable: !(row[3] as number),
  }));
}

/**
 * Drop a table
 */
export function dropTable(tableName: string): void {
  const db = getDatabase();
  db.run(`DROP TABLE IF EXISTS "${tableName}"`);
}

/**
 * Clear all data (reset database)
 */
export function clearDatabase(): void {
  const db = getDatabase();
  const tables = listTables();
  for (const table of tables) {
    db.run(`DROP TABLE IF EXISTS "${table}"`);
  }
}
