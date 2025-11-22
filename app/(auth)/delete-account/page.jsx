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
import { getUserSession } from "@/lib/auth";

export default function ForgotPassword() {
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState(null);
    const [credsVerified, setCredsVerified] = useState(false)
    const [processing, setProcessing] = useState(false);
    const [showPopup, setShowPopup] = useState(false)
    const [authSession, setAuthSession] = useState(null)
    const router = useRouter();

    const signOut = async () => {
        const logout = await supabase.auth.signOut()
    }

    useEffect(() => {
        signOut()
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault()
        if (processing) return;
        setProcessing(true)
        setErr(null);
        const { data, error } = await supabase.auth.signInWithPassword({ email: email_id, password: password })
        if (error) {
            toast.error('Error: ' + error, {
                position: 'bottom-right',
                theme: "dark"
            });
            setProcessing(false)
        } else {
            console.log(data)
            setCredsVerified(true)
            setEmail("")
            setPassword("")
            setProcessing(false)
        }
    };

    const setUserSession = async () => {
        let userSession = null
        try {
            userSession = await getUserSession()
            setAuthSession(userSession)
        } catch (error) {
            setCredsVerified(false)
            return;
        }
    }

    const deleteAccount = async () => {
        setUserSession()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/deleteAccount`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession?.access_token}`
            },
        });
        const responseData = await response.json()
        if (responseData.message === "Deleted User!") {
            toast.success("Account deleted succesfully!", {
                position: 'bottom-right',
                theme: 'dark',
            })
            setTimeout(() => {
                setCredsVerified(false)
                setShowPopup(false)
            }, 5000)
        } else {
            toast.error("Some error occured while deleting account.", {
                position: 'bottom-right',
                theme: 'dark',
            })
        }
    }

    return (
        <div className="min-h-screen flex bg-black">
            <ToastContainer />
            <div>
                <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={50} width={50} className='h-[45px] w-[45px] md:h-[50px] md:w-[50px] lg:h-[70px] lg:w-[70px] mt-2' /></Link>
            </div>

            <div className="w-full bg-white bg-opacity-10 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Want to delete your account?</h2><br></br>
                        {
                            !credsVerified ?
                                <p className="text-white text-lg">Enter your email address and password to proceed.</p>
                                : <p className="text-white text-lg">Click on <span className="text-red-700">Delete Account</span> to proceed.</p>
                        }
                    </div>

                    {
                        !credsVerified ?
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
                                    {err && <p style={{ color: "red" }}>{err}</p>}
                                    <div className="flex flex-col justify-between items-end">
                                        <Button type="submit" disabled={processing} className="w-full bg-red-700 hover:bg-red-800 mt-4 text-white">
                                            Proceed
                                        </Button>
                                    </div>
                                </form>
                            </div>
                            :
                            <>
                                <Button onClick={() => setShowPopup(true)} disabled={processing} className="w-full mt-4 text-red-700 border border-red-700">
                                    Delete Account!
                                </Button>
                            </>
                    }
                </div>
                {
                    showPopup &&
                    <div className="absolute inset-0 w-full h-full bg-transparent backdrop-blur-sm flex justify-center items-center">
                        <div className="absolute inset-0 w-full h-full z-10" onClick={() => setShowPopup(false)} />
                        <div className="w-4/5 md:w-3/5 lg:w-1/2 rounded-lg bg-black border-2 border-gray-900 flex flex-col justify-center items-center p-6 z-20 gap-y-3">
                            <h3 className="text-white font-semibold text-xl">Confirm Delete Account!</h3>
                            <div className="text-white text-center">
                                Please note that this action is not reversible. Once the account is deleted, it cannot be undone. Click on <span className="text-red-700">"Confirm Delete!"</span> button to delete account permanently!
                            </div>
                            <Button onClick={() => deleteAccount()} disabled={processing} className=" m-4 text-red-700 border border-red-700">
                                Confirm Delete!
                            </Button>
                        </div>
                    </div>
                }
            </div>
        </div>
    )

}
