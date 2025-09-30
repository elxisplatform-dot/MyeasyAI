import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

export const useSubscription = () => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadSubscription()
    }
  }, [user?.id])

  const loadSubscription = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!error && data) {
      setSubscription(data)
    }
    setLoading(false)
  }

  return { subscription, loading, refreshSubscription: loadSubscription }
}