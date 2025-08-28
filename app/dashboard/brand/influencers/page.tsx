"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandSidebar } from "@/components/brand-sidebar"
import { Users, Heart, Eye, MapPin, Search, Filter, MessageCircle, Plus } from "lucide-react"

// Mock data untuk influencers berdasarkan data real
const influencers = [
  {
    id: 1,
    name: "Rere Onni",
    username: "@rereeonni",
    influencerId: "INF001",
    avatar: "/placeholder.svg?height=60&width=60",
    tier: "Nano",
    followers: "85K", // Nano tier
    engagement: "3.7%",
    averageViews: "13K",
    avgPostLike: "2.1K",
    avgComment: "389",
    niche: ["Lifestyle"],
    location: "Semarang, Indonesia",
    rateCardStory: "Rp 300,000",
    rateCardFeeds: "Rp 800,000", 
    rateCardReels: "Rp 1,800,000",
    verified: false,
    trendingStatus: true,
    likeabilitySentiment: "Positive",
    familiarityMedia: 90,
    campaignSuccess: false,
    hasRelevantHistory: false,
    behaviorConsistency: true,
    randomEndorseRate: 0.35,
    audienceAnalytics: {
      topLocations: {
        countries: [
          { country: "Indonesia", percent: 80 },
          { country: "Thailand", percent: 14 },
          { country: "Malaysia", percent: 6 }
        ],
        cities: [
          { city: "Semarang", percent: 42 },
          { city: "Bandung", percent: 34 },
          { city: "Jakarta", percent: 24 }
        ]
      },
      ageRange: [
        { range: "35-44", percent: 45 },
        { range: "13-17", percent: 31 },
        { range: "25-34", percent: 9 }
      ],
      gender: [
        { gender: "Female", percent: 81 },
        { gender: "Male", percent: 18 },
        { gender: "Unspecified", percent: 1 }
      ]
    }
  },
  {
    id: 2,
    name: "Nicole Trisia",
    username: "@nicoletrisia",
    influencerId: "INF002",
    avatar: "/placeholder.svg?height=60&width=60",
    tier: "Nano",
    followers: "92K",
    engagement: "2.2%",
    averageViews: "32K",
    avgPostLike: "4.6K",
    avgComment: "483",
    niche: ["Food"],
    location: "Jakarta, Indonesia",
    rateCardStory: "Rp 320,000",
    rateCardFeeds: "Rp 780,000",
    rateCardReels: "Rp 1,900,000",
    verified: true,
    trendingStatus: true,
    likeabilitySentiment: "Neutral",
    familiarityMedia: 82,
    campaignSuccess: false,
    hasRelevantHistory: true,
    behaviorConsistency: false,
    randomEndorseRate: 0.55,
    audienceAnalytics: {
      topLocations: {
        countries: [
          { country: "Indonesia", percent: 85 },
          { country: "Singapore", percent: 10 },
          { country: "Malaysia", percent: 5 }
        ],
        cities: [
          { city: "Jakarta", percent: 55 },
          { city: "Surabaya", percent: 25 },
          { city: "Bandung", percent: 20 }
        ]
      },
      ageRange: [
        { range: "25-34", percent: 42 },
        { range: "18-24", percent: 35 },
        { range: "35-44", percent: 23 }
      ],
      gender: [
        { gender: "Female", percent: 75 },
        { gender: "Male", percent: 23 },
        { gender: "Unspecified", percent: 2 }
      ]
    }
  },
  {
    id: 3,
    name: "Fransiska Sonia",
    username: "@fransiskasonia",
    influencerId: "INF003",
    avatar: "/placeholder.svg?height=60&width=60",
    tier: "Nano",
    followers: "78K",
    engagement: "5.3%",
    averageViews: "21K",
    avgPostLike: "4.1K",
    avgComment: "199",
    niche: ["Fashion"],
    location: "Bandung, Indonesia",
    rateCardStory: "Rp 310,000",
    rateCardFeeds: "Rp 820,000",
    rateCardReels: "Rp 1,850,000",
    verified: false,
    trendingStatus: false,
    likeabilitySentiment: "Neutral",
    familiarityMedia: 81,
    campaignSuccess: true,
    hasRelevantHistory: false,
    behaviorConsistency: false,
    randomEndorseRate: 0.24,
    audienceAnalytics: {
      topLocations: {
        countries: [
          { country: "Indonesia", percent: 88 },
          { country: "Malaysia", percent: 8 },
          { country: "Singapore", percent: 4 }
        ],
        cities: [
          { city: "Bandung", percent: 48 },
          { city: "Jakarta", percent: 32 },
          { city: "Yogyakarta", percent: 20 }
        ]
      },
      ageRange: [
        { range: "18-24", percent: 52 },
        { range: "25-34", percent: 38 },
        { range: "13-17", percent: 10 }
      ],
      gender: [
        { gender: "Female", percent: 87 },
        { gender: "Male", percent: 12 },
        { gender: "Unspecified", percent: 1 }
      ]
    }
  },
  {
    id: 4,
    name: "Maya Sari",
    username: "@mayasari",
    influencerId: "INF004",
    avatar: "/placeholder.svg?height=60&width=60",
    tier: "Micro",
    followers: "156K",
    engagement: "4.1%",
    averageViews: "45K",
    avgPostLike: "6.4K",
    avgComment: "542",
    niche: ["Beauty", "Skincare"],
    location: "Jakarta, Indonesia",
    rateCardStory: "Rp 500,000",
    rateCardFeeds: "Rp 1,200,000",
    rateCardReels: "Rp 2,800,000",
    verified: true,
    trendingStatus: true,
    likeabilitySentiment: "Positive",
    familiarityMedia: 92,
    campaignSuccess: true,
    hasRelevantHistory: true,
    behaviorConsistency: true,
    randomEndorseRate: 0.15,
    audienceAnalytics: {
      topLocations: {
        countries: [
          { country: "Indonesia", percent: 82 },
          { country: "Malaysia", percent: 12 },
          { country: "Singapore", percent: 6 }
        ],
        cities: [
          { city: "Jakarta", percent: 45 },
          { city: "Surabaya", percent: 28 },
          { city: "Bandung", percent: 27 }
        ]
      },
      ageRange: [
        { range: "25-34", percent: 48 },
        { range: "18-24", percent: 32 },
        { range: "35-44", percent: 20 }
      ],
      gender: [
        { gender: "Female", percent: 89 },
        { gender: "Male", percent: 10 },
        { gender: "Unspecified", percent: 1 }
      ]
    }
  },
  {
    id: 5,
    name: "Andi Pratama",
    username: "@andipratama",
    influencerId: "INF005",
    avatar: "/placeholder.svg?height=60&width=60",
    tier: "Micro",
    followers: "203K",
    engagement: "3.8%",
    averageViews: "58K",
    avgPostLike: "7.7K",
    avgComment: "423",
    niche: ["Technology", "Lifestyle"],
    location: "Surabaya, Indonesia",
    rateCardStory: "Rp 650,000",
    rateCardFeeds: "Rp 1,500,000",
    rateCardReels: "Rp 3,200,000",
    verified: true,
    trendingStatus: false,
    likeabilitySentiment: "Positive",
    familiarityMedia: 76,
    campaignSuccess: true,
    hasRelevantHistory: true,
    behaviorConsistency: true,
    randomEndorseRate: 0.28,
    audienceAnalytics: {
      topLocations: {
        countries: [
          { country: "Indonesia", percent: 78 },
          { country: "Malaysia", percent: 15 },
          { country: "Thailand", percent: 7 }
        ],
        cities: [
          { city: "Surabaya", percent: 38 },
          { city: "Jakarta", percent: 35 },
          { city: "Malang", percent: 27 }
        ]
      },
      ageRange: [
        { range: "18-24", percent: 45 },
        { range: "25-34", percent: 35 },
        { range: "13-17", percent: 20 }
      ],
      gender: [
        { gender: "Male", percent: 65 },
        { gender: "Female", percent: 33 },
        { gender: "Unspecified", percent: 2 }
      ]
    }
  },
  {
    id: 6,
    name: "Lisa Cooking",
    username: "@lisacooking",
    influencerId: "INF006",
    avatar: "/placeholder.svg?height=60&width=60",
    tier: "Nano",
    followers: "64K",
    engagement: "6.2%",
    averageViews: "28K",
    avgPostLike: "3.9K",
    avgComment: "312",
    niche: ["Food", "Cooking"],
    location: "Yogyakarta, Indonesia",
    rateCardStory: "Rp 280,000",
    rateCardFeeds: "Rp 750,000",
    rateCardReels: "Rp 1,650,000",
    verified: false,
    trendingStatus: true,
    likeabilitySentiment: "Positive",
    familiarityMedia: 87,
    campaignSuccess: false,
    hasRelevantHistory: false,
    behaviorConsistency: true,
    randomEndorseRate: 0.42,
    audienceAnalytics: {
      topLocations: {
        countries: [
          { country: "Indonesia", percent: 91 },
          { country: "Malaysia", percent: 6 },
          { country: "Singapore", percent: 3 }
        ],
        cities: [
          { city: "Yogyakarta", percent: 52 },
          { city: "Solo", percent: 28 },
          { city: "Jakarta", percent: 20 }
        ]
      },
      ageRange: [
        { range: "25-34", percent: 42 },
        { range: "35-44", percent: 38 },
        { range: "18-24", percent: 20 }
      ],
      gender: [
        { gender: "Female", percent: 84 },
        { gender: "Male", percent: 15 },
        { gender: "Unspecified", percent: 1 }
      ]
    }
  }
]

export default function InfluencerListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")

  const filteredInfluencers = influencers.filter(influencer => {
    const matchesSearch = influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         influencer.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesNiche = selectedNiche === "all" || influencer.niche.includes(selectedNiche)
    const matchesLocation = selectedLocation === "all" || influencer.location.includes(selectedLocation)
    const matchesTier = selectedTier === "all" || influencer.tier === selectedTier
    
    return matchesSearch && matchesNiche && matchesLocation && matchesTier
  })

  return (
    <div className="flex h-screen bg-background">
      <BrandSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Influencer List</h1>
              <p className="text-muted-foreground">Discover and manage your influencer network</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Influencer
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search influencers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Nano">Nano (50K-100K)</SelectItem>
                    <SelectItem value="Micro">Micro (100K-500K)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Skincare">Skincare</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Cooking">Cooking</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Jakarta">Jakarta</SelectItem>
                    <SelectItem value="Bandung">Bandung</SelectItem>
                    <SelectItem value="Surabaya">Surabaya</SelectItem>
                    <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                    <SelectItem value="Semarang">Semarang</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing {filteredInfluencers.length} of {influencers.length} influencers
            </p>
          </div>

          {/* Influencer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer) => (
              <Card key={influencer.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={influencer.avatar} />
                        <AvatarFallback>
                          {influencer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{influencer.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {influencer.tier}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{influencer.username}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {influencer.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center text-primary mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-semibold">{influencer.followers}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-primary mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-semibold">{influencer.engagement}</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-primary mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-semibold">{influencer.averageViews}</p>
                      <p className="text-xs text-muted-foreground">Avg Views</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-primary mb-1">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-semibold">{influencer.avgComment}</p>
                      <p className="text-xs text-muted-foreground">Avg Comments</p>
                    </div>
                  </div>

                  {/* Niches */}
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {influencer.niche.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Rate Cards & Actions */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Rate Cards</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-sm font-semibold">{influencer.rateCardStory}</p>
                          <p className="text-xs text-muted-foreground">Story</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-sm font-semibold">{influencer.rateCardFeeds}</p>
                          <p className="text-xs text-muted-foreground">Feeds</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-sm font-semibold">{influencer.rateCardReels}</p>
                          <p className="text-xs text-muted-foreground">Reels</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm">
                        Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
