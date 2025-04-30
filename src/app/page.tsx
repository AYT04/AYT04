
import type { Metadata } from "next";
import { ProjectList } from '@/components/project/project-list';

export const metadata: Metadata = {
  title: 'Projects | Project Showcase',
  description: 'Browse the list of projects.',
};

export default function HomePage({ searchParams }: { searchParams?: { query?: string } }) {
  const query = searchParams?.query || '';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <p className="text-muted-foreground">
        Welcome to the Project Showcase! Here you can find information about the projects currently being developed.
      </path>
       <ProjectList query={query} />
    </div>
  );
}

