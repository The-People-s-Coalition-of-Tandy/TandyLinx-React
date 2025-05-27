import React, { useState } from 'react';
import ProfilePhotoUpload from '../ProfilePhotoUpload/ProfilePhotoUpload';
import PageSettingsModal from '../PageSettingsModal/PageSettingsModal';
import { faPaintBrush, faHome, faCog, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditorHeader.css';

const EditorHeader = ({ 
    currentPageURL, 
    initialTitle, 
    onTitleChange, 
    onURLChange,
    onBrowseTemplates,
    currentTemplate,
    showSettings,
    onShowSettings,
    children
}) => {
    const navigate = useNavigate();
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const [templateName, setTemplateName] = useState('');

    // Fetch template name when currentTemplate changes
    React.useEffect(() => {
        const fetchTemplateName = async () => {
            try {
                const response = await axios.get('/api/templates');
                if (response.data && response.data[currentTemplate]) {
                    setTemplateName(response.data[currentTemplate].name);
                }
            } catch (error) {
                console.error('Failed to fetch template name:', error);
                setTemplateName(currentTemplate); // Fallback to key if fetch fails
            }
        };

        fetchTemplateName();
    }, [currentTemplate]);

    const handleShare = async () => {
        const shareUrl = `https://links.pcotandy.org/${currentPageURL}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShowShareTooltip(true);
            setTimeout(() => setShowShareTooltip(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <>
            <div className="editor-header">
                <div className="editor-header-top">
                    <div className="header-left">
                        <ProfilePhotoUpload pageUrl={currentPageURL} />
                    </div>
                    <div className="header-right">
                        <div className='pageNames'>
                            <div className='pageName' onClick={() => onShowSettings(true)}>{initialTitle}</div>
                            <div className='pageURL' onClick={() => onShowSettings(true)}>https://links.pcotandy.org/<span className='pageURL-text'>{currentPageURL}</span></div>
                        </div>
                        <div className="themeName" onClick={onBrowseTemplates}>
                            <button 
                                className="header-button"
                                onClick={onBrowseTemplates}
                            >
                                <FontAwesomeIcon icon={faPaintBrush} />
                            </button>
                            <div className='themeBox'>
                                <span>Current Theme</span>
                                <p>{templateName}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="header-orbs">
                    <button className="header-orb" onClick={() => navigate('/profile')} title="Go to Profile">
                        <FontAwesomeIcon icon={faHome} />
                    </button>
                    <button className="header-orb" onClick={handleShare} title="Share Page">
                        <FontAwesomeIcon icon={faShareNodes} />
                        {showShareTooltip && <div className="share-tooltip">Link Copied!</div>}
                    </button>
                    <button className="header-orb" onClick={() => onShowSettings(true)} title="Page Settings">
                        <FontAwesomeIcon icon={faCog} />
                    </button>
                </div>
            </div>

            <div className="editor-blur-target">
                {children}
            </div>

            <PageSettingsModal 
                isOpen={showSettings}
                onClose={() => onShowSettings(false)}
                currentPageURL={currentPageURL}
                initialTitle={initialTitle}
                onTitleChange={onTitleChange}
                onURLChange={onURLChange}
            />
        </>
    );
};

export default EditorHeader;