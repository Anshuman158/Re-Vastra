import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

const SearchBar = () => {
  // Destructure values from the context
  const { search, setSearch } = useContext(ShopContext);

  // Get current location
  const location = useLocation();

  // Show search bar only on the Collection page
  const showSearchBar = location.pathname === '/collection';

  return showSearchBar ? (
    <div className='border-t border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-center' >
      <div className='inline-flex items-center justify-center border border-neutral-300 dark:border-neutral-600 px-5 py-2 my-5 mx-5 rounded-full w-3/4 sm:w-1/2 bg-white dark:bg-neutral-800'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='flex-1 outline-none bg-transparent text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500'
          type="text"
          placeholder='Search'
        />
        <img className='w-4 dark:invert' src={assets?.search_icon || 'fallback-icon.png'} alt="Search icon" />
      </div>
    </div>
  ) : null;
}

export default SearchBar;
