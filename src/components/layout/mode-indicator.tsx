'use client';

import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ModeIndicator() {
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  if (!isMockMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant="outline"
        className="bg-amber-500/10 border-amber-500/50 text-amber-400 px-3 py-2 shadow-lg"
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Mock Data Mode
      </Badge>
    </div>
  );
}
