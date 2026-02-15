import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, LogOut, Menu, CreditCard, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Truck, label: 'Deliveries', path: '/admin/deliveries' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0 z-50 transition-all duration-300 shadow-2xl ${
          isSidebarOpen ? 'w-64 overflow-x-hidden' : 'w-20 overflow-visible'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`h-20 flex items-center ${isSidebarOpen ? 'justify-between px-6' : 'justify-center'} border-b border-slate-800 transition-all duration-300`}>
            <div className={`flex items-center gap-2 transition-all ${!isSidebarOpen && 'hidden'}`}>
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                <h1 className="font-black text-xl text-white tracking-tighter truncate">
                GHAR KI RASOEE
                </h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-2 ${isSidebarOpen ? 'p-4 overflow-y-auto' : 'p-2 overflow-visible'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} className={`transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`} />
                <span className={`transition-all ${!isSidebarOpen ? 'hidden opacity-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
                {!isSidebarOpen && (
                   <div className="hidden group-hover:block absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap z-[100]">
                      {item.label}
                   </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-bold group relative"
            >
              <LogOut size={20} className={`${!isSidebarOpen ? 'mx-auto' : ''}`} />
              <span className={`transition-all ${!isSidebarOpen ? 'hidden opacity-0' : 'opacity-100'}`}>
                Logout
              </span>
              {!isSidebarOpen && (
                   <div className="hidden group-hover:block absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap z-[100]">
                      Logout
                   </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
