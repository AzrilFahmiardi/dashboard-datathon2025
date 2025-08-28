"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BrandSidebar } from "@/components/brand-sidebar"
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
  MoreHorizontal
} from "lucide-react"

// Mock data untuk campaigns
const campaigns = [
  {
    id: 1,
    name: "Summer Beauty Collection 2024",
    description: "Promoting our new summer skincare line with top beauty influencers",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-02-29",
    budget: "Rp 150,000,000",
    spent: "Rp 89,000,000",
    progress: 65,
    influencersCount: 8,
    postsCount: 24,
    totalReach: "2.5M",
    engagement: "4.2%",
    influencers: [
      { name: "Sarah Beauty", avatar: "/placeholder.svg", status: "completed" },
      { name: "Maya Lifestyle", avatar: "/placeholder.svg", status: "in-progress" },
      { name: "Rina Skincare", avatar: "/placeholder.svg", status: "completed" }
    ],
    category: "Beauty",
    priority: "high"
  },
  {
    id: 2,
    name: "Tech Gadget Launch",
    description: "Launching our latest smartphone with tech reviewers and lifestyle creators",
    status: "completed",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    budget: "Rp 200,000,000", 
    spent: "Rp 195,000,000",
    progress: 100,
    influencersCount: 12,
    postsCount: 36,
    totalReach: "3.8M",
    engagement: "5.1%",
    influencers: [
      { name: "Alex Tech", avatar: "/placeholder.svg", status: "completed" },
      { name: "Dika Fashion", avatar: "/placeholder.svg", status: "completed" },
      { name: "Luna Food", avatar: "/placeholder.svg", status: "completed" }
    ],
    category: "Technology",
    priority: "medium"
  },
  {
    id: 3,
    name: "Fashion Week Collaboration",
    description: "Partnering with fashion influencers for our spring collection showcase",
    status: "planning",
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    budget: "Rp 300,000,000",
    spent: "Rp 0",
    progress: 15,
    influencersCount: 15,
    postsCount: 0,
    totalReach: "0",
    engagement: "0%",
    influencers: [
      { name: "Maya Lifestyle", avatar: "/placeholder.svg", status: "pending" },
      { name: "Dika Fashion", avatar: "/placeholder.svg", status: "pending" }
    ],
    category: "Fashion",
    priority: "high"
  },
  {
    id: 4,
    name: "Healthy Lifestyle Campaign",
    description: "Promoting wellness and healthy living with fitness and food influencers",
    status: "active",
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    budget: "Rp 120,000,000",
    spent: "Rp 45,000,000",
    progress: 38,
    influencersCount: 6,
    postsCount: 12,
    totalReach: "1.2M",
    engagement: "6.8%",
    influencers: [
      { name: "Luna Food", avatar: "/placeholder.svg", status: "in-progress" }
    ],
    category: "Lifestyle",
    priority: "medium"
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "planning":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function MyCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !selectedStatus || campaign.status === selectedStatus
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const activeCampaigns = campaigns.filter(c => c.status === "active").length
  const completedCampaigns = campaigns.filter(c => c.status === "completed").length
  const totalBudget = campaigns.reduce((acc, c) => acc + parseInt(c.budget.replace(/[^0-9]/g, "")), 0)
  const totalSpent = campaigns.reduce((acc, c) => acc + parseInt(c.spent.replace(/[^0-9]/g, "")), 0)

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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">
                  {completedCampaigns} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {(totalBudget / 1000000).toFixed(0)}M</div>
                <p className="text-xs text-muted-foreground">
                  Rp {(totalSpent / 1000000).toFixed(0)}M spent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.7%</div>
                <p className="text-xs text-muted-foreground">
                  Engagement rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Campaigns</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
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
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-xl">{campaign.name}</CardTitle>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(campaign.priority)}>
                              {campaign.priority} priority
                            </Badge>
                          </div>
                          <CardDescription>{campaign.description}</CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {campaign.startDate} - {campaign.endDate}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {campaign.influencersCount} influencers
                            </div>
                            <Badge variant="outline">{campaign.category}</Badge>
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
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.budget}</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Target className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.spent}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Eye className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.totalReach}</p>
                          <p className="text-xs text-muted-foreground">Total Reach</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Heart className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.engagement}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.postsCount}</p>
                          <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                      </div>

                      {/* Influencers */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Participating Influencers</h4>
                        <div className="flex items-center space-x-4">
                          {campaign.influencers.slice(0, 3).map((influencer, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={influencer.avatar} />
                                <AvatarFallback>
                                  {influencer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{influencer.name}</span>
                              {influencer.status === "completed" && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {influencer.status === "in-progress" && (
                                <Clock className="w-4 h-4 text-blue-500" />
                              )}
                              {influencer.status === "pending" && (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                          {campaign.influencers.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{campaign.influencers.length - 3} more
                            </span>
                          )}
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
                        <Button variant="outline" size="sm">
                          View Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "active").map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-xl">{campaign.name}</CardTitle>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(campaign.priority)}>
                              {campaign.priority} priority
                            </Badge>
                          </div>
                          <CardDescription>{campaign.description}</CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {campaign.startDate} - {campaign.endDate}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {campaign.influencersCount} influencers
                            </div>
                            <Badge variant="outline">{campaign.category}</Badge>
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
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.budget}</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Target className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.spent}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Eye className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.totalReach}</p>
                          <p className="text-xs text-muted-foreground">Total Reach</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Heart className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.engagement}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.postsCount}</p>
                          <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                      </div>

                      {/* Influencers */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Participating Influencers</h4>
                        <div className="flex items-center space-x-4">
                          {campaign.influencers.slice(0, 3).map((influencer, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={influencer.avatar} />
                                <AvatarFallback>
                                  {influencer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{influencer.name}</span>
                              {influencer.status === "completed" && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {influencer.status === "in-progress" && (
                                <Clock className="w-4 h-4 text-blue-500" />
                              )}
                              {influencer.status === "pending" && (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                          {campaign.influencers.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{campaign.influencers.length - 3} more
                            </span>
                          )}
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
                        <Button variant="outline" size="sm">
                          View Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "completed").map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-xl">{campaign.name}</CardTitle>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(campaign.priority)}>
                              {campaign.priority} priority
                            </Badge>
                          </div>
                          <CardDescription>{campaign.description}</CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {campaign.startDate} - {campaign.endDate}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {campaign.influencersCount} influencers
                            </div>
                            <Badge variant="outline">{campaign.category}</Badge>
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
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.budget}</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Target className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.spent}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Eye className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.totalReach}</p>
                          <p className="text-xs text-muted-foreground">Total Reach</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Heart className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.engagement}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.postsCount}</p>
                          <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                      </div>

                      {/* Influencers */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Participating Influencers</h4>
                        <div className="flex items-center space-x-4">
                          {campaign.influencers.slice(0, 3).map((influencer, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={influencer.avatar} />
                                <AvatarFallback>
                                  {influencer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{influencer.name}</span>
                              {influencer.status === "completed" && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {influencer.status === "in-progress" && (
                                <Clock className="w-4 h-4 text-blue-500" />
                              )}
                              {influencer.status === "pending" && (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                          {campaign.influencers.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{campaign.influencers.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          View Final Report
                        </Button>
                        <Button variant="outline" size="sm">
                          Archive Campaign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="planning">
              <div className="grid gap-6">
                {campaigns.filter(c => c.status === "planning").map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-xl">{campaign.name}</CardTitle>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(campaign.priority)}>
                              {campaign.priority} priority
                            </Badge>
                          </div>
                          <CardDescription>{campaign.description}</CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {campaign.startDate} - {campaign.endDate}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {campaign.influencersCount} influencers
                            </div>
                            <Badge variant="outline">{campaign.category}</Badge>
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
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.budget}</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Target className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.spent}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Eye className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.totalReach}</p>
                          <p className="text-xs text-muted-foreground">Total Reach</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <Heart className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.engagement}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-muted-foreground mb-1">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <p className="text-lg font-semibold">{campaign.postsCount}</p>
                          <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                      </div>

                      {/* Influencers */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Target Influencers</h4>
                        <div className="flex items-center space-x-4">
                          {campaign.influencers.slice(0, 3).map((influencer, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={influencer.avatar} />
                                <AvatarFallback>
                                  {influencer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{influencer.name}</span>
                              {influencer.status === "completed" && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {influencer.status === "in-progress" && (
                                <Clock className="w-4 h-4 text-blue-500" />
                              )}
                              {influencer.status === "pending" && (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                          {campaign.influencers.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{campaign.influencers.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          Edit Plan
                        </Button>
                        <Button variant="outline" size="sm">
                          Launch Campaign
                        </Button>
                        <Button variant="outline" size="sm">
                          Invite Influencers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
