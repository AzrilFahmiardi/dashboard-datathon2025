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

// API data structure - Exact match untuk JSON requirement
export interface CampaignApiData {
  brief_id: string
  brand_name: string
  industry: string
  product_name: string
  overview: string
  usp: string
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
  total_influencer: number
  niche: string[]
  location_prior: string[]
  esg_allignment: string[]
  budget: number
  output: {
    content_types: string[]
    deliverables: number
  }
  risk_tolerance: string
}

// Campaign data structure untuk Firebase - Match dengan JSON API requirement + extra fields
export interface CampaignData {
  id?: string
  brand_id: string // Firebase User UID dari brand yang login
  
  // Core API fields matching JSON requirement exactly
  brief_id: string
  brand_name: string
  industry: string
  product_name: string
  overview: string
  usp: string
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
  total_influencer: number
  niche: string[]
  location_prior: string[]
  esg_allignment: string[]
  budget: number
  output: {
    content_types: string[]
    deliverables: number
  }
  risk_tolerance: string
  
  // Additional fields for Firebase/UI management only
  title: string
  status: 'Planning' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'
  phase: string
  due_date: string
  created_at: Timestamp
  updated_at: Timestamp
  has_recommendations?: boolean
  recommendation_data?: any
  ai_insights?: {[key: string]: any} // Store AI insights for each influencer section
  ai_strategies?: {[key: string]: any} // Store AI strategies for each influencer
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
      console.log('Saving recommendations for brief:', briefId)
      console.log('Recommendation data structure:', {
        status: recommendationData.status,
        recommendationsCount: recommendationData.recommendations?.length || 0,
        hasMetadata: !!recommendationData.metadata
      })

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
      
      console.log('Successfully saved recommendations for brief:', briefId)
    } catch (error) {
      console.error('Error saving recommendations:', error)
      throw new Error('Failed to save recommendations')
    }
  }

  // Menyimpan AI insights untuk influencer tertentu dalam campaign
  async saveInfluencerInsights(briefId: string, influencerUsername: string, sectionType: string, insights: string): Promise<void> {
    try {
      console.log(`Saving ${sectionType} insights for ${influencerUsername} in brief:`, briefId)

      const campaign = await this.getCampaignByBriefId(briefId)
      if (!campaign || !campaign.id) {
        throw new Error('Campaign not found')
      }

      // Create insights object structure
      const insightKey = `${influencerUsername}_${sectionType}_insights`
      const existingInsights = campaign.ai_insights || {}
      
      const updatedInsights = {
        ...existingInsights,
        [insightKey]: {
          content: insights,
          generated_at: new Date().toISOString(),
          section_type: sectionType,
          influencer: influencerUsername
        }
      }

      const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id)
      await updateDoc(docRef, {
        ai_insights: updatedInsights,
        updated_at: Timestamp.now()
      })
      
      console.log(`✅ Successfully saved ${sectionType} insights for ${influencerUsername}`)
    } catch (error) {
      console.error(`❌ Error saving ${sectionType} insights:`, error)
      throw new Error(`Failed to save ${sectionType} insights`)
    }
  }

  // Menyimpan strategy untuk influencer tertentu
  async saveInfluencerStrategy(briefId: string, influencerUsername: string, strategy: string): Promise<void> {
    try {
      console.log(`Saving strategy for ${influencerUsername} in brief:`, briefId)

      const campaign = await this.getCampaignByBriefId(briefId)
      if (!campaign || !campaign.id) {
        throw new Error('Campaign not found')
      }

      // Create strategy object structure
      const strategyKey = `${influencerUsername}_strategy`
      const existingStrategies = campaign.ai_strategies || {}
      
      const updatedStrategies = {
        ...existingStrategies,
        [strategyKey]: {
          content: strategy,
          generated_at: new Date().toISOString(),
          influencer: influencerUsername
        }
      }

      const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id)
      await updateDoc(docRef, {
        ai_strategies: updatedStrategies,
        updated_at: Timestamp.now()
      })
      
      console.log(`✅ Successfully saved strategy for ${influencerUsername}`)
    } catch (error) {
      console.error(`❌ Error saving strategy:`, error)
      throw new Error(`Failed to save strategy`)
    }
  }

  // Mengambil AI insights untuk campaign tertentu
  async getAIInsights(briefId: string): Promise<{[key: string]: any}> {
    try {
      const campaign = await this.getCampaignByBriefId(briefId)
      return campaign?.ai_insights || {}
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      return {}
    }
  }

  // Mengambil strategies untuk campaign tertentu
  async getAIStrategies(briefId: string): Promise<{[key: string]: any}> {
    try {
      const campaign = await this.getCampaignByBriefId(briefId)
      return campaign?.ai_strategies || {}
    } catch (error) {
      console.error('Error fetching AI strategies:', error)
      return {}
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
  campaignDataToCampaignBrief(campaign: CampaignData): CampaignApiData {
    return this.extractApiData(campaign)
  }

  // Generate brief ID
  generateBriefId(): string {
    return `BRIEF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  // Generate title dari product name
  generateTitle(productName: string, brandName: string): string {
    return `${productName} Campaign - ${brandName}`
  }

  // Extract clean API data from CampaignData - Perfect match untuk JSON API requirement
  // Usage: const apiData = firebaseCampaignService.extractApiData(campaign)
  // Result: Ready untuk dikirim ke API dengan Indonesia sebagai default country
  extractApiData(campaign: CampaignData): CampaignApiData {
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
      location_prior: campaign.location_prior, // Default: ["Indonesia"]
      esg_allignment: campaign.esg_allignment,
      budget: campaign.budget,
      output: campaign.output,
      risk_tolerance: campaign.risk_tolerance
    }
  }

  // Get API ready data by campaign ID
  async getCampaignApiData(campaignId: string): Promise<CampaignApiData> {
    const campaign = await this.getCampaignById(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }
    return this.extractApiData(campaign)
  }

  // Get API ready data by brief ID
  async getCampaignApiDataByBriefId(briefId: string): Promise<CampaignApiData> {
    const campaign = await this.getCampaignByBriefId(briefId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }
    return this.extractApiData(campaign)
  }
}

export const firebaseCampaignService = new FirebaseCampaignService()
