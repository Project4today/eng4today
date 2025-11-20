import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmationModal.css'; // We'll create this next

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirmation-modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
