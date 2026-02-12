'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePendingApprovalsCount } from '@/lib/hooks/use-approvals';
import { useAuth } from '@/lib/hooks/use-auth';

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  
  let currentPath = '';
  
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Skip UUIDs in breadcrumbs display
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      continue;
    }
    
    // Capitalize and clean up segment
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    breadcrumbs.push({ label, href: currentPath });
  }
  
  return breadcrumbs;
}

export function Header() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { data: pendingCount } = usePendingApprovalsCount();
  
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-zinc-800 bg-zinc-950">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm">
        <Link 
          href="/" 
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-zinc-600" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : (
              <Link 
                href={crumb.href}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link href="/approvals">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-zinc-400" />
            {pendingCount !== undefined && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-medium bg-violet-600 text-white rounded-full">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled>
              <span className="text-xs text-zinc-500">Logged in as Admin</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
