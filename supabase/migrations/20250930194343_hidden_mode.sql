/*
  # Seed Subscription Plans

  1. Plans
    - Free: Basic features, 20 chats/month
    - Pro: Advanced features, 500 chats/month, ₦2,999/month
    - Enterprise: All features, unlimited chats, ₦9,999/month

  2. Features
    - Each plan has specific feature access
    - Paystack subaccounts for revenue splitting
*/

-- Seed subscription plans
INSERT INTO plans (name, tier, price, features, split_account) VALUES
(
  'Free',
  'free',
  0.00,
  '{
    "max_chats_per_month": 20,
    "max_documents": 0,
    "rag_access": true,
    "internet_search": false,
    "citation_generator": false,
    "case_summarizer": false,
    "export_pdf": false,
    "support": "community"
  }'::jsonb,
  NULL
),
(
  'Pro',
  'pro',
  2999.00,
  '{
    "max_chats_per_month": 500,
    "max_documents": 50,
    "rag_access": true,
    "internet_search": true,
    "citation_generator": true,
    "case_summarizer": true,
    "headnote_generator": true,
    "principle_search": true,
    "case_brief_generator": true,
    "case_comparator": true,
    "statute_navigator": true,
    "export_pdf": true,
    "export_docx": true,
    "team_boards": false,
    "support": "email"
  }'::jsonb,
  'ACCT_xxxxxxxxxxxxxx'
),
(
  'Enterprise',
  'enterprise',
  9999.00,
  '{
    "max_chats_per_month": -1,
    "max_documents": -1,
    "rag_access": true,
    "internet_search": true,
    "all_pro_features": true,
    "precedent_finder": true,
    "timeline_tracker": true,
    "statute_evolution": true,
    "team_collaboration": true,
    "role_based_permissions": true,
    "shared_folders": true,
    "drafting_assistant": true,
    "offline_mode": true,
    "voice_to_law": true,
    "firm_analytics": true,
    "white_label": true,
    "dedicated_support": true,
    "support": "priority"
  }'::jsonb,
  'ACCT_yyyyyyyyyyyyyy'
);