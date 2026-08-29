# Posivex Lead Generation Platform

AI-powered Google Maps scraping and lead qualification platform built with Next.js 15, Tailwind CSS, MongoDB, Apify, and Gemini AI.

## 🚀 Features

- **Google Maps Scraper Integration:** Automated extraction of business data (addresses, phone numbers, websites, ratings, opening hours, claimed status) using Apify `scraperlink/google-maps-scraper`.
- **Gemini AI Qualification Engine:** Evaluates business prospects with match scores (0-100), AI reasoning, and customized outreach hooks.
- **Dynamic AI Prompt Management:** Manage and customize Gemini evaluation prompts from the Dashboard settings.
- **Background Job Pipeline:** Background execution engine with Inngest support.
- **Lead Management & Export:** Search, filter by website/campaign, and export CSV prospect lists.
- **NextAuth Authentication:** Secure JWT session authentication.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB (Mongoose ODM)
- **Styling:** Tailwind CSS (Dark Modern UI)
- **Scraping:** Apify Client (`scraperlink/google-maps-scraper`)
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`)
- **Background Jobs:** Inngest
- **Auth:** NextAuth.js

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
APIFY_TOKEN="your_apify_token"
INNGEST_SIGNING_KEY="your_inngest_signing_key"
INNGEST_EVENT_KEY="your_inngest_event_key"
GEMINI_API_KEY="your_gemini_api_key"
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.pojxbbe.mongodb.net/posivex_leads?retryWrites=true&w=majority&appName=Cluster0"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
```

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# (Optional) Run Inngest Dev Server
npm run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

- **Default Admin:** `admin@posivex.com`
- **Default Password:** `Posivex@2026`
