import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHierarchicalContext } from '@/hooks/useHierarchicalContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function HierarchicalChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const context = useHierarchicalContext();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        context,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error('No response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { id: crypto.randomUUID(), role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, [context]);

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
      await streamChat([...messages, userMessage]);
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

  const getContextLabel = () => {
    if (context.document) return `Document: ${context.document.title}`;
    if (context.outline) return `Outline: ${context.outline.title}`;
    if (context.folder) return `Folder: ${context.folder.name}`;
    if (context.space) return `Space: ${context.space.name}`;
    return 'No context selected';
  };

  const suggestedQueries = [
    'Summarize my notes',
    'What patterns do you see?',
    'Help me structure this outline',
    'Find connections between ideas',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="w-4 h-4" />
          <span>{getContextLabel()}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              I can see your {context.level} content and help you explore ideas.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {suggestedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setInput(query)}
                  className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about your content..."
          disabled={isLoading}
          className="w-full bg-secondary rounded-xl px-4 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
