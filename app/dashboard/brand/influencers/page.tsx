"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandSidebar } from "@/components/brand-sidebar"
import { csvInfluencerService, type InfluencerData } from "@/lib/csv-reader"
import { 
  Users, 
  Heart, 
  Eye, 
  MapPin, 
  Search, 
  Filter, 
  MessageCircle, 
  Plus, 
  Loader2,
  Star,
  DollarSign,
  Crown,
  Flame,
  CheckCircle
} from "lucide-react"

export default function InfluencerListPage() {
  const [influencers, setInfluencers] = useState<InfluencerData[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<InfluencerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")

  useEffect(() => {
    loadInfluencers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [influencers, searchQuery, selectedNiche, selectedLocation, selectedTier])

  const loadInfluencers = async () => {
    try {
      setIsLoading(true)
      const data = await csvInfluencerService.loadInfluencers()
      setInfluencers(data)
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
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(influencer =>
        influencer.username_instagram.toLowerCase().includes(searchTerm) ||
        influencer.expertise_field.toLowerCase().includes(searchTerm) ||
        influencer.influencer_id.toLowerCase().includes(searchTerm)
      )
    }

    // Niche filter (expertise field)
    if (selectedNiche !== "all") {
      filtered = filtered.filter(influencer =>
        influencer.expertise_field.toLowerCase().includes(selectedNiche.toLowerCase())
      )
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(influencer =>
        influencer.audience_analytics?.top_locations?.cities?.some(city =>
          city.city.toLowerCase().includes(selectedLocation.toLowerCase())
        ) || influencer.audience_analytics?.top_locations?.countries?.some(country =>
          country.country.toLowerCase().includes(selectedLocation.toLowerCase())
        )
      )
    }

    // Tier filter
    if (selectedTier !== "all") {
      filtered = filtered.filter(influencer => influencer.tier_followers === selectedTier)
    }

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

  const getTopLocation = (analytics: any): string => {
    if (!analytics?.top_locations?.cities?.length) return 'Unknown'
    return analytics.top_locations.cities[0].city
  }

  // Get unique expertise fields for filter
  const uniqueExpertiseFields = [...new Set(influencers.map(inf => inf.expertise_field))].slice(0, 10)
  const uniqueLocations = [...new Set(
    influencers.flatMap(inf => inf.audience_analytics?.top_locations?.cities?.map(city => city.city) || [])
  )].slice(0, 10)

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
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
                    {uniqueExpertiseFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
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
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading influencers...
                </span>
              ) : (
                `Showing ${filteredInfluencers.length} of ${influencers.length} influencers`
              )}
            </p>
          </div>

          {/* Influencer Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span className="text-lg">Loading influencers from CSV...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfluencers.map((influencer, index) => (
                <Card key={influencer.influencer_id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {influencer.username_instagram.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg flex items-center">
                              {influencer.tier_followers === 'Mega' && (
                                <Crown className="w-4 h-4 mr-1 text-purple-600" />
                              )}
                              @{influencer.username_instagram}
                              {influencer.trending_status && (
                                <Flame className="w-3 h-3 ml-1 text-orange-500" />
                              )}
                            </h3>
                            <Badge className={getTierColor(influencer.tier_followers)} variant="outline">
                              {influencer.tier_followers}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{influencer.influencer_id}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {getTopLocation(influencer.audience_analytics)}
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
                        <p className="text-lg font-semibold">{csvInfluencerService.getFollowerEstimate(influencer.tier_followers)}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-primary mb-1">
                          <Heart className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-semibold">{(influencer.engagement_rate_pct * 100).toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-primary mb-1">
                          <Eye className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-semibold">{formatNumber(influencer.avg_reels_views)}</p>
                        <p className="text-xs text-muted-foreground">Avg Views</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-primary mb-1">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-semibold">{formatNumber(influencer.avg_comment)}</p>
                        <p className="text-xs text-muted-foreground">Avg Comments</p>
                      </div>
                    </div>

                    {/* Niches */}
                    <div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {influencer.expertise_field}
                        </Badge>
                      </div>
                    </div>

                    {/* Rate Cards & Actions */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Rate Cards</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-sm font-semibold">{formatCurrency(influencer.rate_card_story)}</p>
                            <p className="text-xs text-muted-foreground">Story</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-sm font-semibold">{formatCurrency(influencer.rate_card_feeds)}</p>
                            <p className="text-xs text-muted-foreground">Feeds</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-sm font-semibold">{formatCurrency(influencer.rate_card_reels)}</p>
                            <p className="text-xs text-muted-foreground">Reels</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info & Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm">
                            Invite
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredInfluencers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No influencers found matching your criteria</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedNiche("all")
                    setSelectedLocation("all")
                    setSelectedTier("all")
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
