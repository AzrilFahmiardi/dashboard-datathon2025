"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandSidebar } from "@/components/brand-sidebar"
import { Users, Heart, Eye, MapPin, Search, Filter, MessageCircle, Instagram, Plus } from "lucide-react"

// Mock data untuk influencers
const influencers = [
  {
    id: 1,
    name: "Sarah Beauty",
    username: "@sarahbeauty",
    avatar: "/placeholder.svg?height=60&width=60",
    followers: "125K",
    engagement: "4.2%",
    averageViews: "45K",
    niche: ["Beauty", "Skincare"],
    location: "Jakarta, Indonesia",
    price: "Rp 15,000,000",
    verified: true
  },
  {
    id: 2,
    name: "Maya Lifestyle",
    username: "@mayalifestyle", 
    avatar: "/placeholder.svg?height=60&width=60",
    followers: "89K",
    engagement: "5.1%",
    averageViews: "32K",
    niche: ["Lifestyle", "Fashion"],
    location: "Bandung, Indonesia",
    price: "Rp 12,000,000",
    verified: true
  },
  {
    id: 3,
    name: "Rina Skincare",
    username: "@rinaskincare",
    avatar: "/placeholder.svg?height=60&width=60",
    followers: "156K",
    engagement: "3.8%",
    averageViews: "58K",
    niche: ["Skincare", "Beauty"],
    location: "Surabaya, Indonesia",
    price: "Rp 18,000,000",
    verified: false
  },
  {
    id: 4,
    name: "Dika Fashion",
    username: "@dikafashion",
    avatar: "/placeholder.svg?height=60&width=60",
    followers: "203K",
    engagement: "4.5%",
    averageViews: "72K",
    niche: ["Fashion", "Lifestyle"],
    location: "Jakarta, Indonesia", 
    price: "Rp 22,000,000",
    verified: true
  },
  {
    id: 5,
    name: "Alex Tech",
    username: "@alextech",
    avatar: "/placeholder.svg?height=60&width=60",
    followers: "95K",
    engagement: "6.2%",
    averageViews: "41K",
    niche: ["Technology", "Reviews"],
    location: "Yogyakarta, Indonesia",
    price: "Rp 14,000,000",
    verified: true
  },
  {
    id: 6,
    name: "Luna Food",
    username: "@lunafood",
    avatar: "/placeholder.svg?height=60&width=60",
    followers: "78K",
    engagement: "7.1%",
    averageViews: "28K",
    niche: ["Food", "Lifestyle"],
    location: "Bali, Indonesia",
    price: "Rp 11,000,000",
    verified: false
  }
]

export default function InfluencerListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  const filteredInfluencers = influencers.filter(influencer => {
    const matchesSearch = influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         influencer.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesNiche = selectedNiche === "all" || influencer.niche.includes(selectedNiche)
    const matchesLocation = selectedLocation === "all" || influencer.location.includes(selectedLocation)
    
    return matchesSearch && matchesNiche && matchesLocation
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Skincare">Skincare</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
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
                    <SelectItem value="Bali">Bali</SelectItem>
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
                          {influencer.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Instagram className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
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
                  <div className="grid grid-cols-3 gap-4 text-center">
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

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-lg font-bold text-primary">{influencer.price}</p>
                      <p className="text-xs text-muted-foreground">Starting price</p>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
