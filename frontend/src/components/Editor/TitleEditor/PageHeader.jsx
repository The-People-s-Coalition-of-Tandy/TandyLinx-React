import { useState, useEffect, useContext } from 'react';
import { LinkContext } from '../../../context/LinkContext';
import axios from 'axios';
import './PageHeader.css';
import EditIcon from '../../common/EditIcon/EditIcon';

const PageHeader = ({ currentPageURL, initialTitle }) => {
    const [title, setTitle] = useState('');
    const [newURL, setNewURL] = useState(currentPageURL);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingURL, setIsEditingURL] = useState(false);
    const [isURLAvailable, setIsURLAvailable] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const { savePageChangesImmediate } = useContext(LinkContext);

    useEffect(() => {
        if (initialTitle) setTitle(initialTitle);
    }, [initialTitle]);

    useEffect(() => {
        if (newURL === currentPageURL) {
            setIsURLAvailable(true);
            return;
        }

        const checkURL = async () => {
            setIsChecking(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/check-pageURL?name=${newURL}`, {
                    withCredentials: true
                });
                setIsURLAvailable(!response.data.exists);
            } catch (error) {
                console.error('Error checking URL:', error);
            } finally {
                setIsChecking(false);
            }
        };

        const timeoutId = setTimeout(checkURL, 500);
        return () => clearTimeout(timeoutId);
    }, [newURL, currentPageURL]);

    const handleTitleChange = async (newTitle) => {
        setTitle(newTitle);
        try {
            await savePageChangesImmediate(currentPageURL, { pageTitle: newTitle });
        } catch (error) {
            console.error('Failed to update title:', error);
        }
    };

    const handleURLChange = async (newPageURL) => {
        if (!isURLAvailable) return;
        try {
            await axios.post(`http://localhost:3000/api/update-page/${currentPageURL}`, 
                { newPageURL },
                { withCredentials: true }
            );
            window.location.href = `/${newPageURL}/edit`;
        } catch (error) {
            console.error('Failed to update URL:', error);
        }
    };



    return (
        <div className="page-header">
            <div className="header-field">
                <span className="field-label">Title:</span>
                {isEditingTitle ? (
                    <div className="edit-field">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => {
                                setIsEditingTitle(false);
                                handleTitleChange(title);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setIsEditingTitle(false);
                                    handleTitleChange(title);
                                }
                            }}
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="display-field" onClick={() => setIsEditingTitle(true)}>
                        {title}
                        <button className="edit-button">
                            <EditIcon />
                        </button>
                    </div>
                )}
            </div>

            <div className="header-field">
                <span className="field-label">URL:</span>
                {isEditingURL ? (
                    <div className="edit-field">
                        <input
                            value={newURL}
                            onChange={(e) => setNewURL(e.target.value)}
                            onBlur={() => {
                                setIsEditingURL(false);
                                handleURLChange(newURL);
                            }}
                            className={
                                isChecking ? 'checking' : 
                                isURLAvailable ? 'available' : 
                                'unavailable'
                            }
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="display-field" onClick={() => setIsEditingURL(true)}>
                        {currentPageURL}
                        <button className="edit-button">
                            <EditIcon />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader; 