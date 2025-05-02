"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LanguageSwitchProps {
  currentLanguage: "english" | "russian"
  availableLanguages: ("english" | "russian")[]
  onChange: (language: "english" | "russian") => void
}

export function LanguageSwitch({ currentLanguage, availableLanguages, onChange }: LanguageSwitchProps) {
  const [language, setLanguage] = useState<"english" | "russian">(currentLanguage)

  const handleLanguageChange = (newLanguage: "english" | "russian") => {
    setLanguage(newLanguage)
    onChange(newLanguage)
  }

  const languageNames = {
    english: "English",
    russian: "Русский",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {languageNames[language]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem key={lang} onClick={() => handleLanguageChange(lang)} className="gap-2">
            {languageNames[lang]}
            {lang === language && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
