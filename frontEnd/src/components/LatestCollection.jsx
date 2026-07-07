import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItems from './ProductItems';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10)); // Display the latest 10 products
  }, [products]);

  return (
    <div className="my-16 bg-neutral-50 dark:bg-neutral-900/50 py-12">
      {/* Section Title */}
      <div className="text-center mb-12 px-4">
        <Title text1="Latest" text2="Collection" />
        <p className="w-full md:w-3/4 lg:w-1/2 mx-auto text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 mt-4">
          Discover our newest products, crafted with care and designed to meet the latest trends. Explore and find your next favorite!
        </p>
      </div>

      {/* Product Grid */}
      {latestProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 px-6">
          {latestProducts.map((item, index) => (
            <div
              key={item._id || index}
              className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <ProductItems
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
                rental_price={item.rental_price}
                bestseller={item.bestseller}
                date={item.date}
                seller={item.seller}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 dark:text-neutral-400 mt-8">
          <p>No products available in the latest collection.</p>
        </div>
      )}
    </div>
  );
};

export default LatestCollection;
