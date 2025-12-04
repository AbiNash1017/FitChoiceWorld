// lib/uploadHelpers.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Uploads a profile image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} uid - The user's Firebase UID
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export async function uploadProfileImage(file, uid) {
    try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size exceeds 5MB limit.');
        }

        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `center-admin-${uid}-${timestamp}.${fileExtension}`;

        // Create storage reference
        const storageRef = ref(storage, `profile-images/center-admins/${fileName}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file, {
            contentType: file.type,
            customMetadata: {
                uploadedBy: uid,
                uploadedAt: new Date().toISOString(),
            }
        });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('Image uploaded successfully:', downloadURL);
        return downloadURL;

    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
}

/**
 * Update center admin profile with optional image upload
 * @param {Object} formData - Profile data to update
 * @param {File|null} imageFile - Optional image file to upload
 * @param {Object} user - Firebase user object
 * @returns {Promise<Object>} - Updated profile data
 */
export async function updateCenterAdminProfile(formData, imageFile, user) {
    try {
        if (!user) {
            throw new Error('User not authenticated');
        }

        let profileImageUrl = null;

        // Upload image to Firebase Storage if provided
        if (imageFile) {
            profileImageUrl = await uploadProfileImage(imageFile, user.uid);
        }

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Update profile via API
        const response = await fetch('/api/vendor/profile/update', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                ...formData,
                ...(profileImageUrl && { profile_image_url: profileImageUrl }),
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update profile');
        }

        const data = await response.json();
        console.log('Profile updated successfully:', data);
        return data;

    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

/**
 * Create initial center admin profile
 * @param {Object} profileData - Complete profile data
 * @param {File|null} imageFile - Optional image file
 * @param {Object} user - Firebase user object
 * @returns {Promise<Object>} - Created profile data
 */
export async function createCenterAdminProfile(profileData, imageFile, user) {
    try {
        if (!user) {
            throw new Error('User not authenticated');
        }

        let profileImageUrl = null;

        // Upload image to Firebase Storage if provided
        if (imageFile) {
            profileImageUrl = await uploadProfileImage(imageFile, user.uid);
        }

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Create profile via API
        const response = await fetch('/api/vendor/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                ...profileData,
                profile_image_url: profileImageUrl,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create profile');
        }

        const data = await response.json();
        console.log('Profile created successfully:', data);
        return data;

    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}
