"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { csvInfluencerService, type InfluencerData } from "@/lib/csv-reader"
import { 
  Search, 
  Filter, 
  Users, 
  Heart, 
  Eye, 
  MapPin, 
  Crown, 
  Star, 
  Loader2,
  TrendingUp,
  Award,
  BarChart3,
  DollarSign,
  CheckCircle,
  Flame
} from "lucide-react"

export function InfluencerList() {
  const [influencers, setInfluencers] = useState<InfluencerData[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<InfluencerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [expertiseFilter, setExpertiseFilter] = useState("all")
  const [specialFilter, setSpecialFilter] = useState("all")
  const [sortBy, setSortBy] = useState<'engagement' | 'views' | 'likes' | 'rate_reels'>('engagement')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadInfluencers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [influencers, searchQuery, tierFilter, expertiseFilter, specialFilter, sortBy])

  const loadInfluencers = async () => {
    try {
      setIsLoading(true)
      const data = await csvInfluencerService.loadInfluencers()
      setInfluencers(data)
      setStats(csvInfluencerService.getStats())
    } catch (error) {
      console.error('Error loading influencers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...influencers]

    // Search filter
    if (searchQuery) {
      filtered = csvInfluencerService.searchInfluencers(searchQuery)
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = csvInfluencerService.filterByTier(tierFilter)
    }

    // Expertise filter
    if (expertiseFilter !== "all") {
      filtered = csvInfluencerService.filterByExpertise(expertiseFilter)
    }

    // Special filters
    if (specialFilter === "trending") {
      filtered = filtered.filter(inf => inf.trending_status)
    } else if (specialFilter === "successful") {
      filtered = filtered.filter(inf => inf.campaign_success_signif)
    }

    // Apply search to filtered results
    if (searchQuery && (tierFilter !== "all" || expertiseFilter !== "all" || specialFilter !== "all")) {
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(inf =>
        inf.username_instagram.toLowerCase().includes(searchTerm) ||
        inf.expertise_field.toLowerCase().includes(searchTerm) ||
        inf.influencer_id.toLowerCase().includes(searchTerm)
      )
    }

    // Sort
    filtered = filtered.sort((a, b) => {
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

    setFilteredInfluencers(filtered)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}K`
    return `Rp ${num}`
  }

  const getTierColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'mega': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'macro': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'mid': return 'bg-green-100 text-green-800 border-green-200'
      case 'micro': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'nano': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'neutral': return 'bg-gray-100 text-gray-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTopLocation = (analytics: any): string => {
    if (!analytics?.top_locations?.cities?.length) return 'Unknown'
    return analytics.top_locations.cities[0].city
  }

  const getTopAgeRange = (analytics: any): string => {
    if (!analytics?.age_range_overall?.length) return 'Unknown'
    return analytics.age_range_overall[0].range
  }

  // Get unique expertise fields for filter
  const uniqueExpertiseFields = [...new Set(influencers.map(inf => inf.expertise_field))].slice(0, 10)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading influencers data...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="text-sm font-medium text-foreground">Total Influencers</div>
              <div className="text-xs text-muted-foreground">Available in database</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <Flame className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center text-sm text-orange-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Hot
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{stats.trending}</div>
              <div className="text-sm font-medium text-foreground">Trending Now</div>
              <div className="text-xs text-muted-foreground">Popular influencers</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <Award className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{stats.successfulCampaigns}</div>
              <div className="text-sm font-medium text-foreground">Successful Campaigns</div>
              <div className="text-xs text-muted-foreground">Track record verified</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center text-sm text-blue-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                High
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{(stats.avgEngagement * 100).toFixed(1)}%</div>
              <div className="text-sm font-medium text-foreground">Avg Engagement</div>
              <div className="text-xs text-muted-foreground">Database average</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <Crown className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center text-sm text-purple-600">
                <Star className="h-3 w-3 mr-1" />
                Elite
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{stats.byTier.Mega + stats.byTier.Macro}</div>
              <div className="text-sm font-medium text-foreground">Macro+ Influencers</div>
              <div className="text-xs text-muted-foreground">High-reach creators</div>
            </div>
          </Card>
        </div>
      )}

      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Influencer Database
          </CardTitle>
          <CardDescription>
            Explore {stats?.total || 0} verified influencers with detailed analytics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by username, expertise, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Mega">Mega (1M+)</SelectItem>
                  <SelectItem value="Macro">Macro (500K+)</SelectItem>
                  <SelectItem value="Mid">Mid (100K+)</SelectItem>
                  <SelectItem value="Micro">Micro (10K+)</SelectItem>
                  <SelectItem value="Nano">Nano (1K+)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {uniqueExpertiseFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={specialFilter} onValueChange={setSpecialFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Special" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="views">Reel Views</SelectItem>
                  <SelectItem value="likes">Post Likes</SelectItem>
                  <SelectItem value="rate_reels">Rate Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Showing {filteredInfluencers.length} of {influencers.length} influencers</span>
            {specialFilter === "trending" && <Badge variant="outline" className="text-orange-600 border-orange-200">🔥 Trending Only</Badge>}
            {specialFilter === "successful" && <Badge variant="outline" className="text-green-600 border-green-200">✅ Successful Only</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInfluencers.map((influencer, index) => (
          <Card key={influencer.influencer_id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {influencer.username_instagram.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold flex items-center">
                      {influencer.tier_followers === 'Mega' && (
                        <Crown className="w-4 h-4 mr-1 text-purple-600" />
                      )}
                      @{influencer.username_instagram}
                      {influencer.trending_status && (
                        <Flame className="w-3 h-3 ml-1 text-orange-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{influencer.influencer_id}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getTierColor(influencer.tier_followers)} variant="outline">
                    {influencer.tier_followers}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <Heart className="w-3 h-3 mr-1" />
                      Engagement
                    </span>
                    <span className="font-medium">{(influencer.engagement_rate_pct * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <Eye className="w-3 h-3 mr-1" />
                      Avg Views
                    </span>
                    <span className="font-medium">{formatNumber(influencer.avg_reels_views)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Avg Likes
                    </span>
                    <span className="font-medium">{formatNumber(influencer.avg_post_like)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Rate (Reels)
                    </span>
                    <span className="font-medium">{formatCurrency(influencer.rate_card_reels)}</span>
                  </div>
                </div>

                {/* Expertise & Location */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {influencer.expertise_field}
                    </Badge>
                    <Badge className={getSentimentColor(influencer.likeability_sentiment)} variant="outline">
                      {influencer.likeability_sentiment}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {getTopLocation(influencer.audience_analytics)} • Age: {getTopAgeRange(influencer.audience_analytics)}
                  </div>
                </div>

                {/* Audience Estimate */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Followers:</span> {csvInfluencerService.getFollowerEstimate(influencer.tier_followers)}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-1">
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInfluencers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No influencers found matching your criteria</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("")
                setTierFilter("all")
                setExpertiseFilter("all")
                setSpecialFilter("all")
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
