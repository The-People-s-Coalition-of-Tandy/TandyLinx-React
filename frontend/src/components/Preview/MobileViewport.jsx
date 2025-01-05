import React from 'react';

const MobileViewport = ({ children }) => {
    return (
        <div style={{ 
            width: '390px',
            minHeight: '844px',
            overflow: 'hidden'
        }}>
            {children}
        </div>
    );
};

export default MobileViewport; 