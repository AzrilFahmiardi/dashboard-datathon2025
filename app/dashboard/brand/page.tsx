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
  Edit3,
  Copy,
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
import { geminiAIService } from "@/lib/gemini-ai"

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
  const [expandedInfluencerTabs, setExpandedInfluencerTabs] = useState<{[key: string]: boolean}>({}) // State for expanded tabs per influencer
  const [influencerStrategies, setInfluencerStrategies] = useState<{[key: string]: string}>({}) // Store generated strategies
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState<{[key: string]: boolean}>({}) // Track strategy generation status
  const [strategyErrors, setStrategyErrors] = useState<{[key: string]: string}>({}) // Track strategy generation errors
  
  // State for AI insights
  const [influencerInsights, setInfluencerInsights] = useState<{[key: string]: any}>({}) // Store AI insights for each section
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<{[key: string]: boolean}>({}) // Track insights generation status
  const [insightsErrors, setInsightsErrors] = useState<{[key: string]: string}>({}) // Track insights errors

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

  // Helper function to parse and format strategy text with enhanced visual formatting
  const formatStrategyText = (strategy: string) => {
    if (!strategy) return null

    // Split strategy into sections based on emoji headers
    const sections = strategy.split(/(?=🎯|📈|💡|⚠️|💰)/).filter(section => section.trim())

    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) return null

      const headerLine = lines[0]
      const contentLines = lines.slice(1).join('\n')

      // Extract emoji and title
      const emojiMatch = headerLine.match(/^(🎯|📈|💡|⚠️|💰)\s*\*\*(.*?)\*\*:?/)
      if (!emojiMatch) return null

      const emoji = emojiMatch[1]
      const title = emojiMatch[2]

      // Determine section color theme - simplified minimal theme
      const getSectionTheme = (emoji: string) => {
        switch (emoji) {
          case '🎯': return { bg: 'bg-muted/30', border: 'border-muted', text: 'text-foreground' }
          case '📈': return { bg: 'bg-muted/30', border: 'border-muted', text: 'text-foreground' }
          case '💡': return { bg: 'bg-muted/30', border: 'border-muted', text: 'text-foreground' }
          case '⚠️': return { bg: 'bg-muted/30', border: 'border-muted', text: 'text-foreground' }
          case '💰': return { bg: 'bg-muted/30', border: 'border-muted', text: 'text-foreground' }
          default: return { bg: 'bg-muted/30', border: 'border-muted', text: 'text-foreground' }
        }
      }

      const theme = getSectionTheme(emoji)

      // Format content with subtle highlighting that respects the theme
      const formatContent = (text: string) => {
        return text
          // Bold important phrases in parentheses - subtle background
          .replace(/\(([^)]+)\)/g, '<span class="font-medium text-foreground bg-muted/40 px-1 py-0.5 rounded text-xs">$1</span>')
          // Bold product names and important terms
          .replace(/\b([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g, '<span class="font-semibold text-foreground">$1</span>')
          // Highlight percentages and numbers - minimal styling
          .replace(/\b(\d+(?:\.\d+)?%)\b/g, '<span class="font-semibold text-foreground border border-border px-1 py-0.5 rounded text-xs">$1</span>')
          .replace(/\bRp\s?([\d,.]+[MK]?)\b/g, '<span class="font-semibold text-foreground border border-border px-1 py-0.5 rounded text-xs">Rp $1</span>')
          // Bold key marketing terms without colors
          .replace(/\b(CTA|Call-to-Action|engagement|konversi|reach|brand awareness|audience|targeting|persona)\b/gi, '<span class="font-semibold text-foreground">$1</span>')
          // Bold platform names
          .replace(/\b(Instagram|TikTok|YouTube|Facebook|Twitter|Reels|Feeds|Stories|Post|Video)\b/gi, '<span class="font-semibold text-foreground">$1</span>')
          // Subtle highlight for time references
          .replace(/\b(jam \d+:\d+-\d+:\d+|pagi|siang|sore|malam)\b/gi, '<span class="font-medium text-foreground">$1</span>')
      }

      return (
        <div key={index} className={`${theme.bg} ${theme.border} border rounded-lg p-4 space-y-3 group hover:shadow-sm transition-all duration-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{emoji}</span>
              <h6 className={`font-bold text-sm ${theme.text}`}>{title}</h6>
            </div>
            {/* Quick Action Button */}
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-muted/50 rounded"
              title="Copy section"
              onClick={() => {
                navigator.clipboard.writeText(`${emoji} ${title}\n${contentLines}`)
                toast.success('Strategy section copied to clipboard!')
              }}
            >
              <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div 
            className={`text-sm ${theme.text} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: formatContent(contentLines) }}
          />
        </div>
      )
    }).filter(Boolean)
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

  // Function to generate AI strategy using Gemini
  const generateInfluencerStrategy = async (influencer: any, campaign?: CampaignData) => {
    const influencerKey = `${influencer.username}_strategy`
    
    // Clear any existing errors for this influencer
    setStrategyErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[influencerKey]
      return newErrors
    })

    // Set loading state
    setIsGeneratingStrategy(prev => ({ ...prev, [influencerKey]: true }))

    try {
      console.log('🤖 Generating AI strategy for:', influencer.username)
      console.log('📦 Campaign data being sent:', campaign)
      
      // Prepare campaign brief data if available
      const campaignBrief = campaign ? {
        brand_name: campaign.brand_name,
        product_name: campaign.product_name,
        overview: campaign.overview,
        usp: campaign.usp,
        industry: campaign.industry,
        budget: campaign.budget,
        target_audience: campaign.audience_preference,
        content_requirements: campaign.output?.content_types?.join(', '),
        persona: campaign.influencer_persona,
        marketing_objective: campaign.marketing_objective?.join(', ')
      } : undefined

      console.log('📋 Campaign brief prepared:', campaignBrief)

      // Call Gemini AI service
      const strategy = await geminiAIService.generateInfluencerStrategy(influencer, campaignBrief)
      
      // Store the generated strategy
      setInfluencerStrategies(prev => ({
        ...prev,
        [influencerKey]: strategy
      }))

      console.log('✅ Strategy generated successfully for:', influencer.username)
      return strategy
    } catch (error) {
      console.error('❌ Error generating strategy:', error)
      
      // Set error state instead of fallback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setStrategyErrors(prev => ({
        ...prev,
        [influencerKey]: `Failed to generate strategy: ${errorMessage}`
      }))
      
      return null
    } finally {
      setIsGeneratingStrategy(prev => ({ ...prev, [influencerKey]: false }))
    }
  }

  // Helper function to convert CampaignData to CampaignBrief for Gemini API
  const convertToCampaignBrief = (campaign?: CampaignData) => {
    if (!campaign) return undefined
    
    return {
      brand_name: campaign.brand_name,
      product_name: campaign.product_name,
      overview: campaign.overview,
      usp: campaign.usp,
      industry: campaign.industry,
      budget: campaign.budget,
      target_audience: campaign.audience_preference,
      content_requirements: campaign.output?.content_types?.join(', '),
      persona: campaign.influencer_persona,
      marketing_objective: Array.isArray(campaign.marketing_objective) 
        ? campaign.marketing_objective.join(', ') 
        : campaign.marketing_objective
    }
  }

  // Function to generate AI insights for influencer data sections
  const generateInfluencerInsights = async (influencer: any, campaign?: CampaignData, sectionType: 'comment' | 'caption' | 'score' | 'performance' = 'comment') => {
    const insightKey = `${influencer.username}_${sectionType}_insights`
    
    // Clear any existing errors for this section
    setInsightsErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[insightKey]
      return newErrors
    })

    // Set loading state
    setIsGeneratingInsights(prev => ({ ...prev, [insightKey]: true }))

    try {
      console.log(`🧠 Generating AI insights for ${sectionType} section:`, influencer.username)
      console.log(`📋 Influencer data available:`, {
        caption_behavior_insights: !!influencer.caption_behavior_insights,
        scores: !!influencer.scores,
        performance_metrics: !!influencer.performance_metrics,
        insights: !!influencer.insights
      })
      
      // Convert campaign data to appropriate format
      const campaignBrief = convertToCampaignBrief(campaign)
      
      let insights = null
      
      switch (sectionType) {
        case 'comment':
          if (influencer.caption_behavior_insights) {
            console.log(`📤 Sending caption_behavior_insights to Gemini for comment analysis`)
            insights = await geminiAIService.generateCommentAnalysisInsights(influencer.caption_behavior_insights, campaignBrief)
          } else if (influencer.insights) {
            console.log(`📤 Fallback: Using general insights for comment analysis`)
            insights = await geminiAIService.generateCommentAnalysisInsights(influencer.insights, campaignBrief)
          } else {
            throw new Error('No caption behavior or general insights available for this influencer')
          }
          break
        case 'caption':
          if (influencer.caption_behavior_insights) {
            console.log(`📤 Sending caption_behavior_insights to Gemini for caption analysis`)
            insights = await geminiAIService.generateCaptionAnalysisInsights(influencer.caption_behavior_insights, campaignBrief)
          } else if (influencer.insights) {
            console.log(`📤 Fallback: Using general insights for caption analysis`)
            insights = await geminiAIService.generateCaptionAnalysisInsights(influencer.insights, campaignBrief)
          } else {
            throw new Error('No caption behavior or general insights available for this influencer')
          }
          break
        case 'score':
          if (influencer.scores) {
            console.log(`📤 Sending scores to Gemini for score analysis`)
            insights = await geminiAIService.generateScoreBreakdownInsights(influencer, campaignBrief)
          } else {
            throw new Error('Score data not available for this influencer')
          }
          break
        case 'performance':
          if (influencer.performance_metrics) {
            console.log(`📤 Sending performance_metrics to Gemini for performance analysis`)
            insights = await geminiAIService.generatePerformanceInsights(influencer, campaignBrief)
          } else {
            throw new Error('Performance metrics not available for this influencer')
          }
          break
      }
      
      if (insights) {
        // Store the generated insights
        setInfluencerInsights(prev => ({
          ...prev,
          [insightKey]: insights
        }))

        console.log(`✅ ${sectionType} insights generated successfully for:`, influencer.username)
        return insights
      } else {
        throw new Error(`Failed to generate ${sectionType} insights from Gemini AI`)
      }
    } catch (error) {
      console.error(`❌ Error generating ${sectionType} insights:`, error)
      
      // Set error state
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setInsightsErrors(prev => ({
        ...prev,
        [insightKey]: `Failed to generate ${sectionType} insights: ${errorMessage}`
      }))
      
      return null
    } finally {
      setIsGeneratingInsights(prev => ({ ...prev, [insightKey]: false }))
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
      
      // 🚀 AUTO-GENERATE STRATEGIES FOR ALL INFLUENCERS
      console.log('🤖 Auto-generating strategies for all recommended influencers...')
      toast.loading('🧠 Generating AI marketing strategies for each influencer...', { duration: 3000 })
      
      // Generate strategies for all influencers in parallel
      const strategyPromises = apiResponse.recommendations.map(async (influencer: any, index: number) => {
        try {
          console.log(`🎯 Generating strategy for influencer ${index + 1}/${apiResponse.recommendations.length}: @${influencer.username}`)
          const strategy = await generateInfluencerStrategy(influencer, campaign)
          return { influencer: influencer.username, strategy, success: true }
        } catch (error) {
          console.error(`❌ Failed to generate strategy for @${influencer.username}:`, error)
          return { 
            influencer: influencer.username, 
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false 
          }
        }
      })
      
      // Wait for all strategies to complete
      const strategyResults = await Promise.allSettled(strategyPromises)
      
      // Count successful strategy generations
      const successfulStrategies = strategyResults.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length
      
      console.log(`✅ Strategy generation completed: ${successfulStrategies}/${apiResponse.recommendations.length} successful`)
      
      if (successfulStrategies > 0) {
        toast.success(`Generated ${successfulStrategies} AI marketing strategies!`)
      } else {
        toast.error('Failed to generate strategies. You can try generating them individually.')
      }

      // 🧠 AUTO-GENERATE INSIGHTS FOR ALL INFLUENCERS
      console.log('💡 Auto-generating AI insights for all recommended influencers...')
      toast.loading('🔍 Generating AI insights for each section...', { duration: 4000 })
      
      // Generate insights for all influencers and all sections in parallel
      const insightPromises = apiResponse.recommendations.flatMap((influencer: any) => [
        generateInfluencerInsights(influencer, campaign, 'comment'),
        generateInfluencerInsights(influencer, campaign, 'caption'),
        generateInfluencerInsights(influencer, campaign, 'score'),
        generateInfluencerInsights(influencer, campaign, 'performance')
      ])
      
      // Wait for all insights to complete
      const insightResults = await Promise.allSettled(insightPromises)
      
      // Count successful insight generations
      const successfulInsights = insightResults.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length
      
      console.log(`✅ Insights generation completed: ${successfulInsights}/${insightPromises.length} successful`)
      
      if (successfulInsights > 0) {
        toast.success(`Generated ${successfulInsights} AI insights across all sections!`)
      }
      
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
                        Dapatkan rekomendasi influencer terbaik dan strategi marketing AI untuk campaign ini
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
            {/* {aiData.brief && (
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
            )} */}

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
                      <div className="text-center p-3 bg-muted/30 border border-border rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {(influencer.performance_metrics?.engagement_rate * 100 || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Engagement Rate</div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/30 border border-border rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {(influencer.performance_metrics?.authenticity_score * 100 || 0).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Authenticity</div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/30 border border-border rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {(influencer.performance_metrics?.reach_potential * 100 || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Reach Potential</div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/30 border border-border rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {influencer.optimal_content_mix?.total_impact?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Projected Impact</div>
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

                    {/* Collapsible Detailed Analysis */}
                    <div className="border-t pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const influencerKey = `${influencer.username}_${index}`
                          setExpandedInfluencerTabs(prev => ({
                            ...prev,
                            [influencerKey]: !prev[influencerKey]
                          }))
                        }}
                        className="w-full justify-between p-3 h-auto bg-muted/20 hover:bg-muted/40"
                      >
                        <span className="flex items-center text-sm font-medium">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Detailed Analysis & Insights
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {expandedInfluencerTabs[`${influencer.username}_${index}`] ? 'Hide Details' : 'Show Details'}
                        </span>
                      </Button>

                      {expandedInfluencerTabs[`${influencer.username}_${index}`] && (
                        <div className="mt-4">
                          <Tabs 
                            defaultValue={
                              influencerStrategies[`${influencer.username}_strategy`] ? "strategy" : "insights"
                            } 
                            className="w-full"
                          >
                            <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                              <TabsTrigger value="insights" className="text-xs data-[state=active]:bg-card">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Social Media Analysis
                              </TabsTrigger>
                              <TabsTrigger value="scores" className="text-xs data-[state=active]:bg-card">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Score Breakdown
                              </TabsTrigger>
                              <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-card">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Performance
                              </TabsTrigger>
                              <TabsTrigger value="strategy" className="text-xs data-[state=active]:bg-card">
                                <Target className="w-3 h-3 mr-1" />
                                Strategy
                                {(() => {
                                  const influencerKey = `${influencer.username}_strategy`
                                  const strategy = influencerStrategies[influencerKey]
                                  const isGenerating = isGeneratingStrategy[influencerKey]
                                  const error = strategyErrors[influencerKey]
                                  
                                  if (strategy) {
                                    return <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
                                  } else if (error) {
                                    return <div className="w-2 h-2 bg-red-500 rounded-full ml-1" />
                                  } else if (isGenerating) {
                                    return <div className="w-2 h-2 bg-yellow-500 rounded-full ml-1 animate-pulse" />
                                  }
                                  return null
                                })()}
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="insights" className="mt-4 p-4 bg-muted/20 rounded-lg">
                              <div className="space-y-4">
                                <h5 className="font-semibold text-sm flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Influencer Social Media Analysis
                                </h5>
                                {influencer.insights ? (
                                  (() => {
                                    const parsed = parseCaptionBehavior(influencer.insights)
                                    if (parsed) {
                                      return (
                                        <div className="space-y-4">
                                          {/* Comment Examples by Type - Main Section */}
                                          {(parsed.relatableExamples || parsed.viralExamples || parsed.supportiveExamples) && (
                                            <div className="bg-muted/30 rounded-lg p-5 border border-border">
                                              <h6 className="font-bold text-lg mb-4 flex items-center text-foreground">
                                                <Quote className="w-5 h-5 mr-2" />
                                                Comment Behavior Analysis
                                           
                                              </h6>

                                              <div className="space-y-4">
                                                {/* Relatable Engagement */}
                                                {parsed.relatableExamples && parsed.relatableExamples.length > 0 && (
                                                  <div className="bg-card rounded-lg p-4 border-l-4 border-primary/20 shadow-sm">
                                                    <div className="font-semibold text-sm mb-3 text-foreground flex items-center">
                                                      <Heart className="w-4 h-4 mr-2 text-muted-foreground" />
                                                      Relatable Engagement ({parsed.relatableExamples.length} examples)
                                                    </div>
                                                    <div className="space-y-2">
                                                      {parsed.relatableExamples.slice(0, 2).map((comment: string, index: number) => (
                                                        <div key={index} className="bg-muted/20 p-3 rounded-lg border border-border">
                                                          <p className="text-sm text-muted-foreground italic font-medium">
                                                            "{comment}"
                                                          </p>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Social Virality */}
                                                {parsed.viralExamples && parsed.viralExamples.length > 0 && (
                                                  <div className="bg-card rounded-lg p-4 border-l-4 border-primary/20 shadow-sm">
                                                    <div className="font-semibold text-sm mb-3 text-foreground flex items-center">
                                                      <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                                                      Social Virality ({parsed.viralExamples.length} examples)
                                                    </div>
                                                    <div className="space-y-2">
                                                      {parsed.viralExamples.slice(0, 2).map((comment: string, index: number) => (
                                                        <div key={index} className="bg-muted/20 p-3 rounded-lg border border-border">
                                                          <p className="text-sm text-muted-foreground italic font-medium">
                                                            "{comment}"
                                                          </p>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Supportive Sentiment */}
                                                {parsed.supportiveExamples && parsed.supportiveExamples.length > 0 && (
                                                  <div className="bg-card rounded-lg p-4 border-l-4 border-primary/20 shadow-sm">
                                                    <div className="font-semibold text-sm mb-3 text-foreground flex items-center">
                                                      <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                                                      Supportive Sentiment ({parsed.supportiveExamples.length} examples)
                                                    </div>
                                                    <div className="space-y-2">
                                                      {parsed.supportiveExamples.slice(0, 2).map((comment: string, index: number) => (
                                                        <div key={index} className="bg-muted/20 p-3 rounded-lg border border-border">
                                                          <p className="text-sm text-muted-foreground italic font-medium">
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

                                          {/* AI Insights for Comment Behavior */}
                                          {(() => {
                                            const commentInsightKey = `${influencer.username}_comment_insights`
                                            const commentInsight = influencerInsights[commentInsightKey]
                                            const isGeneratingCommentInsight = isGeneratingInsights[commentInsightKey]
                                            const commentInsightError = insightsErrors[commentInsightKey]

                                            return (
                                              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                                <div className="flex items-center justify-between mb-3">
                                                  <h6 className="font-semibold text-sm flex items-center text-foreground">
                                                    <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                                                    AI Insights - Comment Behavior
                                                  </h6>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => generateInfluencerInsights(influencer, campaignDetail, 'comment')}
                                                    disabled={isGeneratingCommentInsight}
                                                    className="h-6 px-2 text-xs hover:bg-muted/50"
                                                  >
                                                    {isGeneratingCommentInsight ? (
                                                      <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                      <RefreshCw className="w-3 h-3" />
                                                    )}
                                                  </Button>
                                                </div>
                                                
                                                {isGeneratingCommentInsight ? (
                                                  <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Generating AI insights...</span>
                                                  </div>
                                                ) : commentInsight ? (
                                                  <div className="bg-card rounded p-3 border border-border">
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                      {commentInsight}
                                                    </p>
                                                  </div>
                                                ) : commentInsightError ? (
                                                  <div className="bg-muted/20 border border-border rounded p-3">
                                                    <p className="text-sm text-muted-foreground">
                                                      {commentInsightError}
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <div className="bg-muted/20 border border-border rounded p-3">
                                                    <p className="text-sm text-muted-foreground">
                                                      Click refresh to generate AI insights for comment behavior analysis
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })()}

                                          {/* Fallback - General Comment Examples if no categorized data */}
                                          {(!parsed.relatableExamples && !parsed.viralExamples && !parsed.supportiveExamples) && 
                                           parsed.allCommentExamples && parsed.allCommentExamples.length > 0 && (
                                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                              <h6 className="font-semibold text-sm mb-3 flex items-center">
                                                <Quote className="w-4 h-4 mr-2 text-muted-foreground" />
                                                Representative Audience Comments
                                              </h6>
                                              <div className="space-y-3">
                                                {parsed.allCommentExamples.map((comment: string, index: number) => (
                                                  <div key={index} className="bg-card p-3 rounded-lg border-l-2 border-primary/20">
                                                    <p className="text-sm text-muted-foreground italic font-medium">
                                                      "{comment}"
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Comment Quality Section - Secondary Priority */}
                                          {parsed.commentQuality && (
                                            <div className="bg-card rounded-lg p-4 border border-border">
                                              <h6 className="font-medium text-sm mb-3">
                                                Comment Quality Analysis
                                              </h6>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                                <div className="text-center p-2 bg-muted/20 rounded">
                                                  <div className="text-lg font-bold text-foreground">{parsed.commentQuality.total}</div>
                                                  <div className="text-xs text-muted-foreground">Total Comments</div>
                                                </div>
                                                <div className="text-center p-2 bg-muted/20 rounded">
                                                  <div className="text-lg font-bold text-foreground">{parsed.commentQuality.supportive}%</div>
                                                  <div className="text-xs text-muted-foreground">Supportive</div>
                                                </div>
                                                <div className="text-center p-2 bg-muted/20 rounded">
                                                  <div className="text-lg font-bold text-foreground">{parsed.commentQuality.passive}%</div>
                                                  <div className="text-xs text-muted-foreground">Passive</div>
                                                </div>
                                                <div className="text-center p-2 bg-muted/20 rounded">
                                                  <div className="text-lg font-bold text-foreground">{parsed.commentQuality.highValue}%</div>
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

                                          {/* Caption Analysis Section */}
                                          <div className="bg-muted/30 rounded-lg p-5 border border-border">
                                            <h6 className="font-bold text-lg mb-4 flex items-center text-foreground">
                                              <Edit3 className="w-5 h-5 mr-2" />
                                              Caption Analysis
                                            </h6>
                                            
                                            {/* Caption Behavior Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* CTA Usage */}
                                            {parsed.cta && (
                                              <div className="bg-card rounded-lg p-4 border border-border">
                                                <h6 className="font-medium text-sm mb-3">
                                                  Call-to-Action Usage
                                                </h6>
                                                <div className="text-center mb-3">
                                                  <div className="text-2xl font-bold text-foreground">
                                                    {parsed.cta.used}/{parsed.cta.total}
                                                  </div>
                                                  <div className="text-sm text-muted-foreground">
                                                    {parsed.cta.percentage}% of captions
                                                  </div>
                                                </div>
                                                <Progress value={parseFloat(parsed.cta.percentage)} className="h-2" />
                                              </div>
                                            )}

                                            {/* Tone of Voice */}
                                            {parsed.tone && (
                                              <div className="bg-card rounded-lg p-4 border border-border">
                                                <h6 className="font-medium text-sm mb-3">
                                                  Tone of Voice
                                                </h6>
                                                <div className="text-center">
                                                  <div className="text-lg font-semibold text-foreground capitalize">
                                                    {parsed.tone}
                                                  </div>
                                                  <div className="text-sm text-muted-foreground">Dominant Style</div>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Engagement Distribution */}
                                          {parsed.labels && Object.keys(parsed.labels).length > 0 && (
                                            <div className="bg-card rounded-lg p-4 border border-border">
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
                                                            className="bg-primary h-2 rounded-full" 
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
                                            <div className="bg-card rounded-lg p-4 border border-border">
                                              <h6 className="font-medium text-sm mb-2">
                                                Engagement Strategy
                                              </h6>
                                              <div className="text-sm text-muted-foreground">
                                                <span className="font-semibold text-foreground">{parsed.engagementCaptions}</span> captions 
                                                actively invite audience interaction, showing good two-way engagement efforts.
                                              </div>
                                            </div>
                                          )}
                                          </div>

                                          {/* AI Insights for Caption Analysis */}
                                          {(() => {
                                            const captionInsightKey = `${influencer.username}_caption_insights`
                                            const captionInsight = influencerInsights[captionInsightKey]
                                            const isGeneratingCaptionInsight = isGeneratingInsights[captionInsightKey]
                                            const captionInsightError = insightsErrors[captionInsightKey]

                                            return (
                                              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                                <div className="flex items-center justify-between mb-3">
                                                  <h6 className="font-semibold text-sm flex items-center text-foreground">
                                                    <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                                                    AI Insights - Caption Analysis
                                                  </h6>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => generateInfluencerInsights(influencer, campaignDetail, 'caption')}
                                                    disabled={isGeneratingCaptionInsight}
                                                    className="h-6 px-2 text-xs hover:bg-muted/50"
                                                  >
                                                    {isGeneratingCaptionInsight ? (
                                                      <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                      <RefreshCw className="w-3 h-3" />
                                                    )}
                                                  </Button>
                                                </div>
                                                
                                                {isGeneratingCaptionInsight ? (
                                                  <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Generating AI insights...</span>
                                                  </div>
                                                ) : captionInsight ? (
                                                  <div className="bg-card rounded p-3 border border-border">
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                      {captionInsight}
                                                    </p>
                                                  </div>
                                                ) : captionInsightError ? (
                                                  <div className="bg-muted/20 border border-border rounded p-3">
                                                    <p className="text-sm text-muted-foreground">
                                                      {captionInsightError}
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <div className="bg-muted/20 border border-border rounded p-3">
                                                    <p className="text-sm text-muted-foreground">
                                                      Click refresh to generate AI insights for caption analysis
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      )
                                    } else {
                                      // Fallback: show original insights in formatted way
                                      return (
                                        <div className="text-sm text-muted-foreground leading-relaxed space-y-3 max-h-96 overflow-y-auto">
                                          <div className="whitespace-pre-line bg-card p-4 rounded border border-border">
                                            {influencer.insights}
                                          </div>
                                        </div>
                                      )
                                    }
                                  })()
                                ) : (
                                  <div className="text-center py-6 text-muted-foreground bg-card rounded border border-border">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                                    <p className="text-sm">No caption behavior analysis available for this influencer</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="scores" className="mt-4 p-4 bg-muted/20 rounded-lg">
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
                                  <div className="text-center py-6 text-muted-foreground bg-card rounded border border-border">
                                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                                    <p className="text-sm">Score breakdown not available</p>
                                  </div>
                                )}

                                {/* AI Insights for Score Breakdown */}
                                {(() => {
                                  const scoreInsightKey = `${influencer.username}_score_insights`
                                  const scoreInsight = influencerInsights[scoreInsightKey]
                                  const isGeneratingScoreInsight = isGeneratingInsights[scoreInsightKey]
                                  const scoreInsightError = insightsErrors[scoreInsightKey]

                                  return (
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                      <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-semibold text-sm flex items-center text-foreground">
                                          <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                                          AI Insights - Score Analysis
                                        </h6>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => generateInfluencerInsights(influencer, campaignDetail, 'score')}
                                          disabled={isGeneratingScoreInsight}
                                          className="h-6 px-2 text-xs hover:bg-muted/50"
                                        >
                                          {isGeneratingScoreInsight ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <RefreshCw className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                      
                                      {isGeneratingScoreInsight ? (
                                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>Generating AI insights...</span>
                                        </div>
                                      ) : scoreInsight ? (
                                        <div className="bg-card rounded p-3 border border-border">
                                          <p className="text-sm text-foreground leading-relaxed">
                                            {scoreInsight}
                                          </p>
                                        </div>
                                      ) : scoreInsightError ? (
                                        <div className="bg-muted/20 border border-border rounded p-3">
                                          <p className="text-sm text-muted-foreground">
                                            {scoreInsightError}
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="bg-muted/20 border border-border rounded p-3">
                                          <p className="text-sm text-muted-foreground">
                                            Click refresh to generate AI insights for score breakdown
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="performance" className="mt-4 p-4 bg-muted/20 rounded-lg">
                              <div className="space-y-4">
                                <h5 className="font-semibold text-sm">Performance Metrics</h5>
                                {influencer.performance_metrics ? (
                                  <div className="grid grid-cols-1 gap-3">
                                    {influencer.performance_metrics.engagement_rate && (
                                      <div className="flex items-center justify-between p-3 bg-card rounded border border-border">
                                        <span className="text-sm">Engagement Rate</span>
                                        <span className="font-semibold text-foreground">
                                          {(influencer.performance_metrics.engagement_rate * 100).toFixed(2)}%
                                        </span>
                                      </div>
                                    )}
                                    {influencer.performance_metrics.authenticity_score && (
                                      <div className="flex items-center justify-between p-3 bg-card rounded border border-border">
                                        <span className="text-sm">Authenticity Score</span>
                                        <span className="font-semibold text-foreground">
                                          {(influencer.performance_metrics.authenticity_score * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    )}
                                    {influencer.performance_metrics.reach_potential && (
                                      <div className="flex items-center justify-between p-3 bg-card rounded border border-border">
                                        <span className="text-sm">Reach Potential</span>
                                        <span className="font-semibold text-foreground">
                                          {(influencer.performance_metrics.reach_potential * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-muted-foreground bg-card rounded border border-border">
                                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                                    <p className="text-sm">No performance metrics available</p>
                                  </div>
                                )}

                                {/* AI Insights for Performance */}
                                {(() => {
                                  const performanceInsightKey = `${influencer.username}_performance_insights`
                                  const performanceInsight = influencerInsights[performanceInsightKey]
                                  const isGeneratingPerformanceInsight = isGeneratingInsights[performanceInsightKey]
                                  const performanceInsightError = insightsErrors[performanceInsightKey]

                                  return (
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                      <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-semibold text-sm flex items-center text-foreground">
                                          <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                                          AI Insights - Performance Analysis
                                        </h6>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => generateInfluencerInsights(influencer, campaignDetail, 'performance')}
                                          disabled={isGeneratingPerformanceInsight}
                                          className="h-6 px-2 text-xs hover:bg-muted/50"
                                        >
                                          {isGeneratingPerformanceInsight ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <RefreshCw className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                      
                                      {isGeneratingPerformanceInsight ? (
                                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>Generating AI insights...</span>
                                        </div>
                                      ) : performanceInsight ? (
                                        <div className="bg-card rounded p-3 border border-border">
                                          <p className="text-sm text-foreground leading-relaxed">
                                            {performanceInsight}
                                          </p>
                                        </div>
                                      ) : performanceInsightError ? (
                                        <div className="bg-muted/20 border border-border rounded p-3">
                                          <p className="text-sm text-muted-foreground">
                                            {performanceInsightError}
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="bg-muted/20 border border-border rounded p-3">
                                          <p className="text-sm text-muted-foreground">
                                            Click refresh to generate AI insights for performance analysis
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="strategy" className="mt-4 p-4 bg-muted/20 rounded-lg">
                              <div className="space-y-4">
                                {/* <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-sm flex items-center">
                                    <Target className="w-4 h-4 mr-2" />
                                    AI-Generated Marketing Strategy
                                  </h5>
                                  <Badge variant="outline" className="text-xs">
                                    Powered by Gemini AI
                                  </Badge>
                                </div> */}
                                
                                {(() => {
                                  const influencerKey = `${influencer.username}_strategy`
                                  const strategy = influencerStrategies[influencerKey]
                                  const isGenerating = isGeneratingStrategy[influencerKey]
                                  const error = strategyErrors[influencerKey]
                                  
                                  if (strategy) {
                                    const formattedSections = formatStrategyText(strategy)
                                    
                                    return (
                                      <div className="space-y-4">
                                        {/* Strategy Overview Header - Minimal design */}
                                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                              <Target className="w-4 h-4 text-muted-foreground" />
                                              <span className="font-semibold text-sm text-foreground">Marketing Strategy</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                                              <span className="text-xs text-muted-foreground font-medium">Complete</span>
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            AI-generated strategy based on influencer analysis and campaign data
                                          </p>
                                          
                                          {/* Strategy Sections Progress - Simplified */}
                                          <div className="mt-3 pt-3 border-t border-border">
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">Sections:</span>
                                              <span className="text-foreground font-medium">
                                                {formattedSections ? formattedSections.length : 0}/4
                                              </span>
                                            </div>
                                            <div className="mt-1 w-full bg-muted rounded-full h-1">
                                              <div 
                                                className="bg-primary h-1 rounded-full transition-all duration-300" 
                                                style={{ width: `${formattedSections ? (formattedSections.length / 4) * 100 : 0}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Formatted Strategy Sections */}
                                        <div className="space-y-3">
                                          {formattedSections && formattedSections.length > 0 ? (
                                            formattedSections
                                          ) : (
                                            // Fallback for unformatted text
                                            <div className="bg-card rounded-lg p-4 border border-border">
                                              <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
                                                {strategy}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Action Buttons - Simplified */}
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <span>Generated by AI</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                navigator.clipboard.writeText(strategy)
                                                toast.success('Strategy copied!')
                                              }}
                                              className="flex items-center space-x-1 text-xs"
                                            >
                                              <Copy className="w-3 h-3" />
                                              <span>Copy</span>
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                // Clear existing strategy to trigger regeneration
                                                setInfluencerStrategies(prev => {
                                                  const newStrategies = { ...prev }
                                                  delete newStrategies[influencerKey]
                                                  return newStrategies
                                                })
                                                // Clear any previous errors
                                                setStrategyErrors(prev => {
                                                  const newErrors = { ...prev }
                                                  delete newErrors[influencerKey]
                                                  return newErrors
                                                })
                                                // Generate new strategy
                                                generateInfluencerStrategy(influencer, campaignDetail)
                                              }}
                                              disabled={isGenerating}
                                              className="flex items-center space-x-1"
                                            >
                                              {isGenerating ? (
                                                <>
                                                  <Loader2 className="w-3 h-3 animate-spin" />
                                                  <span>Generating...</span>
                                                </>
                                              ) : (
                                                <>
                                                  <RefreshCw className="w-3 h-3" />
                                                  <span>Regenerate</span>
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  } else if (error) {
                                    return (
                                      <div className="text-center py-6 space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                                          <AlertTriangle className="w-8 h-8 text-destructive" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm mb-2 text-destructive">Strategy Generation Failed</p>
                                          <p className="text-xs text-muted-foreground mb-4">
                                            {error}
                                          </p>
                                        </div>
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            // Clear error state
                                            setStrategyErrors(prev => {
                                              const newErrors = { ...prev }
                                              delete newErrors[influencerKey]
                                              return newErrors
                                            })
                                            // Retry generation
                                            generateInfluencerStrategy(influencer, campaignDetail)
                                          }}
                                          disabled={isGenerating}
                                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                                        >
                                          {isGenerating ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                              Retrying...
                                            </>
                                          ) : (
                                            <>
                                              <RefreshCw className="w-4 h-4 mr-2" />
                                              Retry Generation
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    )
                                  } else if (isGenerating) {
                                    return (
                                      <div className="text-center py-8 space-y-3">
                                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                                        <div>
                                          <p className="font-medium text-sm">Generating AI Strategy...</p>
                                          <p className="text-xs text-muted-foreground">
                                            Analyzing influencer data and campaign context
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  } else {
                                    return (
                                      <div className="text-center py-6 space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                                          <Brain className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm mb-2">AI Strategy Not Generated</p>
                                          <p className="text-xs text-muted-foreground mb-4">
                                            Get personalized marketing strategy based on comprehensive influencer analysis
                                          </p>
                                        </div>
                                        <Button
                                          onClick={() => generateInfluencerStrategy(influencer, campaignDetail)}
                                          disabled={isGenerating}
                                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
                                        >
                                          {isGenerating ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                              Generating...
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="w-4 h-4 mr-2" />
                                              Generate AI Strategy
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    )
                                  }
                                })()}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>

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
          {/* <div className="mb-6">
            <APIStatusChecker />
          </div> */}

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
