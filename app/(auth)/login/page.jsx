"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import supabase from "@/lib/supabase";
// import { cookies } from "next/headers";

export default function Login() {
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (processing) return;
        setProcessing(true)
        setError(null);

        try {
            const auth = await supabase.auth.signInWithPassword({
                email: email_id,
                password: password,
            })
            // console.log(auth)
            if (auth.data.user) {
                const user = await supabase.auth.getSession()
                // console.log(user)
                const role = await supabase.from('Users').select('role, id').eq('uid', auth.data.user.id)
                if (role.data && role.data[0]) {
                    if (role.data[0].role.toLowerCase() === 'owner') {
                        // router.push('/vendor/dashboard')
                        const gym = await supabase.from('Fitness_Centres').select('*').eq('owner_id', role.data[0].id)
                        if (gym.data && gym.data[0]) {
                            window.location.href = `/vendor/dashboard`
                        } else {
                            window.location.href = `/createCentre`
                        }
                    }
                    if (role.data[0].role === 'admin') {
                        // router.push('/admin/dashboard')
                        window.location.href = `/admin/dashboard`
                    }
                    if (role.data[0].role.toLowerCase() === 'customer') {
                        // router.push('/forUser')
                        window.location.href = `/forUser`
                    }
                }
                if (!role.data || !role.data[0]) {
                    window.location.href = `/onboard`
                }
                setProcessing(false)
            }
            else {
                setError(auth.error?.message);
                setProcessing(false)
                return;
            }
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            //   method: "POST",
            //   credentials: 'include',
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify({ email_id, password }),
            // });

            // const data = await response.json();
            // console.log("hi")
            // console.log(data.data)

            // if(data.message !== "OK"){
            //   setError(data.error);
            //   return;
            // }

            // if(data.data.toLowerCase() === "owner"){
            // const cs = await cookies()
            //         cs.set('owner_id', data.data.user_id)
            // cs.set('fitness_centre_id', data.data.fitness_centre_id)        
            // router.push('/vendor/dashboard')
            // }
            // if(data.data === "admin"){
            //   router.push('/admin/dashboard')
            // }
        } catch (err) {
            console.log(err)
            setError("Failed to connect to the server!");
            setProcessing(false)
        }
    };

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
                        <h2 className="text-3xl font-bold text-white mb-2">Log In</h2>
                        <p className="text-gray-300">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" replace={true} className="text-red-600 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email_id}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/80  placeholder:text-gray-500"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/80  placeholder:text-gray-500"
                            />
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <div className="flex flex-col justify-between items-end">
                                <Link href="/forgot-password" className="text-sm text-gray-300 hover:underline">
                                    Forgot Password?
                                </Link>
                                <Button type="submit" disabled={processing} className="w-full bg-red-700 hover:bg-red-800 mt-4 text-white">
                                    Log In
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )

}
