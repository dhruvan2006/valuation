import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import DatePicker from '../components/DatePicker';

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
  const [indicatorData, setIndicatorData] = useState([]);

  // Fetch Bitcoin Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/valuation/bitcoin', { params: { startDate, endDate }});
        setBitcoinData(response.data);
      } catch (error) {
        console.error('Error fetching z scores:', error);
      }
    }
    fetchData();
  }, [startDate, endDate]);

  // Fetch Z Score Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/valuation/', { params: { startDate, endDate }});
        setZScoreData(response.data);
      } catch (error) {
        console.error('Error fetching z scores:', error);
      }
    }
    fetchData();
  }, [startDate, endDate]);

  // Fetch individual indicator data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = indicators.map(async (indicator) => {
          const encodedIndicator = encodeURIComponent(indicator);
          const response = await axios.get(`/api/valuation/indicator/${encodedIndicator}`, { params: { startDate, endDate }});
          return response.data;
        });

        const results = await Promise.all(requests);

        const combinedData = results.map((data, index) => ({
          name: indicators[index],
          ...data
        }));

        setIndicatorData(combinedData);
      } catch (error) {
        console.error('Error fetching indicator data:', error);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  const toggleFullscreen = (plotId) => {
    const element = document.getElementById(plotId);
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err.message);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      {/* Main plot */}
      <div className='mx-4 md:mx-16 mb-10'>
        <div className='text-center mb-4'>
          <h1 className='text-white text-4xl font-semibold'>Valuation</h1>
          <p className='text-zinc-300'>Combine various stationary time series together to achieve a full cycle indicator for Bitcoin</p>
        </div>
        <div className='text-center w-full h-[30rem] relative mb-4'>
          <div className='p-2 absolute top-0 right-0 z-10'>
            <ArrowsPointingOutIcon className='h-6 w-6  text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen('main-plot')} />
          </div>
          <div className='w-full h-full' id='main-plot'>
            <Plot
              id='main-plot'
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
      <div className='px-4 md:px-16 pb-10 bg-zinc-900'>
        <div className='text-center py-5 '>
          <h2 className='font-semibold text-white text-2xl'>Indicators</h2>
          <p className='text-zinc-300 text-sm'>The various components of the above metric (with links to their source)</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {indicatorData.map((indicator) => (
            <div key={indicator.name} className='bg-zinc-900 border-zinc-700 border rounded-sm text-zinc-200 text-center divide-y divide-zinc-700 hover:shadow-md hover:shadow-zinc-700/25'>
              <div className='p-4 flex justify-between items-center'>
                {indicator.source === 'CheckOnChain' ? (
                  <a href={indicator.url} target='_blank' referrerPolicy='no-referrer'><img alt='CheckOnChain Logo' src='/checkonchain.png' className='h-6 w-6' /></a>
                ) : indicator.source === 'WooCharts' ? (
                  <a href={indicator.url} target='_blank' referrerPolicy='no-referrer'><img alt='WooCharts Logo' src='/woocharts.png' className='h-6 w-6' /></a>
                ) : indicator.source === 'LookIntoBitcoin' ? (
                  <a href={indicator.url} target='_blank' referrerPolicy='no-referrer'><img alt='LookIntoBitcoin Logo' src='/lookintobitcoin.png' className='h-6 w-6' /></a>
                ) : indicator.source === 'ChainExposed' ? (
                  <a href={indicator.url} target='_blank' referrerPolicy='no-referrer'><img alt='ChainExposed Logo' src='/chainexposed.png' className='h-6 w-6' /></a>
                ) : (
                  <a href={indicator.url} target='_blank' referrerPolicy='no-referrer'><img alt='Cryptoquant Logo' src='/cryptoquant.png' className='h-6 w-6' /></a>
                )}
                <h2 className='font-semibold'><a href={indicator.url} target='_blank' referrerPolicy='no-referrer'>{indicator.name}</a></h2>
                <ArrowsPointingOutIcon className='h-5 w-5 text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen(`plot-${indicator.name}`)} />
              </div>
              <div className='w-full h-96 mb-3' id={`plot-${indicator.name}`}>
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
                      name: indicator.name,
                      x: indicator.dates,
                      y: indicator.values,
                      type: 'scatter',
                      mode: 'lines',
                      marker: { color: indicator.source === 'CheckOnChain' ? 'orange' :  indicator.source === 'WooCharts' ? 'cd0fcd' : indicator.source === 'LookIntoBitcoin' ? '19a42e' : indicator.source === 'ChainExposed' ? 'b64171' : '321fa1' },
                      yaxis: 'y2'
                    }
                  ]}
                  layout={{
                    title: indicator.title,
                    xaxis: { title: 'Date' },
                    yaxis: { title: 'Bitcoin' , type: 'log', side: 'left' },
                    yaxis2: { title: indicator.name, overlaying: 'y', side: 'right' },
                    plot_bgcolor: 'rgb(24, 24, 27)',
                    paper_bgcolor: 'rgb(24, 24, 27)',
                    font: {
                      color: '#ffffff'
                    },
                    margin: { t: 50, r: 60, b: 40, l: 60 },
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
          ))}
        </div>
      </div>
    </>
  );
} 

export default Valuation;
