import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { ENV } from '../../../config/env.config';
import PageContainer from '../../../components/layout/PageContainer';
import { menuData, DayMenu } from '../../../data/menuData';
import { Check, ChevronLeft, Save, Star, Sparkles } from 'lucide-react';

interface DayPreferences {
  sabzi1?: string;
  sabzi2?: string;
  specialFood?: string;
  dessert?: string;
}

interface WeeklyPreferences {
  monday: DayPreferences;
  tuesday: DayPreferences;
  wednesday: DayPreferences;
  thursday: DayPreferences;
  friday: DayPreferences;
  saturday: DayPreferences;
}

const CustomizeSubscription: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null);
  const [planType, setPlanType] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [preferences, setPreferences] = useState<WeeklyPreferences>({
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {}
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const res = await axios.get(`${ENV.API_URL}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.data.data) {
          navigate('/pricing');
          return;
        }

        setSubscription(res.data.data);
        
        // Determine plan type from subscription
        const plan = res.data.data.plan.toLowerCase();
        if (plan.includes('basic')) setPlanType('basic');
        else if (plan.includes('premium')) setPlanType('premium');
        else setPlanType('standard');

        // Load existing preferences if available
        const customRes = await axios.get(
          `${ENV.API_URL}/menu/customizations/${res.data.data.subscriptionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (customRes.data.data?.customization?.preferences) {
          setPreferences(customRes.data.data.customization.preferences);
        }
      } catch (error) {
        console.error("Failed to fetch subscription", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, navigate]);

  const weeklyMenu = menuData.weeklyMenus[planType];
  const currentDayMenu = weeklyMenu[selectedDay as keyof typeof weeklyMenu] as DayMenu;
  const currentDayPrefs = preferences[selectedDay as keyof WeeklyPreferences];

  const handleSabziSelect = (sabzi: string, position: 1 | 2) => {
    setPreferences(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay as keyof WeeklyPreferences],
        [`sabzi${position}`]: sabzi
      }
    }));
  };

  const handleSpecialSelect = (type: 'specialFood' | 'dessert', value: string) => {
    setPreferences(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay as keyof WeeklyPreferences],
        [type]: value
      }
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const token = await user?.getIdToken();
      await axios.post(
        `${ENV.API_URL}/menu/customizations`,
        {
          subscriptionId: subscription.subscriptionId,
          preferences
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Preferences saved successfully!');
      navigate('/my-subscription');
    } catch (error) {
      console.error('Failed to save preferences', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isComplete = () => {
    return days.every(day => {
      const dayMenu = weeklyMenu[day as keyof typeof weeklyMenu] as DayMenu;
      const dayPrefs = preferences[day as keyof WeeklyPreferences];
      
      if (dayMenu.isSaturdaySpecial && planType === 'premium') {
        return dayPrefs.specialFood && dayPrefs.dessert;
      }
      
      if (planType === 'basic') {
        return dayPrefs.sabzi1;
      }
      
      return dayPrefs.sabzi1 && dayPrefs.sabzi2;
    });
  };

  if (loading) {
    return (
      <PageContainer className="py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your subscription...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/my-subscription')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition"
        >
          <ChevronLeft size={20} />
          Back to My Subscription
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Customize Your Meals</h1>
            <p className="text-text-secondary text-sm md:text-base">Choose your preferred dishes for each day</p>
          </div>
          <div className="bg-primary/10 px-6 py-3 rounded-lg border-2 border-primary/20 w-fit">
            <p className="text-sm text-text-secondary">Your Plan</p>
            <p className="text-xl font-bold text-primary capitalize">{planType}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Day Selector Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white lg:rounded-xl border-b lg:border border-gray-200 p-4 sticky top-[73px] lg:top-24 z-30 lg:z-0 -mx-4 lg:mx-0 shadow-sm lg:shadow-none overflow-x-auto lg:overflow-visible">
            <h3 className="font-bold text-lg mb-4 hidden lg:block">Select Day</h3>
            <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-2 min-w-max lg:min-w-0 px-1 lg:px-0">
              {days.map((day) => {
                const dayMenu = weeklyMenu[day as keyof typeof weeklyMenu] as DayMenu;
                const dayPrefs = preferences[day as keyof WeeklyPreferences];
                
                let isCompleteDay = false;
                if (dayMenu.isSaturdaySpecial && planType === 'premium') {
                  isCompleteDay = !!(dayPrefs.specialFood && dayPrefs.dessert);
                } else if (planType === 'basic') {
                  isCompleteDay = !!dayPrefs.sabzi1;
                } else {
                  isCompleteDay = !!(dayPrefs.sabzi1 && dayPrefs.sabzi2);
                }

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:justify-between px-4 py-2 lg:py-3 rounded-full lg:rounded-lg font-medium transition-all text-sm lg:text-base border lg:border-0 ${
                      selectedDay === day
                        ? 'bg-primary text-white shadow-md border-primary'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <span>{dayNames[day]}</span>
                    {isCompleteDay && (
                      <Check size={16} className={selectedDay === day ? 'text-white' : 'text-green-600'} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Customization Area */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">{dayNames[selectedDay]}'s Menu</h2>
              <p className="text-text-secondary">
                {planType === 'basic' && 'Choose 1 Sabzi'}
                {planType === 'standard' && 'Choose 2 Sabzis (1 from each set)'}
                {planType === 'premium' && (currentDayMenu.isSaturdaySpecial ? 'Choose your Saturday Special!' : 'Choose 2 Sabzis (1 from each set)')}
              </p>
            </div>

            {/* Saturday Special (Premium Only) */}
            {currentDayMenu.isSaturdaySpecial && planType === 'premium' ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="text-yellow-600" size={28} fill="currentColor" />
                    <h3 className="text-2xl font-bold text-orange-800">Saturday Special</h3>
                    <Sparkles className="text-yellow-600" size={24} />
                  </div>

                  {/* Special Food Selection */}
                  <div className="mb-8">
                    <h4 className="font-bold text-lg mb-4 text-orange-700">Choose Your Special Food:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {currentDayMenu.specialFoodOptions?.map((food) => (
                        <button
                          key={food}
                          onClick={() => handleSpecialSelect('specialFood', food)}
                          className={`p-4 rounded-lg border-2 font-medium transition-all ${
                            currentDayPrefs.specialFood === food
                              ? 'border-orange-500 bg-orange-100 text-orange-900 shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {currentDayPrefs.specialFood === food && (
                            <Check size={18} className="inline mr-2 text-orange-600" />
                          )}
                          {food}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dessert Selection */}
                  <div>
                    <h4 className="font-bold text-lg mb-4 text-pink-700">Choose Your Dessert:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {currentDayMenu.dessertOptions?.map((dessert) => (
                        <button
                          key={dessert}
                          onClick={() => handleSpecialSelect('dessert', dessert)}
                          className={`p-4 rounded-lg border-2 font-medium transition-all ${
                            currentDayPrefs.dessert === dessert
                              ? 'border-pink-500 bg-pink-100 text-pink-900 shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          {currentDayPrefs.dessert === dessert && (
                            <Check size={18} className="inline mr-2 text-pink-600" />
                          )}
                          {dessert}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Day Sabzi Selection */
              <div className="space-y-6">
                {/* Basic Plan: Single Sabzi Selection */}
                {planType === 'basic' && currentDayMenu.sabziOptions && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Choose Your Sabzi:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {currentDayMenu.sabziOptions.map((sabzi) => (
                        <button
                          key={sabzi}
                          onClick={() => handleSabziSelect(sabzi, 1)}
                          className={`p-4 rounded-lg border-2 font-medium transition-all text-left ${
                            currentDayPrefs.sabzi1 === sabzi
                              ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          {currentDayPrefs.sabzi1 === sabzi && (
                            <Check size={18} className="inline mr-2 text-primary" />
                          )}
                          {sabzi}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard/Premium: Two Sabzi Sets */}
                {(planType === 'standard' || planType === 'premium') && currentDayMenu.sabziSet1 && (
                  <>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-bold text-lg mb-4 text-blue-900">Set 1 - Choose 1:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentDayMenu.sabziSet1.map((sabzi) => (
                          <button
                            key={sabzi}
                            onClick={() => handleSabziSelect(sabzi, 1)}
                            className={`p-4 rounded-lg border-2 font-medium transition-all ${
                              currentDayPrefs.sabzi1 === sabzi
                                ? 'border-blue-600 bg-blue-200 text-blue-900 shadow-lg scale-105'
                                : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-100'
                            }`}
                          >
                            {currentDayPrefs.sabzi1 === sabzi && (
                              <Check size={18} className="inline mr-2 text-blue-600" />
                            )}
                            {sabzi}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="font-bold text-lg mb-4 text-green-900">Set 2 - Choose 1:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentDayMenu.sabziSet2?.map((sabzi) => (
                          <button
                            key={sabzi}
                            onClick={() => handleSabziSelect(sabzi, 2)}
                            className={`p-4 rounded-lg border-2 font-medium transition-all ${
                              currentDayPrefs.sabzi2 === sabzi
                                ? 'border-green-600 bg-green-200 text-green-900 shadow-lg scale-105'
                                : 'border-green-300 bg-white hover:border-green-500 hover:bg-green-100'
                            }`}
                          >
                            {currentDayPrefs.sabzi2 === sabzi && (
                              <Check size={18} className="inline mr-2 text-green-600" />
                            )}
                            {sabzi}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Meal Includes Info */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-5 border border-orange-200">
                  <h5 className="font-semibold text-orange-900 mb-3">Today's Meal Also Includes:</h5>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🫓</span>
                      <span className="font-medium">{currentDayMenu.roti} Tawa Roti</span>
                    </div>
                    {planType === 'premium' && currentDayMenu.raitaType && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        <span className="font-medium">{currentDayMenu.raitaType}</span>
                      </div>
                    )}
                    {(planType === 'basic' || planType === 'standard') && currentDayMenu.raita && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        <span className="font-medium">Raita</span>
                      </div>
                    )}
                    {currentDayMenu.dessert && planType === 'premium' && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🍮</span>
                        <span className="font-medium text-pink-600">Dessert</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSavePreferences}
          disabled={!isComplete() || saving}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={24} />
          {saving ? 'Saving...' : isComplete() ? 'Save Preferences' : 'Complete All Days to Save'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 text-center">
          💡 <strong>Tip:</strong> You can update your meal preferences anytime. Changes will apply to future deliveries.
        </p>
      </div>
    </PageContainer>
  );
};

export default CustomizeSubscription;
