import React from 'react';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

export type PaymentMethodType = 'card' | 'upi' | 'wallet';

interface PaymentMethodSelectorProps {
  selected: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selected, onChange }) => {
  const methods = [
    {
      id: 'card' as PaymentMethodType,
      name: 'Debit/Credit Card',
      description: 'Visa, Mastercard, Amex',
      icon: CreditCard,
    },
    {
      id: 'upi' as PaymentMethodType,
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone,
    },
    {
      id: 'wallet' as PaymentMethodType,
      name: 'Digital Wallets',
      description: 'Apple Pay, Google Pay',
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {method.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
