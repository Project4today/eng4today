import React from 'react';

// --- Icons for CV Sections ---
const GoalIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const PersonalityIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><path d="M18 2l4 4-10 10H8v-4L18 2z"></path></svg>;
const RulesIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ContextIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const NotesIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const CVSection = ({ title, icon, children }) => (
  <div className="cv-section">
    <h3 className="cv-section-title">{icon}<span>{title}</span></h3>
    <div className="cv-section-content">
      {children}
    </div>
  </div>
);

const PersonaDetailView = ({ persona, onClose }) => {
  if (!persona) return null;

  return (
    <div className="persona-cv-overlay" onClick={onClose}>
      <div className="persona-cv-content" onClick={(e) => e.stopPropagation()}>
        <button className="cv-close-btn" onClick={onClose}><CloseIcon /></button>
        
        <header className="cv-header">
          <div className="cv-avatar">
            {persona.avatar_url ? (
              <img src={persona.avatar_url} alt={persona.role_name} />
            ) : (
              <div className="initials-avatar-cv" style={{ background: persona.gradient }}>
                <span>{persona.role_name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="cv-header-info">
            <h1 className="cv-role-name">{persona.role_name}</h1>
            <p className="cv-expertise">{persona.expertise || 'Generalist'}</p>
          </div>
        </header>

        <main className="cv-body">
          <CVSection title="Primary Goal" icon={<GoalIcon />}>
            <p>{persona.goal}</p>
          </CVSection>

          <div className="cv-columns">
            <div className="cv-column">
              <CVSection title="Core Personality" icon={<PersonalityIcon />}>
                <p>{persona.personality}</p>
              </CVSection>
              <CVSection title="Tone of Voice" icon={<NotesIcon />}>
                <p>{persona.tone_of_voice || 'Not specified.'}</p>
              </CVSection>
            </div>
            <div className="cv-column">
              <CVSection title="Operational Context" icon={<ContextIcon />}>
                <p><strong>Setting:</strong> {persona.setting}</p>
                <p><strong>Situation:</strong> {persona.situation || 'Standard interaction.'}</p>
              </CVSection>
            </div>
          </div>

          <CVSection title="Directives & Constraints" icon={<RulesIcon />}>
            <div className="cv-rules">
              <div className="cv-rule-card must-do">
                <h4>Must Do</h4>
                <p>{persona.must_do_rules || 'Follow standard interaction protocols.'}</p>
              </div>
              <div className="cv-rule-card must-not-do">
                <h4>Must Not Do</h4>
                <p>{persona.must_not_do_rules || 'No specific restrictions.'}</p>
              </div>
            </div>
          </CVSection>
          
          {persona.additional_notes && (
            <CVSection title="Additional Notes" icon={<NotesIcon />}>
              <p className="cv-notes">{persona.additional_notes}</p>
            </CVSection>
          )}
        </main>
      </div>
    </div>
  );
};

export default PersonaDetailView;
