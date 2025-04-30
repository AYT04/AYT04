
export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  githubLink?: string;
  websiteLink?: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: 'p1',
    slug: 'quantum-leap-engine',
    title: 'QuantumLeap Engine',
    description: 'A next-generation game engine focused on realism.',
    longDescription:
      'QuantumLeap Engine aims to redefine graphical fidelity and physics simulation in real-time applications. Leveraging cutting-edge rendering techniques and advanced physics models, it provides developers with the tools to create truly immersive experiences. Includes support for volumetric lighting, ray tracing, and complex material shaders.',
    githubLink: 'https://github.com/example/quantum-leap',
    websiteLink: 'https://quantumleap.example.com',
    tags: ['Game Development', 'C++', 'Physics', 'Graphics'],
  },
  {
    id: 'p2',
    slug: 'aether-analytics',
    title: 'Aether Analytics',
    description: 'Cloud-based data analytics platform.',
    longDescription:
      'Aether Analytics offers scalable and performant data processing and visualization capabilities. Built on a serverless architecture, it allows users to ingest, transform, and analyze large datasets efficiently. Features include interactive dashboards, machine learning model integration, and real-time data streaming.',
    githubLink: 'https://github.com/example/aether-analytics',
    tags: ['Data Science', 'Cloud', 'Serverless', 'React', 'Python'],
  },
  {
    id: 'p3',
    slug: 'project-chrono',
    title: 'Project Chrono',
    description: 'Decentralized time-stamping service.',
    longDescription:
      'Project Chrono utilizes blockchain technology to provide a secure and verifiable time-stamping service for digital documents. It ensures data integrity and provides an immutable record of when a document existed. Ideal for legal tech, intellectual property protection, and compliance.',
    websiteLink: 'https://chrono.example.com',
    tags: ['Blockchain', 'Security', 'Decentralization', 'Go'],
  },
  {
    id: 'p4',
    slug: 'nova-os',
    title: 'Nova OS',
    description: 'A lightweight, secure operating system for IoT devices.',
    longDescription:
      'Nova OS is designed from the ground up for resource-constrained IoT devices. It prioritizes security, low power consumption, and a small footprint. Features a modular design, secure boot, and over-the-air update capabilities. Written primarily in Rust for memory safety.',
    githubLink: 'https://github.com/example/nova-os',
    tags: ['IoT', 'Operating System', 'Rust', 'Security', 'Embedded'],
  },
  {
    id: 'p5',
    slug: 'zenith-editor',
    title: 'Zenith Editor',
    description: 'A collaborative markdown editor with real-time sync.',
    longDescription:
      'Zenith Editor provides a seamless writing experience for teams working on documentation or notes. It features real-time collaboration, markdown preview, version history, and integration with popular Git platforms. Built with WebSockets and a conflict-free replicated data type (CRDT) approach.',
    githubLink: 'https://github.com/example/zenith-editor',
    websiteLink: 'https://zenith.example.com',
    tags: ['Web Development', 'Collaboration', 'Markdown', 'TypeScript', 'Node.js'],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjects(query?: string): Project[] {
  if (!query) {
    return projects;
  }
  const lowerCaseQuery = query.toLowerCase();
  return projects.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerCaseQuery) ||
      p.description.toLowerCase().includes(lowerCaseQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery))
  );
}
