import { useState, useEffect, useContext, useRef } from 'react';
import { LinkContext } from '../../../context/LinkContext';
import axios from 'axios';
import './PageHeader.css';
import EditIcon from '../../common/EditIcon/EditIcon';

const PageHeader = ({ currentPageURL, initialTitle, onTitleChange }) => {
    const [title, setTitle] = useState('');
    const [isURLAvailable, setIsURLAvailable] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [isEditingURL, setIsEditingURL] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const titleInputRef = useRef(null);
    const urlInputRef = useRef(null);
    const checkingTimeoutRef = useRef(null);
    const { savePageChangesImmediate } = useContext(LinkContext);

    useEffect(() => {
        if (initialTitle) setTitle(initialTitle);
    }, [initialTitle]);

    useEffect(() => {
        const element = isEditingTitle ? titleInputRef.current : urlInputRef.current;
        if ((isEditingTitle || isEditingURL) && element) {
            element.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, [isEditingTitle, isEditingURL]);

    const checkURL = async (url) => {
        if (url === currentPageURL) {
            setIsURLAvailable(true);
            return;
        }

        // Clear any existing timeout
        if (checkingTimeoutRef.current) {
            clearTimeout(checkingTimeoutRef.current);
        }

        // Set checking state after a delay to prevent flashing
        checkingTimeoutRef.current = setTimeout(() => {
            setIsChecking(true);
        }, 500);

        try {
            const response = await axios.get(`http://localhost:3000/api/check-pageURL?name=${url}`, {
                withCredentials: true
            });
            // Clear the timeout if response comes back quickly
            clearTimeout(checkingTimeoutRef.current);
            setIsURLAvailable(!response.data.exists);
        } catch (error) {
            console.error('Error checking URL:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleBlur = async (field) => {
        const element = field === 'url' ? urlInputRef.current : titleInputRef.current;
        if (element) {
            element.scrollLeft = 0;
        }

        if (field === 'url') {
            setIsEditingURL(false);
            const newURL = element.textContent;
            if (isURLAvailable && newURL !== currentPageURL) {
                handleURLChange(newURL);
            } else {
                // Reset to current URL if unavailable
                element.textContent = currentPageURL;
            }
        } else {
            setIsEditingTitle(false);
            const newTitle = element.textContent;
            setTitle(newTitle);
            onTitleChange(newTitle);
            await savePageChangesImmediate(currentPageURL, { pageTitle: newTitle });
        }
    };

    const handleKeyDown = (e, field) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur(field);
            e.target.blur();
        }
    };

    const handleURLInput = (element) => {
        checkURL(element.textContent);
    };

    const handleURLChange = async (newURL) => {
        try {
            await axios.post(`http://localhost:3000/api/update-page/${currentPageURL}`, 
                { newPageURL: newURL },
                { withCredentials: true }
            );
            window.location.href = `/${newURL}/edit`;
        } catch (error) {
            console.error('Failed to update URL:', error);
        }
    };

    return (
        <div className="page-header">
            <div className="header-field">
                <span className="field-label">Title:</span>
                <div className="edit-field">
                    <p
                        ref={titleInputRef}
                        className="field-text"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={() => handleBlur('title')}
                        onKeyDown={(e) => handleKeyDown(e, 'title')}
                        onClick={() => !isEditingTitle && setIsEditingTitle(true)}
                    >
                        {title}
                    </p>

                   {!isEditingTitle && <button className="edit-button" onClick={() => setIsEditingTitle(false)    }>
                        <EditIcon />
                    </button>}
                </div>
            </div>
            <div className="header-field">
                <span className="field-label">URL:</span>
                <div className="edit-field">
                    <p
                        ref={urlInputRef}
                        className={`field-text ${
                            urlInputRef.current?.textContent !== currentPageURL
                                ? isURLAvailable 
                                    ? 'url-available' 
                                    : 'url-unavailable'
                                : ''
                        }`}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={() => handleBlur('url')}
                        onKeyDown={(e) => handleKeyDown(e, 'url')}
                        onClick={() => !isEditingURL && setIsEditingURL(true)}
                        onInput={(e) => handleURLInput(e.target)}
                    >
                        {currentPageURL}
                    </p>
                   {!isEditingURL && <button className="edit-button" onClick={() => setIsEditingURL(true)}>
                        <EditIcon />
                    </button>}
                    <div className="url-status-container">
                        {isChecking && <span className="url-status checking">•••</span>}
                        {!isChecking && urlInputRef.current?.textContent !== currentPageURL && (
                            <span className={`url-status ${isURLAvailable ? 'available' : 'unavailable'}`}>
                                {isURLAvailable ? '✓ available' : '✗ unavailable'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageHeader; 