import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })

  if (error) {
    return { data, error }
  }

  if (data.user) {
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      name,
      email,
      role: 'free'
    })

    if (insertError) {
      console.error('Failed to create user profile:', insertError)
      return {
        data,
        error: {
          message: 'Account created but failed to set up profile. Please contact support.',
          details: insertError
        }
      }
    }
  }

  return { data, error }
}

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // First, get basic user data without nested subscriptions
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (userError || !userData) return null

  // Then, separately fetch active subscription with plan details
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Combine the data
  return {
    ...userData,
    subscriptions: subscriptionData ? [subscriptionData] : []
  }
}