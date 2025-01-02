import React from 'react';
import { templates } from '../../templates/registry';
import './Preview.css';

const Preview = ({ pageTitle, links, style }) => {
    const Template = React.lazy(async () => {
        const { component } = templates[style];
        return import(`../../templates/${component}`);
    });

    return (
        <div className="preview-container">
            <div className="preview-header">Preview</div>
            <div className="preview-content">
                <React.Suspense fallback={<div>Loading...</div>}>
                    <Template pageTitle={pageTitle} links={links} />
                </React.Suspense>
            </div>
        </div>
    );
};

export default Preview; 