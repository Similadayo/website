"use client"

import { Download } from "lucide-react"
import { useState } from "react"

interface ExportLeadButtonProps {
  leads: any[]
}

export function ExportLeadButton({ leads }: ExportLeadButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    
    try {
      const headers = ["Company Name", "Website", "Domain", "Niche", "Stage", "Fit Score", "AI Summary", "Added Date"]
      const rows = leads.map(lead => [
        `"${lead.company.name.replace(/"/g, '""')}"`,
        lead.company.websiteUrl || "",
        lead.company.domain || "",
        `"${(lead.company.niche || "").replace(/"/g, '""')}"`,
        lead.stage,
        lead.analyses[0]?.fitScore || "0",
        `"${(lead.analyses[0]?.companySummary || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        new Date(lead.createdAt).toISOString()
      ])

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      
      link.setAttribute("href", url)
      link.setAttribute("download", `brancr_intelligence_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      console.error("Export failure:", err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || leads.length === 0}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
    >
      <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
      {isExporting ? "Compiling..." : "Export Intel (CSV)"}
    </button>
  )
}
