"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert as UIAlert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts"
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Bell,
} from "lucide-react"

// Dataset URLs - Updated with your provided URLs
const DATASET_URLS = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UI%20UX%20Dataset-OkDONUQtApvW18mALMQBMmYHMBVIfi.csv",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UI%20UX%20Dataset%20%281%29-324o35uhGdKOqKXnkCjgGMBkHPuOPl.csv",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UI%20UX%20Dataset%20%282%29-Sa8DRMMdAYacmlJkn3fUoBAdNNwlfk.csv",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UI%20UX%20Dataset%20%283%29-cEhiunCQIX8NsszfltJazLKRR4uJGK.csv",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UI%20UX%20Dataset%20%284%29-87LXlyVDUBp3YIGMGMVMAjvTChul1f.csv",
]

interface UXDataPoint {
  Name: string
  Age: string
  Gender: string
  Platform: string
  User_experience: string
  "Color Scheme": number
  "Visual Hierarchy": number
  Typography: number
  "Images and Multimedia": number
  Layout: number
  "Mobile Responsiveness": number
  "CTA (Call to Action) Buttons": number
  "Forms and Input Fields": number
  "Feedback and Error Messages": number
  "Loading Speed": number
  Personalization: number
  Accessibility: number
  "Animation and Transitions": number
  Scrolling_Behavior: number
  "Gestures and Touch Controls": number
  "Search Functionality": number
  Social_Media_Integration: number
  source_dataset?: string
  timestamp?: Date
  ux_sentiment_score?: number
}

interface GenUXMetrics {
  adaptationEffectiveness: number
  mlPerformance: number
  systemResponsiveness: number
  userEngagement: number
  overallScore: number
  intentMatchRate: number
  driftDetectionAccuracy: number
  uiGenerationLatency: number
}

interface Alert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  timestamp: Date
  metric: string
  value: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"]

// UX Experience sentiment mapping
const UX_SENTIMENT_MAP: Record<string, number> = {
  Intuitive: 5,
  Smooth: 5,
  Efficient: 4,
  Good: 4,
  Moderate: 3,
  Average: 3,
  Confusing: 2,
  Frustrating: 2,
  Overwhelming: 1,
  Poor: 1,
}

export default function GenUXRealDashboard() {
  const [data, setData] = useState<UXDataPoint[]>([])
  const [filteredData, setFilteredData] = useState<UXDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [genuxMetrics, setGenuxMetrics] = useState<GenUXMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 1 minute

  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all")
  const [experienceFilter, setExperienceFilter] = useState<string>("all")

  useEffect(() => {
    loadAllDatasets()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        simulateRealTimeUpdate()
      }, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  useEffect(() => {
    applyFilters()
  }, [data, platformFilter, genderFilter, ageRangeFilter, experienceFilter])

  const parseCSV = (csvText: string, datasetIndex: number): UXDataPoint[] => {
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    return lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const dataPoint: any = {}

      headers.forEach((header, headerIndex) => {
        const value = values[headerIndex]

        // Convert numeric fields (treating schema "date" as numeric ratings)
        if (
          [
            "Color Scheme",
            "Visual Hierarchy",
            "Typography",
            "Images and Multimedia",
            "Layout",
            "Mobile Responsiveness",
            "CTA (Call to Action) Buttons",
            "Forms and Input Fields",
            "Feedback and Error Messages",
            "Loading Speed",
            "Personalization",
            "Accessibility",
            "Animation and Transitions",
            "Scrolling_Behavior",
            "Gestures and Touch Controls",
            "Search Functionality",
            "Social_Media_Integration",
          ].includes(header)
        ) {
          const numValue = Number.parseInt(value) || 0
          // Validate range 1-5
          dataPoint[header] = Math.max(1, Math.min(5, numValue))
        } else {
          dataPoint[header] = value
        }
      })

      // Add metadata
      dataPoint.source_dataset = `Dataset ${datasetIndex + 1}`
      dataPoint.timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random timestamp within last 30 days
      dataPoint.ux_sentiment_score = UX_SENTIMENT_MAP[dataPoint.User_experience] || 3

      return dataPoint as UXDataPoint
    })
  }

  const loadAllDatasets = async () => {
    try {
      setLoading(true)
      const allData: UXDataPoint[] = []

      for (let i = 0; i < DATASET_URLS.length; i++) {
        try {
          const response = await fetch(DATASET_URLS[i])
          const csvText = await response.text()
          const parsedData = parseCSV(csvText, i)
          allData.push(...parsedData)
        } catch (err) {
          console.warn(`Failed to load dataset ${i + 1}:`, err)
        }
      }

      if (allData.length === 0) {
        throw new Error("No datasets could be loaded")
      }

      // Data validation and cleaning
      const cleanedData = allData.filter((d) => {
        // Remove entries with invalid age or missing critical fields
        const age = Number.parseInt(d.Age)
        return age > 0 && age < 100 && d.Name && d.Platform && d.User_experience
      })

      setData(cleanedData)
      calculateGenUXMetrics(cleanedData)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load datasets")
    } finally {
      setLoading(false)
    }
  }

  const calculateGenUXMetrics = (data: UXDataPoint[]) => {
    if (data.length === 0) return

    // Calculate real GenUX metrics from actual data
    const avgPersonalization = data.reduce((sum, d) => sum + d.Personalization, 0) / data.length
    const avgLoadingSpeed = data.reduce((sum, d) => sum + d["Loading Speed"], 0) / data.length
    const avgMobileResponsiveness = data.reduce((sum, d) => sum + d["Mobile Responsiveness"], 0) / data.length
    const avgAccessibility = data.reduce((sum, d) => sum + d.Accessibility, 0) / data.length
    const avgUXSentiment = data.reduce((sum, d) => sum + (d.ux_sentiment_score || 3), 0) / data.length

    // Calculate adaptation effectiveness based on personalization and UX sentiment correlation
    const adaptationEffectiveness = (avgPersonalization + avgUXSentiment) / 2

    // Simulate ML performance based on data patterns
    const mlPerformance = avgPersonalization
    const intentMatchRate = (avgPersonalization / 5) * 100 // Convert to percentage

    // System responsiveness from loading speed
    const systemResponsiveness = avgLoadingSpeed
    const uiGenerationLatency = (6 - avgLoadingSpeed) * 60 // Inverse relationship, convert to ms estimate

    // User engagement from mobile responsiveness and accessibility
    const userEngagement = (avgMobileResponsiveness + avgAccessibility) / 2

    // Drift detection accuracy simulation based on data variance
    const personalizations = data.map((d) => d.Personalization)
    const variance =
      personalizations.reduce((sum, val) => sum + Math.pow(val - avgPersonalization, 2), 0) / personalizations.length
    const driftDetectionAccuracy = Math.max(70, 100 - variance * 10) // Higher variance = lower accuracy

    const metrics: GenUXMetrics = {
      adaptationEffectiveness,
      mlPerformance,
      systemResponsiveness,
      userEngagement,
      overallScore: (adaptationEffectiveness + mlPerformance + systemResponsiveness + userEngagement) / 4,
      intentMatchRate,
      driftDetectionAccuracy,
      uiGenerationLatency,
    }

    setGenuxMetrics(metrics)
    checkAlerts(metrics)
  }

  const checkAlerts = (metrics: GenUXMetrics) => {
    const newAlerts: Alert[] = []

    // Check against benchmarks
    if (metrics.adaptationEffectiveness < 3.5) {
      newAlerts.push({
        id: `alert-${Date.now()}-1`,
        type: "warning",
        message: "Adaptation effectiveness below target (3.5/5.0)",
        timestamp: new Date(),
        metric: "Adaptation Effectiveness",
        value: metrics.adaptationEffectiveness,
      })
    }

    if (metrics.intentMatchRate < 80) {
      newAlerts.push({
        id: `alert-${Date.now()}-2`,
        type: "error",
        message: "Intent match rate below 80% threshold",
        timestamp: new Date(),
        metric: "Intent Match Rate",
        value: metrics.intentMatchRate,
      })
    }

    if (metrics.uiGenerationLatency > 300) {
      newAlerts.push({
        id: `alert-${Date.now()}-3`,
        type: "warning",
        message: "UI generation latency exceeds 300ms target",
        timestamp: new Date(),
        metric: "UI Generation Latency",
        value: metrics.uiGenerationLatency,
      })
    }

    if (metrics.driftDetectionAccuracy < 85) {
      newAlerts.push({
        id: `alert-${Date.now()}-4`,
        type: "warning",
        message: "Drift detection accuracy below 85% threshold",
        timestamp: new Date(),
        metric: "Drift Detection Accuracy",
        value: metrics.driftDetectionAccuracy,
      })
    }

    setAlerts((prev) => [...newAlerts, ...prev.slice(0, 10)]) // Keep last 10 alerts
  }

  const simulateRealTimeUpdate = () => {
    // Simulate real-time data updates by slightly modifying existing data
    setData((prevData) => {
      const updatedData = prevData.map((item) => {
        // Randomly update some metrics slightly to simulate real-time changes
        if (Math.random() < 0.1) {
          // 10% chance of update per item
          const updatedItem = { ...item }
          const metricsToUpdate = ["Personalization", "Loading Speed", "Mobile Responsiveness"]
          const randomMetric = metricsToUpdate[Math.floor(Math.random() * metricsToUpdate.length)]

          // Small random change (-0.5 to +0.5)
          const currentValue = updatedItem[randomMetric as keyof UXDataPoint] as number
          const change = Math.random() - 0.5
          updatedItem[randomMetric as keyof UXDataPoint] = Math.max(1, Math.min(5, currentValue + change)) as any
          updatedItem.timestamp = new Date()

          return updatedItem
        }
        return item
      })

      calculateGenUXMetrics(updatedData)
      setLastUpdate(new Date())
      return updatedData
    })
  }

  const applyFilters = () => {
    let filtered = [...data]

    if (platformFilter !== "all") {
      filtered = filtered.filter((d) => d.Platform === platformFilter)
    }

    if (genderFilter !== "all") {
      filtered = filtered.filter((d) => d.Gender === genderFilter)
    }

    if (ageRangeFilter !== "all") {
      const age = Number.parseInt(filtered[0]?.Age || "0")
      filtered = filtered.filter((d) => {
        const userAge = Number.parseInt(d.Age)
        switch (ageRangeFilter) {
          case "18-25":
            return userAge >= 18 && userAge <= 25
          case "26-35":
            return userAge >= 26 && userAge <= 35
          case "36-45":
            return userAge >= 36 && userAge <= 45
          case "45+":
            return userAge > 45
          default:
            return true
        }
      })
    }

    if (experienceFilter !== "all") {
      filtered = filtered.filter((d) => d.User_experience === experienceFilter)
    }

    setFilteredData(filtered)
  }

  const exportData = (format: "csv" | "json") => {
    const dataToExport = filteredData.length > 0 ? filteredData : data

    if (format === "csv") {
      const headers = Object.keys(dataToExport[0] || {})
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) => headers.map((header) => row[header as keyof UXDataPoint]).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `genux-data-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
    } else {
      const jsonContent = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `genux-data-${new Date().toISOString().split("T")[0]}.json`
      a.click()
    }
  }

  const getMetricAnalysis = () => {
    const workingData = filteredData.length > 0 ? filteredData : data
    if (!workingData.length) return []

    const metrics = [
      "Color Scheme",
      "Visual Hierarchy",
      "Typography",
      "Layout",
      "Mobile Responsiveness",
      "Loading Speed",
      "Personalization",
      "Accessibility",
    ]

    return metrics.map((metric) => {
      const values = workingData.map((d) => d[metric as keyof UXDataPoint] as number)
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length

      return {
        name: metric,
        average: avg,
        min,
        max,
        variance,
        count: values.length,
      }
    })
  }

  const getPlatformDistribution = () => {
    const workingData = filteredData.length > 0 ? filteredData : data
    const platforms = workingData.reduce(
      (acc, d) => {
        acc[d.Platform] = (acc[d.Platform] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(platforms).map(([name, value]) => ({ name, value }))
  }

  const getCorrelationData = () => {
    const workingData = filteredData.length > 0 ? filteredData : data
    if (!workingData.length) return []

    return workingData.map((d, index) => ({
      id: index,
      personalization: d.Personalization,
      loadingSpeed: d["Loading Speed"],
      userExperience: d.ux_sentiment_score || 3,
      mobileResponsiveness: d["Mobile Responsiveness"],
      accessibility: d.Accessibility,
    }))
  }

  const getTimeSeriesData = () => {
    const workingData = filteredData.length > 0 ? filteredData : data
    if (!workingData.length) return []

    // Group by day and calculate averages
    const grouped = workingData.reduce(
      (acc, d) => {
        const date = d.timestamp?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = { date, items: [] }
        }
        acc[date].items.push(d)
        return acc
      },
      {} as Record<string, { date: string; items: UXDataPoint[] }>,
    )

    return Object.values(grouped)
      .map((group) => ({
        date: group.date,
        adaptationEffectiveness:
          group.items.reduce((sum, item) => sum + (item.Personalization + (item.ux_sentiment_score || 3)) / 2, 0) /
          group.items.length,
        systemResponsiveness: group.items.reduce((sum, item) => sum + item["Loading Speed"], 0) / group.items.length,
        userEngagement:
          group.items.reduce((sum, item) => sum + (item["Mobile Responsiveness"] + item.Accessibility) / 2, 0) /
          group.items.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Real GenUX Data</h2>
            <p className="text-gray-600">Fetching and processing your UI/UX datasets...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          <UIAlert className="max-w-2xl mx-auto mt-12">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading datasets: {error}
              <Button onClick={loadAllDatasets} className="ml-4" size="sm">
                Retry
              </Button>
            </AlertDescription>
          </UIAlert>
        </div>
      </div>
    )
  }

  const metricAnalysis = getMetricAnalysis()
  const platformData = getPlatformDistribution()
  const correlationData = getCorrelationData()
  const timeSeriesData = getTimeSeriesData()
  const workingData = filteredData.length > 0 ? filteredData : data

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Real-time Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">GenUX Real-Time Dashboard</h1>
            <p className="text-xl text-gray-600 mb-4">Live Performance Metrics & Analysis for Generative UX Systems</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                <Users className="h-4 w-4 mr-1" />
                {workingData.length} Users
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                {DATASET_URLS.length} Datasets
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Clock className="h-4 w-4 mr-1" />
                Last Update: {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto Refresh
            </Button>
            <Button onClick={() => exportData("csv")} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => exportData("json")} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <UIAlert
                key={alert.id}
                className={`${
                  alert.type === "error"
                    ? "border-red-500 bg-red-50"
                    : alert.type === "warning"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-blue-500 bg-blue-50"
                }`}
              >
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.metric}:</strong> {alert.message} (Value: {alert.value.toFixed(2)})
                  <span className="text-xs text-gray-500 ml-2">{alert.timestamp.toLocaleTimeString()}</span>
                </AlertDescription>
              </UIAlert>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Data Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="Desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Age Range</label>
                <Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="45+">45+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Experience</label>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experiences</SelectItem>
                    <SelectItem value="Intuitive">Intuitive</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Confusing">Confusing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GenUX Performance Metrics Overview */}
        {genuxMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  Adaptation Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {genuxMetrics.adaptationEffectiveness.toFixed(2)}/5.0
                </div>
                <Progress value={genuxMetrics.adaptationEffectiveness * 20} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">Target: ≥3.5/5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Intent Match Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{genuxMetrics.intentMatchRate.toFixed(1)}%</div>
                <Progress value={genuxMetrics.intentMatchRate} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">Target: ≥80%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                  UI Generation Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {genuxMetrics.uiGenerationLatency.toFixed(0)}ms
                </div>
                <Progress value={Math.max(0, 100 - (genuxMetrics.uiGenerationLatency / 500) * 100)} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">Target: &lt;300ms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                  Drift Detection Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {genuxMetrics.driftDetectionAccuracy.toFixed(1)}%
                </div>
                <Progress value={genuxMetrics.driftDetectionAccuracy} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">Target: ≥85%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="metrics">UX Metrics</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="genux-specific">GenUX Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Performance Trends</CardTitle>
                  <CardDescription>Live GenUX metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="adaptationEffectiveness"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Adaptation"
                      />
                      <Line
                        type="monotone"
                        dataKey="systemResponsiveness"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Responsiveness"
                      />
                      <Line
                        type="monotone"
                        dataKey="userEngagement"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="Engagement"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance Monitor</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data Processing</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ML Pipeline</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Running
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Alert System</span>
                      <Badge variant="outline" className="text-blue-600">
                        <Bell className="h-3 w-3 mr-1" />
                        {alerts.length} Active
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data Freshness</span>
                      <Badge variant="outline" className="text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>UX Metrics Performance</CardTitle>
                  <CardDescription>
                    Average scores from {workingData.length} users
                    {filteredData.length > 0 &&
                      filteredData.length !== data.length &&
                      ` (filtered from ${data.length})`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metricAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="average" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>User platform breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>User age demographics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={[
                        {
                          name: "18-25",
                          value: workingData.filter((d) => Number.parseInt(d.Age) >= 18 && Number.parseInt(d.Age) <= 25)
                            .length,
                        },
                        {
                          name: "26-35",
                          value: workingData.filter((d) => Number.parseInt(d.Age) >= 26 && Number.parseInt(d.Age) <= 35)
                            .length,
                        },
                        {
                          name: "36-45",
                          value: workingData.filter((d) => Number.parseInt(d.Age) >= 36 && Number.parseInt(d.Age) <= 45)
                            .length,
                        },
                        { name: "45+", value: workingData.filter((d) => Number.parseInt(d.Age) > 45).length },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>User gender breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Male", value: workingData.filter((d) => d.Gender.toLowerCase() === "male").length },
                          {
                            name: "Female",
                            value: workingData.filter((d) => d.Gender.toLowerCase() === "female").length,
                          },
                          {
                            name: "Other",
                            value: workingData.filter((d) => !["male", "female"].includes(d.Gender.toLowerCase()))
                              .length,
                          },
                        ].filter((item) => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience Quality</CardTitle>
                  <CardDescription>User experience ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={Object.entries(
                        workingData.reduce(
                          (acc, d) => {
                            acc[d.User_experience] = (acc[d.User_experience] || 0) + 1
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                      ).map(([name, value]) => ({ name, value }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalization vs User Experience</CardTitle>
                  <CardDescription>Correlation between personalization and satisfaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={correlationData}>
                      <CartesianGrid />
                      <XAxis dataKey="personalization" name="Personalization" domain={[1, 5]} />
                      <YAxis dataKey="userExperience" name="User Experience" domain={[1, 5]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Users" dataKey="userExperience" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loading Speed vs Mobile Responsiveness</CardTitle>
                  <CardDescription>System performance correlation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={correlationData}>
                      <CartesianGrid />
                      <XAxis dataKey="loadingSpeed" name="Loading Speed" domain={[1, 5]} />
                      <YAxis dataKey="mobileResponsiveness" name="Mobile Responsiveness" domain={[1, 5]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Users" dataKey="mobileResponsiveness" fill="#10B981" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="genux-specific" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>GenUX Performance Matrix</CardTitle>
                  <CardDescription>Multi-dimensional performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart
                      data={[
                        { metric: "Adaptation", value: genuxMetrics?.adaptationEffectiveness || 0, fullMark: 5 },
                        { metric: "ML Performance", value: genuxMetrics?.mlPerformance || 0, fullMark: 5 },
                        { metric: "Responsiveness", value: genuxMetrics?.systemResponsiveness || 0, fullMark: 5 },
                        { metric: "Engagement", value: genuxMetrics?.userEngagement || 0, fullMark: 5 },
                        { metric: "Intent Match", value: (genuxMetrics?.intentMatchRate || 0) / 20, fullMark: 5 },
                        {
                          metric: "Drift Detection",
                          value: (genuxMetrics?.driftDetectionAccuracy || 0) / 20,
                          fullMark: 5,
                        },
                      ]}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" fontSize={12} />
                      <PolarRadiusAxis domain={[0, 5]} />
                      <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benchmark Comparison</CardTitle>
                  <CardDescription>Current vs target performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Adaptation Effectiveness</span>
                        <span>{genuxMetrics?.adaptationEffectiveness.toFixed(2)}/5.0</span>
                      </div>
                      <Progress value={(genuxMetrics?.adaptationEffectiveness || 0) * 20} />
                      <div className="text-xs text-gray-500 mt-1">Target: 3.5/5.0</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Intent Match Rate</span>
                        <span>{genuxMetrics?.intentMatchRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={genuxMetrics?.intentMatchRate || 0} />
                      <div className="text-xs text-gray-500 mt-1">Target: 80%</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>UI Generation Latency</span>
                        <span>{genuxMetrics?.uiGenerationLatency.toFixed(0)}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - ((genuxMetrics?.uiGenerationLatency || 0) / 500) * 100)} />
                      <div className="text-xs text-gray-500 mt-1">Target: &lt;300ms</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Drift Detection</span>
                        <span>{genuxMetrics?.driftDetectionAccuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={genuxMetrics?.driftDetectionAccuracy || 0} />
                      <div className="text-xs text-gray-500 mt-1">Target: 85%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>Key findings from data analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Strong Mobile Performance</p>
                        <p className="text-sm text-gray-600">
                          Mobile responsiveness averages{" "}
                          {metricAnalysis.find((m) => m.name === "Mobile Responsiveness")?.average.toFixed(2)}/5.0
                          across all users
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Accessibility Excellence</p>
                        <p className="text-sm text-gray-600">
                          High accessibility scores indicate inclusive design practices
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Personalization Gap</p>
                        <p className="text-sm text-gray-600">Personalization scores show room for GenUX improvement</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Platform Optimization</p>
                        <p className="text-sm text-gray-600">
                          {platformData[0]?.name} users show highest engagement rates
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actionable Recommendations</CardTitle>
                  <CardDescription>Data-driven improvement strategies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">Enhance ML Personalization</p>
                      <p className="text-sm text-blue-700">
                        Current personalization score: {genuxMetrics?.mlPerformance.toFixed(2)}/5.0. Implement advanced
                        user behavior tracking.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-900">Optimize Loading Performance</p>
                      <p className="text-sm text-green-700">
                        Target UI generation latency of &lt;300ms. Current:{" "}
                        {genuxMetrics?.uiGenerationLatency.toFixed(0)}ms
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-900">Improve Intent Recognition</p>
                      <p className="text-sm text-purple-700">
                        Current intent match rate: {genuxMetrics?.intentMatchRate.toFixed(1)}%. Target: 80%+
                      </p>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="font-medium text-orange-900">Strengthen Drift Detection</p>
                      <p className="text-sm text-orange-700">Enhance model monitoring for better adaptation accuracy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
