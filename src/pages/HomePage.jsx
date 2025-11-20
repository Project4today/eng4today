import React from 'react';
import Card from '../components/ui/Card';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Your AI Learning Hub</h1>
        <p className="home-subtitle">Choose a feature to get started</p>
        <div className="feature-cards">
          <Card to="/chat" className="feature-card">
            <h2>AI Chatbot</h2>
            <p>Have a conversation, ask questions, and explore topics with a general AI assistant.</p>
          </Card>
          <Card to="/ielts" className="feature-card">
            <h2>IELTS Speaking Practice</h2>
            <p>Simulate all parts of the IELTS speaking test with an AI examiner.</p>
          </Card>
        </div>
      </div>
      <div className="home-decoration"></div>
    </div>
  );
};

export default HomePage;
