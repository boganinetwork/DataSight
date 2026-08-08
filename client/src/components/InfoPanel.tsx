/**
 * InfoPanel Component
 * Displays privacy info, donation links, and app information
 */

import { Button } from '@/components/ui/button';
import { Heart, Github, ExternalLink } from 'lucide-react';

export default function InfoPanel() {
  return (
    <div className="space-y-4 p-4 text-sm">
      {/* Privacy Statement */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">🔒 Privacy First</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Data Observatory runs 100% in your browser. Your data is never sent to any server.
          All processing happens locally on your device.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">⚙️ Tech Stack</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>SQL Engine:</strong> SQL.js (SQLite in WASM)</li>
          <li>• <strong>Data Parsing:</strong> SheetJS, PapaParse</li>
          <li>• <strong>Visualization:</strong> Recharts, D3.js</li>
          <li>• <strong>Storage:</strong> IndexedDB, localStorage</li>
        </ul>
      </div>

      {/* Support Links */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">💝 Support</h3>
        <div className="flex flex-col gap-2">
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-xs"
          >
            <Heart size={14} />
            Buy Me a Coffee
            <ExternalLink size={12} className="ml-auto" />
          </a>
          <a
            href="https://ko-fi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-xs"
          >
            <Heart size={14} />
            Ko-fi
            <ExternalLink size={12} className="ml-auto" />
          </a>
        </div>
      </div>

      {/* GitHub */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">📖 Open Source</h3>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-xs"
        >
          <Github size={14} />
          View on GitHub
          <ExternalLink size={12} className="ml-auto" />
        </a>
        <p className="text-xs text-muted-foreground">
          Source code is public. Contribute, fork, or self-host!
        </p>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="space-y-2 border-t border-border pt-3">
        <h3 className="font-semibold text-foreground">⌨️ Shortcuts</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Execute Query</span>
            <code className="bg-muted px-2 py-1 rounded">Ctrl+Enter</code>
          </div>
          <div className="flex justify-between">
            <span>Toggle Sidebar</span>
            <code className="bg-muted px-2 py-1 rounded">Ctrl+B</code>
          </div>
        </div>
      </div>

      {/* Version */}
      <div className="text-xs text-muted-foreground text-center border-t border-border pt-3">
        <p>Data Observatory v1.0</p>
        <p>Built for privacy-first data analysis</p>
      </div>
    </div>
  );
}
