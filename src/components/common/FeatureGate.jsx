import React from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { hasFeatureAccess, getUpgradeMessage } from '../../utils/featureAccess'

export const FeatureGate = ({ feature, userRole, children }) => {
  const navigate = useNavigate()
  const hasAccess = hasFeatureAccess(userRole, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>

      {/* Upgrade overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Premium Feature
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getUpgradeMessage(feature)}
          </p>

          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Upgrade Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}