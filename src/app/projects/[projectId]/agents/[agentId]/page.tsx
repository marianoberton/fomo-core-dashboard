'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Settings,
  Play,
  Pause,
  Save,
  Loader2,
  Activity,
} from 'lucide-react';
import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useAgent, 
  useUpdateAgent, 
  usePauseAgent, 
  useResumeAgent 
} from '@/lib/hooks/use-agents';
import { getStatusBadgeVariant } from '@/lib/utils';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface Props {
  params: Promise<{ projectId: string; agentId: string }>;
}

const models = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
];

export default function AgentDetailPage({ params }: Props) {
  const { projectId, agentId } = use(params);
  const { data: agent, isLoading } = useAgent(projectId, agentId);
  const updateMutation = useUpdateAgent(projectId, agentId);
  const pauseMutation = usePauseAgent(projectId);
  const resumeMutation = useResumeAgent(projectId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: '',
    temperature: 0.7,
    maxTokens: 4096,
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description || '',
        model: agent.model,
        temperature: agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 4096,
      });
    }
  }, [agent]);

  const isActive = agent?.status === 'active';
  const isPending = pauseMutation.isPending || resumeMutation.isPending;

  function handleToggleStatus() {
    if (isActive) {
      pauseMutation.mutate(agentId, {
        onSuccess: () => toast.success('Agent paused'),
        onError: () => toast.error('Failed to pause agent'),
      });
    } else {
      resumeMutation.mutate(agentId, {
        onSuccess: () => toast.success('Agent resumed'),
        onError: () => toast.error('Failed to resume agent'),
      });
    }
  }

  function handleSave() {
    updateMutation.mutate(formData, {
      onSuccess: () => toast.success('Agent updated'),
      onError: () => toast.error('Failed to update agent'),
    });
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageShell>
          <Skeleton className="h-[600px]" />
        </PageShell>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <PageShell title="Agent Not Found">
          <p className="text-zinc-400">The agent you're looking for doesn't exist.</p>
        </PageShell>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageShell
        title={agent.name}
        description="Configure agent settings"
        actions={
          <div className="flex items-center gap-3">
            <Badge 
              variant={getStatusBadgeVariant(agent.status)} 
              className="text-sm px-3 py-1"
            >
              {agent.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={isPending}
              className="border-zinc-700"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Link href={`/projects/${projectId}/agents/${agentId}/chat`}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Chat
              </Button>
            </Link>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <PageSection title="Configuration">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 bg-zinc-800 border-zinc-700"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select 
                      value={formData.model}
                      onValueChange={(value) => setFormData({ ...formData, model: value })}
                    >
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          temperature: parseFloat(e.target.value) 
                        })}
                        className="mt-1 bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="1"
                        value={formData.maxTokens}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxTokens: parseInt(e.target.value) 
                        })}
                        className="mt-1 bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <PageSection title="Quick Actions">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-2">
                  <Link href={`/projects/${projectId}/agents/${agentId}/chat`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Test Chat
                    </Button>
                  </Link>
                  <Link href={`/projects/${projectId}/agents/${agentId}/logs`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                  </Link>
                  <Link href={`/projects/${projectId}/prompts`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Prompts
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </PageSection>

            <PageSection title="Stats (Last 24h)">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Sessions</span>
                    <span className="text-white font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Messages</span>
                    <span className="text-white font-medium">48</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tool Calls</span>
                    <span className="text-white font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cost</span>
                    <span className="text-white font-medium">$2.40</span>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
