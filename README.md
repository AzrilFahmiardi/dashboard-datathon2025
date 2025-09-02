# Influensure - Influencer Campaign Management Dashboard

Influensure adalah platform web yang membantu brand menemukan influencer yang tepat untuk campaign mereka menggunakan AI-powered recommendation system. Platform ini menghubungkan brand dengan influencer yang sesuai berdasarkan berbagai kriteria dan lengkap dengan analisis Influencer Behaviour.


## Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **React Hot Toast** - Toast notifications

### Backend & Services
- **Firebase** - Authentication dan Firestore database
- **External API** - Python-based recommendation engine

### Development Tools
- **pnpm** - Fast package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🎯 Untuk Juri Lomba & Testing

Project ini sudah dikonfigurasi dengan data dan credentials yang siap pakai untuk keperluan evaluasi:

### Quick Start untuk Evaluator:

```bash
# 1. Clone repository
git clone https://github.com/AzrilFahmiardi/dashboard-datathon2025.git
cd dashboard-datathon2025

# 2. Install dependencies
npm install -g pnpm
pnpm install

# 3. Copy environment file (credentials sudah disediakan)
cp .env.example .env.local

# 4. Run development server
pnpm dev

# 5. Open browser
# http://localhost:3000
```

### Demo Accounts:
- **Brand Account**: `aqua@gmail.com` / `aqua123`

### API Status:
- ✅ **Live API**: https://influensure-api.onrender.com
- ✅ **Firebase Auth**: Configured and ready
- ✅ **Data**: Real influencer dataset included

## 📋 Prerequisites

Sebelum menjalankan project ini, pastikan Anda memiliki:


- **Node.js** (version 18 atau lebih baru)
- **pnpm** package manager
- **Git** untuk cloning repository

**Note**: Firebase dan API sudah dikonfigurasi, tidak perlu setup tambahan untuk testing.

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/AzrilFahmiardi/dashboard-datathon2025.git
cd dashboard-datathon2025
```

### 2. Install Dependencies

```bash
# Install pnpm jika belum ada
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Environment Configuration

Buat file `.env.local` di root directory:

```bash
# Firebase Configuration - Real credentials untuk keperluan lomba/judging
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDMsIDy5WOIr37gSPqWCPF1S0x6V-R8cFY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=influensure-dashboard.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=influensure-dashboard
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=influensure-dashboard.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=590506901509
NEXT_PUBLIC_FIREBASE_APP_ID=1:590506901509:web:7b43a4c8c4b6ac8919a9e8

# API Configuration - Endpoint AI Recommendation Engine
NEXT_PUBLIC_API_BASE_URL=https://influensure-api.onrender.com
```

**📋 Note untuk Juri/Reviewer:**
- Credentials Firebase di atas adalah data asli yang dapat digunakan untuk testing
- API endpoint sudah terdeploy dan siap untuk evaluasi
- Tidak perlu setup tambahan - langsung bisa dijalankan untuk demo

### 4. Run Development Server

```bash
pnpm dev
```

Project akan berjalan di `http://localhost:3000`

## Production Build

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Static Export (Optional)

Jika ingin deploy sebagai static site:

```bash
pnpm build
```

Files akan di-generate di folder `.next` yang bisa di-deploy ke hosting static.

## 📁 Project Structure

```
dashboard-datathon2025/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages
│   │   ├── brand/         # Brand dashboard & features
│   │   └── influencer/    # Influencer dashboard
│   ├── auth/              # Authentication pages
│   ├── login/             # Login pages
│   ├── register/          # Registration pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (buttons, cards, etc.)
│   ├── brand-sidebar.tsx # Brand navigation
│   ├── influencer-list.tsx # Influencer listing component
│   └── ...               # Other feature components
├── contexts/             # React contexts (auth, theme, etc.)
├── lib/                  # Utility functions & services
│   ├── firebase.ts       # Firebase configuration
│   ├── influencer-api.ts # API client untuk recommendations
│   ├── csv-reader.ts     # CSV data processing
│   └── utils.ts          # Helper utilities
├── public/               # Static assets
│   └── data/            # CSV data files
├── styles/              # Additional CSS files
└── package.json         # Project dependencies
```

## 🔌 API Integration

Project ini dapat berintegrasi dengan external recommendation API:

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/data-status` - Data status check
- `POST /api/validate-brief` - Validate campaign brief
- `POST /api/recommend-influencers` - Get influencer recommendations
- `POST /api/adaptive-weights` - Calculate adaptive scoring weights

### API Configuration

API endpoint production yang sudah terdeploy:

```bash
NEXT_PUBLIC_API_BASE_URL=https://influensure-api.onrender.com
```

**Status API untuk Evaluasi:**
- ✅ **Health Check**: GET `/api/health`
- ✅ **Data Status**: GET `/api/data-status` 
- ✅ **Validate Brief**: POST `/api/validate-brief`
- ✅ **AI Recommendations**: POST `/api/recommend-influencers`
- ✅ **Adaptive Weights**: POST `/api/adaptive-weights`

API sudah live dan dapat diakses langsung untuk testing.


### Campaign Brief Format

```json
{
  "brief_id": "CAMPAIGN_001",
  "brand_name": "Beauty Brand",
  "industry": "Beauty & Cosmetics",
  "product_name": "Anti-Aging Serum",
  "marketing_objective": ["Brand Awareness", "Sales"],
  "budget": 50000000,
  "total_influencer": 5,
  "niche": ["Beauty", "Skincare"],
  "audience_preference": {
    "age_range": ["25-34"],
    "gender": ["Female"],
    "top_locations": {
      "cities": ["Jakarta", "Surabaya"],
      "countries": ["Indonesia"]
    }
  }
}
```
