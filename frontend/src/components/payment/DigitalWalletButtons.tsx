import React from 'react';
import { Smartphone, Zap } from 'lucide-react';

interface DigitalWalletButtonsProps {
  amount: number;
  onApplePay: () => void;
  onGooglePay: () => void;
  loading?: boolean;
}

const DigitalWalletButtons: React.FC<DigitalWalletButtonsProps> = ({
  amount,
  onApplePay,
  onGooglePay,
  loading,
}) => {
  // Detect if Apple Pay is available (Safari on macOS/iOS)
  const isApplePayAvailable = /Safari/.test(navigator.userAgent) || /iPhone|iPad/.test(navigator.userAgent);
  
  // Google Pay is generally available on Chrome and most modern browsers
  const isGooglePayAvailable = true;

  return (
    <div className="space-y-4">
      {/* Amount Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Amount to Pay:</span>
          <span className="text-2xl font-bold text-gray-900">₹{amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Test Mode Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
        <p className="text-sm text-yellow-800">
          <Zap className="inline mr-1" size={16} />
          <strong>Test Mode:</strong> Digital wallet buttons are for UI demonstration. No actual charges will be processed.
        </p>
      </div>

      <div className="space-y-3">
        {/* Apple Pay Button */}
        {isApplePayAvailable && (
          <button
            onClick={onApplePay}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-lg">Pay with Apple Pay</span>
          </button>
        )}

        {/* Google Pay Button */}
        {isGooglePayAvailable && (
          <button
            onClick={onGooglePay}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <g fill="none">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0z" fill="#5F6368"/>
                <path d="M13.5 9.5h-3v5h3c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5z" fill="#EA4335"/>
                <path d="M10.5 9.5h-3v5h3v-5z" fill="#34A853"/>
                <path d="M13.5 11.75h-3v-2.25h3v2.25z" fill="#4285F4"/>
                <path d="M10.5 11.75h-3v2.75h3v-2.75z" fill="#FBBC04"/>
              </g>
            </svg>
            <span className="text-lg font-medium">Pay with Google Pay</span>
          </button>
        )}

        {/* Alternative Android Pay styling */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Fast & Secure Payment</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
            <Smartphone size={16} />
            Digital Wallets
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• One-tap payment authorization</li>
            <li>• Secure biometric authentication</li>
            <li>• No card details needed</li>
            <li>• Currently in test mode</li>
          </ul>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-600 py-4">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Processing payment...</span>
        </div>
      )}
    </div>
  );
};

export default DigitalWalletButtons;
