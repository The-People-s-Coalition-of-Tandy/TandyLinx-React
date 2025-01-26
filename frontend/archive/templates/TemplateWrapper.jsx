import React, { useEffect } from 'react';

const TemplateWrapper = ({ Template, ...props }) => {
    useEffect(() => {
        // Cleanup function runs when component unmounts or Template changes
        return () => {
            // Remove all style elements that were added by the template
            document.querySelectorAll('style[data-template]').forEach(style => {
                style.remove();
            });
        };
    }, [Template]);

    return <Template {...props} />;
};

export default TemplateWrapper; 