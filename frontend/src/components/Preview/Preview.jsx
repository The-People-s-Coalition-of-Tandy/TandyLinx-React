import React, { useEffect, useRef, useContext, useState } from 'react';
import { LinkContext } from '../../context/LinkContext';
import { useProfilePhoto } from '../../context/ProfilePhotoContext';
import './Preview.css';

const Preview = ({ pageURL, pageTitle, style, isFullPreview }) => {
    const { currentPageLinks } = useContext(LinkContext);
    const { currentPagePhotoUrl } = useProfilePhoto();
    const keyCounter = useRef(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDesktopMode, setIsDesktopMode] = useState(false);
    
    useEffect(() => {
        keyCounter.current += 1;
        setIsLoading(true);
    }, [pageURL, pageTitle, style, isFullPreview, currentPageLinks, currentPagePhotoUrl]);
    
    const handleLoad = (e) => {
        setIsLoading(false);
        e.target.classList.add('loaded');
    };

    const togglePreviewMode = () => {
        setIsDesktopMode(!isDesktopMode);
    };
    
    return (
        <div className={`preview-container ${isDesktopMode ? 'desktop-mode' : ''}`}>
            <div className="preview-header">
                <button 
                    className="preview-mode-toggle"
                    onClick={togglePreviewMode}
                    title={isDesktopMode ? "Switch to Mobile View" : "Switch to Desktop View"}
                >
                    {isDesktopMode ? "📱" : "🖥️"}
                </button>
            </div>
            <div className="preview-content">
                <div className={`preview-frame-container ${isDesktopMode ? 'desktop' : ''}`}>
                    <div className={`preview-frame ${isDesktopMode ? 'desktop' : ''}`}>
                        <div className={`preview-scale-container ${isDesktopMode ? 'desktop' : ''}`}>
                            <div className={`preview-loader ${isLoading ? 'visible' : ''}`}>
                                <div className="loader-spinner" />
                            </div>
                            <iframe 
                                key={keyCounter.current}
                                src={`/${pageURL}`}
                                title="Preview"
                                className="preview-iframe"
                                onLoad={handleLoad}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preview;