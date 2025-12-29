import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { QuickCapture } from '@/components/notes/QuickCapture';
import { DeliverablesView } from '@/components/deliverables/DeliverablesView';
import { ChatView } from '@/components/chat/ChatView';
import { useWorkspace } from '@/hooks/useWorkspace';

const Index = () => {
  const [activeView, setActiveView] = useState('ideas');
  const {
    tags,
    buckets,
    notes,
    allNotes,
    deliverables,
    chatMessages,
    selectedBucket,
    selectedTags,
    setSelectedBucket,
    toggleTag,
    addNote,
    addDeliverable,
    addChatMessage,
  } = useWorkspace();

  const getHeaderContent = () => {
    switch (activeView) {
      case 'ideas':
        return {
          title: 'Ideas & Notes',
          subtitle: `${notes.length} items · Capture, organize, and connect your thoughts`,
        };
      case 'deliverables':
        return {
          title: 'Deliverables',
          subtitle: 'Transform your ideas into actionable outputs',
        };
      case 'chat':
        return {
          title: 'AI Assistant',
          subtitle: 'Explore and synthesize your knowledge',
        };
      default:
        return { title: 'Workspace', subtitle: '' };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        buckets={buckets}
        tags={tags}
        selectedBucket={selectedBucket}
        selectedTags={selectedTags}
        onSelectBucket={setSelectedBucket}
        onToggleTag={toggleTag}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Header title={headerContent.title} subtitle={headerContent.subtitle} />

        {/* Ideas & Notes View */}
        {activeView === 'ideas' && (
          <>
            <NotesGrid notes={notes} />
            <QuickCapture
              buckets={buckets}
              tags={tags}
              onSubmit={addNote}
            />
          </>
        )}

        {/* Deliverables View */}
        {activeView === 'deliverables' && (
          <DeliverablesView
            deliverables={deliverables}
            notes={allNotes}
            tags={tags}
            onCreateDeliverable={addDeliverable}
          />
        )}

        {/* Chat View */}
        {activeView === 'chat' && (
          <ChatView
            messages={chatMessages}
            notes={allNotes}
            onSendMessage={addChatMessage}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
