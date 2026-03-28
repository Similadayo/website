import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { createCompany } from "../actions"

export default function NewCompanyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadein">
      <div className="flex items-center gap-3">
        <Link href="/admin/companies"
          className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" /> Add Company
          </h1>
          <p className="text-gray-500 text-sm mt-1">A lead will be created automatically.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={createCompany} className="space-y-6">

          {/* Company Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name" name="name" type="text" required
              placeholder="e.g. Acme Recruiting Agency"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-semibold text-gray-700 mb-2">
              Website URL
            </label>
            <input
              id="websiteUrl" name="websiteUrl" type="url"
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">Used for AI analysis and duplicate detection.</p>
          </div>

          {/* Niche + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="niche" className="block text-sm font-semibold text-gray-700 mb-2">Niche / Industry</label>
              <input
                id="niche" name="niche" type="text"
                placeholder="e.g. Recruiting, SaaS"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                id="location" name="location" type="text"
                placeholder="e.g. London, UK"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
            <input
              id="linkedinUrl" name="linkedinUrl" type="url"
              placeholder="https://linkedin.com/company/..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Research Notes */}
          <div>
            <label htmlFor="summary" className="block text-sm font-semibold text-gray-700 mb-2">Research Notes</label>
            <textarea
              id="summary" name="summary" rows={4}
              placeholder="What do you know about this company? Why are they a potential fit?"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Company & Create Lead
            </button>
            <Link
              href="/admin/companies"
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
