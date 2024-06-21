import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid'

const indicators = ['AVIV Z-Score', 'Mayer Multiple Z']

const Valuation = () => {
  const [zScoreData, setZScoreData] = useState({});
  const [indicatorData, setIndicatorData] = useState([]);

  // Fetch Z Score Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/valuation/');
        setZScoreData(response.data);
      } catch (error) {
        console.error('Error fetching z scores:', error);
      }
    }
    fetchData();
  }, []);

  // Fetch individual indicator data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = indicators.map(async (indicator) => {
          const encodedIndicator = encodeURIComponent(indicator);
          const response = await axios.get(`/api/valuation/indicator/${encodedIndicator}`);
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
  }, []);

  return (
    <>
      <div className='mx-4 md:mx-16'>
        <div className='text-center mb-4'>
          <h1 className='text-white text-4xl font-semibold'>Valuation</h1>
          <p className='text-zinc-300'>Combine various stationary time series together to achieve a full cycle indicator for Bitcoin</p>
        </div>
        <div className='text-center w-full'> {/* bg-zinc-900 p-5 rounded-lg mb-10'> */}
          <Plot
            className='w-full'
            data={[
              {
                x: Object.keys(zScoreData),
                y: Object.values(zScoreData),
                type: 'scatter',
                mode: 'lines',
                marker: { color: 'orange' }
              }
            ]}
            layout={{
              title: 'Ultimate Bitcoin Valuation',
              xaxis: { title: 'Date' },
              yaxis: { title: 'Avg Z Score' },
              plot_bgcolor: 'rgb(39 39 42)',
              paper_bgcolor: 'rgb(39 39 42)',
              font: {
                color: '#ffffff'
              },
            }}
            useResizeHandler={true}
          />  
        </div>
      </div>
      <div className='px-4 md:px-16 py-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {indicatorData.map((indicator) => (
            <div className='bg-zinc-900 border-zinc-700 border rounded-sm text-zinc-200 text-center divide-y divide-zinc-700 shadow-xl shadow-zinc-700/25'>
              <div className='p-4 flex justify-between items-center'>
                <img alt='CheckOnChain Logo' src='src\assets\checkonchain.png' className='h-5 w-5' />
                <h2 className='text-lg'>{indicator.name}</h2>
                <ArrowsPointingOutIcon className='h-5 w-5 text-zinc-300 hover:text-white transition duration-200' />
              </div>
              <Plot
                className='w-full h-96'
                data={[
                  {
                    x: indicator.dates,
                    y: indicator.values,
                    type: 'scatter',
                    mode: 'lines',
                    marker: { color: 'orange' }
                  }
                ]}
                layout={{
                  title: indicator.title,
                  xaxis: { title: 'Date' },
                  yaxis: { title: 'Avg Z Score' },
                  plot_bgcolor: 'rgb(24, 24, 27)',
                  paper_bgcolor: 'rgb(24, 24, 27)',
                  font: {
                    color: '#ffffff'
                  },
                  margin: { t: 50, r: 50, b: 60, l: 60 }
                }}
                useResizeHandler={true}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 

export default Valuation;
