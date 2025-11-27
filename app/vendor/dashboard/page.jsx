'use client'

import { useEffect, useState } from 'react'
import { Bell, Calendar, Home, MessageSquare, PieChart, Settings, Tag, Users, LucidePhoneCall, Users2 } from 'lucide-react'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import VendorSidebar from '@/app/components/forVendor/structure/VendorSidebar'
import VendorHeader from '@/app/components/forVendor/structure/VendorHeader'
import VendorAnalytics from '@/app/components/forVendor/VendorAnalytics'
import VendorOverview from '@/app/components/forVendor/VendorOverview'
import VendorBookingManagement from '@/app/components/forVendor/VendorBookingManagement'
import VendorProfileManagement from '@/app/components/forVendor/VendorProfileManagement'
import VendorSessionManagement from '@/app/components/forVendor/VendorSessionMangement'
import VendorUserCommunication from '@/app/components/forVendor/VendorUserCommunication'
import VendorContactUs from '@/app/components/forVendor/VendorContactUs'
import VendorCouponsAndBanners from '@/app/components/forVendor/VendorCouponBanner'
import VendorMembershipManagement from '@/app/components/forVendor/VendorMemberships'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'


const VendorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const { user, loading } = useAuth();
    const router = useRouter();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'sessions', label: 'Session Management', icon: Calendar },
        { id: 'bookings', label: 'Booking Management', icon: Users },
        { id: 'coupon_banner', label: 'Coupons and Banners', icon: Tag },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'memberships', label: 'Manage Memberships', icon: Users },
        // { id: 'communication', label: 'User Communication', icon: MessageSquare },       
        { id: 'profile', label: 'Profile', icon: Settings },
        { id: 'contact_us', label: 'Contact Admin', icon: LucidePhoneCall },
    ]

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <VendorSidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 overflow-y-auto">
                <VendorHeader />
                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div>
                            <TabsContent value="overview"><VendorOverview /></TabsContent>
                            <TabsContent value="sessions"><VendorSessionManagement /></TabsContent>
                            <TabsContent value="bookings"><VendorBookingManagement /></TabsContent>
                            <TabsContent value="coupon_banner"><VendorCouponsAndBanners /></TabsContent>
                            <TabsContent value="analytics"><VendorAnalytics /></TabsContent>
                            <TabsContent value='memberships'><VendorMembershipManagement /></TabsContent>
                            {/* <TabsContent value="communication"><VendorUserCommunication /></TabsContent> */}
                            <TabsContent value="profile"><VendorProfileManagement /></TabsContent>
                            <TabsContent value="contact_us"><VendorContactUs /></TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

export default VendorDashboard
