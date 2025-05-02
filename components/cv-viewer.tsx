"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Eye, FileText } from "lucide-react"

interface CvViewerProps {
  url: string
  filename?: string
}

export function CvViewer({ url, filename = "CV" }: CvViewerProps) {
  const [viewMode, setViewMode] = useState<"direct" | "link">("direct")

  return (
    <div className="space-y-4">
      {/* PDF Viewer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-slate-500 mr-2" />
          <span className="font-medium">Your CV Document</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setViewMode(viewMode === "direct" ? "link" : "direct")}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline-block">
              {viewMode === "direct" ? "View as Link" : "View Embedded"}
            </span>
          </Button>

          <Button asChild variant="outline" size="sm" className="gap-1">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Open in New Tab</span>
            </a>
          </Button>

          <Button asChild variant="default" size="sm" className="gap-1">
            <a href={url} download={filename}>
              <Download className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Download</span>
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      {viewMode === "direct" ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          {/* Direct link to PDF viewer using Google Docs Viewer as a fallback */}
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full aspect-[3/4]"
            title="CV Document"
            frameBorder="0"
          ></iframe>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="mb-6 text-slate-600">
            Your CV is available as a PDF document. Click the button below to open or download it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open CV
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={url} download={filename} className="gap-2">
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
