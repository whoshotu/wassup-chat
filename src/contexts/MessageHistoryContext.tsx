import React, { createContext, useContext, useState, useEffect } from 'react';

import { DecodedMessage, SlangItem } from '@/types';

interface MessageHistoryContextType {
  messages: DecodedMessage[];
  addMessage: (message: Omit<DecodedMessage, 'id' | 'createdAt' | 'isFavorite'>) => void;
  toggleFavorite: (id: string) => void;
  searchMessages: (query: string) => DecodedMessage[];
  getFavorites: () => DecodedMessage[];
}

const MessageHistoryContext = createContext<MessageHistoryContextType | undefined>(undefined);

export function MessageHistoryProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<DecodedMessage[]>([]);

  useEffect(() => {
    // Load messages from localStorage on mount
    const storedMessages = localStorage.getItem('chatDecoder_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (messages.length > 0) {
      localStorage.setItem('chatDecoder_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = (message: Omit<DecodedMessage, 'id' | 'createdAt' | 'favorited'>) => {
    const newMessage: DecodedMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      favorited: false,
    };
    setMessages((prev) => [newMessage, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, favorited: !msg.favorited } : msg
      )
    );
  };

  const searchMessages = (query: string): DecodedMessage[] => {
    const lowerQuery = query.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.originalText.toLowerCase().includes(lowerQuery) ||
        msg.plainExplanation.toLowerCase().includes(lowerQuery) ||
        msg.detectedLanguage.toLowerCase().includes(lowerQuery)
    );
  };

  const getFavorites = (): DecodedMessage[] => {
    return messages.filter((msg) => msg.favorited);
  };

  return (
    <MessageHistoryContext.Provider
      value={{
        messages,
        addMessage,
        toggleFavorite,
        searchMessages,
        getFavorites,
      }}
    >
      {children}
    </MessageHistoryContext.Provider>
  );
}

export function useMessageHistory() {
  const context = useContext(MessageHistoryContext);
  if (context === undefined) {
    throw new Error('useMessageHistory must be used within a MessageHistoryProvider');
  }
  return context;
}
