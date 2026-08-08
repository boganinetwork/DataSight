/**
 * SQLEditor Component
 * Textarea-based SQL query editor with syntax highlighting
 */

import { useState, useRef, useEffect, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface SQLEditorProps {
  onExecute: (query: string) => void;
  isLoading?: boolean;
}

const SQLEditor = forwardRef<HTMLTextAreaElement, SQLEditorProps>(function SQLEditor(
  { onExecute, isLoading = false },
  ref
) {
  const [query, setQuery] = useState('SELECT * FROM table_name LIMIT 10;');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaToUse = (ref as any)?.current || textareaRef.current;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onExecute(query);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [query, onExecute]);

  return (
    <div className="flex flex-col h-full">
      <textarea
        ref={ref || textareaRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter SQL query... (Ctrl+Enter to execute)"
        className="flex-1 p-3 bg-background text-foreground font-mono text-sm resize-none focus:outline-none border-none"
        spellCheck="false"
      />
      
      <div className="px-3 py-2 border-t border-border flex justify-between items-center bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {query.length} characters
        </span>
        <Button
          size="sm"
          onClick={() => onExecute(query)}
          disabled={isLoading || !query.trim()}
          className="gap-1"
        >
          <Play size={14} />
          Execute (Ctrl+Enter)
        </Button>
      </div>
    </div>
  );
});

export default SQLEditor;
