import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import GitHubIcon from '../assets/github-mark-white.svg';

const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="text-white md:max-w-3xl lg:max-w-5xl bg-black bg-opacity-75 md:bg-opacity-50 backdrop-blur-md fixed top-0 md:top-4 left-0 right-0 z-50 md:rounded-2xl mx-auto px-4 md:px-6 py-4 md:py-2 flex justify-between items-center border-zinc-700 border shadow-md shadow-zinc-800/25">
      <NavLink to='/' className="font-semibold text-white">
        Dhruvan
      </NavLink>
      <div className='md:hidden' onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? (
          <XMarkIcon className='h-7 w-7 text-white' />
        ) : (
          <Bars3Icon className='h-7 w-7 text-white' />
        )}
        </div>
      <ul className={`items-center pb-6 pt-3 px-2 border border-zinc-700 bg-opacity-75 backdrop-blur-md md:bg-opacity-100 md:backdrop-blur-0 md:p-0 md:border-none md:flex md:justify-center md:space-x-10 ${isMobileMenuOpen ? 'block' : 'hidden'} md:flex-row absolute md:static top-[3.8rem] left-0 w-full md:w-auto bg-black md:bg-transparent`}>
        {/* <li className='md:hidden fixed top-6 right-6'>
          <XMarkIcon className='h-7 w-7 text-white' onClick={toggleMobileMenu} />
        </li> */}
        <li className='mb-2 md:mb-0'>
          <NavLink to="/" className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 md:p-0 md:bg-transparent md:hover:bg-transparent ${isActive ? "text-white bg-zinc-700" : "text-zinc-400 hover:text-white hover:bg-zinc-700"}`}>
            Valuation
          </NavLink>
        </li>
        <li className='mb-2 md:mb-0'>
          <NavLink to="/optimal" className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 md:p-0 md:bg-transparent md:hover:bg-transparent ${isActive ? "text-white bg-zinc-700" : "text-zinc-400 hover:text-white hover:bg-zinc-700"}`}>
            Optimal Lev
          </NavLink>
        </li>
        <li className='mb-2 md:mb-0'>
          <NavLink to="/leverage" end className={({ isActive }) => `block text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 md:p-0 md:bg-transparent md:hover:bg-transparent ${isActive ? "text-white bg-zinc-700" : "text-zinc-400 hover:text-white hover:bg-zinc-700"}`}>
            TLX/Toros
          </NavLink>
        </li>
        <li className='mb-2 md:mb-0'>
          <a href="/mpt" className="block text-sm text-zinc-400 font-semibold py-2 px-4 rounded-lg hover:text-white hover:bg-zinc-700 transition duration-200 md:p-0 md:bg-transparent md:hover:bg-transparent">
            MPT
          </a>
        </li>
        <li className='mb-2 md:mb-0'>
          <a href="/btc-fv" className="block text-sm text-zinc-400 font-semibold py-2 px-4 rounded-lg hover:text-white hover:bg-zinc-700 transition duration-200 md:p-0 md:bg-transparent md:hover:bg-transparent">
            Fair Value
          </a>
        </li>
        <hr className='border-zinc-400 my-4 mx-2' />
        <div className='md:hidden flex flex-row space-x-3 px-2'>
          <button className="" onClick={toggleDark}>
            {isDark ? <MoonIcon className='text-zinc-400 hover:text-white h-6 w-6 transition duration-200' /> : <SunIcon className='text-zinc-400 hover:text-white h-6 w-6 transition duration-200' />}
          </button>
          <a href="https://github.com/dhruvan2006" target='_blank' rel="noopener noreferrer" className='relative inline-block'>
            <img src={GitHubIcon} alt="GitHub" className='h-6 w-6 text-zinc-400 hover:text-white transition duration-200' />
            <div className='absolute top-0 left-0 w-full h-full rounded-full bg-black bg-opacity-25 hover:bg-transparent transition duration-200' />
          </a>
        </div>
      </ul>
      <div className='hidden md:flex flex-row space-x-2'>
        <button className="" onClick={toggleDark}>
          {isDark ? <MoonIcon className='text-zinc-400 hover:text-white h-6 w-6 transition duration-200' /> : <SunIcon className='text-zinc-400 hover:text-white h-6 w-6 transition duration-200' />}
        </button>
        <a href="https://github.com/dhruvan2006" target='_blank' rel="noopener noreferrer" className='relative inline-block'>
          <img src={GitHubIcon} alt="GitHub" className='h-6 w-6 text-zinc-400 hover:text-white transition duration-200' />
          <div className='absolute top-0 left-0 w-full h-full rounded-full bg-black bg-opacity-25 hover:bg-transparent transition duration-200' />
        </a>
      </div>
    </nav>
  );
}

export default Navbar;