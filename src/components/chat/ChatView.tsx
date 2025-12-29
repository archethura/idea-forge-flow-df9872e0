import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatViewProps {
  messages: ChatMessage[];
  notes: Note[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

export function ChatView({ messages, notes, onSendMessage }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    // Add user message
    onSendMessage({ role: 'user', content: userMessage });

    // Simulate AI thinking
    setIsTyping(true);
    
    // Simulate AI response (in real implementation, this would call an AI API)
    setTimeout(() => {
      const relevantNotes = notes.filter(note => 
        userMessage.toLowerCase().split(' ').some(word => 
          note.title.toLowerCase().includes(word) || 
          note.content.toLowerCase().includes(word)
        )
      );

      let response = '';
      if (relevantNotes.length > 0) {
        response = `Based on your notes, I found ${relevantNotes.length} relevant item${relevantNotes.length > 1 ? 's' : ''}:\n\n`;
        relevantNotes.forEach(note => {
          response += `**${note.title}**: ${note.content.slice(0, 100)}...\n\n`;
        });
        response += 'Would you like me to synthesize these into a deliverable or explore any of these topics further?';
      } else {
        response = "I can help you explore your ideas and research. Try asking about specific topics, or I can help you:\n\n• Summarize your notes\n• Find connections between ideas\n• Generate a deliverable from your research\n• Brainstorm new directions";
      }

      onSendMessage({
        role: 'assistant',
        content: response,
        references: relevantNotes.map(n => n.id),
      });
      setIsTyping(false);
    }, 1500);
  };

  const suggestedQueries = [
    "Summarize my product ideas",
    "What patterns do you see in user feedback?",
    "Create a spec from my research",
    "Find connections between my notes",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold">AI Assistant</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Chat with your notes, ideas, and research. I can help synthesize and find connections.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              Ask me about your notes, ideas, or research. I can help you find patterns and create deliverables.
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
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 animate-slide-up",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* References */}
                  {message.references && message.references.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/30">
                      {message.references.map(refId => {
                        const note = notes.find(n => n.id === refId);
                        return note ? (
                          <span
                            key={refId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background/50 rounded"
                          >
                            <FileText className="w-3 h-3" />
                            {note.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
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
          placeholder="Ask about your notes, ideas, or research..."
          className="w-full bg-secondary rounded-xl px-4 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
