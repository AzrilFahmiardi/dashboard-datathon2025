"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Loader2, Plus } from "lucide-react"
import { firebaseCampaignService, type CampaignData } from "@/lib/firebase-campaign"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "react-hot-toast"

interface CreateCampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCampaignCreated?: (campaign: CampaignData) => void
}

export function CreateCampaignModal({ open, onOpenChange, onCampaignCreated }: CreateCampaignModalProps) {
  const { user, profile } = useAuth()
  
  // Multi-select states
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedESG, setSelectedESG] = useState<string[]>([])
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([])
  const [selectedTargetGoals, setSelectedTargetGoals] = useState<string[]>([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  
  const [isLoading, setIsLoading] = useState(false)

  // Form state - removed brandName since it's from auth
  const [formData, setFormData] = useState({
    industry: '',
    productName: '',
    overview: '',
    usp: '',
    budget: '',
    influencerCount: '',
    deliverables: '',
    campaignDate: '',
    riskTolerance: 'Medium',
    influencerPersona: ''
  })

  // Options for dropdowns
  const availableNiches = ["Beauty", "Fashion", "Lifestyle", "Food", "Travel", "Technology", "Fitness", "Gaming", "Health", "Automotive"]
  const availableLocations = ["Indonesia", "Malaysia", "Singapore", "Thailand", "Philippines", "Vietnam", "Brunei"]
  const availableESG = ["Environmental", "Social", "Governance", "Sustainability", "Diversity", "Community Impact"]
  const availableContentTypes = ["Instagram Reels", "Instagram Feeds", "Instagram Stories", "TikTok Videos", "YouTube Shorts", "YouTube Videos"]
  const availableObjectives = ["Brand Awareness", "Lead Generation", "Sales", "Engagement", "Reach", "Traffic"]
  const availableTargetGoals = ["Awareness", "Consideration", "Conversion", "Retention", "Advocacy"]
  const availableAgeRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
  const availableGenders = ["Male", "Female", "All Genders"]
  const availableCities = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Kuala Lumpur", "Singapore", "Bangkok"]
  const availableRiskTolerance = ["Low", "Medium", "High"]

  // Multi-select handlers
  const handleMultiSelect = (value: string, currentSelection: string[], setSelection: (items: string[]) => void) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter(item => item !== value))
    } else {
      setSelection([...currentSelection, value])
    }
  }

  const removeFromSelection = (value: string, currentSelection: string[], setSelection: (items: string[]) => void) => {
    setSelection(currentSelection.filter(item => item !== value))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        industry: '',
        productName: '',
        overview: '',
        usp: '',
        budget: '',
        influencerCount: '',
        deliverables: '',
        campaignDate: '',
        riskTolerance: 'Medium',
        influencerPersona: ''
      })
      setSelectedNiches([])
      setSelectedLocations([])
      setSelectedESG([])
      setSelectedContentTypes([])
      setSelectedObjectives([])
      setSelectedTargetGoals([])
      setSelectedAgeRanges([])
      setSelectedGenders([])
      setSelectedCities([])
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user || !profile) {
        toast.error('You must be logged in to create a campaign')
        return
      }

      // Validate required fields
      if (!formData.productName || !formData.budget || !formData.influencerCount) {
        toast.error('Please fill in all required fields')
        return
      }

      if (selectedNiches.length === 0 || selectedLocations.length === 0) {
        toast.error('Please select at least one niche and location')
        return
      }

      // Generate brief ID and title
      const briefId = firebaseCampaignService.generateBriefId()
      const title = firebaseCampaignService.generateTitle(formData.productName, profile.username)

      // Calculate deliverables breakdown
      const deliverables = firebaseCampaignService.calculateDeliverables(
        selectedContentTypes.length > 0 ? selectedContentTypes : ["Instagram Reels", "Instagram Feeds"],
        parseInt(formData.deliverables) || 6
      )

      // Prepare campaign data
      const campaignData: Omit<CampaignData, 'id' | 'brand_id' | 'created_at' | 'updated_at'> = {
        brief_id: briefId,
        title: title,
        brand_name: profile.username, // From authenticated user profile
        industry: formData.industry,
        product_name: formData.productName,
        overview: formData.overview,
        usp: formData.usp,
        marketing_objective: selectedObjectives.length > 0 ? selectedObjectives : ["Brand Awareness", "Engagement"],
        target_goals: selectedTargetGoals.length > 0 ? selectedTargetGoals : ["Awareness", "Consideration"],
        timing_campaign: formData.campaignDate,
        audience_preference: {
          top_locations: {
            countries: selectedLocations,
            cities: selectedCities.length > 0 ? selectedCities : ["Jakarta", "Surabaya"]
          },
          age_range: selectedAgeRanges.length > 0 ? selectedAgeRanges : ["18-24", "25-34"],
          gender: selectedGenders.length > 0 ? selectedGenders : ["All Genders"]
        },
        influencer_persona: formData.influencerPersona || "Content creator yang authentic dan memiliki engagement yang baik dengan audience",
        total_influencer: parseInt(formData.influencerCount),
        niche: selectedNiches,
        location_prior: selectedLocations,
        esg_allignment: selectedESG,
        budget: parseFloat(formData.budget),
        output: {
          content_types: selectedContentTypes.length > 0 ? selectedContentTypes : ["Instagram Reels", "Instagram Feeds"],
          deliverables: parseInt(formData.deliverables) || 6
        },
        risk_tolerance: formData.riskTolerance,
        deliverables: deliverables,
        status: 'Planning',
        phase: 'Planning & Strategy',
        due_date: formData.campaignDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        has_recommendations: false
      }

      // Save to Firebase with brand_id
      const campaignId = await firebaseCampaignService.createCampaign(campaignData, user.uid)
      
      // Create complete campaign object for callback
      const createdCampaign: CampaignData = {
        ...campaignData,
        id: campaignId,
        brand_id: user.uid,
        created_at: new Date() as any,
        updated_at: new Date() as any
      }

      // Call callback if provided
      if (onCampaignCreated) {
        onCampaignCreated(createdCampaign)
      }

      toast.success('Campaign berhasil dibuat!')
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error creating campaign:', error)
      toast.error(error.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: '72rem' }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Campaign</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new influencer marketing campaign
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Brand Info Section - Display only */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Campaign Creator</h3>
            <p className="text-blue-700">
              <span className="font-medium">Brand:</span> {profile?.username || 'Loading...'}
            </p>
          </div>

          {/* Basic Campaign Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product/Service Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Premium Skincare Serum"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beauty & Cosmetics">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="Fashion & Apparel">Fashion & Apparel</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    <SelectItem value="Travel & Tourism">Travel & Tourism</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (IDR) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="influencerCount">Number of Influencers *</Label>
                <Input
                  id="influencerCount"
                  type="number"
                  placeholder="e.g., 5"
                  min="1"
                  value={formData.influencerCount}
                  onChange={(e) => handleInputChange('influencerCount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables">Total Deliverables</Label>
                <Input
                  id="deliverables"
                  type="number"
                  placeholder="e.g., 6"
                  min="1"
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignDate">Campaign Due Date</Label>
                <Input
                  id="campaignDate"
                  type="date"
                  value={formData.campaignDate}
                  onChange={(e) => handleInputChange('campaignDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="overview">Campaign Overview</Label>
                <Textarea
                  id="overview"
                  placeholder="Describe the main goals and concept of your campaign..."
                  rows={3}
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usp">Unique Selling Proposition</Label>
                <Textarea
                  id="usp"
                  placeholder="What makes your product/service unique..."
                  rows={3}
                  value={formData.usp}
                  onChange={(e) => handleInputChange('usp', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Target & Preferences</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Niches */}
              <div className="space-y-3">
                <Label>Target Niches *</Label>
                <Select onValueChange={(value) => handleMultiSelect(value, selectedNiches, setSelectedNiches)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target niches" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNiches.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedNiches.map((niche) => (
                    <Badge key={niche} variant="secondary" className="cursor-pointer">
                      {niche}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeFromSelection(niche, selectedNiches, setSelectedNiches)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <Label>Target Locations *</Label>
                <Select onValueChange={(value) => handleMultiSelect(value, selectedLocations, setSelectedLocations)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target countries" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedLocations.map((location) => (
                    <Badge key={location} variant="secondary" className="cursor-pointer">
                      {location}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeFromSelection(location, selectedLocations, setSelectedLocations)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid for smaller selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Age Ranges */}
              <div className="space-y-3">
                <Label>Target Age Groups</Label>
                <Select onValueChange={(value) => handleMultiSelect(value, selectedAgeRanges, setSelectedAgeRanges)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgeRanges.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {selectedAgeRanges.map((age) => (
                    <Badge key={age} variant="outline" className="text-xs cursor-pointer">
                      {age}
                      <X 
                        className="w-2 h-2 ml-1" 
                        onClick={() => removeFromSelection(age, selectedAgeRanges, setSelectedAgeRanges)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Genders */}
              <div className="space-y-3">
                <Label>Target Genders</Label>
                <Select onValueChange={(value) => handleMultiSelect(value, selectedGenders, setSelectedGenders)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genders" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGenders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {selectedGenders.map((gender) => (
                    <Badge key={gender} variant="outline" className="text-xs cursor-pointer">
                      {gender}
                      <X 
                        className="w-2 h-2 ml-1" 
                        onClick={() => removeFromSelection(gender, selectedGenders, setSelectedGenders)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-3">
                <Label>Risk Tolerance</Label>
                <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRiskTolerance.map((risk) => (
                      <SelectItem key={risk} value={risk}>
                        {risk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content & Strategy */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Content & Strategy</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Types */}
              <div className="space-y-3">
                <Label>Content Types</Label>
                <Select onValueChange={(value) => handleMultiSelect(value, selectedContentTypes, setSelectedContentTypes)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content types" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedContentTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="cursor-pointer">
                      {type}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeFromSelection(type, selectedContentTypes, setSelectedContentTypes)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Marketing Objectives */}
              <div className="space-y-3">
                <Label>Marketing Objectives</Label>
                <Select onValueChange={(value) => handleMultiSelect(value, selectedObjectives, setSelectedObjectives)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marketing objectives" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableObjectives.map((objective) => (
                      <SelectItem key={objective} value={objective}>
                        {objective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedObjectives.map((objective) => (
                    <Badge key={objective} variant="secondary" className="cursor-pointer">
                      {objective}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeFromSelection(objective, selectedObjectives, setSelectedObjectives)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Influencer Persona */}
            <div className="space-y-2">
              <Label htmlFor="influencerPersona">Ideal Influencer Persona</Label>
              <Textarea
                id="influencerPersona"
                placeholder="Describe the type of influencer you're looking for..."
                rows={3}
                value={formData.influencerPersona}
                onChange={(e) => handleInputChange('influencerPersona', e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
