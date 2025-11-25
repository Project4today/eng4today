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
const SpeakerIcon = ({ isPlaying }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isPlaying ? (
            <>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
            </>
        ) : (
            <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </>
        )}
    </svg>
);
const AutoTalkIcon = ({ enabled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d={enabled ? "M19.07 4.93a10 10 0 0 1 0 14.14" : "M22,2 L2,22"}></path>
    </svg>
);

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
  } = useChat();

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAutoTalkEnabled, setIsAutoTalkEnabled] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sendTimeout = useRef(null);
  const audioRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setCurrentlyPlaying(null);
    }
  };

  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    if (currentlyPlaying === audioUrl) {
      stopAudio();
      return;
    }
    stopAudio();

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentlyPlaying(audioUrl);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio playback failed:", error);
        stopAudio();
      });
    }
    audio.onended = stopAudio;
    audio.onerror = stopAudio;
  };

  useEffect(() => {
    if (isAutoTalkEnabled && !isThinking && activeConversationMessages.length > prevMessagesLengthRef.current) {
      const lastMessage = activeConversationMessages[activeConversationMessages.length - 1];
      if (lastMessage?.role === 'model' && lastMessage.audio_url) {
        playAudio(lastMessage.audio_url);
      }
    }
    prevMessagesLengthRef.current = activeConversationMessages.length;
  }, [activeConversationMessages, isAutoTalkEnabled, isThinking]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConversationMessages, isThinking]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isVoiceMode) setInput(transcript);
  }, [transcript, isVoiceMode, setInput]);

  useEffect(() => {
    clearTimeout(sendTimeout.current);
    if (isVoiceMode && transcript) {
      sendTimeout.current = setTimeout(() => {
        if (transcript.trim()) {
          handleSend();
          resetTranscript();
        }
      }, 2000);
    }
    return () => clearTimeout(sendTimeout.current);
  }, [transcript, isVoiceMode, handleSend, resetTranscript]);

  useEffect(() => {
    if (isVoiceMode && !isThinking) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [isVoiceMode, isThinking]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceMode = () => {
    const turningOn = !isVoiceMode;
    if (turningOn) {
      resetTranscript();
      stopAudio();
    } else {
      clearTimeout(sendTimeout.current);
    }
    setIsVoiceMode(turningOn);
  };

  const activeTitle = conversationsMeta.find(c => c.session_id === activeConversationId)?.title || "New Chat";
  const placeholder = listening ? "Listening..." : "Type a message... (Shift + Enter for new line)";

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
              {msg.role === 'model' && msg.audio_url && (
                <Button variant="icon" className="audio-play-btn" onClick={() => playAudio(msg.audio_url)}>
                  <SpeakerIcon isPlaying={currentlyPlaying === msg.audio_url} />
                </Button>
              )}
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
            onKeyDown={handleKeyDown}
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

          {browserSupportsSpeechRecognition && !currentlyPlaying && (
            <Button variant="icon" onClick={toggleVoiceMode} className={listening ? 'listening' : ''} title="Voice Mode">
              <MicrophoneIcon />
            </Button>
          )}

          <Button variant="icon" onClick={() => setIsAutoTalkEnabled(!isAutoTalkEnabled)} className={isAutoTalkEnabled ? 'active' : ''} title="Auto-Talk Mode">
            <AutoTalkIcon enabled={isAutoTalkEnabled} />
          </Button>
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
