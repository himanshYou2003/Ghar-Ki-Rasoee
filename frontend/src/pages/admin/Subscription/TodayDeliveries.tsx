import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENV } from '../../../config/env.config';
import { useAuth } from '../../../context/AuthContext';
import { 
  Truck, 
  User, 
  MapPin, 
  Clock, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Phone,
  Search,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Delivery {
  subscriptionId: string;
  orderId?: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  plan: string;
  mealPreference: 'Veg' | 'Non-Veg';
  todayCustomization: Record<string, string | number>;
  deliveryStatus: string;
  day: string;
}

interface DeliveryResponse {
  deliveries: Delivery[];
  date: string;
  day: string;
}

const TodayDeliveries: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');

  const { data, isLoading } = useQuery<DeliveryResponse>({
    queryKey: ['adminDeliveries'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await axios.get(`${ENV.API_URL}/admin/deliveries/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    enabled: !!user,
  });

  const deliveries = data?.deliveries || [];
  const dateInfo = { date: data?.date || '', day: data?.day || '' };

  const triggerSchedulerMutation = useMutation({
    mutationFn: async () => {
      const token = await user?.getIdToken();
      await axios.post(`${ENV.API_URL}/admin/deliveries/trigger-scheduler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      alert("Daily orders generated successfully!");
      queryClient.invalidateQueries({ queryKey: ['adminDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: () => {
      alert("Failed to trigger scheduler. Check server logs.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string, newStatus: string }) => {
      const token = await user?.getIdToken();
      await axios.patch(`${ENV.API_URL}/admin/deliveries/status`, {
        orderId,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onMutate: async ({ orderId, newStatus }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['adminDeliveries'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<DeliveryResponse>(['adminDeliveries']);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<DeliveryResponse>(['adminDeliveries'], {
          ...previousData,
          deliveries: previousData.deliveries.map((d) =>
            d.orderId === orderId ? { ...d, deliveryStatus: newStatus } : d
          ),
        });
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousData) {
        queryClient.setQueryData(['adminDeliveries'], context.previousData);
      }
      alert("Failed to update status. Please try again.");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ['adminDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const filteredDeliveries = deliveries.filter(del => {
    const matchesSearch = del.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         del.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         del.phone.includes(searchTerm);
    const matchesPlan = planFilter === 'All' || del.plan.includes(planFilter);
    return matchesSearch && matchesPlan;
  });

  if (isLoading && deliveries.length === 0) return (
    <div className="p-10 text-center animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Daily Deliveries</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1 font-medium">
            <Calendar size={18} className="text-primary" />
            <span className="capitalize">{dateInfo.day}, {dateInfo.date ? new Date(dateInfo.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Loading...'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => triggerSchedulerMutation.mutate()}
                disabled={triggerSchedulerMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
            >
                <RefreshCw size={18} className={triggerSchedulerMutation.isPending ? 'animate-spin' : ''} />
                {triggerSchedulerMutation.isPending ? 'GENERATING...' : 'RUN DAILY SCHEDULER'}
            </button>
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Truck size={24} />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Packages</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">{deliveries.length}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-200/50 p-6 rounded-3xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search by name, address or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium shadow-sm transition-all"
            />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <select 
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="flex-1 md:w-48 px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-bold text-gray-700 shadow-sm transition-all appearance-none cursor-pointer"
            >
                <option value="All">All Delivery Plans</option>
                <option value="Basic">Basic Plan</option>
                <option value="Standard">Standard Plan</option>
                <option value="Premium">Premium Plan</option>
            </select>
        </div>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 shadow-sm border border-gray-100 text-center">
            <div className="flex flex-col items-center max-w-xs mx-auto text-gray-400">
                <Truck size={80} className="mb-6 opacity-20" />
                <h3 className="text-xl font-bold text-gray-900">No deliveries found</h3>
                <p className="text-sm mt-2 font-medium">Try adjusting your search filters or check back later.</p>
                <button 
                    onClick={() => {setSearchTerm(''); setPlanFilter('All');}}
                    className="mt-6 text-primary font-bold text-sm hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredDeliveries.map((delivery) => (
            <div 
              key={delivery.subscriptionId} 
              className={`group bg-white rounded-3xl shadow-sm border-t-4 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col ${
                delivery.plan.includes('Premium') ? 'border-purple-500' : 
                delivery.plan.includes('Standard') ? 'border-blue-500' : 'border-emerald-500'
              }`}
            >
              <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-2xl flex items-center justify-center font-black text-xl border border-gray-200 group-hover:from-primary group-hover:to-primary-hover group-hover:text-white transition-all duration-300">
                            {delivery.customerName.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-sm ${
                            delivery.mealPreference === 'Veg' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                           <div className={`w-2 h-2 rounded-full bg-white`}></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">{delivery.customerName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                delivery.plan.includes('Premium') ? 'bg-purple-100 text-purple-700' : 
                                delivery.plan.includes('Standard') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {delivery.plan}
                            </span>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                      <a 
                        href={`tel:${delivery.phone}`}
                        className="p-3 bg-gray-50 text-gray-400 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                      >
                         <Phone size={20} />
                      </a>
                  </div>
                </div>

                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:bg-primary/10 hover:border-primary/20 hover:shadow-sm transition-all duration-300 group/address"
                >
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <div className="p-2 bg-white rounded-lg text-primary shadow-sm group-hover/address:scale-110 transition-transform">
                                <MapPin size={18} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Delivery Address</p>
                            <p className="text-sm font-bold text-gray-800 leading-relaxed line-clamp-2">
                                {delivery.address}
                            </p>
                        </div>
                    </div>
                </a>
              </div>
              
              <div className="px-6 py-4 flex-1">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <div className="w-1 h-4 bg-primary rounded-full"></div>
                             <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Preferences</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/admin/deliveries/customization/${delivery.subscriptionId}`)}
                          className="text-[10px] text-primary hover:bg-primary/5 px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors"
                        >
                          FULL WEEK <ChevronRight size={10} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                                delivery.deliveryStatus === 'Delivered' 
                                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-200' 
                                    : delivery.deliveryStatus === 'Out for Delivery'
                                    ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-200'
                                    : delivery.deliveryStatus === 'Cooking'
                                    ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-200'
                                    : 'bg-white text-gray-400 border-gray-100'
                            }`}>
                                <Truck size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Status</p>
                                <p className={`text-xs font-black uppercase tracking-tight ${
                                    delivery.deliveryStatus === 'Delivered' ? 'text-emerald-600' : 
                                    delivery.deliveryStatus === 'Out for Delivery' ? 'text-purple-600' :
                                    delivery.deliveryStatus === 'Cooking' ? 'text-amber-600' : 'text-gray-900'
                                }`}>
                                    {delivery.deliveryStatus}
                                </p>
                            </div>
                        </div>
                        <select 
                            value={delivery.deliveryStatus}
                            onChange={(e) => {
                                if (delivery.orderId) {
                                    updateStatusMutation.mutate({ orderId: delivery.orderId, newStatus: e.target.value });
                                } else {
                                    alert("No order record found for today's delivery.");
                                }
                            }}
                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-2 outline-none ${
                                delivery.deliveryStatus === 'Delivered'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : delivery.deliveryStatus === 'Out for Delivery'
                                    ? 'bg-purple-50 border-purple-100 text-purple-700'
                                    : delivery.deliveryStatus === 'Cooking'
                                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                                    : 'bg-white border-gray-100 text-gray-500'
                            }`}
                        >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    
                    <div className="pt-2">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 px-1">Tiffin Contents</p>
                        {delivery.todayCustomization ? (
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(delivery.todayCustomization).map(([key, value]) => (
                                    <div key={key} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">{key.replace('_', ' ')}</p>
                                        <p className="text-xs font-black text-gray-900">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3 text-blue-700 border border-blue-100/50">
                               <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm">
                                   <AlertCircle size={18} />
                               </div>
                               <span className="text-xs font-bold font-mono uppercase tracking-tight">STANDARD {delivery.plan} MENU</span>
                            </div>
                        )}
                    </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <Clock size={12} />
                      <span>Delivery ID: {delivery.subscriptionId.slice(0, 8)}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/deliveries/customization/${delivery.subscriptionId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-xs font-black hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                  >
                     <User size={14} />
                     PROFILE
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayDeliveries;
