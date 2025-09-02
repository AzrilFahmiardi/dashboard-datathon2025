"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FirebaseTest from "@/components/FirebaseTest"
import { firebaseCampaignService, type CampaignData } from "@/lib/firebase-campaign"
import { influencerAPI, type ApiResponse } from "@/lib/influencer-api"
import { toast } from "react-hot-toast"
import {
  Users,
  DollarSign,
  MapPin,
  Heart,
  Eye,
  Plus,
  Filter,
  Search,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Target,
  Brain,
  Sparkles,
  MessageCircle,
  BarChart3,
  Zap,
  Crown,
  Star,
  RefreshCw,
  Megaphone,
  PieChart,
  CheckCircle,
  Send,
  Activity,
  Video,
  Loader2,
  Tag,
  Trophy,
  Shield,
  ExternalLink,
  AlertTriangle,
  Quote,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandSidebar } from "@/components/brand-sidebar"
import { CreateCampaignModal } from "@/components/create-campaign-modal"
import { CampaignResults } from "@/components/campaign-results"
import { BrandProfileForm } from "@/components/brand-profile-form"
import { InfluencerList } from "@/components/influencer-list"
import { useAuth } from "@/contexts/auth-context"
import { APIStatusChecker } from "@/components/api-status-checker"

export default function BrandDashboard() {
  const { user } = useAuth() // Get current logged in brand
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<string | null>(null)
  const [campaignResults, setCampaignResults] = useState<ApiResponse | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date())
  const [showApiResponse, setShowApiResponse] = useState(false) // New state for API response toggle

  // Calculate dynamic dashboard stats
  const dashboardStats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'In Progress' || c.status === 'Upcoming').length,
    campaignsWithRecommendations: campaigns.filter(c => c.has_recommendations).length,
    totalBudget: campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0),
    scheduledPosts: campaigns.reduce((sum, campaign) => sum + (campaign.output?.deliverables || 0), 0)
  }

  // Generate dynamic calendar data
  const generateCalendarData = () => {
    const year = currentCalendarDate.getFullYear()
    const month = currentCalendarDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    // Parse campaign dates and map to calendar
    const campaignEvents: { [key: number]: Array<{ title: string, type: string }> } = {}
    
    campaigns.forEach(campaign => {
      if (campaign.due_date) {
        try {
          const dueDate = new Date(campaign.due_date)
          if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
            const day = dueDate.getDate()
            if (!campaignEvents[day]) campaignEvents[day] = []
            
            // Determine event type based on campaign status
            let eventType = 'planning'
            if (campaign.status === 'In Progress') eventType = 'launch'
            else if (campaign.status === 'Upcoming') eventType = 'deadline'
            
            campaignEvents[day].push({
              title: campaign.title || campaign.product_name,
              type: eventType
            })
          }
        } catch (error) {
          console.error('Error parsing campaign date:', error)
        }
      }
    })
    
    return {
      monthName: monthNames[month],
      year,
      daysInMonth,
      campaignEvents
    }
  }

  const calendarData = generateCalendarData()

  // Calendar navigation functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // Load campaigns from Firebase on component mount
  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user])

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'analytics', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const loadCampaigns = async () => {
    if (!user) return
    
    try {
      setIsLoadingCampaigns(true)
      // Load campaigns only for the current brand
      const fetchedCampaigns = await firebaseCampaignService.getCampaignsByBrand(user.uid)
      setCampaigns(fetchedCampaigns)
    } catch (error) {
      console.error('Error loading campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setIsLoadingCampaigns(false)
    }
  }

  // Handler untuk menerima campaign baru dari modal
  const handleCampaignCreated = async (campaign: CampaignData) => {
    // Add new campaign to state
    setCampaigns(prev => [campaign, ...prev])
    toast.success('Campaign berhasil dibuat!')
  }

  // Helper function to parse caption behavior insights
  const parseCaptionBehavior = (insights: string) => {
    if (!insights) return null
    
    try {
      const sections: any = {}
      
      // Parse Comment Quality
      const commentQualityMatch = insights.match(/Comment Quality[\s\S]*?Total (\d+) komentar[\s\S]*?(?=\n\n)/)
      if (commentQualityMatch) {
        const commentText = commentQualityMatch[0]
        const totalMatch = commentText.match(/Total (\d+) komentar/)
        const supportiveMatch = commentText.match(/(\d+\.?\d*)% supportive sentiment/)
        const passiveMatch = commentText.match(/(\d+\.?\d*)% passive engagement/)
        const relatableMatch = commentText.match(/(\d+\.?\d*)% relatable engagement/)
        const highValueMatch = commentText.match(/High-Value Comment Rate: (\d+\.?\d*)%/)
        
        sections.commentQuality = {
          total: totalMatch ? parseInt(totalMatch[1]) : 0,
          supportive: supportiveMatch ? parseFloat(supportiveMatch[1]) : 0,
          passive: passiveMatch ? parseFloat(passiveMatch[1]) : 0,
          relatable: relatableMatch ? parseFloat(relatableMatch[1]) : 0,
          highValue: highValueMatch ? parseFloat(highValueMatch[1]) : 0
        }
      }

      // Parse Comment Examples by Type - Extract specific categories
      const commentTypesSection = insights.match(/Komentar Berkualitas Tinggi yang Mewakili Audiens([\s\S]*?)(?=📢|Caption Behavior|$)/)
      if (commentTypesSection) {
        const exampleText = commentTypesSection[1]
        
        // Parse Relatable Engagement examples
        const relatableSection = exampleText.match(/Relatable Engagement[\s\S]*?Contoh:([\s\S]*?)(?=🔹|📢|$)/)
        if (relatableSection) {
          const relatableQuotes = relatableSection[1].match(/"([^"]+)"/g)
          if (relatableQuotes) {
            sections.relatableExamples = relatableQuotes.map(quote => quote.replace(/"/g, '').trim())
          }
        }
        
        // Parse Social Virality examples
        const viralSection = exampleText.match(/Social Virality[\s\S]*?Contoh:([\s\S]*?)(?=🔹|📢|$)/)
        if (viralSection) {
          const viralQuotes = viralSection[1].match(/"([^"]+)"/g)
          if (viralQuotes) {
            sections.viralExamples = viralQuotes.map(quote => quote.replace(/"/g, '').trim())
          }
        }
        
        // Parse Supportive Sentiment examples
        const supportiveSection = exampleText.match(/Supportive Sentiment[\s\S]*?Contoh:([\s\S]*?)(?=🔹|📢|$)/)
        if (supportiveSection) {
          const supportiveQuotes = supportiveSection[1].match(/"([^"]+)"/g)
          if (supportiveQuotes) {
            sections.supportiveExamples = supportiveQuotes.map(quote => quote.replace(/"/g, '').trim())
          }
        }
      }

      // Extract all quoted examples as fallback
      const allQuotes = insights.match(/"([^"]+)"/g)
      if (allQuotes) {
        sections.allCommentExamples = allQuotes
          .map(quote => quote.replace(/"/g, '').trim())
          .filter(quote => quote.length > 10) // Filter out short quotes
          .slice(0, 5) // Take first 5 examples
      }
      
      // Parse Caption Behavior Summary
      const ctaMatch = insights.match(/Call-to-Action Habit:[\s\S]*?(\d+) dari (\d+) caption/)
      if (ctaMatch) {
        sections.cta = {
          used: parseInt(ctaMatch[1]),
          total: parseInt(ctaMatch[2]),
          percentage: ((parseInt(ctaMatch[1]) / parseInt(ctaMatch[2])) * 100).toFixed(1)
        }
      }
      
      // Parse Tone of Voice
      const toneMatch = insights.match(/Tone of Voice:[\s\S]*?Dominan: (.*?)\./)
      if (toneMatch) {
        sections.tone = toneMatch[1].trim()
      }
      
      // Parse Engagement Style
      const engagementMatch = insights.match(/Engagement Style:[\s\S]*?(\d+) caption mengandung/)
      if (engagementMatch) {
        sections.engagementCaptions = parseInt(engagementMatch[1])
      }
      
      // Parse Label Distribution
      const labelMatch = insights.match(/Distribusi label utama:[\s\S]*?\n([\s\S]*?)(?=\n\n|\nJuga|$)/)
      if (labelMatch) {
        const labelText = labelMatch[1]
        const labels: any = {}
        const labelLines = labelText.split('\n')
        labelLines.forEach(line => {
          const match = line.match(/(.*?): (\d+)/)
          if (match) {
            labels[match[1].trim()] = parseInt(match[2])
          }
        })
        sections.labels = labels
      }
      
      // Parse examples from specific sections
      const ctaExampleMatch = insights.match(/Call-to-Action Habit:[\s\S]*?Contoh:[\s\S]*?"(.*?)"/)
      if (ctaExampleMatch) {
        sections.ctaExample = ctaExampleMatch[1].trim()
      }
      
      const toneExampleMatch = insights.match(/Tone of Voice:[\s\S]*?Contoh:[\s\S]*?"(.*?)"/)
      if (toneExampleMatch) {
        sections.toneExample = toneExampleMatch[1].trim()
      }
      
      return sections
    } catch (error) {
      console.error('Error parsing caption behavior:', error)
      return null
    }
  }

  // Helper function to convert campaign data to API format
  const convertCampaignToApiFormat = (campaign: CampaignData) => {
    // Ensure all data types match the API specification exactly
    return {
      brief_id: String(campaign.brief_id || 'BRIEF_001'),
      brand_name: String(campaign.brand_name || 'Unknown Brand'),
      industry: String(campaign.industry || 'General'),
      product_name: String(campaign.product_name || 'Product'),
      overview: String(campaign.overview || 'Product overview'),
      usp: String(campaign.usp || 'Unique selling point'),
      marketing_objective: Array.isArray(campaign.marketing_objective) 
        ? campaign.marketing_objective.map(obj => String(obj))
        : ["Brand Awareness"],
      target_goals: Array.isArray(campaign.target_goals) 
        ? campaign.target_goals.map(goal => String(goal))
        : ["Awareness"],
      timing_campaign: String(campaign.timing_campaign || '2025-03-15'),
      audience_preference: {
        top_locations: {
          countries: Array.isArray(campaign.audience_preference?.top_locations?.countries) 
            ? campaign.audience_preference.top_locations.countries.map(c => String(c))
            : ["Indonesia"],
          cities: Array.isArray(campaign.audience_preference?.top_locations?.cities) 
            ? campaign.audience_preference.top_locations.cities.map(c => String(c))
            : ["Jakarta"]
        },
        age_range: Array.isArray(campaign.audience_preference?.age_range) 
          ? campaign.audience_preference.age_range.map(age => String(age))
          : ["18-24", "25-34"],
        gender: Array.isArray(campaign.audience_preference?.gender) 
          ? campaign.audience_preference.gender.map(g => String(g))
          : ["Female"]
      },
      influencer_persona: String(campaign.influencer_persona || 'Content creator and influencer'),
      total_influencer: parseInt(String(campaign.total_influencer || 3), 10),
      niche: Array.isArray(campaign.niche) 
        ? campaign.niche.map(n => String(n))
        : ["Lifestyle"],
      location_prior: Array.isArray(campaign.location_prior) 
        ? campaign.location_prior.map(loc => String(loc))
        : ["Indonesia"],
      esg_allignment: Array.isArray(campaign.esg_allignment) 
        ? campaign.esg_allignment.map(esg => String(esg))
        : ["None"],
      budget: parseFloat(String(campaign.budget || 50000000)),
      output: {
        content_types: Array.isArray(campaign.output?.content_types) 
          ? campaign.output.content_types.map(ct => String(ct))
          : ["Reels", "Feeds"],
        deliverables: parseInt(String(campaign.output?.deliverables || 6), 10)
      },
      risk_tolerance: String(campaign.risk_tolerance || 'Medium')
    }
  }

  // Handler untuk generate recommendations
  const handleGenerateRecommendations = async (campaign: CampaignData) => {
    setIsGeneratingRecommendations(true)
    try {
      console.log('🚀 Starting recommendation generation for campaign:', campaign.brief_id)
      toast.loading('Generating AI recommendations...', { duration: 1000 })
      
      // Convert campaign data to API format
      const apiPayload = convertCampaignToApiFormat(campaign)
      
      // Enhanced logging to verify data format
      console.log('📦 API Payload prepared (detailed):', {
        brief_id: apiPayload.brief_id,
        brand_name: apiPayload.brand_name,
        product_name: apiPayload.product_name,
        total_influencer: `${apiPayload.total_influencer} (type: ${typeof apiPayload.total_influencer})`,
        budget: `${apiPayload.budget} (type: ${typeof apiPayload.budget})`,
        niche: apiPayload.niche,
        audience_preference: apiPayload.audience_preference,
        output: apiPayload.output
      })
      
      // Validate critical fields
      const validationErrors = []
      if (!apiPayload.brief_id) validationErrors.push('brief_id is required')
      if (!apiPayload.brand_name) validationErrors.push('brand_name is required')
      if (!apiPayload.product_name) validationErrors.push('product_name is required')
      if (typeof apiPayload.total_influencer !== 'number') validationErrors.push('total_influencer must be number')
      if (typeof apiPayload.budget !== 'number') validationErrors.push('budget must be number')
      if (!Array.isArray(apiPayload.niche)) validationErrors.push('niche must be array')
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`)
      }
      
      console.log('✅ Payload validation passed')
      
      // Call real API endpoint
      console.log('📡 Calling API endpoint...')
      const apiResponse: ApiResponse = await influencerAPI.recommendInfluencers(apiPayload, {
        adaptive_weights: true,
        include_insights: true
      })
      
      console.log('✅ API Response received:', {
        status: apiResponse.status,
        recommendationsCount: apiResponse.recommendations?.length || 0,
        hasMetadata: !!apiResponse.metadata
      })
      
      // Validate API response
      if (!apiResponse || apiResponse.status !== 'success') {
        throw new Error('API returned invalid response')
      }

      if (!apiResponse.recommendations || apiResponse.recommendations.length === 0) {
        throw new Error('No influencer recommendations found')
      }
      
      // Save API recommendations to Firebase
      console.log('💾 Saving recommendations to Firebase...')
      await firebaseCampaignService.saveRecommendations(campaign.brief_id, apiResponse)
      
      // Update campaigns state
      setCampaigns(prev => prev.map(c => 
        c.brief_id === campaign.brief_id 
          ? { ...c, has_recommendations: true, recommendation_data: apiResponse }
          : c
      ))
      
      console.log('🎉 Recommendations generated successfully!')
      toast.success(`Successfully generated ${apiResponse.recommendations.length} influencer recommendations!`)
      setSelectedCampaignDetail(campaign.brief_id)
    } catch (error: any) {
      console.error('❌ Error generating recommendations:', error)
      
      // Provide specific error messages
      let errorMessage = 'Failed to generate recommendations'
      
      if (error.message.includes('connect')) {
        errorMessage = 'Cannot connect to AI API. Please ensure the API server is running.'
      } else if (error.message.includes('JSON serializable') || error.message.includes('serialization error')) {
        errorMessage = 'API server encountered a data processing error. Please try again in a few moments or contact support.'
      } else if (error.message.includes('Internal server error')) {
        errorMessage = 'AI API server error. The development team has been notified. Please try again later.'
      } else if (error.message.includes('Validation errors')) {
        errorMessage = `Data validation failed: ${error.message.replace('Validation errors: ', '')}`
      } else if (error.message.includes('API returned invalid response')) {
        errorMessage = 'AI API returned invalid response. Please try again.'
      } else if (error.message.includes('No influencer recommendations found')) {
        errorMessage = 'No suitable influencers found for your criteria. Try adjusting your requirements.'
      } else if (error.message.includes('server')) {
        errorMessage = `Server error: ${error.message}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      
      // Log the full error for debugging
      console.error('🔍 Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  // Handler untuk kembali ke dashboard dari results
  const handleBackFromResults = () => {
    setShowResults(false)
    setCampaignResults(null)
  }

  // Handler untuk membuka detail campaign
  const openCampaignDetail = (briefId: string) => {
    setSelectedCampaignDetail(briefId)
  }

  // Handler untuk kembali ke dashboard
  const closeCampaignDetail = () => {
    setSelectedCampaignDetail(null)
  }

  // Render results page
  if (showResults && campaignResults) {
    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <CampaignResults 
              data={campaignResults} 
              onBack={handleBackFromResults}
            />
          </div>
        </main>
      </div>
    )
  }

  // Render detail campaign dengan AI recommendations
  if (selectedCampaignDetail) {
    const campaignDetail = campaigns.find(c => c.brief_id === selectedCampaignDetail)
    
    if (!campaignDetail) {
      return (
        <div className="flex h-screen bg-background">
          <BrandSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Button 
                variant="ghost" 
                onClick={closeCampaignDetail}
                className="mb-4 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <p>Campaign not found.</p>
            </div>
          </main>
        </div>
      )
    }

    // If campaign doesn't have recommendations yet, show generate button
    if (!campaignDetail.has_recommendations) {
      return (
        <div className="flex h-screen bg-background">
          <BrandSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Header sederhana */}
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  onClick={closeCampaignDetail}
                  className="mb-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                  Campaign Details
                </h1>
              </div>

              {/* Campaign Brief Card - Sesuai gambar */}
              <div className="mb-6">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-3 text-xs bg-gray-800 text-white border-gray-800 font-medium">
                          {campaignDetail.brief_id}
                        </Badge>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                          {campaignDetail.product_name}
                        </h2>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                          {campaignDetail.industry}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1">
                          Campaign Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 4 Info Cards - Layout persis seperti gambar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Campaign Info */}
                <Card className="bg-white border">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <h3 className="text-sm font-medium">Campaign Info</h3>
                    </div>
                    
                    <div className="text-center p-3 bg-blue-50 rounded mb-3">
                      <div className="text-2xl font-bold text-blue-600">
                        Rp {(campaignDetail.budget / 1000000).toFixed(0)}M
                      </div>
                      <div className="text-xs text-muted-foreground">Total Budget</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-800">{campaignDetail.output?.deliverables || 6}</div>
                      <div className="text-xs text-muted-foreground">Total Deliverables</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Target Audience */}
                <Card className="bg-white border">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      <h3 className="text-sm font-medium">Target Audience</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium mb-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          Cities:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {campaignDetail.audience_preference?.top_locations?.cities?.map((city, index) => (
                            <span key={index} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
                              {city}
                            </span>
                          )) || (
                            <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded">Jakarta</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center mb-2">
                          <Users className="w-3 h-3 mr-1" />
                          {campaignDetail.audience_preference?.age_range?.join(', ') || '18-24, 25-34'} • {campaignDetail.audience_preference?.gender?.join(', ') || 'Female'}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Niches: </span>
                          {campaignDetail.niche?.join(', ') || 'Beauty, Lifestyle'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Requirements */}
                <Card className="bg-white border">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <Video className="w-4 h-4 mr-2 text-blue-600" />
                      <h3 className="text-sm font-medium">Content Requirements</h3>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      Types: {campaignDetail.output?.content_types?.join(', ') || 'Reels, Feeds'}
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold text-gray-800">
                        {campaignDetail.output?.deliverables || 3}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Deliverables</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Influencer Persona */}
                <Card className="bg-white border">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <Star className="w-4 h-4 mr-2 text-blue-600" />
                      <h3 className="text-sm font-medium">Influencer Persona</h3>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {campaignDetail.influencer_persona || "Beauty enthusiast, skincare expert, authentic product reviewer dengan focus pada natural skincare dan anti-aging..."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Generate Recommendations Button */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div>
                      <Brain className="w-12 h-12 mx-auto text-primary/60 mb-4" />
                      <h3 className="text-lg font-semibold">Generate Influencer Recommendations</h3>
                      <p className="text-muted-foreground">
                        Dapatkan rekomendasi influencer terbaik menggunakan AI untuk campaign ini
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleGenerateRecommendations(campaignDetail)}
                      disabled={isGeneratingRecommendations}
                      size="lg"
                      className="w-full max-w-md"
                    >
                      {isGeneratingRecommendations ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Recommendations...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate AI Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      )
    }

    // Show recommendations if available - LAYOUT SEDERHANA SESUAI GAMBAR
    const aiData = campaignDetail.recommendation_data
    if (!aiData) {
      return (
        <div className="flex h-screen bg-background">
          <BrandSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Button 
                variant="ghost" 
                onClick={closeCampaignDetail}
                className="mb-4 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <p>Recommendation data not available.</p>
            </div>
          </main>
        </div>
      )
    }

    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header sederhana */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={closeCampaignDetail}
                className="mb-4 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Influencer Recommendations
                </h1>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowApiResponse(!showApiResponse)}
                  className="text-xs"
                >
                  {showApiResponse ? 'Hide' : 'Show'} API Response
                </Button>
              </div>
            </div>

            {/* API Response Debug Card - Collapsible */}
            {showApiResponse && (
              <div className="mb-6">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-orange-600" />
                      Raw API Response
                      <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-800 border-orange-300">
                        Debug Mode
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Original response from Influencer Recommendation API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* API Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-white border rounded">
                          <div className="text-sm font-bold text-green-600">
                            {aiData.status || 'success'}
                          </div>
                          <div className="text-xs text-muted-foreground">Status</div>
                        </div>
                        <div className="text-center p-2 bg-white border rounded">
                          <div className="text-sm font-bold text-blue-600">
                            {aiData.recommendations?.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Recommendations</div>
                        </div>
                        <div className="text-center p-2 bg-white border rounded">
                          <div className="text-sm font-bold text-purple-600">
                            {aiData.timestamp || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">Timestamp</div>
                        </div>
                      </div>

                      {/* JSON Response */}
                      <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-700">JSON Response:</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(aiData, null, 2))
                              toast.success('API response copied to clipboard!')
                            }}
                          >
                            Copy JSON
                          </Button>
                        </div>
                        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                          <code className="text-gray-700">
                            {JSON.stringify(aiData, null, 2)}
                          </code>
                        </pre>
                      </div>

                      {/* Quick Stats */}
                      {aiData.metadata && (
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="text-sm font-semibold mb-2">API Metadata:</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Adaptive Weights:</span> 
                              <span className="ml-1 text-green-600">
                                {aiData.metadata.use_adaptive_weights ? '✅ Enabled' : '❌ Disabled'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Include Insights:</span> 
                              <span className="ml-1 text-green-600">
                                {aiData.metadata.include_insights ? '✅ Enabled' : '❌ Disabled'}
                              </span>
                            </div>
                          </div>
                          {aiData.metadata.scoring_strategy && (
                            <div className="mt-2 pt-2 border-t">
                              <span className="text-xs font-medium">Scoring Weights:</span>
                              <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                                <div>Audience Fit: {(aiData.metadata.scoring_strategy.audience_fit * 100).toFixed(1)}%</div>
                                <div>Persona Fit: {(aiData.metadata.scoring_strategy.persona_fit * 100).toFixed(1)}%</div>
                                <div>Performance: {(aiData.metadata.scoring_strategy.performance_pred * 100).toFixed(1)}%</div>
                                <div>Budget Efficiency: {(aiData.metadata.scoring_strategy.budget_efficiency * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Campaign Summary Card - Enhanced */}
            {aiData.brief && (
              <div className="mb-6">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Brain className="w-5 h-5 mr-2 text-blue-600" />
                      Campaign Analysis Summary
                    </CardTitle>
                    <CardDescription>
                      AI-generated summary and statistics for {aiData.brief.brief_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white border border-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {aiData.brief.total_found || 0}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">Influencers Found</div>
                      </div>
                      <div className="text-center p-3 bg-white border border-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {aiData.brief.total_requested || 0}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Recommendations</div>
                      </div>
                      <div className="text-center p-3 bg-white border border-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {((aiData.metadata?.scoring_strategy?.persona_fit || 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Avg Persona Fit</div>
                      </div>
                    </div>
                    
                    {aiData.brief.summary && (
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <h5 className="font-semibold text-sm mb-2 flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
                          Campaign Summary
                        </h5>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {aiData.brief.summary}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Campaign Brief Card - Sesuai gambar */}
            <div className="mb-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-3 text-xs bg-gray-800 text-white border-gray-800 font-medium">
                        {campaignDetail.brief_id}
                      </Badge>
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        {campaignDetail.product_name}
                      </h2>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                        {campaignDetail.industry}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1">
                        Campaign Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 4 Info Cards - Layout persis seperti gambar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Campaign Info */}
              <Card className="bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    <h3 className="text-sm font-medium">Campaign Info</h3>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded mb-3">
                    <div className="text-2xl font-bold text-blue-600">
                      Rp {(campaignDetail.budget / 1000000).toFixed(0)}M
                    </div>
                    <div className="text-xs text-muted-foreground">Total Budget</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-800">{campaignDetail.output?.deliverables || 6}</div>
                    <div className="text-xs text-muted-foreground">Total Deliverables</div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card className="bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <h3 className="text-sm font-medium">Target Audience</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium mb-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Cities:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {campaignDetail.audience_preference?.top_locations?.cities?.map((city, index) => (
                          <span key={index} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
                            {city}
                          </span>
                        )) || (
                          <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded">Jakarta</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center mb-2">
                        <Users className="w-3 h-3 mr-1" />
                        {campaignDetail.audience_preference?.age_range?.join(', ') || '18-24, 25-34'} • {campaignDetail.audience_preference?.gender?.join(', ') || 'Female'}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Niches: </span>
                        {campaignDetail.niche?.join(', ') || 'Beauty, Lifestyle'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Requirements */}
              <Card className="bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Video className="w-4 h-4 mr-2 text-blue-600" />
                    <h3 className="text-sm font-medium">Content Requirements</h3>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    Types: {campaignDetail.output?.content_types?.join(', ') || 'Reels, Feeds'}
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-800">
                      {campaignDetail.output?.deliverables || 3}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Deliverables</div>
                  </div>
                </CardContent>
              </Card>

              {/* Influencer Persona */}
              <Card className="bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 mr-2 text-blue-600" />
                    <h3 className="text-sm font-medium">Influencer Persona</h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {campaignDetail.influencer_persona || "Beauty enthusiast, skincare expert, authentic product reviewer dengan focus pada natural skincare dan anti-aging..."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Scoring Strategy Card */}
            {aiData.metadata?.adaptive_weights_info && (
              <div className="mb-6">
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Target className="w-5 h-5 mr-2 text-purple-600" />
                      AI Scoring Strategy
                    </CardTitle>
                    <CardDescription>
                      Adaptive weights applied based on campaign objectives
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Applied Adjustments */}
                      <div>
                        <h5 className="font-semibold text-sm mb-3 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-purple-600" />
                          Applied Adjustments ({aiData.metadata.adaptive_weights_info.total_adjustments})
                        </h5>
                        <div className="space-y-2">
                          {aiData.metadata.adaptive_weights_info.applied_adjustments?.map((adjustment: string, index: number) => (
                            <div key={index} className="flex items-center p-2 bg-white rounded border border-purple-100">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              <span className="text-sm">{adjustment}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Final Weights */}
                      <div>
                        <h5 className="font-semibold text-sm mb-3 flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                          Final Scoring Weights
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Persona Fit</span>
                              <span className="font-semibold">{((aiData.metadata.adaptive_weights_info.final_weights?.persona_fit || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(aiData.metadata.adaptive_weights_info.final_weights?.persona_fit || 0) * 100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Audience Fit</span>
                              <span className="font-semibold">{((aiData.metadata.adaptive_weights_info.final_weights?.audience_fit || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(aiData.metadata.adaptive_weights_info.final_weights?.audience_fit || 0) * 100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Performance Prediction</span>
                              <span className="font-semibold">{((aiData.metadata.adaptive_weights_info.final_weights?.performance_pred || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(aiData.metadata.adaptive_weights_info.final_weights?.performance_pred || 0) * 100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Efficiency</span>
                              <span className="font-semibold">{((aiData.metadata.adaptive_weights_info.final_weights?.budget_efficiency || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(aiData.metadata.adaptive_weights_info.final_weights?.budget_efficiency || 0) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Recommendations - Enhanced design dengan data real */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Top {aiData.recommendations?.length || 0} Influencer Recommendations
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Brain className="w-4 h-4" />
                  <span>AI Generated • {aiData.timestamp ? new Date(aiData.timestamp).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
              
              {/* Dynamic Recommendations dengan design yang enhanced */}
              {aiData.recommendations?.map((influencer: any, index: number) => (
                <Card key={index} className="bg-white border hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16 border-2 border-primary/20">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${influencer.username}&background=random&color=fff`} />
                          <AvatarFallback className="text-lg font-bold">
                            {influencer.username?.substring(1, 3).toUpperCase() || 'IF'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-bold flex items-center">
                              @{influencer.username}
                              {influencer.tier === 'Mega' && (
                                <Crown className="w-5 h-5 ml-2 text-yellow-500" />
                              )}
                            </h3>
                            <Badge 
                              variant={influencer.tier === 'Mega' ? 'default' : influencer.tier === 'Mid' ? 'secondary' : 'outline'}
                              className="font-medium"
                            >
                              {influencer.tier} Tier
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Tag className="w-4 h-4 mr-1" />
                              {influencer.expertise}
                            </span>
                            <span className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1" />
                              Rank #{influencer.rank}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Overall Score */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {((influencer.scores?.final_score || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Overall Match</div>
                      </div>
                    </div>

                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-green-50 border border-green-100 rounded-lg">
                        <div className="text-lg font-bold text-green-700">
                          {(influencer.performance_metrics?.engagement_rate * 100 || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-green-600 font-medium">Engagement Rate</div>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">
                          {(influencer.performance_metrics?.authenticity_score * 100 || 0).toFixed(0)}%
                        </div>
                        <div className="text-xs text-blue-600 font-medium">Authenticity</div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">
                          {(influencer.performance_metrics?.reach_potential * 100 || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-purple-600 font-medium">Reach Potential</div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="text-lg font-bold text-orange-700">
                          {influencer.optimal_content_mix?.total_impact?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-xs text-orange-600 font-medium">Projected Impact</div>
                      </div>
                    </div>

                    {/* Budget & Content Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Budget Information - hanya tampilkan jika ada data */}
                      {influencer.optimal_content_mix?.total_cost && (
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                            Budget Breakdown
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Cost:</span>
                              <span className="font-semibold">
                                Rp {(influencer.optimal_content_mix.total_cost / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            {/* Hanya tampilkan budget status jika ada remaining_budget */}
                            {influencer.optimal_content_mix.remaining_budget !== undefined && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span>Budget Status:</span>
                                  <span className={`font-semibold ${
                                    influencer.optimal_content_mix.remaining_budget >= 0 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    {influencer.optimal_content_mix.remaining_budget >= 0 ? 'Under Budget' : 'Over Budget'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Remaining:</span>
                                  <span className={`font-semibold ${
                                    influencer.optimal_content_mix.remaining_budget >= 0 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    Rp {Math.abs(influencer.optimal_content_mix.remaining_budget / 1000000).toFixed(1)}M
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Mix - hanya tampilkan jika ada data */}
                      {(influencer.optimal_content_mix?.reels_count || 
                        influencer.optimal_content_mix?.feeds_count || 
                        influencer.optimal_content_mix?.story_count) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center text-sm">
                            <Video className="w-4 h-4 mr-2 text-blue-600" />
                            Recommended Content
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {influencer.optimal_content_mix.reels_count > 0 && (
                              <div className="flex justify-between text-sm">
                                <span>Reels:</span>
                                <span className="font-semibold">{influencer.optimal_content_mix.reels_count}</span>
                              </div>
                            )}
                            {influencer.optimal_content_mix.feeds_count > 0 && (
                              <div className="flex justify-between text-sm">
                                <span>Feeds:</span>
                                <span className="font-semibold">{influencer.optimal_content_mix.feeds_count}</span>
                              </div>
                            )}
                            {influencer.optimal_content_mix.story_count > 0 && (
                              <div className="flex justify-between text-sm">
                                <span>Stories:</span>
                                <span className="font-semibold">{influencer.optimal_content_mix.story_count}</span>
                              </div>
                            )}
                            <div className="pt-2 border-t">
                              <div className="flex justify-between text-sm font-semibold">
                                <span>Total Deliverables:</span>
                                <span>
                                  {(influencer.optimal_content_mix?.reels_count || 0) + 
                                   (influencer.optimal_content_mix?.feeds_count || 0) + 
                                   (influencer.optimal_content_mix?.story_count || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detailed Tabs */}
                    <Tabs defaultValue="insights" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-50">
                        <TabsTrigger value="insights" className="text-xs data-[state=active]:bg-white">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Caption Behavior
                        </TabsTrigger>
                        <TabsTrigger value="scores" className="text-xs data-[state=active]:bg-white">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Score Breakdown
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="strategy" className="text-xs data-[state=active]:bg-white">
                          <Target className="w-3 h-3 mr-1" />
                          Strategy
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="insights" className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-4">
                          <h5 className="font-semibold text-sm flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Caption Behavior Analysis
                          </h5>
                          {influencer.insights ? (
                            (() => {
                              const parsed = parseCaptionBehavior(influencer.insights)
                              if (parsed) {
                                return (
                                  <div className="space-y-4">
                                    {/* Comment Examples by Type - Priority Section */}
                                    {(parsed.relatableExamples || parsed.viralExamples || parsed.supportiveExamples) && (
                                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-5 border-l-4 border-emerald-400">
                                        <h6 className="font-bold text-lg mb-4 flex items-center text-emerald-800">
                                          <Quote className="w-5 h-5 mr-2" />
                                          Comment Examples by Type
                                          <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-300">
                                            Primary Insights
                                          </Badge>
                                        </h6>

                                        <div className="space-y-4">
                                          {/* Relatable Engagement */}
                                          {parsed.relatableExamples && parsed.relatableExamples.length > 0 && (
                                            <div className="bg-white rounded-lg p-4 border-l-4 border-green-400 shadow-sm">
                                              <h7 className="font-semibold text-sm mb-3 text-green-700 flex items-center">
                                                <Heart className="w-4 h-4 mr-2" />
                                                Relatable Engagement Comments
                                              </h7>
                                              <div className="space-y-2">
                                                {parsed.relatableExamples.map((comment: string, index: number) => (
                                                  <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-800 italic font-medium">
                                                      "{comment}"
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Social Virality */}
                                          {parsed.viralExamples && parsed.viralExamples.length > 0 && (
                                            <div className="bg-white rounded-lg p-4 border-l-4 border-pink-400 shadow-sm">
                                              <h7 className="font-semibold text-sm mb-3 text-pink-700 flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                Social Virality Comments
                                              </h7>
                                              <div className="space-y-2">
                                                {parsed.viralExamples.map((comment: string, index: number) => (
                                                  <div key={index} className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                                                    <p className="text-sm text-pink-800 italic font-medium">
                                                      "{comment}"
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Supportive Sentiment */}
                                          {parsed.supportiveExamples && parsed.supportiveExamples.length > 0 && (
                                            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400 shadow-sm">
                                              <h7 className="font-semibold text-sm mb-3 text-blue-700 flex items-center">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Supportive Sentiment Comments
                                              </h7>
                                              <div className="space-y-2">
                                                {parsed.supportiveExamples.map((comment: string, index: number) => (
                                                  <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-blue-800 italic font-medium">
                                                      "{comment}"
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Fallback - General Comment Examples if no categorized data */}
                                    {(!parsed.relatableExamples && !parsed.viralExamples && !parsed.supportiveExamples) && 
                                     parsed.allCommentExamples && parsed.allCommentExamples.length > 0 && (
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-400">
                                        <h6 className="font-semibold text-sm mb-3 flex items-center">
                                          <Quote className="w-4 h-4 mr-2 text-blue-600" />
                                          Representative Audience Comments
                                        </h6>
                                        <div className="space-y-3">
                                          {parsed.allCommentExamples.map((comment: string, index: number) => (
                                            <div key={index} className="bg-white p-3 rounded-lg border-l-2 border-blue-300">
                                              <p className="text-sm text-gray-700 italic font-medium">
                                                "{comment}"
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Comment Quality Section - Secondary Priority */}
                                    {parsed.commentQuality && (
                                      <div className="bg-white rounded-lg p-4 border">
                                        <h6 className="font-medium text-sm mb-3">
                                          Comment Quality Analysis
                                        </h6>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                          <div className="text-center p-2 bg-blue-50 rounded">
                                            <div className="text-lg font-bold text-blue-600">{parsed.commentQuality.total}</div>
                                            <div className="text-xs text-muted-foreground">Total Comments</div>
                                          </div>
                                          <div className="text-center p-2 bg-green-50 rounded">
                                            <div className="text-lg font-bold text-green-600">{parsed.commentQuality.supportive}%</div>
                                            <div className="text-xs text-muted-foreground">Supportive</div>
                                          </div>
                                          <div className="text-center p-2 bg-yellow-50 rounded">
                                            <div className="text-lg font-bold text-yellow-600">{parsed.commentQuality.passive}%</div>
                                            <div className="text-xs text-muted-foreground">Passive</div>
                                          </div>
                                          <div className="text-center p-2 bg-purple-50 rounded">
                                            <div className="text-lg font-bold text-purple-600">{parsed.commentQuality.highValue}%</div>
                                            <div className="text-xs text-muted-foreground">High-Value Rate</div>
                                          </div>
                                        </div>
                                        {parsed.commentQuality.highValue < 20 && (
                                          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Low high-value rate indicates mostly praise or passive engagement
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Caption Behavior Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* CTA Usage */}
                                      {parsed.cta && (
                                        <div className="bg-white rounded-lg p-4 border">
                                          <h6 className="font-medium text-sm mb-3">
                                            Call-to-Action Usage
                                          </h6>
                                          <div className="text-center mb-3">
                                            <div className="text-2xl font-bold text-blue-600">
                                              {parsed.cta.used}/{parsed.cta.total}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {parsed.cta.percentage}% of captions
                                            </div>
                                          </div>
                                          <Progress value={parseFloat(parsed.cta.percentage)} className="h-2 mb-2" />
                                          {parsed.ctaExample && (
                                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-300">
                                              <strong>Example:</strong> "{parsed.ctaExample}"
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Tone of Voice */}
                                      {parsed.tone && (
                                        <div className="bg-white rounded-lg p-4 border">
                                          <h6 className="font-medium text-sm mb-3">
                                            Tone of Voice
                                          </h6>
                                          <div className="text-center mb-3">
                                            <div className="text-lg font-semibold text-purple-600 capitalize">
                                              {parsed.tone}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Dominant Style</div>
                                          </div>
                                          {parsed.toneExample && (
                                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-purple-300">
                                              <strong>Example:</strong> "{parsed.toneExample}"
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Engagement Distribution */}
                                    {parsed.labels && Object.keys(parsed.labels).length > 0 && (
                                      <div className="bg-white rounded-lg p-4 border">
                                        <h6 className="font-medium text-sm mb-3">
                                          Content Label Distribution
                                        </h6>
                                        <div className="space-y-2">
                                          {Object.entries(parsed.labels).map(([label, count]: [string, any]) => {
                                            const total = Object.values(parsed.labels).reduce((a: number, b: any) => a + (b as number), 0)
                                            const percentage = (((count as number) / total) * 100).toFixed(1)
                                            return (
                                              <div key={label} className="flex items-center justify-between">
                                                <span className="text-sm capitalize">{label.replace(/[_-]/g, ' ')}</span>
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                      className="bg-blue-600 h-2 rounded-full" 
                                                      style={{width: `${percentage}%`}}
                                                    ></div>
                                                  </div>
                                                  <span className="text-xs font-medium w-8">{count}</span>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Engagement Insights */}
                                    {parsed.engagementCaptions && (
                                      <div className="bg-white rounded-lg p-4 border">
                                        <h6 className="font-medium text-sm mb-2">
                                          Engagement Strategy
                                        </h6>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-semibold text-green-600">{parsed.engagementCaptions}</span> captions 
                                          actively invite audience interaction, showing good two-way engagement efforts.
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              } else {
                                // Fallback: show original insights in formatted way
                                return (
                                  <div className="text-sm text-gray-700 leading-relaxed space-y-3 max-h-96 overflow-y-auto">
                                    <div className="whitespace-pre-line bg-white p-4 rounded border">
                                      {influencer.insights}
                                    </div>
                                  </div>
                                )
                              }
                            })()
                          ) : (
                            <div className="text-center py-6 text-muted-foreground bg-white rounded border">
                              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                              <p className="text-sm">No caption behavior analysis available for this influencer</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="scores" className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-4">
                          <h5 className="font-semibold text-sm">Detailed Score Analysis</h5>
                          {influencer.scores ? (
                            <div className="grid grid-cols-2 gap-4">
                              {influencer.scores.audience_fit !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Audience Fit:</span>
                                    <span className="font-semibold">{(influencer.scores.audience_fit * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress value={influencer.scores.audience_fit * 100} className="h-2" />
                                </div>
                              )}
                              {influencer.scores.persona_fit !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Persona Fit:</span>
                                    <span className="font-semibold">{(influencer.scores.persona_fit * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress value={influencer.scores.persona_fit * 100} className="h-2" />
                                </div>
                              )}
                              {influencer.scores.performance_pred !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Performance Prediction:</span>
                                    <span className="font-semibold">{(influencer.scores.performance_pred * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress value={influencer.scores.performance_pred * 100} className="h-2" />
                                </div>
                              )}
                              {influencer.scores.budget_efficiency !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Budget Efficiency:</span>
                                    <span className="font-semibold">{(influencer.scores.budget_efficiency * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress value={influencer.scores.budget_efficiency * 100} className="h-2" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground bg-white rounded border">
                              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                              <p className="text-sm">Score breakdown not available</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="performance" className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-4">
                          <h5 className="font-semibold text-sm">Performance Metrics</h5>
                          {influencer.performance_metrics ? (
                            <div className="grid grid-cols-1 gap-3">
                              {influencer.performance_metrics.engagement_rate && (
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                  <span className="text-sm">Engagement Rate</span>
                                  <span className="font-semibold text-green-600">
                                    {(influencer.performance_metrics.engagement_rate * 100).toFixed(2)}%
                                  </span>
                                </div>
                              )}
                              {influencer.performance_metrics.authenticity_score && (
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                  <span className="text-sm">Authenticity Score</span>
                                  <span className="font-semibold text-blue-600">
                                    {(influencer.performance_metrics.authenticity_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {influencer.performance_metrics.reach_potential && (
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                  <span className="text-sm">Reach Potential</span>
                                  <span className="font-semibold text-purple-600">
                                    {(influencer.performance_metrics.reach_potential * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground bg-white rounded border">
                              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                              <p className="text-sm">No performance metrics available</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="strategy" className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-4">
                          <h5 className="font-semibold text-sm">Campaign Strategy Recommendations</h5>
                          <div className="space-y-3">
                            {/* Hanya tampilkan strategy jika ada data yang relevan */}
                            {influencer.optimal_content_mix && (
                              <div className="p-3 bg-white rounded border">
                                <h6 className="font-medium text-sm mb-2">Content Strategy:</h6>
                                <p className="text-sm text-gray-600">
                                  {influencer.optimal_content_mix.reels_count > 0 && (
                                    <>Focus on {influencer.optimal_content_mix.reels_count} Reels content </>
                                  )}
                                  {influencer.expertise && (
                                    <>with {influencer.expertise} themes </>
                                  )}
                                  for maximum audience engagement.
                                </p>
                              </div>
                            )}
                            
                            {influencer.optimal_content_mix?.total_cost && (
                              <div className="p-3 bg-white rounded border">
                                <h6 className="font-medium text-sm mb-2">Budget Allocation:</h6>
                                <p className="text-sm text-gray-600">
                                  Recommended budget: Rp {(influencer.optimal_content_mix.total_cost / 1000000).toFixed(1)}M 
                                  {influencer.optimal_content_mix.total_impact && (
                                    <> for optimal ROI based on projected impact of {influencer.optimal_content_mix.total_impact.toFixed(1)}</>
                                  )}.
                                </p>
                              </div>
                            )}
                            
                            {influencer.performance_metrics?.engagement_rate && (
                              <div className="p-3 bg-white rounded border">
                                <h6 className="font-medium text-sm mb-2">Best Posting Times:</h6>
                                <p className="text-sm text-gray-600">
                                  Optimize posting schedule during peak engagement hours based on 
                                  {(influencer.performance_metrics.engagement_rate * 100).toFixed(1)}% average engagement rate.
                                </p>
                              </div>
                            )}
                            
                            {/* Fallback jika tidak ada data strategy */}
                            {!influencer.optimal_content_mix && !influencer.performance_metrics && (
                              <div className="text-center py-6 text-muted-foreground bg-white rounded border">
                                <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                                <p className="text-sm">Strategy recommendations will be available after data analysis</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end pt-4 border-t mt-6">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Campaign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                // Fallback jika tidak ada data recommendations
                <Card className="bg-white border">
                  <CardContent className="p-8">
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                      <p className="text-sm">Unable to load influencer recommendations. Please try generating again.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <BrandSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Brand</h1>
              <p className="text-muted-foreground">Kelola campaign dan temukan influencer terbaik</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Campaign Baru
            </Button>
          </div>

          {/* Firebase Test - temporary */}
          <div className="mb-6">
            <FirebaseTest />
          </div>

          {/* API Status Checker */}
          <div className="mb-6">
            <APIStatusChecker />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : dashboardStats.totalCampaigns}
                </div>
                <div className="text-sm font-medium text-foreground">Total Campaigns</div>
                <div className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : `${dashboardStats.activeCampaigns} active campaigns`}
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : dashboardStats.campaignsWithRecommendations}
                </div>
                <div className="text-sm font-medium text-foreground">AI Recommendations</div>
                <div className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : 'Campaigns with AI insights'}
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.3%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : dashboardStats.scheduledPosts}
                </div>
                <div className="text-sm font-medium text-foreground">Scheduled Posts</div>
                <div className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : 'Total deliverables planned'}
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.7%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : `${(dashboardStats.totalBudget / 1000000).toFixed(1)}M`}
                </div>
                <div className="text-sm font-medium text-foreground">Budget Allocated</div>
                <div className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : 'Total campaign budget (Rp)'}
                </div>
              </div>
            </Card>
          </div>

          {/* API Status Checker */}
          {/* <APIStatusChecker /> */}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="influencers">Influencer List</TabsTrigger>
              <TabsTrigger value="profile">Brand Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Top Row: Upcoming Campaigns Schedule & AI Dashboard Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Upcoming Campaigns Schedule
                    </CardTitle>
                    <CardDescription>Campaign yang akan datang dan deadline penting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {isLoadingCampaigns ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          <span className="text-muted-foreground">Loading campaigns...</span>
                        </div>
                      ) : campaigns.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Belum ada campaign yang dibuat</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-2"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Campaign Pertama
                          </Button>
                        </div>
                      ) : (
                        campaigns.slice(0, 5).map((campaign) => (
                          <div 
                            key={campaign.id}
                            onClick={() => openCampaignDetail(campaign.brief_id)}
                            className="flex items-center justify-between p-3 bg-muted border rounded-lg cursor-pointer hover:shadow-md hover:bg-muted/80 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <div>
                                <h4 className="font-semibold text-sm flex items-center">
                                  {campaign.title}
                                  {campaign.has_recommendations && (
                                    <Brain className="w-3 h-3 ml-1 text-primary" />
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground">{campaign.phase}</p>
                                <p className="text-xs text-muted-foreground">Due: {campaign.due_date}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={campaign.status === 'In Progress' ? 'default' : 'outline'} className="text-xs">
                                {campaign.status}
                              </Badge>
                              {campaign.has_recommendations && (
                                <Badge variant="secondary" className="text-xs">
                                  AI Ready
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {campaigns.length > 0 && (
                      <div className="mt-3 p-2 bg-muted border rounded-lg">
                        <div className="flex items-center text-xs">
                          <Brain className="w-3 h-3 mr-1 text-primary" />
                          <span className="text-muted-foreground">Click campaigns with AI Ready badge for recommendations</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      AI Dashboard Insights
                    </CardTitle>
                    <CardDescription>Tanyakan tentang data dashboard Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Chat Icon */}
                      <div className="flex justify-center py-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      
                      {/* Chat Prompt */}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Pilih pertanyaan template atau tanyakan langsung tentang data dashboard Anda
                        </p>
                      </div>

                      {/* Template Questions */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Pertanyaan Template:</p>
                        <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                          • Bagaimana performa penjualan campaign ini?
                        </button>
                        <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                          • Influencer mana yang paling berpotensi untuk campaign mendatang?
                        </button>
                        <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                          • Apakah ada tren penurunan atau kenaikan yang signifikan?
                        </button>
                      </div>

                      {/* Chat Input */}
                      <div className="pt-1">
                        <div className="flex items-center space-x-2 p-2 border rounded-lg bg-muted/20">
                          <input 
                            type="text" 
                            placeholder="Tanyakan tentang data dashboard..."
                            className="flex-1 bg-transparent border-none outline-none text-xs placeholder:text-muted-foreground"
                          />
                          <Button size="sm" variant="ghost" className="p-1">
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Campaigns */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Campaign Calendar
                    </CardTitle>
                    <CardDescription>Jadwal dan timeline campaign mendatang</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {calendarData.monthName} {calendarData.year}
                        </h3>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateCalendar('prev')}
                          >
                            ← Previous
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateCalendar('next')}
                          >
                            Next →
                          </Button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {/* Days of week */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {Array.from({ length: calendarData.daysInMonth }, (_, i) => i + 1).map((day) => {
                          const dayEvents = calendarData.campaignEvents[day] || []
                          return (
                            <div key={day} className="relative p-2 text-sm border rounded hover:bg-muted transition-colors min-h-[60px]">
                              <span className="font-medium">{day}</span>
                              {/* Dynamic Campaign markers */}
                              {dayEvents.map((event, index) => (
                                <div key={index} className="absolute bottom-1 left-1 right-1" style={{ bottom: `${1 + index * 16}px` }}>
                                  <div className={`text-xs px-1 py-0.5 rounded truncate ${
                                    event.type === 'launch' 
                                      ? 'bg-primary/20 text-primary' 
                                      : event.type === 'deadline'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {event.title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-primary/20 rounded"></div>
                          <span>Campaign Launch (In Progress)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-100 rounded"></div>
                          <span>Content Deadline (Upcoming)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-amber-100 rounded"></div>
                          <span>Planning Phase</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Grid - 2 rows, 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Deliverables Progress */}
                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Content Deliverables Progress</CardTitle>
                    <CardDescription>Progress konten dari campaign yang sedang berjalan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Instagram Reels</span>
                          <span className="text-sm font-medium">3/4</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Instagram Feeds</span>
                          <span className="text-sm font-medium">2/2</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Instagram Stories</span>
                          <span className="text-sm font-medium">6/8</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">TikTok Videos</span>
                          <span className="text-sm font-medium">1/2</span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget vs Timeline */}
                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Budget vs Timeline</CardTitle>
                    <CardDescription>Perkembangan budget campaign dalam 6 bulan terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center space-y-2">
                        <DollarSign className="w-12 h-12 mx-auto text-primary/60" />
                        <p>Chart: Budget Progression</p>
                        <p className="text-sm text-muted-foreground">Budget efficiency over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement vs Reach */}
                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Engagement vs Reach</CardTitle>
                    <CardDescription>Perbandingan engagement rate dengan reach</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center space-y-2">
                        <Heart className="w-12 h-12 mx-auto text-primary/60" />
                        <p>Chart: Engagement Analysis</p>
                        <p className="text-sm text-muted-foreground">Engagement rate vs reach comparison</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <Card className="bg-white border hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                    <CardDescription>Insight dan rekomendasi untuk campaign mendatang</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-2 bg-muted border rounded-lg">
                        <TrendingUp className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-foreground text-sm">Best Performing Content</h4>
                          <p className="text-muted-foreground text-xs mt-1">Instagram Reels mendapat engagement 45% lebih tinggi</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 p-2 bg-muted border rounded-lg">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-foreground text-sm">Audience Insight</h4>
                          <p className="text-muted-foreground text-xs mt-1">Target audience paling aktif pada jam 19:00-21:00 WIB</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 p-2 bg-muted border rounded-lg">
                        <Eye className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-foreground text-sm">Optimization Tip</h4>
                          <p className="text-muted-foreground text-xs mt-1">Konten dengan hashtag niche mendapat reach 32% lebih baik</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="influencers" className="space-y-6">
              <InfluencerList />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <BrandProfileForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CreateCampaignModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  )
}
