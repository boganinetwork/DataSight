/**
 * QueryHistory Component
 * Displays recent queries with ability to replay them
 */

import { QueryHistory as QueryHistoryType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Play, Trash2 } from 'lucide-react';

interface QueryHistoryProps {
  queries: QueryHistoryType[];
  onSelectQuery: (query: string) => void;
  onDeleteQuery?: (id: string) => void;
}

export default function QueryHistory({
  queries,
  onSelectQuery,
  onDeleteQuery,
}: QueryHistoryProps) {
  if (queries.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No query history yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-3">
        {queries.map(item => (
          <div
            key={item.id}
            className="group flex items-start gap-2 p-2 rounded hover:bg-muted transition-colors"
          >
            <Clock size={14} className="text-muted-foreground flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate font-mono">
                {item.query.substring(0, 60)}...
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onSelectQuery(item.query)}
                className="p-1 hover:bg-accent/20 rounded"
                title="Replay query"
              >
                <Play size={12} />
              </button>
              {onDeleteQuery && (
                <button
                  onClick={() => onDeleteQuery(item.id)}
                  className="p-1 hover:bg-destructive/20 rounded"
                  title="Delete query"
                >
                  <Trash2 size={12} className="text-destructive" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
