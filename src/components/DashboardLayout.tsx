import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Briefcase, 
  FileText, 
  Calendar, 
  Scale, 
  User, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, to, active, collapsed }: any) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative",
      active ? "bg-[#1a1a2e] text-white shadow-lg shadow-blue-900/20" : "text-gray-500 hover:bg-gray-100 hover:text-[#1a1a2e]"
    )}
  >
    <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-white" : "text-gray-400 group-hover:text-[#1a1a2e]")} />
    {!collapsed && <span className="font-bold text-sm">{label}</span>}
    {collapsed && active && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Übersicht', to: '/dashboard' },
    { icon: PlusCircle, label: 'Neues Anliegen', to: '/intake' },
    { icon: Briefcase, label: 'Meine Fälle', to: '/dashboard?tab=cases' },
    { icon: FileText, label: 'Meine Dokumente', to: '/dashboard?tab=docs' },
    { icon: Calendar, label: 'Fristen & Termine', to: '/dashboard?tab=deadlines' },
    { icon: Scale, label: 'Vertragscheck', to: '/dashboard?tab=contracts' },
  ];

  const bottomNavItems = [
    { icon: User, label: 'Mein Profil', to: '/profile' },
    { icon: CreditCard, label: 'Abo & Abrechnung', to: '/profile?tab=billing' },
    { icon: HelpCircle, label: 'Hilfe & FAQ', to: '/dashboard?tab=faq' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 sticky top-0 h-screen",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
                <Scale className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#1a1a2e]">Legal Buddy</span>
            </Link>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 bg-[#1a1a2e] rounded-lg flex items-center justify-center mx-auto">
              <Scale className="text-white w-5 h-5" />
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
              collapsed={isSidebarCollapsed} 
            />
          ))}
          <div className="my-6 border-t border-gray-50 mx-4" />
          {bottomNavItems.map(item => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
              collapsed={isSidebarCollapsed} 
            />
          ))}
        </div>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all group",
              isSidebarCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-bold text-sm">Abmelden</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 px-4 flex items-center justify-between">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-500">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
            <Scale className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-[#1a1a2e]">Legal Buddy</span>
        </Link>
        <button className="p-2 text-gray-500 relative">
          <Bell className="w-6 h-6" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-72 h-full bg-white p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-10">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
                  <Scale className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-[#1a1a2e]">Legal Buddy</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow space-y-2">
              {navItems.map(item => (
                <SidebarItem key={item.to} {...item} active={location.pathname === item.to} />
              ))}
              <div className="my-6 border-t border-gray-50" />
              {bottomNavItems.map(item => (
                <SidebarItem key={item.to} {...item} active={location.pathname === item.to} />
              ))}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 mt-auto">
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm">Abmelden</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow pt-16 md:pt-0">
        {/* Top Bar (Desktop) */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-100 px-10 items-center justify-between sticky top-0 z-30">
          <h2 className="text-xl font-bold text-[#1a1a2e]">
            {navItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
            <button className="p-2 text-gray-400 hover:text-[#1a1a2e] relative">
              <Bell className="w-6 h-6" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-gray-100" />
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-[#1a1a2e]">{user?.name}</p>
                <p className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider">{user?.plan} Plan</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#1a1a2e] font-bold group-hover:bg-gray-200 transition-colors">
                {user?.name?.charAt(0)}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
