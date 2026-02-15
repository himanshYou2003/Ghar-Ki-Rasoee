import React, { useState } from 'react';
import axios from 'axios';
import { ENV } from '../../../config/env.config';
import { useAuth } from '../../../context/AuthContext';
import { Order } from '../../../types/order';
import { Search, MapPin, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminOrders: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await axios.get(`${ENV.API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string, newStatus: string }) => {
      const token = await user?.getIdToken();
      await axios.patch(`${ENV.API_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['adminOrders'] });
      const previousOrders = queryClient.getQueryData<Order[]>(['adminOrders']);
      queryClient.setQueryData<Order[]>(['adminOrders'], old => 
        old?.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );
      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['adminOrders'], context.previousOrders);
      }
      alert("Failed to update status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const token = await user?.getIdToken();
      await axios.delete(`${ENV.API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: () => {
      alert("Failed to delete order");
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Cooking': return 'bg-yellow-100 text-yellow-700';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanStyles = (plan?: string) => {
    if (!plan) return 'text-gray-500';
    if (plan.includes('Basic')) return 'text-[#6d28d9] font-bold'; // Deep Violet
    if (plan.includes('Standard')) return 'text-[#be185d] font-bold'; // Vivid Pink
    if (plan.includes('Premium')) return 'text-[#1d4ed8] font-bold'; // High-Contrast Blue
    return 'text-[#115e59] font-bold'; // Dark Teal
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderType?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) return <div className="flex justify-center p-10">Loading orders...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500">Manage and track all customer orders</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cooking">Cooking</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.orderId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Order #{order.orderId?.slice(0, 8)}</span>
                <h3 className="font-semibold text-gray-900">{order.customerName || `User ${order.userId?.slice(0,5)}`}</h3>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-4">📅</span>
                <span>{new Date(order.createdAt || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-4">📍</span>
                <span className="truncate">{order.deliveryAddress || 'No address'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-4">🥗</span>
                <span className={getPlanStyles(order.plan)}>
                   {order.plan || Object.keys(order.items || {}).length + ' items'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <select
                  value={order.status}
                  onChange={(e) => updateStatusMutation.mutate({ orderId: order.orderId!, newStatus: e.target.value })}
                  className="text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-primary/20 outline-none w-32"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this order?')) {
                      deleteOrderMutation.mutate(order.orderId!);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    #{order.orderId?.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(order.createdAt || '').toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-normal">
                    {order.customerName || `User ${order.userId?.slice(0,5)}...`}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={order.deliveryAddress || 'No address'}>
                    {order.deliveryAddress && order.deliveryAddress !== 'No Address Provided' ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors group"
                        >
                            <MapPin size={14} className="text-gray-400 group-hover:text-primary" />
                            <span className="truncate">
                               {order.deliveryAddress.length > 20 ? order.deliveryAddress.substring(0, 20) + '...' : order.deliveryAddress}
                            </span>
                        </a>
                    ) : (
                        <span className="italic text-gray-400">Address not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">
                    <span className={getPlanStyles(order.plan)}>
                        {order.plan || Object.keys(order.items || {}).length + ' items'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ orderId: order.orderId!, newStatus: e.target.value })}
                        className="text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:border-gray-300 min-w-[140px]"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this order?')) {
                            deleteOrderMutation.mutate(order.orderId!);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Order"
                        disabled={deleteOrderMutation.isPending}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found based on current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
