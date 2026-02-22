import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const systemInstruction = `You are a strict JSON rule generator. Translate the user's plain English instruction into a valid JSON schema for 'json-rules-engine'. 
    Strictly enforce the output to match the json-rules-engine schema (conditions, all/any, fact, operator, value, event).
    No markdown, no backticks, no conversational text. Output ONLY valid, parsable JSON.
    Example Input: "Give 10% off carts over 100"
    Example Output:
    {
      "conditions": {
        "all": [
          {
            "fact": "cartTotal",
            "operator": "greaterThan",
            "value": 100
          }
        ]
      },
      "event": {
        "type": "discount",
        "params": {
          "percentage": 10
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

        return new Response(JSON.stringify(parsedObj), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error generating rule:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
