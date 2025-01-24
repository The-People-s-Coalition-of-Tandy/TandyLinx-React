import React from 'react';
import './Preview.css';

const Preview = ({ pageTitle, links, style }) => {
    // Use the development or production URL based on environment
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const previewUrl = `${baseUrl}/_preview?title=${encodeURIComponent(pageTitle)}&style=${style}&links=${encodeURIComponent(JSON.stringify(links))}`;

    return (
        <div className="preview-container">
            <div className="preview-header"></div>
            <div className="preview-content">
                <div className="preview-frame-container">
                    <div className="preview-frame">
                        <div className="preview-scale-container">
                            <iframe
                                src={previewUrl}
                                className="preview-iframe"
                                title="Template Preview"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preview;