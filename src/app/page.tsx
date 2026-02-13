'use client';

import Link from 'next/link';
import { 
  FolderKanban, 
  Bot, 
  MessageSquare, 
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GettingStarted } from '@/components/dashboard/getting-started';
import { useProjects } from '@/lib/hooks/use-projects';
import { usePendingApprovals } from '@/lib/hooks/use-approvals';
import { useDashboardOverview } from '@/lib/hooks/use-costs';
import { formatCurrency, formatRelativeTime, getStatusBadgeVariant } from '@/lib/utils';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  isLoading,
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
            )}
            {trend && (
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg">
            <Icon className="w-6 h-6 text-violet-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalCard({
  approval
}: {
  approval: {
    id: string;
    toolId: string;
    toolInput: unknown;
    projectId: string;
    createdAt: Date;
  }
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-white">{approval.toolId}</p>
          <p className="text-sm text-zinc-400">
            {formatRelativeTime(approval.createdAt.toISOString())}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10">
          <CheckCircle2 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
          <XCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: approvalsData, isLoading: approvalsLoading } = usePendingApprovals();
  const { data: overviewData, isLoading: overviewLoading } = useDashboardOverview();

  const projectsCount = projectsData?.items?.length ?? 0;
  const activeProjects = projectsData?.items?.filter(p => p.status === 'active').length ?? 0;
  const pendingApprovals = approvalsData?.items ?? [];

  // Get stats from API - fallback to 0 if not available
  const totalAgents = overviewData?.activeAgentsCount ?? 0;
  const activeSessions = overviewData?.activeSessionsCount ?? 0;
  const todayCost = overviewData?.todayCostUsd ?? 0;

  return (
    <DashboardLayout>
      <PageShell
        title="Dashboard"
        description="Overview of your FOMO Core instance"
      >
        <GettingStarted />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Projects" 
            value={projectsCount}
            icon={FolderKanban}
            trend={`${activeProjects} active`}
            isLoading={projectsLoading}
          />
          <StatCard
            title="Agents"
            value={totalAgents}
            icon={Bot}
            trend="All healthy"
            isLoading={overviewLoading}
          />
          <StatCard
            title="Active Sessions"
            value={activeSessions}
            icon={MessageSquare}
            isLoading={overviewLoading}
          />
          <StatCard
            title="Cost Today"
            value={formatCurrency(todayCost)}
            icon={DollarSign}
            trend="+12% from yesterday"
            isLoading={overviewLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <PageSection 
            title="Pending Approvals"
            actions={
              <Link href="/approvals">
                <Button variant="ghost" size="sm" className="text-zinc-400">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 space-y-3">
                {approvalsLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : pendingApprovals.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-zinc-400">No pending approvals</p>
                  </div>
                ) : (
                  pendingApprovals.slice(0, 5).map((approval) => (
                    <ApprovalCard key={approval.id} approval={approval} />
                  ))
                )}
              </CardContent>
            </Card>
          </PageSection>

          {/* Recent Projects */}
          <PageSection 
            title="Projects"
            actions={
              <Link href="/projects/new">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                  New Project
                </Button>
              </Link>
            }
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 space-y-3">
                {projectsLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : projectsData?.items?.length === 0 ? (
                  <div className="py-8 text-center">
                    <FolderKanban className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-400 mb-3">No projects yet</p>
                    <Link href="/projects/new">
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                        Create your first project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  projectsData?.items?.slice(0, 5).map((project) => (
                    <Link 
                      key={project.id} 
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-zinc-400">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </PageSection>
        </div>

        {/* Cost Chart Placeholder */}
        <PageSection 
          title="Cost Overview" 
          description="Last 7 days"
          className="mt-6"
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-zinc-600" />
                  <p>Cost chart coming soon</p>
                  <p className="text-sm text-zinc-600 mt-1">
                    Connect to FOMO Core API to see usage data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </PageShell>
    </DashboardLayout>
  );
}
