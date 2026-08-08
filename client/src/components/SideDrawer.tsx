/**
 * SideDrawer Component
 * Collapsible drawer for query history and info
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import QueryHistory from './QueryHistory';
import InfoPanel from './InfoPanel';
import { QueryHistory as QueryHistoryType } from '@/lib/types';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queries: QueryHistoryType[];
  onSelectQuery: (query: string) => void;
}

export default function SideDrawer({
  isOpen,
  onClose,
  queries,
  onSelectQuery,
}: SideDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold">Query History & Info</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <Tabs defaultValue="history" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full rounded-none border-b border-border">
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
            <TabsTrigger value="info" className="flex-1">
              Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="flex-1 overflow-hidden">
            <QueryHistory
              queries={queries}
              onSelectQuery={(query) => {
                onSelectQuery(query);
                onClose();
              }}
            />
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full">
              <InfoPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
