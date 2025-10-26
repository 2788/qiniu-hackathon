'use client';

import { defaultModel } from '@/constants/chat';
import { ModelSelector } from './model-selector';
import type { Session } from '@/types/session';

interface SettingsPanelProps {
  currentSession: Session | null;
}

export function SettingsPanel({ currentSession }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <ModelSelector currentModel={currentSession?.model || defaultModel} />
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Session Info</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          {currentSession ? (
            <>
              <p>Created: {new Date(currentSession.createdAt).toLocaleString()}</p>
              <p>Messages: View in chat</p>
            </>
          ) : (
            <p>No session selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
