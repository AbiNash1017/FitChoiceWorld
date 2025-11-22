'use client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getUserSession } from '@/lib/auth'
import supabase from '@/lib/supabase'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const VendorHeader = () => {

    const router = useRouter()

    const [gymDetails, setGymDetails] = useState({
        id: "",
        centre_name: "",
        centre_description: "",
        rating_count: 0,
        rating: 0,
        header_image: "",
        owner_id: "",
        location_id: ""
    })
    const [authSession, setAuthSession] = useState(null)

    const setUserSession = async () => {
        let userSession = null
        try {
            userSession = await getUserSession()
            setAuthSession(userSession)
        } catch (error) {
            router.push('/login')
            return;
        }
    }

    useEffect(() => {
        setUserSession();
    }, [])
    useEffect(() => {
        fetchGymDetails();
    }, [authSession])

    const fetchGymDetails = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fitnessCentre/myDetails`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession?.access_token}`
            }
        });
        const data = await response.json()
        console.log(data)
        let fetchedDetails = data.data
        console.log(fetchedDetails)
        setGymDetails(fetchedDetails)
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            alert("Some error occured: " + error)
        }
    }

    return (
        <header className="text-black">
            <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end items-center">
                    {/* <div className="text-2xl font-bold">
            Vendor Dashboard
          </div> */}
                    <div className="flex items-center space-x-4">
                        {/* <Button variant="outline" size="icon" className="mr-2">
              <Bell className="h-4 w-4" />
            </Button> */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {gymDetails?.centre_name ? gymDetails?.centre_name : 'Vendor'}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleLogout()} className='space-x-2'><LogOut /><span>Logout</span></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default VendorHeader
