"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import Image from "next/image";
import { checkCookies } from "@/lib/utils";
import supabase from "@/lib/supabase";

export default function Login() {
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Owner");
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (processing) return;
        setProcessing(true)
        setError(null);

        if (confirmPassword !== password) {
            setError("Passwords do not match!")
            setProcessing(false)
            return;
        }

        try {

            const auth = await supabase.auth.signUp({
                email: email_id,
                password: password,
                options: {
                    data: {
                        _role: 'Owner'
                    },
                }
            })
            console.log(auth)
            if (auth.data.user) {
                const user = await supabase.auth.getSession()
                console.log(user)
                router.push('/onboard')
            }
            else {
                setError(auth.error?.message);
                setProcessing(false)
                return;
            }
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            //   method: "POST",
            //   credentials: 'include',
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify({ email_id, password, role: "Owner" }),
            // });
            // const data = await response.json();
            // console.log(data)
            // if (data.message !== "OK") {
            //   setError(data.error);
            //   return;
            // }
            // router.push("/onboard")
            // if (data.role === "Owner") {
            //   router.push('/vendor/dashboard')
            // }
            // if (data.role === "admin") {
            //   router.push('/admin/dashboard')
            // }
        } catch (err) {
            setError("Failed to connect to the server!");
            setProcessing(false)
        }
        setProcessing(false)
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
                        <h2 className="text-3xl font-bold text-white mb-2">Sign Up</h2>
                        <p className="text-gray-300">
                            Have an account?{" "}
                            <Link href="/login" replace={true} className="text-red-600 hover:underline">
                                Log In
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
                                className="bg-white/80 placeholder:text-gray-500"
                            />
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-white/80  placeholder:text-gray-500"
                            />
                            {/* <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-md border p-2 text-sm bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"> */}
                            {/* <option value="defaultopt">Select role</option> */}
                            {/* <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option> */}
                            {/* </select> */}
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <div>
                                <Button disabled={processing} type="submit" className="w-full mt-3 bg-red-700 hover:bg-red-800 text-white">
                                    Sign Up
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
