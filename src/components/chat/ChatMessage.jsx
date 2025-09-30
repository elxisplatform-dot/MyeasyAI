import React from 'react'
import { motion } from 'framer-motion'
import { User, Bot, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { CitationCard } from './CitationCard'

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`flex-1 max-w-2xl ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`rounded-2xl px-5 py-4 ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert max-w-none"
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-500 hover:underline inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.children}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ),
            }}
          >
            {message.message}
          </ReactMarkdown>
        </div>

        {/* Citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              Sources:
            </p>
            {message.sources.map((source, idx) => (
              <CitationCard key={idx} source={source} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </motion.div>
  )
}