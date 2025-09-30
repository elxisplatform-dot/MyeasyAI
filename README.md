# easyAI - AI Legal Research Assistant

A comprehensive full-stack SaaS application for legal research powered by AI, RAG (Retrieval Augmented Generation), and real-time internet search.

## 🚀 Features

### Free Tier
- ✅ Claude-like chat interface
- ✅ RAG-powered legal document search
- ✅ 20 chats per month
- ✅ Access to legal database

### Pro Tier (₦2,999/month)
- ✅ All Free features
- ✅ Real-time internet search
- ✅ Legal citation generator
- ✅ Case summarizer & headnote generator
- ✅ Search by legal principle/ratio decidendi
- ✅ Case brief generator
- ✅ Case comparator (side-by-side)
- ✅ Statute navigator
- ✅ Export to PDF/DOCX
- ✅ 500 chats per month

### Enterprise Tier (₦9,999/month)
- ✅ All Pro features (unlimited)
- ✅ Precedent finder & timeline tracker
- ✅ Statute evolution tracker
- ✅ Team collaboration with role-based permissions
- ✅ AI drafting assistant (motions, affidavits)
- ✅ Offline mode (PWA)
- ✅ Voice-to-Law (English + local languages)
- ✅ Firm analytics dashboard
- ✅ White-label option

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI**: OpenAI GPT-4 + text-embedding-ada-002
- **Payment**: Paystack (with split payments)
- **Search**: Tavily/Bing/SerpAPI for internet search
- **Vector DB**: Supabase pgvector for RAG

## 📦 Installation

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- Paystack account (optional for payments)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/easyai.git
cd easyai
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎯 Current Features Implemented

- ✅ Modern React + Vite setup with TypeScript support
- ✅ Beautiful UI with Tailwind CSS and Framer Motion animations
- ✅ Authentication system (login/register)
- ✅ Chat interface with AI assistant
- ✅ Feature gating for subscription tiers
- ✅ Pricing page with Paystack integration
- ✅ Responsive design for mobile and desktop
- ✅ Dark mode support
- ✅ Modern component architecture

## 🚀 Next Steps

To complete the full application:

1. Set up Supabase project and database
2. Deploy edge functions for AI chat and RAG
3. Configure Paystack for payments
4. Add remaining legal features (citation generator, case summarizer, etc.)
5. Implement admin dashboard
6. Add document upload and RAG ingestion

## 📄 License

Proprietary - All rights reserved

## 👥 Support

Email: support@easyai.com
Documentation: Coming soon

---

Built with ❤️ for legal professionals worldwide