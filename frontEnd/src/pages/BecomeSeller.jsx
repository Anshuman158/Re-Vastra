import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Store, User, CreditCard } from 'lucide-react';

const BecomeSeller = () => {
    const { token, backEndURL, setUser, user, fetchUserProfile } = useContext(ShopContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Check if user is already a seller
    useEffect(() => {
        if (user?.isSeller) {
            toast.info("You're already a seller! Redirecting to list a product.");
            navigate('/lend');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        // Personal/Address
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',

        // Shop
        shopName: '',
        shopDescription: '',

        // Banking
        upiId: '',
        accountNo: '',
        ifsc: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        // Basic validation per step
        if (step === 1) {
            if (!formData.street || !formData.city || !formData.state || !formData.phone) {
                toast.error("Please fill all address fields.");
                return;
            }
        } else if (step === 2) {
            if (!formData.shopName || !formData.shopDescription) {
                toast.error("Please fill shop details.");
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                phone: formData.phone
            },
            shopName: formData.shopName,
            shopDescription: formData.shopDescription,
            bankingInfo: {
                upiId: formData.upiId,
                accountNo: formData.accountNo,
                ifsc: formData.ifsc
            }
        };

        try {
            const response = await axios.post(
                backEndURL + '/api/user/become-seller',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("🎉 You're now a seller! Start listing your items.");
                await fetchUserProfile(token); // Refresh user data with seller status
                navigate('/lend');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl transition-all">

                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Become a Seller
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Join ReVastra and start earning from your wardrobe!
                    </p>
                </div>

                {/* Steps Indicator */}
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors duration-300 ${step >= s ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'}`}>
                            {step > s ? <CheckCircle size={20} /> : s}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                    {/* Step 1: Personal & Address */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <User className="text-primary-500" /> Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="input-field col-span-2" required />
                                <input name="street" value={formData.street} onChange={handleChange} placeholder="Street Address" className="input-field col-span-2" required />
                                <input name="city" value={formData.city} onChange={handleChange} placeholder="City / Hostel" className="input-field" required />
                                <input name="state" value={formData.state} onChange={handleChange} placeholder="State / Block" className="input-field" required />
                                <input name="zip" value={formData.zip} onChange={handleChange} placeholder="ZIP / Room No" className="input-field" />
                            </div>
                            <button type="button" onClick={nextStep} className="btn-primary w-full mt-4">Next Step</button>
                        </div>
                    )}

                    {/* Step 2: Shop Details */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <Store className="text-primary-500" /> Shop Details
                            </h3>
                            <input name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Shop Name (e.g. 'Kunal's Closet')" className="input-field w-full" required />
                            <textarea name="shopDescription" value={formData.shopDescription} onChange={handleChange} placeholder="Tell us about your collection..." className="input-field w-full h-24" required />
                            <div className="flex gap-4 mt-4">
                                <button type="button" onClick={prevStep} className="btn-secondary w-1/2">Back</button>
                                <button type="button" onClick={nextStep} className="btn-primary w-1/2">Next Step</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Banking Info */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <CreditCard className="text-primary-500" /> Banking Info
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Where should we send your earnings?</p>
                            <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="UPI ID (e.g. name@okhdfcbank)" className="input-field w-full" />
                            <div className="relative flex items-center justify-center my-2">
                                <span className="bg-white dark:bg-neutral-800 px-2 text-sm text-gray-400">OR</span>
                                <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700 -z-10"></div>
                            </div>
                            <input name="accountNo" value={formData.accountNo} onChange={handleChange} placeholder="Account Number" className="input-field w-full" />
                            <input name="ifsc" value={formData.ifsc} onChange={handleChange} placeholder="IFSC Code" className="input-field w-full" />

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={prevStep} className="btn-secondary w-1/2">Back</button>
                                <button type="submit" disabled={loading} className="btn-primary w-1/2">
                                    {loading ? 'Submitting...' : 'Register as Seller'}
                                </button>
                            </div>
                        </div>
                    )}

                </form>
            </div>

            <style jsx>{`
                .input-field {
                    @apply w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all;
                }
                .btn-primary {
                    @apply px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95;
                }
                .btn-secondary {
                    @apply px-6 py-3 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-all;
                }
            `}</style>
        </div>
    );
};

export default BecomeSeller;
