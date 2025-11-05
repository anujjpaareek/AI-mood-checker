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
    const { text } = await req.json();

    if (!text || text.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Text too short for mood detection" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert emotional intelligence AI that detects mood from text. Analyze the user's text and respond with ONLY ONE WORD from these options:
- happy (for joyful, excited, positive emotions)
- calm (for peaceful, relaxed, content emotions)
- sad (for depressed, down, melancholic emotions)
- angry (for frustrated, irritated, mad emotions)
- tired (for exhausted, sleepy, drained emotions)
- anxious (for worried, stressed, nervous emotions)
- excited (for enthusiastic, thrilled, energetic emotions)
- neutral (for balanced, ordinary, neither positive nor negative)

Respond with ONLY the mood word, nothing else. Be highly perceptive to subtle emotional cues in the text.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "detect_mood",
                description: "Detect the emotional mood from user text",
                parameters: {
                  type: "object",
                  properties: {
                    mood: {
                      type: "string",
                      enum: ["happy", "calm", "sad", "angry", "tired", "anxious", "excited", "neutral"],
                      description: "The detected mood from the text",
                    },
                    confidence: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                      description: "Confidence level of mood detection",
                    },
                  },
                  required: ["mood", "confidence"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "detect_mood" } },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI service credits exhausted. Please contact support.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to detect mood" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data));

    // Extract mood from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      const detectedMood = args.mood;
      const confidence = args.confidence;

      console.log("Detected mood:", detectedMood, "confidence:", confidence);

      return new Response(
        JSON.stringify({ mood: detectedMood, confidence }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fallback: If no tool call, return neutral
    console.log("No tool call found, defaulting to neutral");
    return new Response(
      JSON.stringify({ mood: "neutral", confidence: "low" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in detect-mood function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
