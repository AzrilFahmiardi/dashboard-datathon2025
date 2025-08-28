"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandSidebar } from "@/components/brand-sidebar"
import { CreateCampaignModal } from "@/components/create-campaign-modal"

// Mock data berdasarkan sample_json_brief
const campaignData = {
  brief_id: "BRIEF_001",
  brand_name: "Avoskin",
  industry: "Skincare & Beauty",
  product_name: "GlowSkin Vitamin C Serum",
  overview: "Premium vitamin C serum untuk mencerahkan dan melindungi kulit dari radikal bebas",
  usp: "Formula 20% Vitamin C dengan teknologi nano-encapsulation untuk penetrasi optimal",
  budget: 50000000,
  total_influencer: 2,
  niche: ["Beauty", "Lifestyle"],
  location_prior: ["Indonesia", "Malaysia"],
  esg_allignment: ["Cruelty-free", "sustainable packaging"],
  risk_tolerance: "Medium",
}

const topInfluencers = [
  {
    id: 1,
    name: "Sarah Beauty",
    username: "@sarahbeauty",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "125K",
    engagement: "4.2%",
    niche: ["Beauty", "Skincare"],
    location: "Jakarta",
    estimatedReach: "85K",
    audienceMatch: 92,
    price: "Rp 15,000,000",
  },
  {
    id: 2,
    name: "Maya Lifestyle",
    username: "@mayalifestyle",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "89K",
    engagement: "5.1%",
    niche: ["Lifestyle", "Beauty"],
    location: "Bandung",
    estimatedReach: "62K",
    audienceMatch: 88,
    price: "Rp 12,000,000",
  },
  {
    id: 3,
    name: "Rina Skincare",
    username: "@rinaskincare",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "156K",
    engagement: "3.8%",
    niche: ["Beauty", "Health"],
    location: "Surabaya",
    estimatedReach: "98K",
    audienceMatch: 85,
    price: "Rp 18,000,000",
  },
]

// Campaign Schedule Data
const campaignSchedules = [
  {
    id: 1,
    title: "Skincare Spring Campaign",
    product: "GlowSkin Vitamin C Serum",
    brief_id: "BRIEF_001",
    status: "In Progress",
    phase: "Content creation phase",
    due: "March 15, 2025",
    budget: 50000000,
    deliverables: { story: 0, feeds: 3, reels: 3 },
  },
  {
    id: 2,
    title: "Beauty Tech Launch",
    product: "Anti-Aging Smart Serum",
    brief_id: "BRIEF_002", 
    status: "Upcoming",
    phase: "Influencer briefing",
    due: "March 20, 2025",
    budget: 75000000,
    deliverables: { story: 2, feeds: 4, reels: 2 },
  },
  {
    id: 3,
    title: "Ramadan Special Campaign",
    product: "Halal Beauty Series",
    brief_id: "BRIEF_003",
    status: "Planning",
    phase: "Planning & strategy",
    due: "March 25, 2025", 
    budget: 35000000,
    deliverables: { story: 3, feeds: 2, reels: 1 },
  }
]

// AI Recommendation Data (seperti contoh yang diberikan)
const aiRecommendations = {
  "BRIEF_001": {
    brief_summary: {
      brief_id: "BRIEF_001",
      product_name: "GlowSkin Vitamin C Serum", 
      industry: "Skincare & Beauty",
      budget: 50000000,
      target_audience: {
        countries: ["Indonesia", "Malaysia", "Singapore"],
        cities: ["Jakarta", "Surabaya", "Bandung"],
        age_range: ["18-24", "25-34"],
        gender: "Female"
      },
      content_requirements: ["Reels", "Feeds"],
      total_deliverables: 6,
      influencer_persona: "Beauty enthusiast, skincare expert, authentic product reviewer dengan focus pada natural skincare dan anti-aging..."
    },
    scoring_strategy: {
      persona_fit: 34.4,
      audience_fit: 34.4,
      performance_pred: 15.6,
      budget_efficiency: 15.6
    },
    recommendations: [
      {
        id: 1,
        rank: 1,
        username: "@jenniferbachdim",
        name: "Jennifer Bachdim",
        tier: "Mega Influencer",
        overall_match_score: 49.1,
        avatar: "/placeholder.svg?height=60&width=60",
        
        conversion_potential: {
          total_comments: 129,
          sentiment_breakdown: {
            supportive_sentiment: 51.9,
            passive_engagement: 35.7,
            social_virality: 7.0,
            relatable_engagement: 3.1,
            product_focused_response: 2.3
          },
          high_value_comment_rate: 12.4,
          insight: "Cukup rendah, mengindikasikan bahwa interaksi dari audiens masih dominan pujian atau pasif.",
          sample_comments: {
            relatable_engagement: ["I think ada tukang lagi nge bor di sebelah 😂."],
            product_focused_response: ["Mama jen daftar apa? Pocari?"],
            social_virality: ["Dari hate lari pasti lama lama cinta lari kak @jenniferbachdim 😍🔥"]
          }
        },
        
        caption_behavior: {
          cta_habit: "0 dari 5 caption mengandung CTA",
          tone_of_voice: "personal storytelling",
          example: "Moms can relate, any kind of spot can totally throw me off 😅 Especially when it's dark spots on my face… close-ups? No t...",
          label_distribution: {
            "personal storytelling": 3,
            "product-focused": 1,
            "no meaningful message": 1
          }
        },
        
        score_breakdown: {
          budget_efficiency: 0.16,
          persona_fit: 46.8,
          audience_match: 65.9,
          performance_potential: 66.3
        },
        
        performance_metrics: {
          engagement_rate: 6.00,
          authenticity_score: 59.4,
          reach_potential: 42.0,
          brand_alignment: 0.0
        },
        
        campaign_strategy: {
          feed_posts: 3,
          reels: 3,
          total_investment: 240000000,
          budget_remaining: -190000000,
          expected_impact: 38.7
        },
        
        key_insights: [
          "🔥 Currently trending",
          "✅ Consistent content behavior", 
          "🎯 Proven campaign success"
        ]
      },
      {
        id: 2,
        rank: 2,
        username: "@raniashafira", 
        name: "Rania Shafira",
        tier: "Micro Influencer",
        overall_match_score: 48.8,
        avatar: "/placeholder.svg?height=60&width=60",
        
        conversion_potential: {
          total_comments: 65,
          sentiment_breakdown: {
            passive_engagement: 46.2,
            supportive_sentiment: 44.6,
            relatable_engagement: 6.2,
            product_focused_response: 1.5,
            social_virality: 1.5
          },
          high_value_comment_rate: 9.2,
          insight: "Cukup rendah, mengindikasikan bahwa interaksi dari audiens masih dominan pujian atau pasif.",
          sample_comments: {
            relatable_engagement: ["Ran anjir cantik bgt rambut pendek"],
            product_focused_response: ["Best deal yaaa 😭💘💘💘💘"],
            social_virality: ["yuuuuk @sabrinafaradis @talitharisya"]
          }
        },
        
        caption_behavior: {
          cta_habit: "0 dari 5 caption mengandung CTA",
          tone_of_voice: "no meaningful message",
          example: "nothing but love for @blpbeauty...",
          label_distribution: {
            "no meaningful message": 2,
            "personal storytelling": 2,
            "product-focused": 1
          }
        },
        
        score_breakdown: {
          budget_efficiency: 2.18,
          persona_fit: 42.5,
          audience_match: 71.8,
          performance_potential: 60.5
        },
        
        performance_metrics: {
          engagement_rate: 3.00,
          authenticity_score: 76.2,
          reach_potential: 24.0,
          brand_alignment: 0.0
        },
        
        campaign_strategy: {
          feed_posts: 3,
          reels: 3,
          total_investment: 10500000,
          budget_remaining: 39500000,
          expected_impact: 22.9
        },
        
        key_insights: [
          "✅ Consistent content behavior"
        ]
      }
    ]
  }
}

export default function BrandDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<string | null>(null)

  // Handler untuk membuka detail campaign
  const openCampaignDetail = (briefId: string) => {
    setSelectedCampaignDetail(briefId)
  }

  // Handler untuk kembali ke dashboard
  const closeCampaignDetail = () => {
    setSelectedCampaignDetail(null)
  }

  // Render detail campaign dengan AI recommendations
  if (selectedCampaignDetail) {
    const campaignDetail = campaignSchedules.find(c => c.brief_id === selectedCampaignDetail)
    const aiData = (aiRecommendations as any)[selectedCampaignDetail]
    
    if (!campaignDetail || !aiData) return null

    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header dengan tombol kembali */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={closeCampaignDetail}
                className="mb-4 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  Influencer Recommendations
                </h1>
              </div>
            </div>

            {/* Campaign Brief Summary */}
            <div className="mb-8">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                  
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {aiData.brief_summary.brief_id}
                        </Badge>
                        <h2 className="text-2xl font-bold text-foreground">
                          {aiData.brief_summary.product_name}
                        </h2>
                        <p className="text-muted-foreground flex items-center mt-1">
                          <Sparkles className="w-4 h-4 mr-1" />
                          {aiData.brief_summary.industry}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-primary">
                        Campaign Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Brief Details Cards */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Campaign Info Card */}
                <Card className="bg-white border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary" />
                      Campaign Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">Rp {(aiData.brief_summary.budget / 1000000).toFixed(0)}M</div>
                      <div className="text-xs text-muted-foreground">Total Budget</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold text-foreground">{aiData.brief_summary.total_deliverables}</div>
                      <div className="text-xs text-muted-foreground">Total Deliverables</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Target Audience Card */}
                <Card className="bg-white border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
                      <span className="font-medium">Countries:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiData.brief_summary.target_audience.countries.map((country) => (
                        <Badge key={country} variant="secondary" className="text-xs">{country}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-3 h-3 mr-2 text-muted-foreground" />
                      <span>{aiData.brief_summary.target_audience.age_range.join(", ")} • {aiData.brief_summary.target_audience.gender}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Requirements Card */}
                <Card className="bg-white border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Video className="w-4 h-4 mr-2 text-primary" />
                      Content Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm font-medium">Types: {aiData.brief_summary.content_requirements.join(", ")}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold text-foreground">{campaignDetail.deliverables.feeds}</div>
                        <div className="text-xs text-muted-foreground">Feeds</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold text-foreground">{campaignDetail.deliverables.reels}</div>
                        <div className="text-xs text-muted-foreground">Reels</div>
                      </div>
                    </div>
                    {campaignDetail.deliverables.story > 0 && (
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold text-foreground">{campaignDetail.deliverables.story}</div>
                        <div className="text-xs text-muted-foreground">Stories</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Influencer Persona Card */}
                <Card className="bg-white border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Star className="w-4 h-4 mr-2 text-primary" />
                      Influencer Persona
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiData.brief_summary.influencer_persona}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Scoring Strategy */}
            {/* <Card className="bg-white border mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Scoring Strategy Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted border rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{aiData.scoring_strategy.persona_fit}%</div>
                    <div className="text-xs text-muted-foreground">Persona Fit</div>
                  </div>
                  <div className="text-center p-3 bg-muted border rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{aiData.scoring_strategy.audience_fit}%</div>
                    <div className="text-xs text-muted-foreground">Audience Fit</div>
                  </div>
                  <div className="text-center p-3 bg-muted border rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{aiData.scoring_strategy.performance_pred}%</div>
                    <div className="text-xs text-muted-foreground">Performance Pred</div>
                  </div>
                  <div className="text-center p-3 bg-muted border rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{aiData.scoring_strategy.budget_efficiency}%</div>
                    <div className="text-xs text-muted-foreground">Budget Efficiency</div>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Top Recommendations */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center">
                Top {aiData.recommendations.length} Influencer Recommendations
              </h2>
              
              {aiData.recommendations.map((rec, index) => (
                <Card key={rec.id} className="bg-white border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={rec.avatar} />
                          <AvatarFallback>{rec.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="flex items-center">
                            {index === 0 && <Crown className="w-5 h-5 mr-2 text-primary" />}
                            {index > 0 && <Star className="w-5 h-5 mr-2 text-muted-foreground" />}
                            {rec.username} ({rec.tier})
                          </CardTitle>
                          <CardDescription>{rec.name}</CardDescription>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="text-lg font-bold">
                              Overall Match: {rec.overall_match_score}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="conversion" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="conversion">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Conversion Potential
                        </TabsTrigger>
                        <TabsTrigger value="behavior">
                          <Megaphone className="w-4 h-4 mr-2" />
                          Caption Behavior
                        </TabsTrigger>
                        <TabsTrigger value="performance">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="strategy">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Campaign Strategy
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="conversion" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Comment Quality Analysis
                            </h4>
                            <div className="space-y-2">
                              <p className="text-sm"><span className="font-medium">Total Comments:</span> {rec.conversion_potential.total_comments} dianalisis</p>
                              <p className="text-sm"><span className="font-medium">High-Value Rate:</span> {rec.conversion_potential.high_value_comment_rate}%</p>
                              <p className="text-xs text-muted-foreground">{rec.conversion_potential.insight}</p>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              {Object.entries(rec.conversion_potential.sentiment_breakdown).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                  <span className="text-xs capitalize">{key.replace('_', ' ')}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-muted rounded-full h-1.5">
                                      <div 
                                        className="bg-primary h-1.5 rounded-full" 
                                        style={{ width: `${value}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs w-8 text-right text-foreground">{value}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">💬 Sample High-Value Comments</h4>
                            <div className="space-y-3">
                              {Object.entries(rec.conversion_potential.sample_comments).map(([type, comments]) => (
                                <div key={type} className="p-3 bg-gray-50 border rounded-lg">
                                  <div className="font-medium text-xs capitalize mb-1 text-blue-600">{type.replace('_', ' ')}</div>
                                  {comments.map((comment, idx) => (
                                    <p key={idx} className="text-xs text-gray-700 italic">"{comment}"</p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="behavior" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Call-to-Action Habit
                            </h4>
                            <p className="text-sm">{rec.caption_behavior.cta_habit}</p>
                            
                            <h4 className="font-semibold mb-3 mt-6 flex items-center">
                              <Megaphone className="w-4 h-4 mr-2" />
                              Tone of Voice
                            </h4>
                            <p className="text-sm"><span className="font-medium">Dominan:</span> {rec.caption_behavior.tone_of_voice}</p>
                            <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                              <p className="text-xs text-gray-700 italic">"{rec.caption_behavior.example}"</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <PieChart className="w-4 h-4 mr-2" />
                              Caption Distribution
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(rec.caption_behavior.label_distribution).map(([label, count]) => (
                                <div key={label} className="flex justify-between items-center">
                                  <span className="text-sm capitalize">{label}</span>
                                  <Badge variant="outline">{count}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="performance" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-muted border rounded-lg">
                            <div className="text-xl font-bold text-foreground">{rec.score_breakdown.budget_efficiency}</div>
                            <div className="text-xs text-muted-foreground">Budget Efficiency</div>
                            <div className="text-xs text-muted-foreground">points/Million Rp</div>
                          </div>
                          <div className="text-center p-3 bg-muted border rounded-lg">
                            <div className="text-xl font-bold text-foreground">{rec.score_breakdown.persona_fit}%</div>
                            <div className="text-xs text-muted-foreground">Persona Fit</div>
                          </div>
                          <div className="text-center p-3 bg-muted border rounded-lg">
                            <div className="text-xl font-bold text-foreground">{rec.score_breakdown.audience_match}%</div>
                            <div className="text-xs text-muted-foreground">Audience Match</div>
                          </div>
                          <div className="text-center p-3 bg-muted border rounded-lg">
                            <div className="text-xl font-bold text-foreground">{rec.score_breakdown.performance_potential}%</div>
                            <div className="text-xs text-muted-foreground">Performance Potential</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 border rounded-lg">
                            <div className="text-lg font-bold">{rec.performance_metrics.engagement_rate}%</div>
                            <div className="text-xs text-muted-foreground">Engagement Rate</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 border rounded-lg">
                            <div className="text-lg font-bold">{rec.performance_metrics.authenticity_score}%</div>
                            <div className="text-xs text-muted-foreground">Authenticity Score</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 border rounded-lg">
                            <div className="text-lg font-bold">{rec.performance_metrics.reach_potential}%</div>
                            <div className="text-xs text-muted-foreground">Reach Potential</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 border rounded-lg">
                            <div className="text-lg font-bold">{rec.performance_metrics.brand_alignment}%</div>
                            <div className="text-xs text-muted-foreground">Brand Alignment</div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="strategy" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Content Requirements
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-muted border rounded">
                                <span className="text-sm">Feed Posts</span>
                                <Badge>{rec.campaign_strategy.feed_posts} posts</Badge>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-muted border rounded">
                                <span className="text-sm">Reels</span>
                                <Badge>{rec.campaign_strategy.reels} posts</Badge>
                              </div>
                            </div>
                            
                            <h4 className="font-semibold mb-3 mt-6 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Key Insights
                            </h4>
                            <div className="space-y-1">
                              {rec.key_insights.map((insight, idx) => (
                                <p key={idx} className="text-sm">{insight}</p>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Financial Summary
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Total Investment</span>
                                <span className="font-bold text-foreground">Rp {rec.campaign_strategy.total_investment.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Budget Remaining</span>
                                <span className="font-bold text-foreground">
                                  Rp {rec.campaign_strategy.budget_remaining.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Expected Impact</span>
                                <span className="font-bold text-foreground">{rec.campaign_strategy.expected_impact} points</span>
                              </div>
                            </div>
                            
                            <Button className="w-full mt-6" size="lg">
                              <Zap className="w-4 h-4 mr-2" />
                              Select This Influencer
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Footer dengan informasi AI */}
            {/* <Card className="bg-muted border mt-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                    RECOMMENDATION COMPLETE
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center justify-center">
                      <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                      Enhanced with Adaptive Weight Intelligence
                    </div>
                    <div className="flex items-center justify-center">
                      <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                      Using Real Instagram Insights
                    </div>
                    <div className="flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-muted-foreground" />
                      Multi-Component Analysis
                    </div>
                    <div className="flex items-center justify-center">
                      <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
                      Visual Analytics for Each Influencer
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23.1%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">89.2K</div>
                <div className="text-sm font-medium text-foreground">Total Reach</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2%
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">2,847</div>
                <div className="text-sm font-medium text-foreground">Engagements</div>
                <div className="text-xs text-muted-foreground">User engagement</div>
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      {campaignSchedules.map((campaign) => (
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
                                {(aiRecommendations as any)[campaign.brief_id] && (
                                  <Brain className="w-3 h-3 ml-1 text-primary" />
                                )}
                              </h4>
                              <p className="text-xs text-muted-foreground">{campaign.phase}</p>
                              <p className="text-xs text-muted-foreground">Due: {campaign.due}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={campaign.status === 'In Progress' ? 'default' : 'outline'} className="text-xs">
                              {campaign.status}
                            </Badge>
                            {(aiRecommendations as any)[campaign.brief_id] && (
                              <Badge variant="secondary" className="text-xs">
                                AI Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-muted border rounded-lg">
                      <div className="flex items-center text-xs">
                        <Brain className="w-3 h-3 mr-1 text-primary" />
                        <span className="text-muted-foreground">Click campaigns with AI Ready badge for recommendations</span>
                      </div>
                    </div>
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
          </Tabs>
        </div>
      </main>

      <CreateCampaignModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}
