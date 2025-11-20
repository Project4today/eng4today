import React from 'react';
import {useChat} from '../../contexts/ChatContext';
import Button from '../ui/Button';
import {version} from '../../../package.json';

// --- Icon Components ---
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>);
const NewChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>);

const formatUpdatedAt = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
};

const Sidebar = () => {
    const {
        isSidebarOpen,
        setIsSidebarOpen,
        conversationsMeta,
        activeConversationId,
        setActiveConversationId,
        handleNewChat,
        isCreatingChat,
    } = useChat();

    return (
        <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
            <div className="sidebar-header">
                <Button variant="icon" onClick={() => setIsSidebarOpen(false)}>
                    <MenuIcon/>
                </Button>
                <h1 className="sidebar-title">Chat History</h1>
                <span className="version-tag">v{version}</span>
            </div>
            <nav className="sidebar-nav">
                <div className="new-chat-controls">
                    <Button variant="secondary" onClick={handleNewChat} disabled={isCreatingChat}>
                        <NewChatIcon/>
                        {isCreatingChat ? "Creating..." : "New Chat"}
                    </Button>
                </div>
                <div className="history-list">
                    {conversationsMeta.map(convo => {
                        const { updated_at, session_id, title } = convo;
                        return (
                            <Button
                                key={session_id}
                                variant="secondary"
                                className={`history-item ${session_id === activeConversationId ? 'active' : ''}`}
                                onClick={() => setActiveConversationId(session_id)}
                            >
                                <span className="history-item-title">{title}</span>
                                <span className="history-item-date">{formatUpdatedAt(updated_at)}</span>
                            </Button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
