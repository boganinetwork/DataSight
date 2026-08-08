/**
 * Data Observatory Type Definitions
 * Core types for data processing, SQL execution, and visualization
 */

export type ColumnType = 'numeric' | 'text' | 'date' | 'boolean' | 'unknown';

export interface Column {
  name: string;
  type: ColumnType;
  nullable: boolean;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rowCount: number;
  data: Record<string, any>[];
}

export interface QueryResult {
  columns: Column[];
  rows: Record<string, any>[];
  executionTime: number;
  rowCount: number;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'scatter' | 'pie';
  title: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  color?: string;
}

export interface Workspace {
  id: string;
  name: string;
  tables: Table[];
  queries: QueryHistory[];
  charts: ChartConfig[];
  createdAt: number;
  updatedAt: number;
}

export interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
  result?: QueryResult;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'xlsx' | 'parquet';
  size: number;
  uploadedAt: number;
}
