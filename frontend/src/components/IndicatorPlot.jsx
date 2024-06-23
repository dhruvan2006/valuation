import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid';

const IndicatorPlot = ({ indicator, bitcoinData, startDate, endDate }) => {
  const [indicatorData, setIndicatorData] = useState(null);
  const plotRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (plotRef.current) {
      observer.observe(plotRef.current);
    }

    return () => {
      if (plotRef.current) {
        observer.unobserve(plotRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const fetchData = async () => {
        try {
          const encodedIndicator = encodeURIComponent(indicator);
          const response = await axios.get(`/api/valuation/indicator/${encodedIndicator}`, { params: { startDate, endDate }});
          setIndicatorData(response.data);
        } catch (error) {
          console.error('Error fetching indicator data:', error);
        }
      };
      fetchData();
    }
  }, [isVisible, indicator, startDate, endDate]);

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

  // Return the placeholder if not loaded yet
  if (!isVisible || !indicatorData) {
    return (
      <div ref={plotRef} className="w-full h-full bg-zinc-800 animate-pulse rounded-sm">
        {/* header */}
        <div className="p-4 flex items-center justify-between">
          <div className="h-7 w-7 bg-zinc-700 rounded-full"></div>
          <div className="h-5 w-1/3 bg-zinc-700 rounded"></div>
          <div className="h-6 w-6 bg-zinc-700 rounded-sm"></div>
        </div>

        {/* plot area */}
        <div className="m-4 mt-2 h-80 w-auto bg-zinc-700"></div>
      </div>
    );
  }

  return (
    <div className='bg-zinc-900 border-zinc-700 border rounded-sm text-zinc-200 text-center divide-y divide-zinc-700 hover:shadow-md hover:shadow-zinc-700/25'>
      <div className='p-4 flex justify-between items-center'>
        {indicatorData.source === 'CheckOnChain' ? (
          <a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer'><img alt='CheckOnChain Logo' src='/checkonchain.png' className='h-6 w-6' /></a>
        ) : indicatorData.source === 'WooCharts' ? (
          <a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer'><img alt='WooCharts Logo' src='/woocharts.png' className='h-6 w-6' /></a>
        ) : indicatorData.source === 'LookIntoBitcoin' ? (
          <a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer'><img alt='LookIntoBitcoin Logo' src='/lookintobitcoin.png' className='h-6 w-6' /></a>
        ) : indicatorData.source === 'ChainExposed' ? (
          <a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer'><img alt='ChainExposed Logo' src='/chainexposed.png' className='h-6 w-6' /></a>
        ) : (
          <a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer'><img alt='Cryptoquant Logo' src='/cryptoquant.png' className='h-6 w-6' /></a>
        )}
        <h2 className='font-semibold'><a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer'>{indicatorData.name}</a></h2>
        <ArrowsPointingOutIcon className='h-5 w-5 text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen(`plot-${indicatorData.name}`)} />
      </div>
      <div className='w-full h-96 mb-3' ref={plotRef}>
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
              name: indicatorData.name,
              x: indicatorData.dates,
              y: indicatorData.values,
              type: 'scatter',
              mode: 'lines',
              marker: { color: indicatorData.source === 'CheckOnChain' ? 'orange' :  indicatorData.source === 'WooCharts' ? 'cd0fcd' : indicatorData.source === 'LookIntoBitcoin' ? '19a42e' : indicatorData.source === 'ChainExposed' ? 'b64171' : '321fa1' },
              yaxis: 'y2'
            }
          ]}
          layout={{
            title: indicatorData.title,
            xaxis: { title: 'Date' },
            yaxis: { title: 'Bitcoin' , type: 'log', side: 'left' },
            yaxis2: { title: indicatorData.name, overlaying: 'y', side: 'right' },
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
  )
};

export default IndicatorPlot;