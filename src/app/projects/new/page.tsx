'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Building2,
  Bot,
  Plug,
  DollarSign,
  Rocket,
  Loader2,
} from 'lucide-react';
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
import { useCreateProject } from '@/lib/hooks/use-projects';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Basics', icon: Building2 },
  { id: 2, title: 'Agent Identity', icon: Bot },
  { id: 3, title: 'Integrations', icon: Plug },
  { id: 4, title: 'Limits & Costs', icon: DollarSign },
  { id: 5, title: 'Review & Deploy', icon: Rocket },
];

const industries = [
  'E-commerce',
  'SaaS',
  'Manufacturing',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Education',
  'Other',
];

const templates = [
  { id: 'sales', name: 'Sales Agent', description: 'Lead qualification, product info, quotes' },
  { id: 'support', name: 'Support Agent', description: 'Customer service, tickets, FAQs' },
  { id: 'operations', name: 'Operations Agent', description: 'Internal tasks, scheduling, coordination' },
  { id: 'custom', name: 'Custom', description: 'Start from scratch' },
];

interface FormData {
  // Step 1: Basics
  name: string;
  clientName: string;
  industry: string;
  template: string;
  
  // Step 2: Agent Identity (will be conversational in full version)
  agentName: string;
  agentTone: string;
  agentRole: string;
  agentRestrictions: string;
  
  // Step 3: Integrations (simplified for now)
  enableWhatsApp: boolean;
  enableTelegram: boolean;
  enableEmail: boolean;
  
  // Step 4: Limits
  dailyBudgetUsd: string;
  monthlyBudgetUsd: string;
  maxTurnsPerSession: string;
  maxConcurrentSessions: string;
}

const initialFormData: FormData = {
  name: '',
  clientName: '',
  industry: '',
  template: 'sales',
  agentName: '',
  agentTone: 'professional',
  agentRole: '',
  agentRestrictions: '',
  enableWhatsApp: false,
  enableTelegram: false,
  enableEmail: false,
  dailyBudgetUsd: '10',
  monthlyBudgetUsd: '200',
  maxTurnsPerSession: '20',
  maxConcurrentSessions: '5',
};

function StepIndicator({ 
  currentStep 
}: { 
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
              isActive && 'bg-violet-600 text-white',
              isCompleted && 'bg-emerald-600 text-white',
              !isActive && !isCompleted && 'bg-zinc-800 text-zinc-400'
            )}>
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-16 h-0.5 mx-2',
                step.id < currentStep ? 'bg-emerald-600' : 'bg-zinc-700'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const createMutation = useCreateProject();

  function updateForm(updates: Partial<FormData>) {
    setFormData(prev => ({ ...prev, ...updates }));
  }

  function nextStep() {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleCreate() {
    try {
      // TODO: The real CreateProject schema requires owner and config but doesn't accept these custom fields
      // This is mock-compatible code only. Update when integrating with real API.
      const project = await createMutation.mutateAsync({
        name: formData.name,
        clientName: formData.clientName || undefined,
        industry: formData.industry || undefined,
        dailyBudgetUsd: formData.dailyBudgetUsd ? parseFloat(formData.dailyBudgetUsd) : undefined,
        monthlyBudgetUsd: formData.monthlyBudgetUsd ? parseFloat(formData.monthlyBudgetUsd) : undefined,
        maxTurnsPerSession: formData.maxTurnsPerSession ? parseInt(formData.maxTurnsPerSession) : undefined,
        maxConcurrentSessions: formData.maxConcurrentSessions ? parseInt(formData.maxConcurrentSessions) : undefined,
      } as any);

      toast.success('Project created successfully!');
      router.push(`/projects/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.agentName.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <DashboardLayout>
      <PageShell
        title="Create New Project"
        description="Set up a new AI agent project"
      >
        <Card className="bg-zinc-900 border-zinc-800 max-w-3xl mx-auto">
          <CardContent className="p-8">
            <StepIndicator currentStep={currentStep} />
            
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-zinc-400 mt-1">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cartones del Sur - Sales Agent"
                    value={formData.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    className="mt-1 bg-zinc-800 border-zinc-700"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="e.g., Cartones del Sur S.A."
                    value={formData.clientName}
                    onChange={(e) => updateForm({ clientName: e.target.value })}
                    className="mt-1 bg-zinc-800 border-zinc-700"
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={formData.industry}
                    onValueChange={(value) => updateForm({ industry: value })}
                  >
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry.toLowerCase()}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => updateForm({ template: template.id })}
                        className={cn(
                          'p-4 rounded-lg border cursor-pointer transition-colors',
                          formData.template === template.id
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-zinc-700 hover:border-zinc-600'
                        )}
                      >
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Agent Identity */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="agentName">Agent Name *</Label>
                  <Input
                    id="agentName"
                    placeholder="e.g., Sol"
                    value={formData.agentName}
                    onChange={(e) => updateForm({ agentName: e.target.value })}
                    className="mt-1 bg-zinc-800 border-zinc-700"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    This is how the agent will introduce itself
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="agentTone">Communication Style</Label>
                  <Select 
                    value={formData.agentTone}
                    onValueChange={(value) => updateForm({ agentTone: value })}
                  >
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal (usted)</SelectItem>
                      <SelectItem value="professional">Professional (tú)</SelectItem>
                      <SelectItem value="casual">Casual (vos)</SelectItem>
                      <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="agentRole">Primary Role</Label>
                  <Textarea
                    id="agentRole"
                    placeholder="e.g., Help customers find the right packaging products, provide quotes, and answer questions about our catalog..."
                    value={formData.agentRole}
                    onChange={(e) => updateForm({ agentRole: e.target.value })}
                    className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agentRestrictions">Things the agent should NEVER do</Label>
                  <Textarea
                    id="agentRestrictions"
                    placeholder="e.g., Never discuss competitor products, never provide discounts without approval, never share internal pricing..."
                    value={formData.agentRestrictions}
                    onChange={(e) => updateForm({ agentRestrictions: e.target.value })}
                    className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Integrations */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-zinc-400 text-center mb-6">
                  Select the channels where your agent will be available.
                  You can configure credentials later.
                </p>
                
                <div className="space-y-3">
                  {[
                    { id: 'whatsapp', name: 'WhatsApp', key: 'enableWhatsApp' as const },
                    { id: 'telegram', name: 'Telegram', key: 'enableTelegram' as const },
                    { id: 'email', name: 'Email', key: 'enableEmail' as const },
                  ].map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => updateForm({ [channel.key]: !formData[channel.key] })}
                      className={cn(
                        'p-4 rounded-lg border cursor-pointer transition-colors flex items-center justify-between',
                        formData[channel.key]
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      )}
                    >
                      <span className="text-white">{channel.name}</span>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        formData[channel.key]
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-zinc-600'
                      )}>
                        {formData[channel.key] && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-zinc-500 text-center">
                  MCP servers and credentials can be configured after project creation
                </p>
              </div>
            )}

            {/* Step 4: Limits & Costs */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dailyBudget">Daily Budget (USD)</Label>
                    <Input
                      id="dailyBudget"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="10.00"
                      value={formData.dailyBudgetUsd}
                      onChange={(e) => updateForm({ dailyBudgetUsd: e.target.value })}
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthlyBudget">Monthly Budget (USD)</Label>
                    <Input
                      id="monthlyBudget"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="200.00"
                      value={formData.monthlyBudgetUsd}
                      onChange={(e) => updateForm({ monthlyBudgetUsd: e.target.value })}
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxTurns">Max Turns per Session</Label>
                    <Input
                      id="maxTurns"
                      type="number"
                      min="1"
                      placeholder="20"
                      value={formData.maxTurnsPerSession}
                      onChange={(e) => updateForm({ maxTurnsPerSession: e.target.value })}
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                    <Input
                      id="maxSessions"
                      type="number"
                      min="1"
                      placeholder="5"
                      value={formData.maxConcurrentSessions}
                      onChange={(e) => updateForm({ maxConcurrentSessions: e.target.value })}
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-zinc-500 text-center">
                  You'll be alerted when reaching 80% of any budget threshold
                </p>
              </div>
            )}

            {/* Step 5: Review & Deploy */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Project Name</span>
                    <span className="text-white font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Client</span>
                    <span className="text-white">{formData.clientName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Industry</span>
                    <span className="text-white capitalize">{formData.industry || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Template</span>
                    <span className="text-white capitalize">{formData.template}</span>
                  </div>
                  <hr className="border-zinc-700" />
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Agent Name</span>
                    <span className="text-white">{formData.agentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Communication Style</span>
                    <span className="text-white capitalize">{formData.agentTone}</span>
                  </div>
                  <hr className="border-zinc-700" />
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Daily Budget</span>
                    <span className="text-white">${formData.dailyBudgetUsd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Monthly Budget</span>
                    <span className="text-white">${formData.monthlyBudgetUsd}</span>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 text-center">
                  After creation, you'll be redirected to configure prompt layers and test the agent.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-zinc-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </DashboardLayout>
  );
}
