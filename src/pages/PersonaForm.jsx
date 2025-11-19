import React, { useState, useEffect } from 'react';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const FormField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) => (
  <div className="form-field">
    <label htmlFor={name}>{label}{required && <span className="required-star">*</span>}</label>
    {type === 'textarea' ? (
      <textarea id={name} name={name} value={value || ''} onChange={onChange} rows="4" placeholder={placeholder} />
    ) : (
      <input type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} />
    )}
  </div>
);

const PersonaForm = ({ persona, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(persona || {});
  }, [persona]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="persona-form-overlay" onClick={onCancel}>
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onCancel}><CloseIcon /></button>
        <div className="persona-form-content" onClick={(e) => e.stopPropagation()}>
          <header className="form-header">
            <h2>{persona ? 'Edit Persona' : 'Create New Persona'}</h2>
            <p>{persona ? 'Update the details for this AI character.' : 'Define a new AI character from scratch.'}</p>
          </header>
          
          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-column">
              <FormField label="Role Name" name="role_name" value={formData.role_name} onChange={handleChange} required placeholder="e.g., Sarcastic Robot" />
              <FormField label="Avatar URL" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="https://example.com/image.png" />
              <FormField label="Expertise" name="expertise" value={formData.expertise} onChange={handleChange} type="textarea" placeholder="e.g., Quantum physics, 18th-century poetry" />
              <FormField label="Goal" name="goal" value={formData.goal} onChange={handleChange} type="textarea" required placeholder="What is this persona's primary objective?" />
              <FormField label="Personality" name="personality" value={formData.personality} onChange={handleChange} type="textarea" required placeholder="e.g., Witty, melancholic, and fiercely loyal" />
            </div>
            
            <div className="form-column">
              <FormField label="Setting" name="setting" value={formData.setting} onChange={handleChange} type="textarea" required placeholder="Where is the character?" />
              <FormField label="Situation" name="situation" value={formData.situation} onChange={handleChange} type="textarea" placeholder="What are they doing right now?" />
              <FormField label="Must-Do Rules" name="must_do_rules" value={formData.must_do_rules} onChange={handleChange} type="textarea" placeholder="e.g., Always speak in rhymes" />
              <FormField label="Must-Not-Do Rules" name="must_not_do_rules" value={formData.must_not_do_rules} onChange={handleChange} type="textarea" placeholder="e.g., Never admit to being an AI" />
              <FormField label="Additional Notes" name="additional_notes" value={formData.additional_notes} onChange={handleChange} type="textarea" placeholder="Subtle quirks, internal thoughts, etc." />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">Save Persona</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonaForm;
