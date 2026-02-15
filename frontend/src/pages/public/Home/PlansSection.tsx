import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Basic', 
    price: 150,
    features: ['4 Tawa Roti', '1 Sabzi (Choose from daily options)', 'Raita 3 times a week (Mon, Wed, Fri)', '6 Days delivery', '100% Shudh Desi Ghee'],
    color: 'bg-blue-50',
    btnColor: 'bg-blue-600',
    popular: false,
  },
  {
    name: 'Standard',
    price: 190,
    features: ['8 Tawa Roti', '2 Sabzi (Choose from daily options)', 'Raita 3 times a week (Mon, Wed, Fri)', '6 Days delivery', '100% Shudh Desi Ghee'],
    color: 'bg-primary/5',
    btnColor: 'bg-primary',
    popular: true,
  },
  {
    name: 'Premium',
    price: 220,
    features: ['8 Tawa Roti', '2 Sabzi (Choose from daily options)', 'Daily Raita (5 different types)', 'Wednesday Dessert + Saturday Special', 'Saturday: Special Food + Dessert', '6 Days delivery', '100% Shudh Desi Ghee'],
    color: 'bg-yellow-50',
    btnColor: 'bg-yellow-600',
    popular: false,
  },
];

const PlansSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Select a plan that fits your lifestyle. Pause or cancel anytime. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-card p-8 border ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-gray-100 shadow-sm hover:shadow-md'} transition-all duration-300 bg-white`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-text-primary">${plan.price}</span>
                <span className="text-text-secondary ml-2">/ month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-text-secondary">
                    <Check size={18} className="text-green-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/subscription-checkout', { state: { plan } })}
                className={`w-full py-3 rounded-lg font-medium text-white transition shadow-md ${plan.btnColor} hover:opacity-90`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
