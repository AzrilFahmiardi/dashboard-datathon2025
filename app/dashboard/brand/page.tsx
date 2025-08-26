"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Target, DollarSign, MapPin, Heart, Eye, Plus, Filter, Search } from "lucide-react"
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

export default function BrandDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
                <Progress value={72} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Rp 36M dari Rp 50M</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audience Match</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88%</div>
                <p className="text-xs text-muted-foreground">+12% dari campaign sebelumnya</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.4%</div>
                <p className="text-xs text-muted-foreground">Above industry average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potential Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245K</div>
                <p className="text-xs text-muted-foreground">Estimated total reach</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="recommendations">Top Recommendations</TabsTrigger>
              <TabsTrigger value="campaign">Campaign Summary</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Cari influencer..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>

              {/* Top Influencer Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Influencer Recommendations</CardTitle>
                  <CardDescription>Influencer terbaik berdasarkan campaign {campaignData.product_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topInfluencers.map((influencer) => (
                      <div
                        key={influencer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {influencer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{influencer.name}</h4>
                            <p className="text-sm text-muted-foreground">{influencer.username}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {influencer.followers}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {influencer.engagement}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {influencer.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Match: {influencer.audienceMatch}%</Badge>
                            <Badge variant="outline">Reach: {influencer.estimatedReach}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold">{influencer.price}</span>
                            <Button size="sm">Select</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaign" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Summary</CardTitle>
                  <CardDescription>Detail campaign {campaignData.product_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Product Information</h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Brand:</span> {campaignData.brand_name}
                        </p>
                        <p>
                          <span className="font-medium">Product:</span> {campaignData.product_name}
                        </p>
                        <p>
                          <span className="font-medium">Industry:</span> {campaignData.industry}
                        </p>
                        <p>
                          <span className="font-medium">USP:</span> {campaignData.usp}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Campaign Details</h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Budget:</span> Rp {campaignData.budget.toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Target Influencers:</span> {campaignData.total_influencer}
                        </p>
                        <p>
                          <span className="font-medium">Risk Tolerance:</span> {campaignData.risk_tolerance}
                        </p>
                        <div>
                          <span className="font-medium">Niche:</span>
                          <div className="flex space-x-2 mt-1">
                            {campaignData.niche.map((n) => (
                              <Badge key={n} variant="secondary">
                                {n}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">ESG Alignment</h4>
                    <div className="flex space-x-2">
                      {campaignData.esg_allignment.map((esg) => (
                        <Badge key={esg} variant="outline">
                          {esg}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Target Locations</h4>
                    <div className="flex space-x-2">
                      {campaignData.location_prior.map((location) => (
                        <Badge key={location} variant="secondary">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget vs Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Chart placeholder - Budget progression over time
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement vs Reach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Chart placeholder - Engagement rate vs reach comparison
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Content Deliverables Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Reels</span>
                        <span>3/4</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Feeds</span>
                        <span>2/2</span>
                      </div>
                      <Progress value={100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CreateCampaignModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}
