'use client';

import { defaultModel } from '@/constants/chat';

interface ModelSelectorProps {
  currentModel: string;
}

export function ModelSelector({ currentModel }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">AI Model</label>
      <div className="p-3 rounded-lg bg-muted text-sm">
        {currentModel || defaultModel}
      </div>
      <p className="text-xs text-muted-foreground">
        Model selection for new conversations will be available in a future update
      </p>
    </div>
  );
}
