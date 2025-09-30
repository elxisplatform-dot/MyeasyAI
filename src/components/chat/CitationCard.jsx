import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ExternalLink } from 'lucide-react'

export const CitationCard = ({ source }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
    >
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {source.title}
        </h4>
        {source.metadata?.citation && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {source.metadata.citation}
          </p>
        )}
      </div>

      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </motion.div>
  )
}