import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, ChatMessage } from '@/types/database';
import { toast } from 'sonner';

export const useChats = (folderId: string | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!folderId) {
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('folder_id', folderId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = async (title?: string) => {
    if (!folderId) return null;

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          folder_id: folderId,
          title: title || 'New Chat',
        })
        .select()
        .single();

      if (error) throw error;
      setChats(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return null;
    }
  };

  const updateChat = async (id: string, updates: Partial<Chat>) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setChats(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
      console.error('Error updating chat:', error);
      toast.error('Failed to update chat');
    }
  };

  const deleteChat = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setChats(prev => prev.filter(c => c.id !== id));
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  return {
    chats,
    loading,
    createChat,
    updateChat,
    deleteChat,
    refetch: fetchChats,
  };
};

export const useChatMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant',
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = async (role: 'user' | 'assistant', content: string, referencesIds?: string[]) => {
    if (!chatId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          role,
          content,
          references_ids: referencesIds || [],
        })
        .select()
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, {
        ...data,
        role: data.role as 'user' | 'assistant',
      }]);
      return data as ChatMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error('Failed to send message');
      return null;
    }
  };

  return {
    messages,
    loading,
    addMessage,
    setMessages,
    refetch: fetchMessages,
  };
};

// Hook to fetch all chats with their messages for a folder
export const useChatsWithMessages = (folderId: string | null) => {
  const [chatsWithMessages, setChatsWithMessages] = useState<{ chat: Chat; messages: ChatMessage[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatsWithMessages = useCallback(async () => {
    if (!folderId) {
      setChatsWithMessages([]);
      setLoading(false);
      return;
    }

    try {
      // First fetch all chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('folder_id', folderId)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Then fetch messages for each chat
      const result: { chat: Chat; messages: ChatMessage[] }[] = [];
      
      for (const chat of (chatsData || [])) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages for chat:', chat.id, messagesError);
          continue;
        }

        result.push({
          chat,
          messages: (messagesData || []).map(msg => ({
            ...msg,
            role: msg.role as 'user' | 'assistant',
          })),
        });
      }

      setChatsWithMessages(result);
    } catch (error) {
      console.error('Error fetching chats with messages:', error);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchChatsWithMessages();
  }, [fetchChatsWithMessages]);

  return {
    chatsWithMessages,
    loading,
    refetch: fetchChatsWithMessages,
  };
};
