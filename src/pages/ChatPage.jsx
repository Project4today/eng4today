import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { startNewChat, sendMessage, getChatHistory, getConversations } from '../api';
import { BackButton } from '../App';

// --- Icon Components ---
const MenuIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const NewChatIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> );
const SendIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> );
const PersonaIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> );
const PromptIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"/><path d="M12 4v12"/><path d="M12 4l-4 4"/><path d="M12 4l4 4"/></svg> );
const BoltIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> );
const SparkleIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2.35M16.24 7.76l-1.77 1.77M21 12h-2.35M16.24 16.24l-1.77-1.77M12 21v-2.35M7.76 16.24l1.77-1.77M3 12h2.35M7.76 7.76l1.77 1.77"/></svg> );
const CustomIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><path d="M18 2l4 4-10 10H8v-4L18 2z"/></svg> );

// Bot Avatar Component
const BotAvatar = () => ( <img src="https://api.dicebear.com/8.x/bottts-neutral/svg?seed=AI" alt="Bot Avatar" className="bot-avatar" /> );

// Thinking Indicator Component
const ThinkingIndicator = () => (
  <div className="message-wrapper bot">
    <BotAvatar />
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

const PREDEFINED_PROMPTS = {
  default: "Bạn là một giáo viên tiếng Anh thân thiện, chuyên gia IELTS band 9.0. Mục tiêu của bạn là giúp người dùng luyện tập kỹ năng giao tiếp và đánh giá các bài viết.",
  ieltsExpert: "Bạn là một chuyên gia IELTS, chuyên đánh giá bài luận Writing Task 2. Hãy tập trung vào tính mạch lạc, ngữ pháp và sự đa dạng của từ vựng. Đưa ra điểm số ước tính dựa trên thang điểm IELTS band 9.",
  friendlyTutor: "Bạn là một giáo viên tiếng Anh thân thiện. Mục tiêu của bạn là giúp người dùng luyện tập kỹ năng giao tiếp.",
};

// Reusable Prompt Selector Component
const PromptSelector = ({ title, description, onSet, onCancel, customValue, onCustomValueChange, currentValue }) => (
  <div className="prompt-content">
    <h3>{title}</h3>
    <p>{description}</p>
    <div className="prompt-options">
      {Object.entries(PREDEFINED_PROMPTS).map(([key, value]) => (
        <button 
          key={key} 
          className={`prompt-option-btn ${currentValue === value ? 'active' : ''}`}
          onClick={() => onSet(value)}
        >
          {key === 'default' && 'Default (IELTS Teacher)'}
          {key === 'ieltsExpert' && 'IELTS Writing Expert'}
          {key === 'friendlyTutor' && 'Friendly English Tutor'}
        </button>
      ))}
    </div>
    <textarea 
      className="prompt-textarea"
      placeholder="Or type a custom instruction here..."
      value={customValue}
      onChange={(e) => onCustomValueChange(e.target.value)}
    />
    <div className="prompt-modal-actions">
      {onCancel && <button className="prompt-modal-cancel-btn" onClick={onCancel}>Cancel</button>}
      <button className="prompt-modal-set-btn" onClick={() => onSet(customValue)}>Apply</button>
    </div>
  </div>
);

const ChatPage = () => {
  const [conversationsMeta, setConversationsMeta] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversationMessages, setActiveConversationMessages] = useState([]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [currentSystemPrompt, setCurrentSystemPrompt] = useState(PREDEFINED_PROMPTS.default);
  const [customPersonaInput, setCustomPersonaInput] = useState('');

  const [showMessageConfigMenu, setShowMessageConfigMenu] = useState(false);
  const [messageSpecificInstruction, setMessageSpecificInstruction] = useState('');

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [botVersion, setBotVersion] = useState(() => {
    return localStorage.getItem('bot_version') || 'gemini-2.0-flash';
  });
  const [customVersionInput, setCustomVersionInput] = useState('');

  const mainInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const personaModalRef = useRef(null);
  const messageConfigPopupRef = useRef(null);
  const versionModalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (personaModalRef.current && !personaModalRef.current.contains(event.target)) { setShowPersonaModal(false); }
      if (messageConfigPopupRef.current && !messageConfigPopupRef.current.contains(event.target)) {
        if (!event.target.closest('.icon-btn[title="Set Instruction for this Message"]')) { setShowMessageConfigMenu(false); }
      }
      if (versionModalRef.current && !versionModalRef.current.contains(event.target)) {
        if (!event.target.closest('.icon-btn[title*="Current Model"]')) { setShowVersionModal(false); }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [personaModalRef, messageConfigPopupRef, versionModalRef]);

  const fetchConversations = useCallback(async () => {
    const meta = await getConversations();
    if (meta) {
      const sortedMeta = meta.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setConversationsMeta(sortedMeta);
      if ((!activeConversationId || !sortedMeta.find(c => c.session_id === activeConversationId)) && sortedMeta.length > 0) {
        setActiveConversationId(sortedMeta[0].session_id);
      } else if (sortedMeta.length === 0) {
        handleNewChat();
      }
    }
  }, [activeConversationId]);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (activeConversationId) {
      const loadMessages = async () => {
        setActiveConversationMessages([]);
        const messages = await getChatHistory(activeConversationId);
        setActiveConversationMessages(messages);
      };
      loadMessages();
    }
  }, [activeConversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConversationMessages, isThinking]);

  const handleNewChat = async () => {
    setInput('');
    setIsCreatingChat(true);
    try {
      const newSessionData = await startNewChat(currentSystemPrompt);
      if (newSessionData && newSessionData.session_id) {
        setActiveConversationId(newSessionData.session_id);
        setActiveConversationMessages(newSessionData.history || []);
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

    const isFirstMessage = activeConversationMessages.length === 0;
    const userMessage = { role: 'user', content: input };
    
    // Optimistic update for user message
    setActiveConversationMessages(prev => [...prev, userMessage]);

    const currentInput = input;
    setInput('');
    setIsThinking(true);

    let config = { bot_version: botVersion };
    if (messageSpecificInstruction) {
      config.system_instruction = messageSpecificInstruction;
    } else if (isFirstMessage) {
      config.system_instruction = currentSystemPrompt;
    }

    // Send message and wait for backend to be fully updated
    await sendMessage(activeConversationId, currentInput, config);
    
    // Clear one-time instruction
    setMessageSpecificInstruction('');
    setShowMessageConfigMenu(false);

    // Fetch the definitive, updated history from the server
    const updatedMessages = await getChatHistory(activeConversationId);
    setActiveConversationMessages(updatedMessages);
    setIsThinking(false);

    // Refresh sidebar if it was the first message
    if (isFirstMessage) {
      await fetchConversations();
    }
  };

  const handleSetPersona = (prompt) => {
    setCurrentSystemPrompt(prompt || PREDEFINED_PROMPTS.default);
    setCustomPersonaInput(prompt);
    setShowPersonaModal(false);
  };

  const handleSetMessageInstruction = (instruction) => {
    setMessageSpecificInstruction(instruction);
    setShowMessageConfigMenu(false);
  };

  const handleSetVersion = (version) => {
    const newVersion = version || 'gemini-flash-latest';
    setBotVersion(newVersion);
    localStorage.setItem('bot_version', newVersion);
    setShowVersionModal(false);
  };

  const activeTitle = conversationsMeta.find(c => c.session_id === activeConversationId)?.title || "New Chat";

  return (
    <div className="app-layout">
      {showPersonaModal && (
        <div className="prompt-modal-overlay">
          <div className="prompt-modal-content" ref={personaModalRef}>
            <PromptSelector
              title="Set AI Persona for New Chats"
              description="Choose a default role for the AI for all new conversations."
              currentValue={currentSystemPrompt}
              customValue={customPersonaInput}
              onCustomValueChange={setCustomPersonaInput}
              onSet={handleSetPersona}
              onCancel={() => setShowPersonaModal(false)}
            />
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className="prompt-modal-overlay">
          <div className="prompt-modal-content" ref={versionModalRef}>
            <h3>Select Bot Version</h3>
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
              <button className="prompt-modal-cancel-btn" onClick={() => setShowVersionModal(false)}>Cancel</button>
              <button className="prompt-modal-set-btn" onClick={() => handleSetVersion(customVersionInput)}>Apply Custom</button>
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
            <button className="icon-btn persona-btn" onClick={() => setShowPersonaModal(true)} title="Set AI Persona for New Chats">
              <PersonaIcon />
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
              {msg.role === 'model' && <BotAvatar />}
              <div className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'model' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}
          {isThinking && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          {showMessageConfigMenu && (
            <div className="message-config-popup" ref={messageConfigPopupRef}>
              <PromptSelector
                title="Message-Specific Instruction"
                description="This instruction will only be used for the next message you send."
                currentValue={messageSpecificInstruction}
                customValue={messageSpecificInstruction}
                onCustomValueChange={setMessageSpecificInstruction}
                onSet={handleSetMessageInstruction}
              />
            </div>
          )}
          <input ref={mainInputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isThinking} placeholder="Type a message..."/>
          <button className="icon-btn" onClick={() => setShowMessageConfigMenu(!showMessageConfigMenu)} title="Set Instruction for this Message">
            <PromptIcon />
          </button>
          <button className="icon-btn" onClick={() => setShowVersionModal(true)} title={`Current Model: ${botVersion}`}>
            {botVersion.includes('pro') ? <SparkleIcon /> : (botVersion.includes('flash') ? <BoltIcon /> : <CustomIcon />)}
          </button>
          <button className="icon-btn" onClick={handleSend} disabled={!input.trim() || isThinking}>
            <SendIcon />
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
