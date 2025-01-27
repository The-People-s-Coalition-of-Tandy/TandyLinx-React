import React, { useEffect, useRef, useContext, useState } from 'react';
import { LinkContext } from '../../context/LinkContext';
import { useProfilePhoto } from '../../context/ProfilePhotoContext';
import './Preview.css';

const Preview = ({ pageURL, pageTitle, style, isFullPreview }) => {
    const { currentPageLinks } = useContext(LinkContext);
    const { currentPagePhotoUrl } = useProfilePhoto();
    const keyCounter = useRef(0);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        keyCounter.current += 1;
        setIsLoading(true);
    }, [pageURL, pageTitle, style, isFullPreview, currentPageLinks, currentPagePhotoUrl]);
    
    const handleLoad = (e) => {
        setIsLoading(false);
        e.target.classList.add('loaded');
    };
    
    return (
        <div className="preview-container">
            <div className="preview-header"></div>
            <div className="preview-content">
                <div className="preview-frame-container">
                    <div className="preview-frame">
                        <div className="preview-scale-container">
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