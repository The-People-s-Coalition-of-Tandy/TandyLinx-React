import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LinkContext } from '../../../context/LinkContext';
import AeroButton from '../../common/AeroButton/AeroButton';
import './PageSettingsModal.css';

const PageSettingsModal = ({ 
    isOpen, 
    onClose, 
    currentPageURL, 
    initialTitle, 
    onTitleChange, 
    onURLChange 
}) => {
    const { savePageChangesImmediate } = useContext(LinkContext);
    const [title, setTitle] = useState(initialTitle || '');
    const [url, setUrl] = useState(currentPageURL || '');
    const [urlStatus, setUrlStatus] = useState({ isAvailable: true, isChecking: false });
    const [topOffset, setTopOffset] = useState(0);

    useEffect(() => {
        setTitle(initialTitle);
        setUrl(currentPageURL);
    }, [initialTitle, currentPageURL]);

    useEffect(() => {
        if (isOpen) {
            const editor = document.querySelector('.editor');
            if (editor) {
                setTopOffset(editor.scrollTop);
            }
        }
    }, [isOpen]);

    const checkURL = async (newUrl) => {
        if (newUrl === currentPageURL) {
            setUrlStatus({ isAvailable: true, isChecking: false });
            return;
        }

        setUrlStatus(prev => ({ ...prev, isChecking: true }));
        try {
            const response = await axios.get(`/api/check-pageURL?name=${newUrl}`, {
                withCredentials: true
            });
            setUrlStatus({ isAvailable: !response.data.exists, isChecking: false });
        } catch (error) {
            console.error('Error checking URL:', error);
            setUrlStatus({ isAvailable: false, isChecking: false });
        }
    };

    const handleSave = async () => {
        try {
            if (title !== initialTitle) {
                await savePageChangesImmediate(currentPageURL, { pageTitle: title });
                onTitleChange(title);
            }
            
            if (url !== currentPageURL && urlStatus.isAvailable) {
                onURLChange(url);
            }
            
            onClose();
        } catch (error) {
            console.error('Failed to update page settings:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="modal-overlay"
            style={{ transform: `translateY(${topOffset}px)` }}
        >
            <div className="modal-content">
                <h2>Page Settings</h2>
                <div className="form-group">
                    <label>Page Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Page URL</label>
                    <div className="url-input-wrapper">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                checkURL(e.target.value);
                            }}
                        />
                        {url !== currentPageURL && (
                            <span className={`url-status ${
                                urlStatus.isChecking ? 'checking' : 
                                urlStatus.isAvailable ? 'available' : 'unavailable'
                            }`}>
                                {urlStatus.isChecking ? '•••' : 
                                 urlStatus.isAvailable ? '✓ available' : '✗ unavailable'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="modal-actions">
                    <AeroButton onClick={onClose} color="red">Cancel</AeroButton>
                    <AeroButton
                        color="blue"
                        onClick={handleSave}
                        disabled={!urlStatus.isAvailable && url !== currentPageURL}
                    >
                        Save Changes
                    </AeroButton>
                </div>
            </div>
        </div>
    );
};

export default PageSettingsModal; 