"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import supabase from "@/lib/supabase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { data, error } = await supabase.auth
            .resetPasswordForEmail(email_id)
        if (error) {
            toast.error('Failed to send email', {
                position: 'bottom-right',
                theme: "dark"
            });
        } else {
            console.log(data)
            toast.success('Email sent successfully', {
                position: 'bottom-right',
                theme: "dark"
            });
            setEmail("")
        }
    };

    return (
        <div className="min-h-screen flex bg-black">
            <ToastContainer />
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
                        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2><br></br>
                        <p className="text-white text-lg">Enter your email address. If the account exists, we will email you instructions to reset the password.</p>
                        {/* <p className="text-gray-300">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" replace={true} className="text-red-600 hover:underline">
                                Sign up
                            </Link>
                        </p> */}
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
                            {err && <p style={{ color: "red" }}>{err}</p>}
                            <div className="flex flex-col justify-between items-end">
                                <Button type="submit" disabled={processing} className="w-full bg-red-700 hover:bg-red-800 mt-4 text-white">
                                    Send Email
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )

}
