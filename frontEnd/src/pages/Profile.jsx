import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Mail, Phone, MapPin, Edit2, ShieldCheck, Package, Heart, LogOut, Store } from "lucide-react";

const Profile = () => {
  const { token, user, setUser, backEndURL, fetchUserProfile, logout, navigate } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: ""
  });

  useEffect(() => {
    // Logic to prevent double fetching and ensure user data is loaded
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }

      if (!user) {
        await fetchUserProfile(); // Fetch if not in context
      } else {
        // Pre-fill form data if user exists
        setEditFormData({
          name: user.name || "",
          phone: user.phone || "",
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || ""
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, [token, user, fetchUserProfile, navigate]);

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      const payload = {
        name: editFormData.name,
        phone: editFormData.phone,
        address: {
          street: editFormData.street,
          city: editFormData.city,
          state: editFormData.state,
          zip: editFormData.zip
        }
      };

      const response = await axios.put(
        `${backEndURL}/api/user/update`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } } // Correct header format
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setUser(response.data.user); // Update context
        setIsEditing(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex text-center justify-center items-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="container-custom py-12 min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Sidebar Cards */}
        <div className="md:col-span-1 space-y-6">
          {/* User Card */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>

            {user?.isBanned && (
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Account Banned</span>
            )}
            {user?.isSeller && !user?.isBanned && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                <Store size={12} /> Seller Account
              </span>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
            <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors border-b dark:border-neutral-700">
              <Package className="text-blue-500" size={20} /> <span className="text-gray-700 dark:text-gray-300 font-medium">My Orders</span>
            </button>
            <button onClick={() => navigate('/wishlist')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors border-b dark:border-neutral-700">
              <Heart className="text-red-500" size={20} /> <span className="text-gray-700 dark:text-gray-300 font-medium">Wishlist</span>
            </button>
            {user?.isSeller && (
              <button onClick={() => navigate('/seller-orders')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors border-b dark:border-neutral-700">
                <Package className="text-orange-500" size={20} /> <span className="text-gray-700 dark:text-gray-300 font-medium">Incoming Orders</span>
              </button>
            )}
            <button onClick={logout} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500">
              <LogOut size={20} /> <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Right Column: Profile Details */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <ShieldCheck className="text-primary-500" /> Account Details
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors text-sm font-medium"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Edit Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input name="name" value={editFormData.name} onChange={handleEditChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input name="phone" value={editFormData.phone} onChange={handleEditChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                    <input name="street" value={editFormData.street} onChange={handleEditChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input name="city" value={editFormData.city} onChange={handleEditChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                    <input name="state" value={editFormData.state} onChange={handleEditChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                    <input name="zip" value={editFormData.zip} onChange={handleEditChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={saveProfile} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-md">Save Changes</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                {/* View Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-neutral-700/50 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Contact Info</p>
                    <div className="flex items-center gap-3 mb-2">
                      <Mail size={18} className="text-primary-500" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-primary-500" />
                      <span>{user?.phone || "No phone added"}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-neutral-700/50 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Default Address</p>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-primary-500 mt-1" />
                      <span>
                        {user?.address?.street ? (
                          <>
                            {user.address.street}<br />
                            {user.address.city}, {user.address.state} {user.address.zip}
                          </>
                        ) : "No address saved"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
