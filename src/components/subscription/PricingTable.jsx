import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, Building2 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { APP_NAME } from '../../utils/constants'

export const PricingTable = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true })

    if (!error && data) {
      setPlans(data)
    }
  }

  const handleSubscribe = async (planId, price) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (price === 0) {
      // Free plan - just update user role
      await supabase
        .from('users')
        .update({ role: 'free' })
        .eq('id', user.id)
      return
    }

    setLoading(true)

    try {
      // Initialize Paystack payment
      const handler = window.PaystackPop?.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: price * 100, // Convert to kobo
        currency: 'NGN',
        ref: `${Date.now()}-${user.id}`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          custom_fields: [
            {
              display_name: 'User Name',
              variable_name: 'user_name',
              value: user.name
            }
          ]
        },
        callback: async (response) => {
          // Save transaction
          await supabase.from('transactions').insert({
            user_id: user.id,
            amount: price,
            plan_id: planId,
            paystack_tx_ref: response.reference,
            status: 'success'
          })

          // Create subscription
          await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan_id: planId,
            status: 'active',
            paystack_subscription_code: response.reference
          })

          // Update user role
          const plan = plans.find(p => p.id === planId)
          await supabase
            .from('users')
            .update({ role: plan.tier })
            .eq('id', user.id)

          alert('Subscription successful!')
          window.location.reload()
        },
        onClose: () => {
          setLoading(false)
        }
      })

      handler?.openIframe()
    } catch (error) {
      console.error('Payment error:', error)
      setLoading(false)
    }
  }

  const tierIcons = {
    free: Crown,
    pro: Zap,
    enterprise: Building2
  }

  // Mock plans if database not set up yet
  const mockPlans = [
    {
      id: '1',
      name: 'Free',
      tier: 'free',
      price: 0,
      features: {
        max_chats_per_month: 20,
        rag_access: true,
        internet_search: false,
        ai_research_assistant: true,
        basic_support: true
      }
    },
    {
      id: '2', 
      name: 'Pro',
      tier: 'pro',
      price: 2999,
      features: {
        max_chats_per_month: 500,
        rag_access: true,
        internet_search: true,
        citation_generator: true,
        case_summarizer: true,
        export_pdf: true,
        priority_support: true
      }
    },
    {
      id: '3',
      name: 'Enterprise', 
      tier: 'enterprise',
      price: 9999,
      features: {
        max_chats_per_month: -1,
        all_pro_features: true,
        team_collaboration: true,
        drafting_assistant: true,
        firm_analytics: true,
        dedicated_support: true
      }
    }
  ]

  const displayPlans = plans.length > 0 ? plans : mockPlans

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Unlock the full power of AI legal research with {APP_NAME}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPlans.map((plan, idx) => {
            const Icon = tierIcons[plan.tier]
            const isCurrentPlan = user?.role === plan.tier
            const isPremium = plan.tier !== 'free'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${
                  isPremium ? 'border-2 border-blue-500' : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
                    Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      plan.tier === 'free' ? 'bg-gray-100 dark:bg-gray-700' :
                      plan.tier === 'pro' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.tier === 'free' ? 'text-gray-600 dark:text-gray-400' :
                        plan.tier === 'pro' ? 'text-blue-600 dark:text-blue-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {plan.tier} tier
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ₦{plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id, plan.price)}
                    disabled={loading || isCurrentPlan}
                    className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                      isCurrentPlan
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : isPremium
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : 'Get Started'}
                  </button>

                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">
                      Features:
                    </p>
                    {Object.entries(plan.features).map(([key, value]) => {
                      if (typeof value === 'boolean' && value) {
                        return (
                          <div key={key} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        )
                      }
                      if (typeof value === 'number' || typeof value === 'string') {
                        return (
                          <div key={key} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {value === -1 ? 'Unlimited' : value}
                            </span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}