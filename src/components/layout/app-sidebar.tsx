
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarInput,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { projects, Project } from '@/data/projects';
import { Home, FolderKanban, Github, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, state: sidebarState } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  useEffect(() => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredProjects(
          projects.filter(p =>
              p.title.toLowerCase().includes(lowerCaseSearch) ||
              p.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch))
          )
      );
  }, [searchTerm]);

  // Determine active state based on pathname segments
  const isActive = (path: string) => {
      if (path === '/') return pathname === '/';
      // Check if the current pathname starts with the project slug path
      return pathname.startsWith(path);
  };

  return (
      <Sidebar collapsible="icon" variant="inset">
           <SidebarHeader>
              {/* Conditionally render Input or Search icon based on sidebar state */}
              {sidebarState === 'expanded' || isMobile ? (
                    <div className="relative flex items-center">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <SidebarInput
                             placeholder="Search projects..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="pl-8" // Add padding for the icon
                         />
                    </div>

              ) : (
                  <SidebarMenuButton variant="ghost" size="icon" className="mx-auto" tooltip="Search Projects">
                    <Search />
                  </SidebarMenuButton>
              )}
          </SidebarHeader>
          <ScrollArea className="flex-1">
              <SidebarContent>
                 <SidebarMenu>
                       <SidebarMenuItem>
                          <Link href="/" passHref legacyBehavior>
                              <SidebarMenuButton isActive={isActive('/')} tooltip="Home">
                                  <Home />
                                  <span>Home</span>
                              </SidebarMenuButton>
                          </Link>
                       </SidebarMenuItem>
                   </SidebarMenu>

                   <SidebarGroup>
                     <SidebarMenu>
                          {filteredProjects.map((project) => (
                              <SidebarMenuItem key={project.id}>
                                  <Link href={`/projects/${project.slug}`} passHref legacyBehavior>
                                      <SidebarMenuButton
                                          isActive={isActive(`/projects/${project.slug}`)}
                                          tooltip={project.title}
                                      >
                                          <FolderKanban />
                                          <span>{project.title}</span>
                                      </SidebarMenuButton>
                                  </Link>
                              </SidebarMenuItem>
                          ))}
                           {filteredProjects.length === 0 && searchTerm && (
                               <SidebarMenuItem>
                                   <div className="p-2 text-sm text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
                                        No projects found.
                                   </div>
                               </SidebarMenuItem>
                           )}
                     </SidebarMenu>
                  </SidebarGroup>
              </SidebarContent>
          </ScrollArea>
          <SidebarFooter>
              <SidebarMenu>
                   <SidebarMenuItem>
                      <a href="https://github.com/example/project-showcase" target="_blank" rel="noopener noreferrer" className="block">
                           <SidebarMenuButton tooltip="View on GitHub">
                              <Github />
                              <span>GitHub Repo</span>
                          </SidebarMenuButton>
                      </a>
                   </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
      </Sidebar>
  );
}
