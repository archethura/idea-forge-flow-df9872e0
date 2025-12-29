import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, folderId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!folderId) {
      throw new Error("folderId is required");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log("Generating outline from content, title:", title);

    // Call AI to generate outline points
    const systemPrompt = `You are an expert at synthesizing ideas and creating structured outlines.
Given a collection of notes and chat conversations, extract the key ideas and organize them into a clear outline structure.

Your task:
1. Identify the main themes and topics from the content
2. Create a hierarchical outline with main points and sub-points
3. Each point should be concise but meaningful
4. Return the outline as a JSON array

Return ONLY a JSON object with this structure:
{
  "points": [
    { "text": "Main point 1", "children": [
      { "text": "Sub-point 1.1", "children": [] },
      { "text": "Sub-point 1.2", "children": [] }
    ]},
    { "text": "Main point 2", "children": [] }
  ]
}

Keep points concise (under 100 characters each). Create 3-8 main points with relevant sub-points.`;

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
          { role: "user", content: `Create an outline titled "${title}" from this content:\n\n${content}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate outline");
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';
    
    console.log("AI response:", aiContent);

    // Parse the JSON from AI response
    let outlineData;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outlineData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Create a simple outline as fallback
      outlineData = {
        points: [
          { text: "Key ideas from content", children: [] },
          { text: "Further exploration needed", children: [] }
        ]
      };
    }

    // Create the outline in the database
    const { data: outline, error: outlineError } = await supabase
      .from('outlines')
      .insert({
        folder_id: folderId,
        title: title,
        description: `Generated from ${content.split('##').length - 1} source(s)`,
      })
      .select()
      .single();

    if (outlineError) {
      console.error("Error creating outline:", outlineError);
      throw outlineError;
    }

    console.log("Created outline:", outline.id);

    // Insert points recursively
    const insertPoints = async (points: any[], parentId: string | null = null, startOrder = 0) => {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const { data: insertedPoint, error: pointError } = await supabase
          .from('points')
          .insert({
            outline_id: outline.id,
            parent_point_id: parentId,
            text: point.text,
            order_index: startOrder + i,
          })
          .select()
          .single();

        if (pointError) {
          console.error("Error inserting point:", pointError);
          continue;
        }

        // Insert children
        if (point.children && point.children.length > 0) {
          await insertPoints(point.children, insertedPoint.id, 0);
        }
      }
    };

    await insertPoints(outlineData.points || []);

    console.log("Generated outline with points");

    return new Response(JSON.stringify({ 
      success: true, 
      outline,
      pointCount: outlineData.points?.length || 0 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Generate outline error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
