
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile'; // Ensure this hook exists

export default function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      {/* Show trigger only on mobile or when sidebar is inset/floating */}
       <SidebarTrigger className="md:hidden" />

      {/* You can add a logo or title here if needed */}
       <div className="flex-1">
           {/* Optional: <h1 className="text-lg font-semibold">Project Showcase</h1> */}
       </div>

       <div className="flex items-center gap-2">
          {/* Example Action Button */}
          {/* <Button variant="outline" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button> */}
       </div>
    </header>
  );
}
