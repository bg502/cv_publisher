"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

type CvFile = {
  url: string
  uploadedAt: number
  filename: string
  language: "english" | "russian"
}

export default function ViewCvPage() {
  const params = useParams()
  const router = useRouter()
  const [cvFile, setCvFile] = useState<CvFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Decode the filename
  const filename = decodeURIComponent(params.filename as string)

  useEffect(() => {
    async function fetchCvCollection() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/cv-file")
        if (response.ok) {
          const data = await response.json()

          // Find the CV file with the matching filename
          let foundFile: CvFile | null = null
          if (data.english?.filename === filename) {
            foundFile = data.english
          } else if (data.russian?.filename === filename) {
            foundFile = data.russian
          }

          if (foundFile) {
            setCvFile(foundFile)
          } else {
            setError("CV file not found")
            setTimeout(() => {
              router.push("/")
            }, 3000)
          }
        } else {
          setError("Failed to fetch CV file")
        }
      } catch (err) {
        console.error("Error fetching CV file:", err)
        setError("An error occurred while fetching the CV file")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCvCollection()
  }, [filename, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <p className="mb-4">Redirecting to home page...</p>
          <Button asChild>
            <Link href="/">Go to Home Page</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!cvFile) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container px-4 mx-auto max-w-7xl flex justify-between items-center">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <Button asChild variant="outline" size="sm" className="gap-1">
            <a href={cvFile.url} download={cvFile.filename}>
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 bg-slate-100 p-4">
        <div className="container mx-auto max-w-7xl h-full">
          <iframe
            src={cvFile.url}
            className="w-full h-full min-h-[80vh] rounded-lg border border-slate-200 bg-white"
            title="CV Document"
          ></iframe>
        </div>
      </div>
    </div>
  )
}
