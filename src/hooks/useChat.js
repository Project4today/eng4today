import { useContext } from 'react';
import { ChatContext } from '../contexts/ChatContextDefinition'; // Updated import path

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === null) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
