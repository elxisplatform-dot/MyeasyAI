# Edge Functions Setup Guide

This guide explains how to configure and deploy the Supabase Edge Functions for easyAI's AI chat backend.

## Overview

The AI chat functionality is powered by three main edge functions:

1. **ai-chat** - Main chat endpoint with OpenAI GPT-4 integration and RAG
2. **internet-search** - Real-time web search using Tavily API
3. **_shared** - Shared utilities used across functions

## Prerequisites

### Required API Keys

1. **OpenAI API Key**
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys section
   - Create a new API key
   - Requires billing setup with payment method

2. **Tavily API Key** (Optional but recommended for Pro tier)
   - Sign up at [tavily.com](https://tavily.com)
   - Get your API key from the dashboard
   - Free tier includes 1000 searches/month

## Environment Variables

### For Edge Functions (Supabase Dashboard)

The following environment variables are automatically available in Supabase Edge Functions:
- `SUPABASE_URL` - Auto-configured
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured
- `SUPABASE_ANON_KEY` - Auto-configured

You need to manually add these in your Supabase Dashboard under **Edge Functions → Settings**:

```env
OPENAI_API_KEY=sk-proj-...your_key_here
TAVILY_API_KEY=tvly-...your_key_here
```

### For Frontend (.env file)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
```

## Deployment

### Option 1: Deploy via Supabase CLI (Recommended for Development)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy ai-chat
supabase functions deploy internet-search
```

### Option 2: Manual Deployment via Dashboard

This project uses the `mcp__supabase__deploy_edge_function` tool which automatically deploys functions. The functions are already configured and ready to deploy.

## Function Details

### ai-chat Function

**Endpoint**: `/functions/v1/ai-chat`

**Request Body**:
```json
{
  "message": "What is contract law?",
  "sessionId": "uuid-here",
  "userId": "uuid-here",
  "includeInternet": false
}
```

**Response**:
```json
{
  "answer": "Contract law is...",
  "sources": [
    {
      "title": "Contract Law Basics",
      "snippet": "...",
      "type": "document",
      "metadata": {}
    }
  ]
}
```

**Features**:
- OpenAI GPT-4 integration for intelligent responses
- RAG document search using vector embeddings
- Chat history context (last 10 messages)
- Internet search integration for Pro+ users
- Automatic source citation
- Stores messages in database

### internet-search Function

**Endpoint**: `/functions/v1/internet-search`

**Request Body**:
```json
{
  "query": "recent supreme court decisions 2024"
}
```

**Response**:
```json
{
  "results": [
    {
      "title": "Recent Supreme Court Cases",
      "url": "https://...",
      "snippet": "...",
      "type": "web",
      "metadata": { "score": 0.95 }
    }
  ]
}
```

**Features**:
- Tavily API integration for web search
- Automatic fallback if API unavailable
- Pro/Enterprise/Admin tier access only
- Returns up to 5 relevant results

## Security

### Row Level Security

All database operations respect RLS policies:
- Users can only access their own chats
- Documents are publicly readable
- Internet search requires Pro+ tier

### Authentication

All edge functions require valid Supabase JWT token:
```typescript
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

The functions automatically verify:
1. Valid JWT token
2. User exists in database
3. User has required subscription tier

## Testing

### Test ai-chat Function

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/ai-chat' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is tort law?",
    "sessionId": "test-session-id",
    "userId": "test-user-id",
    "includeInternet": false
  }'
```

### Test internet-search Function

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/internet-search' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest legal news"
  }'
```

## Troubleshooting

### "OpenAI API key not configured"
- Verify `OPENAI_API_KEY` is set in Edge Functions settings
- Check the API key is valid and has billing enabled

### "Tavily API key not configured"
- Internet search will use fallback mode
- Add `TAVILY_API_KEY` to enable web search

### "Unauthorized" errors
- Ensure you're sending valid JWT token
- Verify user exists in database
- Check RLS policies are correctly configured

### "Failed to fetch user profile"
- Ensure user record exists in `users` table
- Verify RLS policies allow user profile access

### Function deployment issues
- Check Supabase CLI is latest version
- Verify project is correctly linked
- Check function logs in Supabase dashboard

## Rate Limits

### OpenAI API
- Rate limits depend on your OpenAI account tier
- Recommended: Set up monitoring for usage

### Tavily API
- Free tier: 1000 searches/month
- Pro tier: 10,000 searches/month

### Application Rate Limits
- Free: 20 chats/month
- Pro: 500 chats/month
- Enterprise: Unlimited

## Cost Estimates

### OpenAI Costs (per 1000 chats)
- GPT-4: ~$30-60 (varies by length)
- Embeddings: ~$0.10

### Tavily Costs
- Free tier: $0
- Pro tier: $50/month

### Total Estimated Costs
- 1000 chats/month: ~$30-70
- 10,000 chats/month: ~$300-700

## Next Steps

1. Configure API keys in Supabase dashboard
2. Deploy edge functions
3. Test with sample queries
4. Monitor usage and costs
5. Optimize prompts for better responses
6. Add more documents to RAG database

## Support

For issues or questions:
- Check function logs in Supabase Dashboard
- Review OpenAI API status page
- Contact support@easyai.com
