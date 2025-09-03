import { NextRequest, NextResponse } from 'next/server'

interface InfluencerData {
  username: string
  tier: string
  expertise: string
  rank: number
  scores: {
    final_score: number
    audience_fit: number
    persona_fit: number
    performance_pred: number
    budget_efficiency: number
  }
  performance_metrics: {
    engagement_rate: number
    authenticity_score: number
    reach_potential: number
    brand_fit: number
  }
  optimal_content_mix: {
    feeds_count: number
    reels_count: number
    story_count: number
    total_cost: number
    total_impact: number
    remaining_budget: number
  }
  insights: string
}

interface CampaignBrief {
  brand_name?: string
  product_name?: string
  overview?: string
  usp?: string
  industry?: string
  budget?: number
  target_audience?: any
  content_requirements?: string
  persona?: string
  marketing_objective?: string
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { influencerData, campaignBrief }: { 
      influencerData: InfluencerData
      campaignBrief?: CampaignBrief 
    } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured in server environment' },
        { status: 500 }
      )
    }

    const prompt = buildStrategyPrompt(influencerData, campaignBrief)

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data: GeminiResponse = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ 
        strategy: data.candidates[0].content.parts[0].text.trim() 
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid response format from Gemini API' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Strategy generation error:', error)
    return NextResponse.json(
      { error: `Strategy generation failed: ${error.message}` },
      { status: 500 }
    )
  }
}

function buildStrategyPrompt(influencerData: InfluencerData, campaignBrief?: CampaignBrief): string {
  // Parse insights untuk mendapatkan data behavior
  const insightsData = parseInsightsData(influencerData.insights)
  
  return `Sebagai AI marketing strategist expert, buatkan strategi influencer marketing yang actionable dan spesifik berdasarkan data analisis mendalam berikut:

PROFIL INFLUENCER:
- Username: @${influencerData.username}
- Tier: ${influencerData.tier}
- Expertise: ${influencerData.expertise}
- Ranking: #${influencerData.rank}

PERFORMANCE METRICS:
- Final Score: ${(influencerData.scores.final_score * 100).toFixed(1)}%
- Audience Fit: ${(influencerData.scores.audience_fit * 100).toFixed(1)}%
- Persona Fit: ${(influencerData.scores.persona_fit * 100).toFixed(1)}%
- Performance Prediction: ${(influencerData.scores.performance_pred * 100).toFixed(1)}%
- Budget Efficiency: ${(influencerData.scores.budget_efficiency * 100).toFixed(1)}%
- Engagement Rate: ${(influencerData.performance_metrics.engagement_rate * 100).toFixed(2)}%
- Authenticity Score: ${(influencerData.performance_metrics.authenticity_score * 100).toFixed(1)}%
- Reach Potential: ${(influencerData.performance_metrics.reach_potential * 100).toFixed(1)}%

CONTENT STRATEGY DATA:
- Recommended Feeds: ${influencerData.optimal_content_mix.feeds_count}
- Recommended Reels: ${influencerData.optimal_content_mix.reels_count}
- Recommended Stories: ${influencerData.optimal_content_mix.story_count}
- Total Investment: Rp ${(influencerData.optimal_content_mix.total_cost / 1000000).toFixed(1)}M
- Projected Impact: ${influencerData.optimal_content_mix.total_impact.toFixed(1)}

AUDIENCE BEHAVIOR ANALYSIS:
${insightsData}

${campaignBrief ? `
CAMPAIGN CONTEXT:
- Brand: ${campaignBrief.brand_name || 'Not specified'}
- Product: ${campaignBrief.product_name || 'Not specified'}
- Product Overview: ${campaignBrief.overview || 'Not specified'}
- Unique Selling Point: ${campaignBrief.usp || 'Not specified'}
- Industry: ${campaignBrief.industry || 'General'}
- Budget: ${campaignBrief.budget ? `Rp ${(campaignBrief.budget / 1000000).toFixed(1)}M` : 'Not specified'}
- Target Audience: ${campaignBrief.target_audience ? JSON.stringify(campaignBrief.target_audience) : 'General audience'}
- Content Requirements: ${campaignBrief.content_requirements || 'Standard content'}
- Brand Persona: ${campaignBrief.persona || 'Not specified'}
- Marketing Objective: ${campaignBrief.marketing_objective || 'Not specified'}
` : ''}

INSTRUKSI OUTPUT:
${campaignBrief?.product_name ? `PENTING: Strategi ini HARUS fokus pada produk "${campaignBrief.product_name}" dengan mempertimbangkan karakteristik dan penggunaan produk tersebut.` : ''}

Buatkan strategi dalam format berikut (maksimal 3-4 paragraf singkat, setiap paragraf maksimal 2-3 kalimat):

🎯 **Content Strategy:**
[Berikan rekomendasi konten spesifik untuk promosi produk ${campaignBrief?.product_name || 'campaign'} berdasarkan content mix dan expertise influencer]

📈 **Engagement Approach:**
[Strategi untuk memaksimalkan engagement rate dan authenticity score terkait produk ${campaignBrief?.product_name || 'campaign'}]

💡 **Campaign Execution:**
[Timing, approach, dan tactical recommendations berdasarkan audience behavior untuk memaksimalkan awareness produk ${campaignBrief?.product_name || 'campaign'}]

${influencerData.scores.budget_efficiency > 0 ? '💰 **Budget Optimization:**\n[Tips optimasi budget berdasarkan efficiency score]' : '⚠️ **Investment Considerations:**\n[Pertimbangan khusus terkait budget efficiency yang rendah]'}

Berikan insight yang actionable, spesifik, dan data-driven. Hindari generic advice.`
}

function parseInsightsData(insights: string): string {
  if (!insights) return 'No behavioral data available'

  // Extract key metrics dari insights
  const commentQualityMatch = insights.match(/🎯 High-Value Comment Rate: ([\d.]+)%/)
  const ctaMatch = insights.match(/(\d+) dari (\d+) caption mengandung CTA/)
  const toneMatch = insights.match(/🎭 Tone of Voice:\nDominan: ([^.\n]+)/)
  const supportiveMatch = insights.match(/([\d.]+)% supportive sentiment/)
  const relatableMatch = insights.match(/([\d.]+)% relatable engagement/)

  let summary = []
  
  if (commentQualityMatch) {
    summary.push(`- High-value comment rate: ${commentQualityMatch[1]}%`)
  }
  
  if (ctaMatch) {
    const ctaPercentage = ((parseInt(ctaMatch[1]) / parseInt(ctaMatch[2])) * 100).toFixed(1)
    summary.push(`- CTA usage: ${ctaMatch[1]}/${ctaMatch[2]} posts (${ctaPercentage}%)`)
  }
  
  if (toneMatch) {
    summary.push(`- Dominant tone: ${toneMatch[1]}`)
  }
  
  if (supportiveMatch) {
    summary.push(`- Supportive audience: ${supportiveMatch[1]}%`)
  }
  
  if (relatableMatch) {
    summary.push(`- Relatable engagement: ${relatableMatch[1]}%`)
  }

  return summary.length > 0 ? summary.join('\n') : 'Behavioral analysis data extracted from audience interactions'
}
