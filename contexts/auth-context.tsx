"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCurrentUserData, BaseUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userData: BaseUser | null
  profile: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  profile: null,
  loading: true
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

  return (
    <AuthContext.Provider value={{ user, userData, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
