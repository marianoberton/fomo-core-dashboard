'use client';

import { use, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatCompact, cn } from '@/lib/utils';

interface Props {
  params: Promise<{ projectId: string }>;
}

// Mock data
const dailyCostData = [
  { date: 'Mon', cost: 8.50, sessions: 45 },
  { date: 'Tue', cost: 12.30, sessions: 62 },
  { date: 'Wed', cost: 9.80, sessions: 51 },
  { date: 'Thu', cost: 15.20, sessions: 78 },
  { date: 'Fri', cost: 11.40, sessions: 58 },
  { date: 'Sat', cost: 6.20, sessions: 32 },
  { date: 'Sun', cost: 4.80, sessions: 25 },
];

const agentCostData = [
  { name: 'sales-agent', cost: 45.20, sessions: 234, tokensIn: 125000, tokensOut: 89000 },
  { name: 'support-agent', cost: 28.50, sessions: 156, tokensIn: 78000, tokensOut: 52000 },
  { name: 'ops-agent', cost: 12.30, sessions: 67, tokensIn: 34000, tokensOut: 21000 },
];

const usageHistory = [
  { date: '2026-02-10', agent: 'sales-agent', sessions: 45, tokensIn: 12500, tokensOut: 8900, cost: 4.50 },
  { date: '2026-02-10', agent: 'support-agent', sessions: 32, tokensIn: 8700, tokensOut: 5200, cost: 2.80 },
  { date: '2026-02-09', agent: 'sales-agent', sessions: 52, tokensIn: 14200, tokensOut: 10100, cost: 5.20 },
  { date: '2026-02-09', agent: 'support-agent', sessions: 28, tokensIn: 7500, tokensOut: 4800, cost: 2.40 },
  { date: '2026-02-09', agent: 'ops-agent', sessions: 15, tokensIn: 4200, tokensOut: 2800, cost: 1.20 },
  { date: '2026-02-08', agent: 'sales-agent', sessions: 48, tokensIn: 13100, tokensOut: 9200, cost: 4.80 },
  { date: '2026-02-08', agent: 'support-agent', sessions: 35, tokensIn: 9200, tokensOut: 5800, cost: 3.00 },
];

function StatCard({ 
  title, 
  value, 
  change, 
  changeType,
  icon: Icon,
}: { 
  title: string; 
  value: string; 
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change && (
              <p className={cn(
                'text-xs mt-1 flex items-center gap-1',
                changeType === 'positive' && 'text-emerald-400',
                changeType === 'negative' && 'text-red-400',
                changeType === 'neutral' && 'text-zinc-400'
              )}>
                {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
                {change}
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

function BudgetProgress({ 
  label, 
  current, 
  limit, 
}: { 
  label: string; 
  current: number; 
  limit: number;
}) {
  const percent = (current / limit) * 100;
  const isWarning = percent >= 80;
  const isDanger = percent >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className={cn(
          'font-medium',
          isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
        )}>
          {formatCurrency(current)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all',
            isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-violet-500'
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {isWarning && (
        <p className={cn(
          'text-xs flex items-center gap-1',
          isDanger ? 'text-red-400' : 'text-amber-400'
        )}>
          <AlertTriangle className="w-3 h-3" />
          {isDanger ? 'Budget exceeded!' : 'Approaching budget limit'}
        </p>
      )}
    </div>
  );
}

export default function CostsPage({ params }: Props) {
  const { projectId } = use(params);
  const [period, setPeriod] = useState('7d');

  // Calculate totals
  const totalCostToday = dailyCostData[dailyCostData.length - 1].cost;
  const totalCostWeek = dailyCostData.reduce((sum, d) => sum + d.cost, 0);
  const totalSessionsWeek = dailyCostData.reduce((sum, d) => sum + d.sessions, 0);

  return (
    <DashboardLayout>
      <PageShell
        title="Costs & Usage"
        description="Monitor spending and resource usage"
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
              <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Cost Today"
            value={formatCurrency(totalCostToday)}
            change="+12% from yesterday"
            changeType="negative"
            icon={DollarSign}
          />
          <StatCard
            title="Cost This Week"
            value={formatCurrency(totalCostWeek)}
            change="-5% from last week"
            changeType="positive"
            icon={DollarSign}
          />
          <StatCard
            title="Sessions This Week"
            value={formatCompact(totalSessionsWeek)}
            change="+8% from last week"
            changeType="neutral"
            icon={Bot}
          />
          <StatCard
            title="Avg Cost/Session"
            value={formatCurrency(totalCostWeek / totalSessionsWeek)}
            icon={TrendingUp}
          />
        </div>

        {/* Budget Progress */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Budget Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BudgetProgress label="Daily Budget" current={totalCostToday} limit={10} />
            <BudgetProgress label="Monthly Budget" current={86} limit={200} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cost Over Time */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Cost Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                      formatter={(value) => [formatCurrency(Number(value)), 'Cost']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost by Agent */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Cost by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentCostData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={12} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [formatCurrency(Number(value)), 'Cost']}
                    />
                    <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Table */}
        <PageSection title="Detailed Usage">
          <Card className="bg-zinc-900 border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Agent</TableHead>
                  <TableHead className="text-zinc-400 text-right">Sessions</TableHead>
                  <TableHead className="text-zinc-400 text-right">Tokens In</TableHead>
                  <TableHead className="text-zinc-400 text-right">Tokens Out</TableHead>
                  <TableHead className="text-zinc-400 text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageHistory.map((row, idx) => (
                  <TableRow key={idx} className="border-zinc-800">
                    <TableCell className="text-white">{row.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {row.agent}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">{row.sessions}</TableCell>
                    <TableCell className="text-right text-zinc-300 font-mono text-sm">
                      {formatCompact(row.tokensIn)}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300 font-mono text-sm">
                      {formatCompact(row.tokensOut)}
                    </TableCell>
                    <TableCell className="text-right text-white font-medium">
                      {formatCurrency(row.cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </PageSection>
      </PageShell>
    </DashboardLayout>
  );
}
