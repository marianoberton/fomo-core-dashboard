'use client';

import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/use-auth';
import { AlertCircle, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { logout } = useAuth();
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  return (
    <DashboardLayout>
      <PageShell
        title="Settings"
        description="Configure your FOMO Core dashboard"
      >
        {/* API Configuration */}
        <PageSection title="API Configuration">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label>API Base URL</Label>
                <Input
                  value={process.env.NEXT_PUBLIC_FOMO_API_URL || 'Not configured'}
                  disabled
                  className="font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Configure in .env.local file
                </p>
              </div>
              <div>
                <Label>WebSocket URL</Label>
                <Input
                  value={process.env.NEXT_PUBLIC_FOMO_WS_URL || 'Not configured'}
                  disabled
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Development Mode */}
        <PageSection title="Development">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Label>Mock Data Mode</Label>
                    {isMockMode && (
                      <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">
                    Use mock data instead of real API calls
                  </p>
                </div>
                <Switch
                  checked={isMockMode}
                  disabled
                />
              </div>
              <div className="mt-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-400">
                  To change mock mode, update <code className="text-violet-400">NEXT_PUBLIC_USE_MOCKS</code> in .env.local and restart the dev server
                </p>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Account */}
        <PageSection title="Account">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-zinc-400">
                Sign out to clear your session and return to login
              </p>
              <Button
                variant="destructive"
                onClick={logout}
                className="w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </PageSection>

        {/* System Info */}
        <PageSection title="System Information">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-zinc-400">Dashboard Version</dt>
                  <dd className="text-white font-mono">1.0.0-beta</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">Environment</dt>
                  <dd className="text-white font-mono">
                    {process.env.NODE_ENV}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-400">Data Source</dt>
                  <dd className="text-white">
                    {isMockMode ? 'Mock Data' : 'Live API'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </PageSection>
      </PageShell>
    </DashboardLayout>
  );
}
