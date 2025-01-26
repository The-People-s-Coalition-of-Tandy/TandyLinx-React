import React from 'react';
import ProfilePhotoUpload from '../ProfilePhotoUpload/ProfilePhotoUpload';
import PageSettingsModal from '../PageSettingsModal/PageSettingsModal';
import { faPaintBrush, faHome, faShare, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
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

    return (
        <>
            <div className="editor-header">
                <div className="editor-header-top">
                    <div className="header-left">
                        <ProfilePhotoUpload />
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
                                <p>{currentTemplate}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="header-orbs">
                    <button className="header-orb" onClick={() => navigate('/profile')}>
                        <FontAwesomeIcon icon={faHome} />
                    </button>
                    <button className="header-orb">
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                    <button className="header-orb">
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