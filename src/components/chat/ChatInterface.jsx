import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Globe } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useChat } from '../../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatSidebar } from './ChatSidebar'
import { supabase } from '../../services/supabase'
import { hasFeatureAccess, FEATURES } from '../../utils/featureAccess'
import { APP_NAME, APP_DESCRIPTION } from '../../utils/constants'

export const ChatInterface = () => {
  const { user, loading: authLoading } = useAuth()
  const [sessionId, setSessionId] = useState(null)
  const [input, setInput] = useState('')
  const [includeInternet, setIncludeInternet] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  // Pass user.id directly, which will be undefined initially and cause the hook to wait
  const { messages, sendMessage, loading, loadChatHistory } = useChat(sessionId, user?.id)

  const canUseInternet = hasFeatureAccess(user?.role, FEATURES.INTERNET_SEARCH)
  const isChatReady = !authLoading && user && sessionId && !sessionLoading

  useEffect(() => {
    if (user && !sessionId && !sessionLoading) {
      createNewSession()
    }
  }, [user, sessionId, sessionLoading])

  useEffect(() => {
    if (sessionId && user?.id) {
      loadChatHistory()
    }
  }, [sessionId, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewSession = async () => {
    if (!user || sessionLoading) return;

    setSessionLoading(true)
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single()

    if (error) {
      console.error('Error creating new session:', error)
    } else if (data) {
      setSessionId(data.id)
    }
    setSessionLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading || !isChatReady) return

    try {
      await sendMessage(input, includeInternet && canUseInternet)
      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ChatSidebar sessionId={sessionId} setSessionId={setSessionId} createNewSession={createNewSession} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {APP_NAME} Chat
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {APP_DESCRIPTION}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {!isChatReady ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {authLoading ? 'Authenticating...' : sessionLoading ? 'Creating chat session...' : 'Loading...'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we set up your chat interface
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome to {APP_NAME}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Ask me anything about law, cases, or legal research
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {[
                        'What is contract law?',
                        'Explain intellectual property rights',
                        'Recent court cases on employment law',
                        'How to file a patent application'
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(example)}
                          disabled={!isChatReady}
                          className="p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300">{example}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  messages.map((message, idx) => (
                    <ChatMessage key={idx} message={message} />
                  ))
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {canUseInternet && (
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="internet"
                  checked={includeInternet}
                  onChange={(e) => setIncludeInternet(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="internet" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Globe className="w-4 h-4" />
                  Include internet search (Pro)
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about law, cases, or legal topics..."
                disabled={!isChatReady}
                disabled={loading || !isChatReady}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || !isChatReady}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
