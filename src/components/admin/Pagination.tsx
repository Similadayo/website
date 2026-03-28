"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"

interface PaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
}

export function Pagination({ totalItems, pageSize, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const totalPages = Math.ceil(totalItems / pageSize)
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set("page", page.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between px-4 py-6 border-t border-gray-100 bg-white rounded-b-xl shadow-sm mt-1">
      <div className="flex-1 flex justify-between sm:hidden">
        <Link
          href={createPageUrl(currentPage - 1)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Previous
        </Link>
        <Link
          href={createPageUrl(currentPage + 1)}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Link
              href={createPageUrl(currentPage - 1)}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              const isActive = pageNum === currentPage
              
              // Only show first 3, last 3, and current +- 1
              if (totalPages > 10 && pageNum > 3 && pageNum < totalPages - 2 && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                 if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                   return <span key={i} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                 }
                 return null
              }

              return (
                <Link
                  key={i}
                  href={createPageUrl(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold transition-all ${
                    isActive 
                      ? "z-10 bg-black border-black text-white" 
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}

            <Link
              href={createPageUrl(currentPage + 1)}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
