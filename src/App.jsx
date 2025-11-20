import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import IeltsPage from './pages/IeltsPage';
import MainLayout from './components/layout/MainLayout';
import { ChatProvider } from './contexts/ChatContext';

// --- Reusable Back Button Component ---
// This can be moved to a UI components directory in Phase 3
export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button className="back-btn" onClick={() => navigate(-1)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      Back
    </button>
  );
};

function App() {
  return (
    <Routes>
      {/* HomePage does not use the MainLayout */}
      <Route path="/" element={<HomePage />} />

      {/* Routes that share the main app layout */}
      <Route 
        path="/chat" 
        element={
          <MainLayout>
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          </MainLayout>
        } 
      />
      <Route 
        path="/ielts" 
        element={
          <MainLayout>
            <IeltsPage />
          </MainLayout>
        } 
      />
    </Routes>
  );
}

export default App;
