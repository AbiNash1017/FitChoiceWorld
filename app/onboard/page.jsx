"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/app/context/AuthContext";

export default function Onboard() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [mobileNumber, setMobileNumuber] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [location, setLocation] = useState();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.phoneNumber) {
            setMobileNumuber(user.phoneNumber);
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                });
            },
            (error) => {
                setLocation((prev) => ({
                    ...prev,
                    error: error.message,
                }));
            }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (processing) return;
        setProcessing(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/auth/onboardOwner`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    gender,
                    dob,
                    state,
                    city,
                    mobile_no: mobileNumber,
                    latitude: location?.latitude?.toString(),
                    longitude: location?.longitude?.toString(),
                    address: ""
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update profile");
                setProcessing(false);
                return;
            }
            router.push("/createCentre");
        } catch (err) {
            setError("Failed to connect to the server!");
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

    return (
        <div className="min-h-screen flex bg-black">
            <div>
                <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={50} width={50} className='h-[45px] w-[45px] md:h-[50px] md:w-[50px] lg:h-[70px] lg:w-[70px] mt-2' /></Link>
            </div>
            <div className="hidden lg:flex lg:w-1/2 bg-black p-10 flex-col justify-center items-start">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-1">
                        Become a <span className="text-red-600">FCW</span> User
                    </h1>
                    <p className="text-lg text-gray-400 mb-5">
                        Take your fitness journey to the next level with our platform
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Discover fitness centers near you",
                            "Book fitness sessions and track your history",
                            "Swipe, match and book a couples session",
                            "Track your progress on our leaderboard",
                        ].map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-300">
                                <span className="w-5 h-5 mr-3 rounded-full bg-red-600 flex items-center justify-center text-white text-sm">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h1 className="text-4xl font-bold text-white mt-8 mb-1">
                        Become a <span className="text-red-600">FCW</span> Partner
                    </h1>
                    <p className="text-lg text-gray-400 mb-5">
                        Streamline your fitness center management with our powerful platform
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Effortless booking management",
                            "Detailed user insights",
                            "Real-time revenue tracking",
                            "Comprehensive analytics"
                        ].map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-300">
                                <span className="w-5 h-5 mr-3 rounded-full bg-red-600 flex items-center justify-center text-white text-sm">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="w-full lg:w-1/2 bg-white bg-opacity-10 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">OnBoard</h2>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Select name="edit-gender" value={gender} onValueChange={(value) => setGender(value)} >
                                <SelectTrigger className="mt-1 bg-white/80 placeholder:text-gray-500">
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent >
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                placeholder="DoB"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Input
                                type="number"
                                placeholder="Mobile Number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumuber(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Input
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />

                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <div>
                                <Button type="submit" disabled={!user || processing} className={`w-full mt-3 bg-red-700 hover:bg-red-800 ${!user && 'bg-gray-500 hover:bg-gray-700'}`}>
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
