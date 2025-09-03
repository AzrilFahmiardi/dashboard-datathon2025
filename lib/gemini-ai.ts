/**
 * Gemini AI Service - Client-side service that calls our API route
 * Menggunakan Next.js API route untuk akses ke Gemini API
 */

interface InfluencerData {
  username: string
  tier: string
  expertise: string
  rank: number
  scores: {
    final_score: number
    audience_fit: number
    persona_fit: number
    performance_pred: number
    budget_efficiency: number
  }
  performance_metrics: {
    engagement_rate: number
    authenticity_score: number
    reach_potential: number
    brand_fit: number
  }
  optimal_content_mix: {
    feeds_count: number
    reels_count: number
    story_count: number
    total_cost: number
    total_impact: number
    remaining_budget: number
  }
  insights: string
}

interface CampaignBrief {
  brand_name?: string
  product_name?: string
  overview?: string
  usp?: string
  industry?: string
  budget?: number
  target_audience?: any
  content_requirements?: string
  persona?: string
  marketing_objective?: string
}

export class GeminiAIService {
  /**
   * Generate marketing strategy untuk influencer berdasarkan data lengkap
   */
  async generateInfluencerStrategy(
    influencerData: InfluencerData, 
    campaignBrief?: CampaignBrief
  ): Promise<string> {
    try {
      console.log('🤖 Calling strategy generation API...')
      
      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          influencerData,
          campaignBrief
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.strategy) {
        console.log('✅ Strategy generated successfully')
        return data.strategy
      } else {
        throw new Error('Invalid response format from strategy API')
      }
    } catch (error) {
      console.error('❌ Error calling strategy API:', error)
      throw error // Re-throw error instead of using fallback
    }
  }
}

export const geminiAIService = new GeminiAIService()
