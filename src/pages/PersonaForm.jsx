import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

const FormField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', children }) => (
  <div className="form-field">
    <label htmlFor={name}>{label}{required && <span className="required-star">*</span>}</label>
    {type === 'select' ? (
      <select id={name} name={name} value={value} onChange={onChange} className="form-input">
        {children}
      </select>
    ) : type === 'textarea' ? (
      <Textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} />
    ) : (
      <Input type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} />
    )}
  </div>
);

const PersonaForm = ({ persona, onSave, onCancel }) => {
  const initialFormData = {
    role_name: '',
    avatar_url: '',
    voice_id: '',
    expertise: '',
    goal: '',
    personality: '',
    setting: '',
    situation: '',
    must_do_rules: '',
    must_not_do_rules: '',
    additional_notes: '',
    ...persona,
  };
  const [formData, setFormData] = useState(initialFormData);
  const { voices } = useChat();

  useEffect(() => {
    setFormData({
        role_name: '', avatar_url: '', voice_id: '', expertise: '', goal: '',
        personality: '', setting: '', situation: '', must_do_rules: '',
        must_not_do_rules: '', additional_notes: '', ...persona
    });
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
    <Modal isOpen={true} onClose={onCancel}>
        <header className="form-header">
          <h2>{persona ? 'Edit Persona' : 'Create New Persona'}</h2>
          <p>{persona ? 'Update the details for this AI character.' : 'Define a new AI character from scratch.'}</p>
        </header>
        
        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-column">
            <FormField label="Role Name" name="role_name" value={formData.role_name || ''} onChange={handleChange} required placeholder="e.g., Sarcastic Robot" />
            <FormField label="Avatar URL" name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} placeholder="https://example.com/image.png" />
            
            <FormField label="Voice" name="voice_id" value={formData.voice_id || ''} onChange={handleChange} type="select">
              <option value="">Default</option>
              {voices && voices.length > 0 ? (
                voices.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {`${voice.name} (${voice.language_name})`}
                  </option>
                ))
              ) : (
                <option disabled>Loading voices...</option>
              )}
            </FormField>

            <FormField label="Expertise" name="expertise" value={formData.expertise || ''} onChange={handleChange} type="textarea" placeholder="e.g., Quantum physics, 18th-century poetry" />
            <FormField label="Goal" name="goal" value={formData.goal || ''} onChange={handleChange} type="textarea" required placeholder="What is this persona's primary objective?" />
          </div>
          
          <div className="form-column">
            <FormField label="Personality" name="personality" value={formData.personality || ''} onChange={handleChange} type="textarea" required placeholder="e.g., Witty, melancholic, and fiercely loyal" />
            <FormField label="Setting" name="setting" value={formData.setting || ''} onChange={handleChange} type="textarea" required placeholder="Where is the character?" />
            <FormField label="Situation" name="situation" value={formData.situation || ''} onChange={handleChange} type="textarea" placeholder="What are they doing right now?" />
            <FormField label="Must-Do Rules" name="must_do_rules" value={formData.must_do_rules || ''} onChange={handleChange} type="textarea" placeholder="e.g., Always speak in rhymes" />
            <FormField label="Must-Not-Do Rules" name="must_not_do_rules" value={formData.must_not_do_rules || ''} onChange={handleChange} type="textarea" placeholder="e.g., Never admit to being an AI" />
            <FormField label="Additional Notes" name="additional_notes" value={formData.additional_notes || ''} onChange={handleChange} type="textarea" placeholder="Subtle quirks, internal thoughts, etc." />
          </div>

          <div className="form-actions">
            <Button type="submit">Save Persona</Button>
          </div>
        </form>
    </Modal>
  );
};

export default PersonaForm;
