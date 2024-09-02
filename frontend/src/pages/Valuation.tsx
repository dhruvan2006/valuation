import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import DatePicker from '../components/DatePicker';
import IndicatorPlot from '../components/IndicatorPlot';

type bitcoinData = {
  dates: Array<string>;
  values: Array<number>;
}

type zScoreData = {
  [key: string]: number;
}

const indicators = ['AVIV Z-Score', 'MVRV Z-Score', 'STH-MVRV Z-Score', 'LTH-NUPL', 'Mayer Multiple Z', 'SOPR 7D-EMA', 'Reserve Risk (Adjusted)', 'Difficulty Multiple', 'value-days-destroyed-multiple', 'pi_cycle_top_bottom_indicator', 'index', 'mvrv_z',  'MVRV'];//, 'Adjusted_MVRV', 'IFP', 'sma_nupl_mvrv_avg', 'MVRV_STH', 'sharpe_ratio_365', 'Oscillator'];

const getTodayAsString = () => {
  const today = new Date();
  let year = today.getFullYear();
  let month = (today.getMonth() + 1).toString().padStart(2, '0');
  let day = today.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const Valuation = () => {
  const [bitcoinData, setBitcoinData] = useState<bitcoinData>({ dates: [], values: [] });
  const [zScoreData, setZScoreData] = useState<zScoreData>({});
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState(getTodayAsString());
  const [debouncedStartDate, setDebouncedStartDate] = useState(startDate);
  const [debouncedEndDate, setDebouncedEndDate] = useState(endDate);
  const plotRef = useRef<HTMLDivElement>(null);

  // Last updated display
  const [lastUpdated, setLastUpdated] = useState<Date>();

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const response = await axios.get('api/leverage/lastUpdated');
        const date = new Date(response.data['lastUpdated']);
        setLastUpdated(date);
      } catch (error) {
        console.error('Error fetching last updated time');
      }
    }

    fetchLastUpdated();
  }, []);

  const timeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + ' years ago';
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + ' months ago';
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + ' days ago';
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago';
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago';
    }
    return Math.floor(seconds) + ' seconds ago';
  }  

  // Fetch Bitcoin Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/valuation/bitcoin', { params: { startDate: debouncedStartDate, endDate: debouncedEndDate }});
        setBitcoinData(response.data);
      } catch (error) {
        console.error('Error fetching z scores:', error);
      }
    }
    fetchData();
  }, [debouncedStartDate, debouncedEndDate]);

  // Fetch Z Score Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/valuation/', { params: { startDate: debouncedStartDate, endDate: debouncedEndDate }});
        setZScoreData(response.data);
      } catch (error) {
        console.error('Error fetching z scores:', error);
      }
    }
    fetchData();
  }, [debouncedStartDate, debouncedEndDate]);

  const toggleFullscreen = () => {
    const element = plotRef.current;
    if (element) {
      if (!document.fullscreenElement) {
        element.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable full-screen mode:', err.message);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Debounce startDate and endDate
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStartDate(startDate);
      setDebouncedEndDate(endDate);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [startDate, endDate]);

  return (
    <>
      {/* Main plot */}
      <div className='mx-4 md:mx-10 lg:mx-16 mb-10'>
        <div className='text-center mb-4'>
          <h1 className='text-white text-4xl font-semibold'>Valuation</h1>
          <p className='text-zinc-300'>Last updated: <span className='font-semibold'>{lastUpdated ? timeAgo(lastUpdated) : 'Loading...'}</span></p>
          {/* <p className='text-zinc-300'>Combine various stationary time series together to achieve a full cycle indicator for Bitcoin</p> */}
        </div>
        <div className='text-center w-full h-[70vh] relative mb-4'>
          <div className='p-2 absolute top-0 right-0 z-10'>
            <ArrowsPointingOutIcon className='h-6 w-6  text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen()} />
          </div>
          <div className='w-full h-full' ref={plotRef}>
            <Plot
              className='w-full h-full'
              data={[
                {
                  name: 'BTC',
                  x: bitcoinData.dates,
                  y: bitcoinData.values,
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: 'white' },
                  yaxis: 'y'
                },
                {
                  name: 'Z Score',
                  x: Object.keys(zScoreData),
                  y: Object.values(zScoreData),
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: 'orange' },
                  yaxis: 'y2'
                }
              ]}
              layout={{
                title: 'Ultimate Bitcoin Valuation',
                xaxis: { title: 'Date' },
                yaxis: { title: 'Bitcoin', type: 'log', side: 'left' },
                yaxis2: { title: 'Avg Z Score', overlaying: 'y', side: 'right' },
                plot_bgcolor: 'rgb(39 39 42)',
                paper_bgcolor: 'rgb(39 39 42)',
                font: {
                  color: '#ffffff'
                },
                showlegend: false,
                margin: { t: 70, r: 65, b: 70, l: 65 }
              }}
              config={{
                displayModeBar: false,
                displaylogo: false,
              }}
              useResizeHandler={true}
            />
          </div>
        </div>
          <div className='flex flex-col sm:flex-row justify-center items-center w-full gap-4 md:w-3/4 mx-auto'>
            <DatePicker label="Start Date:" selectedDate={startDate} onChange={setStartDate} />
            <DatePicker label="End Date:" selectedDate={endDate} onChange={setEndDate} />
          </div>
      </div>

      {/* Indicators' plots */}
      <div className='px-4 md:px-10 lg:px-16 pb-10 bg-zinc-900'>
        <div className='text-center py-5 '>
          <h2 className='font-semibold text-white text-2xl'>Indicators</h2>
          <p className='text-zinc-300 text-sm'>The various components of the above metric (with links to their source)</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {indicators.map((indicator) => (
            <IndicatorPlot
              key={indicator}
              indicator={indicator}
              bitcoinData={bitcoinData}
              startDate={debouncedStartDate}
              endDate={debouncedEndDate}
            />
          ))}
        </div>
      </div>
    </>
  );
} 

export default Valuation;
