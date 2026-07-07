import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import ProductItems from '../components/ProductItems';
import Title from '../components/Title';
import { Filter, X, ChevronDown } from 'lucide-react';
import { ProductSkeleton } from '../components/Skeleton';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [isLoading, setIsLoading] = useState(true);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setCategory(prev => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubCategory(prev => [...prev, e.target.value]);
    }
  };

  const togglePriceRange = (e, min, max) => {
    if (e.target.checked) {
      setPriceRanges(prev => [...prev, { min, max }]);
    } else {
      setPriceRanges(prev => prev.filter(range => range.min !== min || range.max !== max));
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    if (priceRanges.length > 0) {
      productsCopy = productsCopy.filter(item => {
        return priceRanges.some(range => item.rental_price >= range.min && item.rental_price <= range.max);
      });
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => (a.rental_price - b.rental_price))); // Sort by rental price
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => (b.rental_price - a.rental_price)));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    // Simulate loading or wait for products
    if (products.length > 0) {
      applyFilter();
      setIsLoading(false);
    } else {
      // Fallback or still loading if products are being fetched asynchronously
      // In this context, products might be empty initially
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [category, subCategory, search, showSearch, products, priceRanges]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='container-custom pt-10 pb-20 border-t border-neutral-200 dark:border-neutral-800'>

      {/* Sticky Filter Toggle for Mobile */}
      <div className="flex sm:hidden justify-between items-center mb-6 sticky top-[70px] z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4 rounded-xl shadow-soft border border-neutral-100 dark:border-neutral-800">
        <p className='font-display font-semibold text-lg text-neutral-800 dark:text-neutral-200'>Filters</p>
        <button onClick={() => setShowFilter(!showFilter)} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
          {showFilter ? <X size={20} /> : <Filter size={20} />}
        </button>
      </div>

      <div className='flex flex-col sm:flex-row gap-8'>

        {/* Filter Sidebar */}
        <div className={`min-w-64 bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700 h-fit sticky top-24 transition-all duration-300 ease-in-out
                ${showFilter ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden mb-0'} sm:max-h-screen sm:opacity-100 sm:block sm:mb-0 z-20`}>

          <div className="flex items-center gap-2 mb-6">
            <Filter size={18} className="text-primary-500" />
            <p className='text-lg font-display font-bold text-neutral-800 dark:text-neutral-200'>Filters</p>
          </div>

          {/* Categories */}
          <div className='mb-6'>
            <p className='text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-3'>Categories</p>
            <div className='space-y-2'>
              {['Men', 'Women', 'Unisex'].map((cat) => (
                <label key={cat} className='flex items-center gap-3 cursor-pointer group'>
                  <input className='w-4 h-4 accent-primary-500 rounded border-gray-300' type="checkbox" value={cat} onChange={toggleCategory} />
                  <span className='text-neutral-600 dark:text-neutral-400 group-hover:text-primary-500 transition-colors'>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-neutral-100 dark:bg-neutral-700 my-4"></div>

          {/* SubCategories */}
          <div>
            <p className='text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3 dark:text-neutral-200'>Type</p>
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {['Topwear', 'Bottomwear', 'Ethnic', 'Dresses', 'Outerwear', 'Winterwear', 'Footwear', 'Bags', 'Jewelry', 'Other'].map((sub) => (
                <label key={sub} className='flex items-center gap-3 cursor-pointer group'>
                  <input className='w-4 h-4 accent-primary-500 rounded border-gray-300' type="checkbox" value={sub} onChange={toggleSubCategory} />
                  <span className='text-neutral-600 dark:text-neutral-400 group-hover:text-primary-500 transition-colors'>{sub}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-neutral-100 my-4 dark:bg-neutral-800"></div>

          {/* Price Range */}
          <div>
            <p className='text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3 dark:text-neutral-200'>Price Range</p>
            <div className='space-y-2'>
              {[
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500 - ₹1000', min: 500, max: 1000 },
                { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                { label: 'Over ₹2000', min: 2000, max: 100000 }
              ].map((range, index) => (
                <label key={index} className='flex items-center gap-3 cursor-pointer group'>
                  <input
                    className='w-4 h-4 accent-primary-500 rounded border-gray-300'
                    type="checkbox"
                    onChange={(e) => togglePriceRange(e, range.min, range.max)}
                  />
                  <span className='text-neutral-600 dark:text-neutral-400 group-hover:text-primary-500 transition-colors'>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Product Grid Area */}
        <div className='flex-1'>
          <div className='flex flex-col sm:flex-row justify-between items-center mb-8 gap-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            {/* Sort Dropdown */}
            <div className="relative">
              <select onChange={(e) => setSortType(e.target.value)}
                className='border border-neutral-200 dark:border-neutral-700 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary-500 bg-white dark:bg-neutral-800 dark:text-neutral-200 shadow-sm cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors appearance-none pr-10'>
                <option value="relevant">Sort by: Relevant</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="high-low">Sort by: High to Low</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10'>
            {isLoading ? (
              Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              filterProducts.length > 0 ? (
                filterProducts.map((item, index) => (
                  <ProductItems key={index} name={item.name} id={item._id} price={item.price} rental_price={item.rental_price} image={item.image} date={item.date} bestseller={item.bestseller} seller={item.seller} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-neutral-400 text-lg">No products found matching your criteria.</p>
                  <button onClick={() => { setCategory([]); setSubCategory([]); }} className="mt-4 text-primary-500 font-medium hover:underline">Clear Filters</button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
