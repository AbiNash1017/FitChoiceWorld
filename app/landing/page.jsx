'use client'
import React, { useEffect } from 'react'
import Header from '../components/landing/Header'
import Hero from '../components/landing/Hero'
import Testimonials from '../components/landing/Testimonials'
import Features from '../components/landing/Features'
import Footer from '../components/landing/Footer'
import Contact from '../components/landing/Contact'

const LandingPage = () => {
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
