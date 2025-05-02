"use server"

import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { getSession } from "./auth"
import { kv } from "@vercel/kv"

// Type for CV file metadata
type CvFile = {
  url: string
  uploadedAt: number
  filename: string
  language: "english" | "russian"
}

// Type for CV collection
type CvCollection = {
  english?: CvFile
  russian?: CvFile
  defaultLanguage: "english" | "russian"
}

// Get CV collection
export async function getCvCollection(): Promise<CvCollection> {
  try {
    const collection = await kv.get<CvCollection>("cv-collection")
    return collection || { defaultLanguage: "english" }
  } catch (error) {
    console.error("Error fetching CV collection:", error)
    return { defaultLanguage: "english" }
  }
}

// Get CV file for a specific language
export async function getCvFile(language?: "english" | "russian"): Promise<CvFile | null> {
  try {
    const collection = await getCvCollection()

    // If language is not specified, use the default language
    const selectedLanguage = language || collection.defaultLanguage

    return collection[selectedLanguage] || null
  } catch (error) {
    console.error("Error fetching CV file:", error)
    return null
  }
}

// Set default language
export async function setDefaultLanguage(language: "english" | "russian") {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return { error: "Authentication required" }
    }

    const collection = await getCvCollection()

    // Update the default language
    collection.defaultLanguage = language

    await kv.set("cv-collection", collection)

    // Revalidate paths to update the UI
    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Error setting default language:", error)
    return { error: "Failed to set default language" }
  }
}

// Upload CV file
export async function uploadCv(formData: FormData) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return { error: "Authentication required" }
    }

    const file = formData.get("file") as File
    const language = formData.get("language") as "english" | "russian"

    if (!file) {
      return { error: "No file provided" }
    }

    if (!language || (language !== "english" && language !== "russian")) {
      return { error: "Invalid language selected" }
    }

    if (file.type !== "application/pdf") {
      return { error: "Only PDF files are allowed" }
    }

    // Generate a unique filename with language prefix
    const filename = `cv-${language}-${Date.now()}.pdf`

    console.log("Starting file upload to Blob storage:", {
      filename,
      fileType: file.type,
      fileSize: file.size,
      language,
    })

    // Get existing CV collection
    const collection = await getCvCollection()

    // Get existing CV file for this language to delete it later
    const existingCvFile = collection[language]

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    console.log("File uploaded successfully:", blob.url)

    // Create new CV file metadata
    const cvFile: CvFile = {
      url: blob.url,
      uploadedAt: Date.now(),
      filename: filename,
      language: language,
    }

    // Update the collection
    collection[language] = cvFile

    // If this is the first CV being uploaded, set it as the default language
    if (!collection.defaultLanguage || Object.keys(collection).length === 1) {
      collection.defaultLanguage = language
    }

    // Store updated collection in KV store
    await kv.set("cv-collection", collection)
    console.log("CV collection updated in KV")

    // Delete the old file if it exists
    if (existingCvFile?.url) {
      try {
        // Extract pathname from URL
        const url = new URL(existingCvFile.url)
        const pathname = url.pathname.substring(1) // Remove leading slash

        console.log("Attempting to delete old CV file:", pathname)
        await del(pathname)
        console.log("Old CV file deleted successfully")
      } catch (deleteError) {
        console.error("Error deleting old CV file:", deleteError)
        // Continue even if deletion fails
      }
    }

    // Revalidate paths to update the UI
    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true, url: blob.url, language }
  } catch (error) {
    console.error("Error in uploadCv:", error)
    return { error: "Failed to upload CV. Please try again." }
  }
}

// Delete CV file for a specific language
export async function deleteCv(language: "english" | "russian") {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return { error: "Authentication required" }
    }

    const collection = await getCvCollection()
    const existingCvFile = collection[language]

    if (!existingCvFile) {
      return { error: `No CV file found for ${language}` }
    }

    // Delete the file from Blob storage
    try {
      // Extract pathname from URL
      const url = new URL(existingCvFile.url)
      const pathname = url.pathname.substring(1) // Remove leading slash

      console.log("Attempting to delete CV file:", pathname)
      await del(pathname)
      console.log("CV file deleted successfully")
    } catch (deleteError) {
      console.error("Error deleting CV file:", deleteError)
      // Continue even if deletion fails
    }

    // Remove the file from the collection
    delete collection[language]

    // If the deleted language was the default, change the default to the other language if available
    if (collection.defaultLanguage === language) {
      const otherLanguage = language === "english" ? "russian" : "english"
      if (collection[otherLanguage]) {
        collection.defaultLanguage = otherLanguage
      }
    }

    // Store updated collection in KV store
    await kv.set("cv-collection", collection)

    // Revalidate paths to update the UI
    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteCv:", error)
    return { error: "Failed to delete CV. Please try again." }
  }
}
