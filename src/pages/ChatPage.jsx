import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import InitialsAvatar from 'react-initials-avatar';
import { startNewChat, sendMessage, getChatHistory, getConversations, getPersonas, createPersona, updatePersona, deletePersona } from '../api';
import { BackButton } from '../App';
import PersonaDetailView from './PersonaDetailView';
import PersonaForm from './PersonaForm';
import { version } from '../../package.json';

// --- Icon Components ---
const MenuIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const NewChatIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> );
const SendIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> );
const PersonaIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> );
const BoltIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> );
const SparkleIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2.35M16.24 7.76l-1.77 1.77M21 12h-2.35M16.24 16.24l-1.77-1.77M12 21v-2.35M7.76 16.24l1.77-1.77M3 12h2.35M7.76 7.76l1.77 1.77"/></svg> );
const CustomIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><path d="M18 2l4 4-10 10H8v-4L18 2z"/></svg> );
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// --- Reusable Avatar Component ---
const Avatar = ({ persona, className }) => {
  if (persona?.avatar_url) {
    return <img src={persona.avatar_url} alt={persona.role_name} className={className} />;
  }
  const style = { background: persona?.gradient || 'linear-gradient(45deg, #8a2be2, #4169e1)' };
  return (
    <div className={`${className} initials-avatar-wrapper`} style={style}>
      <InitialsAvatar name={persona?.role_name || 'AI'} />
    </div>
  );
};

// Bot Avatar Component
const BotAvatar = ({ persona }) => <Avatar persona={persona} className="bot-avatar" />;

// Thinking Indicator Component
const ThinkingIndicator = ({ persona }) => (
  <div className="message-wrapper bot">
    <BotAvatar persona={persona} />
    <div className="message bot">
      <div className="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
);

// Helper to format date
const formatUpdatedAt = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Reusable Persona Selector Component
const PersonaSelector = ({ title, description, onSet, onReview, onCreate, currentPersonaId, personas }) => (
  <div className="prompt-content">
    <div className="prompt-header">
      <h3>{title}</h3>
      <button className="create-new-btn" onClick={onCreate}>+ Create New</button>
    </div>
    <p>{description}</p>
    <div className="prompt-options">
      {personas.map(persona => (
        <div key={persona.prompt_id} className="prompt-option-container">
          <button 
            className={`prompt-option-btn ${currentPersonaId === persona.prompt_id ? 'active' : ''}`}
            onClick={() => onSet(persona.prompt_id)}
          >
            {persona.role_name}
          </button>
          <button className="review-btn" onClick={() => onReview(persona)}>
            <EyeIcon />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ChatPage = () => {
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

  const mainInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const personaModalRef = useRef(null);
  const versionModalRef = useRef(null);

  const GRADIENT_PALETTE = [
    'linear-gradient(45deg, #ff8a00, #e52e71)',
    'linear-gradient(45deg, #00c6ff, #0072ff)',
    'linear-gradient(45deg, #f857a6, #ff5858)',
    'linear-gradient(45deg, #00dbde, #fc00ff)',
    'linear-gradient(45deg, #56ab2f, #a8e063)',
    'linear-gradient(45deg, #ee0979, #ff6a00)',
  ];

  const fetchPersonas = async () => {
    const personasData = await getPersonas();
    const personasWithGradients = personasData.map((persona, index) => ({
      ...persona,
      gradient: GRADIENT_PALETTE[index % GRADIENT_PALETTE.length],
    }));
    setPersonas(personasWithGradients);
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleCancelEdit = () => {
    setEditingPersona(null);
    setShowPersonaModal(true);
  };

  const handleCloseDetailView = () => {
    setPersonaToReview(null);
    setShowPersonaModal(true);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (showPersonaModal && personaModalRef.current && !personaModalRef.current.contains(event.target)) {
        setShowPersonaModal(false);
      }
      if (showVersionModal && versionModalRef.current && !versionModalRef.current.contains(event.target)) {
        if (!event.target.closest('.icon-btn[title*="Current Model"]')) {
          setShowVersionModal(false);
        }
      }
      if (editingPersona && !event.target.closest('.persona-form-content')) {
        handleCancelEdit();
      }
      if (personaToReview && !event.target.closest('.persona-cv-content')) {
        handleCloseDetailView();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [showPersonaModal, showVersionModal, editingPersona, personaToReview]);

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
    fetchConversations();
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
      loadMessages();
    }
  }, [activeConversationId, personas]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConversationMessages, isThinking]);

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

    const updatedSession = await sendMessage(activeConversationId, currentInput, nextMessagePersonaId);
    
    setNextMessagePersonaId(null);
    setActiveConversationMessages(updatedSession.history);
    const currentPersona = personas.find(p => p.prompt_id === updatedSession.persona_id);
    setActivePersona(currentPersona);

    setIsThinking(false);
  };

  const handlePersonaChange = (newPersonaId) => {
    setNextMessagePersonaId(newPersonaId);
    const newPersona = personas.find(p => p.prompt_id === newPersonaId);
    setActivePersona(newPersona);
    setShowPersonaModal(false);
  };

  const handleSavePersona = async (formData) => {
    if (formData.prompt_id) {
      await updatePersona(formData.prompt_id, formData);
    } else {
      await createPersona(formData);
    }
    await fetchPersonas();
    setEditingPersona(null);
    setShowPersonaModal(true);
  };

  const handleDeletePersona = async (personaId) => {
    if (window.confirm("Are you sure you want to delete this persona? This action cannot be undone.")) {
      await deletePersona(personaId);
      setPersonaToReview(null);
      await fetchPersonas();
      setShowPersonaModal(true);
    }
  };

  const handleSetVersion = (version) => {
    if (!version) return;
    const newVersion = version.trim();
    setBotVersion(newVersion);
    localStorage.setItem('bot_version', newVersion);
    setShowVersionModal(false);
    setCustomVersionInput('');
  };

  const activeTitle = conversationsMeta.find(c => c.session_id === activeConversationId)?.title || "New Chat";

  return (
    <div className="app-layout">
      {editingPersona && (
        <PersonaForm 
          persona={editingPersona === 'new' ? null : editingPersona}
          onSave={handleSavePersona}
          onCancel={handleCancelEdit}
        />
      )}

      {personaToReview && (
        <PersonaDetailView 
          persona={personaToReview} 
          onClose={handleCloseDetailView}
          onEdit={() => {
            setEditingPersona(personaToReview);
            setPersonaToReview(null);
          }}
          onDelete={handleDeletePersona}
        />
      )}

      {showPersonaModal && (
        <div className="prompt-modal-overlay" onClick={() => setShowPersonaModal(false)}>
          <div className="modal-container" ref={personaModalRef}>
            <button className="modal-close-btn" onClick={() => setShowPersonaModal(false)}><CloseIcon /></button>
            <div className="prompt-modal-content" onClick={(e) => e.stopPropagation()}>
              <PersonaSelector
                title="Switch AI Persona"
                description="Select a new persona for the current conversation."
                currentPersonaId={nextMessagePersonaId || activePersona?.prompt_id}
                onSet={handlePersonaChange}
                onReview={(persona) => {
                  setShowPersonaModal(false);
                  setPersonaToReview(persona);
                }}
                onCreate={() => {
                  setShowPersonaModal(false);
                  setEditingPersona('new');
                }}
                personas={personas}
              />
            </div>
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className="prompt-modal-overlay" onClick={() => setShowVersionModal(false)}>
          <div className="modal-container" ref={versionModalRef}>
            <button className="modal-close-btn" onClick={() => setShowVersionModal(false)}><CloseIcon /></button>
            <div className="prompt-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="prompt-header">
                <h3>Select Bot Version</h3>
              </div>
              <p>Choose a model version for the AI's responses.</p>
              <div className="prompt-options">
                <button className={`prompt-option-btn ${botVersion === 'gemini-2.0-flash' ? 'active' : ''}`} onClick={() => handleSetVersion('gemini-2.0-flash')}>2.0 Flash (Default)</button>
                <button className={`prompt-option-btn ${botVersion === 'gemini-2.0-flash-lite' ? 'active' : ''}`} onClick={() => handleSetVersion('gemini-2.0-flash-lite')}>2.0 Flash Lite</button>
                <button className={`prompt-option-btn ${botVersion === 'gemini-pro-latest' ? 'active' : ''}`} onClick={() => handleSetVersion('gemini-pro-latest')}>1.0 Pro (Legacy)</button>
                <button className={`prompt-option-btn ${botVersion === 'gemini-flash-latest' ? 'active' : ''}`} onClick={() => handleSetVersion('gemini-flash-latest')}>1.0 Flash (Legacy)</button>
              </div>
              <input 
                type="text"
                className="prompt-textarea"
                placeholder="Or enter a custom version name..."
                value={customVersionInput}
                onChange={(e) => setCustomVersionInput(e.target.value)}
              />
              <div className="prompt-modal-actions">
                <button className="prompt-modal-set-btn" onClick={() => handleSetVersion(customVersionInput)}>Apply Custom</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(false)}>
            <MenuIcon />
          </button>
          <h1 className="sidebar-title">Chat History</h1>
        </div>
        <nav className="sidebar-nav">
          <div className="new-chat-controls">
            <button className="nav-btn new-chat-btn" onClick={handleNewChat} disabled={isCreatingChat}>
              <NewChatIcon />
              {isCreatingChat ? "Creating..." : "New Chat"}
            </button>
          </div>
          <div className="history-list">
            {conversationsMeta.map(convo => (
              <button 
                key={convo.session_id} 
                className={`history-item ${convo.session_id === activeConversationId ? 'active' : ''}`}
                onClick={() => setActiveConversationId(convo.session_id)}
              >
                <span className="history-item-title">{convo.title}</span>
                <span className="history-item-date">{formatUpdatedAt(convo.updated_at)}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <span className="version-tag">Version {version}</span>
          </div>
        </nav>
      </div>

      <main className="chat-area">
        <div className="chat-header">
          <BackButton />
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} style={{ visibility: isSidebarOpen ? 'hidden' : 'visible' }}>
            <MenuIcon />
          </button>
          <h2>{activeTitle}</h2>
        </div>
        <div className="messages">
          {activeConversationMessages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.role === 'model' && <BotAvatar persona={activePersona} />}
              <div className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'model' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}
          {isThinking && <ThinkingIndicator persona={activePersona} />}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area-wrapper">
          <div className="input-area">
            <button className="icon-btn persona-switcher-btn" onClick={() => setShowPersonaModal(true)} title="Switch Persona">
              <Avatar persona={activePersona} className="chat-avatar-icon" />
            </button>
            <input ref={mainInputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isThinking} placeholder="Type a message..."/>
            <button className="icon-btn" onClick={() => setShowVersionModal(true)} title={`Current Model: ${botVersion}`}>
              {botVersion.includes('pro') ? <SparkleIcon /> : (botVersion.includes('flash') ? <BoltIcon /> : <CustomIcon />)}
            </button>
            <button className="icon-btn" onClick={handleSend} disabled={!input.trim() || isThinking}>
              <SendIcon />
            </button>
          </div>
          <p className="disclaimer">
            E4TD Chatbot may make mistakes. Please verify its answers and provide <a href="#">feedback here</a> to help us improve.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
