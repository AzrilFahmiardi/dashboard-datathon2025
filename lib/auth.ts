import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User 
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore'
import { auth, db } from './firebase'

export interface BaseUser {
  email: string
  userType: 'brand' | 'influencer'
  createdAt: Date
}

export interface BrandProfile {
  userId: string
  username: string
  industry?: string
  companyName?: string
  website?: string
  description?: string
  location?: string
  logoUrl?: string
}

export interface InfluencerProfile {
  userId: string
  username: string
}

// Register Brand
export const registerBrand = async (
  email: string, 
  password: string, 
  username: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save base user info
    const baseUserData: BaseUser = {
      email,
      userType: 'brand',
      createdAt: new Date()
    }

    await setDoc(doc(db, 'users', user.uid), baseUserData)

    // Save basic brand profile
    const brandProfile: BrandProfile = {
      userId: user.uid,
      username
    }

    await setDoc(doc(db, 'brands', user.uid), brandProfile)

    return { user, userData: baseUserData, profile: brandProfile }
  } catch (error) {
    console.error('Error registering brand:', error)
    throw error
  }
}

// Register Influencer
export const registerInfluencer = async (
  email: string, 
  password: string, 
  username: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save base user info
    const baseUserData: BaseUser = {
      email,
      userType: 'influencer',
      createdAt: new Date()
    }

    await setDoc(doc(db, 'users', user.uid), baseUserData)

    // Save basic influencer profile
    const influencerProfile: InfluencerProfile = {
      userId: user.uid,
      username
    }

    await setDoc(doc(db, 'influencers', user.uid), influencerProfile)

    return { user, userData: baseUserData, profile: influencerProfile }
  } catch (error) {
    console.error('Error registering influencer:', error)
    throw error
  }
}

// Login
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get base user data
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      throw new Error('User data not found')
    }

    const userData = userDoc.data() as BaseUser

    // Get specific profile data based on userType
    let profile = null
    if (userData.userType === 'brand') {
      const brandDoc = await getDoc(doc(db, 'brands', user.uid))
      profile = brandDoc.exists() ? brandDoc.data() : null
    } else if (userData.userType === 'influencer') {
      const influencerDoc = await getDoc(doc(db, 'influencers', user.uid))
      profile = influencerDoc.exists() ? influencerDoc.data() : null
    }

    return { user, userData, profile }
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

// Get current user data with profile
export const getCurrentUserData = async (user: User) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      return null
    }

    const userData = userDoc.data() as BaseUser

    // Get specific profile
    let profile = null
    if (userData.userType === 'brand') {
      const brandDoc = await getDoc(doc(db, 'brands', user.uid))
      profile = brandDoc.exists() ? brandDoc.data() : null
    } else if (userData.userType === 'influencer') {
      const influencerDoc = await getDoc(doc(db, 'influencers', user.uid))
      profile = influencerDoc.exists() ? influencerDoc.data() : null
    }

    return { userData, profile }
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

// Update brand profile
export const updateBrandProfile = async (userId: string, profileData: Partial<BrandProfile>) => {
  try {
    const brandRef = doc(db, 'brands', userId)
    await updateDoc(brandRef, profileData)
    return true
  } catch (error) {
    console.error('Error updating brand profile:', error)
    throw error
  }
}

// Update influencer profile
export const updateInfluencerProfile = async (userId: string, profileData: Partial<InfluencerProfile>) => {
  try {
    const influencerRef = doc(db, 'influencers', userId)
    await updateDoc(influencerRef, profileData)
    return true
  } catch (error) {
    console.error('Error updating influencer profile:', error)
    throw error
  }
}
