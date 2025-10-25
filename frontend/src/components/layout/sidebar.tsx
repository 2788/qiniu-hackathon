import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      {children}
    </aside>
  );
}
