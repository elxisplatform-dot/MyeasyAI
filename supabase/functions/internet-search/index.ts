import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";
import { getUserFromAuth, getUserProfile } from "../_shared/supabase.ts";
import type { Source } from "../_shared/types.ts";

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

async function searchWithTavily(query: string): Promise<Source[]> {
  if (!TAVILY_API_KEY) {
    console.warn("Tavily API key not configured, returning empty results");
    return [];
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error("Tavily API error:", await response.text());
      return [];
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((result: TavilyResult) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 300) + (result.content.length > 300 ? "..." : ""),
      type: "web" as const,
      metadata: {
        score: result.score,
        source: "tavily",
      },
    }));
  } catch (error) {
    console.error("Tavily search error:", error);
    return [];
  }
}

async function searchWithFallback(query: string): Promise<Source[]> {
  const results = await searchWithTavily(query);

  if (results.length > 0) {
    return results;
  }

  return [{
    title: "Internet Search Unavailable",
    snippet: "Internet search is temporarily unavailable. The AI will use its knowledge base to answer your question.",
    type: "web" as const,
    metadata: {
      fallback: true,
    },
  }];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreFlight();
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Unauthorized", 401);
    }

    const user = await getUserFromAuth(authHeader);
    const userProfile = await getUserProfile(user.id);

    if (!["pro", "enterprise", "admin"].includes(userProfile.role)) {
      return errorResponse(
        "Internet search is only available for Pro, Enterprise, and Admin users",
        403
      );
    }

    const { query } = await req.json();

    if (!query) {
      return errorResponse("Missing required field: query");
    }

    const results = await searchWithFallback(query);

    return successResponse({ results });
  } catch (error) {
    console.error("Internet search error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
});
