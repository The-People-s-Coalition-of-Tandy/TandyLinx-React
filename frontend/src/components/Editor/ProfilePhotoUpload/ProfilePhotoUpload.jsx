import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EditIcon from '../../common/EditIcon/EditIcon';
import './ProfilePhotoUpload.css';

const DEFAULT_PROFILE_PHOTO = './assets/images/default-profile.png'; // Replace with your actual default photo URL

const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ProfilePhotoUpload = () => {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCurrentPhoto();
  }, []);

  const fetchCurrentPhoto = async () => {
    try {
      const response = await axios.get('/api/profile-photo', {
        withCredentials: true
      });
      setCurrentPhotoUrl(response.data.photoUrl);
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

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
      const response = await axios.post('/api/upload-profile-photo', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCurrentPhotoUrl(response.data.photoUrl);
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
          {currentPhotoUrl ? (
            <img src={currentPhotoUrl} alt="Profile" />
          ) : (
            <img src={DEFAULT_PROFILE_PHOTO} alt="Default Profile" />
          )}
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