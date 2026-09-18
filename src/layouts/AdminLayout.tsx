import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Package, Tag, MessageSquare, Settings, LogOut, Loader2, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export const AdminLayout = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold font-serif">
            V
          </div>
          <span className="font-serif font-bold text-xl tracking-wide text-text-main">Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary-light text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-text-main'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 px-4">
            <p className="text-xs text-gray-500 font-medium">LOGGED IN AS</p>
            <p className="text-sm font-medium text-text-main truncate" title={session.user.email}>{session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (TODO: Add proper mobile menu) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <span className="font-serif font-bold text-lg">Vinayaka Admin</span>
          <button onClick={handleLogout} className="text-gray-500">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
