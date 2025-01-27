import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import EditIcon from '../../common/EditIcon/EditIcon';
import './ProfilePhotoUpload.css';
import { useProfilePhoto } from '../../../context/ProfilePhotoContext';

const DEFAULT_PROFILE_PHOTO = './assets/images/default-profile.png'; // Replace with your actual default photo URL

const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ProfilePhotoUpload = ({ pageUrl }) => {
  const { currentPhotoUrl, setCurrentPhotoUrl, setCurrentPagePhotoUrl } = useProfilePhoto();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const fetchCurrentPhoto = useCallback(async () => {
    console.log('Fetching photo for pageUrl:', pageUrl);
    if (isUploading) return;
    
    try {
      const response = await axios.get(`/api/pages/${pageUrl}/photo`, {
        withCredentials: true
      });
      if (response.data.photoUrl) {
        console.log('Setting currentPhotoUrl to:', response.data.photoUrl);
        setCurrentPhotoUrl(response.data.photoUrl);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile photo:', error);
      }
    }
  }, [pageUrl, isUploading, setCurrentPhotoUrl]);

  useEffect(() => {
    if (pageUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching photo due to pageUrl change:', pageUrl);
      }
      fetchCurrentPhoto();
    }
  }, [pageUrl, fetchCurrentPhoto]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      alert('Please upload a supported image format (JPEG, PNG, WebP, or GIF)');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    
    setIsUploading(true);
    try {
      const response = await axios.post(`/api/pages/${pageUrl}/photo`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.photoUrl) {
        // Update both photo URLs to trigger Preview refresh
        setCurrentPhotoUrl(response.data.photoUrl);
        setCurrentPagePhotoUrl(response.data.photoUrl);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload photo. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="profile-photo-upload">
      <div className="photo-preview">
        <div className="photo-content" onClick={handlePhotoClick}>
          <img 
            src={currentPhotoUrl || '/assets/images/default-profile.png'} 
            alt="Profile" 
            onError={(e) => {
              e.target.onError = null;
              if (process.env.NODE_ENV === 'development') {
                console.error('Error loading profile image, falling back to default');
              }
              e.target.src = '/assets/images/default-profile.png';
            }}
          />
        </div>
        <label htmlFor="photo-upload" className="edit-overlay">
          <EditIcon />
        </label>
      </div>
      
      <div className="upload-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          id="photo-upload"
          className="file-input"
          disabled={isUploading}
          ref={inputRef}
        />
      </div>
    </div>
  );
};

export default ProfilePhotoUpload; 