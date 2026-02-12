'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter,
  RefreshCw,
  Mail,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { DashboardLayout, PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useApprovals,
  useApproveApproval,
  useDenyApproval,
} from '@/lib/hooks/use-approvals';
import { formatRelativeTime, cn } from '@/lib/utils';
import { toast } from 'sonner';

// Tool icons mapping
const toolIcons: Record<string, React.ElementType> = {
  'send-email': Mail,
  'schedule-meeting': Calendar,
  'send-message': MessageSquare,
};

function getToolIcon(toolId: string) {
  return toolIcons[toolId] || MessageSquare;
}

function ApprovalCard({
  approval,
  onApprove,
  onDeny,
  isPending,
}: {
  approval: {
    id: string;
    toolId: string;
    toolInput: unknown;
    projectId: string;
    status: string;
    createdAt: Date;
  };
  onApprove: () => void;
  onDeny: () => void;
  isPending: boolean;
}) {
  const Icon = getToolIcon(approval.toolId);
  const actionPreview = typeof approval.toolInput === 'object' && approval.toolInput !== null
    ? JSON.stringify(approval.toolInput, null, 2).slice(0, 200)
    : String(approval.toolInput);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Icon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{approval.toolId}</h3>
              <p className="text-sm text-zinc-400">
                Pending approval • {formatRelativeTime(approval.createdAt.toISOString())}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        </div>

        {/* Action Preview */}
        <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <pre className="whitespace-pre-wrap">{actionPreview}</pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onDeny}
            disabled={isPending}
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Deny
          </Button>
          <Button
            onClick={onApprove}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const { data, isLoading, refetch, isRefetching } = useApprovals({ 
    status: statusFilter as 'pending' | 'approved' | 'denied' | 'expired' | undefined,
  });
  const approveMutation = useApproveApproval();
  const denyMutation = useDenyApproval();

  const approvals = data?.items ?? [];

  function handleApprove(approvalId: string) {
    approveMutation.mutate({ approvalId }, {
      onSuccess: () => {
        toast.success('Approval granted');
      },
      onError: () => {
        toast.error('Failed to approve');
      },
    });
  }

  function handleDeny(approvalId: string) {
    denyMutation.mutate({ approvalId }, {
      onSuccess: () => {
        toast.success('Approval denied');
      },
      onError: () => {
        toast.error('Failed to deny');
      },
    });
  }

  return (
    <DashboardLayout>
      <PageShell
        title="Approvals"
        description="Review and approve pending agent actions"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-zinc-700"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} />
            Refresh
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
              <Filter className="w-4 h-4 mr-2 text-zinc-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          <p className="text-sm text-zinc-400">
            {approvals.length} {statusFilter} approval{approvals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </>
          ) : approvals.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {statusFilter === 'pending' ? 'All caught up!' : 'No approvals found'}
                </h3>
                <p className="text-zinc-400">
                  {statusFilter === 'pending' 
                    ? 'No pending approvals at the moment'
                    : `No ${statusFilter} approvals to show`}
                </p>
              </CardContent>
            </Card>
          ) : (
            approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={() => handleApprove(approval.id)}
                onDeny={() => handleDeny(approval.id)}
                isPending={approveMutation.isPending || denyMutation.isPending}
              />
            ))
          )}
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
