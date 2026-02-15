import React, { useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { validateUPI, getUPIProvider, isTestUPI, TEST_UPI_IDS } from '../../utils/upiValidation';

interface UPIPaymentProps {
  amount: number;
  onSubmit: (upiId: string) => void;
  loading?: boolean;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({ amount, onSubmit, loading }) => {
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = validateUPI(upiId);
  const provider = isValid ? getUPIProvider(upiId) : '';
  const isTest = isTestUPI(upiId);

  const handleUpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUpiId(value);
    
    if (touched) {
      if (!value) {
        setError('UPI ID is required');
      } else if (!validateUPI(value)) {
        setError('Invalid UPI ID format');
      } else {
        setError('');
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (!upiId) {
      setError('UPI ID is required');
    } else if (!validateUPI(upiId)) {
      setError('Invalid UPI ID format');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!upiId) {
      setError('UPI ID is required');
      return;
    }

    if (!validateUPI(upiId)) {
      setError('Invalid UPI ID format');
      return;
    }

    onSubmit(upiId);
  };

  return (
    <div className="space-y-4">
      {/* Test Mode Indicator */}
      {isTest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">Test UPI ID Detected - No actual charge will be made</span>
        </div>
      )}

      {/* UPI ID Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UPI ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={upiId}
              onChange={handleUpiChange}
              onBlur={handleBlur}
              placeholder="yourname@paytm"
              className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                error && touched ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <Smartphone size={20} className="text-gray-400" />
              )}
            </div>
          </div>
          {error && touched &&  (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
          {isValid && provider && (
            <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
              <CheckCircle size={12} />
              {provider} account detected
            </p>
          )}
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount to Pay:</span>
            <span className="text-2xl font-bold text-gray-900">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QrCode size={120} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Scan with any UPI app
              <br />
              <span className="text-xs text-gray-500">(Test Mode - No actual payment)</span>
            </p>
          </div>
        </div>

        {/* Popular UPI Apps */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Popular UPI Apps:</p>
          <div className="flex gap-2 flex-wrap">
            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
              <span
                key={app}
                className="px-3 py-1 bg-gray-100 text-xs text-gray-700 rounded-full border border-gray-200"
              >
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* Test UPI IDs */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Test UPI IDs (Development)</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Success: {TEST_UPI_IDS.SUCCESS}</p>
            <p>• Google Pay: {TEST_UPI_IDS.GPAY}</p>
            <p>• Decline: {TEST_UPI_IDS.DECLINED}</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Pay with UPI
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UPIPayment;
