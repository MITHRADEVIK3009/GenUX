"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageSquare, Loader2 } from "lucide-react"

interface GeminiInsight {
  query: string
  response: string
  timestamp: Date
  confidence: number
}

interface GeminiIntegrationProps {
  data: any[]
  metrics: any
}

export function GeminiIntegration({ data, metrics }: GeminiIntegrationProps) {
  const [query, setQuery] = useState("")
  const [insights, setInsights] = useState<GeminiInsight[]>([])
  const [loading, setLoading] = useState(false)

  const generateInsight = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/gemini-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          data: data.slice(0, 100), // Limit data size for API
          metrics,
        }),
      })

      const result = await response.json()

      const newInsight: GeminiInsight = {
        query,
        response: result.response,
        timestamp: new Date(),
        confidence: result.confidence || 0.8,
      }

      setInsights((prev) => [newInsight, ...prev.slice(0, 4)]) // Keep last 5 insights
      setQuery("")
    } catch (error) {
      console.error("Failed to generate insight:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            AI-Powered Analysis
          </CardTitle>
          <CardDescription>Ask questions about your GenUX data and get AI-generated insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Ask about your data... e.g., 'What factors most influence user satisfaction?' or 'How can we improve personalization?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
            <Button onClick={generateInsight} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
              Generate Insight
            </Button>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Insights</h3>
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium">{insight.query}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
                <CardDescription className="text-xs">{insight.timestamp.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{insight.response}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
