'use client';

import { use, useState } from 'react';
import { Save, History, RotateCcw, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { DashboardLayout, PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPromptLayers, createPromptLayer, activatePromptLayer } from '@/lib/api/prompts';
import type { PromptLayer, PromptLayerType } from '@/lib/schemas';
import { formatRelativeTime, cn } from '@/lib/utils';
import { toast } from 'sonner';

// Lazy load Monaco editor
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }
);

interface Props {
  params: Promise<{ projectId: string }>;
}

const layerTypes: { value: PromptLayerType; label: string; description: string }[] = [
  { 
    value: 'identity', 
    label: 'Identity',
    description: 'Who is the agent? Name, personality, tone of voice.',
  },
  { 
    value: 'instructions', 
    label: 'Instructions',
    description: 'What should the agent do? Tasks, workflows, behaviors.',
  },
  { 
    value: 'safety', 
    label: 'Safety',
    description: 'What should the agent never do? Guardrails and restrictions.',
  },
];

function VersionListItem({ 
  layer, 
  isActive,
  onActivate,
  isActivating,
}: { 
  layer: PromptLayer;
  isActive: boolean;
  onActivate: () => void;
  isActivating: boolean;
}) {
  return (
    <div 
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-colors',
        isActive 
          ? 'border-violet-500 bg-violet-500/10' 
          : 'border-zinc-700 hover:border-zinc-600'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-white">v{layer.version}</span>
        {isActive && (
          <Badge variant="default" className="bg-violet-600 text-xs">
            Active
          </Badge>
        )}
      </div>
      <p className="text-xs text-zinc-400 mb-2">
        {formatRelativeTime(layer.createdAt)}
      </p>
      {layer.changeReason && (
        <p className="text-xs text-zinc-500 italic truncate">
          "{layer.changeReason}"
        </p>
      )}
      {!isActive && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
          disabled={isActivating}
          className="mt-2 w-full text-xs"
        >
          {isActivating ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <RotateCcw className="w-3 h-3 mr-1" />
          )}
          Rollback
        </Button>
      )}
    </div>
  );
}

export default function PromptsPage({ params }: Props) {
  const { projectId } = use(params);
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<PromptLayerType>('identity');
  const [editorContent, setEditorContent] = useState<string>('');
  const [changeReason, setChangeReason] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all prompt layers
  const { data: layers, isLoading } = useQuery({
    queryKey: ['prompt-layers', projectId],
    queryFn: () => listPromptLayers({ projectId }),
  });

  // Filter layers by type
  const layersByType: Record<PromptLayerType, PromptLayer[]> = layers?.reduce((acc, layer) => {
    if (!acc[layer.type]) acc[layer.type] = [];
    acc[layer.type].push(layer);
    return acc;
  }, { identity: [], instructions: [], safety: [] } as Record<PromptLayerType, PromptLayer[]>) ?? { identity: [], instructions: [], safety: [] };

  // Get active layer for current tab
  const activeLayers = layersByType[activeTab] ?? [];
  const activeLayer = activeLayers.find(l => l.isActive);
  const sortedLayers = [...activeLayers].sort((a, b) => b.version - a.version);

  // Create new version mutation
  const createMutation = useMutation({
    mutationFn: (content: string) => createPromptLayer(projectId, {
      type: activeTab,
      content,
      changeReason: changeReason || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-layers', projectId] });
      setHasChanges(false);
      setChangeReason('');
      toast.success('New version saved');
    },
    onError: () => {
      toast.error('Failed to save');
    },
  });

  // Activate version mutation
  const activateMutation = useMutation({
    mutationFn: (layerId: string) => activatePromptLayer(projectId, layerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-layers', projectId] });
      toast.success('Version activated');
    },
    onError: () => {
      toast.error('Failed to activate version');
    },
  });

  // Initialize editor content when active layer changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as PromptLayerType);
    setHasChanges(false);
    setChangeReason('');
  };

  // Track if editor has changes
  const handleEditorChange = (value: string | undefined) => {
    setEditorContent(value || '');
    setHasChanges(value !== activeLayer?.content);
  };

  function handleSave() {
    if (!editorContent.trim()) {
      toast.error('Content cannot be empty');
      return;
    }
    createMutation.mutate(editorContent);
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageShell title="Prompt Layers">
          <Skeleton className="h-[600px]" />
        </PageShell>
      </DashboardLayout>
    );
  }

  const currentLayerType = layerTypes.find(l => l.value === activeTab);

  return (
    <DashboardLayout>
      <PageShell
        title="Prompt Layers"
        description="Configure your agent's identity, instructions, and safety guardrails"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
            {layerTypes.map((type) => (
              <TabsTrigger 
                key={type.value} 
                value={type.value}
                className="data-[state=active]:bg-zinc-800"
              >
                {type.label}
                {layersByType[type.value]?.find(l => l.isActive) && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    v{layersByType[type.value]?.find(l => l.isActive)?.version}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {layerTypes.map((type) => (
            <TabsContent key={type.value} value={type.value}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Editor */}
                <div className="lg:col-span-3 space-y-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-0">
                      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{type.label}</h3>
                          <p className="text-xs text-zinc-400">{type.description}</p>
                        </div>
                        {hasChanges && (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-400">
                            Unsaved changes
                          </Badge>
                        )}
                      </div>
                      <MonacoEditor
                        height="400px"
                        defaultLanguage="markdown"
                        theme="vs-dark"
                        value={activeLayer?.content || `# ${type.label}\n\nWrite your ${type.label.toLowerCase()} prompt here...`}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          padding: { top: 16 },
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Save section */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <Label htmlFor="changeReason" className="text-zinc-400 text-sm">
                            Change reason (optional)
                          </Label>
                          <Input
                            id="changeReason"
                            placeholder="What did you change?"
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            className="mt-1 bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <Button
                          onClick={handleSave}
                          disabled={!hasChanges || createMutation.isPending}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          {createMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save as New Version
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Version History */}
                <div className="lg:col-span-1">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <History className="w-4 h-4 text-zinc-400" />
                        <h3 className="font-medium text-white">Version History</h3>
                      </div>
                      
                      {sortedLayers.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-4">
                          No versions yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sortedLayers.map((layer) => (
                            <VersionListItem
                              key={layer.id}
                              layer={layer}
                              isActive={layer.isActive}
                              onActivate={() => activateMutation.mutate(layer.id)}
                              isActivating={activateMutation.isPending}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PageShell>
    </DashboardLayout>
  );
}
