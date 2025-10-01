import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";
import { getUserFromAuth, getUserProfile } from "../_shared/supabase.ts";
import { generateChatCompletion } from "../_shared/openai.ts";
import { searchDocuments, buildContextFromDocuments } from "../_shared/rag.ts";
import type { ChatRequest, ChatMessage, Source } from "../_shared/types.ts";

const SYSTEM_PROMPT = `You are easyAI, an expert legal research assistant with deep knowledge of law, cases, statutes, and legal procedures. Your role is to:

1. Provide accurate, well-researched legal information
2. Cite relevant sources and legal precedents
3. Explain complex legal concepts in clear terms
4. Always reference the specific documents or cases you're drawing from
5. Include proper legal citations when discussing cases or statutes
6. Be professional, precise, and helpful

When you cite sources, format them clearly and provide case names, statutes, or document titles.

IMPORTANT: You are providing legal information, not legal advice. Always remind users to consult with a qualified attorney for specific legal matters.`;

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

    const requestBody: ChatRequest = await req.json();
    const { message, sessionId, includeInternet } = requestBody;

    if (!message || !sessionId) {
      return errorResponse("Missing required fields: message, sessionId");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: chatHistory, error: historyError } = await supabase
      .from("chats")
      .select("role, message")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
    }

    const ragDocuments = await searchDocuments(message, 0.7, 5);

    let webResults: Source[] = [];
    if (includeInternet && (userProfile.role === "pro" || userProfile.role === "enterprise" || userProfile.role === "admin")) {
      try {
        const searchResponse = await fetch(
          `${supabaseUrl}/functions/v1/internet-search`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader!,
            },
            body: JSON.stringify({ query: message }),
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          webResults = searchData.results || [];
        }
      } catch (error) {
        console.error("Internet search error:", error);
      }
    }

    const allSources = [...ragDocuments, ...webResults];
    const contextFromDocs = buildContextFromDocuments(allSources);

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg: { role: string; message: string }) => {
        messages.push({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.message,
        });
      });
    }

    let userMessageContent = message;
    if (contextFromDocs) {
      userMessageContent = `${contextFromDocs}\n\nUser Question: ${message}\n\nPlease answer based on the provided documents and your legal knowledge. Cite specific sources when possible.`;
    }

    messages.push({
      role: "user",
      content: userMessageContent,
    });

    const answer = await generateChatCompletion(messages, 0.7);

    await supabase.from("chats").insert([
      {
        user_id: user.id,
        session_id: sessionId,
        message: message,
        role: "user",
        metadata: {},
      },
      {
        user_id: user.id,
        session_id: sessionId,
        message: answer,
        role: "assistant",
        sources: allSources,
        metadata: {
          model: "gpt-4",
          includeInternet,
        },
      },
    ]);

    const response: { answer: string; sources: Source[] } = {
      answer,
      sources: allSources,
    };

    return successResponse(response);
  } catch (error) {
    console.error("AI Chat error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
});
