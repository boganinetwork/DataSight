/**
 * File Parser Utilities
 * Parse CSV, JSON, and Excel files into data arrays
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function parseCSV(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results: any) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

export async function parseJSON(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Handle both array and object responses
        const array = Array.isArray(data) ? data : [data];
        
        if (!Array.isArray(array) || array.length === 0) {
          reject(new Error('JSON must contain an array of objects'));
          return;
        }
        
        resolve(array);
      } catch (error) {
        reject(new Error(`JSON parsing error: ${(error as Error).message}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

export async function parseExcel(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('Excel file contains no sheets'));
          return;
        }
        
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
        
        if (!Array.isArray(rows) || rows.length === 0) {
          reject(new Error('Excel sheet is empty'));
          return;
        }
        
        resolve(rows);
      } catch (error) {
        reject(new Error(`Excel parsing error: ${(error as Error).message}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(file: File): Promise<Record<string, any>[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Generate a valid table name from filename
 */
export function generateTableName(filename: string): string {
  // Remove extension
  let name = filename.split('.').slice(0, -1).join('.');
  
  // Replace invalid characters with underscores
  name = name.replace(/[^a-zA-Z0-9_]/g, '_');
  
  // Ensure it starts with a letter or underscore
  if (!/^[a-zA-Z_]/.test(name)) {
    name = '_' + name;
  }
  
  // Limit length
  name = name.substring(0, 64);
  
  return name;
}
