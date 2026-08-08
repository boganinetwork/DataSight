/**
 * ResultsTable Component
 * Displays query results in a scrollable table
 */

import { QueryResult } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultsTableProps {
  result: QueryResult | null;
}

export default function ResultsTable({ result }: ResultsTableProps) {
  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Execute a query to see results
        </p>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Query returned no results
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-muted/50 border-b border-border">
            <tr>
              {result.columns.map(col => (
                <th
                  key={col.name}
                  className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap border-r border-border last:border-r-0"
                >
                  <div className="flex items-center gap-1">
                    <span>{col.name}</span>
                    <span className="text-[10px] opacity-60">
                      {col.type === 'numeric' && '№'}
                      {col.type === 'text' && 'T'}
                      {col.type === 'date' && '📅'}
                      {col.type === 'boolean' && '✓'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                {result.columns.map(col => (
                  <td
                    key={`${rowIdx}-${col.name}`}
                    className="px-3 py-2 text-foreground font-mono border-r border-border last:border-r-0 whitespace-nowrap overflow-hidden text-ellipsis"
                    title={String(row[col.name])}
                  >
                    {row[col.name] === null ? (
                      <span className="text-muted-foreground italic">null</span>
                    ) : (
                      String(row[col.name])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
