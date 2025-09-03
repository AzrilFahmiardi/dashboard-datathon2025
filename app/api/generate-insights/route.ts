import { NextRequest, NextResponse } from 'next/server'

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
    const body = await request.json()
    const { type, data, campaignBrief, prompt: customPrompt } = body

    console.log(`📥 Received insights request:`, {
      type,
      hasData: !!data,
      hasCustomPrompt: !!customPrompt,
      dataLength: typeof data === 'string' ? data.length : 'not string',
      hasCampaignBrief: !!campaignBrief
    })

    // For general type, use custom prompt directly
    if (type === 'general' && customPrompt) {
      // Skip validation, use custom prompt directly
    } else {
      // Validate required fields for other types
      if (!type || !data) {
        console.log('❌ Missing required fields')
        return NextResponse.json(
          { error: 'Missing required fields: type and data are required' },
          { status: 400 }
        )
      }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.log('❌ Gemini API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    let prompt = ''
    
    // Generate different prompts based on insight type
    switch (type) {
      case 'general':
        prompt = customPrompt || 'Generate general insights'
        break
      case 'comment':
        prompt = generateCommentInsightPrompt(data, campaignBrief)
        break
      case 'caption':
        prompt = generateCaptionInsightPrompt(data, campaignBrief)
        break
      case 'score':
        prompt = generateScoreInsightPrompt(data, campaignBrief)
        break
      case 'performance':
        prompt = generatePerformanceInsightPrompt(data, campaignBrief)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid insight type. Supported types: general, comment, caption, score, performance' },
          { status: 400 }
        )
    }

    console.log(`🤖 Generating ${type} insights with Gemini...`)
    console.log(`📝 Prompt length: ${prompt.length} characters`)
    
    try {
      // Use direct Gemini REST API like strategy API
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
            maxOutputTokens: 400,
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
        const insights = data.candidates[0].content.parts[0].text.trim()
        console.log(`✅ ${type} insights generated successfully, length: ${insights.length} characters`)

        return NextResponse.json({ 
          insights,
          type,
          timestamp: new Date().toISOString()
        })
      } else {
        console.error('Invalid Gemini response format:', data)
        return NextResponse.json(
          { error: 'Invalid response format from Gemini API' },
          { status: 500 }
        )
      }
    } catch (geminiError: any) {
      console.error(`❌ Gemini API error for ${type}:`, {
        message: geminiError.message,
        stack: geminiError.stack,
        name: geminiError.name
      })
      
      // Return specific Gemini error
      return NextResponse.json(
        { 
          error: `Gemini API error: ${geminiError.message}`,
          type: 'gemini_error',
          details: geminiError.toString()
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Error generating insights:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate insights',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

function generateCommentInsightPrompt(captionBehaviorData: string, campaignBrief?: any): string {
  const campaignContext = campaignBrief ? `
CAMPAIGN CONTEXT:
- Brand: ${campaignBrief.brand_name || 'N/A'}
- Product: ${campaignBrief.product_name || 'N/A'}
- Industry: ${campaignBrief.industry || 'N/A'}
- Marketing Objectives: ${campaignBrief.marketing_objective || 'N/A'}
` : ''

  return `Sebagai AI marketing expert, berikan analisis singkat (maksimal 2-3 kalimat) tentang pola komentar influencer berikut.

${campaignContext}

DATA COMMENT BEHAVIOR:
${captionBehaviorData}

INSTRUKSI OUTPUT:
Fokus pada: (1) Kualitas engagement audiens, (2) Potensi viral dan word-of-mouth, (3) Relevansi dengan target campaign.

Berikan insight praktis dalam 2-3 kalimat menggunakan bahasa Indonesia profesional.`
}

function generateCaptionInsightPrompt(captionBehaviorData: string, campaignBrief?: any): string {
  const campaignContext = campaignBrief ? `
CAMPAIGN CONTEXT:
- Brand: ${campaignBrief.brand_name || 'N/A'}
- Product: ${campaignBrief.product_name || 'N/A'}
- Industry: ${campaignBrief.industry || 'N/A'}
- Marketing Objectives: ${campaignBrief.marketing_objective || 'N/A'}
` : ''

  return `Sebagai AI marketing expert, berikan analisis singkat (maksimal 2-3 kalimat) tentang gaya penulisan caption influencer berikut.

${campaignContext}

DATA CAPTION ANALYSIS:
${captionBehaviorData}

INSTRUKSI OUTPUT:
Fokus pada: (1) Konsistensi tone of voice, (2) Efektivitas call-to-action, (3) Potensi kolaborasi natural dengan brand.

Berikan insight praktis dalam 2-3 kalimat menggunakan bahasa Indonesia profesional.`
}

function generateScoreInsightPrompt(scoreData: any, campaignBrief?: any): string {
  const campaignContext = campaignBrief ? `
CAMPAIGN CONTEXT:
- Brand: ${campaignBrief.brand_name || 'N/A'}
- Product: ${campaignBrief.product_name || 'N/A'}
- Industry: ${campaignBrief.industry || 'N/A'}
- Budget: ${campaignBrief.budget || 'N/A'}
` : ''

  return `Sebagai AI marketing expert, berikan analisis singkat (maksimal 2-3 kalimat) tentang score breakdown influencer berikut.

${campaignContext}

SCORE DATA:
- Final Score: ${scoreData?.final_score ? (scoreData.final_score * 100).toFixed(1) + '%' : 'N/A'}
- Audience Fit: ${scoreData?.audience_fit ? (scoreData.audience_fit * 100).toFixed(1) + '%' : 'N/A'}
- Persona Fit: ${scoreData?.persona_fit ? (scoreData.persona_fit * 100).toFixed(1) + '%' : 'N/A'}
- Performance Prediction: ${scoreData?.performance_pred ? (scoreData.performance_pred * 100).toFixed(1) + '%' : 'N/A'}
- Budget Efficiency: ${scoreData?.budget_efficiency ? (scoreData.budget_efficiency * 100).toFixed(1) + '%' : 'N/A'}

INSTRUKSI OUTPUT:
Fokus pada: (1) Strength utama berdasarkan score, (2) Value proposition terkuat, (3) ROI expectations.

Berikan insight praktis dalam 2-3 kalimat menggunakan bahasa Indonesia profesional.`
}

function generatePerformanceInsightPrompt(performanceData: any, campaignBrief?: any): string {
  const campaignContext = campaignBrief ? `
CAMPAIGN CONTEXT:
- Brand: ${campaignBrief.brand_name || 'N/A'}
- Product: ${campaignBrief.product_name || 'N/A'}
- Industry: ${campaignBrief.industry || 'N/A'}
- Content Requirements: ${campaignBrief.content_requirements || 'N/A'}
` : ''

  return `Sebagai AI marketing expert, berikan analisis singkat (maksimal 2-3 kalimat) tentang performance metrics influencer berikut.

${campaignContext}

PERFORMANCE DATA:
- Engagement Rate: ${performanceData?.engagement_rate ? (performanceData.engagement_rate * 100).toFixed(2) + '%' : 'N/A'}
- Authenticity Score: ${performanceData?.authenticity_score ? (performanceData.authenticity_score * 100).toFixed(1) + '%' : 'N/A'}
- Reach Potential: ${performanceData?.reach_potential ? (performanceData.reach_potential * 100).toFixed(1) + '%' : 'N/A'}
- Brand Fit: ${performanceData?.brand_fit ? (performanceData.brand_fit * 100).toFixed(1) + '%' : 'N/A'}

INSTRUKSI OUTPUT:
Fokus pada: (1) Konsistensi performance, (2) Authentic engagement quality, (3) Brand safety potential.

Berikan insight praktis dalam 2-3 kalimat menggunakan bahasa Indonesia profesional.`
}
