'use client';

import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ConfigPanel } from '@/components/layout/config-panel';
import { SessionList } from '@/components/session/session-list';
import { ChatArea } from '@/components/chat/chat-area';
import { SettingsPanel } from '@/components/config/settings-panel';
import { useSession } from '@/hooks/useSession';
import { useChat } from '@/hooks/useChat';

function HomeContent() {
  const {
    sessions,
    currentSession,
    currentSessionId,
    isPendingNewChat,
    isLoading: sessionLoading,
    createSession,
    startNewChat,
    deleteSession,
    selectSession,
  } = useSession();

  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    messagesEndRef,
  } = useChat({
    sessionId: currentSessionId,
    isPendingNewChat,
    createSession,
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar>
          <SessionList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={selectSession}
            onDeleteSession={deleteSession}
            onCreateSession={startNewChat}
            isLoading={sessionLoading}
          />
        </Sidebar>
        <main className="flex-1 flex flex-col overflow-y-auto">
          <ChatArea
            messages={messages}
            isLoading={chatLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            sessionId={currentSessionId}
            isPendingNewChat={isPendingNewChat}
          />
        </main>
        <ConfigPanel>
          <SettingsPanel currentSession={currentSession} />
        </ConfigPanel>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
