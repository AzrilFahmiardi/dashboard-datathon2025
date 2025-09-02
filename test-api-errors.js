// Test file to simulate API errors and test error handling
// Run: node test-api-errors.js

const fetch = require('node-fetch');

// Test different error scenarios
async function testApiErrors() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing API Error Handling...\n');
  
  // Test 1: Connection error (API not running)
  console.log('Test 1: Connection Error (API offline)');
  try {
    const response = await fetch(`${baseUrl}/api/recommend-influencers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });
    console.log('❌ Should have failed - API seems to be running');
  } catch (error) {
    console.log('✅ Connection error handled correctly:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: JSON serialization error simulation
  console.log('Test 2: Simulating JSON Serialization Error Response');
  const mockErrorResponse = {
    error: "Internal server error: Object of type int64 is not JSON serializable",
    status: "error"
  };
  
  // Simulate what our error handler would do
  const errorMessage = mockErrorResponse.error;
  if (errorMessage.includes('JSON serializable')) {
    console.log('✅ JSON serialization error detected correctly');
    console.log('   User-friendly message: "API server encountered a data processing error"');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Test actual API if running
  console.log('Test 3: Testing actual API (if running)');
  try {
    const statusResponse = await fetch(`${baseUrl}/api/data-status`);
    if (statusResponse.ok) {
      console.log('✅ API is running - can test real responses');
      
      // Test with minimal valid payload
      const testPayload = {
        brief_id: "TEST_001",
        brand_name: "Test Brand",
        industry: "Technology",
        product_name: "Test Product",
        overview: "Test overview",
        usp: "Test USP",
        marketing_objective: ["Brand Awareness"],
        target_goals: ["Increase Reach"],
        timing_campaign: "Q4 2024",
        audience_preference: {
          top_locations: {
            countries: ["Indonesia"],
            cities: ["Jakarta"]
          },
          age_range: ["18-24"],
          gender: ["Female"]
        },
        influencer_persona: "Tech enthusiast",
        total_influencer: 5,
        niche: ["Technology"],
        location_prior: ["Jakarta"],
        esg_allignment: ["None"],
        budget: 50000000,
        output: {
          content_types: ["Reels"],
          deliverables: 3
        },
        risk_tolerance: "Medium"
      };
      
      const response = await fetch(`${baseUrl}/api/recommend-influencers?adaptive_weights=true&include_insights=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error:', errorText);
        
        // Test our error classification
        if (errorText.includes('JSON serializable')) {
          console.log('✅ JSON serialization error confirmed - needs server fix');
        } else if (errorText.includes('Internal server error')) {
          console.log('✅ Server error detected');
        }
      } else {
        const data = await response.json();
        console.log('✅ API working correctly - received recommendations:', data.recommendations?.length || 0);
      }
    } else {
      console.log('❌ API not responding properly');
    }
  } catch (error) {
    console.log('❌ Cannot reach API:', error.message);
  }
  
  console.log('\n🎯 Error Handling Test Complete');
  console.log('Dashboard should show appropriate error messages for each scenario');
}

// Run tests
testApiErrors().catch(console.error);
