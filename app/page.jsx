'use client'
import React, { useEffect } from 'react'
import Header from './components/landing/Header'
import Hero from './components/landing/Hero'
import Testimonials from './components/landing/Testimonials'
import Features from './components/landing/Features'
import Footer from './components/landing/Footer'
import Contact from './components/landing/Contact'
import supabase from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LandingPage = () => {
    const router = useRouter()
    useEffect(() => {
        checkAuth()
    })

    const checkAuth = async () => {
        const user = await supabase.auth.getUser()
        if (user.data.user) {
            const userdata = await supabase.from('Users').select().eq('uid', user.data.user.id)
            if (userdata.data) {
                if (userdata.data[0].role.toLowerCase() == 'owner') {
                    router.push('/vendor/dashboard')
                } else if (userdata.data[0].role == 'admin') {
                    router.push('/admin/dashboard')
                } else {
                    return
                }
            }
        }

    }
    return (
        <div className='bg-black'>
            <Header />
            <Hero />
            <Features />
            <Testimonials />
            <Contact />
            <Footer />
        </div>
    )
}

export default LandingPage
