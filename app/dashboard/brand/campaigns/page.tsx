"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BrandSidebar } from "@/components/brand-sidebar"
import { CreateCampaignModal } from "@/components/create-campaign-modal"
import { CampaignResults } from "@/components/campaign-results"
import { APIStatusChecker } from "@/components/api-status-checker"
import { firebaseCampaignService, type CampaignData } from "@/lib/firebase-campaign"
import { influencerAPI, type ApiResponse } from "@/lib/influencer-api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "react-hot-toast"
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react"

export default function MyCampaignsPage() {
  const { user } = useAuth() // Get current logged in brand
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [campaignResults, setCampaignResults] = useState<ApiResponse | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  // Load campaigns from Firebase on component mount
  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user])

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
  const handleCampaignCreated = (campaign: CampaignData) => {
    // Add new campaign to state
    setCampaigns(prev => [campaign, ...prev])
    toast.success('Campaign berhasil dibuat!')
  }

  // Helper function to convert campaign data to API format
  const convertCampaignToApiFormat = (campaign: CampaignData) => {
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

  // Handler untuk generate recommendations
  const handleGenerateRecommendations = async (campaign: CampaignData) => {
    setIsGeneratingRecommendations(true)
    try {
      console.log('🚀 Starting recommendation generation for campaign:', campaign.brief_id)
      toast.loading('Generating AI recommendations...', { duration: 1000 })
      
      // Convert campaign data to API format
      const apiPayload = convertCampaignToApiFormat(campaign)
      console.log('📦 API Payload prepared:', {
        brief_id: apiPayload.brief_id,
        product_name: apiPayload.product_name,
        total_influencer: apiPayload.total_influencer,
        budget: apiPayload.budget,
        niche: apiPayload.niche
      })
      
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
      
      // Show the results
      setCampaignResults(apiResponse)
      setShowResults(true)
    } catch (error: any) {
      console.error('❌ Error generating recommendations:', error)
      
      // Provide specific error messages
      let errorMessage = 'Failed to generate recommendations'
      if (error.message.includes('connect')) {
        errorMessage = 'Cannot connect to AI API. Please ensure the API server is running.'
      } else if (error.message.includes('API returned invalid response')) {
        errorMessage = 'AI API returned invalid response. Please try again.'
      } else if (error.message.includes('No influencer recommendations found')) {
        errorMessage = 'No suitable influencers found for your criteria. Try adjusting your requirements.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  // Handler untuk kembali ke campaigns dari results
  const handleBackFromResults = () => {
    setShowResults(false)
    setCampaignResults(null)
  }

  // Utility functions for Firebase data
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Upcoming":
        return "bg-purple-100 text-purple-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number): string => {
    return `Rp ${(amount / 1000000).toFixed(0)}M`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (campaign: CampaignData): number => {
    const start = new Date(campaign.due_date)
    const end = new Date()
    const total = start.getTime() - new Date().getTime()
    
    if (campaign.status === 'Completed') return 100
    if (campaign.status === 'Planning') return 15
    if (campaign.status === 'Upcoming') return 25
    if (campaign.status === 'In Progress') return 65
    return 0
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (campaign.product_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = !selectedStatus || campaign.status.toLowerCase().includes(selectedStatus.toLowerCase())
    const matchesCategory = selectedCategory === "all" || campaign.industry === selectedCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Calculate dynamic stats
  const activeCampaigns = campaigns.filter(c => c.status === "In Progress").length
  const completedCampaigns = campaigns.filter(c => c.status === "Completed").length
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0)
  const totalScheduledPosts = campaigns.reduce((acc, c) => acc + (c.output?.deliverables || 0), 0)

  // Campaign card renderer
  const renderCampaignCard = (campaign: CampaignData) => (
    <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-xl">{campaign.title}</CardTitle>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
              {campaign.has_recommendations && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  AI Ready
                </Badge>
              )}
            </div>
            <CardDescription>{campaign.product_name} - {campaign.industry} Campaign</CardDescription>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Due: {formatDate(campaign.due_date)}
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {campaign.brief_id}
              </div>
              <Badge variant="outline">{campaign.industry}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Campaign Progress</span>
            <span>{calculateProgress(campaign)}%</span>
          </div>
          <Progress value={calculateProgress(campaign)} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold">{formatCurrency(campaign.budget || 0)}</p>
            <p className="text-xs text-muted-foreground">Budget</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold">{campaign.audience_preference?.gender?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Target Groups</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold">{campaign.output?.deliverables || 0}</p>
            <p className="text-xs text-muted-foreground">Deliverables</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <MessageCircle className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold">{campaign.output?.content_types?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Content Types</p>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Target Audience</h4>
          <div className="flex items-center space-x-4">
            <div className="flex flex-wrap gap-1">
              {campaign.audience_preference?.top_locations?.cities?.slice(0, 3).map((city, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {city}
                </Badge>
              )) || <Badge variant="outline" className="text-xs">No cities specified</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              Age: {campaign.audience_preference?.age_range?.join(', ') || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Niche Tags */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Campaign Niches</h4>
          <div className="flex flex-wrap gap-1">
            {campaign.niche?.map((n, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {n}
              </Badge>
            )) || <span className="text-sm text-muted-foreground">No niches specified</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <Button variant="outline" size="sm">
            Edit Campaign
          </Button>
          {campaign.has_recommendations ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setCampaignResults(campaign.recommendation_data)
                setShowResults(true)
              }}
            >
              View AI Recommendations
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleGenerateRecommendations(campaign)}
              disabled={isGeneratingRecommendations}
              className="flex items-center gap-2"
            >
              {isGeneratingRecommendations ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Generate Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

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

  return (
    <div className="flex h-screen bg-background">
      <BrandSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
              <p className="text-muted-foreground">Manage and track your influencer campaigns</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          {/* API Status Checker */}
          <div className="mb-6">
            <APIStatusChecker />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : campaigns.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : `${activeCampaigns} active campaigns`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : activeCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : `${completedCampaigns} completed`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : formatCurrency(totalBudget)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : 'Total allocated budget'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingCampaigns ? '...' : totalScheduledPosts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingCampaigns ? 'Loading...' : 'Total content planned'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Campaigns</TabsTrigger>
                <TabsTrigger value="progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              {isLoadingCampaigns ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading campaigns...</span>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No campaigns found matching your criteria</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredCampaigns.map(renderCampaignCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "In Progress").map(renderCampaignCard)}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "Completed").map(renderCampaignCard)}
              </div>
            </TabsContent>

            <TabsContent value="planning" className="space-y-6">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "Planning").map(renderCampaignCard)}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "Upcoming").map(renderCampaignCard)}
              </div>
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
