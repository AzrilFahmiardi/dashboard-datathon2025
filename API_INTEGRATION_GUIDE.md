# API Integration Guide

## Overview
Sistem dashboard telah diintegrasikan dengan Influencer Recommendation API untuk menggantikan dummy data dengan real AI recommendations.

## Changes Made

### 1. Environment Configuration
- API base URL dikonfigurasi di `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`
- APIStatusChecker component ditambahkan untuk monitoring koneksi API

### 2. Updated Files

#### `/app/dashboard/brand/page.tsx`
- ✅ Import `influencerAPI` dan `ApiResponse` 
- ✅ Added `convertCampaignToApiFormat()` helper function
- ✅ Updated `handleGenerateRecommendations()` to call real API
- ✅ Added comprehensive error handling
- ✅ Added detailed console logging for debugging
- ✅ Added `APIStatusChecker` component
- ✅ **NEW: Added collapsible "Raw API Response" debug card**

#### `/app/dashboard/brand/campaigns/page.tsx`
- ✅ Import `influencerAPI` dan `ApiResponse`
- ✅ Added `convertCampaignToApiFormat()` helper function
- ✅ Updated `handleGenerateRecommendations()` to call real API
- ✅ Added onClick handlers for generate/view recommendations buttons
- ✅ Added loading states and better UI feedback
- ✅ Added `APIStatusChecker` component

#### `/components/campaign-results.tsx`
- ✅ Enhanced with detailed influencer recommendation display
- ✅ **NEW: Added collapsible "Raw API Response" debug card**
- ✅ Added copy-to-clipboard functionality for API response JSON

#### `/lib/firebase-campaign.ts`
- ✅ Enhanced `saveRecommendations()` with detailed logging
- ✅ Better error messages

#### `/lib/influencer-api.ts`
- ✅ Enhanced `recommendInfluencers()` with detailed logging
- ✅ Better error handling and response validation

## Field Mapping Validation

### API Required Fields vs Project Fields
**✅ ALL FIELDS PERFECTLY MATCHED**

| API Field | Project Field | Status |
|-----------|---------------|--------|
| `brief_id` | `campaign.brief_id` | ✅ |
| `brand_name` | `campaign.brand_name` | ✅ |
| `industry` | `campaign.industry` | ✅ |
| `product_name` | `campaign.product_name` | ✅ |
| `overview` | `campaign.overview` | ✅ |
| `usp` | `campaign.usp` | ✅ |
| `marketing_objective` | `campaign.marketing_objective` | ✅ |
| `target_goals` | `campaign.target_goals` | ✅ |
| `timing_campaign` | `campaign.timing_campaign` | ✅ |
| `audience_preference` | `campaign.audience_preference` | ✅ |
| `influencer_persona` | `campaign.influencer_persona` | ✅ |
| `total_influencer` | `campaign.total_influencer` | ✅ |
| `niche` | `campaign.niche` | ✅ |
| `location_prior` | `campaign.location_prior` | ✅ |
| `esg_allignment` | `campaign.esg_allignment` | ✅ |
| `budget` | `campaign.budget` | ✅ |
| `output.content_types` | `campaign.output.content_types` | ✅ |
| `output.deliverables` | `campaign.output.deliverables` | ✅ |
| `risk_tolerance` | `campaign.risk_tolerance` | ✅ |

## How to Test

### 1. Ensure API Server is Running
```bash
# The API should be running on http://localhost:5000
# Check with:
curl http://localhost:5000/
```

### 2. Check API Status in Dashboard
- Go to dashboard → "API Connection Status" card should show green ✅
- If red ❌, ensure API server is running

### 3. Create a Test Campaign
1. Click "Create Campaign" 
2. Fill all required fields
3. Submit campaign

### 4. Generate Recommendations
1. Find campaign in dashboard
2. Click "Generate AI Recommendations" button
3. Watch console logs for detailed debugging info
4. Should see success message with recommendation count

### 5. View Results
- After generation, button changes to "View AI Recommendations"
- Click to see the CampaignResults component with real data
- **NEW: Check "Raw API Response" debug card for JSON inspection**

## Latest Features Added (Debug UI Enhancement)

### Raw API Response Cards
Fitur debug UI yang baru ditambahkan untuk menampilkan respon asli dari API:

#### Lokasi Implementasi:
- **Brand Dashboard** (`/app/dashboard/brand/page.tsx`): Card debug di bawah recommendation button
- **Campaign Page** (`/app/dashboard/brand/campaigns/page.tsx`): Card debug di bawah list campaigns  
- **Campaign Results Component** (`/components/campaign-results.tsx`): Card debug terintegrasi dengan hasil

#### Fitur Debug Card:
- ✨ **Collapsible Display**: Toggle untuk show/hide API response dengan ikon ↑/↓
- 📋 **Copy to Clipboard**: Button untuk copy JSON response ke clipboard
- 🔍 **JSON Formatting**: Pretty-printed JSON dengan syntax highlighting
- 📊 **Metadata Display**: Timestamp dan status dari API response
- 🎨 **Visual Indicators**: Icons dan styling yang user-friendly

#### Benefits:
- Developer dapat inspect raw API response untuk debugging
- User dapat verify data yang diterima dari AI recommendation service
- Troubleshooting menjadi lebih mudah dengan visibility ke API layer
- Copy-paste functionality memudahkan reporting issues

## Debugging

### Console Logs to Watch
```
🚀 Starting recommendation generation for campaign: BRIEF_XXX
📦 API Payload prepared: {...}
🔌 Connecting to API at: http://localhost:5000
📡 Calling API endpoint...
🌐 Full API URL: http://localhost:5000/api/recommend-influencers?adaptive_weights=true&include_insights=true
📡 API Response status: 200 OK
✅ API Response received: {...}
💾 Saving recommendations to Firebase...
🎉 Recommendations generated successfully!
```

### Common Issues & Solutions

#### 1. "Cannot connect to API" 
**Solution:** Ensure API server is running on localhost:5000

#### 2. "API returned invalid response"
**Solution:** Check API server logs, might be field validation error

#### 3. "JSON serialization error" / "Object of type int64 is not JSON serializable"
**Cause:** API server using numpy data types that can't be JSON serialized
**Solution:** This is a server-side issue. The API developer needs to convert numpy types to native Python types before JSON response. See TROUBLESHOOTING.md for detailed fix.
**User Action:** Wait and try again, or contact API administrator

#### 4. Debug card not showing
**Solution:** Ensure you clicked "Generate AI Recommendations" and check apiResponse state

#### 5. Copy to clipboard not working
**Solution:** Modern browsers might block clipboard access, try using HTTPS or localhost

#### 6. "Internal server error"
**Solution:** Check API server logs for detailed error traces. Often related to data processing issues.

## Testing Checklist

### Basic Integration Testing
- [ ] Start API server di `localhost:5000`
- [ ] Check APIStatusChecker menunjukkan "API Connected ✅"
- [ ] Create or select campaign
- [ ] Click "Generate AI Recommendations" button
- [ ] Verify loading state appears
- [ ] Check recommendations appear in results

### Debug UI Testing (NEW)
- [ ] **Verify "Raw API Response" card appears after API call**
- [ ] **Test toggle card collapse/expand functionality**
- [ ] **Test copy-to-clipboard button**
- [ ] **Verify JSON structure matches expected format**
- [ ] **Check metadata shows correct timestamp**
- [ ] **Validate card shows error details if API fails**

### Error Scenarios
- [ ] API server offline (should show connection error)
- [ ] Invalid campaign data (should show validation error)
- [ ] Network timeout (should show timeout error)
- [ ] **NEW: API returns JSON serialization error (should show user-friendly message)**
- [ ] **NEW: API returns 500 internal server error (should show server error message)**

## Known Issues

### Server-Side Issues (for API Developer)
1. **Numpy Data Types:** API responses containing numpy int64/float64 types cause JSON serialization errors
2. **Pandas DataFrame:** Direct serialization of pandas objects fails
3. **Memory Issues:** Large datasets might cause timeouts

### Client-Side Workarounds
1. **Enhanced Error Handling:** Dashboard now provides specific error messages for common issues
2. **Retry Mechanism:** Users can retry failed requests
3. **Debug Visibility:** Raw API response cards help diagnose issues
4. **Logging:** Comprehensive console logging for debugging

## Performance Notes
- First API call might be slower (data loading)
- Large campaigns (>50 influencers requested) might timeout
- Adaptive weights calculation adds ~2-3 seconds to response time
- Insights generation adds ~1-2 seconds per influencer

#### 3. "No influencer recommendations found"
**Solution:** Try adjusting campaign criteria (niche, budget, location)

#### 4. Console shows CORS errors
**Solution:** API server needs CORS headers for frontend origin

## API Endpoints Used

### 1. Health Check
- `GET /` - Basic health check
- Used by APIStatusChecker

### 2. Data Status  
- `GET /api/data-status` - Check if AI data is loaded
- Used by APIStatusChecker

### 3. Recommend Influencers
- `POST /api/recommend-influencers?adaptive_weights=true&include_insights=true`
- Main endpoint for getting recommendations
- Used by handleGenerateRecommendations

## Data Flow

1. **Campaign Creation** → Form data saved to Firebase with all required API fields
2. **Generate Click** → Campaign data converted to API format via `convertCampaignToApiFormat()`
3. **API Call** → Real API endpoint called with complete payload
4. **Response Processing** → API response validated and saved to Firebase
5. **UI Update** → Campaign marked as having recommendations, button state changes
6. **View Results** → CampaignResults component shows real AI recommendations

## Success Criteria

✅ **Integration Complete** - All dummy data replaced with real API calls
✅ **Field Mapping Perfect** - All API required fields available in campaign data  
✅ **Error Handling** - Comprehensive error messages for different failure scenarios
✅ **User Feedback** - Loading states, success/error toasts, status indicators
✅ **Debugging Support** - Detailed console logging for troubleshooting
✅ **API Monitoring** - APIStatusChecker for connection health

The integration is now **READY FOR TESTING** with real API server!
