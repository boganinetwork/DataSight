/**
 * LocalStorage Persistence Utilities
 * Auto-save and restore workspace state
 */

import { Workspace, QueryHistory } from './types';

const STORAGE_PREFIX = 'data-observatory:';

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Save workspace to localStorage
 */
export function saveWorkspace(workspace: Workspace): void {
  try {
    const key = getStorageKey(`workspace:${workspace.id}`);
    localStorage.setItem(key, JSON.stringify(workspace));
  } catch (error) {
    console.error('Failed to save workspace:', error);
  }
}

/**
 * Load workspace from localStorage
 */
export function loadWorkspace(workspaceId: string): Workspace | null {
  try {
    const key = getStorageKey(`workspace:${workspaceId}`);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load workspace:', error);
    return null;
  }
}

/**
 * List all saved workspaces
 */
export function listWorkspaces(): string[] {
  const workspaces: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(getStorageKey('workspace:'))) {
      const id = key.replace(getStorageKey('workspace:'), '');
      workspaces.push(id);
    }
  }
  return workspaces;
}

/**
 * Delete workspace from localStorage
 */
export function deleteWorkspace(workspaceId: string): void {
  const key = getStorageKey(`workspace:${workspaceId}`);
  localStorage.removeItem(key);
}

/**
 * Save query to history
 */
export function saveQueryHistory(workspaceId: string, query: QueryHistory): void {
  try {
    const key = getStorageKey(`queries:${workspaceId}`);
    const existing = localStorage.getItem(key);
    const queries: QueryHistory[] = existing ? JSON.parse(existing) : [];
    
    // Keep only last 100 queries
    queries.unshift(query);
    queries.splice(100);
    
    localStorage.setItem(key, JSON.stringify(queries));
  } catch (error) {
    console.error('Failed to save query history:', error);
  }
}

/**
 * Load query history
 */
export function loadQueryHistory(workspaceId: string): QueryHistory[] {
  try {
    const key = getStorageKey(`queries:${workspaceId}`);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load query history:', error);
    return [];
  }
}

/**
 * Clear all data from localStorage
 */
export function clearAllStorage(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
}

/**
 * Export workspace as JSON file
 */
export function exportWorkspaceAsJSON(workspace: Workspace): void {
  const json = JSON.stringify(workspace, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workspace.name}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import workspace from JSON file
 */
export function importWorkspaceFromJSON(file: File): Promise<Workspace> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const workspace = JSON.parse(content) as Workspace;
        resolve(workspace);
      } catch (error) {
        reject(new Error(`Failed to parse workspace file: ${(error as Error).message}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}
