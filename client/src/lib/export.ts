/**
 * Export Utilities
 * Export query results and charts to CSV and PNG formats
 */

import { QueryResult } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export query results to CSV
 */
export function exportResultsToCSV(result: QueryResult, filename: string = 'results.csv'): void {
  if (result.rows.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Build CSV header
  const header = result.columns.map(col => `"${col.name}"`).join(',');

  // Build CSV rows
  const rows = result.rows.map(row =>
    result.columns
      .map(col => {
        const value = row[col.name];
        if (value === null || value === undefined) {
          return '';
        }
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export chart as PNG image
 */
export async function exportChartAsPNG(
  elementId: string,
  filename: string = 'chart.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f0f0f', // Dark background
      scale: 2, // Higher resolution
      logging: false,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export chart:', error);
    throw new Error('Failed to export chart as PNG');
  }
}

/**
 * Export chart as PDF
 */
export async function exportChartAsPDF(
  elementId: string,
  filename: string = 'chart.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f0f0f',
      scale: 2,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to export chart as PDF:', error);
    throw new Error('Failed to export chart as PDF');
  }
}
