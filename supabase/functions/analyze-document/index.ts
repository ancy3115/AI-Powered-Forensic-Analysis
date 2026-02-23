import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileSize, fileContent } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert forensic document analyst AI. You analyze documents for signs of forgery, tampering, or authenticity.

Given the document information provided, perform a thorough forensic analysis across 5 layers: Metadata, Signature, Structure, Content, and Visual.

You MUST respond using the "forensic_analysis" tool/function provided. Do NOT respond with plain text.

Guidelines:
- Base your analysis on the actual file name, size, type, and any content provided
- For text content, analyze writing style, consistency, formatting anomalies
- For images, consider compression artifacts, metadata consistency
- Provide specific, concrete evidence strings for each finding
- Confidence scores should reflect real analysis certainty (50-99)
- The verdict should be "genuine" if no serious issues found, "forged" if critical issues exist, "suspicious" if there are warnings but no definitive proof
- Each finding needs a unique id like "f1", "f2", etc.
- Generate 3-6 findings based on what you actually observe in the document
- Be truthful: if the document appears normal, say so. Don't fabricate issues.`;

    const userPrompt = `Analyze this document for forgery:

File Name: ${fileName}
File Size: ${fileSize}
File Content (first portion): ${fileContent || "No text content available (binary file)"}

Perform a forensic analysis and return structured findings.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "forensic_analysis",
                description:
                  "Return the full forensic analysis result for a document",
                parameters: {
                  type: "object",
                  properties: {
                    verdict: {
                      type: "string",
                      enum: ["forged", "suspicious", "genuine"],
                      description: "Overall verdict",
                    },
                    overallConfidence: {
                      type: "number",
                      description: "Overall confidence 50-99",
                    },
                    findings: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          layer: {
                            type: "string",
                            enum: [
                              "Metadata",
                              "Signature",
                              "Structure",
                              "Content",
                              "Visual",
                            ],
                          },
                          severity: {
                            type: "string",
                            enum: ["critical", "warning", "info", "pass"],
                          },
                          title: { type: "string" },
                          description: { type: "string" },
                          confidence: { type: "number" },
                          evidence: { type: "string" },
                        },
                        required: [
                          "id",
                          "layer",
                          "severity",
                          "title",
                          "description",
                          "confidence",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["verdict", "overallConfidence", "findings"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "forensic_analysis" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
