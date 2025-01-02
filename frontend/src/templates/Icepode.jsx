import React from 'react';

const Icepode = ({ pageTitle, links }) => {
    return (
        <div>
            <h1>{pageTitle}</h1>
            <div>
                {links.map((link, index) => (
                    <div key={index}>
                        <a href={link.url}>{link.name}</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Icepode;