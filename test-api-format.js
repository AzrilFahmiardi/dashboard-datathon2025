// Test script yang menggunakan format PERSIS dari Postman collection
// Run: node test-api-format.js

const fetch = require('node-fetch');

async function testApiWithExactFormat() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing API with EXACT Postman format...\n');
  
  // Data persis dari Postman collection
  const exactPostmanPayload = {
    "brief_id": "BRIEF_001",
    "brand_name": "Avoskin",
    "industry": "Skincare & Beauty",
    "product_name": "GlowSkin Vitamin C Serum",
    "overview": "Premium vitamin C serum untuk mencerahkan dan melindungi kulit dari radikal bebas",
    "usp": "Formula 20% Vitamin C dengan teknologi nano-encapsulation untuk penetrasi optimal",
    "marketing_objective": ["Cognitive", "Affective"],
    "target_goals": ["Awareness", "Brand Perception", "Product Education"],
    "timing_campaign": "2025-03-15",
    "audience_preference": {
      "top_locations": {
        "countries": ["Indonesia", "Malaysia"],
        "cities": ["Jakarta", "Surabaya", "Bandung"]
      },
      "age_range": ["18-24", "25-34"],
      "gender": ["Female"]
    },
    "influencer_persona": "Beauty enthusiast, skincare expert, authentic product reviewer yang suka berbagi tips perawatan kulit dan review produk secara detail",
    "total_influencer": 3,
    "niche": ["Beauty", "Lifestyle"],
    "location_prior": ["Indonesia", "Malaysia"],
    "esg_allignment": ["Cruelty-free", "sustainable packaging"],
    "budget": 50000000.0,
    "output": {
      "content_types": ["Reels", "Feeds"],
      "deliverables": 6
    },
    "risk_tolerance": "Medium"
  };
  
  console.log('📋 Testing with exact Postman payload:');
  console.log('- brief_id:', exactPostmanPayload.brief_id);
  console.log('- total_influencer:', exactPostmanPayload.total_influencer, '(type:', typeof exactPostmanPayload.total_influencer, ')');
  console.log('- budget:', exactPostmanPayload.budget, '(type:', typeof exactPostmanPayload.budget, ')');
  console.log('- deliverables:', exactPostmanPayload.output.deliverables, '(type:', typeof exactPostmanPayload.output.deliverables, ')');
  
  try {
    const response = await fetch(`${baseUrl}/api/recommend-influencers?adaptive_weights=true&include_insights=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exactPostmanPayload)
    });
    
    console.log('\n📡 Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! API working with Postman format');
      console.log('Recommendations count:', data.recommendations?.length || 0);
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED with exact Postman format');
      console.log('Error:', errorText);
      
      // Check if it's the JSON serialization error
      if (errorText.includes('int64') && errorText.includes('JSON serializable')) {
        console.log('\n🔍 DIAGNOSIS: Problem is in API SERVER, not the payload format');
        console.log('The API server needs to fix the numpy int64 serialization issue');
        console.log('Dashboard payload format is CORRECT');
      }
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Test with simpler payload to isolate the issue
  console.log('\n🧪 Testing with minimal payload...');
  
  const minimalPayload = {
    "brief_id": "TEST_001",
    "brand_name": "Test Brand",
    "industry": "Test",
    "product_name": "Test Product",
    "overview": "Test overview",
    "usp": "Test USP",
    "marketing_objective": ["Cognitive"],
    "target_goals": ["Awareness"],
    "timing_campaign": "2025-03-15",
    "audience_preference": {
      "top_locations": {
        "countries": ["Indonesia"],
        "cities": ["Jakarta"]
      },
      "age_range": ["18-24"],
      "gender": ["Female"]
    },
    "influencer_persona": "Test persona",
    "total_influencer": 1,
    "niche": ["Beauty"],
    "location_prior": ["Indonesia"],
    "esg_allignment": ["None"],
    "budget": 10000000.0,
    "output": {
      "content_types": ["Reels"],
      "deliverables": 1
    },
    "risk_tolerance": "Medium"
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/recommend-influencers?adaptive_weights=true&include_insights=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalPayload)
    });
    
    console.log('📡 Minimal payload response:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Even minimal payload fails:', errorText.substring(0, 200) + '...');
    } else {
      console.log('✅ Minimal payload works!');
    }
    
  } catch (error) {
    console.log('❌ Minimal payload connection error:', error.message);
  }
  
  console.log('\n🎯 CONCLUSION:');
  console.log('If both payloads fail with "int64 JSON serializable" error,');
  console.log('then the problem is definitively in the API server code,');
  console.log('not in the dashboard payload format.');
}

// Run the test
testApiWithExactFormat().catch(console.error);
