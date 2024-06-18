import React from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

const ScrollBackToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <button className='fixed bottom-3 right-3 rounded-full bg-zinc-800 hover:bg-zinc-900 p-2 border-gray-700 border shadow-md shadow-gray-800/25' onClick={scrollToTop}>
      <ChevronUpIcon className='h-8 w-8 text-gray-200' />
    </button>
  );
}

export default ScrollBackToTop;
