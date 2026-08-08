/**
 * Data Observatory - Main Workspace
 * 3-panel IDE-style layout: sidebar, editor, results
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Play, Trash2, Menu, X, Download, History } from 'lucide-react';
import { toast } from 'sonner';
import { initializeDatabase, createTable, executeQuery, dropTable } from '@/lib/database';
import { parseFile, generateTableName } from '@/lib/fileParser';
import { saveWorkspace, loadWorkspace, saveQueryHistory, loadQueryHistory } from '@/lib/storage';
import { exportResultsToCSV, exportChartAsPNG } from '@/lib/export';
import { Workspace, Table, QueryResult, QueryHistory } from '@/lib/types';
import FileList from '@/components/FileList';
import SQLEditor from '@/components/SQLEditor';
import ResultsTable from '@/components/ResultsTable';
import ChartViewer from '@/components/ChartViewer';
import SideDrawer from '@/components/SideDrawer';

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Initialize database and load workspace on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized');
        setDbReady(true);
        
        // Load or create workspace
        const saved = loadWorkspace('default');
        if (saved) {
          setWorkspace(saved);
          setQueryHistory(loadQueryHistory('default'));
        } else {
          const history = loadQueryHistory('default');
          const newWorkspace: Workspace = {
            id: 'default',
            name: 'Default Workspace',
            tables: [],
            queries: history,
            charts: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setWorkspace(newWorkspace);
          setQueryHistory(history);
          saveWorkspace(newWorkspace);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Init error:', msg);
        toast.error(`Database error: ${msg}`);
        
        // Show UI anyway
        const newWorkspace: Workspace = {
          id: 'default',
          name: 'Default Workspace',
          tables: [],
          queries: [],
          charts: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setWorkspace(newWorkspace);
      }
    };
    
    init();
  }, []);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files) return;

    if (!dbReady) {
      toast.error('Database not ready yet');
      return;
    }

    setIsLoading(true);
    try {
      const newTables: Table[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = await parseFile(file);
        
        if (data.length === 0) {
          toast.error(`${file.name}: No data found`);
          continue;
        }

        const tableName = generateTableName(file.name);
        const table = createTable(tableName, data);
        newTables.push(table);
        toast.success(`Loaded ${file.name} (${data.length} rows)`);
      }

      if (newTables.length > 0) {
        setTables(prev => [...prev, ...newTables]);

        // Save workspace
        if (workspace) {
          const updated = {
            ...workspace,
            tables: [...tables, ...newTables],
            updatedAt: Date.now(),
          };
          setWorkspace(updated);
          saveWorkspace(updated);
        }
      }
    } catch (error) {
      toast.error(`Upload failed: ${(error as Error).message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle query execution
  const handleExecuteQuery = async (sql: string) => {
    if (!sql.trim()) {
      toast.error('Please enter a query');
      return;
    }

    if (!dbReady) {
      toast.error('Database not ready');
      return;
    }

    setIsLoading(true);
    try {
      const result = await executeQuery(sql);
      setQueryResult(result);

      // Save to history
      if (workspace) {
        const historyItem: QueryHistory = {
          id: Date.now().toString(),
          query: sql,
          timestamp: Date.now(),
          result,
        };
        saveQueryHistory(workspace.id, historyItem);
        setQueryHistory(prev => [historyItem, ...prev]);
      }

      toast.success(`Query executed (${result.executionTime.toFixed(2)}ms)`);
    } catch (error) {
      toast.error(`Query error: ${(error as Error).message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle table deletion
  const handleDeleteTable = (tableName: string) => {
    try {
      dropTable(tableName);
      setTables(prev => prev.filter(t => t.name !== tableName));
      toast.success(`Deleted table: ${tableName}`);
    } catch (error) {
      toast.error(`Failed to delete table: ${(error as Error).message}`);
    }
  };

  // Handle query replay
  const handleReplayQuery = (query: string) => {
    if (editorRef.current) {
      editorRef.current.value = query;
      editorRef.current.focus();
      handleExecuteQuery(query);
    }
  };

  // Handle export
  const handleExportResults = () => {
    if (!queryResult) {
      toast.error('No results to export');
      return;
    }
    try {
      exportResultsToCSV(queryResult, `results-${Date.now()}.csv`);
      toast.success('Results exported as CSV');
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    }
  };

  const handleExportChart = async () => {
    if (!queryResult) {
      toast.error('No chart to export');
      return;
    }
    try {
      await exportChartAsPNG('chart-container', `chart-${Date.now()}.png`);
      toast.success('Chart exported as PNG');
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    }
  };

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-muted-foreground">Initializing Data Observatory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-card border-b border-border flex items-center px-4 gap-3 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <h1 className="text-sm font-semibold">Data Observatory</h1>
        
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Query history & info"
          >
            <History size={18} />
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !dbReady}
          >
            <Upload size={16} className="mr-1" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.json,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </header>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        queries={queryHistory}
        onSelectQuery={handleReplayQuery}
      />

      {/* Main Layout */}
      <div className="flex flex-1 pt-12 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-48 bg-card border-r border-border overflow-y-auto flex-shrink-0">
            <FileList
              tables={tables}
              onDeleteTable={handleDeleteTable}
            />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden gap-3 p-3">
          {/* Editor Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">SQL Query</label>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  if (editorRef.current) {
                    handleExecuteQuery(editorRef.current.value);
                  }
                }}
                disabled={isLoading || !dbReady}
              >
                <Play size={14} className="mr-1" />
                Execute
              </Button>
            </div>
            <SQLEditor
              ref={editorRef}
              onExecute={handleExecuteQuery}
              isLoading={isLoading}
            />
          </div>

          {/* Results Panel */}
          <div className="flex-1 flex gap-3 min-h-0">
            {/* Results Table */}
            <div className="flex-1 bg-card border border-border rounded-sm overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Results {queryResult && `(${queryResult.rowCount} rows)`}
                </label>
                {queryResult && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExportResults}
                  >
                    <Download size={14} />
                  </Button>
                )}
              </div>
              <ResultsTable result={queryResult} />
            </div>

            {/* Chart */}
            <div className="flex-1 bg-card border border-border rounded-sm overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Chart</label>
                {queryResult && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExportChart}
                  >
                    <Download size={14} />
                  </Button>
                )}
              </div>
              <div id="chart-container" className="flex-1">
                <ChartViewer result={queryResult} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
