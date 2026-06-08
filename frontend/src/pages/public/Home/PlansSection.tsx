import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Basic', 
    price: 150,
    features: ['4 Tawa Roti', '1 Sabzi (Choose from daily options)', 'Raita 3 times a week', '6 Days delivery', '100% Shudh Desi Ghee'],
    popular: false,
    badge: ''
  },
  {
    name: 'Standard',
    price: 190,
    features: ['8 Tawa Roti', '2 Sabzi (Choose from daily options)', 'Raita 3 times a week', '6 Days delivery', '100% Shudh Desi Ghee'],
    popular: false,
    badge: 'Recommended'
  },
  {
    name: 'Premium',
    price: 220,
    features: ['8 Tawa Roti', '2 Sabzi (Choose from daily options)', 'Daily Raita (5 different types)', 'Wednesday Dessert', 'Saturday: Special Food + Dessert', '6 Days delivery'],
    popular: true,
    badge: 'Most Popular'
  },
];

const PlansSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Pricing Plans</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary mb-6">Simple, Transparent Pricing</h3>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed px-2">
            Select a plan that fits your lifestyle. Pause or cancel anytime. No hidden fees, just great food delivered to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto items-center mt-6 md:mt-0">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-[2rem] p-6 sm:p-8 lg:p-10 transition-all duration-500 bg-white
                ${plan.popular 
                  ? 'border-0 shadow-2xl scale-[1.02] sm:scale-100 md:scale-105 z-10 ring-4 ring-primary/20 bg-gradient-to-b from-white to-orange-50' 
                  : 'border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-2'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className={`absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap
                  ${plan.popular ? 'bg-gradient-to-r from-primary to-primary-600 text-white' : 'bg-gray-900 text-white'}`}>
                  {plan.badge}
                </div>
              )}
              
              <div className="text-center mb-6 sm:mb-8 mt-4">
                <h4 className="text-lg sm:text-xl font-bold text-text-secondary mb-2 sm:mb-4">{plan.name}</h4>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-text-secondary">$</span>
                  <span className={`text-5xl sm:text-6xl font-extrabold tracking-tight ${plan.popular ? 'text-primary' : 'text-text-primary'}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm sm:text-base text-text-secondary font-medium mb-1 sm:mb-2">/mo</span>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6 sm:mb-8"></div>

              <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm sm:text-base text-text-secondary font-medium">
                    <div className={`mt-0.5 sm:mt-1 mr-3 sm:mr-4 shrink-0 rounded-full p-1 
                      ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-green-100 text-green-600'}`}>
                      <Check size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={3} />
                    </div>
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/subscription-checkout', { state: { plan } })}
                className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-md flex justify-center items-center gap-2
                  ${plan.popular 
                    ? 'bg-gradient-to-r from-primary to-primary-600 text-white hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1' 
                    : 'bg-white text-text-primary border-2 border-gray-200 hover:border-primary hover:text-primary'
                  }
                `}
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
