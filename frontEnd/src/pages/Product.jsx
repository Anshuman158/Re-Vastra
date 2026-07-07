import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Truck, ShieldCheck, Clock, CheckCircle, User, BadgeCheck, Star, Calendar } from 'lucide-react';
import Title from '../components/Title';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  useEffect(() => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
    }
  }, [productId, products]);

  const handleAddToCart = async () => {
    if (size) {
      try {
        await addToCart(productData._id, size);
        // Success toast is now handled by ShopContext or not shown if not logged in
      } catch (error) {
        toast.error('Failed to add item to cart. Please try again.');
      }
    } else {
      toast.error('Please select a size before adding to cart.');
    }
  };

  return productData ? (
    <div className="pt-10 transition-opacity ease-in duration-500 opacity-100 min-h-screen">
      <div className='container-custom'>

        {/* Breadcrumb / Layout Container */}
        <div className='flex flex-col lg:flex-row gap-12 lg:gap-16'>

          {/* ---------------- Left Side: Image Gallery ---------------- */}
          <div className='flex-1 flex flex-col-reverse lg:flex-row gap-4'>
            {/* Thumbnails */}
            <div className='flex lg:flex-col overflow-x-auto lg:overflow-y-auto justify-between lg:justify-start lg:w-[15%] w-full gap-3 scrollbar-hide'>
              {productData.image.map((item, index) => (
                <img
                  key={index}
                  src={item}
                  onClick={() => setImage(item)}
                  className={`w-[23%] lg:w-full h-auto aspect-[3/4] object-cover rounded-xl cursor-pointer border-2 transition-all duration-300 ${item === image ? 'border-primary-500 opacity-100 ring-2 ring-primary-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>

            {/* Main Image */}
            <div className='w-full lg:w-[85%] relative group'>
              <div className="aspect-[3/4] w-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={image}
                  alt={productData.name}
                  className='w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105'
                />
              </div>
            </div>
          </div>

          {/* ---------------- Right Side: Product Info ---------------- */}
          <div className='flex-1 pb-16'>
            <h1 className='font-display font-medium text-3xl sm:text-4xl text-neutral-800 dark:text-neutral-100 mb-2 mt-2 leading-tight'>
              {productData.name}
            </h1>

            {/* Status & Category */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${productData.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {productData.status === 'available' ? <CheckCircle size={14} /> : null}
                {productData.status === 'available' ? 'Available' : 'Out of Stock'}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{productData.category}</span>
            </div>

            {/* Price Section */}
            <div className='bg-primary-50 dark:bg-primary-900/10 p-5 rounded-2xl border border-primary-100 dark:border-primary-900/30 mb-8'>
              <div className="flex items-end gap-3 mb-1">
                <p className='text-4xl font-bold text-primary-600 dark:text-primary-400'>
                  {currency}{productData.rental_price}
                </p>
                <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400 pb-1">/ day</span>
              </div>
              <p className='text-sm text-neutral-500 dark:text-neutral-400 font-medium line-through'>
                Retail Price: {currency}{productData.price}
              </p>
            </div>

            {/* Description */}
            <p className='text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 text-base'>
              {productData.description}
            </p>

            {/* Seller Info */}
            {productData.seller && (
              <div className='bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 mb-8'>
                <p className='text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold tracking-wider mb-3'>Lender</p>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                      {productData.seller.shopName?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-neutral-800 dark:text-neutral-200'>{productData.seller.shopName}</span>
                        {productData.seller.isVerified && (
                          <span className='flex items-center gap-1 text-blue-500' title='Verified Seller'>
                            <BadgeCheck size={18} className='fill-blue-100' />
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-3 mt-1 text-sm'>
                        {productData.seller.rating?.average > 0 && (
                          <span className='flex items-center gap-1 text-yellow-600'>
                            <Star size={14} className='fill-current' />
                            <span className='font-medium'>{productData.seller.rating.average.toFixed(1)}</span>
                            <span className='text-neutral-400'>({productData.seller.rating.count})</span>
                          </span>
                        )}
                        {productData.seller.totalRentals > 0 && (
                          <span className='text-neutral-500 dark:text-neutral-400 flex items-center gap-1'>
                            <Truck size={12} /> {productData.seller.totalRentals}+ rentals
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {productData.seller.isVerified && (
                    <span className='bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1'>
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className='flex flex-col gap-4 mb-8'>
              <p className='font-semibold text-neutral-800 dark:text-neutral-200'>Select Size</p>
              <div className='flex gap-3'>
                {productData.sizes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSize(item)}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-medium transition-all duration-200 ${item === size
                      ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-400'
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={productData.status !== 'available'}
              className={`w-full py-4 px-8 rounded-full text-lg font-bold uppercase tracking-wide transition-all duration-300 shadow-xl ${productData.status === 'available'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white hover:shadow-primary-500/40 hover:-translate-y-1'
                : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                }`}
            >
              {productData.status === 'available' ? 'Add to Cart' : 'Currently Unavailable'}
            </button>

            <hr className='my-8 border-neutral-200 dark:border-neutral-800' />

            {/* Benefits List */}
            <div className='grid grid-cols-1 gap-4'>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">Free Delivery & Pickup</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">On all orders above {currency}500</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">Quality Verified</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Dry cleaned and sanitized</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">Flexible Duration</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Rent for 3, 5 or 7 days</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section: Description */}
        <div className='mt-10'>
          <div className='flex gap-6 border-b border-neutral-200 dark:border-neutral-800'>
            <button className='pb-4 border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold'>Description</button>
          </div>
          <div className='py-8 flex flex-col gap-6 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed'>
            <p>
              Elevate your style with this premium rental piece from top designers.
              Meticulously crafted to ensure you stand out at every occasion,
              whether it's a wedding, party, or corporate event.
            </p>
            <p>
              ReVastra ensures every item is professionally cleaned and quality checked before delivery.
              Enjoy the luxury of high-end fashion without the commitment of ownership.
            </p>
          </div>
        </div>

      </div>
    </div>
  ) : (
    <div className='opacity-0'></div> // Invisible loading state to prevent flash
  );
};

export default Product;
