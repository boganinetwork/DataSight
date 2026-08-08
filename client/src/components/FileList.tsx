/**
 * FileList Component
 * Displays list of uploaded tables in the sidebar
 */

import { Table } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Database } from 'lucide-react';

interface FileListProps {
  tables: Table[];
  onDeleteTable: (tableName: string) => void;
}

export default function FileList({ tables, onDeleteTable }: FileListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Tables
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tables.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No tables loaded.
              <br />
              Upload a CSV, JSON, or Excel file to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {tables.map(table => (
              <div
                key={table.id}
                className="group flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Database size={14} className="text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{table.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {table.rowCount} rows • {table.columns.length} cols
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTable(table.name)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                  title="Delete table"
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Quick Tip:</p>
        <p>Query tables by name:</p>
        <code className="block bg-muted p-1 rounded text-accent font-mono text-[10px]">
          SELECT * FROM table_name
        </code>
      </div>
    </div>
  );
}
