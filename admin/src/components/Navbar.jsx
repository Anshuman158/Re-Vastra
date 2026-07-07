import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, List, ShoppingBag, Store, Trash2, LogOut, Moon, Sun, Menu, X, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ setToken }) => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/add', label: 'Add Product', icon: <Package size={20} /> },
    { to: '/list', label: 'Products', icon: <List size={20} /> },
    { to: '/orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { to: '/sellers', label: 'Sellers', icon: <Store size={20} /> },
    { to: '/deleted', label: 'Deleted', icon: <Trash2 size={20} /> },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${darkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div className="hidden sm:block">
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Re<span className="text-red-500">Vastra</span>
                </span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-semibold">
                  ADMIN
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/20'
                      : darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Logout - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2.5 rounded-xl ${darkMode ? 'text-white bg-gray-800' : 'text-gray-700 bg-gray-100'}`}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-xl ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between p-4 rounded-xl font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/20'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span>{label}</span>
                  </div>
                  <ChevronRight size={18} className="opacity-50" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
