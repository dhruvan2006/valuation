import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowDownTrayIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const options = [
  "BTC-USD",
  "ETH-USD",
  "BNB-USD",
  "SOL-USD",
  "XRP-USD",
  "TON-USD",
  "DOGE-USD",
  "ADA-USD",
  "SHIB-USD",
  "AVAX-USD",
  "TRX-USD",
  "DOT-USD",
  "LINK-USD",
  "BCH-USD",
  "UNI-USD",
  "LTC-USD",
  "NEAR-USD",
  "DAI-USD",
  "LEO-USD",
  "MATIC-USD",
  "PEPE-USD",
  "ICP-USD",
  "KAS-USD",
  "ETC-USD",
  "XMR-USD",
  "APT-USD",
  "FET-USD",
  "RNDR-USD",
  "HBAR-USD",
  "XLM-USD"
]

const OptimalLeverage = () => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cryptoData, setCryptoData] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickers = [
          { "ticker": "BTC-USD", "lev": 12 },
          { "ticker": "ETH-USD", "lev": 8 },
          { "ticker": "SOL-USD", "lev": 7 }
        ];

        const promises = tickers.map(({ ticker, lev }) =>
          axios.post("/api/optimal", { "ticker": ticker, "upper_lev": lev })
            .then(response => ({ ticker, data: response.data }))
        );

        const results = await Promise.all(promises);
        setCryptoData(results)
      } catch (error) {
        console.error('Error fetching data');
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFilteredOptions(options.filter(option => 
      option.toLowerCase().includes(value.toLowerCase())
    ));
    setInputValue(value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
    setShowDropdown(false);
  }

  return (
    <div className='mx-16 pb-10'>
      <div className='text-center mb-4'>
        <h1 className='text-white text-4xl font-semibold mb-1'>Optimal Leverage</h1>
        <div className='text-zinc-300 flex justify-center items-center gap-x-1'>
          <p>Calculations based on <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1664823" target='_blank' className='underline text-blue-500 hover:text-blue-700 font-semibold'>this</a> paper</p>
          <a href="/api/optimal/pdf" target='_blank'><ArrowDownTrayIcon className="h-5 w-5 hover:text-white text-zinc-200 cursor-pointer" /></a>
        </div>
      </div>
      <div className='bg-zinc-900 p-4 rounded-lg mb-10'>
        <div className='flex justify-center items-center gap-x-2 mb-4'>
          <h1 className='text-white text-2xl font-semibold text-center'>Custom Time Duration</h1>
        </div>
        <div className='relative grid grid-cols-1 lg:grid-cols-4 gap-x-4'>
          <div className='flex flex-col gap-y-2 col-span-2'>
            <label className='text-white ml-1 text-sm'>Select your ticker:</label>
            <div className='relative w-full' ref={dropdownRef}>
              <input 
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className='w-full p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                placeholder="Custom tickers are allowed"
                />
              {showDropdown && filteredOptions.length > 0 && (
                <ul className='absolute mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 max-h-48 overflow-auto'>
                  {filteredOptions.map((option, index) => (
                    <li 
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className='p-2 hover:bg-zinc-700 cursor-pointer text-white rounded-lg'
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='flex flex-col gap-y-2'>
            <label className='text-white ml-1 text-sm'>Choose lower lev:</label>
            <div className='relative flex items-center'>
              <button type='button' className='bg-zinc-800 hover:bg-zinc-600 rounded-s-lg p-3 h-[2.6rem] border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500'>
                <PlusIcon className='text-white h-4 w-4' />
              </button>
              <input defaultValue={0} className='bg-zinc-800 border border-zinc-700 h-[2.6rem] text-center text-white text-sm focus:ring-2 focus:ring-zinc-500 block w-full py-2.5 focus:outline-none' />
              <button type='button' className='bg-zinc-800 hover:bg-zinc-600 rounded-e-lg p-3 h-[2.6rem] border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500'>
                <MinusIcon className='text-white h-4 w-4' />
              </button>
            </div>
          </div>
          <div className='flex flex-col gap-y-2'>
            <label className='text-white ml-1 text-sm'>Choose upper lev:</label>
            <div className='relative flex items-center'>
              <button type='button' className='bg-zinc-800 hover:bg-zinc-600 rounded-s-lg p-3 h-[2.6rem] border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500'>
                <PlusIcon className='text-white h-4 w-4' />
              </button>
              <input defaultValue={8} className='bg-zinc-800 border border-zinc-700 h-[2.6rem] text-center text-white text-sm focus:ring-2 focus:ring-zinc-500 block w-full py-2.5 focus:outline-none' />
              <button type='button' className='bg-zinc-800 hover:bg-zinc-600 rounded-e-lg p-3 h-[2.6rem] border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500'>
                <MinusIcon className='text-white h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
        <p className='text-white'>Selected option: {inputValue}</p>
      </div>
      <div className='bg-zinc-900 p-4 rounded-lg'>
        <div className='flex justify-center items-center gap-x-2 mb-4'>
          <h1 className='text-white text-2xl font-semibold text-center'>Current Bullrun</h1>
          <p className='text-zinc-400'>(From <span className='font-semibold'>2023-01-01</span> to <span className='font-semibold'>today</span>)</p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {cryptoData.map(({ ticker, data }) => (
            <Plot
              key={ticker}
              className='w-full h-96'
              data={[
                {
                  x: data.k,
                  y: data.R,
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: 'orange' },
                  name: 'Leverage Efficiency'
                },
                {
                  x: [data.k_max],
                  y: [data.R_max],
                  type: 'scatter',
                  mode: 'markers',
                  marker: { color: 'red', size: 10 },
                  name: 'Optimum Leverage'
                }
              ]}
              layout={{
                showlegend: false,
                title: ticker,
                xaxis: { title: 'Leverage multiple'},//, gridcolor: '#9ca3af' },
                yaxis: { title: 'Daily Reward'},// gridcolor: '#9ca3af' },
                autosize: true,
                plot_bgcolor: 'rgb(39 39 42)',
                paper_bgcolor: 'rgb(39 39 42)',
                font: {
                  color: '#ffffff'
                },
                margin: { l: 70, t: 75, r: 30, b: 75 }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OptimalLeverage;
