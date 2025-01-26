import React, { useEffect, useRef, useContext } from 'react';
import { LinkContext } from '../../context/LinkContext';
import { useProfilePhoto } from '../../context/ProfilePhotoContext';
import './Preview.css';

const Preview = ({ pageURL, style, isFullPreview }) => {
    const iframeRef = useRef(null);
    const { currentPageLinks } = useContext(LinkContext);
    const { currentPhotoUrl } = useProfilePhoto();
    
    // Force refresh when style changes
    useEffect(() => {
        console.log('style changed', style);
        if (iframeRef.current) {
            const timestamp = new Date().getTime(); // Add timestamp to force refresh
            iframeRef.current.src = `/${pageURL}?t=${timestamp}`;
        }
    }, [pageURL, currentPageLinks, currentPhotoUrl, style, isFullPreview]);

    return (
        <div className="preview-container">
            <div className="preview-header"></div>
            <div className="preview-content">
                <div className="preview-frame-container">
                    <div className="preview-frame">
                        <div className="preview-scale-container">
                            <iframe 
                                ref={iframeRef}
                                src={`/${pageURL}`}
                                title="Preview"
                                className="preview-iframe"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preview;