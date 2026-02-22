import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `You are a strict JSON rule generator. Translate the user's plain English instruction into a valid JSON schema for 'json-rules-engine'. 
        Strictly enforce the output to match the json-rules-engine schema (conditions, all/any, fact, operator, value, event).
        No markdown, no backticks, no conversational text. Output ONLY valid, parsable JSON.
        
        CRITICAL RULES FOR CAFE SCHEMA:
        1. If targeting specific menu items, the fact MUST be "items" and operator MUST be "containsCaseInsensitive". (e.g. "fact": "items", "operator": "containsCaseInsensitive", "value": "Avocado Toast")
        2. If increasing a price, event 'type' MUST be "increase".
        3. If decreasing a price, event 'type' MUST be "decrease".
        4. Inside event 'params', use "amount" (number) for flat dollar changes, or "percentage" (number) for percentage changes. Do not use both.

        Example Input: "Increase the price of Avocado Toast by 5 dollars"
        Example Output:
        {
          "conditions": {
            "all": [
              {
                "fact": "items",
                "operator": "containsCaseInsensitive",
                "value": "Avocado Toast"
              }
            ]
          },
          "event": {
            "type": "increase",
            "params": {
              "amount": 5
            }
          }
        }`;

    const completePrompt = `${systemInstruction}\n\nUser Input: ${prompt}\nOutput JSON:`;

    const result = await model.generateContent(completePrompt);
    const responseText = result.response.text();

    // Try to safely extract JSON if Gemini accidentally includes markdown code blocks
    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith("```json")) {
      cleanedJson = cleanedJson.substring(7);
      if (cleanedJson.endsWith("```")) {
        cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);
      }
    } else if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.substring(3);
      if (cleanedJson.endsWith("```")) {
        cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);
      }
    }

    cleanedJson = cleanedJson.trim();

    // Parse it to ensure it's valid before returning
    const parsedObj = JSON.parse(cleanedJson);

    // Initialize Supabase admin client to insert rule
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xseubadkltyupttwlxjx.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Grab the first project ID to attach to the rule
    const { data: projects } = await supabase.from('projects').select('id').limit(1);
    const projectId = projects?.[0]?.id;

    if (projectId) {
      // Auto-publish the rule to the database
      const { error: insertErr } = await supabase.from('rules').insert({
        project_id: projectId,
        name: `AI Rule: ${prompt.substring(0, 30)}...`,
        rule_schema: parsedObj,
        status: 'active'
      });
      if (insertErr) console.error("Failed to auto-publish AI rule:", insertErr);
    }

    return NextResponse.json({ json: JSON.stringify(parsedObj, null, 2) }, { status: 200 });

  } catch (error: any) {
    console.error("[API Generate Rule]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

