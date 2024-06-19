import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import GitHubIcon from '../github-mark-white.svg';

const Navbar = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleDark = () => {
    setIsDark(!isDark);
  } 

  return (
    <nav className="text-white max-w-5xl bg-black bg-opacity-60 backdrop-blur-sm fixed top-4 left-0 right-0 z-50 rounded-2xl mx-auto px-6 py-3 flex justify-between items-center border-zinc-700 border shadow-md shadow-zinc-800/25">
      <NavLink to='/' className="font-semibold text-white">
        Dhruvan
      </NavLink>
      <ul className="flex space-x-10">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? "text-sm text-white font-semibold" : "text-sm text-zinc-400 font-semibold hover:text-white transition duration-200"}>
            Leverage
          </NavLink>
        </li>
        <li>
          <NavLink to="/optimal" className={({ isActive }) => isActive ? "text-sm text-white font-semibold" : "text-sm text-zinc-400 font-semibold hover:text-white transition duration-200"}>
            Optimal Leverage
          </NavLink>
        </li>
        <li>
          <NavLink to="/valuation" className={({ isActive }) => isActive ? "text-sm text-white font-semibold" : "text-sm text-zinc-400 font-semibold hover:text-white transition duration-200"}>
            Valuation
          </NavLink>
        </li>
        <li>
          <a href="/mpt" className="text-sm text-zinc-400 font-semibold hover:text-white transition duration-200">
            MPT
          </a>
        </li>
        <li>
          <a href="/btc-fv" className="text-sm text-zinc-400 font-semibold hover:text-white transition duration-200">
            Fair Value
          </a>
        </li>
      </ul>
      <div className='flex flex-row space-x-2'>
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