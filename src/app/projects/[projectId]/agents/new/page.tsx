'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout, PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCreateAgent } from '@/lib/hooks/use-agents';
import { toast } from 'sonner';

interface Props {
  params: Promise<{ projectId: string }>;
}

const models = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast, intelligent, great for most tasks' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable, complex reasoning' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI flagship model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective' },
];

export default function NewAgentPage({ params }: Props) {
  const { projectId } = use(params);
  const router = useRouter();
  const createMutation = useCreateAgent(projectId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'claude-sonnet-4-20250514',
    temperature: 0.7,
    maxTokens: 4096,
  });

  function updateForm(updates: Partial<typeof formData>) {
    setFormData(prev => ({ ...prev, ...updates }));
  }

  async function handleCreate() {
    if (!formData.name.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    try {
      // TODO: The real CreateAgent schema requires promptConfig but doesn't accept model/temperature/maxTokens
      // This is mock-compatible code only. Update when integrating with real API.
      const agent = await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
      } as any);

      toast.success('Agent created successfully!');
      router.push(`/projects/${projectId}/agents/${agent.id}`);
    } catch {
      toast.error('Failed to create agent');
    }
  }

  return (
    <DashboardLayout>
      <PageShell
        title="Create Agent"
        description="Add a new AI agent to your project"
        actions={
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline" className="border-zinc-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
          </Link>
        }
      >
        <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Agent Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-violet-500/10 rounded-2xl">
                <Bot className="w-12 h-12 text-violet-400" />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Agent, Support Bot"
                value={formData.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                className="mt-1 bg-zinc-800 border-zinc-700"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this agent do?"
                value={formData.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                className="mt-1 bg-zinc-800 border-zinc-700"
                rows={3}
              />
            </div>

            {/* Model Selection */}
            <div>
              <Label>Model</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => updateForm({ model: model.id })}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.model === model.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <h4 className="font-medium text-white">{model.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{model.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
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
                  onChange={(e) => updateForm({ temperature: parseFloat(e.target.value) })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  0 = deterministic, 2 = creative
                </p>
              </div>

              <div>
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max="200000"
                  value={formData.maxTokens}
                  onChange={(e) => updateForm({ maxTokens: parseInt(e.target.value) })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Maximum response length
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Link href={`/projects/${projectId}`}>
                <Button variant="outline" className="border-zinc-700">
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !formData.name.trim()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </DashboardLayout>
  );
}
