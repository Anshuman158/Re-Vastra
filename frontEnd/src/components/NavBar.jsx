import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { Search, ShoppingBag, User, Menu, X, LogOut, Heart, Store, Package, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import axios from "axios";
import { backEndURL } from "../config";

const NavBar = () => {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {
    showSearch,
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    wishlist,
    logout
  } = useContext(ShopContext);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Notification unread count
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${backEndURL}/api/notification/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setUnreadCount(res.data.count);
      } catch (e) { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="container-custom flex items-center justify-between font-medium">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl sm:text-2xl font-decorative font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            ReVastra
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-8 text-neutral-600 dark:text-neutral-300">
          {["HOME", "COLLECTION", "LEND", "ABOUT", "CONTACT"].map((item) => (
            <NavLink
              key={item}
              to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 text-sm font-semibold tracking-wide transition-colors duration-300 group ${isActive ? "text-primary-600" : "hover:text-primary-500"
                }`
              }
            >
              <p>{item}</p>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
          ))}
        </ul>

        {/* Icons Section */}
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Theme Toggle - Hide on mobile to save space */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Search Icon - Hide on mobile */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="hidden sm:block text-neutral-700 hover:text-primary-500 transition-colors"
          >
            <Search size={22} strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Notification Bell */}
          {token && (
            <Link to="/notifications" className="relative text-neutral-700 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              <Bell size={22} strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-900 shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile */}
          <div className="group relative">
            {token ? (
              <button className="text-neutral-700 hover:text-primary-500 transition-colors pt-1">
                <User size={22} strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            ) : (
              <Link to="/login" className="text-neutral-700 hover:text-primary-500 transition-colors">
                <User size={22} strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            )}

            {/* Dropdown Menu */}
            {token && (
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                <div className="flex flex-col gap-2 w-48 py-3 px-4 bg-white text-neutral-600 rounded-xl shadow-medium border border-neutral-100">
                  <p
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <User size={16} /> My Profile
                  </p>
                  <p
                    onClick={() => navigate("/become-seller")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <Store size={16} /> Become Seller
                  </p>
                  <p
                    onClick={() => navigate("/seller-orders")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <Package size={16} /> Incoming Orders
                  </p>
                  <p
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={16} /> Orders
                  </p>
                  <p
                    onClick={() => navigate("/notifications")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <Bell size={16} /> Notifications
                    {unreadCount > 0 && (
                      <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </p>
                  <p
                    onClick={() => navigate("/myproducts")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={16} /> My Products
                  </p>
                  <p
                    onClick={() => navigate("/earning")}
                    className="cursor-pointer hover:text-primary-500 font-medium transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={16} /> My Earning
                  </p>

                  <div className="h-[1px] bg-neutral-100 my-1"></div>

                  <p
                    onClick={logout}
                    className="cursor-pointer text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <Link to="/wishlist" className="relative text-neutral-700 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
            <Heart size={22} strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-900 shadow-sm">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative text-neutral-700 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
            <ShoppingBag size={22} strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-900 shadow-sm">
              {getCartCount()}
            </span>
          </Link>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setVisible(true)}
            className="md:hidden text-neutral-700 dark:text-neutral-300 hover:text-primary-500 transition-colors"
          >
            <Menu size={24} className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu - Fixed overlay for full screen */}
      <div
        className={`fixed top-0 right-0 h-screen overflow-hidden bg-white dark:bg-neutral-900 backdrop-blur-xl transition-all duration-300 shadow-2xl z-[100] ${visible ? "w-full" : "w-0"
          }`}
      >
        <div className="flex flex-col text-neutral-600 h-full">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-5 cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
              <X size={20} />
            </div>
            <p className="font-semibold text-lg">Back</p>
          </div>

          <div className="flex flex-col p-4 gap-2">
            {["HOME", "COLLECTION", "LEND", "ABOUT", "CONTACT"].map((item) => (
              <NavLink
                key={item}
                onClick={() => setVisible(false)}
                to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                className={({ isActive }) =>
                  `py-4 px-6 border rounded-lg text-lg font-medium transition-all duration-200 ${isActive
                    ? "bg-primary-50 border-primary-100 text-primary-600"
                    : "border-transparent hover:bg-neutral-50"
                  }`
                }
              >
                {item}
              </NavLink>
            ))}
          </div>

          {/* Mobile Footer Area */}
          <div className="mt-auto p-6 bg-neutral-50 border-t border-neutral-100">
            {token ? (
              <Link to="/profile" onClick={() => setVisible(false)} className="btn-primary w-full block text-center">
                My Profile
              </Link>
            ) : (
              <Link to="/login" onClick={() => setVisible(false)} className="btn-primary w-full block text-center">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;