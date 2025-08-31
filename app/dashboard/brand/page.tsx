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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandSidebar } from "@/components/brand-sidebar"
import { CreateCampaignModal } from "@/components/create-campaign-modal"
import { CampaignResults } from "@/components/campaign-results"
import { BrandProfileForm } from "@/components/brand-profile-form"
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

  // Handler untuk generate recommendations
  const handleGenerateRecommendations = async (campaign: CampaignData) => {
    setIsGeneratingRecommendations(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create dummy recommendations data
      const dummyRecommendations = {
        status: 'success',
        recommendations: [
          {
            username: '@jenniferbachdim',
            tier: 'Mega Influencer',
            expertise: 'Jennifer Bachdim',
            scores: {
              final_score: 0.491
            },
            performance_metrics: {
              authenticity_score: 87.3
            }
          },
          {
            username: '@beautyguru_maya',
            tier: 'Macro Influencer', 
            expertise: 'Beauty Expert',
            scores: {
              final_score: 0.458
            },
            performance_metrics: {
              authenticity_score: 82.1
            }
          }
        ]
      }
      
      // Save dummy recommendations to Firebase
      await firebaseCampaignService.saveRecommendations(campaign.brief_id, dummyRecommendations)
      
      // Update campaigns state
      setCampaigns(prev => prev.map(c => 
        c.brief_id === campaign.brief_id 
          ? { ...c, has_recommendations: true, recommendation_data: dummyRecommendations }
          : c
      ))
      
      toast.success('Rekomendasi influencer berhasil dibuat!')
      setSelectedCampaignDetail(campaign.brief_id)
    } catch (error: any) {
      console.error('Error generating recommendations:', error)
      toast.error('Gagal membuat rekomendasi')
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
              <h1 className="text-2xl font-bold text-foreground">
                Influencer Recommendations
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

            {/* Top Recommendations - Layout sederhana dengan data dinamis */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold">
                Top {aiData.recommendations?.length || 2} Influencer Recommendations
              </h2>
              
              {/* Dynamic Recommendations */}
              {aiData.recommendations?.map((influencer: any, index: number) => (
                <Card key={index} className="bg-white border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {influencer.username?.substring(1, 3).toUpperCase() || 'IF'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold flex items-center">
                            {influencer.tier?.includes('Mega') && (
                              <Crown className="w-4 h-4 mr-1 text-blue-600" />
                            )}
                            {influencer.username} ({influencer.tier})
                          </h3>
                          <p className="text-sm text-muted-foreground">{influencer.expertise}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-black text-white">
                        Overall Match: {((influencer.scores?.final_score || 0) * 100).toFixed(1)}%
                      </Badge>
                    </div>

                    {/* Simple tabs layout seperti gambar */}
                    <Tabs defaultValue="conversion" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-50">
                        <TabsTrigger value="conversion" className="text-xs data-[state=active]:bg-white">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Conversion Potential
                        </TabsTrigger>
                        <TabsTrigger value="behavior" className="text-xs data-[state=active]:bg-white">
                          <Megaphone className="w-3 h-3 mr-1" />
                          Caption Behavior
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-white">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="strategy" className="text-xs data-[state=active]:bg-white">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Campaign Strategy
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="conversion" className="mt-4 p-4 bg-gray-50 rounded">
                        <div className="text-sm text-muted-foreground">
                          <p>Authenticity Score: {influencer.performance_metrics?.authenticity_score || 85}%</p>
                          <p>High conversion potential based on audience engagement patterns...</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="behavior" className="mt-4 p-4 bg-gray-50 rounded">
                        <div className="text-sm text-muted-foreground">
                          <p>Consistent posting schedule with authentic product reviews...</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="performance" className="mt-4 p-4 bg-gray-50 rounded">
                        <div className="text-sm text-muted-foreground">
                          <p>Average engagement rate: {(Math.random() * 5 + 2).toFixed(1)}%</p>
                          <p>Reach performance shows strong audience connection...</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="strategy" className="mt-4 p-4 bg-gray-50 rounded">
                        <div className="text-sm text-muted-foreground">
                          <p>Recommended budget allocation: Rp {(Math.random() * 50 + 25).toFixed(0)}M</p>
                          <p>Best posting times: 19:00-21:00 WIB for maximum engagement...</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )) || (
                // Fallback jika tidak ada data recommendations
                <Card className="bg-white border">
                  <CardContent className="p-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recommendations data available</p>
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
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm font-medium text-foreground">Total Campaigns</div>
                <div className="text-xs text-muted-foreground">Active campaigns</div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm font-medium text-foreground">Active Influencers</div>
                <div className="text-xs text-muted-foreground">Collaborating now</div>
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
                <div className="text-2xl font-bold">18</div>
                <div className="text-sm font-medium text-foreground">Scheduled Posts</div>
                <div className="text-xs text-muted-foreground">Upcoming content</div>
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
                <div className="text-2xl font-bold">3,456</div>
                <div className="text-sm font-medium text-foreground">Budget Used</div>
                <div className="text-xs text-muted-foreground">In thousands</div>
              </div>
            </Card>
          </div>

          {/* API Status Checker */}
          <APIStatusChecker />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                        <h3 className="text-lg font-semibold">March 2025</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            ← Previous
                          </Button>
                          <Button variant="outline" size="sm">
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
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <div key={day} className="relative p-2 text-sm border rounded hover:bg-muted transition-colors min-h-[60px]">
                            <span className="font-medium">{day}</span>
                            {/* Campaign markers */}
                            {day === 15 && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="bg-primary/20 text-primary text-xs px-1 py-0.5 rounded truncate">
                                  Skincare Launch
                                </div>
                              </div>
                            )}
                            {day === 20 && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="bg-green-100 text-green-700 text-xs px-1 py-0.5 rounded truncate">
                                  Content Due
                                </div>
                              </div>
                            )}
                            {day === 25 && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="bg-amber-100 text-amber-700 text-xs px-1 py-0.5 rounded truncate">
                                  Ramadan Campaign
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-primary/20 rounded"></div>
                          <span>Campaign Launch</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-100 rounded"></div>
                          <span>Content Deadline</span>
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
