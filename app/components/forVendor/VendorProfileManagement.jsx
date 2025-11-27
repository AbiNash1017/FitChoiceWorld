'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Upload, X } from 'lucide-react';
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
        contact_no: 0
    });
    const [location, setLocation] = useState({
        id: '',
        address: '',
        latitude: '',
        longitude: '',
        city: '',
        state: '',
        pincode: ''
    })
    const [pendingHeaderImage, setPendingHeaderImage] = useState(null);
    const [pendingFitnessImages, setPendingFitnessImages] = useState([]);
    const fileInputRef = useRef(null);
    const headerFileInputRef = useRef(null);
    const { user, loading } = useAuth();
    const router = useRouter();

    const fetchGymDetails = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/fitness-center/my`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        if (response.ok && data.data) {
            const locationDetails = data.data.Location || {}
            const fetchedDetails = data.data;
            console.log("fetcheddeets", fetchedDetails)
            console.log("locationdeets", locationDetails)
            setGymDetails(fetchedDetails);
            setLocation(locationDetails)
            console.log("location", location)
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (user) {
            fetchGymDetails();
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
                setPendingHeaderImage(null); // Clear pending image
            } else if (gymDetails.header_image) {
                setGymDetails((prev) => ({ ...prev, header_image: '' })); // Clear existing header image
            }
        } else if (source === 'centre') {
            setGymDetails((prevDetails) => ({
                ...prevDetails,
                centre_images: prevDetails.centre_images.filter((_, i) => i !== index),
            }));
        }
    };

    //upload to firebase bucket
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


    //updating image
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            if (!user) return;
            const token = await user.getIdToken();
            let uploadedHeaderImage = null;
            let uploadedFitnessCentreImages = [];
            console.log("inside update", pendingHeaderImage)
            // If a new header image is pending, upload it
            if (pendingHeaderImage) {
                console.log("inside if pendingHeaderImage")
                uploadedHeaderImage = await uploadImageToFirebase(pendingHeaderImage, 'fitness-centre-images/header');
            }

            if (pendingFitnessImages) {
                uploadedFitnessCentreImages = await Promise.all(pendingFitnessImages.map((img) => {
                    return uploadImageToFirebase(img, 'fitness-centre-images');
                }))
            }

            // Update details with the new or cleared header image
            const updatedDetails = {
                ...gymDetails,
                address: location.address,
                pincode: location.pincode,
                header_image: pendingHeaderImage ? uploadedHeaderImage : (gymDetails.header_image || null),
                centre_images: [
                    ...gymDetails.centre_images, // Keep existing images
                    ...uploadedFitnessCentreImages.filter((img) => img !== null) // Add only successfully uploaded images
                ],
            };

            console.log("updatedDetails", updatedDetails.header_image)

            const response = await fetch(`/api/fitness-center/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedDetails),
            });

            if (!response.ok) throw new Error('Failed to update gym details')
            else alert("update success");

            fetchGymDetails();
            setPendingHeaderImage(null); // Clear local state for header image
            setPendingFitnessImages([]); // Clear pending fitness images
        } catch (error) {
            console.error('Error updating gym details:', error);
        }
    };


    return (
        <div className="space-y-3">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                {
                    gymDetails ?
                        <CardContent>
                            <form className="space-y-3" onSubmit={handleUpdate}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">
                                            Fitness Centre Name <span className="text-red-500 text-lg">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="centre_name"
                                            type="text"
                                            required
                                            value={gymDetails.centre_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_no">
                                            Contact Number <span className="text-red-500 text-lg">*</span>
                                        </Label>
                                        <Input
                                            id="contact_no"
                                            name="contact_no"
                                            type="text"
                                            required
                                            value={gymDetails.contact_no || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description">
                                        Description <span className="text-red-500 text-lg">*</span>
                                    </Label>
                                    <Textarea
                                        id="centre_description"
                                        name="centre_description"
                                        required
                                        value={gymDetails.centre_description || ''}
                                        onChange={handleInputChange}
                                        maxLength={500}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {gymDetails.centre_description?.length}/500 characters
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="address">
                                        Address <span className="text-red-500 text-lg">*</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        required
                                        value={location.address || ''}
                                        onChange={handleAddressChange}
                                        maxLength={500}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {location.address?.length}/500 characters
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="pincode">
                                        Pincode <span className="text-red-500 text-lg">*</span>
                                    </Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        type="number"
                                        maxLength={6}
                                        required
                                        value={location.pincode || ''}
                                        onChange={handlePincodeChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="google_maps_link">
                                        Location (Google Maps Link) <span className="text-red-500 text-lg">*</span>
                                    </Label>
                                    <Input
                                        id="google_maps_link"
                                        name="google_maps_link"
                                        type="text"
                                        required
                                        value={gymDetails.google_maps_link || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label>Header Image (1 image only) <span className='text-red-500 text-lg'>*</span></Label>
                                    <div className="mt-2 flex">
                                        {pendingHeaderImage || gymDetails.header_image ? (
                                            <div className="relative">
                                                <img
                                                    src={pendingHeaderImage ? URL.createObjectURL(pendingHeaderImage) : gymDetails.header_image}
                                                    alt="Header Preview"
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePendingImage('header')}
                                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => headerFileInputRef.current?.click()}
                                                className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded"
                                            >
                                                <Upload className="text-gray-400" />
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
                                    <Label>Fitness Centre Images (Up to 5 images) <span className='text-red-500 text-lg'>*</span></Label>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        {[...gymDetails.centre_images, ...pendingFitnessImages.map((file) => URL.createObjectURL(file))].map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image}
                                                    alt={`Fitness centre preview ${index + 1}`}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemovePendingImage(index < gymDetails.centre_images.length ? 'centre' : 'fitness', index)
                                                    }
                                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded"
                                        >
                                            <Upload className="text-gray-400" />
                                        </button>
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

                                <Button type="submit" className="w-auto mt-8 bg-red-600 hover:bg-red-700">
                                    Update Profile
                                </Button>
                            </form>
                        </CardContent>
                        :
                        <>
                            <div className='flex flex-col justify-center items-center animate-spin'><Loader /></div>
                        </>
                }
            </Card>
        </div>
    );
};

export default VendorProfileManagement;
