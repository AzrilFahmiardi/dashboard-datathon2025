"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CreateCampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedESG, setSelectedESG] = useState<string[]>([])

  const availableNiches = ["Beauty", "Fashion", "Lifestyle", "Food", "Travel", "Tech", "Fitness", "Gaming"]
  const availableLocations = ["Indonesia", "Malaysia", "Singapore", "Thailand", "Philippines"]
  const availableESG = ["Cruelty-free", "Sustainable packaging", "Vegan", "Eco-friendly", "Fair trade"]

  const addItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (!list.includes(item)) {
      setList([...list, item])
    }
  }

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter((i) => i !== item))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Fill in the details to create a new influencer marketing campaign</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input id="brand-name" placeholder="e.g., Avoskin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beauty">Beauty & Skincare</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input id="product-name" placeholder="e.g., GlowSkin Vitamin C Serum" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Product Overview</Label>
              <Textarea id="overview" placeholder="Brief description of your product..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usp">Unique Selling Proposition</Label>
              <Textarea id="usp" placeholder="What makes your product unique?" rows={2} />
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campaign Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Rp)</Label>
                <Input id="budget" type="number" placeholder="50000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="influencer-count">Number of Influencers</Label>
                <Input id="influencer-count" type="number" placeholder="2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Target Audience</h3>

            <div className="space-y-2">
              <Label>Niches</Label>
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
              <Label>Target Locations</Label>
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
          </div>

          {/* Content Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Requirements</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliverables">Total Deliverables</Label>
                <Input id="deliverables" type="number" placeholder="6" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-date">Campaign Start Date</Label>
                <Input id="campaign-date" type="date" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Create Campaign</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
