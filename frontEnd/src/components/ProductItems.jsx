import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, BadgeCheck, Star, User } from 'lucide-react';

const ProductItems = ({ id, image, name, price, rental_price, bestseller, date, seller }) => {
    const { currency, addToWishlist, isInWishlist } = useContext(ShopContext);

    // Simple check for "New" badge
    const isNew = Date.now() - date < 7 * 24 * 60 * 60 * 1000;
    const isWishlisted = isInWishlist(id);

    const handleWishlistClick = (e) => {
        e.preventDefault();
        addToWishlist(id);
    };

    // Trust badge based on rentals
    const getBadgeText = (rentals) => {
        if (rentals >= 50) return '💎 Top';
        if (rentals >= 25) return '🔥';
        if (rentals >= 5) return '⭐';
        return null;
    };

    const sellerBadge = seller?.totalRentals ? getBadgeText(seller.totalRentals) : null;

    return (
        <Link
            className='group bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-soft hover:shadow-medium border border-neutral-100 dark:border-neutral-700 transition-all duration-300 transform hover:-translate-y-1 block'
            to={`/product/${id}`}
        >
            {/* Image Container */}
            <div className='relative w-full aspect-[4/5] overflow-hidden bg-neutral-100'>
                <img
                    className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                    src={image[0]}
                    alt={name}
                    loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {bestseller && (
                        <span className="bg-accent-amber text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
                            Best Seller
                        </span>
                    )}
                    {isNew && (
                        <span className="bg-accent-teal text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
                            New
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-20 shadow-sm
                    ${isWishlisted ? 'bg-red-50 text-red-500 opacity-100' : 'bg-white/80 backdrop-blur-sm text-neutral-500 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}`}
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "animate-pulse-once" : ""} />
                </button>

                {/* Overlay Action */}
                <div className='absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center'>
                    <span className="text-white text-sm font-medium flex items-center gap-1">
                        View Details <ArrowRight size={14} />
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className='p-4'>
                <h3 className='text-neutral-800 dark:text-neutral-200 font-medium text-base truncate mb-1 group-hover:text-primary-500 transition-colors'>{name}</h3>

                {/* Seller Info */}
                {seller && (
                    <div className='flex items-center gap-2 mb-2 text-xs'>
                        <div className='flex items-center gap-1 text-neutral-500 dark:text-neutral-400'>
                            <User size={12} />
                            <span className='truncate max-w-[100px]'>{seller.shopName || seller.name || 'Seller'}</span>
                            {seller.isVerified && <BadgeCheck size={12} className="text-blue-500" />}
                        </div>
                        {seller.rating?.average > 0 && (
                            <div className='flex items-center gap-0.5 text-yellow-600'>
                                <Star size={10} className="fill-current" />
                                <span>{seller.rating.average.toFixed(1)}</span>
                            </div>
                        )}
                        {sellerBadge && <span className='text-[10px]'>{sellerBadge}</span>}
                    </div>
                )}

                <div className='flex items-end justify-between mt-2'>
                    <div>
                        <p className='text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-semibold'>Rental Price</p>
                        <div className="flex items-baseline gap-1">
                            <span className='text-lg font-bold text-primary-600 dark:text-primary-400'>{currency}{rental_price}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">/day</span>
                        </div>
                    </div>
                    {price && (
                        <div className="text-right">
                            <p className='text-[10px] text-neutral-400 dark:text-neutral-500'>Retail</p>
                            <p className='text-xs text-neutral-400 dark:text-neutral-500 line-through decoration-neutral-300'>{currency}{price}</p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductItems;
