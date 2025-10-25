import { ReactNode } from 'react';

interface ConfigPanelProps {
  children: ReactNode;
}

export function ConfigPanel({ children }: ConfigPanelProps) {
  return (
    <aside className="w-72 border-l border-border bg-card flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-4">
        <h2 className="font-semibold">Configuration</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </aside>
  );
}
