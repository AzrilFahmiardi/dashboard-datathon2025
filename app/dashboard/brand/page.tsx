"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  MessageSquare,
  BarChart3,
  Zap,
  Crown,
  Star,
  RefreshCw,
  RotateCcw,
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
  X,
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
  
  // State for floating chat
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [templateQuestions, setTemplateQuestions] = useState<Array<{question: string, icon: string, color: string}>>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templateQuestionsError, setTemplateQuestionsError] = useState<string | null>(null)

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

  // Load AI insights and strategies when campaign details are shown
  useEffect(() => {
    if (selectedCampaignDetail) {
      loadAIDataForCampaign(selectedCampaignDetail)
      // Reset template questions when campaign changes
      setTemplateQuestions([])
      setChatMessages([]) // Also reset chat when switching campaigns
    }
  }, [selectedCampaignDetail])

  // Generate template questions when chat modal opens and data is available
  useEffect(() => {
    if (isChatModalOpen && selectedCampaignDetail && templateQuestions.length === 0) {
      const campaignDetail = campaigns.find(c => c.brief_id === selectedCampaignDetail)
      if (campaignDetail) {
        generateTemplateQuestions(campaignDetail, campaignDetail.recommendation_data)
      }
    }
  }, [isChatModalOpen, selectedCampaignDetail, campaigns, templateQuestions.length])

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

  // Load AI insights and strategies from Firebase for a specific campaign
  const loadAIDataForCampaign = async (briefId: string) => {
    try {
      console.log(`📥 Loading AI data from Firebase for brief: ${briefId}`)
      
      // Load insights and strategies from Firebase
      const [insights, strategies] = await Promise.all([
        firebaseCampaignService.getAIInsights(briefId),
        firebaseCampaignService.getAIStrategies(briefId)
      ])

      // Convert Firebase insights to local state format
      const formattedInsights: {[key: string]: any} = {}
      Object.entries(insights).forEach(([key, value]: [string, any]) => {
        if (value?.content) {
          formattedInsights[key] = value.content
        }
      })

      // Convert Firebase strategies to local state format
      const formattedStrategies: {[key: string]: string} = {}
      Object.entries(strategies).forEach(([key, value]: [string, any]) => {
        if (value?.content) {
          formattedStrategies[key] = value.content
        }
      })

      // Update local states
      setInfluencerInsights(prev => ({ ...prev, ...formattedInsights }))
      setInfluencerStrategies(prev => ({ ...prev, ...formattedStrategies }))

      console.log(`✅ Loaded ${Object.keys(formattedInsights).length} insights and ${Object.keys(formattedStrategies).length} strategies from Firebase`)
    } catch (error) {
      console.warn('⚠️ Failed to load AI data from Firebase:', error)
      // Don't show error to user - this is non-critical
    }
  }

  // Handler untuk menerima campaign baru dari modal
  const handleCampaignCreated = async (campaign: CampaignData) => {
    // Add new campaign to state
    setCampaigns(prev => [campaign, ...prev])
    toast.success('Campaign berhasil dibuat!')
  }

  // Helper function to parse and format strategy text - simplified version with raw content
  const formatStrategyText = (strategy: string) => {
    if (!strategy) return null

    // Split strategy into sections based on emoji headers
    const sections = strategy.split(/(?=🎯|📈|💡|⚠️|💰)/).filter(section => section.trim())

    // Map emojis to Lucide icons
    const getIconForSection = (emoji: string) => {
      switch (emoji) {
        case '🎯': return <Target className="w-4 h-4 text-blue-500" />
        case '📈': return <TrendingUp className="w-4 h-4 text-green-500" />
        case '💡': return <Zap className="w-4 h-4 text-yellow-500" />
        case '⚠️': return <AlertTriangle className="w-4 h-4 text-orange-500" />
        case '💰': return <DollarSign className="w-4 h-4 text-emerald-500" />
        default: return <Sparkles className="w-4 h-4 text-purple-500" />
      }
    }

    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) return null

      const headerLine = lines[0]
      const contentLines = lines.slice(1).join('\n')

      let emoji = ''
      let title = ''

      // First try to match format with bold markers: 🎯 **Title**:
      const boldMatch = headerLine.match(/^(🎯|📈|💡|⚠️|💰)\s*\*\*(.+?)\*\*:?\s*$/)
      if (boldMatch) {
        emoji = boldMatch[1]
        title = boldMatch[2].trim()
      } else {
        // Fallback: try to extract emoji and text without bold markers: 🎯 Title:
        const simpleMatch = headerLine.match(/^(🎯|📈|💡|⚠️|💰)\s*(.+?):\s*$/)
        if (simpleMatch) {
          emoji = simpleMatch[1]
          title = simpleMatch[2].trim().replace(/\*\*/g, '') // Remove any bold markers
        } else {
          // Last fallback: extract everything after emoji
          const fallbackMatch = headerLine.match(/^(🎯|📈|💡|⚠️|💰)\s*(.+)$/)
          if (fallbackMatch) {
            emoji = fallbackMatch[1]
            title = fallbackMatch[2].trim().replace(/\*\*/g, '').replace(/:$/, '') // Remove bold markers and trailing colon
          } else {
            return null
          }
        }
      }

      const IconComponent = getIconForSection(emoji)

      return (
        <div key={index} className="bg-muted/30 border border-muted rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {IconComponent}
              <h6 className="font-bold text-sm text-foreground">{title}</h6>
            </div>
            <button 
              className="p-1 hover:bg-muted/50 rounded"
              title="Copy section"
              onClick={() => {
                navigator.clipboard.writeText(`${title}\n${contentLines}`)
                toast.success('Strategy section copied!')
              }}
            >
              <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {contentLines}
          </div>
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
      
      // Prepare campaign brief data focused on content strategy, not quantities
      const campaignBrief = campaign ? {
        brand_name: campaign.brand_name,
        product_name: campaign.product_name,
        overview: campaign.overview,
        usp: campaign.usp,
        industry: campaign.industry,
        budget: campaign.budget,
        target_audience: campaign.audience_preference,
        content_types: campaign.output?.content_types, // Send as array for content strategy
        persona: campaign.influencer_persona,
        marketing_objective: campaign.marketing_objective?.join(', ')
      } : undefined

      console.log('📋 Campaign brief prepared:', campaignBrief)

      // Call Gemini AI service
      const strategy = await geminiAIService.generateInfluencerStrategy(influencer, campaignBrief)
      
      if (strategy && strategy.trim()) {
        // Store strategy in local state first
        setInfluencerStrategies(prev => ({
          ...prev,
          [influencerKey]: strategy
        }))

        // Save to Firebase if campaign is available
        if (campaign?.brief_id) {
          try {
            await firebaseCampaignService.saveInfluencerStrategy(
              campaign.brief_id,
              influencer.username,
              strategy
            )
            console.log(`💾 Strategy saved to Firebase for:`, influencer.username)
          } catch (firebaseError) {
            console.warn(`⚠️ Failed to save strategy to Firebase:`, firebaseError)
            // Continue execution - local state still has the data
          }
        }

        console.log('✅ Strategy generated successfully for:', influencer.username)
        toast.success('Marketing strategy generated successfully!')
        return strategy
      } else {
        throw new Error('Empty or invalid strategy received from Gemini AI')
      }
    } catch (error) {
      console.error('❌ Error generating strategy:', error)
      
      // Set error state with fallback message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const fallbackMessage = 'Unable to generate strategy. Please try again later.'
      
      setStrategyErrors(prev => ({
        ...prev,
        [influencerKey]: errorMessage.includes('API') ? errorMessage : fallbackMessage
      }))

      // Store empty strategy to avoid repeated API calls for known failures
      setInfluencerStrategies(prev => ({
        ...prev,
        [influencerKey]: '' // Empty string to indicate failed generation
      }))
      
      toast.error('Failed to generate marketing strategy')
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
      content_types: campaign.output?.content_types, // Send as array for content strategy
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
      
      let insights: string | null = null
      
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
      
      if (insights && insights.trim()) {
        // Store insights in local state first
        setInfluencerInsights(prev => ({
          ...prev,
          [insightKey]: insights
        }))

        // Save to Firebase if campaign is available
        if (campaign?.brief_id) {
          try {
            await firebaseCampaignService.saveInfluencerInsights(
              campaign.brief_id,
              influencer.username,
              sectionType,
              insights
            )
            console.log(`💾 ${sectionType} insights saved to Firebase for:`, influencer.username)
          } catch (firebaseError) {
            console.warn(`⚠️ Failed to save ${sectionType} insights to Firebase:`, firebaseError)
            // Continue execution - local state still has the data
          }
        }

        console.log(`✅ ${sectionType} insights generated successfully for:`, influencer.username)
        toast.success(`${sectionType} insights generated successfully!`)
        return insights
      } else {
        throw new Error(`Empty or invalid ${sectionType} insights received from Gemini AI`)
      }
    } catch (error) {
      console.error(`❌ Error generating ${sectionType} insights:`, error)
      
      // Set error state with fallback message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const fallbackMessage = `Unable to generate ${sectionType} insights. Please try again later.`
      
      setInsightsErrors(prev => ({
        ...prev,
        [insightKey]: errorMessage.includes('API') ? errorMessage : fallbackMessage
      }))

      // Store empty insights to avoid repeated API calls for known failures
      setInfluencerInsights(prev => ({
        ...prev,
        [insightKey]: '' // Empty string to indicate failed generation
      }))
      
      toast.error(`Failed to generate ${sectionType} insights`)
      return null
    } finally {
      setIsGeneratingInsights(prev => ({ ...prev, [insightKey]: false }))
    }
  }

  // Function to generate template questions using Gemini
  const generateTemplateQuestions = async (campaignDetail: CampaignData, aiData?: any) => {
    try {
      setIsLoadingTemplates(true)
      setTemplateQuestionsError(null) // Clear previous errors
      console.log('🤖 Generating template questions from Gemini AI...')

      // Prepare comprehensive context for Gemini
      const contextData = {
        campaign: {
          title: campaignDetail.title,
          brand_name: campaignDetail.brand_name,
          product_name: campaignDetail.product_name,
          industry: campaignDetail.industry,
          overview: campaignDetail.overview,
          usp: campaignDetail.usp,
          budget: campaignDetail.budget,
          status: campaignDetail.status,
          total_influencer: campaignDetail.total_influencer,
          niche: campaignDetail.niche,
          target_audience: campaignDetail.audience_preference,
          marketing_objective: campaignDetail.marketing_objective,
          content_types: campaignDetail.output?.content_types,
          deliverables: campaignDetail.output?.deliverables
        },
        recommendations: aiData?.recommendations ? {
          total_count: aiData.recommendations.length,
          influencers: aiData.recommendations.map((inf: any) => ({
            username: inf.username,
            score: inf.scores?.overall_score,
            followers: inf.followers_count,
            engagement_rate: inf.engagement_rate,
            tier: inf.tier,
            expertise: inf.expertise,
            reach_potential: inf.performance_metrics?.reach_potential,
            projected_impact: inf.performance_metrics?.projected_impact
          }))
        } : null,
        insights_available: {
          has_strategies: Object.keys(influencerStrategies).length > 0,
          has_insights: Object.keys(influencerInsights).length > 0,
          strategy_count: Object.keys(influencerStrategies).length,
          insights_count: Object.keys(influencerInsights).length
        }
      }

      // Call Gemini to generate contextual template questions
      const prompt = `Sebagai AI assistant untuk influencer marketing, buatlah 3-4 template pertanyaan yang relevan dan menarik KHUSUS untuk campaign ini saja:

CAMPAIGN YANG SEDANG DIANALISIS:
- Campaign: "${contextData.campaign.title}"
- Brand: ${contextData.campaign.brand_name}
- Product: ${contextData.campaign.product_name}
- Industry: ${contextData.campaign.industry}
- Budget: Rp ${(contextData.campaign.budget / 1000000).toFixed(1)}M
- Target Influencers: ${contextData.campaign.total_influencer}
- Status: ${contextData.campaign.status}
- Marketing Objectives: ${Array.isArray(contextData.campaign.marketing_objective) ? contextData.campaign.marketing_objective.join(', ') : contextData.campaign.marketing_objective}

${contextData.recommendations ? `
REKOMENDASI INFLUENCER TERSEDIA:
- Total Influencer yang Direkomendasikan: ${contextData.recommendations.total_count}
- Top Performer: @${contextData.recommendations.influencers[0]?.username} (Score: ${(contextData.recommendations.influencers[0]?.score * 100).toFixed(1)}%)
- Rata-rata Engagement Rate: ${((contextData.recommendations.influencers.reduce((sum: number, inf: any) => sum + (inf.engagement_rate || 0), 0) / contextData.recommendations.influencers.length) * 100).toFixed(1)}%
` : ''}

${contextData.insights_available.has_strategies || contextData.insights_available.has_insights ? `
INSIGHTS YANG TERSEDIA UNTUK CAMPAIGN INI:
- Strategi Marketing: ${contextData.insights_available.strategy_count} insight tersedia
- Performance Analysis: ${contextData.insights_available.insights_count} insight tersedia
` : ''}

INSTRUKSI PENTING:
- HANYA fokus pada campaign "${contextData.campaign.title}" ini
- JANGAN menyebutkan campaign lain atau data global
- Pertanyaan harus spesifik untuk brand "${contextData.campaign.brand_name}" dan produk "${contextData.campaign.product_name}"
- Gunakan data rekomendasi influencer yang tersedia
- Buat pertanyaan yang actionable untuk campaign ini

Buatlah template pertanyaan yang:
1. Spesifik HANYA untuk campaign ini (${contextData.campaign.title})
2. Membantu optimalisasi campaign ${contextData.campaign.brand_name}
3. Memanfaatkan data influencer yang direkomendasikan
4. Fokus pada ROI dan performa campaign ini

Format response dalam JSON array seperti ini:
[
  {
    "question": "Pertanyaan lengkap dalam Bahasa Indonesia untuk campaign ini",
    "icon": "BarChart3|DollarSign|Crown|TrendingUp|Users|Target|Zap|Star|Trophy|Shield",
    "color": "blue|green|purple|orange|pink|indigo"
  }
]

Pastikan pertanyaan mencakup aspek: performa influencer yang direkomendasikan, optimasi budget campaign ini, strategi marketing spesifik untuk produk ${contextData.campaign.product_name}, dan ROI potential campaign ${contextData.campaign.title}.

PENTING: Jangan menyebutkan "campaign sebelumnya", "campaign lain", atau "total campaign". Fokus hanya pada campaign "${contextData.campaign.title}" ini saja.`

      const response = await geminiAIService.generateInsights(prompt)
      
      // Parse the JSON response
      let questions = []
      try {
        // Extract JSON from response if it's wrapped in text
        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0])
        } else {
          // Fallback parsing if direct JSON
          questions = JSON.parse(response)
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError)
        throw new Error('Gemini AI memberikan response yang tidak valid. Format JSON tidak sesuai yang diharapkan.')
      }

      // Validate and set questions
      if (Array.isArray(questions) && questions.length > 0) {
        // Validate each question has required fields
        const validQuestions = questions.filter(q => 
          q.question && typeof q.question === 'string' &&
          q.icon && typeof q.icon === 'string' &&
          q.color && typeof q.color === 'string'
        )
        
        if (validQuestions.length === 0) {
          throw new Error('Gemini AI tidak menghasilkan pertanyaan template yang valid.')
        }
        
        setTemplateQuestions(validQuestions.slice(0, 4)) // Limit to 4 questions
        setTemplateQuestionsError(null)
        console.log('✅ Generated template questions:', validQuestions.length)
      } else {
        throw new Error('Gemini AI tidak menghasilkan template pertanyaan yang valid atau array kosong.')
      }

    } catch (error) {
      console.error('❌ Error generating template questions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui'
      setTemplateQuestionsError(errorMessage)
      setTemplateQuestions([]) // Clear any existing questions
      toast.error('Gagal menghasilkan template pertanyaan dari AI')
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  // Function to handle chat with AI about campaign data
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setIsChatLoading(true)

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Get current campaign data and recommendations
      const campaignDetail = campaigns.find(c => c.brief_id === selectedCampaignDetail)
      const aiData = campaignDetail?.recommendation_data

      // Prepare comprehensive context for Gemini
      const contextData = {
        campaign: campaignDetail ? {
          title: campaignDetail.title,
          brand_name: campaignDetail.brand_name,
          product_name: campaignDetail.product_name,
          industry: campaignDetail.industry,
          overview: campaignDetail.overview,
          usp: campaignDetail.usp,
          budget: campaignDetail.budget,
          status: campaignDetail.status,
          total_influencer: campaignDetail.total_influencer,
          niche: campaignDetail.niche,
          target_audience: campaignDetail.audience_preference,
          marketing_objective: campaignDetail.marketing_objective,
          content_types: campaignDetail.output?.content_types,
          deliverables: campaignDetail.output?.deliverables,
          due_date: campaignDetail.due_date
        } : null,
        recommendations: aiData?.recommendations ? {
          total_count: aiData.recommendations.length,
          influencers: aiData.recommendations.map((inf: any) => ({
            username: inf.username,
            score: inf.scores?.overall_score,
            followers: inf.followers_count,
            engagement_rate: inf.engagement_rate,
            tier: inf.tier,
            expertise: inf.expertise,
            reach_potential: inf.performance_metrics?.reach_potential,
            projected_impact: inf.performance_metrics?.projected_impact,
            audience_overlap: inf.scores?.audience_alignment,
            content_quality: inf.scores?.content_quality,
            brand_safety: inf.scores?.brand_safety
          }))
        } : null,
        ai_insights: {
          strategies: Object.entries(influencerStrategies).map(([key, strategy]) => ({
            influencer: key.split('_strategy')[0],
            strategy_preview: typeof strategy === 'string' ? strategy.substring(0, 200) + '...' : ''
          })),
          insights: Object.entries(influencerInsights).map(([key, insight]) => ({
            type: key.split('_').slice(-2).join('_'),
            influencer: key.split('_')[0],
            insight_preview: typeof insight === 'string' ? insight.substring(0, 200) + '...' : ''
          }))
        },
        chat_history: chatMessages.slice(-3) // Include last 3 messages for context
      }

      // Create comprehensive prompt for Gemini
      const prompt = `Kamu adalah AI Assistant khusus untuk campaign "${contextData.campaign?.title || 'Unknown Campaign'}" dari brand ${contextData.campaign?.brand_name || 'Unknown Brand'}.

ATURAN PENTING:
- HANYA jawab pertanyaan yang berkaitan dengan campaign "${contextData.campaign?.title || 'Unknown Campaign'}" ini
- JANGAN jawab pertanyaan tentang campaign lain, topik umum, atau hal di luar konteks campaign ini
- Jika user bertanya hal di luar konteks campaign ini, katakan: "Saya hanya dapat membantu menjawab pertanyaan terkait campaign '${contextData.campaign?.title || 'Unknown Campaign'}' yang sedang berlangsung. Silakan ajukan pertanyaan tentang strategi influencer, budget optimization, atau performa campaign ini."

CAMPAIGN YANG SEDANG DIANALISIS:
${contextData.campaign ? `
- Campaign: "${contextData.campaign.title}"
- Brand: ${contextData.campaign.brand_name}
- Product: ${contextData.campaign.product_name} 
- Industry: ${contextData.campaign.industry}
- Overview: ${contextData.campaign.overview}
- USP: ${contextData.campaign.usp}
- Budget: Rp ${(contextData.campaign.budget / 1000000).toFixed(1)}M
- Target Influencers: ${contextData.campaign.total_influencer}
- Status: ${contextData.campaign.status}
- Marketing Objectives: ${Array.isArray(contextData.campaign.marketing_objective) ? contextData.campaign.marketing_objective.join(', ') : contextData.campaign.marketing_objective}
- Target Audience: ${JSON.stringify(contextData.campaign.target_audience)}
- Content Types: ${contextData.campaign.content_types?.join(', ')}
- Total Deliverables: ${contextData.campaign.deliverables}
- Due Date: ${contextData.campaign.due_date}
` : 'ERROR: Campaign data not available - cannot answer questions without campaign context'}

${contextData.recommendations ? `
INFLUENCER YANG DIREKOMENDASIKAN UNTUK CAMPAIGN INI (${contextData.recommendations.total_count} total):
${contextData.recommendations.influencers.slice(0, 5).map((inf: any, idx: number) => `
${idx + 1}. @${inf.username}
   - Overall Score: ${(inf.score * 100).toFixed(1)}%
   - Followers: ${(inf.followers / 1000).toFixed(1)}K
   - Engagement Rate: ${(inf.engagement_rate * 100).toFixed(1)}%
   - Tier: ${inf.tier}
   - Expertise: ${inf.expertise}
   - Reach Potential: ${inf.reach_potential}
   - Projected Impact: ${inf.projected_impact}
   - Audience Alignment: ${(inf.audience_overlap * 100).toFixed(1)}%
   - Content Quality: ${(inf.content_quality * 100).toFixed(1)}%
   - Brand Safety: ${(inf.brand_safety * 100).toFixed(1)}%`).join('')}
` : 'Rekomendasi influencer belum di-generate untuk campaign ini'}

${contextData.ai_insights.strategies.length > 0 ? `
STRATEGI MARKETING YANG SUDAH DIBUAT UNTUK CAMPAIGN INI:
${contextData.ai_insights.strategies.map(s => `- ${s.influencer}: ${s.strategy_preview}`).join('\n')}
` : 'Belum ada strategi marketing yang di-generate untuk campaign ini'}

${contextData.ai_insights.insights.length > 0 ? `
INSIGHTS PERFORMA YANG SUDAH DIBUAT UNTUK CAMPAIGN INI:
${contextData.ai_insights.insights.map(i => `- ${i.influencer} (${i.type}): ${i.insight_preview}`).join('\n')}
` : 'Belum ada insights performa yang di-generate untuk campaign ini'}

${contextData.chat_history.length > 0 ? `
KONTEKS PERCAKAPAN SEBELUMNYA:
${contextData.chat_history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

PERTANYAAN USER: "${userMessage}"

VALIDASI KONTEKS:
- Apakah pertanyaan ini berkaitan dengan campaign "${contextData.campaign?.title || 'Unknown Campaign'}"? 
- Jika TIDAK, berikan response penolakan sesuai aturan di atas
- Jika YA, lanjutkan dengan analisis

Berikan jawaban yang:
1. HANYA terkait campaign "${contextData.campaign?.title || 'Unknown Campaign'}" ini
2. Spesifik berdasarkan data campaign yang tersedia
3. Memberikan insights actionable untuk optimasi campaign ini
4. Menggunakan data influencer dan metrics konkret
5. Menyarankan strategi spesifik untuk produk ${contextData.campaign?.product_name || 'Unknown Product'}
6. Format yang mudah dibaca dengan bullet points dan sections
7. Bahasa Indonesia yang professional

Jika data tidak tersedia untuk menjawab pertanyaan, jelaskan fitur mana yang perlu dijalankan terlebih dahulu untuk campaign ini.`

      console.log('🤖 Sending question to Gemini with full context...')
      const response = await geminiAIService.generateInsights(prompt)
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
      console.log('✅ Received response from Gemini AI')

    } catch (error) {
      console.error('❌ Error in chat with Gemini:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Maaf, terjadi kesalahan saat memproses pertanyaan Anda: ${errorMessage}. Silakan coba lagi atau hubungi support jika masalah berlanjut.` 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Function to handle template questions
  const handleTemplateQuestion = async (question: string) => {
    if (isChatLoading) return
    
    setChatInput(question)
    setIsChatLoading(true)

    // Add user message to chat immediately
    setChatMessages(prev => [...prev, { role: 'user', content: question }])

    try {
      // Get current campaign data and recommendations
      const campaignDetail = campaigns.find(c => c.brief_id === selectedCampaignDetail)
      const aiData = campaignDetail?.recommendation_data

      // Prepare comprehensive context for Gemini (same as handleChatSubmit)
      const contextData = {
        campaign: campaignDetail ? {
          title: campaignDetail.title,
          brand_name: campaignDetail.brand_name,
          product_name: campaignDetail.product_name,
          industry: campaignDetail.industry,
          overview: campaignDetail.overview,
          usp: campaignDetail.usp,
          budget: campaignDetail.budget,
          status: campaignDetail.status,
          total_influencer: campaignDetail.total_influencer,
          niche: campaignDetail.niche,
          target_audience: campaignDetail.audience_preference,
          marketing_objective: campaignDetail.marketing_objective,
          content_types: campaignDetail.output?.content_types,
          deliverables: campaignDetail.output?.deliverables,
          due_date: campaignDetail.due_date
        } : null,
        recommendations: aiData?.recommendations ? {
          total_count: aiData.recommendations.length,
          influencers: aiData.recommendations.map((inf: any) => ({
            username: inf.username,
            score: inf.scores?.overall_score,
            followers: inf.followers_count,
            engagement_rate: inf.engagement_rate,
            tier: inf.tier,
            expertise: inf.expertise,
            reach_potential: inf.performance_metrics?.reach_potential,
            projected_impact: inf.performance_metrics?.projected_impact,
            audience_overlap: inf.scores?.audience_alignment,
            content_quality: inf.scores?.content_quality,
            brand_safety: inf.scores?.brand_safety
          }))
        } : null,
        ai_insights: {
          strategies: Object.entries(influencerStrategies).map(([key, strategy]) => ({
            influencer: key.split('_strategy')[0],
            strategy_preview: typeof strategy === 'string' ? strategy.substring(0, 200) + '...' : ''
          })),
          insights: Object.entries(influencerInsights).map(([key, insight]) => ({
            type: key.split('_').slice(-2).join('_'),
            influencer: key.split('_')[0],
            insight_preview: typeof insight === 'string' ? insight.substring(0, 200) + '...' : ''
          }))
        },
        chat_history: chatMessages.slice(-3) // Include last 3 messages for context
      }

      // Create the same prompt as in handleChatSubmit
      const prompt = `Kamu adalah AI Assistant khusus untuk campaign "${contextData.campaign?.title || 'Unknown Campaign'}" dari brand ${contextData.campaign?.brand_name || 'Unknown Brand'}.

ATURAN PENTING:
- HANYA jawab pertanyaan yang berkaitan dengan campaign "${contextData.campaign?.title || 'Unknown Campaign'}" ini
- JANGAN jawab pertanyaan tentang campaign lain, topik umum, atau hal di luar konteks campaign ini
- Jika user bertanya hal di luar konteks campaign ini, katakan: "Saya hanya dapat membantu menjawab pertanyaan terkait campaign '${contextData.campaign?.title || 'Unknown Campaign'}' yang sedang berlangsung. Silakan ajukan pertanyaan tentang strategi influencer, budget optimization, atau performa campaign ini."

CAMPAIGN YANG SEDANG DIANALISIS:
${contextData.campaign ? `
- Campaign: "${contextData.campaign.title}"
- Brand: ${contextData.campaign.brand_name}
- Product: ${contextData.campaign.product_name} 
- Industry: ${contextData.campaign.industry}
- Overview: ${contextData.campaign.overview}
- USP: ${contextData.campaign.usp}
- Budget: Rp ${(contextData.campaign.budget / 1000000).toFixed(1)}M
- Target Influencers: ${contextData.campaign.total_influencer}
- Status: ${contextData.campaign.status}
- Marketing Objectives: ${Array.isArray(contextData.campaign.marketing_objective) ? contextData.campaign.marketing_objective.join(', ') : contextData.campaign.marketing_objective}
- Target Audience: ${JSON.stringify(contextData.campaign.target_audience)}
- Content Types: ${contextData.campaign.content_types?.join(', ')}
- Total Deliverables: ${contextData.campaign.deliverables}
- Due Date: ${contextData.campaign.due_date}
` : 'ERROR: Campaign data not available - cannot answer questions without campaign context'}

${contextData.recommendations ? `
INFLUENCER YANG DIREKOMENDASIKAN UNTUK CAMPAIGN INI (${contextData.recommendations.total_count} total):
${contextData.recommendations.influencers.slice(0, 5).map((inf: any, idx: number) => `
${idx + 1}. @${inf.username}
   - Overall Score: ${(inf.score * 100).toFixed(1)}%
   - Followers: ${(inf.followers / 1000).toFixed(1)}K
   - Engagement Rate: ${(inf.engagement_rate * 100).toFixed(1)}%
   - Tier: ${inf.tier}
   - Expertise: ${inf.expertise}
   - Reach Potential: ${inf.reach_potential}
   - Projected Impact: ${inf.projected_impact}
   - Audience Alignment: ${(inf.audience_overlap * 100).toFixed(1)}%
   - Content Quality: ${(inf.content_quality * 100).toFixed(1)}%
   - Brand Safety: ${(inf.brand_safety * 100).toFixed(1)}%`).join('')}
` : 'Rekomendasi influencer belum di-generate untuk campaign ini'}

${contextData.ai_insights.strategies.length > 0 ? `
STRATEGI MARKETING YANG SUDAH DIBUAT UNTUK CAMPAIGN INI:
${contextData.ai_insights.strategies.map(s => `- ${s.influencer}: ${s.strategy_preview}`).join('\n')}
` : 'Belum ada strategi marketing yang di-generate untuk campaign ini'}

${contextData.ai_insights.insights.length > 0 ? `
INSIGHTS PERFORMA YANG SUDAH DIBUAT UNTUK CAMPAIGN INI:
${contextData.ai_insights.insights.map(i => `- ${i.influencer} (${i.type}): ${i.insight_preview}`).join('\n')}
` : 'Belum ada insights performa yang di-generate untuk campaign ini'}

${contextData.chat_history.length > 0 ? `
KONTEKS PERCAKAPAN SEBELUMNYA:
${contextData.chat_history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

PERTANYAAN USER: "${question}"

VALIDASI KONTEKS:
- Apakah pertanyaan ini berkaitan dengan campaign "${contextData.campaign?.title || 'Unknown Campaign'}"? 
- Jika TIDAK, berikan response penolakan sesuai aturan di atas
- Jika YA, lanjutkan dengan analisis

Berikan jawaban yang:
1. HANYA terkait campaign "${contextData.campaign?.title || 'Unknown Campaign'}" ini
2. Spesifik berdasarkan data campaign yang tersedia
3. Memberikan insights actionable untuk optimasi campaign ini
4. Menggunakan data influencer dan metrics konkret
5. Menyarankan strategi spesifik untuk produk ${contextData.campaign?.product_name || 'Unknown Product'}
6. Format yang mudah dibaca dengan bullet points dan sections
7. Bahasa Indonesia yang professional

Jika data tidak tersedia untuk menjawab pertanyaan, jelaskan fitur mana yang perlu dijalankan terlebih dahulu untuk campaign ini.`

      console.log('🤖 Sending template question to Gemini with full context...')
      const response = await geminiAIService.generateInsights(prompt)
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
      console.log('✅ Received response from Gemini AI for template question')
      
      // Clear input after successful submission
      setChatInput('')

    } catch (error) {
      console.error('❌ Error processing template question:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Maaf, terjadi kesalahan saat memproses pertanyaan template: ${errorMessage}. Silakan coba lagi.` 
      }])
    } finally {
      setIsChatLoading(false)
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

          {/* Floating Chat Icon - Limited functionality before recommendations */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button
              onClick={() => setIsChatModalOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-2 border-primary-foreground/20"
              size="icon"
            >
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </Button>
          </div>

          {/* Chat Modal - Limited to general questions */}
          <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[80vh] h-[500px] flex flex-col p-0 gap-0">
              <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <DialogTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  AI Campaign Assistant
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Generate recommendations terlebih dahulu untuk analisis mendalam
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 flex flex-col p-6 min-h-0">
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">Siap untuk AI Insights?</h3>
                    <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Generate AI recommendations terlebih dahulu untuk mendapatkan analisis mendalam tentang influencer dan strategi marketing yang tepat untuk campaign Anda.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Analisis Influencer</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Strategi Marketing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Performance Insights</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setIsChatModalOpen(false)
                        handleGenerateRecommendations(campaignDetail)
                      }}
                      disabled={isGeneratingRecommendations}
                      size="lg"
                      className="px-8 py-3 h-auto text-base font-semibold"
                    >
                      {isGeneratingRecommendations ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Generating AI Recommendations...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-3" />
                          Generate AI Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

        {/* Floating Chat Icon - Only visible in campaign detail with recommendations */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => setIsChatModalOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-2 border-primary-foreground/20"
            size="icon"
          >
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </Button>
        </div>

        {/* Chat Modal */}
        <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
          <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[92vh] h-[800px] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                AI Campaign Assistant
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Tanyakan tentang data campaign dan rekomendasi influencer Anda
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gradient-to-b from-muted/10 to-muted/20 rounded-lg border mb-4 min-h-[300px] max-h-[400px]">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Mulai Percakapan</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Gunakan template pertanyaan di bawah atau tanyakan langsung tentang performa campaign, strategi influencer, dan insights lainnya
                    </p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-white border border-border text-foreground rounded-bl-md shadow-md'
                        }`}
                      >
                        <div className="whitespace-pre-line leading-relaxed">{message.content}</div>
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-border p-4 rounded-2xl rounded-bl-md shadow-md">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">AI sedang menganalisis data Anda...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Questions - Compact Layout */}
              <div className="flex-shrink-0 space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Template Pertanyaan:</p>
                    {isLoadingTemplates && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>
                  {templateQuestions.length > 0 && !isLoadingTemplates && (
                    <button
                      onClick={() => {
                        const campaignDetail = campaigns.find(c => c.brief_id === selectedCampaignDetail)
                        if (campaignDetail) {
                          generateTemplateQuestions(campaignDetail, campaignDetail.recommendation_data)
                        }
                      }}
                      disabled={isLoadingTemplates}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh pertanyaan template"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto">
                  {templateQuestions.length > 0 ? (
                    templateQuestions.map((template, index) => {
                      // Map icon string to actual icon component
                      const getIconComponent = (iconName: string) => {
                        const iconMap: { [key: string]: any } = {
                          BarChart3, DollarSign, Crown, TrendingUp, Users, Target, Zap, Star, Trophy, Shield, 
                          MessageCircle, PieChart, Activity, Heart, Eye, Megaphone
                        }
                        return iconMap[iconName] || BarChart3
                      }

                      // Map color to Tailwind classes
                      const getColorClasses = (color: string) => {
                        const colorMap: { [key: string]: string } = {
                          blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 border-blue-200 hover:border-blue-300',
                          green: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 border-green-200 hover:border-green-300',
                          purple: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 border-purple-200 hover:border-purple-300',
                          orange: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150 border-orange-200 hover:border-orange-300',
                          pink: 'from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-150 border-pink-200 hover:border-pink-300',
                          indigo: 'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-150 border-indigo-200 hover:border-indigo-300'
                        }
                        return colorMap[color] || colorMap.blue
                      }

                      const getIconColorClass = (color: string) => {
                        const colorMap: { [key: string]: string } = {
                          blue: 'bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-600',
                          green: 'bg-green-500/10 group-hover:bg-green-500/20 text-green-600',
                          purple: 'bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-600',
                          orange: 'bg-orange-500/10 group-hover:bg-orange-500/20 text-orange-600',
                          pink: 'bg-pink-500/10 group-hover:bg-pink-500/20 text-pink-600',
                          indigo: 'bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-600'
                        }
                        return colorMap[color] || colorMap.blue
                      }

                      const getTextColorClass = (color: string) => {
                        const colorMap: { [key: string]: string } = {
                          blue: 'text-blue-800',
                          green: 'text-green-800',
                          purple: 'text-purple-800',
                          orange: 'text-orange-800',
                          pink: 'text-pink-800',
                          indigo: 'text-indigo-800'
                        }
                        return colorMap[color] || colorMap.blue
                      }

                      const IconComponent = getIconComponent(template.icon)

                      return (
                        <button 
                          key={index}
                          onClick={() => handleTemplateQuestion(template.question)}
                          className={`text-left p-3 bg-gradient-to-r ${getColorClasses(template.color)} border transition-all duration-200 group rounded-lg`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${getIconColorClass(template.color)}`}>
                              <IconComponent className="w-3 h-3" />
                            </div>
                            <span className={`text-sm font-medium leading-relaxed ${getTextColorClass(template.color)}`}>
                              {template.question}
                            </span>
                          </div>
                        </button>
                      )
                    })
                  ) : templateQuestionsError ? (
                    // Error state when Gemini fails to generate questions
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-red-800 mb-2">
                            Gagal Menghasilkan Template Pertanyaan
                          </h5>
                          <p className="text-sm text-red-600 mb-3">
                            {templateQuestionsError}
                          </p>
                          <button
                            onClick={() => {
                              const campaignDetail = campaigns.find(c => c.brief_id === selectedCampaignDetail)
                              if (campaignDetail) {
                                generateTemplateQuestions(campaignDetail, campaignDetail.recommendation_data)
                              }
                            }}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Coba Lagi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : isLoadingTemplates ? (
                    // Loading state for template questions
                    <>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg animate-pulse"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Empty state when no questions are available
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Tidak ada template pertanyaan tersedia. Silakan ketik pertanyaan Anda sendiri.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input - Fixed at bottom */}
              <form onSubmit={handleChatSubmit} className="flex-shrink-0 mt-2">
                <div className="flex items-center space-x-2 p-3 border border-muted-foreground/20 hover:border-primary/30 focus-within:border-primary/50 rounded-lg bg-background transition-colors">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanyakan tentang campaign ini..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                    disabled={isChatLoading}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={!chatInput.trim() || isChatLoading}
                    className="px-3 py-1.5 h-auto flex-shrink-0"
                  >
                    {isChatLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
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
              {/* Upcoming Campaigns Schedule - Full Width */}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {campaigns.slice(0, 8).map((campaign) => (
                          <div 
                            key={campaign.id}
                            onClick={() => openCampaignDetail(campaign.brief_id)}
                            className="flex flex-col justify-between p-3 bg-muted border rounded-lg cursor-pointer hover:shadow-md hover:bg-muted/80 transition-all duration-200"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <h4 className="font-semibold text-sm flex items-center">
                                  {campaign.title}
                                  {campaign.has_recommendations && (
                                    <Brain className="w-3 h-3 ml-1 text-primary" />
                                  )}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground">{campaign.phase}</p>
                              <p className="text-xs text-muted-foreground">Due: {campaign.due_date}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
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
                        ))}
                      </div>
                    )}
                  </div>
                  {campaigns.length > 0 && (
                    <div className="mt-4 p-3 bg-muted border rounded-lg">
                      <div className="flex items-center text-xs">
                        <Brain className="w-3 h-3 mr-1 text-primary" />
                        <span className="text-muted-foreground">Click campaigns with AI Ready badge for recommendations</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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
