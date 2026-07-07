import React from 'react';

const Skeleton = ({ className, variant = 'text' }) => {
    const baseClasses = "bg-neutral-200 animate-pulse rounded";

    const variants = {
        text: "h-4 w-full",
        title: "h-8 w-3/4",
        card: "w-full aspect-[4/5]",
        circle: "w-12 h-12 rounded-full",
        button: "h-10 w-32"
    };

    return (
        <div className={`${baseClasses} ${variants[variant] || ''} ${className || ''}`}></div>
    );
};

export const ProductSkeleton = () => (
    <div className="flex flex-col gap-3">
        <Skeleton variant="card" className="rounded-xl" />
        <Skeleton variant="text" className="w-2/3 mt-1" />
        <Skeleton variant="text" className="w-1/2" />
    </div>
);

export default Skeleton;
