// labwatch-app/modules/assistant/hooks/useChat.ts
import { Message } from '@/types/assistant';
import { useCallback, useState } from 'react';
import 'react-native-get-random-values'; // Required for uuid
import { v4 as uuidv4 } from 'uuid';
import { AssistantService } from '../services/AssistantServices';

export const useChat = (initialMessagesFromProp: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessagesFromProp && initialMessagesFromProp.length > 0) {
      return initialMessagesFromProp;
    }
    // Updated initial welcome message for the Lab Safety Officer
    return [
      {
        id: uuidv4(),
        text: 'Welcome! I am your Lab Safety and Monitoring Officer. How can I assist you with lab safety protocols, monitoring data, or emergency procedures today?',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    const currentConversationState = [...messages];

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      {
        id: uuidv4(),
        text: '...', 
        sender: 'assistant',
        timestamp: new Date(),
        isLoading: true,
      }
    ]);

    setIsLoading(true);
    setError(null);

    let historyForAPI: { role: string; parts: { text: string }[] }[] = [];
    const firstUserMessageIndex = currentConversationState.findIndex(msg => msg.sender === 'user');

    if (firstUserMessageIndex !== -1) {
      historyForAPI = currentConversationState
        .slice(firstUserMessageIndex)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));
    }

    try {
      const assistantResponseText = await AssistantService.sendMessage(historyForAPI, text);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        text: assistantResponseText,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), 
        assistantMessage
      ]);
    } catch (e: any) {
      console.error('Failed to send message or get response in useChat:', e);
      const errorMessageText = e.message || 'Sorry, I encountered an error processing your request.';
      setError(errorMessageText);
      const errorMessage: Message = {
        id: uuidv4(),
        text: errorMessageText,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), 
        errorMessage
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return { messages, isLoading, error, sendMessage };
};