import React, { useState, useRef, useEffect } from 'react';
import {Draggable} from '@hello-pangea/dnd';
import './EditLink.css';

const EditLink = ({ link, index }) => {
    const [editingURL, setEditingURL] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const urlInputRef = useRef(null);
    const titleInputRef = useRef(null);

    // set editingURL to true and set focus to the input field
    const editURL = () => {
        setEditingURL(!editingURL);
        urlInputRef.current.focus();
    }

    const handleBlur = (setEditing) => {
        setEditing(false);
    }

    const handleKeyDown = (e, setEditing) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setEditing(false);
        }
    }

    // make the input field focus when contentEditable is true
    useEffect(() => {
        if (editingURL) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                if (urlInputRef.current) {
                    urlInputRef.current.focus();
                    // Move cursor to end of text content
                    const textNode = urlInputRef.current.firstChild;
                    const range = document.createRange();
                    const selection = window.getSelection();
                    
                    if (textNode) {
                        range.setStart(textNode, textNode.length);
                        range.setEnd(textNode, textNode.length);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            });
        }
    }, [editingURL]);

    useEffect(() => {
        if (editingTitle) {
            requestAnimationFrame(() => {
                if (titleInputRef.current) {
                    titleInputRef.current.focus();
                    // Move cursor to end of text content
                    const textNode = titleInputRef.current.firstChild;
                    const range = document.createRange();
                    const selection = window.getSelection();
                    
                    if (textNode) {
                        range.setStart(textNode, textNode.length);
                        range.setEnd(textNode, textNode.length);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            });
        }
    }, [editingTitle]);

    return (
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
                            onBlur={() => handleBlur(setEditingTitle)}
                            onKeyDown={(e) => handleKeyDown(e, setEditingTitle)}
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
                            onBlur={() => handleBlur(setEditingURL)}
                            onKeyDown={(e) => handleKeyDown(e, setEditingURL)}
                            onClick={() => !editingURL && setEditingURL(true)}
                            style={{ cursor: editingURL ? 'text' : 'pointer' }}
                        >
                            {link.url}
                        </p>
                        <button className={`edit-button ${editingURL ? 'hidden' : ''}`} onClick={editURL}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                        </button>
                    </div>
                  </div>
                  
                  {/* <div>
                    <button onClick={() => setShowEdit(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div> */}
                </div>
              )}
            </Draggable>
    );
};

export default EditLink;