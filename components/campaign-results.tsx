"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Heart, 
  MessageCircle,
  Star,
  Target,
  BarChart3,
  ArrowUpRight,
  Zap,
  CheckCircle,
  Info
} from 'lucide-react'
import type { ApiResponse, InfluencerRecommendation } from '@/lib/influencer-api'

interface CampaignResultsProps {
  data: ApiResponse
  onBack?: () => void
}

const tierColors = {
  "Mega": "bg-purple-500",
  "Macro": "bg-blue-500", 
  "Micro": "bg-green-500",
  "Nano": "bg-orange-500"
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function CampaignResults({ data, onBack }: CampaignResultsProps) {
  const { brief, recommendations, metadata } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaign Recommendations</h1>
          <p className="text-muted-foreground">AI-powered influencer recommendations for your campaign</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {brief.brief_id}
              </CardTitle>
              <CardDescription>
                Campaign brief summary and results
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {brief.total_found} of {brief.total_requested} influencers found
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-sm text-muted-foreground">
            {brief.summary}
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Weights Info */}
      {metadata.use_adaptive_weights && metadata.adaptive_weights_info && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Adaptive Scoring
            </CardTitle>
            <CardDescription>
              Applied {metadata.adaptive_weights_info.total_adjustments} intelligent adjustments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {(metadata.adaptive_weights_info.final_weights.audience_fit * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Audience Fit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {(metadata.adaptive_weights_info.final_weights.persona_fit * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Persona Fit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {(metadata.adaptive_weights_info.final_weights.performance_pred * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {(metadata.adaptive_weights_info.final_weights.budget_efficiency * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Budget Efficiency</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Applied Adjustments:</h4>
                <div className="flex flex-wrap gap-2">
                  {metadata.adaptive_weights_info.applied_adjustments.map((adjustment, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {adjustment}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Recommended Influencers</h2>
        
        {recommendations.map((influencer, index) => (
          <InfluencerCard key={influencer.username} influencer={influencer} />
        ))}
      </div>
    </div>
  )
}

function InfluencerCard({ influencer }: { influencer: InfluencerRecommendation }) {
  const tierColor = tierColors[influencer.tier as keyof typeof tierColors] || "bg-gray-500"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`https://instagram.com/${influencer.username}/photo`} />
                <AvatarFallback>
                  {influencer.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -top-1 -right-1 w-4 h-4 ${tierColor} rounded-full border-2 border-white`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">@{influencer.username}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{influencer.tier}</Badge>
                <Badge variant="secondary">{influencer.expertise}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>#{influencer.rank}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {(influencer.scores.final_score * 100).toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Final Score</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Score Breakdown
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Audience Fit</span>
                <span className="text-sm font-medium">{(influencer.scores.audience_fit * 100).toFixed(0)}%</span>
              </div>
              <Progress value={influencer.scores.audience_fit * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Persona Fit</span>
                <span className="text-sm font-medium">{(influencer.scores.persona_fit * 100).toFixed(0)}%</span>
              </div>
              <Progress value={influencer.scores.persona_fit * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Performance</span>
                <span className="text-sm font-medium">{(influencer.scores.performance_pred * 100).toFixed(0)}%</span>
              </div>
              <Progress value={influencer.scores.performance_pred * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Budget Efficiency</span>
                <span className="text-sm font-medium">{(influencer.scores.budget_efficiency * 100).toFixed(0)}%</span>
              </div>
              <Progress value={influencer.scores.budget_efficiency * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Metrics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium">{(influencer.performance_metrics.engagement_rate * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Engagement</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">{(influencer.performance_metrics.reach_potential * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Reach Potential</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">{(influencer.performance_metrics.authenticity_score * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Authenticity</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">{influencer.performance_metrics.brand_fit}%</div>
                <div className="text-sm text-muted-foreground">Brand Fit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Mix & Budget */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Optimal Content Mix & Budget
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Reels</span>
                <span className="font-medium">{influencer.optimal_content_mix.reels_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Feeds</span>
                <span className="font-medium">{influencer.optimal_content_mix.feeds_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Stories</span>
                <span className="font-medium">{influencer.optimal_content_mix.story_count}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Cost</span>
                <span className="font-medium">{formatCurrency(influencer.optimal_content_mix.total_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Impact Score</span>
                <span className="font-medium">{influencer.optimal_content_mix.total_impact.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Remaining Budget</span>
                <span className="font-medium text-green-600">{formatCurrency(influencer.optimal_content_mix.remaining_budget)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {influencer.insights && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              AI Insights
            </h4>
            <div className="bg-muted p-4 rounded-lg">
              <div className="whitespace-pre-line text-sm text-muted-foreground">
                {influencer.insights.slice(0, 500)}...
              </div>
              <Button variant="link" className="p-0 mt-2 text-sm">
                View Full Insights <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
