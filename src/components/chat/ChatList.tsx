import { useState } from 'react';
import { Chat } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => Promise<Chat | null>;
  onDeleteChat: (chatId: string) => void;
  loading?: boolean;
}

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  loading,
}: ChatListProps) {
  const [creating, setCreating] = useState(false);

  const handleCreateChat = async () => {
    setCreating(true);
    const chat = await onCreateChat();
    if (chat) {
      onSelectChat(chat.id);
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <div className="h-10 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="h-10 bg-secondary/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/30">
        <Button
          onClick={handleCreateChat}
          disabled={creating}
          variant="secondary"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Creating...' : 'New Chat'}
        </Button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {chats.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No chats yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to ideate</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                selectedChatId === chat.id
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-sm truncate">{chat.title}</span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
