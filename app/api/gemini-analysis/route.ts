import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAi6l7eyX9qpvrBLwRnjtQ-ku7EwJ7wpDE"

export async function POST(request: NextRequest) {
  try {
    const { query, data, metrics } = await request.json()

    // Prepare context for Gemini
    const context = `
You are analyzing GenUX (Generative User Experience) system data. Here's the current data summary:

Total Users: ${data.length}
Average Personalization Score: ${metrics?.mlPerformance?.toFixed(2) || "N/A"}/5.0
Average Loading Speed: ${metrics?.systemResponsiveness?.toFixed(2) || "N/A"}/5.0
Intent Match Rate: ${metrics?.intentMatchRate?.toFixed(1) || "N/A"}%
UI Generation Latency: ${metrics?.uiGenerationLatency?.toFixed(0) || "N/A"}ms

Sample data points:
${data
  .slice(0, 5)
  .map(
    (d: any, i: number) => `
User ${i + 1}: Platform: ${d.Platform}, Experience: ${d.User_experience}, 
Personalization: ${d.Personalization}/5, Loading Speed: ${d["Loading Speed"]}/5
`,
  )
  .join("")}

User Question: ${query}

Please provide a detailed, actionable analysis based on this GenUX data. Focus on:
1. Direct answers to the user's question
2. Specific recommendations for improvement
3. Potential GenUX implementation strategies
4. Data-driven insights

Keep the response concise but comprehensive (max 300 words).
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: context,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate insight."

    return NextResponse.json({
      response: generatedText,
      confidence: 0.85,
    })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "Failed to generate AI insight" }, { status: 500 })
  }
}
