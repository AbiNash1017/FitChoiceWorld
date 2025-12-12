"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Apple,
    Play,
    Dumbbell,
    Salad,
    Activity,
    Star,
    ChevronRight,
    Menu,
    X,
    Briefcase
} from 'lucide-react';

// --- Components ---

// 1. Navigation
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo Update */}
                <div className="flex items-center gap-2">
                    <img
                        src="https://fitchoice-world-web-three.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffcw_transparent.ba232dbf.png&w=256&q=75"
                        alt="Fit Choice World Logo"
                        className="h-12 w-auto object-contain"
                    />
                    <span className="text-xl font-bold tracking-tight text-black hidden sm:block">Fit Choice World</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                    <a href="#features" className="hover:text-black transition-colors">Features</a>
                    <a href="#reviews" className="hover:text-black transition-colors">Stories</a>
                    <button className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        Get the App
                    </button>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col space-y-6 shadow-xl animate-in slide-in-from-top-5">
                    <a href="#features" className="text-lg font-medium text-gray-800" onClick={() => setIsOpen(false)}>Features</a>
                    <a href="#reviews" className="text-lg font-medium text-gray-800" onClick={() => setIsOpen(false)}>Stories</a>
                    <button className="bg-black text-white w-full py-3 rounded-xl font-semibold">Download Now</button>
                </div>
            )}
        </nav>
    );
};

// 2. Hero Section
const Hero = () => {
    return (
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Content */}
                <div className="space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Version 2.0 is live
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black leading-[1.1]">
                        Fit Choice World. <br />
                        <span className="text-gray-400">Your Health Hub.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-md leading-relaxed">
                        The all-in-one companion for your wellness journey. Smart tracking, personalized plans, and a community that moves with you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 duration-200 shadow-xl shadow-gray-200">
                            <Apple className="w-8 h-8 fill-current" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Download on the</div>
                                <div className="text-lg font-bold leading-none">App Store</div>
                            </div>
                        </button>

                        <button className="flex items-center justify-center gap-3 bg-gray-100 text-black px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-95 duration-200">
                            <Play className="w-7 h-7 fill-black ml-1" />
                            <div className="text-left ml-1">
                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Get it on</div>
                                <div className="text-lg font-bold leading-none">Google Play</div>
                            </div>
                        </button>
                    </div>

                    <div className="pt-8 flex items-center gap-4 text-sm font-medium text-gray-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p>Trusted by 50,000+ active users</p>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative h-[600px] w-full rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200 group md:rotate-1 hover:rotate-0 transition-all duration-500">
                    <img
                        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
                        alt="Athlete using fitness app"
                        className="object-cover w-full h-full transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Floating UI Card Overlay */}
                    <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-black">Daily Goal Reached</h4>
                                <p className="text-sm text-gray-500">You burned 840 active calories today!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// 3. Features Section
const Features = () => {
    const features = [
        {
            icon: <Dumbbell className="w-6 h-6" />,
            title: "Smart Workouts",
            desc: "AI-generated routines that adapt to your progress automatically.",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
        },
        {
            icon: <Activity className="w-6 h-6" />,
            title: "Real-time Tracking",
            desc: "Precision metrics for running, cycling, and HIIT sessions.",
            image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1287&auto=format&fit=crop"
        },
        {
            icon: <Salad className="w-6 h-6" />,
            title: "Nutrition Guide",
            desc: "Macro tracking made simple with instant photo recognition.",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop"
        }
    ];

    return (
        <section id="features" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black tracking-tight">Designed for Motion</h2>
                    <p className="text-xl text-gray-500">Everything you need to reach your peak, neatly packed into a minimal interface.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-default">
                            <div className="h-64 rounded-[1.5rem] overflow-hidden mb-6 relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <div className="text-black">
                                        {item.icon}
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 pb-6">
                                <h3 className="text-2xl font-bold mb-3 text-black">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// 4. Vendor CTA Section (Replaces App Showcase)
const VendorCTA = () => {
    return (
        <section id="vendor-cta" className="py-32 bg-black text-white overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800 rounded-full blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-800 rounded-full blur-[100px] opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                    <Briefcase className="w-8 h-8 text-black" />
                </div>

                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                    Grow with Fit Choice World
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join our network of premium fitness professionals and reach thousands of users dedicated to their wellness journey.
                </p>

                <Link href="/landing" className="group relative inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 duration-200">
                    <span>If you're a vendor, get started here</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
};

// 5. Testimonials
const Testimonials = () => {
    const reviews = [
        {
            name: "Sarah Jenks",
            role: "Marathon Runner",
            quote: "The minimal design keeps me focused. No clutter, just my stats. It's exactly what I needed to break my PB.",
            img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
        },
        {
            name: "Marcus Chen",
            role: "Crossfit Athlete",
            quote: "Finally, a fitness app that doesn't feel like a spreadsheet. It actually makes me want to log my workouts.",
            img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
        },
        {
            name: "Elena Rodriguez",
            role: "Yoga Instructor",
            quote: "Fit Choice World has completely transformed how I track my daily flows. The interface is as calm as my practice.",
            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
        }
    ];

    return (
        <section id="reviews" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-center text-3xl font-bold mb-20 tracking-tight">Success Stories</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="relative mb-6">
                                <img src={review.img} alt={review.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                                <div className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 rounded-full">
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                            </div>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed font-medium">"{review.quote}"</p>
                            <div>
                                <h4 className="font-bold text-black text-lg">{review.name}</h4>
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{review.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// 6. Footer
const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-1">Fit Choice World<span className="text-gray-400">.</span></h3>
                        <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                            Empowering your journey with technology that feels human.
                            Download the app today and start moving.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-black">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Press</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-black">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-gray-400">© 2025 Fit Choice World Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

// --- Main Page Component ---

export default function App() {
    return (
        <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans scroll-smooth">
            <Navbar />
            <Hero />
            <Features />
            <VendorCTA />
            <Testimonials />
            <Footer />
        </main>
    );
}