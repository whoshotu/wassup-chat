import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SlangItem {
  term: string;
  definition: string;
  context: string;
}

export interface DecodedMessage {
  id: string;
  originalText: string;
  detectedLanguage: string;
  region: string;
  plainExplanation: string;
  slangItems: SlangItem[];
  toneTags: string[];
  timestamp: number;
  isFavorite: boolean;
}

interface MessageHistoryContextType {
  messages: DecodedMessage[];
  addMessage: (message: Omit<DecodedMessage, 'id' | 'timestamp' | 'isFavorite'>) => void;
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

  const addMessage = (message: Omit<DecodedMessage, 'id' | 'timestamp' | 'isFavorite'>) => {
    const newMessage: DecodedMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
      isFavorite: false,
    };
    setMessages((prev) => [newMessage, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, isFavorite: !msg.isFavorite } : msg
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
    return messages.filter((msg) => msg.isFavorite);
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
