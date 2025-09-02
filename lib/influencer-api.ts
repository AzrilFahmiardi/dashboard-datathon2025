// API types based on the documentation
export interface CampaignBrief {
  brief_id: string;
  brand_name: string;
  industry: string;
  product_name: string;
  overview: string;
  usp: string;
  marketing_objective: string[];
  target_goals: string[];
  timing_campaign: string;
  audience_preference: {
    top_locations: {
      countries: string[];
      cities: string[];
    };
    age_range: string[];
    gender: string[];
  };
  influencer_persona: string;
  total_influencer: number;
  niche: string[];
  location_prior: string[];
  esg_allignment: string[];
  budget: number;
  output: {
    content_types: string[];
    deliverables: number;
  };
  risk_tolerance: string;
}

export interface InfluencerRecommendation {
  username: string;
  rank: number;
  tier: string;
  expertise: string;
  scores: {
    final_score: number;
    audience_fit: number;
    budget_efficiency: number;
    performance_pred: number;
    persona_fit: number;
  };
  performance_metrics: {
    authenticity_score: number;
    brand_fit: number;
    engagement_rate: number;
    reach_potential: number;
  };
  optimal_content_mix: {
    feeds_count: number;
    reels_count: number;
    story_count: number;
    total_cost: number;
    total_impact: number;
    remaining_budget: number;
    is_requirement_based: boolean;
  };
  insights: string;
  raw_data: any;
}

export interface ApiResponse {
  status: string;
  timestamp: string;
  brief: {
    brief_id: string;
    summary: string;
    total_found: number;
    total_requested: number;
  };
  recommendations: InfluencerRecommendation[];
  metadata: {
    use_adaptive_weights: boolean;
    include_insights: boolean;
    adaptive_weights_info?: {
      applied_adjustments: string[];
      final_weights: {
        audience_fit: number;
        budget_efficiency: number;
        performance_pred: number;
        persona_fit: number;
      };
      total_adjustments: number;
    };
    scoring_strategy: {
      audience_fit: number;
      budget_efficiency: number;
      performance_pred: number;
      persona_fit: number;
    };
  };
}

export interface DataStatusResponse {
  all_data_loaded?: boolean;
  data_shapes?: {
    bio?: [number, number];
    captions?: [number, number];
    instagram_influencers?: [number, number];
    labeled_caption?: [number, number];
    labeled_comment?: [number, number];
    [key: string]: [number, number] | undefined;
  };
  individual_status?: {
    bio?: boolean;
    captions?: boolean;
    instagram_influencers?: boolean;
    labeled_caption?: boolean;
    labeled_comment?: boolean;
    [key: string]: boolean | undefined;
  };
  status?: string;
  timestamp?: string;
}

export interface HealthCheckResponse {
  status: string;
  message?: string;
  timestamp?: string;
  version?: string;
  api_info?: any;
}

export interface ValidateBriefResponse {
  status: string;
  message: string;
  validation_result: {
    is_valid: boolean;
    warnings: string[];
    suggestions: string[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class InfluencerRecommendationAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${this.baseURL}/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to API server. Please ensure the API is running on ' + this.baseURL);
      }
      throw error;
    }
  }

  async getDataStatus(): Promise<DataStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/data-status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      // Jangan throw error jika data_status tidak ada, biarkan UI yang handle
      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to API server. Please ensure the API is running on ' + this.baseURL);
      }
      throw error;
    }
  }

  async validateBrief(brief: Partial<CampaignBrief>): Promise<ValidateBriefResponse> {
    const response = await fetch(`${this.baseURL}/api/validate-brief`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brief),
    });
    return response.json();
  }

  async calculateAdaptiveWeights(params: {
    marketing_objective: string[];
    target_goals: string[];
    timing_campaign: string;
    esg_allignment: string[];
    risk_tolerance: string;
    niche: string[];
    location_prior: string[];
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/adaptive-weights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return response.json();
  }

  async recommendInfluencers(
    brief: CampaignBrief,
    options: {
      adaptive_weights?: boolean;
      include_insights?: boolean;
    } = {}
  ): Promise<ApiResponse> {
    const { adaptive_weights = true, include_insights = true } = options;
    
    console.log('🔌 Connecting to API at:', this.baseURL)
    console.log('📋 Brief summary:', {
      brief_id: brief.brief_id,
      product_name: brief.product_name,
      total_influencer: brief.total_influencer,
      budget: brief.budget
    })
    
    const url = new URL(`${this.baseURL}/api/recommend-influencers`);
    url.searchParams.append('adaptive_weights', adaptive_weights.toString());
    url.searchParams.append('include_insights', include_insights.toString());

    console.log('🌐 Full API URL:', url.toString())

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brief),
      });
      
      console.log('📡 API Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error response:', errorText)
        
        // Parse error text to extract useful information
        let errorDetail = errorText
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error) {
            errorDetail = errorJson.error
          }
        } catch (e) {
          // Keep original error text if not JSON
        }
        
        // Provide more specific error messages
        if (errorDetail.includes('JSON serializable')) {
          throw new Error('API server encountered a data serialization error. This is likely a server-side issue with numpy data types. Please contact the API administrator.')
        } else if (errorDetail.includes('Internal server error')) {
          throw new Error(`Server internal error: ${errorDetail}. Please try again or contact support.`)
        } else {
          throw new Error(`API request failed: ${response.statusText}. Details: ${errorDetail}`)
        }
      }
      
      const result = await response.json()
      console.log('✅ API Success response preview:', {
        status: result.status,
        recommendationsCount: result.recommendations?.length || 0,
        timestamp: result.timestamp
      })
      
      // Validate the response structure
      if (!result.status || result.status !== 'success') {
        throw new Error(`API returned invalid status: ${result.status || 'unknown'}`)
      }
      
      if (!result.recommendations || !Array.isArray(result.recommendations)) {
        throw new Error('API response missing recommendations data')
      }
      
      return result
      
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚫 Network Error:', error.message)
        throw new Error('Cannot connect to API server. Please ensure the API is running on ' + this.baseURL)
      }
      
      // Re-throw our custom errors
      if (error.message.includes('API') || error.message.includes('server')) {
        throw error
      }
      
      // Handle unexpected errors
      console.error('🔥 Unexpected Error:', error)
      throw new Error(`Unexpected error occurred: ${error.message}`)
    }
  }

  async getInfluencerInsight(username: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/influencer-insight/${username}`);
    return response.json();
  }

  async reloadData(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseURL}/api/reload-data`, {
      method: 'POST',
    });
    return response.json();
  }
}

export const influencerAPI = new InfluencerRecommendationAPI();
