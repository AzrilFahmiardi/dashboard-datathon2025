# Campaign & Influencer Recommendation Integration

## Overview
Integrasi dinamis antara dashboard brand dengan Influencer Recommendation API untuk membuat campaign dan mendapatkan rekomendasi influencer berdasarkan AI.

## Features Implemented

### 1. API Integration Service (`lib/influencer-api.ts`)
- **Health Check**: Mengecek status koneksi API
- **Data Status**: Melihat status data influencer yang tersedia
- **Campaign Brief Validation**: Validasi data campaign sebelum dikirim
- **Adaptive Weights**: Perhitungan bobot adaptif untuk scoring
- **Influencer Recommendations**: Endpoint utama untuk mendapatkan rekomendasi

### 2. Enhanced Create Campaign Modal (`components/create-campaign-modal.tsx`)
Fitur form yang diperluas:
- **Basic Information**: Brand name, industry, product details
- **Campaign Details**: Budget, jumlah influencer, timeline
- **Marketing Strategy**: Objectives, target goals
- **Target Audience**: Niche, lokasi, demografi 
- **Content Preferences**: Tipe konten, ESG alignment
- **Influencer Persona**: Deskripsi ideal influencer

### 3. Campaign Results Display (`components/campaign-results.tsx`)
Menampilkan hasil rekomendasi dengan:
- **Campaign Summary**: Brief ID dan ringkasan
- **AI Adaptive Scoring**: Bobot dan adjustments yang diterapkan
- **Influencer Cards**: Detail setiap influencer yang direkomendasikan
  - Score breakdown (Audience Fit, Persona Fit, Performance, Budget)
  - Performance metrics (Engagement, Reach, Authenticity)
  - Optimal content mix dan budget estimasi
  - AI insights dari analisis data

### 4. API Status Checker (`components/api-status-checker.tsx`)
Real-time monitoring:
- Connection status ke API
- Data status (jumlah influencer, last updated)
- Error handling dan troubleshooting

### 5. Enhanced Dashboard Integration
- Seamless flow dari create campaign ke results
- Navigation antar halaman campaign dan dashboard
- Toast notifications untuk feedback

## API Structure

### Request Format (Campaign Brief)
```json
{
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
}
```

### Response Format
Response berisi:
- **brief**: Summary dan metadata campaign
- **recommendations**: Array influencer dengan scoring dan insights
- **metadata**: Informasi adaptive weights dan strategy

## Configuration

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Dependencies Added
- `react-hot-toast`: Toast notifications
- TypeScript types untuk API responses

## Usage Flow

1. **Create Campaign**: User mengisi form campaign dengan detail lengkap
2. **API Processing**: Data dikirim ke API untuk dianalisis
3. **AI Recommendations**: API mengembalikan rekomendasi influencer dengan scoring
4. **Results Display**: User melihat hasil rekomendasi dengan insights detail
5. **Navigation**: User bisa kembali ke dashboard atau membuat campaign baru

## API Endpoints Used

- `GET /`: Health check
- `GET /api/data-status`: Status data influencer
- `POST /api/validate-brief`: Validasi campaign brief
- `POST /api/adaptive-weights`: Perhitungan bobot adaptif
- `POST /api/recommend-influencers`: Rekomendasi utama
- `GET /api/influencer-insight/{username}`: Detail insight influencer
- `POST /api/reload-data`: Reload data influencer

## Error Handling

- Connection errors dengan API server
- Validation errors untuk required fields
- Toast notifications untuk success/error feedback
- Graceful degradation jika API tidak tersedia

## Next Steps

1. **Data Persistence**: Save campaign results ke database
2. **Campaign Management**: Edit, delete, duplicate campaigns  
3. **Influencer Outreach**: Contact influencers directly
4. **Performance Tracking**: Monitor campaign performance
5. **Advanced Filtering**: Filter dan sort results
