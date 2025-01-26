import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export const PageSettingsModal = ({ template }) => {
    const [pageTitle, setPageTitle] = useState('');
    const [pageURL, setPageURL] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const createPage = async () => {
        if (user) {
            console.log(template.key);
            console.log(template);
            try {
                const response = await axios.post('/api/pages', {
                    pageTitle,
                    pageURL,
                    style: template.name
                }, {
                    withCredentials: true
                });
                if (response.status === 200) {
                    navigate(`/${pageURL}/edit`);
                }
            } catch (error) {
                console.error('Failed to create page:', error);
            }
        } else {
            console.error('User is not authenticated');
        }
    };

    return (
        <div>
            <input type="text" placeholder="Page Title" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
            <input type="text" placeholder="Page URL" value={pageURL} onChange={(e) => setPageURL(e.target.value)} />
            <button onClick={createPage}>Save</button>
        </div>
    );
};
