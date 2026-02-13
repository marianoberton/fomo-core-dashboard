'use client';

import { useState } from 'react';
import { X, CheckCircle2, FolderKanban, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function GettingStarted() {
  const [dismissed, setDismissed] = useState(
    typeof window !== 'undefined' &&
    localStorage.getItem('dismissed_getting_started') === 'true'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('dismissed_getting_started', 'true');
    setDismissed(true);
  };

  return (
    <Card className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border-violet-500/20 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-violet-400" />
              Welcome to FOMO Core Dashboard
            </h3>
            <p className="text-sm text-zinc-300 mb-4">
              Get started by creating your first project or exploring the interface
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/projects/new">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                  <FolderKanban className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </Link>
              <Link href="/settings">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  View Settings
                </Button>
              </Link>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
