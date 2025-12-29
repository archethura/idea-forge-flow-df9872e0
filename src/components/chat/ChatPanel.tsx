import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ArrowUp, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
  toolsUsed?: boolean;
}

interface ChatPanelProps {
  context: any;
  contextLabel: string;
  level: 'space' | 'folder' | 'outline' | 'document';
  onDataChange?: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function ChatPanel({ context, contextLabel, level, onDataChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        context,
        level,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    const data = await resp.json();
    return data;
  }, [context, level]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage([...messages, userMessage]);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content || 'Done.',
        actions: response.actions,
        toolsUsed: response.toolsUsed,
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // If tools were used, trigger a data refresh
      if (response.toolsUsed && response.actions?.length > 0) {
        toast({
          title: 'Actions completed',
          description: response.actions.join(', '),
        });
        // Trigger data refresh in parent
        onDataChange?.();
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getLevelColor = () => {
    switch (level) {
      case 'space': return 'level-space';
      case 'folder': return 'level-folder';
      case 'outline': return 'level-outline';
      case 'document': return 'level-document';
    }
  };

  const getAgentRole = () => {
    switch (level) {
      case 'space': return 'Space Agent';
      case 'folder': return 'Folder Agent';
      case 'outline': return 'Outline Agent';
      case 'document': return 'Document Agent';
    }
  };

  const getSuggestions = () => {
    switch (level) {
      case 'space':
        return ['Create a new folder called "ideas"', 'List all folders', 'What themes connect across this space?'];
      case 'folder':
        return ['Create an outline for a new chapter', 'Add a quick note', 'What\'s emerging here?'];
      case 'outline':
        return ['Add a point about the main thesis', 'What\'s missing from this structure?', 'Create a document from this outline'];
      case 'document':
        return ['Add a new card with an introduction', 'Compile this document', 'Improve the flow'];
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', getLevelColor())}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">{getAgentRole()}</h2>
            <p className="text-xs text-muted-foreground">{contextLabel}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-6', getLevelColor())}>
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">How can I help?</h3>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-sm">
              I can take actions on {contextLabel}. Ask me to create, edit, or organize your content.
            </p>
            
            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {getSuggestions().map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 text-sm bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 px-6 space-y-6">
            {messages.map(message => (
              <div key={message.id} className="animate-fade-in">
                {message.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-secondary text-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', getLevelColor())}>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      {/* Show actions if any */}
                      {message.toolsUsed && message.actions && message.actions.length > 0 && (
                        <div className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Actions taken
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {message.actions.map((action, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 animate-fade-in">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', getLevelColor())}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex gap-1.5 items-center py-2">
                  <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground">Working on it...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30">
        <div className="relative bg-secondary rounded-xl">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to create, edit, or organize..."
            disabled={isLoading}
            rows={1}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none pl-4 pr-12 py-3 focus:outline-none disabled:opacity-50 max-h-[160px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 bottom-2 p-2 rounded-lg transition-all",
              input.trim() && !isLoading
                ? "bg-foreground text-background hover:opacity-90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
