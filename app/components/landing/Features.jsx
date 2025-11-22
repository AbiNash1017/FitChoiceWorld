'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowBigRight, Dumbbell, Heart, Locate, LocateIcon, Map, MapPin, PersonStandingIcon } from 'lucide-react'
import Link from 'next/link'

export default function Features() {
    const features = [
        {
            icon: MapPin,
            title: 'FIND YOUR FIT',
            description: 'Discover fitness centers near you by category, duration, and price in just a few clicks'
        },
        {
            icon: Dumbbell,
            title: 'SESSIONS YOUR WAY',
            description: 'From yoga and zumba to crossfit and weight training, book the sessions you love at your convenience'
        },
        {
            icon: PersonStandingIcon,
            title: 'MATCH & MOVE',
            description: 'Swipe through profiles, connect with like-minded fitness enthusiasts, and book fun couple sessions for a workout date'
        },
        {
            icon: Heart,
            title: 'LEVEL UP TOGETHER',
            description: 'Track your progress and compete with friends using our fitness leaderboard and interactive feed, designed to keep you inspired.'
        }
    ]

    return (
        <section className="bg-black pt-20 pb-12 px-4">
            <div className="container mx-auto max-w-7xl">
                <div
                    className="text-center mb-12">
                    <div className="text-3xl md:text-[43px] font-bold mb-4">
                        <span className="text-white">WHAT MAKES US </span>
                        <span className="text-red-700">DIFFERENT</span>
                    </div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Why Fit Choice World is the right choice for you
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="border border-red-700 p-6 relative hover:scale-105 transform transition-all duration-300"
                        >
                            {/* class="p-6 bg-gray-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-xl transform transition-all duration-300" */}
                            <div className="mb-4">
                                <feature.icon className='text-white' />
                            </div>
                            <h3 className="text-[23px] font-bold text-red-700 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-300">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
