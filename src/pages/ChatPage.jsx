import React from 'react';
import InitialsAvatar from 'react-initials-avatar';
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

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const DeleteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>;


const PersonaSelector = ({ onSet, onReview, onEdit, onCreate, onDelete, currentPersonaId, personas }) => {
    const sortedPersonas = [...personas].sort((a, b) => a.prompt_id - b.prompt_id);

    return (
        <div className="prompt-content">
            <div className="prompt-header">
                <h3>Switch AI Persona</h3>
                <Button onClick={onCreate}>+ Create New</Button>
            </div>
            <p>Select a new persona for the current conversation.</p>
            <div className="prompt-options scrollable-table-container">
                <table className="w-full border-collapse table-fixed">
                    <colgroup>
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '45%' }} />
                        <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Avatar</th>
                            <th className="p-2 text-left">Persona</th>
                            <th className="p-2 text-left">Primary Goal</th>
                            <th className="p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPersonas.map(persona => (
                            <tr
                                key={persona.prompt_id}
                                className={currentPersonaId === persona.prompt_id ? 'selected-persona' : ''}
                                onClick={() => onSet(persona.prompt_id)}
                            >
                                <td className="p-2 truncate text-left">{persona.prompt_id}</td>
                                <td className="p-2 text-left">
                                    <div className="w-6 h-6 rounded-full mx-auto">
                                        {persona.avatar_url ? (
                                            <img
                                                src={persona.avatar_url}
                                                alt={persona.role_name}
                                                className="w-full h-full rounded-full object-cover w-35-h-auto"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full rounded-full initials-avatar-wrapper"
                                                style={{ background: persona?.gradient || 'linear-gradient(45deg, #8a2be2, #4169e1)' }}
                                            >
                                                <InitialsAvatar name={persona?.role_name || 'AI'} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-2 truncate text-left" title={persona.role_name}>{persona.role_name}</td>
                                <td className="p-2 truncate text-left" title={persona.goal}>{persona.goal}</td>
                                <td className="p-2 text-left">
                                    <Button
                                        variant="icon"
                                        onClick={(e) => { e.stopPropagation(); onReview(persona); }}
                                        title="View Persona Details"
                                        className="view mr-2"
                                    >
                                        <EyeIcon />
                                    </Button>
                                    <Button
                                        variant="icon"
                                        onClick={(e) => { e.stopPropagation(); onEdit(persona); }}
                                        title="Edit Persona"
                                        className="edit mr-2"
                                    >
                                        <EditIcon />
                                    </Button>
                                    <Button
                                        variant="icon"
                                        onClick={(e) => { e.stopPropagation(); onDelete(persona); }}
                                        title="Delete Persona"
                                        className="delete"
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

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

    const handleEditClick = (persona) => {
        setEditingPersona(persona);
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
                    onEdit={handleEditClick}
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
