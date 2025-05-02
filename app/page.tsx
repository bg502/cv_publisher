"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import Link from "next/link"
import { CvViewer } from "@/components/cv-viewer"
import { Button } from "@/components/ui/button"
import { LanguageSwitch } from "@/components/language-switch"

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

export default function Home() {
  const [collection, setCollection] = useState<CvCollection | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "russian">("english")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCvCollection() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/cv-file")
        if (response.ok) {
          const data = await response.json()
          setCollection(data)
          setSelectedLanguage(data.defaultLanguage || "english")
        }
      } catch (err) {
        console.error("Error fetching CV collection:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCvCollection()
  }, [])

  // Get available languages
  const availableLanguages = collection ? (["english", "russian"] as const).filter((lang) => collection[lang]) : []

  // Get current CV file
  const currentCvFile = collection && collection[selectedLanguage]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container px-4 py-16 mx-auto max-w-4xl">
        <header className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">My Professional CV</h1>

            {availableLanguages.length > 1 && (
              <LanguageSwitch
                currentLanguage={selectedLanguage}
                availableLanguages={availableLanguages}
                onChange={setSelectedLanguage}
              />
            )}
          </div>
          <p className="text-xl text-slate-600 max-w-2xl">
            Welcome to my online curriculum vitae. Below you can view or download my professional resume.
          </p>
        </header>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
              </div>
            ) : currentCvFile ? (
              <>
                <CvViewer url={currentCvFile.url} filename={currentCvFile.filename} />
                <div className="mt-6 text-center">
                  <Button asChild variant="outline">
                    <Link href={`/view-cv/${encodeURIComponent(currentCvFile.filename)}`}>
                      Open in Full Page Viewer
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">No CV Available</h3>
                <p className="text-slate-500 mb-6">There is currently no CV uploaded to display.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} - My Professional Portfolio</p>
          <div className="mt-2">
            <Link href="/admin" className="text-slate-600 hover:text-slate-900 underline underline-offset-4">
              Admin Access
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
