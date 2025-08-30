"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCurrentUserData, BaseUser, updateBrandProfile, updateInfluencerProfile, BrandProfile, InfluencerProfile } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userData: BaseUser | null
  profile: any
  loading: boolean
  updateProfile: (profileData: Partial<BrandProfile | InfluencerProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  profile: null,
  loading: true,
  updateProfile: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<BaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          const data = await getCurrentUserData(user)
          if (data) {
            setUserData(data.userData)
            setProfile(data.profile)
          }
        } catch (error) {
          console.error('Error getting user data:', error)
        }
      } else {
        setUser(null)
        setUserData(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateProfileHandler = async (profileData: Partial<BrandProfile | InfluencerProfile>) => {
    if (!user || !userData) {
      throw new Error('User not authenticated')
    }

    try {
      if (userData.userType === 'brand') {
        await updateBrandProfile(user.uid, profileData as Partial<BrandProfile>)
      } else if (userData.userType === 'influencer') {
        await updateInfluencerProfile(user.uid, profileData as Partial<InfluencerProfile>)
      }

      // Refresh user data after update
      const updatedData = await getCurrentUserData(user)
      if (updatedData) {
        setUserData(updatedData.userData)
        setProfile(updatedData.profile)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userData, profile, loading, updateProfile: updateProfileHandler }}>
      {children}
    </AuthContext.Provider>
  )
}
