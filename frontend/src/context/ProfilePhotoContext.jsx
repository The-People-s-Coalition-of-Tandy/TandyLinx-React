import React, { createContext, useState, useContext } from 'react';

const ProfilePhotoContext = createContext();

export const ProfilePhotoProvider = ({ children }) => {
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
    const [currentPagePhotoUrl, setCurrentPagePhotoUrl] = useState(null);

    return (
        <ProfilePhotoContext.Provider value={{ 
            currentPhotoUrl, 
            setCurrentPhotoUrl,
            currentPagePhotoUrl,
            setCurrentPagePhotoUrl
        }}>
            {children}
        </ProfilePhotoContext.Provider>
    );
};

export const useProfilePhoto = () => {
    const context = useContext(ProfilePhotoContext);
    if (!context) {
        throw new Error('useProfilePhoto must be used within a ProfilePhotoProvider');
    }
    return context;
};

export default ProfilePhotoContext; 