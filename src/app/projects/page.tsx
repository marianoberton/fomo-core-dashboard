'use client';

import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { DashboardLayout, PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/lib/hooks/use-projects';
import { formatRelativeTime, getStatusBadgeVariant, formatCurrency } from '@/lib/utils';
import { useState } from 'react';

function ProjectCard({ project }: { project: {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: Date;
  dailyBudgetUsd?: number;
}}) {
  const projectAny = project as any;
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-lg">{project.name}</h3>
              <p className="text-sm text-zinc-400">{project.description || 'No description'}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {project.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">Agents</p>
              <p className="text-white font-medium">3</p>
            </div>
            <div>
              <p className="text-zinc-500">Daily Budget</p>
              <p className="text-white font-medium">
                {projectAny.dailyBudgetUsd
                  ? formatCurrency(projectAny.dailyBudgetUsd)
                  : 'Unlimited'}
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-4">
            Created {formatRelativeTime(project.createdAt.toISOString())}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjectSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-4 w-24 mt-4" />
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProjects();
  
  const projects = data?.items ?? [];
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageShell 
        title="Projects"
        description="Manage your AI agent projects"
        actions={
          <Link href="/projects/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        }
      >
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <ProjectSkeleton />
              <ProjectSkeleton />
              <ProjectSkeleton />
            </>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-zinc-400 mb-4">
                {search ? 'No projects match your search' : 'No projects yet'}
              </p>
              {!search && (
                <Link href="/projects/new">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Create your first project
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
