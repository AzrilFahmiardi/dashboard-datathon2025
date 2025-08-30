"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, User, Building, Mail, Globe, MapPin, Camera } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "react-hot-toast"

interface BrandProfileData {
  username: string
  email: string
  industry: string
  companyName: string
  website: string
  description: string
  location: string
  logoUrl?: string
}

export function BrandProfileForm() {
  const { user, profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState<BrandProfileData>({
    username: '',
    email: '',
    industry: '',
    companyName: '',
    website: '',
    description: '',
    location: '',
    logoUrl: ''
  })

  // Industry options
  const industryOptions = [
    "Beauty & Cosmetics",
    "Fashion & Apparel", 
    "Food & Beverage",
    "Technology",
    "Health & Wellness",
    "Travel & Tourism",
    "Automotive",
    "Finance",
    "Education", 
    "Entertainment",
    "Sports & Fitness",
    "Home & Garden",
    "Pet Care",
    "Baby & Kids",
    "Electronics",
    "Books & Media",
    "Art & Crafts",
    "Jewelry & Accessories",
    "Photography",
    "Music",
    "Gaming",
    "Real Estate",
    "Professional Services",
    "Non-Profit",
    "Other"
  ]

  // Location options (countries/regions)
  const locationOptions = [
    "Indonesia",
    "Malaysia", 
    "Singapore",
    "Thailand",
    "Philippines",
    "Vietnam",
    "Brunei",
    "Cambodia",
    "Laos",
    "Myanmar",
    "Global"
  ]

  useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || '',
        email: user?.email || '',
        industry: profile.industry || '',
        companyName: profile.companyName || '',
        website: profile.website || '',
        description: profile.description || '',
        location: profile.location || '',
        logoUrl: profile.logoUrl || ''
      })
    }
  }, [profile, user])

  const handleInputChange = (field: keyof BrandProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (!user) {
        toast.error('You must be logged in to update profile')
        return
      }

      // Validate required fields
      if (!profileData.username || !profileData.industry) {
        toast.error('Username and industry are required')
        return
      }

      // Update profile using auth context
      await updateProfile({
        username: profileData.username,
        industry: profileData.industry,
        companyName: profileData.companyName,
        website: profileData.website,
        description: profileData.description,
        location: profileData.location,
        logoUrl: profileData.logoUrl
      })

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Brand Profile
          </CardTitle>
          <CardDescription>
            Manage your brand information and preferences. This information will be used in your campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profileData.logoUrl} alt="Brand Logo" />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(profileData.username || profileData.companyName || 'B')}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="text-xs">
                <Camera className="w-3 h-3 mr-1" />
                Change Logo
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Brand Username *</Label>
                  <Input
                    id="username"
                    placeholder="e.g., avoskin_official"
                    value={profileData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Avoskin Beauty"
                  value={profileData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={profileData.industry} 
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.example.com"
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Primary Location</Label>
                <Select 
                  value={profileData.location} 
                  onValueChange={(value) => handleInputChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Brand Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your brand, mission, and what makes you unique..."
                rows={4}
                value={profileData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Profile Status */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium mb-2">Profile Completeness</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={profileData.username ? "default" : "secondary"}>
                  {profileData.username ? "✓" : "○"} Username
                </Badge>
                <Badge variant={profileData.industry ? "default" : "secondary"}>
                  {profileData.industry ? "✓" : "○"} Industry
                </Badge>
                <Badge variant={profileData.companyName ? "default" : "secondary"}>
                  {profileData.companyName ? "✓" : "○"} Company Name
                </Badge>
                <Badge variant={profileData.description ? "default" : "secondary"}>
                  {profileData.description ? "✓" : "○"} Description
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Complete your profile to create more effective campaigns
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
