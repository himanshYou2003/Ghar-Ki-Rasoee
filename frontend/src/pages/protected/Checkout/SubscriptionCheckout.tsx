import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import { Check, ShieldCheck, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { ENV } from '../../../config/env.config';
import LocationPicker from '../../../components/common/LocationPicker';
import PaymentMethodSelector, { PaymentMethodType } from '../../../components/payment/PaymentMethodSelector';
import CardPaymentForm, { CardData } from '../../../components/payment/CardPaymentForm';
import UPIPayment from '../../../components/payment/UPIPayment';
import DigitalWalletButtons from '../../../components/payment/DigitalWalletButtons';

const SubscriptionCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  if (!plan) {
    return (
      <PageContainer className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No plan selected</h2>
        <button onClick={() => navigate('/pricing')} className="text-primary hover:underline">
          View Plans
        </button>
      </PageContainer>
    );
  }

  const handlePaymentSubmit = async (paymentData: any) => {
    setLoading(true);
    setError('');
    
    try {
      if (!user) throw new Error("Please log in to subscribe");
      if (!address) throw new Error("Please select a delivery address");

      const token = await user.getIdToken();

      // Process payment through backend
      const paymentResponse = await axios.post(
        `${ENV.API_URL}/payments/process`,
        {
          paymentMethod,
          amount: plan.price,
          paymentData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (paymentResponse.data.data.status === 'success') {
        setPaymentResult(paymentResponse.data.data);

        // Create subscription after successful payment
        await axios.post(
          `${ENV.API_URL}/subscriptions`,
          {
            plan: plan.name,
            planDetails: plan,
            durationMonths: 1,
            deliveryAddress: address,
            paymentMethod: paymentMethod,
            paymentStatus: 'Paid',
            transactionId: paymentResponse.data.data.transactionId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccess(true);

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/my-subscription');
        }, 3000);
      } else {
        throw new Error(paymentResponse.data.data.message || 'Payment failed');
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      setError(err.response?.data?.data?.message || err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = (cardData: CardData) => {
    handlePaymentSubmit(cardData);
  };

  const handleUPISubmit = (upiId: string) => {
    handlePaymentSubmit({ upiId });
  };

  const handleWalletPayment = (walletType: string) => {
    handlePaymentSubmit({ walletType });
  };

  // Success screen
  if (success) {
    return (
      <PageContainer className="py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Confirmed!</h1>
          <p className="text-gray-600 mb-2">Your {plan.name} subscription is now active.</p>
          {paymentResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">Transaction Details:</p>
              <p>Transaction ID: {paymentResult.transactionId}</p>
              <p className="text-yellow-600 mt-2">⚠️ Test Mode - No actual charge made</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-6">Redirecting to subscription page...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Subscription</h1>
        
        {/* Test Mode Banner */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8 flex items-center gap-3">
          <AlertTriangle size={24} className="text-yellow-600 shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900">Test Mode Active</p>
            <p className="text-sm text-yellow-800">No actual charges will be processed. Use test credentials for payment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-card border-2 border-primary/10 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">{plan.name} Plan</span>
                  <span className="font-bold text-xl text-primary">₹{plan.price}/mo</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mt-4">
                  {plan.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span>₹{plan.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-card border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-primary" /> Delivery Address
              </h2>
              
              {!address ? (
                <button 
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition flex flex-col items-center gap-2"
                >
                  <MapPin size={32} />
                  <span className="font-medium">Tap to Select Delivery Location</span>
                </button>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Delivering To</p>
                      <p className="text-gray-800 font-medium">{address}</p>
                    </div>
                    <button 
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="text-primary text-sm font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white p-6 rounded-card border border-gray-100 shadow-sm">
              <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md flex items-center gap-2">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              <div className="mt-6">
                {paymentMethod === 'card' && (
                  <CardPaymentForm onSubmit={handleCardSubmit} loading={loading} />
                )}

                {paymentMethod === 'upi' && (
                  <UPIPayment amount={plan.price} onSubmit={handleUPISubmit} loading={loading} />
                )}

                {paymentMethod === 'wallet' && (
                  <DigitalWalletButtons
                    amount={plan.price}
                    onApplePay={() => handleWalletPayment('Apple Pay')}
                    onGooglePay={() => handleWalletPayment('Google Pay')}
                    loading={loading}
                  />
                )}
              </div>

              {!loading && (
                <div className="mt-6 bg-blue-50 p-4 rounded-md text-sm text-blue-800 flex gap-3">
                  <ShieldCheck className="shrink-0" size={20} />
                  <p>Your payment is secured with industry-standard encryption. This is a test environment - no real charges will be processed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <LocationPicker 
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelect={(loc) => setAddress(loc.address)}
      />
    </PageContainer>
  );
};

export default SubscriptionCheckout;
