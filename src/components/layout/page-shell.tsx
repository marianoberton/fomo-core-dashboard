import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageShell({ 
  children, 
  title, 
  description, 
  actions,
  className,
}: PageShellProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Page header */}
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-zinc-400">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Page content */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageSection({
  children,
  title,
  description,
  actions,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-zinc-400">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
