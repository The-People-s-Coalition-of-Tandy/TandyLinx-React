import React, { useState, useEffect } from 'react';
import AeroButton from '../../common/AeroButton/AeroButton';
import './DeleteConfirmModal.css';


const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    const [topOffset, setTopOffset] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const editor = document.querySelector('.editor');
            if (editor) {
                setTopOffset(editor.scrollTop);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div 
            className="modal-overlay" 
            style={{ transform: `translateY(${topOffset}px)` }}
            onClick={handleOverlayClick}
        >
            <div className="modal-content">
                <h3>Delete Link</h3>
                <p>Are you sure you want to delete this link?</p>
                <div className="modal-buttons">
                    <AeroButton onClick={onClose}>
                        Cancel
                    </AeroButton>
                    <AeroButton onClick={onConfirm} color="red">
                        Delete
                    </AeroButton>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal; 