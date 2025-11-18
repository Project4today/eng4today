import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './IeltsPage.css';
import { BackButton } from '../App';

// --- Icon Components ---
const MenuIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const SendIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> );
const ExaminerAvatar = () => ( <img src="https://api.dicebear.com/8.x/bottts-neutral/svg?seed=Sarah" alt="Examiner Avatar" className="examiner-avatar" /> );

// Thinking Indicator Component
const ThinkingIndicator = () => (
  <div className="ielts-message-wrapper bot">
    <ExaminerAvatar />
    <div className="ielts-message bot">
      <div className="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
);

const IeltsPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activePart, setActivePart] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const mainInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let initialMessage = "";
    if (activePart === 1) {
      initialMessage = "Hello, my name is Sarah. I'll be your examiner for this part of the test. I'm going to ask you a few questions to get to know you better. Let's start. What is your full name?";
    } else if (activePart === 2) {
      initialMessage = "Now, we'll move on to Part 2. I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You have one minute to think about what you're going to say. You can make some notes if you wish. Here is your topic: **Describe a website you have bought something from.**";
    } else if (activePart === 3) {
      initialMessage = "We've been talking about a website you've bought something from. Now, in Part 3, I'd like to ask you some more general questions related to this. Let's talk about online shopping. What are some of the advantages of shopping online?";
    }
    setMessages([{ role: 'model', content: initialMessage }]);
    mainInputRef.current?.focus();
  }, [activePart]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (input.trim() === '' || isThinking) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    const currentInput = input;
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const botResponse = { role: 'model', content: `That's interesting. [Follow-up question related to Part ${activePart}].` };
      setIsThinking(false);
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  return (
    <div className="ielts-page-layout">
      <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </button>
          <h1 className="sidebar-title">Test Parts</h1>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-btn ${activePart === 1 ? 'active' : ''}`} onClick={() => setActivePart(1)}>
            Part 1: Introduction
          </button>
          <button className={`nav-btn ${activePart === 2 ? 'active' : ''}`} onClick={() => setActivePart(2)}>
            Part 2: Cue Card
          </button>
          <button className={`nav-btn ${activePart === 3 ? 'active' : ''}`} onClick={() => setActivePart(3)}>
            Part 3: Discussion
          </button>
        </nav>
      </div>

      <main className="ielts-chat-area">
        <div className="ielts-header">
          <BackButton />
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} style={{ visibility: isSidebarOpen ? 'hidden' : 'visible' }}>
            <MenuIcon />
          </button>
          <h2>IELTS Speaking Practice</h2>
        </div>
        <div className="ielts-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`ielts-message-wrapper ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.role === 'model' && <ExaminerAvatar />}
              <div className={`ielts-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'model' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}
          {isThinking && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <div className="ielts-input-area">
          <input ref={mainInputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isThinking} placeholder="Speak your answer..."/>
          <button className="ielts-icon-btn" onClick={handleSend} disabled={!input.trim() || isThinking}>
            <SendIcon />
          </button>
        </div>
      </main>
    </div>
  );
};

export default IeltsPage;
