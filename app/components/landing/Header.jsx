"use client";
import React, { useState } from 'react'
import { ArrowRight, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import Logo from '@/public/images/fcw_transparent.png'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()
    const { user, loading, logout } = useAuth()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLogout = async () => {
        await logout()
        setIsMenuOpen(false)
    }

    const handleVendorDashboard = () => {
        router.push('/vendor/dashboard')
        setIsMenuOpen(false)
    }

    return (
        <>
            <div className='py-3 px-5 backdrop-blur-sm fixed left-0 right-0 top-0 z-50'>
                <div className='container mx-auto'>
                    <div className='flex items-center justify-between'>
                        <div className='inline-flex gap-5 items-center'>
                            <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={70} width={70} className='h-[45px] w-[45px] md:h-[50px] md:w-[50px] lg:h-[70px] lg:w-[70px]' /></Link>
                            <Link className='text-white/90 text-lg md:text-xl lg:text-2xl font-semibold' href={'/'}>Fit Choice World</Link>
                        </div>
                        <div className='md:hidden'>
                            {isMenuOpen ? (
                                <X className='h-6 w-6 text-white cursor-pointer' onClick={toggleMenu} />
                            ) : (
                                <Menu className='h-6 w-6 text-white cursor-pointer' onClick={toggleMenu} />
                            )}
                        </div>
                        <nav className='hidden md:flex md:gap-6 lg:gap-10 items-center text-white/70'>
                            <Link href='/' className='hover:text-white transition-colors'>Users</Link>
                            <Link href='/fitnesscenter' className='hover:text-white transition-colors'>Fitness Centers</Link>
                            <Link href='/fitnesscenter#memberships' className='hover:text-white transition-colors'>Fitness Centre Pricing</Link>
                            <Link href='/#contact' className='hover:text-white transition-colors'>Contact Us</Link>
                            <Link href='faq' className='hover:text-white transition-colors'>FAQ's</Link>

                            {!loading && (
                                user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="relative h-10 w-10 rounded-full border border-white/50 hover:border-white hover:bg-white/10 transition-all"
                                            >
                                                <User className="h-5 w-5 text-white" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 bg-black/95 border-white/20 text-white" align="end">
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {user.first_name && user.last_name
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : user.email || user.phoneNumber}
                                                    </p>
                                                    {user.email && (
                                                        <p className="text-xs leading-none text-white/60">
                                                            {user.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/20" />
                                            <DropdownMenuItem
                                                onClick={handleVendorDashboard}
                                                className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>Vendor Dashboard</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/20" />
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="cursor-pointer text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-400"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Logout</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link
                                        href={'/login'}
                                        onClick={() => router.push('/login')}
                                        className='bg-transparent text-white px-4 py-2 rounded-md font-medium inline-flex items-center justify-center tracking-tight border border-white border-opacity-85 hover:bg-white/20 transition duration-200 ease-in-out'
                                    >
                                        Login
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className='fixed inset-0 z-40 bg-black bg-opacity-50'>
                    <div className='fixed inset-y-0 right-0 max-w-xs w-full bg-black shadow-xl z-50 overflow-y-auto'>
                        <div className='p-6 pt-16 space-y-6'>
                            <Link href='/' className='block text-white hover:text-white/70 transition-colors' onClick={toggleMenu}>Users</Link>
                            <Link href='/fitnesscenter' className='block text-white hover:text-white/70 transition-colors' onClick={toggleMenu}>Fitness Centers</Link>
                            <Link href='/fitnesscenter#memberships' className='block text-white hover:text-white/70 transition-colors' onClick={toggleMenu}>Fitness Centre Pricing</Link>
                            <Link href='/#contact' className='block text-white hover:text-white transition-colors' onClick={toggleMenu}>Contact Us</Link>
                            <Link href='faq' className='block text-white hover:text-white/70 transition-colors' onClick={toggleMenu}>FAQ's</Link>

                            {!loading && (
                                user ? (
                                    <>
                                        <div className="pt-4 border-t border-white/20">
                                            <div className="mb-4 px-4">
                                                <p className="text-white font-medium">
                                                    {user.first_name && user.last_name
                                                        ? `${user.first_name} ${user.last_name}`
                                                        : user.email || user.phoneNumber}
                                                </p>
                                                {user.email && (
                                                    <p className="text-xs text-white/60 mt-1">{user.email}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleVendorDashboard}
                                                className='w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center'
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Vendor Dashboard
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className='w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors flex items-center mt-2'
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={'/login'}
                                        onClick={() => { router.push('/login'); toggleMenu(); }}
                                        className='block bg-transparent text-white px-4 py-2 rounded-md font-medium text-center tracking-tight border border-white border-opacity-85 hover:bg-white/20 transition duration-200 ease-in-out'
                                    >
                                        Login
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header
