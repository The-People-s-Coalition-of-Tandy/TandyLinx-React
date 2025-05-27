import React, { useEffect, useRef, useContext, useState } from 'react';
import { LinkContext } from '../../context/LinkContext';
import { useProfilePhoto } from '../../context/ProfilePhotoContext';
import cellPhone from './assets/cellphone-icon.png';
import desktop from './assets/computer-icon.png';
import useIsMobile from '../../hooks/useIsMobile';
import './Preview.css';
const Preview = ({ pageURL, pageTitle, style, isFullPreview, className }) => {
    const { currentPageLinks } = useContext(LinkContext);
    const { currentPagePhotoUrl } = useProfilePhoto();
    const keyCounter = useRef(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDesktopMode, setIsDesktopMode] = useState();
    
    useEffect(() => {
        keyCounter.current += 1;
        setIsLoading(true);
    }, [pageURL, pageTitle, style, isFullPreview, isDesktopMode, currentPageLinks, currentPagePhotoUrl]);
    
    const handleLoad = (e) => {
        setIsLoading(false);
        e.target.classList.add('loaded');
    };
    
    return (
        <div className={`preview-container ${isDesktopMode ? 'desktop-mode' : ''} ${className}`}>
            <div className="preview-header">
                <div className="preview-mode-toggle">
                    <button 
                        className={!isDesktopMode ? 'active' : ''}
                        onClick={() => setIsDesktopMode(false)}
                        title="Mobile View"
                    >
                        <span className="icon"><img height="24" src={cellPhone} alt="Cell Phone" className="cell-phone" /></span>

                        <span className="label">Mobile</span>
                    </button>
                    <button 
                        className={isDesktopMode ? 'active' : ''}
                        onClick={() => setIsDesktopMode(true)}
                        title="Desktop View"
                    >
                        <span className="icon"><img height="24" src={desktop} alt="Desktop" className="desktop" /></span>
                        <span className="label">Desktop</span>
                    </button>
                </div>
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