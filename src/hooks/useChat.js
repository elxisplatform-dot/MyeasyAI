import { useState } from 'react'
import { supabase } from '../services/supabase'

export const useChat = (sessionId, userId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (message, includeInternet = false) => {
    if (!userId || !sessionId) {
      throw new Error('User ID and Session ID are required')
    }

    setLoading(true)
    
    try {
      // Add user message to UI
      const userMessage = { role: 'user', message, created_at: new Date().toISOString() }
      setMessages(prev => [...prev, userMessage])

      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message, sessionId, userId, includeInternet }
      })

      if (error) throw error

      // Add assistant message to UI
      const assistantMessage = {
        role: 'assistant',
        message: data.answer,
        sources: data.sources,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])

      return data
    } catch (error) {
      console.error('Chat error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loadChatHistory = async () => {
    // Only load chat history if both userId and sessionId are available
    if (!userId || !sessionId) {
      console.log('Cannot load chat history: missing userId or sessionId')
      return
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading chat history:', error)
    } else if (data) {
      setMessages(data)
    }
  }

  return { messages, sendMessage, loading, loadChatHistory }
}