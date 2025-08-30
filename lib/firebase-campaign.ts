import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'

// Campaign data structure untuk Firebase
export interface CampaignData {
  id?: string
  brief_id: string
  title: string
  brand_id: string // Firebase User UID dari brand yang login
  brand_name: string
  industry: string
  product_name: string
  overview: string
  usp: string
  budget: number
  total_influencer: number
  niche: string[]
  location_prior: string[]
  esg_allignment: string[]
  risk_tolerance: string
  marketing_objective: string[]
  target_goals: string[]
  timing_campaign: string
  audience_preference: {
    top_locations: {
      countries: string[]
      cities: string[]
    }
    age_range: string[]
    gender: string[]
  }
  influencer_persona: string
  output: {
    content_types: string[]
    deliverables: number
  }
  deliverables: {
    story: number
    feeds: number
    reels: number
  }
  status: 'Planning' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'
  phase: string
  due_date: string
  created_at: Timestamp
  updated_at: Timestamp
  has_recommendations?: boolean
  recommendation_data?: any
}

const CAMPAIGNS_COLLECTION = 'campaigns'

class FirebaseCampaignService {
  // Menambahkan campaign baru dengan brand_id
  async createCampaign(campaignData: Omit<CampaignData, 'id' | 'brand_id' | 'created_at' | 'updated_at'>, brandId: string): Promise<string> {
    try {
      const now = Timestamp.now()
      const docData = {
        ...campaignData,
        brand_id: brandId, // Tambahkan brand_id dari user yang login
        created_at: now,
        updated_at: now
      }
      
      const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), docData)
      return docRef.id
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw new Error('Failed to create campaign')
    }
  }

  // Mengambil semua campaigns untuk brand tertentu
  async getCampaignsByBrand(brandId: string): Promise<CampaignData[]> {
    try {
      const q = query(
        collection(db, CAMPAIGNS_COLLECTION),
        where('brand_id', '==', brandId),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const campaigns: CampaignData[] = []
      querySnapshot.forEach((doc) => {
        campaigns.push({
          id: doc.id,
          ...doc.data()
        } as CampaignData)
      })
      
      return campaigns
    } catch (error) {
      console.error('Error getting campaigns by brand:', error)
      throw new Error('Failed to get campaigns')
    }
  }

  // Mengambil semua campaigns (untuk admin atau testing)
  async getAllCampaigns(): Promise<CampaignData[]> {
    try {
      const q = query(
        collection(db, CAMPAIGNS_COLLECTION),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const campaigns: CampaignData[] = []
      querySnapshot.forEach((doc) => {
        campaigns.push({
          id: doc.id,
          ...doc.data()
        } as CampaignData)
      })
      
      return campaigns
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      throw new Error('Failed to fetch campaigns')
    }
  }

  // Mengambil campaign berdasarkan ID
  async getCampaignById(id: string): Promise<CampaignData | null> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as CampaignData
      }
      
      return null
    } catch (error) {
      console.error('Error fetching campaign:', error)
      throw new Error('Failed to fetch campaign')
    }
  }

  // Mengambil campaign berdasarkan brief_id
  async getCampaignByBriefId(briefId: string): Promise<CampaignData | null> {
    try {
      const q = query(
        collection(db, CAMPAIGNS_COLLECTION),
        where('brief_id', '==', briefId)
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data()
        } as CampaignData
      }
      
      return null
    } catch (error) {
      console.error('Error fetching campaign by brief_id:', error)
      throw new Error('Failed to fetch campaign')
    }
  }

  // Update campaign
  async updateCampaign(id: string, updates: Partial<CampaignData>): Promise<void> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id)
      const updateData = {
        ...updates,
        updated_at: Timestamp.now()
      }
      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw new Error('Failed to update campaign')
    }
  }

  // Update status campaign
  async updateCampaignStatus(id: string, status: CampaignData['status'], phase?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: Timestamp.now()
      }
      
      if (phase) {
        updateData.phase = phase
      }
      
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id)
      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error('Error updating campaign status:', error)
      throw new Error('Failed to update campaign status')
    }
  }

  // Menyimpan rekomendasi AI ke campaign
  async saveRecommendations(briefId: string, recommendationData: any): Promise<void> {
    try {
      const campaign = await this.getCampaignByBriefId(briefId)
      if (!campaign || !campaign.id) {
        throw new Error('Campaign not found')
      }

      const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id)
      await updateDoc(docRef, {
        has_recommendations: true,
        recommendation_data: recommendationData,
        updated_at: Timestamp.now()
      })
    } catch (error) {
      console.error('Error saving recommendations:', error)
      throw new Error('Failed to save recommendations')
    }
  }

  // Menghapus campaign
  async deleteCampaign(id: string): Promise<void> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting campaign:', error)
      throw new Error('Failed to delete campaign')
    }
  }

  // Helper function untuk convert CampaignData ke format yang dibutuhkan modal
  campaignDataToCampaignBrief(campaign: CampaignData) {
    return {
      brief_id: campaign.brief_id,
      brand_name: campaign.brand_name,
      industry: campaign.industry,
      product_name: campaign.product_name,
      overview: campaign.overview,
      usp: campaign.usp,
      marketing_objective: campaign.marketing_objective,
      target_goals: campaign.target_goals,
      timing_campaign: campaign.timing_campaign,
      audience_preference: campaign.audience_preference,
      influencer_persona: campaign.influencer_persona,
      total_influencer: campaign.total_influencer,
      niche: campaign.niche,
      location_prior: campaign.location_prior,
      esg_allignment: campaign.esg_allignment,
      budget: campaign.budget,
      output: campaign.output,
      risk_tolerance: campaign.risk_tolerance
    }
  }

  // Generate brief ID
  generateBriefId(): string {
    return `BRIEF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  // Generate title dari product name
  generateTitle(productName: string, brandName: string): string {
    return `${productName} Campaign - ${brandName}`
  }

  // Calculate deliverables breakdown
  calculateDeliverables(contentTypes: string[], totalDeliverables: number): { story: number, feeds: number, reels: number } {
    let feeds = 0
    let reels = 0
    let story = 0

    if (contentTypes.includes('Feeds')) {
      feeds = Math.ceil(totalDeliverables * 0.4) // 40% untuk feeds
    }
    if (contentTypes.includes('Reels')) {
      reels = Math.ceil(totalDeliverables * 0.4) // 40% untuk reels
    }
    if (contentTypes.includes('Stories')) {
      story = Math.ceil(totalDeliverables * 0.2) // 20% untuk stories
    }

    // Adjust jika tidak sesuai total
    const currentTotal = feeds + reels + story
    if (currentTotal < totalDeliverables) {
      const diff = totalDeliverables - currentTotal
      feeds += diff
    }

    return { story, feeds, reels }
  }
}

export const firebaseCampaignService = new FirebaseCampaignService()
