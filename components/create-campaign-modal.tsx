"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { influencerAPI, type CampaignBrief, type ApiResponse } from "@/lib/influencer-api"
import { toast } from "react-hot-toast"

interface CreateCampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCampaignCreated?: (recommendations: ApiResponse) => void
}

export function CreateCampaignModal({ open, onOpenChange, onCampaignCreated }: CreateCampaignModalProps) {
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

  // Form state
  const [formData, setFormData] = useState({
    brandName: '',
    industry: '',
    productName: '',
    overview: '',
    usp: '',
    budget: '',
    influencerCount: '',
    deliverables: '',
    campaignDate: '',
    riskTolerance: '',
    influencerPersona: ''
  })

  const availableNiches = ["Beauty", "Fashion", "Lifestyle", "Food", "Travel", "Tech", "Fitness", "Gaming"]
  const availableLocations = ["Indonesia", "Malaysia", "Singapore", "Thailand", "Philippines"]
  const availableCities = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Kuala Lumpur", "Bangkok"]
  const availableESG = ["Cruelty-free", "Sustainable packaging", "Vegan", "Eco-friendly", "Fair trade"]
  const availableContentTypes = ["Reels", "Feeds", "Stories", "IGTV"]
  const availableObjectives = ["Cognitive", "Affective", "Behavioral"]
  const availableTargetGoals = ["Awareness", "Brand Perception", "Product Education", "Lead Generation", "Sales"]
  const availableAgeRanges = ["18-24", "25-34", "35-44", "45-54", "55+"]
  const availableGenders = ["Male", "Female", "All"]
  const availableIndustries = [
    "Beauty & Skincare", 
    "Fashion", 
    "Food & Beverage", 
    "Technology", 
    "Lifestyle",
    "Healthcare",
    "Travel & Tourism",
    "Sports & Fitness"
  ]

  const addItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (!list.includes(item)) {
      setList([...list, item])
    }
  }

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter((i) => i !== item))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateBriefId = () => {
    return `BRIEF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.brandName || !formData.productName || !formData.budget || !formData.influencerCount) {
        toast.error('Please fill in all required fields')
        return
      }

      if (selectedNiches.length === 0 || selectedLocations.length === 0) {
        toast.error('Please select at least one niche and location')
        return
      }

      // Prepare campaign brief data
      const campaignBrief: CampaignBrief = {
        brief_id: generateBriefId(),
        brand_name: formData.brandName,
        industry: formData.industry,
        product_name: formData.productName,
        overview: formData.overview,
        usp: formData.usp,
        marketing_objective: selectedObjectives.length > 0 ? selectedObjectives : ["Cognitive", "Affective"],
        target_goals: selectedTargetGoals.length > 0 ? selectedTargetGoals : ["Awareness", "Brand Perception"],
        timing_campaign: formData.campaignDate,
        audience_preference: {
          top_locations: {
            countries: selectedLocations,
            cities: selectedCities.length > 0 ? selectedCities : ["Jakarta", "Surabaya"]
          },
          age_range: selectedAgeRanges.length > 0 ? selectedAgeRanges : ["18-24", "25-34"],
          gender: selectedGenders.length > 0 ? selectedGenders : ["Female"]
        },
        influencer_persona: formData.influencerPersona || "Content creator yang authentik dan memiliki engagement yang baik dengan audience",
        total_influencer: parseInt(formData.influencerCount),
        niche: selectedNiches,
        location_prior: selectedLocations,
        esg_allignment: selectedESG,
        budget: parseFloat(formData.budget),
        output: {
          content_types: selectedContentTypes.length > 0 ? selectedContentTypes : ["Reels", "Feeds"],
          deliverables: parseInt(formData.deliverables) || 6
        },
        risk_tolerance: formData.riskTolerance || "Medium"
      }

      // Call API to get recommendations
      const response = await influencerAPI.recommendInfluencers(campaignBrief, {
        adaptive_weights: true,
        include_insights: true
      })

      if (response.status === 'success') {
        toast.success('Campaign created and recommendations generated!')
        onCampaignCreated?.(response)
        onOpenChange(false)
        
        // Reset form
        setFormData({
          brandName: '',
          industry: '',
          productName: '',
          overview: '',
          usp: '',
          budget: '',
          influencerCount: '',
          deliverables: '',
          campaignDate: '',
          riskTolerance: '',
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
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      toast.error(error.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Fill in the details to create a new influencer marketing campaign and get AI recommendations</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name *</Label>
                <Input 
                  id="brand-name" 
                  placeholder="e.g., Avoskin" 
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
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
                    {availableIndustries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input 
                id="product-name" 
                placeholder="e.g., GlowSkin Vitamin C Serum" 
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Product Overview</Label>
              <Textarea 
                id="overview" 
                placeholder="Premium vitamin C serum untuk mencerahkan dan melindungi kulit dari radikal bebas" 
                rows={3} 
                value={formData.overview}
                onChange={(e) => handleInputChange('overview', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usp">Unique Selling Proposition</Label>
              <Textarea 
                id="usp" 
                placeholder="Formula 20% Vitamin C dengan teknologi nano-encapsulation untuk penetrasi optimal" 
                rows={2} 
                value={formData.usp}
                onChange={(e) => handleInputChange('usp', e.target.value)}
              />
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campaign Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Rp) *</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="50000000" 
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="influencer-count">Number of Influencers *</Label>
                <Input 
                  id="influencer-count" 
                  type="number" 
                  placeholder="3" 
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
                  placeholder="6" 
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-date">Campaign Start Date</Label>
                <Input 
                  id="campaign-date" 
                  type="date" 
                  value={formData.campaignDate}
                  onChange={(e) => handleInputChange('campaignDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Marketing Objectives & Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Marketing Strategy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marketing Objectives</Label>
                <Select onValueChange={(value) => addItem(value, selectedObjectives, setSelectedObjectives)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select objectives" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableObjectives.map((obj) => (
                      <SelectItem key={obj} value={obj}>
                        {obj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedObjectives.map((obj) => (
                    <Badge key={obj} variant="secondary">
                      {obj}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(obj, selectedObjectives, setSelectedObjectives)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Goals</Label>
                <Select onValueChange={(value) => addItem(value, selectedTargetGoals, setSelectedTargetGoals)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target goals" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargetGoals.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTargetGoals.map((goal) => (
                    <Badge key={goal} variant="secondary">
                      {goal}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(goal, selectedTargetGoals, setSelectedTargetGoals)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Target Audience</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niches *</Label>
                <Select onValueChange={(value) => addItem(value, selectedNiches, setSelectedNiches)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niches" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNiches.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedNiches.map((niche) => (
                    <Badge key={niche} variant="secondary">
                      {niche}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(niche, selectedNiches, setSelectedNiches)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Locations *</Label>
                <Select onValueChange={(value) => addItem(value, selectedLocations, setSelectedLocations)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLocations.map((location) => (
                    <Badge key={location} variant="secondary">
                      {location}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(location, selectedLocations, setSelectedLocations)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cities</Label>
                <Select onValueChange={(value) => addItem(value, selectedCities, setSelectedCities)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cities" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCities.map((city) => (
                    <Badge key={city} variant="secondary">
                      {city}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(city, selectedCities, setSelectedCities)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select onValueChange={(value) => addItem(value, selectedAgeRanges, setSelectedAgeRanges)}>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAgeRanges.map((age) => (
                    <Badge key={age} variant="secondary">
                      {age}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(age, selectedAgeRanges, setSelectedAgeRanges)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select onValueChange={(value) => addItem(value, selectedGenders, setSelectedGenders)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGenders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGenders.map((gender) => (
                    <Badge key={gender} variant="secondary">
                      {gender}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(gender, selectedGenders, setSelectedGenders)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ESG & Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ESG Alignment</Label>
                <Select onValueChange={(value) => addItem(value, selectedESG, setSelectedESG)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ESG values" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableESG.map((esg) => (
                      <SelectItem key={esg} value={esg}>
                        {esg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedESG.map((esg) => (
                    <Badge key={esg} variant="secondary">
                      {esg}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(esg, selectedESG, setSelectedESG)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Types</Label>
                <Select onValueChange={(value) => addItem(value, selectedContentTypes, setSelectedContentTypes)}>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedContentTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeItem(type, selectedContentTypes, setSelectedContentTypes)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="influencer-persona">Influencer Persona</Label>
              <Textarea 
                id="influencer-persona" 
                placeholder="Beauty enthusiast, skincare expert, authentic product reviewer yang suka berbagi tips perawatan kulit dan review produk secara detail" 
                rows={3}
                value={formData.influencerPersona}
                onChange={(e) => handleInputChange('influencerPersona', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                'Create Campaign & Get Recommendations'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
