import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";

import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { MapPin, CreditCard, AlertCircle, Info, Truck, Calendar, Zap, Clock } from "lucide-react";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backEndURL,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    washingFee,
    products,
    includeWashing,
    currency
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    fullName: "",
    hostel: "",
    block: "",
    room: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Rental info from Cart page
  const [rentalInfo, setRentalInfo] = useState(null);

  // Load rental info from session storage
  useEffect(() => {
    const storedInfo = sessionStorage.getItem('rentalInfo');
    if (storedInfo) {
      try {
        setRentalInfo(JSON.parse(storedInfo));
      } catch (e) {
        console.error('Error parsing rental info:', e);
      }
    }
  }, []);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  // Calculate total with tiered pricing
  const calculateTotal = () => {
    let subtotal = 0;

    if (rentalInfo?.pricingBreakdown) {
      rentalInfo.pricingBreakdown.forEach(item => {
        subtotal += item.total;
      });
    } else {
      subtotal = getCartAmount();
    }

    const urgentFee = rentalInfo?.urgentOrder ? 50 : 0;
    return subtotal + delivery_fee + (includeWashing ? washingFee : 0) + urgentFee;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.duration = cartItems[items][item];

              // Add rental dates from rentalInfo
              const key = `${items}-${item}`;
              if (rentalInfo?.rentalDates?.[key]) {
                itemInfo.rentalStartDate = rentalInfo.rentalDates[key].startDate;
                itemInfo.rentalEndDate = rentalInfo.rentalDates[key].endDate;
              }

              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        userId: JSON.parse(localStorage.getItem('user'))?._id,
        address: formData,
        items: orderItems,
        amount: calculateTotal(),
        deliveryFee: delivery_fee,
        washingFee: includeWashing ? washingFee : 0,
        securityDeposit: rentalInfo?.securityDeposit || 0,
        // New rental fields
        rentalStartDate: rentalInfo?.rentalStartDate,
        rentalEndDate: rentalInfo?.rentalEndDate,
        deliveryDate: rentalInfo?.deliveryDate,
        urgentOrder: rentalInfo?.urgentOrder || false,
        pricingBreakdown: rentalInfo?.pricingBreakdown
      };

      switch (method) {
        case "cod": {
          const response = await axios.post(
            backEndURL + "/api/order/place",
            orderData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.success) {
            setCartItems({});
            sessionStorage.removeItem('rentalInfo');
            navigate("/orders");
            toast.success("Order placed successfully!");
          } else {
            toast.error(response.data.message);
          }
          break;
        }



        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container-custom py-10 min-h-[80vh]">
      <form onSubmit={onSubmitHandler} className="flex flex-col lg:flex-row gap-10">

        {/* Left Side: Form */}
        <div className="flex-1 space-y-8">

          {/* Rental Summary */}
          {rentalInfo && (
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-100 dark:border-primary-800">
              <h3 className="section-title mb-4 flex items-center gap-2 font-display text-xl font-semibold text-primary-700 dark:text-primary-300">
                <Clock className="text-primary-500" /> Rental Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary-500" />
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Rental Period</p>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {formatDate(rentalInfo.rentalStartDate)} - {formatDate(rentalInfo.rentalEndDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-primary-500" />
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Delivery Date</p>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {formatDate(rentalInfo.deliveryDate)}
                    </p>
                  </div>
                </div>
                {rentalInfo.urgentOrder && (
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" />
                    <div>
                      <p className="text-neutral-500 dark:text-neutral-400">Priority</p>
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                        ⚡ Urgent Delivery (+{currency}50)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div>
            <h3 className="section-title mb-6 flex items-center gap-2 font-display text-xl font-semibold text-neutral-800">
              <MapPin className="text-primary-500" /> Delivery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input required name="fullName" value={formData.fullName} onChange={onChangeHandler}
                  className="input-field" placeholder="Full Name" />
              </div>
              <input required name="hostel" value={formData.hostel} onChange={onChangeHandler}
                className="input-field" placeholder="Hostel (e.g., Block A)" />
              <input required name="block" value={formData.block} onChange={onChangeHandler}
                className="input-field" placeholder="Block No." />
              <input required name="room" value={formData.room} onChange={onChangeHandler}
                className="input-field" placeholder="Room No." />
              <input required name="phone" value={formData.phone} onChange={onChangeHandler}
                className="input-field" placeholder="Phone Number" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="section-title mb-6 flex items-center gap-2 font-display text-xl font-semibold text-neutral-800 dark:text-neutral-200">
              <CreditCard className="text-primary-500" /> Payment Method
            </h3>
            <div className="p-4 border rounded-xl border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
              </div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Cash on Delivery</span>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-neutral-600 dark:text-neutral-400"><span className="font-bold text-neutral-800 dark:text-neutral-200">Important:</span> No delivery outside campus limits. Orders must be received within college premises.</p>
            </div>
            <div className="flex gap-3">
              <Truck className="text-primary-500 shrink-0" size={20} />
              <p className="text-sm text-neutral-600 dark:text-neutral-400"><span className="font-bold text-neutral-800 dark:text-neutral-200">Open Box Delivery:</span> Products will be verified at the time of delivery. ID proof required.</p>
            </div>
          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-96 shrink-0">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700 sticky top-24">
            <Title text1="CART" text2="TOTALS" />
            <CartTotal
              customSubtotal={rentalInfo?.pricingBreakdown?.reduce((sum, item) => sum + item.total, 0)}
              urgentFee={rentalInfo?.urgentOrder ? 50 : 0}
              pricingBreakdowns={rentalInfo?.pricingBreakdown || []}
            />
            <button type="submit" disabled={isLoading} className="w-full btn-primary mt-6 group flex items-center justify-center gap-2">
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <Info size={14} />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default PlaceOrder;
