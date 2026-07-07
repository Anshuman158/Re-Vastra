import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItems from '../components/ProductItems';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const { products, wishlist } = useContext(ShopContext);

    // Filter products that are in the wishlist
    const wishlistProducts = products.filter(product => wishlist.includes(product._id));

    return (
        <div className='container-custom pt-10 pb-20 min-h-[80vh]'>
            <div className='mb-10 text-center'>
                <Title text1={'MY'} text2={'WISHLIST'} />
            </div>

            {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                    <div className="w-20 h-20 bg-white dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                        <Heart size={32} className="text-neutral-400" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200 mb-2">Your wishlist is empty</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8">Save items you love to revisit them later.</p>
                    <Link to="/collection" className="btn-primary inline-flex items-center gap-2">
                        Explore Collection <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10'>
                    {wishlistProducts.map((item, index) => (
                        <ProductItems
                            key={index}
                            id={item._id}
                            image={item.image}
                            name={item.name}
                            price={item.price}
                            rental_price={item.rental_price}
                            bestseller={item.bestseller}
                            date={item.date}
                            seller={item.seller}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
