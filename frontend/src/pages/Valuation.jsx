import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import DatePicker from '../components/DatePicker';
import IndicatorPlot from '../components/IndicatorPlot';

const indicators = ['AVIV Z-Score', 'VDD Multiple', 'index', 'mvrv_z', 'Oscillator', 'MVRV'];//, 'Adjusted_MVRV'];

const getTodayAsString = () => {
  const today = new Date();
  let year = today.getFullYear();
  let month = (today.getMonth() + 1).toString().padStart(2, '0');
  let day = today.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const Valuation = () => {
  const [bitcoinData, setBitcoinData] = useState({});
  const [zScoreData, setZScoreData] = useState({});
  const [startDate, setStartDate] = useState('2016-01-01');
  const [endDate, setEndDate] = useState(getTodayAsString());
  const [debouncedStartDate, setDebouncedStartDate] = useState(startDate);
  const [debouncedEndDate, setDebouncedEndDate] = useState(endDate);
  const plotRef = useRef(null);

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
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err.message);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Debounce startDate
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStartDate(startDate);
    }, 300);

    return () => {
      clearTimeout(handler);
    }
  }, [startDate]);

  // Debounce endDate
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEndDate(endDate);
    }, 300);

    return () => {
      clearTimeout(handler);
    }
  }, [endDate]);

  return (
    <>
      {/* Main plot */}
      <div className='mx-4 md:mx-10 lg:mx-16 mb-10'>
        <div className='text-center mb-4'>
          <h1 className='text-white text-4xl font-semibold'>Valuation</h1>
          <p className='text-zinc-300'>Combine various stationary time series together to achieve a full cycle indicator for Bitcoin</p>
        </div>
        <div className='text-center w-full h-[30rem] relative mb-4'>
          <div className='p-2 absolute top-0 right-0 z-10'>
            <ArrowsPointingOutIcon className='h-6 w-6  text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen('main-plot')} />
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
                showlegend: false
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
