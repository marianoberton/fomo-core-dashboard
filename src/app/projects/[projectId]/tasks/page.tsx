'use client';

import { use, useState } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Bot,
} from 'lucide-react';
import { DashboardLayout, PageShell, PageSection } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { cn, formatRelativeTime, formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  params: Promise<{ projectId: string }>;
}

interface TaskData {
  id: string;
  name: string;
  description: string;
  scheduleType: string;
  schedule: string;
  prompt: string;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastRunStatus: string | null;
}

// Mock data
const mockTasks: TaskData[] = [
  {
    id: '1',
    name: 'Daily Report',
    description: 'Generate daily sales summary',
    scheduleType: 'cron',
    schedule: '0 9 * * *',
    prompt: 'Generate a summary of yesterday sales...',
    enabled: true,
    lastRunAt: '2026-02-10T09:00:00Z',
    nextRunAt: '2026-02-11T09:00:00Z',
    lastRunStatus: 'success',
  },
  {
    id: '2',
    name: 'Lead Follow-up',
    description: 'Check for stale leads and send reminders',
    scheduleType: 'interval',
    schedule: '4h',
    prompt: 'Check for leads that havent been contacted in 48h...',
    enabled: true,
    lastRunAt: '2026-02-10T16:00:00Z',
    nextRunAt: '2026-02-10T20:00:00Z',
    lastRunStatus: 'success',
  },
  {
    id: '3',
    name: 'Inventory Alert',
    description: 'Check for low stock items',
    scheduleType: 'cron',
    schedule: '0 8 * * 1',
    prompt: 'Check inventory levels and alert if any item is below threshold...',
    enabled: false,
    lastRunAt: '2026-02-03T08:00:00Z',
    nextRunAt: null,
    lastRunStatus: 'error',
  },
];

const mockRunHistory = [
  { id: '1', taskId: '1', status: 'success', startedAt: '2026-02-10T09:00:00Z', durationMs: 12500 },
  { id: '2', taskId: '2', status: 'success', startedAt: '2026-02-10T16:00:00Z', durationMs: 8200 },
  { id: '3', taskId: '1', status: 'success', startedAt: '2026-02-09T09:00:00Z', durationMs: 11800 },
  { id: '4', taskId: '3', status: 'error', startedAt: '2026-02-03T08:00:00Z', durationMs: 3500, error: 'Inventory API timeout' },
];

function TaskCard({ 
  task,
  onToggle,
  onRunNow,
  onDelete,
}: { 
  task: TaskData;
  onToggle: () => void;
  onRunNow: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-2 rounded-lg',
              task.enabled ? 'bg-violet-500/10' : 'bg-zinc-800'
            )}>
              <Clock className={cn(
                'w-5 h-5',
                task.enabled ? 'text-violet-400' : 'text-zinc-500'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{task.name}</h3>
              <p className="text-sm text-zinc-400">{task.description}</p>
            </div>
          </div>
          <Switch 
            checked={task.enabled}
            onCheckedChange={onToggle}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-zinc-500">Schedule</p>
            <p className="text-white font-mono">
              {task.scheduleType === 'cron' ? task.schedule : `Every ${task.schedule}`}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Next Run</p>
            <p className="text-white">
              {task.nextRunAt ? formatRelativeTime(task.nextRunAt) : '—'}
            </p>
          </div>
        </div>

        {task.lastRunAt && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            {task.lastRunStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-zinc-400">
              Last run {formatRelativeTime(task.lastRunAt)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onRunNow}
            disabled={!task.enabled}
            className="border-zinc-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-zinc-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddTaskDialog({ onAdd }: { onAdd: (task: Partial<typeof mockTasks[0]>) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState('cron');
  const [schedule, setSchedule] = useState('');
  const [prompt, setPrompt] = useState('');

  function handleSubmit() {
    if (!name.trim() || !schedule.trim() || !prompt.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    onAdd({
      name: name.trim(),
      description: description.trim(),
      scheduleType: scheduleType as 'cron' | 'interval',
      schedule: schedule.trim(),
      prompt: prompt.trim(),
      enabled: true,
    });
    setName('');
    setDescription('');
    setSchedule('');
    setPrompt('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Scheduled Task</DialogTitle>
          <DialogDescription>
            Set up a recurring task for your agent to execute.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Daily Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What does this task do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleType">Schedule Type</Label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cron">Cron Expression</SelectItem>
                  <SelectItem value="interval">Interval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="schedule">
                {scheduleType === 'cron' ? 'Cron Expression *' : 'Interval *'}
              </Label>
              <Input
                id="schedule"
                placeholder={scheduleType === 'cron' ? '0 9 * * *' : '4h'}
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="mt-1 bg-zinc-800 border-zinc-700 font-mono"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="prompt">Task Prompt *</Label>
            <Textarea
              id="prompt"
              placeholder="Instructions for the agent when this task runs..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700">
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage({ params }: Props) {
  const { projectId } = use(params);
  const [tasks, setTasks] = useState(mockTasks);

  function handleAddTask(task: Partial<TaskData>) {
    const newTask: TaskData = {
      id: Date.now().toString(),
      name: task.name!,
      description: task.description || '',
      scheduleType: task.scheduleType!,
      schedule: task.schedule!,
      prompt: task.prompt!,
      enabled: true,
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 3600000).toISOString(),
      lastRunStatus: null,
    };
    setTasks([...tasks, newTask]);
    toast.success('Task created');
  }

  function handleToggleTask(taskId: string) {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, enabled: !t.enabled } : t
    ));
    toast.success('Task updated');
  }

  function handleRunNow(taskId: string) {
    toast.info('Task execution started');
  }

  function handleDeleteTask(taskId: string) {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast.success('Task deleted');
  }

  return (
    <DashboardLayout>
      <PageShell
        title="Scheduled Tasks"
        description="Automate recurring agent tasks"
        actions={<AddTaskDialog onAdd={handleAddTask} />}
      >
        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {tasks.length === 0 ? (
            <Card className="col-span-full bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No scheduled tasks
                </h3>
                <p className="text-zinc-400 mb-4">
                  Create a task to run agent prompts on a schedule
                </p>
                <AddTaskDialog onAdd={handleAddTask} />
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task.id)}
                onRunNow={() => handleRunNow(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))
          )}
        </div>

        {/* Run History */}
        <PageSection 
          title="Recent Runs"
          description="History of scheduled task executions"
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 space-y-3">
              {mockRunHistory.map((run) => {
                const task = mockTasks.find(t => t.id === run.taskId);
                return (
                  <div 
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {run.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">{task?.name || 'Unknown Task'}</p>
                        <p className="text-sm text-zinc-400">
                          {formatRelativeTime(run.startedAt)} • {formatDuration(run.durationMs)}
                        </p>
                      </div>
                    </div>
                    {run.error && (
                      <Badge variant="destructive" className="text-xs">
                        {run.error}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </PageSection>
      </PageShell>
    </DashboardLayout>
  );
}
