import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENV } from '../../../config/env.config';
import PageContainer from '../../../components/layout/PageContainer';
import { Calendar, Edit, Crown, ShoppingBag, Utensils } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MySubscription: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOtherReason, setCancelOtherReason] = useState('');

  // Fetch Subscription Data
  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const res = await axios.get(`${ENV.API_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    },
    enabled: !!user,
  });

  // Fetch Customizations (only if subscription exists)
  const { data: customizations, isLoading: isCustomLoading } = useQuery({
    queryKey: ['myCustomization', subscription?.subscriptionId],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const res = await axios.get(
        `${ENV.API_URL}/menu/customizations/${subscription.subscriptionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.data?.customization;
    },
    enabled: !!user && !!subscription?.subscriptionId,
  });

  // Mutation for Skipping Date
  const skipDateMutation = useMutation({
    mutationFn: async () => {
      const token = await user?.getIdToken();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      await axios.post(
        `${ENV.API_URL}/subscriptions/skip`,
        { date: dateStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return tomorrow;
    },
    onSuccess: (tomorrow) => {
      setIsSkipModalOpen(false);
      alert(`Successfully skipped delivery for ${tomorrow.toLocaleDateString()}. Your subscription has been extended by 1 day.`);
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
    },
    onError: () => {
      alert("Failed to skip delivery. Please try again.");
    }
  });

  // Mutation for Cancelling Subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const token = await user?.getIdToken();
      const reason = cancelReason === 'Other' ? cancelOtherReason : cancelReason;
      await axios.post(`${ENV.API_URL}/subscriptions/cancel`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      setIsCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
    },
    onError: () => {
      alert("Failed to cancel subscription");
    }
  });

  const isLoading = isSubLoading || (!!subscription?.subscriptionId && isCustomLoading);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <PageContainer className="py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your subscription...</p>
        </div>
      </PageContainer>
    );
  }

  if (!subscription) {
    // If we're done loading and still no subscription, show empty state
    if (!isSubLoading) {
      return (
        <PageContainer className="py-20">
          <div className="text-center bg-gray-50 rounded-xl p-12">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-text-primary mb-3">No Active Subscription</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Subscribe to a monthly plan for regular home-cooked meals and enjoy consistent savings.
            </p>
            <button 
              onClick={() => navigate('/pricing')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover transition font-medium"
            >
              View Plans
            </button>
          </div>
        </PageContainer>
      );
    }
    return null;
  }

  return (
    <PageContainer className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Subscription</h1>
        <p className="text-text-secondary">Manage your tiffin service subscription</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Subscription Card */}
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="text-primary" size={32} />
                  <h2 className="text-3xl font-bold text-text-primary">{subscription.plan} Plan</h2>
                </div>
                <p className="text-text-secondary">100% Shudh Desi Ghee • 6 Days/Week</p>
              </div>
              <StatusBadge status={subscription.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-text-secondary mb-1">Started On</p>
                <p className="font-bold text-lg text-text-primary">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-text-secondary mb-1">Renews On</p>
                <p className="font-bold text-lg text-text-primary">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-sm text-text-secondary mb-2">Delivery Address</p>
              <p className="text-text-primary">{subscription.deliveryAddress || 'Not specified'}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/subscription/customize')}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition"
              >
                <Edit size={18} />
                Customize Meals
              </button>
              <button 
                onClick={() => navigate('/pricing')}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Change Plan
              </button>
              {subscription.status === 'Active' && (
                <>
                  <button 
                    onClick={() => setIsSkipModalOpen(true)}
                    className="px-5 py-2.5 bg-yellow-50 border-2 border-yellow-400 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 transition"
                  >
                    Skip Tomorrow
                  </button>
                  <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                  >
                    Cancel Subscription
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Your Menu Section */}
          {customizations?.preferences && (
            <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Utensils className="text-green-600" size={24} />
                Your Menu Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(customizations.preferences).map(([day, prefs]: [string, any]) => {
                  const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                  return (
                    <div key={day} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-bold text-primary mb-2">{dayName}</h4>
                      <div className="space-y-1 text-sm">
                        {prefs.sabzi1 && (
                          <p className="text-gray-700">
                            <span className="text-gray-500">•</span> {prefs.sabzi1}
                          </p>
                        )}
                        {prefs.sabzi2 && (
                          <p className="text-gray-700">
                            <span className="text-gray-500">•</span> {prefs.sabzi2}
                          </p>
                        )}
                        {prefs.specialFood && (
                          <p className="text-orange-700 font-medium">
                            🌟 {prefs.specialFood}
                          </p>
                        )}
                        {prefs.dessert && (
                          <p className="text-pink-700 font-medium">
                            🍮 {prefs.dessert}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-4 text-center">
                Click "Customize Meals" to update your preferences anytime
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Weekly Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-text-secondary">Days</span>
                <span className="font-medium">Mon - Sat</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-text-secondary">Delivery Time</span>
                <span className="font-medium">6:00 PM</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">Skipped Days</span>
                <span className="font-medium">{subscription.skippedDates?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Skipped Dates History */}
          {subscription.skippedDates && subscription.skippedDates.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-800">
                📅 Skipped Dates History
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {subscription.skippedDates
                  .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())
                  .map((date: string, idx: number) => {
                    const dateObj = new Date(date);
                    const isPast = dateObj < new Date();
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isPast ? 'bg-gray-100' : 'bg-yellow-100'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {dateObj.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isPast 
                            ? 'bg-gray-300 text-gray-700' 
                            : 'bg-yellow-300 text-yellow-800'
                        }`}>
                          Skipped
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-blue-800">
              Customize your meals weekly to match your taste preferences. You can choose different sabzis for each day!
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">We're sorry to see you go 😢</h3>
            <p className="text-gray-600 mb-4">Please tell us why you are cancelling so we can improve.</p>
            
            <div className="space-y-3 mb-6">
              {['Too expensive', 'Not satisfied with food quality', 'Moving out of area', 'Cooking myself', 'Other'].map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{reason}</span>
                </label>
              ))}
              
              {cancelReason === 'Other' && (
                <textarea 
                  placeholder="Please specify..."
                  value={cancelOtherReason}
                  onChange={(e) => setCancelOtherReason(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm mt-2"
                  rows={2}
                />
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
              >
                Keep Subscription
              </button>
              <button 
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={!cancelReason || (cancelReason === 'Other' && !cancelOtherReason) || cancelSubscriptionMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {cancelSubscriptionMutation.isPending && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Tomorrow Modal */}
      {isSkipModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-4 text-yellow-700 flex items-center gap-2">
              ⚠️ Skip Tomorrow's Delivery?
            </h3>
            
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                📋 Important Guidelines:
              </h4>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span><strong>Cutoff Time:</strong> You can skip tomorrow's delivery if you request before 11:59 PM today.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span><strong>Subscription Extension:</strong> Your subscription will automatically be extended by 1 day to compensate for the skipped delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span><strong>No Refunds:</strong> This feature pauses your delivery, not refunds. The skipped day extends your plan duration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span><strong>Cannot Undo:</strong> Once confirmed, you cannot undo this action for tomorrow's date.</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📅 Skipping Date:</strong> {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700 text-center font-medium">
                ⚠️ Are you sure you want to skip tomorrow's delivery?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsSkipModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => skipDateMutation.mutate()}
                disabled={skipDateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition"
              >
                {skipDateMutation.isPending && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                Yes, Skip Tomorrow
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default MySubscription;
