import React, { Suspense, useEffect } from 'react';
import { templates } from '../../templates/registry';
import TemplateWrapper from '../../templates/TemplateWrapper';
import './Preview.css';

const Preview = ({ pageTitle, links, style }) => {
    const Template = React.lazy(async () => {
        const { folder } = templates[style];
        return import(`../../templates/${folder}`);
    });


    return (
        <div className="preview-container">
            <div className="preview-header">Preview</div>
            <div className="preview-content">
                <div className="preview-frame-container">
                    <div className="preview-frame">
                        <div className="preview-scale-container">
                            <div className="preview-viewport-context">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <TemplateWrapper Template={Template} pageTitle={pageTitle} links={links} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preview;