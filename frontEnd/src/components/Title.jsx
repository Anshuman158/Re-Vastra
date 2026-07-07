import React from 'react';

const Title = ({ text1, text2 }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
      <p className="font-display text-2xl sm:text-3xl text-neutral-500 font-light flex gap-2 items-center">
        {text1}
        <span className="text-neutral-800 font-bold">{text2}</span>
      </p>
      <div className="w-12 h-[2px] bg-primary-500 rounded-full sm:ml-4"></div>
    </div>
  );
};

export default Title;
