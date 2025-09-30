import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) {
      console.error('Auth signup error:', error)
      return { data: null, error }
    }

    if (!data.user) {
      console.error('No user returned from signup')
      return {
        data: null,
        error: new Error('Registration failed. Please try again.')
      }
    }

    console.log('Auth user created successfully:', data.user.id)

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        name,
        email,
        role: 'free'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create user profile:', insertError)

      await supabase.auth.admin.deleteUser(data.user.id).catch(err => {
        console.error('Failed to cleanup auth user:', err)
      })

      return {
        data: null,
        error: new Error(`Registration failed: ${insertError.message || 'Could not create user profile'}`)
      }
    }

    console.log('User profile created successfully:', insertData)
    return { data: { user: data.user, profile: insertData }, error: null }

  } catch (err) {
    console.error('Unexpected error during signup:', err)
    return {
      data: null,
      error: new Error('An unexpected error occurred. Please try again.')
    }
  }
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

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (userError) {
    console.error('Error fetching user data:', userError)
    return null
  }

  if (!userData) {
    console.log('User profile not found for auth user, attempting to create...')

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        role: 'free'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create missing user profile:', insertError)
      return null
    }

    console.log('Successfully created missing user profile')
    return {
      ...insertData,
      subscriptions: []
    }
  }

  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  return {
    ...userData,
    subscriptions: subscriptionData ? [subscriptionData] : []
  }
}