import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import IeltsPage from './pages/IeltsPage';
import Header from './Header'; // Import the new Header component
import './App.css';

// --- Reusable Back Button Component ---
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

// A layout component to wrap pages that need the centered, padded container
const PageContainer = ({ children }) => {
  return (
    <div className="page-container">
      <Header />
      {children}
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/chat" 
        element={
          <PageContainer>
            <ChatPage />
          </PageContainer>
        } 
      />
      <Route 
        path="/ielts" 
        element={
          <PageContainer>
            <IeltsPage />
          </PageContainer>
        } 
      />
    </Routes>
  );
}

export default App;
