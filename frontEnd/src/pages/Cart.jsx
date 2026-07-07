import React, { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Calendar, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import {
  calculateTieredPrice,
  calculateRentalDays,
  getMinStartDate,
  getMinEndDate,
  isUrgentDelivery,
  calculateSecurityDeposit,
  URGENT_FEE
} from "../utils/pricingUtils";

const Cart = () => {
  const { products, currency, cartItems, updateDuration, navigate, setCartItems } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  // Rental date states - stored per item
  const [rentalDates, setRentalDates] = useState({});

  // Delivery date state
  const [deliveryDate, setDeliveryDate] = useState(null);

  // Urgent order state
  const [urgentOrder, setUrgentOrder] = useState(false);

  // When urgent delivery is toggled, auto-set all rental start dates to today
  useEffect(() => {
    if (urgentOrder) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setDeliveryDate(today);

      setRentalDates(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            startDate: today,
            endDate: updated[key]?.endDate && updated[key].endDate > today ? updated[key].endDate : new Date(today.getTime() + 86400000)
          };
        });
        return updated;
      });
    } else {
      setDeliveryDate(null);
    }
  }, [urgentOrder]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              duration: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);

      // Initialize rental dates as null (user must select)
      tempData.forEach(item => {
        const key = `${item._id}-${item.size}`;
        if (rentalDates[key] === undefined) {
          setRentalDates(prev => ({
            ...prev,
            [key]: { startDate: null, endDate: null }
          }));
        }
      });
    }
  }, [cartItems, products]);

  // Handle date changes for an item
  const handleDateChange = (itemId, size, type, date) => {
    const key = `${itemId}-${size}`;
    setRentalDates(prev => {
      const current = prev[key] || { startDate: getMinStartDate(), endDate: getMinEndDate(getMinStartDate()) };
      const updated = { ...current, [type]: date };

      // Ensure endDate is always after startDate
      if (type === 'startDate' && updated.endDate <= date) {
        updated.endDate = new Date(date);
        updated.endDate.setDate(updated.endDate.getDate() + 1);
      }

      return { ...prev, [key]: updated };
    });
  };

  // Remove item from cart
  const removeItem = (itemId, size) => {
    updateDuration(itemId, size, 0);
  };

  // Calculate rental days for an item
  const getRentalDays = (itemId, size) => {
    const key = `${itemId}-${size}`;
    const dates = rentalDates[key];
    if (!dates?.startDate || !dates?.endDate) return 1;
    return calculateRentalDays(dates.startDate, dates.endDate);
  };

  // Check if urgent delivery is selected
  const isUrgent = useMemo(() => {
    return urgentOrder || (deliveryDate && isUrgentDelivery(new Date(), deliveryDate));
  }, [urgentOrder, deliveryDate]);

  // Calculate total amount with tiered pricing and security deposit
  const calculateTotal = useMemo(() => {
    let subtotal = 0;
    let totalSecurityDeposit = 0;
    const allBreakdowns = [];

    cartData.forEach(item => {
      const productData = products.find(p => p._id === item._id);
      if (!productData) return;

      const days = getRentalDays(item._id, item.size);
      const { total, breakdown } = calculateTieredPrice(productData.rental_price, days);
      const securityDeposit = calculateSecurityDeposit(productData.price);

      subtotal += total;
      totalSecurityDeposit += securityDeposit;

      allBreakdowns.push({
        productName: productData.name,
        size: item.size,
        days,
        total,
        breakdown,
        securityDeposit,
        productPrice: productData.price
      });
    });

    return {
      subtotal,
      urgentFee: isUrgent ? URGENT_FEE : 0,
      securityDeposit: totalSecurityDeposit,
      breakdowns: allBreakdowns
    };
  }, [cartData, products, rentalDates, isUrgent]);

  // Get overall rental start/end dates (earliest start, latest end)
  const getRentalDateRange = () => {
    let earliestStart = null;
    let latestEnd = null;

    Object.values(rentalDates).forEach(dates => {
      if (dates.startDate && (!earliestStart || dates.startDate < earliestStart)) {
        earliestStart = dates.startDate;
      }
      if (dates.endDate && (!latestEnd || dates.endDate > latestEnd)) {
        latestEnd = dates.endDate;
      }
    });

    return { startDate: earliestStart, endDate: latestEnd };
  };

  // Check if all dates are selected
  const allDatesSelected = useMemo(() => {
    if (cartData.length === 0) return false;
    return cartData.every(item => {
      const key = `${item._id}-${item.size}`;
      const dates = rentalDates[key];
      return dates?.startDate && dates?.endDate;
    });
  }, [cartData, rentalDates]);

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    // Validate all dates are selected
    if (!allDatesSelected) {
      toast.error('Please select rental dates for all items before proceeding.');
      return;
    }

    const dateRange = getRentalDateRange();

    // Store rental info in session storage for PlaceOrder page
    sessionStorage.setItem('rentalInfo', JSON.stringify({
      rentalDates,
      deliveryDate: deliveryDate?.toISOString(),
      urgentOrder: isUrgent,
      rentalStartDate: dateRange.startDate?.toISOString(),
      rentalEndDate: dateRange.endDate?.toISOString(),
      pricingBreakdown: calculateTotal.breakdowns,
      securityDeposit: calculateTotal.securityDeposit
    }));

    navigate("/placeorder");
  };

  return (
    <div className="container-custom pt-10 pb-20 min-h-[80vh]">
      <div className="mb-10 text-center">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
          <div className="w-20 h-20 bg-white dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
            <ShoppingBag size={32} className="text-neutral-400" />
          </div>
          <h3 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200 mb-2">Your cart is empty</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Looks like you haven't added any items yet.</p>
          <Link to="/collection" className="btn-primary inline-flex items-center gap-2">
            Start Renting <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {cartData.map((item, index) => {
              const productData = products.find((product) => product._id === item._id);
              if (!productData) return null;

              const key = `${item._id}-${item.size}`;
              const dates = rentalDates[key] || { startDate: getMinStartDate(), endDate: getMinEndDate(getMinStartDate()) };
              const rentalDays = getRentalDays(item._id, item.size);
              const { total, breakdown } = calculateTieredPrice(productData.rental_price, rentalDays);

              return (
                <div key={index} className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700 group hover:shadow-medium transition-all duration-300">

                  {/* Image & Details Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" src={productData.image[0]} alt={productData.name} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display font-bold text-lg text-neutral-800 dark:text-neutral-200 truncate pr-4">{productData.name}</h3>
                        <button onClick={() => removeItem(item._id, item.size)} className="text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        <div className="bg-neutral-50 dark:bg-neutral-700 px-3 py-1 rounded-lg border border-neutral-100 dark:border-neutral-600">Size: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.size}</span></div>
                        <div className="bg-neutral-50 dark:bg-neutral-700 px-3 py-1 rounded-lg border border-neutral-100 dark:border-neutral-600">Base: <span className="font-semibold text-primary-600 dark:text-primary-400">{currency}{productData.rental_price}/day</span></div>
                      </div>

                      {/* Calendar Date Pickers */}
                      <div className={`grid grid-cols-1 ${urgentOrder ? '' : 'sm:grid-cols-2'} gap-4 mt-4`}>
                        {urgentOrder ? (
                          /* Urgent mode: start date is today, only show end date */
                          <>
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <Zap size={16} className="text-yellow-500" />
                              <div>
                                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Rental Starts</p>
                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">Today — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-1">
                                <Calendar size={14} /> Rental End
                              </label>
                              <DatePicker
                                selected={dates.endDate}
                                onChange={(date) => handleDateChange(item._id, item.size, 'endDate', date)}
                                minDate={getMinEndDate(new Date())}
                                dateFormat="MMM d, yyyy"
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        ) : (
                          /* Normal mode: both start and end date pickers */
                          <>
                            <div>
                              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-1">
                                <Calendar size={14} /> Rental Start
                              </label>
                              <DatePicker
                                selected={dates.startDate}
                                onChange={(date) => handleDateChange(item._id, item.size, 'startDate', date)}
                                minDate={getMinStartDate()}
                                dateFormat="MMM d, yyyy"
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-1">
                                <Calendar size={14} /> Rental End
                              </label>
                              <DatePicker
                                selected={dates.endDate}
                                onChange={(date) => handleDateChange(item._id, item.size, 'endDate', date)}
                                minDate={getMinEndDate(dates.startDate)}
                                dateFormat="MMM d, yyyy"
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Duration & Pricing Summary */}
                      <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                            <Clock size={14} /> Duration: <strong className="text-primary-600">{rentalDays} days</strong>
                          </span>
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{currency}{total}</span>
                        </div>

                        {/* Per-Day Pricing Breakdown */}
                        <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400 max-h-32 overflow-y-auto">
                          {breakdown.map((dayData, i) => (
                            <div key={i} className="flex justify-between">
                              <span>
                                Day {dayData.day}: +₹{dayData.addedAmount}
                                {dayData.increasePercent && (
                                  <span className="text-amber-600 ml-1">(+{dayData.increasePercent}%)</span>
                                )}
                              </span>
                              <span>= ₹{dayData.runningTotal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Delivery & Urgent Section */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700">
              <h4 className="font-display font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary-500" /> Delivery Preference
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Urgent Delivery Toggle */}
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={urgentOrder}
                      onChange={(e) => setUrgentOrder(e.target.checked)}
                      className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" /> Urgent Delivery
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">+{currency}{URGENT_FEE} for same-day priority processing</span>
                    </div>
                  </label>
                </div>

                {/* Delivery date: shown only in normal mode */}
                {urgentOrder ? (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <Zap size={20} className="text-yellow-500" />
                    <div>
                      <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                        Same-Day Delivery
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Rental starts today — pick your return date per item above
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">
                      When should we deliver? <span className="text-xs text-neutral-400">(Next day onwards)</span>
                    </label>
                    <DatePicker
                      selected={deliveryDate}
                      onChange={setDeliveryDate}
                      minDate={(() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); return tomorrow; })()}
                      maxDate={getRentalDateRange().startDate}
                      placeholderText="Select delivery date"
                      dateFormat="MMM d, yyyy"
                      className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5 flex gap-4 items-start">
              <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={24} />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-bold mb-1">Open Box Delivery & Security</p>
                <p className="opacity-80">All items are verified at delivery. You must provide a valid ID proof and sign the digital contract upon receipt.</p>
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700 sticky top-24">
              <Title text1="ORDER" text2="SUMMARY" />
              <div className="mt-6">
                <CartTotal
                  customSubtotal={calculateTotal.subtotal}
                  urgentFee={calculateTotal.urgentFee}
                  securityDeposit={calculateTotal.securityDeposit}
                  pricingBreakdowns={calculateTotal.breakdowns}
                />
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="w-full btn-primary mt-8 flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
