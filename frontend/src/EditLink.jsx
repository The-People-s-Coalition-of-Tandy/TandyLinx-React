import React, { useState, useRef, useContext, useEffect } from 'react';
import { LinkContext } from './context/LinkContext';
import { Draggable } from '@hello-pangea/dnd';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import './EditLink.css';

const EditLink = ({ link, index }) => {
    const [editingURL, setEditingURL] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const urlInputRef = useRef(null);
    const titleInputRef = useRef(null);
    const { savePageChangesImmediate, currentPageLinks, setCurrentPageLinks } = useContext(LinkContext);

    // Single effect to handle focus for both title and URL
    useEffect(() => {
        const shouldFocus = editingTitle || editingURL;
        const element = editingTitle ? titleInputRef.current : urlInputRef.current;

        if (shouldFocus && element) {
            element.focus();
            // Move cursor to end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, [editingTitle, editingURL]);

    const handleBlur = (setEditing, field) => {
        setEditing(false);
        
        // Reset scroll position to start
        const element = field === 'url' ? urlInputRef.current : titleInputRef.current;
        if (element) {
            element.scrollLeft = 0;
        }

        // Get the current value from the ref
        const newValue = field === 'url' 
            ? urlInputRef.current.textContent 
            : titleInputRef.current.textContent;
        
        // More efficient update using spread and direct index access
        const updatedLinks = [
            ...currentPageLinks.slice(0, index),
            {
                ...currentPageLinks[index],
                [field === 'url' ? 'url' : 'name']: newValue
            },
            ...currentPageLinks.slice(index + 1)
        ];

        // Update state and save changes
        setCurrentPageLinks(updatedLinks);
        // Use the pageURL from the link prop
        savePageChangesImmediate(link.pageURL, { links: updatedLinks });
    }

    const handleKeyDown = (e, setEditing, field) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur(setEditing, field);
        }
    }

    const handleDelete = async () => {
        const updatedLinks = [
            ...currentPageLinks.slice(0, index),
            ...currentPageLinks.slice(index + 1)
        ];
        
        try {
            await savePageChangesImmediate(link.pageURL, { links: updatedLinks });
            setCurrentPageLinks(updatedLinks);
        } catch (error) {
            console.error('Failed to delete link:', error);
            // Revert on failure
            const originalLinks = await getLinksFromPage(link.pageURL);
            setCurrentPageLinks(originalLinks);
        }
        setShowDeleteModal(false);
    };

    return (
        <>
            <Draggable key={index} draggableId={index.toString()} index={index}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                            marginBottom: '20px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            ...provided.draggableProps.style,
                        }}
                        className="drag-test-item"
                    >
                        <div className='drag-handle' {...provided.dragHandleProps}>
                            <div className="drag-handle-dots"></div>
                        </div>
                        <div className="link-field-container">
                            <div className="link-title link-field">
                                <p 
                                    className='link-title-text link-field-input' 
                                    contentEditable={editingTitle} 
                                    ref={titleInputRef} 
                                    suppressContentEditableWarning={true}
                                    onBlur={() => handleBlur(setEditingTitle, 'title')}
                                    onKeyDown={(e) => handleKeyDown(e, setEditingTitle, 'title')}
                                    onClick={() => !editingTitle && setEditingTitle(true)}
                                    style={{ cursor: editingTitle ? 'text' : 'pointer' }}
                                >
                                    {link.name}
                                </p>
                                <button className={`edit-button ${editingTitle ? 'hidden' : ''}`} onClick={() => setEditingTitle(!editingTitle)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                </svg>
                                </button>
                            </div>
                            <div className="link-url link-field">
                                <p 
                                    className='link-url-text link-field-input' 
                                    contentEditable={editingURL} 
                                    ref={urlInputRef} 
                                    suppressContentEditableWarning={true}
                                    onBlur={() => handleBlur(setEditingURL, 'url')}
                                    onKeyDown={(e) => handleKeyDown(e, setEditingURL, 'url')}
                                    onClick={() => !editingURL && setEditingURL(true)}
                                    style={{ cursor: editingURL ? 'text' : 'pointer' }}
                                >
                                    {link.url}
                                </p>
                                <button className={`edit-button ${editingURL ? 'hidden' : ''}`} onClick={() => setEditingURL(!editingURL)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                </svg>
                                </button>
                            </div>
                        </div>
                        <div className="link-actions">
                            <button 
                                className="delete-button" 
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </Draggable>
            <DeleteConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default EditLink;