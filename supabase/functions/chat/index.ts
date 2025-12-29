import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for each level
const getToolsForLevel = (level: string) => {
  const baseTools = [];

  if (level === 'space') {
    baseTools.push(
      {
        type: "function",
        function: {
          name: "create_folder",
          description: "Create a new folder in the current space",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the folder" },
              color: { type: "string", description: "Color hex code (optional)" },
            },
            required: ["name"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "list_folders",
          description: "List all folders in the current space",
          parameters: { type: "object", properties: {}, required: [] },
        },
      }
    );
  }

  if (level === 'folder') {
    baseTools.push(
      {
        type: "function",
        function: {
          name: "create_outline",
          description: "Create a new outline in the current folder",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the outline" },
              description: { type: "string", description: "Description (optional)" },
            },
            required: ["title"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_note",
          description: "Create a new note in the current folder",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the note" },
              content: { type: "string", description: "Content of the note (optional)" },
            },
            required: ["title"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "list_outlines",
          description: "List all outlines in the current folder",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "list_notes",
          description: "List all notes in the current folder",
          parameters: { type: "object", properties: {}, required: [] },
        },
      }
    );
  }

  if (level === 'outline') {
    baseTools.push(
      {
        type: "function",
        function: {
          name: "add_point",
          description: "Add a new point to the current outline",
          parameters: {
            type: "object",
            properties: {
              text: { type: "string", description: "Text content of the point" },
              parent_point_id: { type: "string", description: "Parent point ID for nesting (optional)" },
            },
            required: ["text"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_point",
          description: "Update an existing point",
          parameters: {
            type: "object",
            properties: {
              point_id: { type: "string", description: "ID of the point to update" },
              text: { type: "string", description: "New text content" },
            },
            required: ["point_id", "text"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "delete_point",
          description: "Delete a point from the outline",
          parameters: {
            type: "object",
            properties: {
              point_id: { type: "string", description: "ID of the point to delete" },
            },
            required: ["point_id"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_document",
          description: "Create a new document from this outline",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the document" },
            },
            required: ["title"],
          },
        },
      }
    );
  }

  if (level === 'document') {
    baseTools.push(
      {
        type: "function",
        function: {
          name: "add_card",
          description: "Add a new card/section to the document",
          parameters: {
            type: "object",
            properties: {
              content: { type: "string", description: "Content of the card" },
              source_point_id: { type: "string", description: "Source point ID this card is based on (optional)" },
            },
            required: ["content"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_card",
          description: "Update an existing card's content",
          parameters: {
            type: "object",
            properties: {
              card_id: { type: "string", description: "ID of the card to update" },
              content: { type: "string", description: "New content" },
            },
            required: ["card_id", "content"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "delete_card",
          description: "Delete a card from the document",
          parameters: {
            type: "object",
            properties: {
              card_id: { type: "string", description: "ID of the card to delete" },
            },
            required: ["card_id"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "compile_document",
          description: "Compile all cards into a single text output",
          parameters: { type: "object", properties: {}, required: [] },
        },
      }
    );
  }

  return baseTools;
};

// Execute tool calls against the database
async function executeTool(
  supabase: any,
  toolName: string,
  args: any,
  context: any
): Promise<{ success: boolean; result: any; message: string }> {
  console.log(`Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      // Space level tools
      case 'create_folder': {
        const { data, error } = await supabase
          .from('folders')
          .insert({
            space_id: context.space?.id,
            name: args.name,
            color: args.color || '#F59E0B',
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Created folder "${args.name}"` };
      }

      case 'list_folders': {
        const { data, error } = await supabase
          .from('folders')
          .select('id, name, color')
          .eq('space_id', context.space?.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return { success: true, result: data, message: `Found ${data.length} folders` };
      }

      // Folder level tools
      case 'create_outline': {
        const { data, error } = await supabase
          .from('outlines')
          .insert({
            folder_id: context.folder?.id,
            title: args.title,
            description: args.description || null,
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Created outline "${args.title}"` };
      }

      case 'create_note': {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            folder_id: context.folder?.id,
            title: args.title,
            content: args.content || null,
            type: 'note',
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Created note "${args.title}"` };
      }

      case 'list_outlines': {
        const { data, error } = await supabase
          .from('outlines')
          .select('id, title, description')
          .eq('folder_id', context.folder?.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, result: data, message: `Found ${data.length} outlines` };
      }

      case 'list_notes': {
        const { data, error } = await supabase
          .from('notes')
          .select('id, title, content, type')
          .eq('folder_id', context.folder?.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, result: data, message: `Found ${data.length} notes` };
      }

      // Outline level tools
      case 'add_point': {
        // Get max order_index for the parent
        const { data: existingPoints } = await supabase
          .from('points')
          .select('order_index')
          .eq('outline_id', context.outline?.id)
          .eq('parent_point_id', args.parent_point_id || null)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrder = existingPoints?.[0]?.order_index != null 
          ? existingPoints[0].order_index + 1 
          : 0;

        const { data, error } = await supabase
          .from('points')
          .insert({
            outline_id: context.outline?.id,
            text: args.text,
            parent_point_id: args.parent_point_id || null,
            order_index: nextOrder,
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Added point: "${args.text.substring(0, 50)}..."` };
      }

      case 'update_point': {
        const { data, error } = await supabase
          .from('points')
          .update({ text: args.text })
          .eq('id', args.point_id)
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Updated point` };
      }

      case 'delete_point': {
        const { error } = await supabase
          .from('points')
          .delete()
          .eq('id', args.point_id);
        if (error) throw error;
        return { success: true, result: null, message: `Deleted point` };
      }

      case 'create_document': {
        const { data, error } = await supabase
          .from('documents')
          .insert({
            outline_id: context.outline?.id,
            title: args.title,
            status: 'draft',
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Created document "${args.title}"` };
      }

      // Document level tools
      case 'add_card': {
        // Get max order_index
        const { data: existingCards } = await supabase
          .from('cards')
          .select('order_index')
          .eq('document_id', context.document?.id)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrder = existingCards?.[0]?.order_index != null 
          ? existingCards[0].order_index + 1 
          : 0;

        const { data, error } = await supabase
          .from('cards')
          .insert({
            document_id: context.document?.id,
            content: args.content,
            source_point_id: args.source_point_id || null,
            order_index: nextOrder,
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Added card` };
      }

      case 'update_card': {
        // Check ai_lock first
        const { data: card } = await supabase
          .from('cards')
          .select('ai_lock')
          .eq('id', args.card_id)
          .single();
        
        if (card?.ai_lock) {
          return { success: false, result: null, message: `Cannot update card - it is locked (ai_lock=true)` };
        }

        const { data, error } = await supabase
          .from('cards')
          .update({ content: args.content })
          .eq('id', args.card_id)
          .select()
          .single();
        if (error) throw error;
        return { success: true, result: data, message: `Updated card` };
      }

      case 'delete_card': {
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', args.card_id);
        if (error) throw error;
        return { success: true, result: null, message: `Deleted card` };
      }

      case 'compile_document': {
        const { data: cards, error } = await supabase
          .from('cards')
          .select('content, order_index')
          .eq('document_id', context.document?.id)
          .order('order_index', { ascending: true });
        if (error) throw error;
        
        const compiled = cards.map((c: any) => c.content).join('\n\n');
        return { success: true, result: { compiled, cardCount: cards.length }, message: `Compiled ${cards.length} cards` };
      }

      default:
        return { success: false, result: null, message: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Tool execution error:`, error);
    return { success: false, result: null, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, level } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client with service role for tool execution
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Determine current level from context
    const currentLevel = level || 
      (context?.document ? 'document' : 
       context?.outline ? 'outline' : 
       context?.folder ? 'folder' : 
       context?.space ? 'space' : 'space');

    // Get tools for this level
    const tools = getToolsForLevel(currentLevel);

    // Build system prompt with hierarchical context
    let systemPrompt = `You are an intelligent writing and research assistant for Archethura, a hierarchical writing system.

Your capabilities vary by level:
- At Space level: You can create/list folders
- At Folder level: You can create outlines and notes
- At Outline level: You can add/edit/delete points, create documents
- At Document level: You can add/edit/delete cards, compile documents

IMPORTANT: When the user asks you to CREATE, ADD, DELETE, or MODIFY something, USE THE APPROPRIATE TOOL. Do not just describe what you would do - actually do it using the tools available.

Current level: ${currentLevel.toUpperCase()}

When you use a tool:
1. Execute the tool
2. Confirm what you did to the user
3. Suggest next steps if appropriate`;

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
              systemPrompt += `\n${indent}- [${point.id}] ${point.text}`;
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
          const lockStatus = card.ai_lock ? ' [LOCKED]' : '';
          systemPrompt += `\n${i + 1}. [${card.id}]${lockStatus}: ${card.content || '(empty)'}`;
        });
      }
    }

    console.log('Making AI request with level:', currentLevel, 'tools:', tools.length);

    // First AI call with tools
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
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
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

    const aiResult = await response.json();
    console.log('AI response:', JSON.stringify(aiResult, null, 2));

    const choice = aiResult.choices?.[0];
    const message = choice?.message;

    // Check if AI wants to use tools
    if (message?.tool_calls && message.tool_calls.length > 0) {
      console.log('Processing tool calls:', message.tool_calls.length);
      
      const toolResults: any[] = [];
      const actions: string[] = [];

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function?.name;
        const toolArgs = JSON.parse(toolCall.function?.arguments || '{}');
        
        const result = await executeTool(supabase, toolName, toolArgs, context);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result),
        });
        actions.push(result.message);
      }

      // Second AI call with tool results
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            message,
            ...toolResults,
          ],
        }),
      });

      if (!followUpResponse.ok) {
        // Return partial result with actions taken
        const actionsSummary = actions.join('\n');
        return new Response(JSON.stringify({ 
          content: `✅ Actions completed:\n${actionsSummary}`,
          actions,
          toolsUsed: true,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const followUpResult = await followUpResponse.json();
      const finalContent = followUpResult.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({ 
        content: finalContent,
        actions,
        toolsUsed: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls - return regular response (but non-streaming for simplicity with tool support)
    const content = message?.content || '';
    return new Response(JSON.stringify({ 
      content,
      actions: [],
      toolsUsed: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
