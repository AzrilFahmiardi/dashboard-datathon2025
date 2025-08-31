export interface AudienceAnalytics {
  top_locations: {
    countries: Array<{ country: string; percent: number }>
    cities: Array<{ city: string; percent: number }>
  }
  age_range_overall: Array<{ range: string; percent: number }>
  gender_overall: Array<{ gender: string; percent: number }>
}

export interface InfluencerData {
  username_instagram: string
  tier_followers: 'Nano' | 'Micro' | 'Mid' | 'Macro' | 'Mega'
  influencer_id: string
  familiarity_media_pct: number
  trending_status: boolean
  likeability_sentiment: 'Positive' | 'Neutral' | 'Negative'
  campaign_success_signif: boolean
  engagement_rate_pct: number
  rate_card_story: number
  rate_card_feeds: number
  rate_card_reels: number
  has_relevant_history: boolean
  random_endorse_rate: number
  behavior_consistency: boolean
  expertise_field: string
  avg_reels_views: number
  avg_post_like: number
  avg_comment: number
  audience_analytics: AudienceAnalytics
}

export class CSVInfluencerService {
  private static instance: CSVInfluencerService
  private influencers: InfluencerData[] = []
  private isLoaded = false

  static getInstance(): CSVInfluencerService {
    if (!this.instance) {
      this.instance = new CSVInfluencerService()
    }
    return this.instance
  }

  async loadInfluencers(): Promise<InfluencerData[]> {
    if (this.isLoaded) {
      return this.influencers
    }

    try {
      const response = await fetch('/data/influencers.csv')
      const csvText = await response.text()
      
      // Parse CSV with multi-line JSON handling
      const lines = csvText.trim().split('\n')
      const headers = lines[0].split(',')
      
      this.influencers = []
      let currentLine = 1
      
      while (currentLine < lines.length) {
        // Reconstruct full record including multi-line JSON
        let fullRecord = lines[currentLine]
        let braceCount = (fullRecord.match(/\{/g) || []).length - (fullRecord.match(/\}/g) || []).length
        
        // If JSON is incomplete, continue reading lines
        while (braceCount > 0 && currentLine + 1 < lines.length) {
          currentLine++
          fullRecord += '\n' + lines[currentLine]
          braceCount += (lines[currentLine].match(/\{/g) || []).length - (lines[currentLine].match(/\}/g) || []).length
        }
        
        try {
          const values = this.parseCSVLine(fullRecord)
          if (values.length >= headers.length) {
            const influencer: any = {}
            
            headers.forEach((header, index) => {
              const value = values[index]?.replace(/^"|"$/g, '') || ''
              
              switch (header.trim()) {
                case 'username_instagram':
                case 'influencer_id':
                case 'expertise_field':
                  influencer[header.trim()] = value
                  break
                case 'tier_followers':
                  influencer[header.trim()] = value as InfluencerData['tier_followers']
                  break
                case 'likeability_sentiment':
                  influencer[header.trim()] = value as InfluencerData['likeability_sentiment']
                  break
                case 'familiarity_media_pct':
                case 'engagement_rate_pct':
                case 'random_endorse_rate':
                  influencer[header.trim()] = parseFloat(value) || 0
                  break
                case 'rate_card_story':
                case 'rate_card_feeds':
                case 'rate_card_reels':
                case 'avg_reels_views':
                case 'avg_post_like':
                case 'avg_comment':
                  influencer[header.trim()] = parseInt(value) || 0
                  break
                case 'trending_status':
                case 'campaign_success_signif':
                case 'has_relevant_history':
                case 'behavior_consistency':
                  influencer[header.trim()] = value.toLowerCase() === 'true'
                  break
                case 'audience_analytics':
                  try {
                    // Clean and parse JSON
                    let jsonStr = value.replace(/^\"+|\"+$/g, '') // Remove surrounding quotes
                    jsonStr = jsonStr.replace(/\"\"/g, '"') // Fix double quotes
                    influencer[header.trim()] = JSON.parse(jsonStr) as AudienceAnalytics
                  } catch (e) {
                    console.warn('Failed to parse audience_analytics for', influencer.username_instagram, e)
                    influencer[header.trim()] = {
                      top_locations: { countries: [], cities: [] },
                      age_range_overall: [],
                      gender_overall: []
                    }
                  }
                  break
                default:
                  influencer[header.trim()] = value
              }
            })
            
            if (influencer.username_instagram) {
              this.influencers.push(influencer as InfluencerData)
            }
          }
        } catch (error) {
          console.warn('Failed to parse record at line', currentLine, error)
        }
        
        currentLine++
      }

      this.isLoaded = true
      console.log(`✅ Loaded ${this.influencers.length} influencers from CSV`)
      return this.influencers
    } catch (error) {
      console.error('❌ Error loading influencers from CSV:', error)
      return []
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = []
    let current = ''
    let inQuotes = false
    let braceLevel = 0
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        // Handle escaped quotes
        if (nextChar === '"' && inQuotes) {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
          current += char
        }
      } else if (char === '{') {
        braceLevel++
        current += char
      } else if (char === '}') {
        braceLevel--
        current += char
      } else if (char === ',' && !inQuotes && braceLevel === 0) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  // Get follower count estimate based on tier
  getFollowerEstimate(tier: string): string {
    switch (tier) {
      case 'Nano': return '1K - 10K'
      case 'Micro': return '10K - 100K'
      case 'Mid': return '100K - 500K'
      case 'Macro': return '500K - 1M'
      case 'Mega': return '1M+'
      default: return 'Unknown'
    }
  }

  // Filter methods
  filterByTier(tier: string): InfluencerData[] {
    if (tier === 'all') return this.influencers
    return this.influencers.filter(inf => 
      inf.tier_followers.toLowerCase() === tier.toLowerCase()
    )
  }

  filterByExpertise(expertise: string): InfluencerData[] {
    if (expertise === 'all') return this.influencers
    return this.influencers.filter(inf =>
      inf.expertise_field.toLowerCase().includes(expertise.toLowerCase())
    )
  }

  filterByLocation(location: string): InfluencerData[] {
    return this.influencers.filter(inf =>
      inf.audience_analytics?.top_locations?.cities?.some(city =>
        city.city.toLowerCase().includes(location.toLowerCase())
      ) || inf.audience_analytics?.top_locations?.countries?.some(country =>
        country.country.toLowerCase().includes(location.toLowerCase())
      )
    )
  }

  filterByTrending(): InfluencerData[] {
    return this.influencers.filter(inf => inf.trending_status)
  }

  filterBySuccessfulCampaigns(): InfluencerData[] {
    return this.influencers.filter(inf => inf.campaign_success_signif)
  }

  searchInfluencers(query: string): InfluencerData[] {
    const searchTerm = query.toLowerCase()
    return this.influencers.filter(inf =>
      inf.username_instagram.toLowerCase().includes(searchTerm) ||
      inf.expertise_field.toLowerCase().includes(searchTerm) ||
      inf.influencer_id.toLowerCase().includes(searchTerm)
    )
  }

  sortInfluencers(sortBy: 'engagement' | 'views' | 'likes' | 'rate_reels'): InfluencerData[] {
    return [...this.influencers].sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagement_rate_pct - a.engagement_rate_pct
        case 'views':
          return b.avg_reels_views - a.avg_reels_views
        case 'likes':
          return b.avg_post_like - a.avg_post_like
        case 'rate_reels':
          return b.rate_card_reels - a.rate_card_reels
        default:
          return 0
      }
    })
  }

  // Get statistics
  getStats() {
    const total = this.influencers.length
    const byTier = {
      Nano: this.influencers.filter(inf => inf.tier_followers === 'Nano').length,
      Micro: this.influencers.filter(inf => inf.tier_followers === 'Micro').length,
      Mid: this.influencers.filter(inf => inf.tier_followers === 'Mid').length,
      Macro: this.influencers.filter(inf => inf.tier_followers === 'Macro').length,
      Mega: this.influencers.filter(inf => inf.tier_followers === 'Mega').length,
    }
    
    const trending = this.influencers.filter(inf => inf.trending_status).length
    const successfulCampaigns = this.influencers.filter(inf => inf.campaign_success_signif).length
    
    return {
      total,
      byTier,
      trending,
      successfulCampaigns,
      avgEngagement: this.influencers.reduce((sum, inf) => sum + inf.engagement_rate_pct, 0) / total
    }
  }
}

export const csvInfluencerService = CSVInfluencerService.getInstance()
