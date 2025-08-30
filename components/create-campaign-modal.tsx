"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Loader2, Plus, User, Building, MapPin, Target, Video, DollarSign } from "lucide-react"
import { firebaseCampaignService, type CampaignData, type CampaignApiData } from "@/lib/firebase-campaign"
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
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedESG, setSelectedESG] = useState<string[]>([])
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([])
  const [selectedTargetGoals, setSelectedTargetGoals] = useState<string[]>([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  
  // City search state
  const [citySearchTerm, setCitySearchTerm] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    overview: '',
    usp: '',
    budget: '',
    influencerCount: '',
    deliverables: '3',
    campaignDate: '',
    riskTolerance: 'Medium',
    influencerPersona: ''
  })

  // Updated options to match JSON format exactly
  const availableNiches = [
    "Educator",
    "Sport", 
    "Comedy",
    "Lifestyle",
    "Beauty",
    "Sustainability",
    "Parenting",
    "Tech/Gadget",
    "Food"
  ];
  
  // Comprehensive list of Indonesian cities
  const availableIndonesianCities = [
    // Jawa
    "Jakarta", "Surabaya", "Bandung", "Bekasi", "Medan", "Tangerang", "Depok", "Semarang", 
    "Palembang", "Makassar", "Tangerang Selatan", "Bogor", "Batam", "Bandar Lampung", 
    "Malang", "Pekanbaru", "Yogyakarta", "Surakarta", "Banjarmasin", "Denpasar",
    "Balikpapan", "Samarinda", "Jambi", "Cimahi", "Sukoharjo", "Klaten", "Purwokerto",
    "Magelang", "Cilegon", "Serang", "Tasikmalaya", "Cirebon", "Sukabumi", "Jember",
    "Tegal", "Kediri", "Blitar", "Probolinggo", "Pasuruan", "Sidoarjo", "Mojokerto",
    
    // Sumatra
    "Pekanbaru", "Padang", "Bengkulu", "Pematangsiantar", "Binjai", "Lubuklinggau",
    "Pangkalpinang", "Dumai", "Bukittinggi", "Payakumbuh", "Solok", "Sawahlunto",
    "Padang Panjang", "Pariaman", "Tanjung Pinang", "Batam", "Tebingtinggi",
    
    // Kalimantan
    "Pontianak", "Singkawang", "Palangka Raya", "Sampit", "Kuala Kapuas", "Muara Teweh",
    "Banjarbaru", "Martapura", "Kandangan", "Amuntai", "Kotabaru", "Tarakan", "Bontang",
    "Tenggarong", "Sangatta", "Penajam", "Kuala Lumpur", "Nunukan",
    
    // Sulawesi
    "Manado", "Bitung", "Tomohon", "Kotamobagu", "Palu", "Luwuk", "Buol", "Tolitoli",
    "Parigi", "Kendari", "Baubau", "Kolaka", "Unaaha", "Gorontalo", "Limboto", "Marisa",
    
    // Papua
    "Jayapura", "Sorong", "Manokwari", "Biak", "Nabire", "Timika", "Merauke", "Wamena",
    
    // Bali & Nusa Tenggara
    "Singaraja", "Tabanan", "Gianyar", "Klungkung", "Mataram", "Bima", "Dompu", "Sumbawa",
    "Kupang", "Ende", "Maumere", "Bajawa", "Ruteng", "Labuan Bajo",
    
    // Maluku
    "Ambon", "Ternate", "Tidore", "Tual", "Masohi", "Namlea"
  ];
  
  const availableESG = ["Cruelty-free", "Sustainable packaging", "Environmental", "Social", "Governance", "Sustainability", "Diversity", "Community Impact"]
  const availableContentTypes = ["Reels", "Feeds", "Stories"]
  const availableObjectives = ["Cognitive", "Conative", "Affective"]
  const availableTargetGoals = [
    "Brand Awareness",
    "Reach and Impressions",
    "Brand Recall",
    "Engagement Rate",
    "Watch Time",
    "Follower Growth",
    "Website Visits",
    "Link Clicks",
    "Time on Page",
    "Leads Generation",
    "Sales Conversions",
    "Signs-ups",
    "Customer Retention",
    "Repeat Purchase",
    "Loyalty Program Signs Up",
    "User Generated Content",
    "Content Share",
    "Influencer Mention"
  ];
  const availableAgeRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
  const availableGenders = ["Male", "Female", "All Genders"]
  const availableRiskTolerance = ["Low", "Medium", "High"]

  // Multi-select handlers
  const toggleSelection = (value: string, currentSelection: string[], setSelection: (items: string[]) => void) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter(item => item !== value))
    } else {
      setSelection([...currentSelection, value])
    }
  }

  // City search functions
  const addCity = (cityName: string) => {
    if (cityName.trim() && !selectedCities.includes(cityName.trim())) {
      setSelectedCities([...selectedCities, cityName.trim()])
    }
    setCitySearchTerm("")
    setShowCityDropdown(false)
  }

  const removeCity = (cityToRemove: string) => {
    setSelectedCities(selectedCities.filter(city => city !== cityToRemove))
  }

  const filteredCities = availableIndonesianCities.filter(city => 
    city.toLowerCase().includes(citySearchTerm.toLowerCase()) && 
    !selectedCities.includes(city)
  ).slice(0, 10) // Limit to 10 results for better performance

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
        productName: '',
        overview: '',
        usp: '',
        budget: '',
        influencerCount: '',
        deliverables: '3',
        campaignDate: '',
        riskTolerance: 'Medium',
        influencerPersona: ''
      })
      setSelectedNiches([])
      setSelectedCities([])
      setSelectedESG([])
      setSelectedContentTypes([])
      setSelectedObjectives([])
      setSelectedTargetGoals([])
      setSelectedAgeRanges([])
      setSelectedGenders([])
      setCitySearchTerm("")
      setShowCityDropdown(false)
    }
  }, [open])

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.city-search-container')) {
        setShowCityDropdown(false)
      }
    }

    if (showCityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCityDropdown])

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

      if (selectedNiches.length === 0) {
        toast.error('Please select at least one niche')
        return
      }

      if (selectedObjectives.length === 0 || selectedTargetGoals.length === 0) {
        toast.error('Please select marketing objectives and target goals')
        return
      }

      // Generate brief ID and title
      const briefId = firebaseCampaignService.generateBriefId()
      const title = firebaseCampaignService.generateTitle(formData.productName, profile.username)

      // Prepare campaign data to match JSON format exactly
      const campaignData: Omit<CampaignData, 'id' | 'brand_id' | 'created_at' | 'updated_at'> = {
        // Core API fields matching JSON requirement exactly
        brief_id: briefId,
        brand_name: profile.username,
        industry: profile.industry || "Not specified",
        product_name: formData.productName,
        overview: formData.overview,
        usp: formData.usp,
        marketing_objective: selectedObjectives,
        target_goals: selectedTargetGoals,
        timing_campaign: formData.campaignDate,
        audience_preference: {
          top_locations: {
            countries: ["Indonesia"], // Default Indonesia
            cities: selectedCities.length > 0 ? selectedCities : ["Jakarta", "Surabaya", "Bandung"]
          },
          age_range: selectedAgeRanges.length > 0 ? selectedAgeRanges : ["18-24", "25-34"],
          gender: selectedGenders.length > 0 ? selectedGenders : ["Female"]
        },
        influencer_persona: formData.influencerPersona || "Content creator yang authentic dan memiliki engagement yang baik dengan audience",
        total_influencer: parseInt(formData.influencerCount),
        niche: selectedNiches,
        location_prior: ["Indonesia"], // Default Indonesia
        esg_allignment: selectedESG,
        budget: parseFloat(formData.budget),
        output: {
          content_types: selectedContentTypes.length > 0 ? selectedContentTypes : ["Reels", "Feeds"],
          deliverables: parseInt(formData.deliverables) || 3
        },
        risk_tolerance: formData.riskTolerance,
        
        // Additional fields for Firebase/UI management only
        title: title,
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

  // Render multi-select badge component
  const MultiSelectBadges = ({ 
    items, 
    onRemove, 
    placeholder = "No items selected",
    variant = "default" 
  }: { 
    items: string[], 
    onRemove: (item: string) => void,
    placeholder?: string,
    variant?: "default" | "secondary" | "outline"
  }) => {
    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground italic">{placeholder}</p>
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant} className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors">
            {item}
            <X 
              className="w-3 h-3 ml-2" 
              onClick={() => onRemove(item)}
            />
          </Badge>
        ))}
      </div>
    )
  }

  // Render multi-select button grid
  const MultiSelectGrid = ({ 
    options, 
    selected, 
    onToggle, 
    className = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  }: { 
    options: string[], 
    selected: string[], 
    onToggle: (value: string) => void,
    className?: string
  }) => (
    <div className={`grid gap-2 ${className}`}>
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={selected.includes(option) ? "default" : "outline"}
          size="sm"
          className="justify-start text-left h-auto py-2 px-3"
          onClick={() => onToggle(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto"
        style={{ maxWidth: '80rem' }}
      >
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold">Create New Campaign</DialogTitle>
          <DialogDescription className="text-base">
            Fill in the details below to create a new influencer marketing campaign
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Brand Info Section */}
          {profile && (
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {profile.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Campaign Creator</h3>
                      <p className="text-sm text-blue-700">Brand: {profile.username}</p>
                      <p className="text-xs text-blue-600">Industry: {profile.industry || "Not specified"}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Authenticated</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-sm font-medium">Product/Service Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g., GlowSkin Vitamin C Serum"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">Budget (IDR) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="influencerCount" className="text-sm font-medium">Number of Influencers *</Label>
                <Input
                  id="influencerCount"
                  type="number"
                  placeholder="e.g., 5"
                  min="1"
                  value={formData.influencerCount}
                  onChange={(e) => handleInputChange('influencerCount', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables" className="text-sm font-medium">Total Deliverables</Label>
                <Input
                  id="deliverables"
                  type="number"
                  placeholder="3"
                  min="1"
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignDate" className="text-sm font-medium">Campaign Due Date</Label>
                <Input
                  id="campaignDate"
                  type="date"
                  value={formData.campaignDate}
                  onChange={(e) => handleInputChange('campaignDate', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskTolerance" className="text-sm font-medium">Risk Tolerance</Label>
                <div className="grid grid-cols-3 gap-1">
                  {availableRiskTolerance.map((risk) => (
                    <Button
                      key={risk}
                      type="button"
                      variant={formData.riskTolerance === risk ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleInputChange('riskTolerance', risk)}
                    >
                      {risk}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="overview" className="text-sm font-medium">Campaign Overview</Label>
                <Textarea
                  id="overview"
                  placeholder="Premium vitamin C serum untuk mencerahkan dan melindungi kulit dari radikal bebas"
                  rows={4}
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usp" className="text-sm font-medium">Unique Selling Proposition</Label>
                <Textarea
                  id="usp"
                  placeholder="Formula 20% Vitamin C dengan teknologi nano-encapsulation untuk penetrasi optimal"
                  rows={4}
                  value={formData.usp}
                  onChange={(e) => handleInputChange('usp', e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Marketing Strategy */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Marketing Strategy</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Marketing Objectives * (Select multiple)</Label>
                  <p className="text-xs text-muted-foreground mb-3">Choose the main psychological impacts you want to achieve</p>
                  <MultiSelectGrid 
                    options={availableObjectives}
                    selected={selectedObjectives}
                    onToggle={(value) => toggleSelection(value, selectedObjectives, setSelectedObjectives)}
                    className="grid-cols-3"
                  />
                  <div className="mt-3">
                    <MultiSelectBadges 
                      items={selectedObjectives}
                      onRemove={(value) => toggleSelection(value, selectedObjectives, setSelectedObjectives)}
                      placeholder="No objectives selected"
                      variant="default"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Target Goals * (Select multiple)</Label>
                  <p className="text-xs text-muted-foreground mb-3">Choose specific business goals you want to achieve</p>
                  <MultiSelectGrid 
                    options={availableTargetGoals}
                    selected={selectedTargetGoals}
                    onToggle={(value) => toggleSelection(value, selectedTargetGoals, setSelectedTargetGoals)}
                    className="grid-cols-2 md:grid-cols-3"
                  />
                  <div className="mt-3">
                    <MultiSelectBadges 
                      items={selectedTargetGoals}
                      onRemove={(value) => toggleSelection(value, selectedTargetGoals, setSelectedTargetGoals)}
                      placeholder="No goals selected"
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Target Audience</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Niches */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Target Niches * (Select multiple)</Label>
                  <p className="text-xs text-muted-foreground mb-3">Choose content categories that align with your product</p>
                  <MultiSelectGrid 
                    options={availableNiches}
                    selected={selectedNiches}
                    onToggle={(value) => toggleSelection(value, selectedNiches, setSelectedNiches)}
                  />
                  <div className="mt-3">
                    <MultiSelectBadges 
                      items={selectedNiches}
                      onRemove={(value) => toggleSelection(value, selectedNiches, setSelectedNiches)}
                      placeholder="No niches selected"
                    />
                  </div>
                </div>
              </div>

              {/* Cities - Searchable Input */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Target Cities in Indonesia</Label>
                  <p className="text-xs text-muted-foreground mb-3">Search and select cities for targeted reach</p>
                  
                  {/* Search Input */}
                  <div className="relative city-search-container">
                    <Input
                      placeholder="Search for Indonesian cities..."
                      value={citySearchTerm}
                      onChange={(e) => {
                        setCitySearchTerm(e.target.value)
                        setShowCityDropdown(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowCityDropdown(citySearchTerm.length > 0)}
                      className="h-11"
                    />
                    
                    {/* Dropdown Results */}
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            onClick={() => addCity(city)}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Custom City Button */}
                    {citySearchTerm.length > 0 && !filteredCities.some(city => city.toLowerCase() === citySearchTerm.toLowerCase()) && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 text-blue-600"
                          onClick={() => addCity(citySearchTerm)}
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Add "{citySearchTerm}" as custom city
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Cities Display */}
                  <div className="mt-3">
                    <MultiSelectBadges 
                      items={selectedCities}
                      onRemove={removeCity}
                      variant="outline"
                    />
                  </div>
                  
                  {/* Quick Add Popular Cities */}
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Quick add popular cities:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Yogyakarta", "Malang", "Denpasar"].map((city) => (
                        !selectedCities.includes(city) && (
                          <Button
                            key={city}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => addCity(city)}
                          >
                            + {city}
                          </Button>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">Target Age Groups (Select multiple)</Label>
                <p className="text-xs text-muted-foreground mb-3">Choose age ranges for your target audience</p>
                <MultiSelectGrid 
                  options={availableAgeRanges}
                  selected={selectedAgeRanges}
                  onToggle={(value) => toggleSelection(value, selectedAgeRanges, setSelectedAgeRanges)}
                  className="grid-cols-3 md:grid-cols-4"
                />
                <div className="mt-3">
                  <MultiSelectBadges 
                    items={selectedAgeRanges}
                    onRemove={(value) => toggleSelection(value, selectedAgeRanges, setSelectedAgeRanges)}
                    variant="outline"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Target Genders (Select multiple)</Label>
                <p className="text-xs text-muted-foreground mb-3">Choose gender demographics</p>
                <MultiSelectGrid 
                  options={availableGenders}
                  selected={selectedGenders}
                  onToggle={(value) => toggleSelection(value, selectedGenders, setSelectedGenders)}
                  className="grid-cols-3"
                />
                <div className="mt-3">
                  <MultiSelectBadges 
                    items={selectedGenders}
                    onRemove={(value) => toggleSelection(value, selectedGenders, setSelectedGenders)}
                    variant="outline"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Strategy */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Content Strategy</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Content Types (Select multiple)</Label>
                  <p className="text-xs text-muted-foreground mb-3">Choose the types of content you want influencers to create</p>
                  <MultiSelectGrid 
                    options={availableContentTypes}
                    selected={selectedContentTypes}
                    onToggle={(value) => toggleSelection(value, selectedContentTypes, setSelectedContentTypes)}
                    className="grid-cols-2 md:grid-cols-3"
                  />
                  <div className="mt-3">
                    <MultiSelectBadges 
                      items={selectedContentTypes}
                      onRemove={(value) => toggleSelection(value, selectedContentTypes, setSelectedContentTypes)}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">ESG Alignment (Select multiple)</Label>
                  <p className="text-xs text-muted-foreground mb-3">Choose values that align with your brand</p>
                  <MultiSelectGrid 
                    options={availableESG}
                    selected={selectedESG}
                    onToggle={(value) => toggleSelection(value, selectedESG, setSelectedESG)}
                    className="grid-cols-2"
                  />
                  <div className="mt-3">
                    <MultiSelectBadges 
                      items={selectedESG}
                      onRemove={(value) => toggleSelection(value, selectedESG, setSelectedESG)}
                      placeholder="Optional ESG values"
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Influencer Persona */}
            <div className="space-y-2">
              <Label htmlFor="influencerPersona" className="text-sm font-medium">Ideal Influencer Persona</Label>
              <p className="text-xs text-muted-foreground">Describe the type of influencer personality and expertise you're looking for</p>
              <Textarea
                id="influencerPersona"
                placeholder="Beauty enthusiast, skincare expert, authentic product reviewer yang suka berbagi tips perawatan kulit dan review produk secara detail"
                rows={4}
                value={formData.influencerPersona}
                onChange={(e) => handleInputChange('influencerPersona', e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[140px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
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