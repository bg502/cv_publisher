"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadCv, deleteCv, setDefaultLanguage } from "@/lib/cv-actions"
import { FileText, Upload, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type CvFile = {
  url: string
  uploadedAt: number
  filename: string
  language: "english" | "russian"
}

type CvCollection = {
  english?: CvFile
  russian?: CvFile
  defaultLanguage: "english" | "russian"
}

export default function AdminPage() {
  const router = useRouter()
  const [collection, setCollection] = useState<CvCollection>({ defaultLanguage: "english" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"english" | "russian">("english")

  // Fetch CV collection on component mount
  useEffect(() => {
    async function fetchCvCollection() {
      try {
        const response = await fetch("/api/cv-file")
        if (response.ok) {
          const data = await response.json()
          setCollection(data)

          // Set active tab to default language if it exists
          if (data.defaultLanguage && data[data.defaultLanguage]) {
            setActiveTab(data.defaultLanguage)
          }
        }
      } catch (err) {
        console.error("Error fetching CV collection:", err)
      }
    }

    fetchCvCollection()
  }, [])

  async function handleUpload(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Add the language to the form data
    formData.append("language", activeTab)

    try {
      const result = await uploadCv(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(`CV uploaded successfully for ${activeTab} language!`)
        router.refresh()

        // Fetch updated CV collection
        try {
          const response = await fetch("/api/cv-file")
          if (response.ok) {
            const data = await response.json()
            setCollection(data)
          }
        } catch (err) {
          console.error("Error fetching updated CV collection:", err)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(language: "english" | "russian") {
    if (!confirm(`Are you sure you want to delete the ${language} CV?`)) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteCv(language)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(`CV deleted successfully for ${language} language!`)
        router.refresh()

        // Fetch updated CV collection
        try {
          const response = await fetch("/api/cv-file")
          if (response.ok) {
            const data = await response.json()
            setCollection(data)
          }
        } catch (err) {
          console.error("Error fetching updated CV collection:", err)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetDefaultLanguage(language: "english" | "russian") {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await setDefaultLanguage(language)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(`Default language set to ${language}!`)
        router.refresh()

        // Fetch updated CV collection
        try {
          const response = await fetch("/api/cv-file")
          if (response.ok) {
            const data = await response.json()
            setCollection(data)
          }
        } catch (err) {
          console.error("Error fetching updated CV collection:", err)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container px-4 py-16 mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to CV Page
          </Link>
          <LogoutButton />
        </div>

        <Card className="shadow-lg border-slate-200 mb-8">
          <CardHeader>
            <CardTitle>Default Language</CardTitle>
            <CardDescription>Select which language version of your CV should be shown by default</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RadioGroup
                defaultValue={collection.defaultLanguage}
                className="flex gap-4"
                onValueChange={(value) => handleSetDefaultLanguage(value as "english" | "russian")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="english" id="english-default" disabled={!collection.english || isLoading} />
                  <Label htmlFor="english-default">English</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="russian" id="russian-default" disabled={!collection.russian || isLoading} />
                  <Label htmlFor="russian-default">Russian</Label>
                </div>
              </RadioGroup>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                  {success}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>CV Admin Area</CardTitle>
            <CardDescription>Upload or replace your CV PDF files in different languages</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "english" | "russian")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="english" className="relative">
                  English
                  {collection.english && collection.defaultLanguage === "english" && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px]">Default</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="russian" className="relative">
                  Русский
                  {collection.russian && collection.defaultLanguage === "russian" && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px]">Default</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {["english", "russian"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-6">
                  <form action={handleUpload} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor={`cv-file-${lang}`}>
                        Upload CV (PDF) - {lang === "english" ? "English" : "Русский"}
                      </Label>
                      <Input id={`cv-file-${lang}`} name="file" type="file" accept="application/pdf" required />
                    </div>

                    {collection[lang as "english" | "russian"] && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-slate-500 mr-3" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              Current {lang === "english" ? "English" : "Russian"} CV File
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              Uploaded on{" "}
                              {new Date(collection[lang as "english" | "russian"]!.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={collection[lang as "english" | "russian"]!.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(lang as "english" | "russian")}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      <Upload className="h-4 w-4" />
                      {isLoading
                        ? "Uploading..."
                        : collection[lang as "english" | "russian"]
                          ? "Replace CV File"
                          : "Upload CV File"}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
