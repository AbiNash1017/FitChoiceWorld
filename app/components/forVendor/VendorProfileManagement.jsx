'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Upload, X, User, Building2, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { storage } from '@/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useRouter } from 'next/navigation';

const VendorProfileManagement = () => {
    const [gymDetails, setGymDetails] = useState({
        id: '',
        centre_name: '',
        centre_description: '',
        rating_count: 0,
        rating: 0,
        header_image: '',
        owner_id: '',
        location_id: '',
        centre_images: [],
        google_maps_link: '',
        contact_no: 0,
        amenities: []
    });
    const [location, setLocation] = useState({
        id: '',
        address: '',
        latitude: '',
        longitude: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [userProfile, setUserProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        bio: '',
        profile_image_url: '',
        user_since: '',
        karma_points: 0,
        ai_credits: 0
    });
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [editedEmail, setEditedEmail] = useState('');
    const [pendingHeaderImage, setPendingHeaderImage] = useState(null);
    const [pendingProfileImage, setPendingProfileImage] = useState(null);
    const [pendingFitnessImages, setPendingFitnessImages] = useState([]);
    const fileInputRef = useRef(null);
    const headerFileInputRef = useRef(null);
    const profileFileInputRef = useRef(null);
    const { user, loading } = useAuth();
    const router = useRouter();

    const fetchVendorProfile = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/vendor/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        if (response.ok && data) {
            // Set user profile
            if (data.userProfile) {
                setUserProfile({
                    first_name: data.userProfile.first_name || '',
                    last_name: data.userProfile.last_name || '',
                    email: user.email || '',
                    phone_number: data.userProfile.phone_number || '',
                    bio: data.userProfile.bio || '',
                    profile_image_url: data.userProfile.profile_image_url || '',
                    user_since: data.userProfile.user_since || '',
                    karma_points: data.userProfile.karma_points || 0,
                    ai_credits: data.userProfile.ai_credits || 0
                });
            }

            // Set fitness center details
            if (data.fitnessCenter) {
                setGymDetails({
                    id: data.fitnessCenter._id || '',
                    centre_name: data.fitnessCenter.name || '',
                    centre_description: data.fitnessCenter.description || '',
                    rating_count: data.fitnessCenter.total_reviews || 0,
                    rating: data.fitnessCenter.rating || 0,
                    header_image: data.fitnessCenter.image_urls?.[0] || '',
                    owner_id: data.fitnessCenter.owner_id || '',
                    centre_images: data.fitnessCenter.image_urls || [],
                    google_maps_link: data.fitnessCenter.map_url || '',
                    contact_no: data.fitnessCenter.phone_number || '',
                    amenities: data.fitnessCenter.amenities || []
                });

                setLocation({
                    address: data.fitnessCenter.address || '',
                    city: data.fitnessCenter.city || '',
                    state: data.fitnessCenter.state || '',
                    pincode: data.fitnessCenter.postal_code || ''
                });
            }
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (user) {
            fetchVendorProfile();
        }
    }, [user, loading, router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGymDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handlePincodeChange = (e) => {
        const { name, value } = e.target;
        setLocation((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setLocation((prev) => ({ ...prev, [name]: value }));
    };

    const handleHeaderImageSelection = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setPendingHeaderImage(file);
        }
    };

    const handleFitnessImagesSelection = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length + gymDetails.centre_images.length > 5) {
                alert('You can only upload up to 5 fitness center images.');
                return;
            }
            setPendingFitnessImages((prev) => [...prev, ...files]);
        }
    };

    const handleRemovePendingImage = (source, index = 0) => {
        if (source === 'fitness') {
            setPendingFitnessImages((prevImages) => prevImages.filter((_, i) => i !== index));
        } else if (source === 'header') {
            if (pendingHeaderImage) {
                setPendingHeaderImage(null);
            } else if (gymDetails.header_image) {
                setGymDetails((prev) => ({ ...prev, header_image: '' }));
            }
        } else if (source === 'centre') {
            setGymDetails((prevDetails) => ({
                ...prevDetails,
                centre_images: prevDetails.centre_images.filter((_, i) => i !== index),
            }));
        } else if (source === 'profile') {
            setPendingProfileImage(null);
        }
    };

    const handleProfileImageSelection = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setPendingProfileImage(file);
        }
    };

    const uploadImageToFirebase = async (file, pathPrefix) => {
        try {
            const storageRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(snapshot.ref);
            return publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            if (!user) return;
            const token = await user.getIdToken();
            let uploadedHeaderImage = null;
            let uploadedFitnessCentreImages = [];

            if (pendingHeaderImage) {
                uploadedHeaderImage = await uploadImageToFirebase(pendingHeaderImage, `fitness-centre-images/${user.uid}/header`);
            }

            if (pendingFitnessImages.length > 0) {
                uploadedFitnessCentreImages = await Promise.all(pendingFitnessImages.map((img) => {
                    return uploadImageToFirebase(img, `fitness-centre-images/${user.uid}/gallery`);
                }))
            }

            const updatedDetails = {
                ...gymDetails,
                address: location.address,
                pincode: location.pincode,
                header_image: pendingHeaderImage ? uploadedHeaderImage : (gymDetails.header_image || null),
                centre_images: [
                    ...gymDetails.centre_images,
                    ...uploadedFitnessCentreImages.filter((img) => img !== null)
                ],
            };

            const response = await fetch(`/api/fitness-center/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedDetails),
            });

            if (!response.ok) throw new Error('Failed to update gym details')
            else alert("Update successful");

            fetchVendorProfile();
            setPendingHeaderImage(null);
            setPendingFitnessImages([]);
        } catch (error) {
            console.error('Error updating gym details:', error);
        }
    };

    const handleUpdateUserProfile = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            let profileImageUrl = userProfile.profile_image_url;

            if (pendingProfileImage) {
                const uploadedUrl = await uploadImageToFirebase(pendingProfileImage, `user-profile-images/${user.uid}`);
                if (uploadedUrl) {
                    profileImageUrl = uploadedUrl;
                }
            }

            const updatePayload = {};
            if (editedEmail && editedEmail !== userProfile.email) updatePayload.email = editedEmail;
            if (profileImageUrl !== userProfile.profile_image_url) updatePayload.profile_image_url = profileImageUrl;

            if (Object.keys(updatePayload).length === 0) {
                alert('No changes to save');
                return;
            }

            const response = await fetch('/api/user/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) throw new Error('Failed to update user profile');

            alert('Profile updated successfully');
            setUserProfile(prev => ({
                ...prev,
                email: updatePayload.email || prev.email,
                profile_image_url: updatePayload.profile_image_url || prev.profile_image_url
            }));

            setIsEditingEmail(false);
            setPendingProfileImage(null);
        } catch (error) {
            console.error('Error updating user profile:', error);
            alert('Failed to update profile');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="border-gray-200">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="w-5 h-5 text-black" />
                        User Profile
                    </CardTitle>
                </CardHeader>
                {userProfile ? (
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Image */}
                            <div className="md:col-span-2 flex items-center gap-6">
                                <div className="relative">
                                    {pendingProfileImage || userProfile.profile_image_url ? (
                                        <div className="relative group w-24 h-24">
                                            <img
                                                src={pendingProfileImage ? URL.createObjectURL(pendingProfileImage) : userProfile.profile_image_url}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                                onClick={() => profileFileInputRef.current?.click()}>
                                                <Upload className="text-white w-6 h-6" />
                                            </div>
                                            {pendingProfileImage && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemovePendingImage('profile');
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                                    title="Remove uploaded image"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-black hover:bg-gray-200 transition-colors"
                                            onClick={() => profileFileInputRef.current?.click()}
                                        >
                                            <Upload className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={profileFileInputRef}
                                        onChange={handleProfileImageSelection}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-gray-900">
                                        {userProfile.first_name} {userProfile.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Fitness Center Owner</p>
                                    {pendingProfileImage && (
                                        <div className="mt-2 flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleUpdateUserProfile}
                                                className="bg-black hover:bg-gray-800 text-white h-8 text-xs"
                                            >
                                                Save New Image
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setPendingProfileImage(null)}
                                                className="h-8 text-xs"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </Label>
                                {isEditingEmail ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            value={editedEmail}
                                            onChange={(e) => setEditedEmail(e.target.value)}
                                            className="flex-1"
                                            placeholder="Enter new email"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleUpdateUserProfile}
                                            className="bg-black hover:bg-gray-800 text-white"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingEmail(false);
                                                setEditedEmail(userProfile.email);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-900 flex-1">{userProfile.email || 'Not provided'}</p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingEmail(true);
                                                setEditedEmail(userProfile.email);
                                            }}
                                            className="text-xs"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </Label>
                                <p className="text-gray-900">{userProfile.phone_number || 'Not provided'}</p>
                            </div>

                            {/* Member Since */}
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Member Since
                                </Label>
                                <p className="text-gray-900">{formatDate(userProfile.user_since)}</p>
                            </div>

                            {/* Bio */}
                            {userProfile.bio && (
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-sm font-medium text-gray-600">Bio</Label>
                                    <p className="text-gray-900">{userProfile.bio}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                ) : (
                    <CardContent className="flex justify-center items-center py-8">
                        <Loader className="animate-spin text-gray-400" />
                    </CardContent>
                )}
            </Card>

            {/* Fitness Center Profile Card */}
            <Card className="border-gray-200">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="w-5 h-5 text-black" />
                        Fitness Center Profile
                    </CardTitle>
                </CardHeader>
                {gymDetails ? (
                    <CardContent className="pt-6">
                        <form className="space-y-6" onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">
                                        Fitness Centre Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="centre_name"
                                        type="text"
                                        required
                                        value={gymDetails.centre_name}
                                        onChange={handleInputChange}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_no">
                                        Contact Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="contact_no"
                                        name="contact_no"
                                        type="text"
                                        required
                                        value={gymDetails.contact_no || ''}
                                        onChange={handleInputChange}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="centre_description"
                                    name="centre_description"
                                    required
                                    value={gymDetails.centre_description || ''}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                    className="mt-1.5 min-h-[100px]"
                                />
                                <p className="text-sm text-gray-500 mt-1.5">
                                    {gymDetails.centre_description?.length}/500 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="address">
                                    Address <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    required
                                    value={location.address || ''}
                                    onChange={handleAddressChange}
                                    maxLength={500}
                                    className="mt-1.5 min-h-[80px]"
                                />
                                <p className="text-sm text-gray-500 mt-1.5">
                                    {location.address?.length}/500 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="pincode">
                                    Pincode <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="pincode"
                                    name="pincode"
                                    type="number"
                                    maxLength={6}
                                    required
                                    value={location.pincode || ''}
                                    onChange={handlePincodeChange}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label>Amenities</Label>
                                <div className="mt-3 space-y-2">
                                    {['AC Facility', 'Locker Rooms', 'WiFi'].map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={gymDetails.amenities.includes(amenity)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setGymDetails(prev => ({
                                                            ...prev,
                                                            amenities: [...prev.amenities, amenity]
                                                        }));
                                                    } else {
                                                        setGymDetails(prev => ({
                                                            ...prev,
                                                            amenities: prev.amenities.filter(a => a !== amenity)
                                                        }));
                                                    }
                                                }}
                                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                            />
                                            <span className="text-sm text-gray-700">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="google_maps_link">
                                    Location (Google Maps Link) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="google_maps_link"
                                    name="google_maps_link"
                                    type="text"
                                    required
                                    value={gymDetails.google_maps_link || ''}
                                    onChange={handleInputChange}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label>Header Image (1 image only)</Label>
                                <div className="mt-3 flex gap-3">
                                    {pendingHeaderImage || gymDetails.header_image ? (
                                        <div className="relative group">
                                            <img
                                                src={pendingHeaderImage ? URL.createObjectURL(pendingHeaderImage) : gymDetails.header_image}
                                                alt="Header Preview"
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePendingImage('header')}
                                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-800"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => headerFileInputRef.current?.click()}
                                            className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors"
                                        >
                                            <Upload className="text-gray-400 mb-1" size={24} />
                                            <span className="text-xs text-gray-500">Upload</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={headerFileInputRef}
                                    onChange={handleHeaderImageSelection}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div>
                                <Label>Fitness Centre Images (Up to 5 images)</Label>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {[...gymDetails.centre_images, ...pendingFitnessImages.map((file) => URL.createObjectURL(file))].map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Fitness centre preview ${index + 1}`}
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemovePendingImage(index < gymDetails.centre_images.length ? 'centre' : 'fitness', index)
                                                }
                                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-800"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {[...gymDetails.centre_images, ...pendingFitnessImages].length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors"
                                        >
                                            <Upload className="text-gray-400 mb-1" size={24} />
                                            <span className="text-xs text-gray-500">Upload</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFitnessImagesSelection}
                                    accept="image/*"
                                    className="hidden"
                                    multiple
                                />
                            </div>

                            <Button type="submit" className="w-full md:w-auto bg-black hover:bg-gray-800 text-white transition-colors shadow-lg">
                                Update Fitness Center Profile
                            </Button>
                        </form>
                    </CardContent>
                ) : (
                    <CardContent className="flex justify-center items-center py-8">
                        <Loader className="animate-spin text-gray-400" />
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

export default VendorProfileManagement;
