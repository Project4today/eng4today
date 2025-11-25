import React from 'react';
import {useChat} from '../contexts/ChatContext';
import PersonaDetailView from './PersonaDetailView';
import PersonaForm from './PersonaForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                           strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>;
const DeleteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>;


const PersonaSelector = ({onSet, onReview, onCreate, onDelete, currentPersonaId, personas}) => (
    <div className="prompt-content">
        <div className="prompt-header">
            <h3>Switch AI Persona</h3>
            <Button onClick={onCreate}>+ Create New</Button>
        </div>
        <p>Select a new persona for the current conversation.</p>
        <div className="prompt-options">
            {personas.map(persona => (
                <div key={persona.prompt_id} className="prompt-option-container">
                    <Button
                        variant="secondary"
                        className={`w-full justify-start ${currentPersonaId === persona.prompt_id ? 'active' : ''}`}
                        onClick={() => onSet(persona.prompt_id)}
                    >
                        {persona.role_name}
                    </Button>
                    <Button variant="icon" onClick={() => onReview(persona)} title="View Persona Details">
                        <EyeIcon/>
                    </Button>
                    <Button variant="icon" onClick={() => onDelete(persona)} title="Delete Persona">
                        <DeleteIcon/>
                    </Button>
                </div>
            ))}
        </div>
    </div>
);

const ChatPage = () => {
    const {
        personas,
        activePersona,
        setActivePersona,
        nextMessagePersonaId,
        setNextMessagePersonaId,
        personaToReview,
        setPersonaToReview,
        editingPersona,
        setEditingPersona,
        showPersonaModal,
        setShowPersonaModal,
        showVersionModal,
        setShowVersionModal,
        botVersion,
        setBotVersion,
        customVersionInput,
        setCustomVersionInput,
        handleSavePersona,
        handleDeletePersona: contextHandleDeletePersona,
    } = useChat();

    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = React.useState(false);
    const [personaToDelete, setPersonaToDelete] = React.useState(null);

    const handlePersonaChange = (newPersonaId) => {
        setNextMessagePersonaId(newPersonaId);
        const newPersona = personas.find(p => p.prompt_id === newPersonaId);
        if (newPersona) {
            setActivePersona(newPersona);
        }
        setShowPersonaModal(false);
    };

    const handleDeleteClick = (persona) => {
        setPersonaToDelete(persona);
        setShowConfirmDeleteModal(true);
        setShowPersonaModal(false);
    };

    const confirmDeletePersona = async () => {
        if (personaToDelete) {
            const result = await contextHandleDeletePersona(personaToDelete.prompt_id);
            if (result.success) {
                if (activePersona?.prompt_id === personaToDelete.prompt_id) {
                    setActivePersona(null);
                }
            } else {
                console.error("Failed to delete persona:", result.error);
            }
            setPersonaToDelete(null);
            setShowConfirmDeleteModal(false);
            setShowPersonaModal(true);
        }
    };

    const handleSetVersion = (version) => {
        if (!version) return;
        const newVersion = version.trim();
        setBotVersion(newVersion);
        localStorage.setItem('bot_version', newVersion);
        setShowVersionModal(false);
        setCustomVersionInput('');
    };

    return (
        <>
            {editingPersona && (
                <PersonaForm
                    persona={editingPersona === 'new' ? null : editingPersona}
                    onSave={handleSavePersona}
                    onCancel={() => {
                        setEditingPersona(null);
                        setShowPersonaModal(true);
                    }}
                />
            )}

            {personaToReview && (
                <PersonaDetailView
                    persona={personaToReview}
                    onClose={() => {
                        setPersonaToReview(null);
                        setShowPersonaModal(true);
                    }}
                    onEdit={() => {
                        setEditingPersona(personaToReview);
                        setPersonaToReview(null);
                    }}
                />
            )}

            <Modal isOpen={showPersonaModal} onClose={() => setShowPersonaModal(false)}>
                <PersonaSelector
                    currentPersonaId={nextMessagePersonaId || activePersona?.prompt_id}
                    onSet={handlePersonaChange}
                    onReview={(persona) => {
                        setShowPersonaModal(false);
                        setPersonaToReview(persona);
                    }}
                    onCreate={() => {
                        setShowPersonaModal(false);
                        setEditingPersona('new');
                    }}
                    onDelete={handleDeleteClick}
                    personas={personas}
                />
            </Modal>

            <Modal isOpen={showVersionModal} onClose={() => setShowVersionModal(false)}>
                <div className="prompt-header">
                    <h3>Select Bot Version</h3>
                </div>
                <p>Choose a model version for the AI's responses.</p>
                <div className="prompt-options">
                    <Button variant="secondary" className={botVersion === 'gemini-2.0-flash' ? 'active' : ''}
                            onClick={() => handleSetVersion('gemini-2.0-flash')}>2.0 Flash (Default)</Button>
                    <Button variant="secondary" className={botVersion === 'gemini-2.0-flash-lite' ? 'active' : ''}
                            onClick={() => handleSetVersion('gemini-2.0-flash-lite')}>2.0 Flash Lite</Button>
                    <Button variant="secondary" className={botVersion === 'gemini-pro-latest' ? 'active' : ''}
                            onClick={() => handleSetVersion('gemini-pro-latest')}>1.0 Pro (Legacy)</Button>
                    <Button variant="secondary" className={botVersion === 'gemini-flash-latest' ? 'active' : ''}
                            onClick={() => handleSetVersion('gemini-flash-latest')}>1.0 Flash (Legacy)</Button>
                </div>
                <Textarea
                    placeholder="Or enter a custom version name..."
                    value={customVersionInput}
                    onChange={(e) => setCustomVersionInput(e.target.value)}
                    rows={1}
                />
                <div className="prompt-modal-actions">
                    <Button onClick={() => handleSetVersion(customVersionInput)}>Apply Custom</Button>
                </div>
            </Modal>
            
            <Sidebar/>
            <ChatArea />

            <ConfirmationModal
                isOpen={showConfirmDeleteModal}
                onClose={() => {
                    setShowConfirmDeleteModal(false);
                    setPersonaToDelete(null);
                    setShowPersonaModal(true);
                }}
                onConfirm={confirmDeletePersona}
                title="Confirm Persona Deletion"
                message={`Are you sure you want to delete persona "${personaToDelete?.role_name}"? This action cannot be undone.`}
            />
        </>
    );
};

export default ChatPage;
