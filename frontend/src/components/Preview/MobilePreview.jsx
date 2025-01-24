import React, { Suspense } from 'react';
import { templates } from '../../templates/registry';
import TemplateWrapper from '../../templates/TemplateWrapper';
import './MobilePreview.css';

const MobilePreview = ({ pageTitle, links, style, profilePhotoUrl }) => {
    const Template = React.lazy(async () => {
        const { folder } = templates[style];
        return import(`../../templates/${folder}`);
    });

    return (
        <div className="mobile-preview">
            <Suspense fallback={<div>Loading...</div>}>
                <TemplateWrapper 
                    Template={Template} 
                    pageTitle={pageTitle} 
                    links={links}
                    profilePhotoUrl={profilePhotoUrl}
                />
            </Suspense>
        </div>
    );
};

export default MobilePreview; 