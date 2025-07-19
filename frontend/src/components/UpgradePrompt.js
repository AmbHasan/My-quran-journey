import React, { useState } from 'react';

const UpgradePrompt = ({ isVisible, onClose, user }) => {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');

  if (!isVisible) return null;

  const plans = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: '$4.99',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'All 114 Quran chapters',
        '5 different reciters',
        'No advertisements',
        'Offline reading',
        'Advanced progress tracking',
        'Premium support'
      ],
      highlight: false
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: '$49.99',
      period: '/year',
      originalPrice: '$59.88',
      savings: 'Save 17%',
      description: 'Most popular choice',
      features: [
        'All monthly features',
        '2 months free',
        'Priority support',
        'Early access to new features',
        'Exclusive content',
        'Family sharing'
      ],
      highlight: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: '$19.99',
      period: 'one-time',
      description: 'Best value forever',
      features: [
        'All premium features',
        'Lifetime access',
        'Future updates included',
        'No recurring payments',
        'Ultimate value',
        'Peace of mind'
      ],
      highlight: false,
      badge: 'BEST VALUE'
    }
  ];

  const handleUpgrade = async (planId) => {
    try {
      // In a real implementation, this would integrate with Stripe
      console.log('Upgrading to plan:', planId);
      
      // Redirect to payment page or show payment modal
      // For now, we'll just show an alert
      alert(`Redirecting to payment for ${plans.find(p => p.id === planId)?.name}...`);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error initiating upgrade:', error);
      alert('Error starting upgrade process. Please try again.');
    }
  };

  const benefits = [
    {
      icon: '📖',
      title: 'Complete Quran Access',
      description: 'Read all 114 chapters without restrictions'
    },
    {
      icon: '🎵',
      title: 'Multiple Reciters',
      description: 'Choose from 5 beautiful recitation voices'
    },
    {
      icon: '🚫',
      title: 'Ad-Free Experience',
      description: 'Focus on learning without distractions'
    },
    {
      icon: '📱',
      title: 'Offline Reading',
      description: 'Download chapters for offline study'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed insights'
    },
    {
      icon: '🏆',
      title: 'Exclusive Features',
      description: 'Access premium-only learning tools'
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <h2 className="text-3xl font-bold mb-2">Unlock Your Full Journey</h2>
            <p className="text-blue-100">Join thousands of learners worldwide</p>
          </div>

          {/* Benefits Section */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              What You'll Get with Premium
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-2xl">{benefit.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Plans */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Choose Your Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${plan.highlight ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{plan.name}</h4>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 text-sm">{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm">
                        <span className="line-through text-gray-500">{plan.originalPrice}</span>
                        <span className="ml-2 text-green-600 font-medium">{plan.savings}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* User Stats */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Your Progress So Far</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{user.level}</div>
                    <div className="text-xs text-gray-600">Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{user.experience_points}</div>
                    <div className="text-xs text-gray-600">XP Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{user.streak_days}</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleUpgrade(selectedPlan)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-300"
              >
                Upgrade to {plans.find(p => p.id === selectedPlan)?.name} →
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition duration-300"
              >
                Maybe Later
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Payment
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  30-Day Guarantee
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cancel Anytime
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Join <span className="font-medium">10,000+</span> learners who've upgraded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
