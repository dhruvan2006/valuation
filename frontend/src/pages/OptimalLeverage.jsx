import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import DatePicker from '../components/DatePicker';
import NumberInput from '../components/NumberInput';
import WarningMessage from '../components/WarningMessage';

const options = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "XRP",
  "TON11419",
  "DOGE",
  "ADA",
  "SHIB",
  "AVAX",
  "TRX",
  "DOT",
  "LINK",
  "BCH",
  "UNI7083",
  "LTC",
  "NEAR",
  "LEO",
  "MATIC",
  "PEPE24478",
  "ICP",
  "KAS",
  "ETC",
  "XMR",
  "APT21794",
  "FET",
  "RNDR",
  "HBAR",
  "XLM"
]

const OptimalLeverage = () => {
  const [inputValue, setInputValue] = useState('ETH');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fees, setFees] = useState(2.);
  const [lowerLev, setLowerLev] = useState(0.);
  const [upperLev, setUpperLev] = useState(8.);
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-06-19');
  const [tickerData, setTickerData] = useState({});
  const [currentCycleData, setCurrentCycleData] = useState([]);
  const [lastCycleData, setLastCycleData] = useState([]);
  const [lastLastCycleData, setLastLastCycleData] = useState([]);
  const dropdownRef = useRef(null);

  // Handle getting data for the custom ticker
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/optimal", { "ticker": inputValue, "fees": fees, "start_date": startDate, "end_date": endDate, "lower_lev": lowerLev, "upper_lev": upperLev });
        setTickerData(response.data);
      } catch (error) {
        console.error('Error fetching data');
      }
    }
    fetchData();
  }, [inputValue, fees, lowerLev, upperLev, startDate, endDate]);

  // Functionality for custom ticker DROPDOWN
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

  // Functionality for custom ticker FEES
  const handleFeesChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFees(value);
    }
  };

  // Functionality for custom ticker LOWER LEV/UPPER LEV
  const handleDecrementLower = () => {
      setLowerLev(lowerLev - 1);
  }

  const handleIncrementLower = () => {
    setLowerLev(lowerLev + 1);
  }

  const handleDecrementUpper = () => {
      setUpperLev(upperLev - 1);
  }

  const handleIncrementUpper = () => {
    setUpperLev(upperLev + 1);
  }

  // Handle getting data for CURRENT BULL RUN
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickers = [
          { "ticker": "BTC", "upperLev": 12 },
          { "ticker": "ETH", "upperLev": 8 },
          { "ticker": "SOL", "upperLev": 7 }
        ];

        const promises = tickers.map(({ ticker, upperLev }) =>
          axios.post("/api/optimal", { "ticker": ticker, "upper_lev": upperLev })
            .then(response => ({ ticker, data: response.data }))
        );

        const results = await Promise.all(promises);
        setCurrentCycleData(results);
      } catch (error) {
        console.error('Error fetching data');
      }
    }

    fetchData();
  }, []);

  // Handle getting data for LAST BULL RUN
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickers = [
          { "ticker": "BTC", "upperLev": 12 },
          { "ticker": "ETH", "upperLev": 12 },
          { "ticker": "SOL", "upperLev": 6 }
        ];

        const promises = tickers.map(({ ticker, upperLev }) =>
          axios.post("/api/optimal", { "ticker": ticker, "start_date": "2020-04-24", "end_date": "2021-05-17", "upper_lev": upperLev })
            .then(response => ({ ticker, data: response.data }))
        );

        const results = await Promise.all(promises);
        setLastCycleData(results);
      } catch (error) {
        console.error('Error fetching data');
      }
    }

    fetchData();
  }, []);

  // Handle getting data for LAST LAST BULL RUN
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickers = [
          { "ticker": "BTC", "upperLev": 9 }
        ];

        const promises = tickers.map(({ ticker, upperLev }) =>
          axios.post("/api/optimal", { "ticker": ticker, "start_date": "2015-07-03", "end_date": "2018-01-12", "upper_lev": upperLev })
            .then(response => ({ ticker, data: response.data }))
        );

        const results = await Promise.all(promises);
        setLastLastCycleData(results);
      } catch (error) {
        console.error('Error fetching data');
      }
    }

    fetchData();
  }, []);

  return (
    <div className='mx-4 md:mx-16 pb-10'>
      <div className='text-center mb-4'>
        <h1 className='text-white text-4xl font-semibold mb-1'>Optimal Leverage</h1>
        <div className='text-zinc-300 flex justify-center items-center gap-x-1'>
          <p>Calculations based on <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1664823" target='_blank' className='underline text-blue-500 hover:text-blue-700 font-semibold'>this</a> paper</p>
          <a href="/api/optimal/pdf" target='_blank'><ArrowDownTrayIcon className="h-5 w-5 hover:text-white text-zinc-200 cursor-pointer" /></a>
        </div>
      </div>

      {/* Warning */}
      <WarningMessage />

      {/* Custom ticker */}
      <div className='bg-zinc-900 p-5 rounded-lg mb-10'>
        <div className='flex justify-center items-center gap-2 mb-4'>
          <h1 className='text-white text-2xl font-semibold text-center'>Custom Ticker</h1>
        </div>
        <div className='relative grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4'>
          <div className='flex flex-col gap-2 col-span-2'>
            <label className='text-white ml-1 text-sm'>Select your ticker:</label>
            <div className='relative w-full' ref={dropdownRef}>
              <input 
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className='w-full p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                placeholder='BTC'
                />
              {showDropdown && filteredOptions.length > 0 && (
                <ul className='absolute mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 max-h-64 overflow-auto'>
                  {filteredOptions.map((option, index) => (
                    <li 
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className='m-1 p-2 hover:bg-zinc-700 cursor-pointer text-white rounded-lg'
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <label className='text-white ml-1 text-sm'>Annual fees:</label>
            <div className='relative flex items-center'>
              <input
                type='text'
                className='w-full py-2 px-1 rounded-s-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 text-center z-10'
                value={fees}
                onChange={handleFeesChange}
              />
              <div className='py-2 px-3.5 rounded-e-lg bg-zinc-800 text-white border border-zinc-700'>
                <span>%</span>
              </div>
            </div>
          </div>
          <div className='md:col-span-1 col-span-2 flex flex-col gap-2'>
            <NumberInput
              label='Choose lower lev:'
              value={lowerLev}
              onIncrement={handleIncrementLower}
              onDecrement={handleDecrementLower}
            />
          </div>
          <div className='md:col-span-1 col-span-2 flex flex-col gap-2'>
            <NumberInput
              label='Choose upper lev:'
              value={upperLev}
              onIncrement={handleIncrementUpper}
              onDecrement={handleDecrementUpper}
            />
          </div>
          <div className='flex flex-col gap-2 md:col-span-1 col-span-2'>
            <DatePicker label="Start Date:" selectedDate={startDate} onChange={setStartDate} />
          </div>
          <div className='flex flex-col gap-2 md:col-span-1 col-span-2'>
            <DatePicker label="End Date:" selectedDate={endDate} onChange={setEndDate} />
          </div>
        </div>

        <div className='flex flex-col md:flex-row space-y-5 md:space-x-5 md:space-y-0 mt-5 w-full'>
          <Plot
            className='w-full h-96'
            data={[
              {
                x: tickerData.k,
                y: tickerData.R,
                type: 'scatter',
                mode: 'lines',
                marker: { color: 'orange' },
                name: 'Leverage Efficiency'
              },
              {
                x: tickerData.k,
                y: tickerData.R_fees,
                type: 'scatter',
                mode: 'lines',
                line: { dash: 'dash', color: 'white', width: 1 },
                name: 'Accounted for fees'
              },
              {
                x: [tickerData.k_max],
                y: [tickerData.R_max],
                type: 'scatter',
                mode: 'markers',
                marker: { color: 'red', size: 10 },
                name: 'Optimum Leverage'
              }
            ]}
            layout={{
              showlegend: false,
              title: 'Optimum leverage',
              xaxis: { title: 'Leverage multiple' },//, gridcolor: '#9ca3af' },
              yaxis: { title: 'Daily Return' },// gridcolor: '#9ca3af' },
              autosize: true,
              plot_bgcolor: 'rgb(39 39 42)',
              paper_bgcolor: 'rgb(39 39 42)',
              font: {
                color: '#ffffff'
              },
              margin: { l: 70, t: 75, r: 30, b: 75 },
            }}
            useResizeHandler={true}
          />
          <Plot
            className='w-full h-96'
            data={[
              {
                x: tickerData.x,
                y: tickerData.y,
                type: 'scatter',
                mode: 'lines',
                marker: { color: 'orange' },
                name: 'Leverage Efficiency'
              },
            ]}
            layout={{
              showlegend: false,
              title: 'Price',
              xaxis: { title: 'Date' },//, gridcolor: '#9ca3af' },
              yaxis: { title: tickerData.ticker },// gridcolor: '#9ca3af' },
              autosize: true,
              plot_bgcolor: 'rgb(39 39 42)',
              paper_bgcolor: 'rgb(39 39 42)',
              font: {
                color: '#ffffff'
              },
              margin: { l: 70, t: 75, r: 30, b: 75 }
            }}
            useResizeHandler={true}
          />
        </div>
      
        {Object.keys(tickerData).length === 0 && tickerData.constructor === Object ? '' : <p className='text-white mt-5 text-center'>Maximum permissible leverage <span className='font-semibold'>{tickerData.k_max.toFixed(2)}</span></p>}
      </div>

      {/* Current bullrun */}
      <div className='bg-zinc-900 p-4 rounded-lg mb-10'>
        <div className='flex justify-center items-center gap-x-2 mb-4'>
          <h1 className='text-white text-2xl font-semibold text-center'>Current Bullrun</h1>
          <p className='text-zinc-400'>(From <span className='font-semibold'>2023-01-01</span> to <span className='font-semibold'>today</span>)</p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {currentCycleData.map(({ ticker, data }) => (
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
                margin: { l: 70, t: 75, r: 30, b: 75 },
                annotations: [
                  {
                    x: data.k_max,
                    y: data.R_max,
                    xref: 'x',
                    yref: 'y',
                    text: `${data.k_max.toFixed(2)}`,
                    showarrow: true,
                    arrowhead: 2,
                    ax: 0,
                    ay: -40
                  }
                ]
              }}
              useResizeHandler={true}
            />
          ))}
        </div>
      </div>

      {/* Last bullrun */}
      <div className='bg-zinc-900 p-4 rounded-lg mb-10'>
        <div className='flex justify-center items-center gap-x-2 mb-4'>
          <h1 className='text-white text-2xl font-semibold text-center'>Last Bullrun</h1>
          <p className='text-zinc-400'>(From <span className='font-semibold'>2020-04-24</span> to <span className='font-semibold'>2021-05-17</span>)</p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {lastCycleData.map(({ ticker, data }) => (
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
                margin: { l: 70, t: 75, r: 30, b: 75 },
                annotations: [
                  {
                    x: data.k_max,
                    y: data.R_max,
                    xref: 'x',
                    yref: 'y',
                    text: `${data.k_max.toFixed(2)}`,
                    showarrow: true,
                    arrowhead: 2,
                    ax: 0,
                    ay: -40
                  }
                ]
              }}
              useResizeHandler={true}
            />
          ))}
        </div>
      </div>

      {/* Last last bullrun */}
      <div className='bg-zinc-900 p-4 rounded-lg'>
        <div className='flex justify-center items-center gap-x-2 mb-4'>
          <h1 className='text-white text-2xl font-semibold text-center'>Last last Bullrun</h1>
          <p className='text-zinc-400'>(From <span className='font-semibold'>2015-07-03</span> to <span className='font-semibold'>2018-01-12</span>)</p>
        </div>
        <div className=''>
          {lastLastCycleData.map(({ ticker, data }) => (
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
                margin: { l: 70, t: 75, r: 30, b: 75 },
                annotations: [
                  {
                    x: data.k_max,
                    y: data.R_max,
                    xref: 'x',
                    yref: 'y',
                    text: `${data.k_max.toFixed(2)}`,
                    showarrow: true,
                    arrowhead: 2,
                    ax: 0,
                    ay: -40
                  }
                ]
              }}
              useResizeHandler={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OptimalLeverage;
