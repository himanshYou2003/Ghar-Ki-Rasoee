import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { ENV } from '../../../config/env.config';
import { menuData, DayMenu } from '../../../data/menuData';
import { 
  ChevronLeft, 
  Calendar, 
  ClipboardList, 
  Star, 
  Search,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';

const ViewCustomerCustomization: React.FC = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customization, setCustomization] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [planType, setPlanType] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [addressExpanded, setAddressExpanded] = useState(false);

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
    const fetchData = async () => {
      try {
        const token = await user?.getIdToken();
        
        // 1. Fetch Subscription with enriched User Data
        const res = await axios.get(`${ENV.API_URL}/admin/subscriptions/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const subData = res.data.data;
        if (subData) {
            setPlanType(subData.plan.toLowerCase().includes('basic') ? 'basic' : 
                        subData.plan.toLowerCase().includes('premium') ? 'premium' : 'standard');
            setCustomerInfo(subData);
            setCustomization(subData.customization);
        }
      } catch (error) {
        console.error("Error fetching customization:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && subscriptionId) {
      fetchData();
    }
  }, [user, subscriptionId]);

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading user customization profile...</p>
    </div>
  );

  const preferences = customization?.preferences || {};
  const weeklyMenu = menuData.weeklyMenus[planType];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/admin/deliveries')}
            className="flex items-center gap-2 text-primary hover:underline mb-4 transition text-sm font-bold"
          >
            <ChevronLeft size={16} />
            Back to Today's Deliveries
          </button>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <ClipboardList size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{(customerInfo.userName || 'User').split(' ')[0]}'s Customization Plan</h1>
                <p className="text-gray-500 font-medium">Complete weekly meal choices for this customer</p>
             </div>
          </div>
        </div>
        
        {customerInfo && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[300px]">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                    {(customerInfo.customerName || customerInfo.userName || customerInfo.userId).charAt(0).toUpperCase()}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                           planType === 'premium' ? 'bg-purple-100 text-purple-700' : 
                           planType === 'standard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                       }`}>
                           {planType} Plan
                       </span>
                       <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">ID: {subscriptionId?.slice(0, 8)}</span>
                   </div>
                   <p className="font-bold text-gray-900 text-lg">{customerInfo.customerName || customerInfo.userName || 'Customer Profile'}</p>
                </div>
            </div>
        )}
      </div>

      {customerInfo && (
          <div className="bg-gray-200/40 p-6 rounded-[2rem] border border-gray-200/60 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <User size={10} className="text-primary" /> User Details
                  </p>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 truncate">{customerInfo.userName || 'Unknown User'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Search size={12} />
                      <span className="truncate">{customerInfo.userEmail || customerInfo.userId}</span>
                    </div>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={10} className="text-primary" /> Pricing & Status
                  </p>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">Current Plan: {customerInfo.plan}</p>
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Subscription {customerInfo.status}</span>
                    </div>
                  </div>
              </div>
              <div 
                onClick={() => setAddressExpanded(!addressExpanded)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2 cursor-pointer hover:bg-gray-50 transition-colors group relative"
              >
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={10} className="text-primary" /> Delivery Details
                    </p>
                    <span className="text-[9px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {addressExpanded ? 'Collapse' : 'Reveal'}
                    </span>
                  </div>
                  <p className={`font-bold text-gray-900 leading-relaxed text-sm ${!addressExpanded ? 'truncate' : ''}`}>
                    {customerInfo.deliveryAddress}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Calendar size={12} />
                      <span>Ends: {new Date(customerInfo.endDate).toLocaleDateString()}</span>
                  </div>
              </div>
          </div>
      )}

      {!customization ? (
        <div className="bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-3xl p-16 text-center">
            <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-orange-900">No Custom Choices Made</h3>
                <p className="text-orange-700 mt-3 font-medium">
                    This customer is currently happy with our standard weekly menu. No specific dish overrides have been set.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 w-full text-left">
                    <div className="bg-white/80 p-4 rounded-xl border border-orange-100">
                        <p className="text-[10px] font-bold text-orange-800 uppercase">Action Needed</p>
                        <p className="text-xs text-gray-600 mt-1">Serve standard {planType} menu items for all days.</p>
                    </div>
                    <div className="bg-white/80 p-4 rounded-xl border border-orange-100">
                        <p className="text-[10px] font-bold text-orange-800 uppercase">Customization Status</p>
                        <p className="text-xs text-gray-600 mt-1">Inactive. Using default rotation logic.</p>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day) => {
            const dayMenu = weeklyMenu[day as keyof typeof weeklyMenu] as DayMenu;
            const dayPrefs = preferences[day] || {};
            
            return (
              <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className={`px-5 py-4 border-b flex justify-between items-center ${
                    day === 'saturday' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
                }`}>
                   <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
                       day === 'saturday' ? 'text-orange-700' : 'text-gray-700'
                   }`}>
                       <Calendar size={14} />
                       {dayNames[day]}
                   </h3>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                    {dayMenu.isSaturdaySpecial && planType === 'premium' ? (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <p className="text-[10px] text-yellow-700 font-bold uppercase mb-2 flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> Saturday Special
                                </p>
                                <p className="font-bold text-gray-900">{dayPrefs.specialFood || 'Not selected'}</p>
                            </div>
                            <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                                <p className="text-[10px] text-pink-700 font-bold uppercase mb-2">Dessert</p>
                                <p className="font-bold text-gray-900">{dayPrefs.dessert || 'Not selected'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Sabzi 1</p>
                                {dayPrefs.sabzi1 ? (
                                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100 font-bold text-sm">
                                        {dayPrefs.sabzi1}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No selection (Generic)</p>
                                )}
                            </div>
                            
                            {planType !== 'basic' && (
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Sabzi 2</p>
                                    {dayPrefs.sabzi2 ? (
                                        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100 font-bold text-sm">
                                            {dayPrefs.sabzi2}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No selection (Generic)</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-50/50 px-5 py-3 text-[11px] text-gray-400 mt-auto border-t border-gray-50">
                    Includes: {dayMenu.roti} Roti, {dayMenu.raitaType || (dayMenu.raita ? 'Raita' : 'Standard')}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="text-primary" />
              <h4 className="font-bold text-gray-900">Admin Production Note</h4>
          </div>
          <p className="text-sm text-gray-600">
              Please ensure these specific dish selections are communicated to the kitchen staff during morning prep. 
              The choices above reflect the customer's permanent weekly profile.
          </p>
      </div>
    </div>
  );
};

export default ViewCustomerCustomization;
