import React, { Suspense } from 'react';
import { templates } from '../../templates/registry';
import './MobilePreview.css';

const MobilePreview = ({ pageTitle, links, style }) => {
    const Template = React.lazy(async () => {
        const { folder } = templates[style];
        return import(`../../templates/${folder}`);
    });

    return (
        <div className="mobile-preview-container">
            <div className="mobile-preview-content">
                <Suspense fallback={<div>Loading...</div>}>
                    <Template pageTitle={pageTitle} links={links} />
                </Suspense>
            </div>
        </div>
    );
};

export default MobilePreview; 