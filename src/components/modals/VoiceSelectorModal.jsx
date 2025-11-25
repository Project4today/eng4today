import React from 'react';
import { useChat } from '../../contexts/ChatContext'; // Import useChat
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const VoiceSelectorModal = ({ isOpen, onClose, onSelectVoice, currentVoiceId }) => {
  const { voices } = useChat(); // Get voices from the context

  const handleSelect = (voiceId) => {
    onSelectVoice(voiceId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="prompt-header">
        <h3>Change Persona Voice</h3>
      </div>
      <p>Select a new voice for the current AI persona.</p>
      <div className="prompt-options">
        {voices && voices.length > 0 ? (
          voices.map(voice => (
            <Button
              key={voice.id}
              variant="secondary"
              className={currentVoiceId === voice.id ? 'active' : ''}
              onClick={() => handleSelect(voice.id)}
            >
              {`${voice.name} (${voice.language_name})`}
            </Button>
          ))
        ) : (
          <p>Loading voices...</p>
        )}
      </div>
    </Modal>
  );
};

export default VoiceSelectorModal;
