"use client"

import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandProfileForm } from "@/components/brand-profile-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function BrandProfile() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || userData?.userType !== 'brand')) {
      router.push('/login/brand')
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen">
        <BrandSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user || userData?.userType !== 'brand') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Brand Profile</h1>
              <p className="mt-2 text-gray-600">
                Manage your brand information and preferences
              </p>
            </div>
            
            <BrandProfileForm />
          </div>
        </div>
      </main>
    </div>
  )
}
