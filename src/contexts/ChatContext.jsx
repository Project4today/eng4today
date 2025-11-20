import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { 
  startNewChat, 
  sendMessage, 
  getChatHistory, 
  getConversations, 
  getPersonas, 
  createPersona, 
  updatePersona, 
  deletePersona 
} from '../api';
import { ChatContext } from './ChatContextDefinition'; // Import ChatContext from its own file

// Custom hook for accessing chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversationsMeta, setConversationsMeta] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversationMessages, setActiveConversationMessages] = useState([]);
  const [personas, setPersonas] = useState([]);
  
  const [activePersona, setActivePersona] = useState(null);
  const [nextMessagePersonaId, setNextMessagePersonaId] = useState(null);
  const [personaToReview, setPersonaToReview] = useState(null);
  const [editingPersona, setEditingPersona] = useState(null);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [botVersion, setBotVersion] = useState(() => localStorage.getItem('bot_version') || 'gemini-2.0-flash');
  const [customVersionInput, setCustomVersionInput] = useState('');

  const GRADIENT_PALETTE = useMemo(() => [
    'linear-gradient(45deg, #ff8a00, #e52e71)',
    'linear-gradient(45deg, #00c6ff, #0072ff)',
    'linear-gradient(45deg, #f857a6, #ff5858)',
    'linear-gradient(45deg, #00dbde, #fc00ff)',
    'linear-gradient(45deg, #56ab2f, #a8e063)',
    'linear-gradient(45deg, #ee0979, #ff6a00)',
  ], []);

  const fetchPersonas = useCallback(async () => {
    const personasData = await getPersonas();
    const personasWithGradients = personasData.map((persona, index) => ({
      ...persona,
      gradient: GRADIENT_PALETTE[index % GRADIENT_PALETTE.length],
    }));
    setPersonas(personasWithGradients);
  }, [GRADIENT_PALETTE]);

  useEffect(() => {
    const loadPersonas = async () => {
      await fetchPersonas();
    };
    loadPersonas().catch(error => console.error("Failed to load personas:", error));
  }, [fetchPersonas]);

  const fetchConversations = useCallback(async () => {
    const meta = await getConversations();
    if (meta) {
      const sortedMeta = meta.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setConversationsMeta(sortedMeta);
      if (sortedMeta.length > 0 && !activeConversationId) {
        setActiveConversationId(sortedMeta[0].session_id);
      }
    }
  }, [activeConversationId]);

  useEffect(() => {
    const loadConversations = async () => {
      await fetchConversations();
    };
    loadConversations().catch(error => console.error("Failed to load conversations:", error));
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId && personas.length > 0) {
      const loadMessages = async () => {
        setActiveConversationMessages([]);
        const sessionData = await getChatHistory(activeConversationId);
        setActiveConversationMessages(sessionData.history || []);
        const currentPersona = personas.find(p => p.prompt_id === sessionData.persona_id);
        setActivePersona(currentPersona);
      };
      loadMessages().catch(error => console.error("Failed to load messages:", error));
    }
  }, [activeConversationId, personas]);

  const handleNewChat = async () => {
    const defaultPersona = personas.find(p => p.role_name === 'English Teacher') || personas[0];
    if (!defaultPersona) return;
    
    setInput('');
    setIsCreatingChat(true);
    try {
      const newSessionData = await startNewChat(defaultPersona.prompt_id);
      if (newSessionData && newSessionData.session_id) {
        setActiveConversationId(newSessionData.session_id);
        setActiveConversationMessages(newSessionData.history || []);
        setActivePersona(personas.find(p => p.prompt_id === newSessionData.persona_id));
        await fetchConversations();
      }
    } catch (error) {
      console.error("Failed to create a new chat session:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isThinking || !activeConversationId) return;

    const userMessage = { role: 'user', content: input };
    setActiveConversationMessages(prev => [...prev, userMessage]);

    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      const updatedSession = await sendMessage(activeConversationId, currentInput, nextMessagePersonaId);
      
      setNextMessagePersonaId(null);
      setActiveConversationMessages(updatedSession.history);
      const currentPersona = personas.find(p => p.prompt_id === updatedSession.persona_id);
      setActivePersona(currentPersona);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSavePersona = async (formData) => {
    try {
      if (formData.prompt_id) {
        await updatePersona(formData.prompt_id, formData);
      } else {
        await createPersona(formData);
      }
      await fetchPersonas();
      setEditingPersona(null);
      setShowPersonaModal(true);
    } catch (error) {
      console.error("Failed to save persona:", error);
    }
  };

  const handleDeletePersona = async (personaId) => {
    try {
      await deletePersona(personaId);
      await fetchPersonas(); // Refresh the list of personas
      // Optionally, if the deleted persona was the active one, clear activePersona
      if (activePersona?.prompt_id === personaId) {
        setActivePersona(null); 
      }
      return { success: true };
    } catch (error) {
      console.error("Error deleting persona:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    conversationsMeta,
    activeConversationId,
    setActiveConversationId,
    activeConversationMessages,
    personas,
    activePersona,
    setActivePersona,
    nextMessagePersonaId,
    setNextMessagePersonaId,
    personaToReview,
    setPersonaToReview,
    editingPersona,
    setEditingPersona,
    input,
    setInput,
    isThinking,
    isSidebarOpen,
    setIsSidebarOpen,
    isCreatingChat,
    showPersonaModal,
    setShowPersonaModal,
    showVersionModal,
    setShowVersionModal,
    botVersion,
    setBotVersion,
    customVersionInput,
    setCustomVersionInput,
    handleNewChat,
    handleSend,
    handleSavePersona,
    handleDeletePersona,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
