import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import InitialsAvatar from 'react-initials-avatar';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useChat } from '../../contexts/ChatContext';
import { BackButton } from '../../App';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

// --- Icon Components ---
const MenuIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const SendIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> );
const BoltIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> );
const SparkleIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2.35M16.24 7.76l-1.77 1.77M21 12h-2.35M16.24 16.24l-1.77-1.77M12 21v-2.35M7.76 16.24l1.77-1.77M3 12h2.35M7.76 7.76l1.77 1.77"/></svg> );
const CustomIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><path d="M18 2l4 4-10 10H8v-4L18 2z"/></svg> );
const MicrophoneIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg> );

/**
 * @typedef {object} Persona
 * @property {string} [avatar_url] - URL for the persona's avatar image.
 * @property {string} role_name - The name of the persona's role.
 * @property {string} [gradient] - CSS gradient string for background if no avatar_url.
 */

/**
 * @typedef {object} ConversationMeta
 * @property {string} session_id - The ID of the conversation session.
 * @property {string} title - The title of the conversation.
 */

/**
 * @typedef {object} ChatContextType
 * @property {Array<object>} activeConversationMessages - Array of active conversation messages.
 * @property {Persona} activePersona - The active persona object.
 * @property {boolean} isThinking - Indicates if the bot is currently thinking.
 * @property {string} input - The current input text.
 * @property {function(string): void} setInput - Function to set the input text.
 * @property {function(): void} handleSend - Function to handle sending a message.
 * @property {boolean} isSidebarOpen - Indicates if the sidebar is open.
 * @property {function(boolean): void} setIsSidebarOpen - Function to set sidebar open state.
 * @property {Array<ConversationMeta>} conversationsMeta - Array of conversation metadata.
 * @property {string} activeConversationId - The ID of the active conversation.
 * @property {function(boolean): void} setShowPersonaModal - Function to show/hide persona modal.
 * @property {function(boolean): void} setShowVersionModal - Function to show/hide version modal.
 * @property {string} botVersion - The current bot version.
 */

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

const BotAvatar = ({ persona }) => <Avatar persona={persona} className="bot-avatar" />;

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

const ChatArea = () => {
  const {
    activeConversationMessages,
    activePersona,
    isThinking,
    input,
    setInput,
    handleSend,
    isSidebarOpen,
    setIsSidebarOpen,
    conversationsMeta,
    activeConversationId,
    setShowPersonaModal,
    setShowVersionModal,
    botVersion,
  } = /** @type {ChatContextType} */ (useChat());

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sendTimeout = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConversationMessages, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Update input from transcript when in voice mode
  useEffect(() => {
    if (isVoiceMode) {
      setInput(transcript);
    }
  }, [transcript, isVoiceMode, setInput]);

  // Auto-send on pause
  useEffect(() => {
    clearTimeout(sendTimeout.current);
    if (isVoiceMode && transcript) {
      sendTimeout.current = setTimeout(() => {
        if (transcript.trim()) {
          handleSend();
          resetTranscript();
        }
      }, 2000); // 2-second pause
    }
    return () => clearTimeout(sendTimeout.current);
  }, [transcript, isVoiceMode, handleSend, resetTranscript]);

  // Control listening state based on isVoiceMode and isThinking
  useEffect(() => {
    if (isVoiceMode && !isThinking) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [isVoiceMode, isThinking]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceMode = () => {
    const turningOn = !isVoiceMode;
    if (turningOn) {
      resetTranscript();
    } else {
      clearTimeout(sendTimeout.current);
    }
    setIsVoiceMode(turningOn);
  };

  const activeTitle = conversationsMeta.find(c => c.session_id === activeConversationId)?.title || "New Chat";

  const placeholder = listening
    ? "Listening..."
    : "Type a message... (Shift + Enter for new line)";

  return (
    <main className="chat-area">
      <div className="chat-header">
        <BackButton />
        <Button variant="icon" onClick={() => setIsSidebarOpen(true)} style={{ visibility: isSidebarOpen ? 'hidden' : 'visible' }}><MenuIcon /></Button>
        <h3>{activeTitle}</h3>
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
        <div className="chat-input-area">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isThinking || listening}
            placeholder={placeholder}
            rows={1}
            className="chat-input"
          />
          <Button variant="icon" className="persona-switcher-btn" onClick={() => setShowPersonaModal(true)} title="Switch Persona">
            <Avatar persona={activePersona} className="chat-avatar-icon" />
          </Button>
          <Button variant="icon" onClick={() => setShowVersionModal(true)} title={`Current Model: ${botVersion}`}>
            {botVersion.includes('pro') ? <SparkleIcon /> : (botVersion.includes('flash') ? <BoltIcon /> : <CustomIcon />)}
          </Button>
          {browserSupportsSpeechRecognition && (
            <Button variant="icon" onClick={toggleVoiceMode} className={listening ? 'listening' : ''}>
              <MicrophoneIcon />
            </Button>
          )}
          <Button variant="icon" onClick={handleSend} disabled={!input.trim() || isThinking}>
            <SendIcon />
          </Button>
        </div>
        <p className="disclaimer">
          E4TD Chatbot may make mistakes. Please verify its answers and provide <a href="#">feedback here</a> to help us improve.
        </p>
      </div>
    </main>
  );
};

export default ChatArea;
