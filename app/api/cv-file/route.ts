import { getCvCollection } from "@/lib/cv-actions"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get language from query parameter
    const url = new URL(request.url)
    const language = url.searchParams.get("language") as "english" | "russian" | undefined

    const collection = await getCvCollection()

    if (language) {
      // Return CV file for specific language
      return NextResponse.json(collection[language] || null)
    } else {
      // Return the whole collection
      return NextResponse.json(collection)
    }
  } catch (error) {
    console.error("Error in CV file API:", error)
    return NextResponse.json({ error: "Failed to fetch CV file" }, { status: 500 })
  }
}
