  
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Heart, Eye, MapPin, Edit, Camera, Video, ImageIcon, TrendingUp } from "lucide-react"
import { InfluencerSidebar } from "@/components/influencer-sidebar"

// Mock data untuk influencer profile
const influencerProfile = {
  name: "Sarah Beauty",
  username: "@sarahbeauty",
  avatar: "/placeholder.svg?height=80&width=80",
  followers: 125000,
  engagement: 4.2,
  topNiches: ["Beauty", "Skincare", "Lifestyle"],
  location: "Jakarta, Indonesia",
  bio: "Beauty enthusiast & skincare expert. Sharing honest reviews and tips for glowing skin ✨",
  contentTypes: ["Reels", "Feeds", "Stories"],
  audienceDemographic: {
    ageGroups: [
      { range: "18-24", percentage: 35 },
      { range: "25-34", percentage: 45 },
      { range: "35-44", percentage: 20 },
    ],
    gender: { female: 78, male: 22 },
    topLocations: ["Jakarta", "Bandung", "Surabaya", "Medan"],
  },
  usp: "Authentic product reviews with before/after results. Focus on affordable skincare for Indonesian skin types.",
  averageViews: 45000,
  averageLikes: 3200,
  averageComments: 180,
}

const recentCampaigns = [
  {
    id: 1,
    brand: "Wardah",
    product: "Perfect Bright Serum",
    status: "Completed",
    earnings: "Rp 8,500,000",
    deliverables: "2 Reels, 1 Feed",
    date: "Jan 2025",
  },
  {
    id: 2,
    brand: "Somethinc",
    product: "Niacinamide Serum",
    status: "In Progress",
    earnings: "Rp 12,000,000",
    deliverables: "3 Reels, 2 Feeds",
    date: "Feb 2025",
  },
]

export default function InfluencerDashboard() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(influencerProfile)

  return (
    <div className="flex h-screen bg-background">
      <InfluencerSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Influencer</h1>
              <p className="text-muted-foreground">Kelola profil dan lihat campaign opportunities</p>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.followers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.engagement}%</div>
                <p className="text-xs text-muted-foreground">Above industry average</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.averageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Per post average</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 12M</div>
                <p className="text-xs text-muted-foreground">Campaign earnings</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile Management</TabsTrigger>
              <TabsTrigger value="preview">Profile Preview</TabsTrigger>
              <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your influencer profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="followers">Followers Count</Label>
                      <Input
                        id="followers"
                        type="number"
                        value={profile.followers}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, followers: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engagement">Engagement Rate (%)</Label>
                      <Input
                        id="engagement"
                        type="number"
                        step="0.1"
                        value={profile.engagement}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, engagement: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Top Niches</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.topNiches.map((niche) => (
                        <Badge key={niche} variant="secondary">
                          {niche}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          + Add Niche
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Content Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.contentTypes.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          + Add Type
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usp">Unique Selling Proposition</Label>
                    <Textarea
                      id="usp"
                      value={profile.usp}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, usp: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Profile Preview</CardTitle>
                  <CardDescription>How brands will see your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto border rounded-lg p-6 bg-card">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{profile.name}</h3>
                        <p className="text-muted-foreground">{profile.username}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {profile.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm mb-4">{profile.bio}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-semibold">{(profile.followers / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{profile.engagement}%</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{(profile.averageViews / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-muted-foreground">Avg Views</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Niches</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.topNiches.map((niche) => (
                            <Badge key={niche} variant="secondary" className="text-xs">
                              {niche}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Content Types</div>
                        <div className="flex space-x-2">
                          {profile.contentTypes.includes("Reels") && (
                            <Video className="w-4 h-4 text-muted-foreground" />
                          )}
                          {profile.contentTypes.includes("Feeds") && (
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                          {profile.contentTypes.includes("Stories") && (
                            <Camera className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4">Contact Influencer</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>My Campaigns</CardTitle>
                  <CardDescription>Track your campaign history and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                        <div>
                          <h4 className="font-semibold">{campaign.brand}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.product}</p>
                          <p className="text-xs text-muted-foreground mt-1">{campaign.deliverables}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={campaign.status === "Completed" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">{campaign.earnings}</p>
                          <p className="text-xs text-muted-foreground">{campaign.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Audience Demographics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Age Groups</h4>
                        {profile.audienceDemographic.ageGroups.map((group) => (
                          <div key={group.range} className="flex justify-between items-center mb-1">
                            <span className="text-sm">{group.range}</span>
                            <span className="text-sm font-medium">{group.percentage}%</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Gender Split</h4>
                        <div className="flex justify-between">
                          <span className="text-sm">Female: {profile.audienceDemographic.gender.female}%</span>
                          <span className="text-sm">Male: {profile.audienceDemographic.gender.male}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {profile.audienceDemographic.topLocations.map((location, index) => (
                        <div key={location} className="flex justify-between items-center">
                          <span className="text-sm">{location}</span>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
