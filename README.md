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

## Prerequisites

Sebelum menjalankan project ini, pastikan Anda memiliki:

- **Node.js** (version 18 atau lebih baru)
- **pnpm** package manager
- **Git** untuk cloning repository
- **Firebase project** untuk authentication (optional)
- **API Server** untuk influencer recommendations (optional)

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
# Firebase Configuration (Optional - untuk authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration (Optional - untuk recommendation engine)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

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

Set environment variable untuk API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:5000
```


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
