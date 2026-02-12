'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  MessageSquare, 
  DollarSign, 
  Settings,
  Play,
  Pause,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject, usePauseProject, useResumeProject } from '@/lib/hooks/use-projects';
import { useAgents } from '@/lib/hooks/use-agents';
import { formatCurrency, formatRelativeTime, getStatusBadgeVariant } from '@/lib/utils';

interface Props {
  params: Promise<{ projectId: string }>;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  isLoading,
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-700 rounded-lg">
            <Icon className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">{title}</p>
            {isLoading ? (
              <Skeleton className="h-5 w-12 mt-0.5" />
            ) : (
              <p className="font-semibold text-white">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectDetailPage({ params }: Props) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const { data: agentsData, isLoading: agentsLoading } = useAgents({ projectId });
  const pauseMutation = usePauseProject();
  const resumeMutation = useResumeProject();

  const agents = agentsData?.items ?? [];
  const isActive = project?.status === 'active';
  const isPending = pauseMutation.isPending || resumeMutation.isPending;

  function handleToggleStatus() {
    if (isActive) {
      pauseMutation.mutate(projectId);
    } else {
      resumeMutation.mutate(projectId);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageShell>
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </PageShell>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <PageShell title="Project Not Found">
          <p className="text-zinc-400">The project you're looking for doesn't exist.</p>
        </PageShell>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageShell
        title={project.name}
        description={project.description || 'No description'}
        actions={
          <div className="flex items-center gap-3">
            <Badge 
              variant={getStatusBadgeVariant(project.status)} 
              className="text-sm px-3 py-1"
            >
              {project.status}
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
            <Link href={`/projects/${projectId}/agents/new`}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </Button>
            </Link>
          </div>
        }
      >
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Agents" 
            value={agents.length}
            icon={Bot}
            isLoading={agentsLoading}
          />
          <StatCard 
            title="Active Sessions" 
            value={5}
            icon={MessageSquare}
          />
          <StatCard 
            title="Cost Today" 
            value={formatCurrency(4.50)}
            icon={DollarSign}
          />
          <StatCard 
            title="Cost This Month" 
            value={formatCurrency(125.00)}
            icon={DollarSign}
          />
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="prompts">
              <Link href={`/projects/${projectId}/prompts`}>Prompts</Link>
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link href={`/projects/${projectId}/integrations`}>Integrations</Link>
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Link href={`/projects/${projectId}/tasks`}>Tasks</Link>
            </TabsTrigger>
            <TabsTrigger value="costs">
              <Link href={`/projects/${projectId}/costs`}>Costs</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <PageSection
              title="Agents"
              description="AI agents configured for this project"
              actions={
                <Link href={`/projects/${projectId}/agents/new`}>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agent
                  </Button>
                </Link>
              }
            >
              {agentsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              ) : agents.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="py-12 text-center">
                    <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No agents yet
                    </h3>
                    <p className="text-zinc-400 mb-4">
                      Create your first agent to start building
                    </p>
                    <Link href={`/projects/${projectId}/agents/new`}>
                      <Button className="bg-violet-600 hover:bg-violet-700">
                        Create Agent
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <Link 
                      key={agent.id} 
                      href={`/projects/${projectId}/agents/${agent.id}`}
                    >
                      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-zinc-800 rounded-lg">
                              <Bot className="w-5 h-5 text-violet-400" />
                            </div>
                            <Badge variant={getStatusBadgeVariant(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-white mb-1">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                            {agent.description || 'No description'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">{(agent as any).model || 'N/A'}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-violet-400 p-0 h-auto"
                            >
                              Test <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </PageSection>
          </TabsContent>
        </Tabs>
      </PageShell>
    </DashboardLayout>
  );
}
