export const FEATURES = {
  // Free tier
  BASIC_CHAT: 'basic_chat',
  RAG_SEARCH: 'rag_search',
  
  // Pro tier
  INTERNET_SEARCH: 'internet_search',
  CITATION_GENERATOR: 'citation_generator',
  CASE_SUMMARIZER: 'case_summarizer',
  HEADNOTE_GENERATOR: 'headnote_generator',
  PRINCIPLE_SEARCH: 'principle_search',
  CASE_BRIEF_GENERATOR: 'case_brief_generator',
  CASE_COMPARATOR: 'case_comparator',
  STATUTE_NAVIGATOR: 'statute_navigator',
  EXPORT_PDF: 'export_pdf',
  EXPORT_DOCX: 'export_docx',
  
  // Enterprise tier
  PRECEDENT_FINDER: 'precedent_finder',
  TIMELINE_TRACKER: 'timeline_tracker',
  STATUTE_EVOLUTION: 'statute_evolution',
  TEAM_COLLABORATION: 'team_collaboration',
  DRAFTING_ASSISTANT: 'drafting_assistant',
  OFFLINE_MODE: 'offline_mode',
  VOICE_TO_LAW: 'voice_to_law',
  FIRM_ANALYTICS: 'firm_analytics',
  WHITE_LABEL: 'white_label'
}

export const TIER_FEATURES = {
  free: [FEATURES.BASIC_CHAT, FEATURES.RAG_SEARCH],
  pro: [
    FEATURES.BASIC_CHAT,
    FEATURES.RAG_SEARCH,
    FEATURES.INTERNET_SEARCH,
    FEATURES.CITATION_GENERATOR,
    FEATURES.CASE_SUMMARIZER,
    FEATURES.HEADNOTE_GENERATOR,
    FEATURES.PRINCIPLE_SEARCH,
    FEATURES.CASE_BRIEF_GENERATOR,
    FEATURES.CASE_COMPARATOR,
    FEATURES.STATUTE_NAVIGATOR,
    FEATURES.EXPORT_PDF,
    FEATURES.EXPORT_DOCX
  ],
  enterprise: Object.values(FEATURES),
  admin: Object.values(FEATURES)
}

export const hasFeatureAccess = (userRole, feature) => {
  return TIER_FEATURES[userRole]?.includes(feature) || false
}

export const getUpgradeMessage = (feature) => {
  const messages = {
    [FEATURES.INTERNET_SEARCH]: 'Upgrade to Pro to search the internet for recent cases and legal updates',
    [FEATURES.CITATION_GENERATOR]: 'Upgrade to Pro to generate legal citations automatically',
    [FEATURES.CASE_SUMMARIZER]: 'Upgrade to Pro to get AI-powered case summaries',
    [FEATURES.DRAFTING_ASSISTANT]: 'Upgrade to Enterprise for AI-powered legal drafting',
    [FEATURES.TEAM_COLLABORATION]: 'Upgrade to Enterprise for team collaboration features',
    [FEATURES.FIRM_ANALYTICS]: 'Upgrade to Enterprise for firm-wide analytics dashboard'
  }
  
  return messages[feature] || 'Upgrade your plan to access this feature'
}