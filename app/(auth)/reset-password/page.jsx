"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import supabase from "@/lib/supabase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RSTP() {
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [event, setEvent] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams()

    useEffect(() => {
        let tokenHash = searchParams.get('token')
        if (tokenHash) {
            supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' }).then(({ data, error }) => {
                console.log(data)
                console.log(error)
            })
        }
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(event)
            console.log(session)
            if (event == "PASSWORD_RECOVERY") {
                setEvent(event)
                // if (password) {
                //     const { data, error } = await supabase.auth
                //         .updateUser({ password: password })

                //     if (data) alert("Password updated successfully!")
                //     if (error) alert("There was an error updating your password.")
                // }
            }
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password) {
            const { data, error } = await supabase.auth
                .updateUser({ password: password })
            if (error) {
                toast.error('Failed to reset password', {
                    position: 'bottom-right',
                    theme: "dark"
                });
            } else {
                console.log(data)
                toast.success('Password reset successfully', {
                    position: 'bottom-right',
                    theme: "dark"
                });
                window.location.href = '/login'
            }
            // console.log(data)
            // console.log(error
            // if (data) {
            //     alert("Password updated successfully!")
            //     console.log(data)
            // }
            // if (error) alert("There was an error updating your password.")
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
                        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-white text-lg">Enter your new password below</p>
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
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/80  placeholder:text-gray-500"
                            />
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <div className="flex flex-col justify-between items-end">
                                <Button type="submit" disabled={processing} className="w-full bg-red-700 hover:bg-red-800 mt-4 text-white">
                                    Reset Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )

}


const ResetPassword = () => {
    return (
        <Suspense>
            <RSTP />
        </Suspense>
    )
}
export default ResetPassword
