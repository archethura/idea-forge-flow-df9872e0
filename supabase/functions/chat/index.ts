import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with hierarchical context
    let systemPrompt = `You are an intelligent writing and research assistant. You help users explore ideas, synthesize information, and create deliverables from their notes and research.

Your capabilities:
- Synthesize and find connections between notes and ideas
- Help structure outlines and documents
- Suggest improvements and identify gaps
- Generate content based on user's research

Always be helpful, insightful, and reference specific content from the user's context when relevant.`;

    if (context) {
      systemPrompt += `\n\n## Current Context\n`;
      
      if (context.space) {
        systemPrompt += `\n### Space: ${context.space.name}`;
        if (context.space.description) {
          systemPrompt += `\nDescription: ${context.space.description}`;
        }
      }
      
      if (context.folder) {
        systemPrompt += `\n\n### Current Folder: ${context.folder.name}`;
      }
      
      if (context.notes && context.notes.length > 0) {
        systemPrompt += `\n\n### Notes in this folder (${context.notes.length}):`;
        context.notes.forEach((note: any, i: number) => {
          systemPrompt += `\n${i + 1}. "${note.title}": ${note.content || '(empty)'}`;
        });
      }
      
      if (context.outline) {
        systemPrompt += `\n\n### Current Outline: ${context.outline.title}`;
        if (context.outline.description) {
          systemPrompt += `\nDescription: ${context.outline.description}`;
        }
      }
      
      if (context.points && context.points.length > 0) {
        systemPrompt += `\n\n### Outline Points:`;
        const buildPointTree = (points: any[], parentId: string | null = null, depth = 0) => {
          const indent = '  '.repeat(depth);
          points
            .filter(p => p.parent_point_id === parentId)
            .sort((a, b) => a.order_index - b.order_index)
            .forEach(point => {
              systemPrompt += `\n${indent}- ${point.text}`;
              buildPointTree(points, point.id, depth + 1);
            });
        };
        buildPointTree(context.points);
      }
      
      if (context.document) {
        systemPrompt += `\n\n### Current Document: ${context.document.title}`;
        systemPrompt += `\nStatus: ${context.document.status}`;
      }
      
      if (context.cards && context.cards.length > 0) {
        systemPrompt += `\n\n### Document Cards (${context.cards.length}):`;
        context.cards.forEach((card: any, i: number) => {
          systemPrompt += `\n${i + 1}. ${card.content || '(empty)'}`;
        });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
