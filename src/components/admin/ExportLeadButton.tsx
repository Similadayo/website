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
    } catch (err) {
      console.error("Export failure:", err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || leads.length === 0}
      className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-40 shadow-sm"
    >
      <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
      {isExporting ? "Compiling..." : "Export Intel (CSV)"}
    </button>
  )
}
