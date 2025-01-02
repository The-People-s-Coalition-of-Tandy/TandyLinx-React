import React from 'react';
import { templates } from '../../templates/registry';

const TemplateBrowser = () => {
    return (
        <div>
            {Object.entries(templates).map(([key, { name, component }]) => (
                <div key={key}>{name}</div>
            ))}
        </div>
    );
};

export default TemplateBrowser;