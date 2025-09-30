import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MessageSquare, Search, Settings, LogOut, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase, signOut } from '../../services/supabase'

export const ChatSidebar = ({ sessionId, setSessionId, createNewSession }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setSessions(data)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const getTierBadge = (role) => {
    const badges = {
      free: { color: 'bg-gray-500', label: 'Free' },
      pro: { color: 'bg-blue-500', label: 'Pro' },
      enterprise: { color: 'bg-purple-500', label: 'Enterprise' },
      admin: { color: 'bg-red-500', label: 'Admin' }
    }
    return badges[role] || badges.free
  }

  const badge = getTierBadge(user?.role)

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${badge.color}`}>
                <Crown className="w-3 h-3" />
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={createNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredSessions.map((session) => (
          <motion.button
            key={session.id}
            whileHover={{ x: 4 }}
            onClick={() => setSessionId(session.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              sessionId === session.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-5 h-5 ${
                sessionId === session.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
              }`} />
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.title}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {user?.role === 'free' && (
          <button
            onClick={() => navigate('/pricing')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Pro
          </button>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}