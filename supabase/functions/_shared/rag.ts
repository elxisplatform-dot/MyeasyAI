import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { generateEmbedding } from "./openai.ts";
import type { Document, Source } from "./types.ts";

export async function searchDocuments(
  query: string,
  matchThreshold = 0.75,
  matchCount = 5
): Promise<Source[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("Document search error:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((doc: Document) => ({
    title: doc.title,
    snippet: doc.content ? doc.content.substring(0, 300) + "..." : "No content available",
    type: "document" as const,
    metadata: {
      ...doc.metadata,
      similarity: doc.similarity,
      id: doc.id,
    },
  }));
}

export function buildContextFromDocuments(documents: Source[]): string {
  if (documents.length === 0) {
    return "";
  }

  let context = "\n\n=== RELEVANT LEGAL DOCUMENTS ===\n\n";

  documents.forEach((doc, idx) => {
    context += `[Document ${idx + 1}] ${doc.title}\n`;
    context += `${doc.snippet}\n`;
    if (doc.metadata?.similarity) {
      context += `Relevance: ${(doc.metadata.similarity as number * 100).toFixed(1)}%\n`;
    }
    context += "\n";
  });

  context += "=== END OF DOCUMENTS ===\n\n";

  return context;
}
