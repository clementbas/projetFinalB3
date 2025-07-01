"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, ChevronDown } from "lucide-react"

interface SalonHorairesDropdownProps {
  horaires: Array<{
    jour: string
    ouverture: string
    fermeture: string
    _id?: string
  }>
}

export function SalonHorairesDropdown({ horaires }: SalonHorairesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const formatHoraire = (ouverture: string, fermeture: string) => {
    if (ouverture === "Fermé" || fermeture === "Fermé") {
      return "Fermé"
    }
    return `${ouverture} - ${fermeture}`
  }

  const getJourColor = (ouverture: string) => {
    return ouverture === "Fermé" ? "text-red-600" : "text-green-600"
  }

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsOpen(!isOpen)}>
        <Clock className="h-3 w-3 mr-1" />
        Horaires
        <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-3">
            <h4 className="font-medium text-sm mb-3 text-center border-b pb-2">Horaires d'ouverture</h4>
            <div className="space-y-2">
              {horaires.map((horaire) => (
                <div key={horaire.jour} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize min-w-[70px]">
                    {capitalizeFirstLetter(horaire.jour)}
                  </span>
                  <span className={`text-sm font-mono ${getJourColor(horaire.ouverture)}`}>
                    {formatHoraire(horaire.ouverture, horaire.fermeture)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}