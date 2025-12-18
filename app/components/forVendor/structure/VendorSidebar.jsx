'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'

const VendorSidebar = ({ tabs, activeTab, setActiveTab }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside className={`bg-black dark:bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} flex flex-col shadow-xl z-20`}>
            <div className='flex justify-between items-center p-6 h-20 border-b border-gray-800'>
                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'} transition-all duration-300 ease-in-out`}>
                    <div
                        className="flex-shrink-0 transition-all duration-300 ease-in-out cursor-pointer hover:opacity-80"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <div className='relative w-10 h-10'>
                            <Image className='rounded-full object-cover' src={'/images/fcw_transparent.png'} alt={'fcw'} fill />
                        </div>
                    </div>
                    <span className={`text-lg text-white font-bold whitespace-nowrap tracking-wide transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'} overflow-hidden`}>
                        Vendor Panel
                    </span>
                </div>
            </div>
            <nav className="flex-grow px-3 py-6 space-y-1 overflow-x-hidden">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant="ghost"
                        className={`w-full justify-start mb-1 text-sm font-medium transition-all duration-200 ease-in-out h-12 rounded-xl ${activeTab === tab.id
                            ? "bg-white text-black shadow-lg"
                            : "text-gray-400 hover:bg-gray-900 hover:text-white"
                            } ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon className={`h-5 w-5 transition-all duration-300 ${activeTab === tab.id ? "text-black" : "text-gray-400 group-hover:text-white"} ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                        <span className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'} overflow-hidden whitespace-nowrap`}>
                            {tab.label}
                        </span>
                    </Button>
                ))}
            </nav>
            <div className='p-4 border-t border-gray-800 flex justify-center'>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
            </div>
        </aside>
    )
}

export default VendorSidebar
