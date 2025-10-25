'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ConfigPanel } from '@/components/layout/config-panel';
import { SessionList } from '@/components/session/session-list';
import { ChatArea } from '@/components/chat/chat-area';
import { SettingsPanel } from '@/components/config/settings-panel';
import { useSession } from '@/hooks/useSession';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const {
    sessions,
    currentSession,
    currentSessionId,
    isLoading: sessionLoading,
    createSession,
    deleteSession,
    selectSession,
  } = useSession();

  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    messagesEndRef,
  } = useChat(currentSessionId);

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
            onCreateSession={() => createSession()}
            isLoading={sessionLoading}
          />
        </Sidebar>
        <main className="flex-1 flex flex-col">
          <ChatArea
            messages={messages}
            isLoading={chatLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            sessionId={currentSessionId}
          />
        </main>
        <ConfigPanel>
          <SettingsPanel currentSession={currentSession} />
        </ConfigPanel>
      </div>
    </div>
  );
}
