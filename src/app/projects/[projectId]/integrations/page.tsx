'use client';

import { use, useState } from 'react';
import { 
  Key, 
  Server, 
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Plug,
} from 'lucide-react';
import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, maskSecret } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  params: Promise<{ projectId: string }>;
}

// Mock data - will come from API
const mockCredentials = [
  { key: 'WHATSAPP_TOKEN', maskedValue: '••••••••abcd', createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-10T10:00:00Z' },
  { key: 'HUBSPOT_API_KEY', maskedValue: '••••••••ef12', createdAt: '2026-02-09T15:30:00Z', updatedAt: '2026-02-09T15:30:00Z' },
  { key: 'CATALOG_API_URL', maskedValue: 'https://api...', createdAt: '2026-02-08T09:00:00Z', updatedAt: '2026-02-08T09:00:00Z' },
];

interface McpServerData {
  id: string;
  name: string;
  type: 'stdio' | 'http';
  command?: string;
  url?: string;
  enabled: boolean;
  status: string;
}

const mockMcpServers: McpServerData[] = [
  { id: '1', name: 'google-calendar', type: 'stdio', command: 'npx @anthropic/mcp-google-calendar', enabled: true, status: 'connected' },
  { id: '2', name: 'gmail', type: 'stdio', command: 'npx @anthropic/mcp-gmail', enabled: true, status: 'connected' },
  { id: '3', name: 'custom-crm', type: 'http', url: 'http://localhost:8080', enabled: false, status: 'disconnected' },
];

const mockChannels = [
  { id: '1', type: 'whatsapp', name: 'WhatsApp Business', enabled: true, status: 'connected', config: { phone: '+54 11 xxxx-xxxx' } },
  { id: '2', type: 'telegram', name: 'Telegram Bot', enabled: false, status: 'disconnected', config: {} },
  { id: '3', type: 'slack', name: 'Slack', enabled: false, status: 'disconnected', config: {} },
  { id: '4', type: 'email', name: 'Email', enabled: false, status: 'disconnected', config: {} },
];

function CredentialRow({ 
  credential,
  onDelete,
}: { 
  credential: typeof mockCredentials[0];
  onDelete: () => void;
}) {
  const [showValue, setShowValue] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-zinc-700 rounded-lg">
          <Key className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="font-mono text-white">{credential.key}</p>
          <p className="text-sm text-zinc-400 font-mono">
            {showValue ? 'value-would-be-here' : credential.maskedValue}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowValue(!showValue)}
          className="text-zinc-400 hover:text-white"
        >
          {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-zinc-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function McpServerRow({ 
  server,
  onToggle,
  onRestart,
  onDelete,
}: { 
  server: McpServerData;
  onToggle: () => void;
  onRestart: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-3 h-3 rounded-full',
          server.status === 'connected' && 'bg-emerald-400',
          server.status === 'disconnected' && 'bg-zinc-400',
          server.status === 'error' && 'bg-red-400'
        )} />
        <div>
          <p className="font-medium text-white">{server.name}</p>
          <p className="text-sm text-zinc-400 font-mono">
            {server.type === 'stdio' ? server.command : server.url}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {server.type}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRestart}
          className="text-zinc-400 hover:text-white"
          title="Restart"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-zinc-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ChannelRow({ 
  channel,
  onConfigure,
  onTest,
}: { 
  channel: typeof mockChannels[0];
  onConfigure: () => void;
  onTest: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-3 h-3 rounded-full',
          channel.status === 'connected' && 'bg-emerald-400',
          channel.status === 'disconnected' && 'bg-zinc-400',
          channel.status === 'error' && 'bg-red-400'
        )} />
        <div>
          <p className="font-medium text-white">{channel.name}</p>
          <p className="text-sm text-zinc-400">
            {channel.enabled 
              ? (channel.config.phone || 'Connected') 
              : 'Not connected'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {channel.enabled ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onTest}
              className="border-zinc-700"
            >
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigure}
              className="border-zinc-700"
            >
              Configure
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={onConfigure}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}

function AddCredentialDialog({ onAdd }: { onAdd: (key: string, value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  function handleSubmit() {
    if (!key.trim() || !value.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    onAdd(key.trim(), value.trim());
    setKey('');
    setValue('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Credential
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Add Credential</DialogTitle>
          <DialogDescription>
            Store a secret that agents can access at runtime.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              placeholder="e.g., API_KEY"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="mt-1 bg-zinc-800 border-zinc-700 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="password"
              placeholder="Secret value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMcpServerDialog({ onAdd }: { onAdd: (name: string, type: string, commandOrUrl: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('stdio');
  const [commandOrUrl, setCommandOrUrl] = useState('');

  function handleSubmit() {
    if (!name.trim() || !commandOrUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    onAdd(name.trim(), type, commandOrUrl.trim());
    setName('');
    setType('stdio');
    setCommandOrUrl('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Add MCP Server
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Add MCP Server</DialogTitle>
          <DialogDescription>
            Connect an MCP server to provide tools to your agents.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., google-calendar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">stdio (command)</SelectItem>
                <SelectItem value="http">HTTP (URL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="commandOrUrl">
              {type === 'stdio' ? 'Command' : 'URL'}
            </Label>
            <Input
              id="commandOrUrl"
              placeholder={type === 'stdio' ? 'npx @anthropic/mcp-...' : 'http://localhost:8080'}
              value={commandOrUrl}
              onChange={(e) => setCommandOrUrl(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700 font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IntegrationsPage({ params }: Props) {
  const { projectId } = use(params);
  const [credentials, setCredentials] = useState(mockCredentials);
  const [mcpServers, setMcpServers] = useState(mockMcpServers);
  const [channels, setChannels] = useState(mockChannels);

  function handleAddCredential(key: string, value: string) {
    // TODO: Call API
    setCredentials([...credentials, {
      key,
      maskedValue: maskSecret(value),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]);
    toast.success('Credential added');
  }

  function handleDeleteCredential(key: string) {
    // TODO: Call API
    setCredentials(credentials.filter(c => c.key !== key));
    toast.success('Credential deleted');
  }

  function handleAddMcpServer(name: string, type: string, commandOrUrl: string) {
    // TODO: Call API
    setMcpServers([...mcpServers, {
      id: Date.now().toString(),
      name,
      type: type as 'stdio' | 'http',
      command: type === 'stdio' ? commandOrUrl : undefined,
      url: type === 'http' ? commandOrUrl : undefined,
      enabled: true,
      status: 'disconnected',
    }]);
    toast.success('MCP server added');
  }

  return (
    <DashboardLayout>
      <PageShell
        title="Integrations"
        description="Manage credentials, MCP servers, and channels"
      >
        <Tabs defaultValue="credentials">
          <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
            <TabsTrigger value="credentials">
              <Key className="w-4 h-4 mr-2" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="mcp">
              <Server className="w-4 h-4 mr-2" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="channels">
              <MessageSquare className="w-4 h-4 mr-2" />
              Channels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            <PageSection
              title="Credentials"
              description="Secrets available to agents at runtime"
              actions={<AddCredentialDialog onAdd={handleAddCredential} />}
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  {credentials.length === 0 ? (
                    <div className="py-8 text-center">
                      <Key className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-400">No credentials configured</p>
                    </div>
                  ) : (
                    credentials.map((cred) => (
                      <CredentialRow
                        key={cred.key}
                        credential={cred}
                        onDelete={() => handleDeleteCredential(cred.key)}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </PageSection>
          </TabsContent>

          <TabsContent value="mcp">
            <PageSection
              title="MCP Servers"
              description="External tool providers for your agents"
              actions={<AddMcpServerDialog onAdd={handleAddMcpServer} />}
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  {mcpServers.length === 0 ? (
                    <div className="py-8 text-center">
                      <Server className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-400">No MCP servers configured</p>
                    </div>
                  ) : (
                    mcpServers.map((server) => (
                      <McpServerRow
                        key={server.id}
                        server={server}
                        onToggle={() => toast.info('Toggle not implemented')}
                        onRestart={() => toast.info('Restart not implemented')}
                        onDelete={() => {
                          setMcpServers(mcpServers.filter(s => s.id !== server.id));
                          toast.success('MCP server removed');
                        }}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </PageSection>
          </TabsContent>

          <TabsContent value="channels">
            <PageSection
              title="Channels"
              description="Communication channels for your agents"
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  {channels.map((channel) => (
                    <ChannelRow
                      key={channel.id}
                      channel={channel}
                      onConfigure={() => toast.info('Configure dialog not implemented')}
                      onTest={() => toast.info('Test not implemented')}
                    />
                  ))}
                </CardContent>
              </Card>
            </PageSection>
          </TabsContent>
        </Tabs>
      </PageShell>
    </DashboardLayout>
  );
}
