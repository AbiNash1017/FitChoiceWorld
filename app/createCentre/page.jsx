"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import Image from "next/image";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { Textarea } from "@/components/ui/textarea";

const states = [
    'Andra Pradesh',
    'Karnataka',
    'Uttar Pradesh',
    'Madya Pradesh',
    'Telangana',
    'Tamilnadu',
    'Kerala',
    'Goa',
    'Punjab',
    'Jharkhand',
    'Maharashtra',
];

const statesCities = {
    'Andra Pradesh': [
        'Visakhapatnam',
        'Vijayawada',
        'Guntur',
        'Nellore',
        'Kurnool',
        'Rajahmundry',
        'Tirupati',
        'Kadapa',
        'Anantapur',
        'Eluru',
        'Chittoor',
        'Ongole',
        'Srikakulam',
        'Vizianagaram',
        'Machilipatnam',
        'Tenali',
        'Proddatur',
        'Adoni',
        'Hindupur',
        'Bhimavaram'
    ],
    'Karnataka': [
        'Bagalkot',
        'Ballari',
        'Belagavi',
        'Bengaluru',
        'Bidar',
        'Chickamagaluru',
        'Chitradurga',
        'Davanagere',
        'Dharwad',
        'Hassan',
        'Hubballi',
        'Kalaburagi',
        'Karwar',
        'Kolar',
        'Mangaluru',
        'Mysuru',
        'Raichur',
        'Shivamogga',
        'Tumakuru',
        'Udupi',
        'Vijayapura'
    ],
    'Uttar Pradesh': [
        'Lucknow',
        'Kanpur',
        'Varanasi',
        'Agra',
        'Prayagraj',
        'Ghaziabad',
        'Noida',
        'Meerut',
        'Bareilly',
        'Aligarh',
        'Moradabad',
        'Jhansi',
        'Gorakhpur',
        'Saharanpur',
        'Faizabad',
        'Mathura',
        'Firozabad',
        'Ayodhya',
        'Rampur',
        'Sultanpur'
    ],
    'Madya Pradesh': [
        'Bhopal',
        'Indore',
        'Jabalpur',
        'Gwalior',
        'Ujjain',
        'Sagar',
        'Satna',
        'Ratlam',
        'Rewa',
        'Dewas',
        'Chhindwara',
        'Katni',
        'Morena',
        'Khandwa',
        'Vidisha',
        'Itarsi',
        'Bhind',
        'Shivpuri',
        'Betul',
        'Sehore'
    ],
    'Telangana': [
        'Hyderabad',
        'Warangal',
        'Nizamabad',
        'Khammam',
        'Karimnagar',
        'Ramagundam',
        'Mahbubnagar',
        'Nalgonda',
        'Adilabad',
        'Siddipet',
        'Miryalaguda',
        'Jagtial',
        'Suryapet',
        'Mancherial',
        'Bodhan',
        'Kamareddy',
        'Zaheerabad',
        'Vikarabad',
        'Wanaparthy',
        'Kothagudem'
    ],
    'Tamilnadu': [
        'Chennai',
        'Coimbatore',
        'Madurai',
        'Tiruchirappalli',
        'Salem',
        'Erode',
        'Tirunelveli',
        'Vellore',
        'Thoothukudi',
        'Dindigul',
        'Thanjavur',
        'Karur',
        'Sivakasi',
        'Nagercoil'
    ],
    'Kerala': [
        'Thiruvananthapuram',
        'Kochi',
        'Kozhikode',
        'Thrissur',
        'Kollam',
        'Alappuzha',
        'Kannur',
        'Palakkad',
        'Kottayam',
        'Malappuram',
        'Pathanamthitta',
        'Idukki',
        'Kasaragod',
        'Varkala',
        'Chengannur',
        'Kayamkulam',
        'Nedumangad',
        'Ponnani',
        'Thalassery',
        'Chalakudy'
    ],
    'Goa': [
        'Panaji',
        'Margao',
        'Vasco da Gama',
        'Mapusa',
        'Ponda',
        'Bicholim',
        'Sanquelim',
        'Curchorem',
        'Quepem',
        'Valpoi',
        'Canacona',
        'Sanguem'
    ],
    'Punjab': [
        'Ludhiana',
        'Amritsar',
        'Jalandhar',
        'Patiala',
        'Bathinda',
        'Mohali',
        'Hoshiarpur',
        'Pathankot',
        'Moga',
        'Abohar',
        'Batala',
        'Barnala',
        'Firozpur',
        'Kapurthala',
        'Phagwara',
        'Malerkotla',
        'Faridkot',
        'Khanna',
        'Rajpura',
        'Zirakpur'
    ],
    'Jharkhand': [
        'Ranchi',
        'Jamshedpur',
        'Dhanbad',
        'Bokaro Steel City',
        'Deoghar',
        'Hazaribagh',
        'Giridih',
        'Ramgarh',
        'Chirkunda',
        'Phusro',
        'Medininagar (Daltonganj)',
        'Chaibasa',
        'Jhumri Telaiya',
        'Simdega',
        'Gumla',
        'Latehar',
        'Godda',
        'Pakur',
        'Sahibganj',
        'Lohardaga'
    ],
    'Maharashtra': [
        'Mumbai',
        'Pune',
        'Nagpur',
        'Nashik',
        'Thane',
        'Aurangabad',
        'Solapur',
        'Amravati',
        'Kolhapur',
        'Nanded',
        'Sangli',
        'Jalgaon',
        'Akola',
        'Latur',
        'Ahmednagar',
        'Dhule',
        'Chandrap'
    ],
};

export default function CreateCentre() {
    const [centreName, setCentreName] = useState("");
    const [contact_no, setContact_no] = useState("");
    const [centreDescription, setCentreDescription] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        error: null,
    });
    const [pincode, setPincode] = useState("");
    const [error, setError] = useState(null);
    const [planId, setPlanId] = useState(1);
    const { user, loading } = useAuth();
    const router = useRouter()
    const [processing, setProcessing] = useState(false);
    const MAX_CHARS = 256

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
            }));
            console.log("error in location", location)
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
        console.log("location", location)
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (processing) return;
        setProcessing(true)
        setError(null);
        console.log('lat', location?.latitude)
        console.log('lat', location?.longitude)

        try {
            const token = await user.getIdToken();
            const payload = {
                centre_name: centreName,
                centre_description: centreDescription,
                state,
                city,
                latitude: location?.latitude?.toString(),
                longitude: location?.longitude?.toString(),
                address,
                //centrePhone
                plan_id: planId,
                pincode,
                contact_no
            };
            console.log(payload)
            const response = await fetch(`/api/fitness-center/create`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            // console.log(response)
            // console.log("=========h==========")
            const data = await response.json();

            console.log('resp', data.message)

            if (data.message !== "OK") {
                setError(data.error);
                setProcessing(false)
                return;
            }
            alert("Fitness Centre created successfully! Login to continue")
            router.push('/login')
        } catch (err) {
            console.log(err)
            setProcessing(false)
            setError("Failed to connect to the server!");
        }
    };

    const handleChange = (e) => {
        const input = e.target.value
        if (input.length <= MAX_CHARS) {
            setCentreDescription(input)
        }
    }

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
                        <h2 className="text-3xl font-bold text-white mb-2">Create your Fitness Centre</h2>
                        {/* <p className="text-gray-300">
                            Have an account?{" "}
                            <Link href="/login" replace={true} className="text-red-600 hover:underline">
                                Log In
                            </Link>
                        </p> */}
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* centre_name, centre_description, address, latitude, longitude, city, state */}
                            <Input
                                type="text"
                                placeholder="Fitness Centre Name"
                                value={centreName}
                                onChange={(e) => setCentreName(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <div className="space-y-2">
                                <Textarea
                                    id="description"
                                    placeholder="Fitness Centre Description"
                                    value={centreDescription}
                                    onChange={handleChange}
                                    className="bg-white/80 placeholder:text-gray-500 resize-none"
                                />
                                <p className="text-sm text-muted-foreground">
                                    {MAX_CHARS - centreDescription.length} characters remaining
                                </p>
                            </div>
                            <Input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Select name="edit-city" value={city} onValueChange={(value) => setCity(value)} disabled={!state}>
                                <SelectTrigger className="mt-1 bg-white/80 placeholder:text-gray-500">
                                    <SelectValue placeholder={state ? "Select City" : "Please select a state first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {state && statesCities[state]?.map((cityName) => (
                                        <SelectItem key={cityName} value={cityName}>
                                            {cityName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select name="edit-state" value={state} onValueChange={(value) => {
                                setState(value);
                                setCity(""); // Reset city when state changes
                            }}>
                                <SelectTrigger className="mt-1 bg-white/80 placeholder:text-gray-500">
                                    <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((stateName) => (
                                        <SelectItem key={stateName} value={stateName}>
                                            {stateName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* <Input
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            /> */}
                            <Input
                                type="text"
                                placeholder="Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Input
                                type="text"
                                placeholder="Contact Number"
                                value={contact_no}
                                onChange={(e) => setContact_no(e.target.value)}
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
