import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid';

type bitcoinData = {
  dates: Array<string>;
  values: Array<number>;
}

type IndicatorPlotProps = {
  indicator: string;
  bitcoinData: bitcoinData;
  startDate: string;
  endDate: string;
}

type IndicatorData = {
  name: string;
  dates: Array<string>;
  values: Array<number>;
  source: string;
  url: string;
}

const IndicatorPlot: React.FC<IndicatorPlotProps> = ({ indicator, bitcoinData, startDate, endDate }) => {
  const [indicatorData, setIndicatorData] = useState<IndicatorData>();
  const plotRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const prevDatesRef = useRef({ startDate, endDate });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
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
    const datesChanged = prevDatesRef.current.startDate !== startDate || prevDatesRef.current.endDate !== endDate;

    if (isVisible && (!hasLoaded || datesChanged)) {
      const fetchData = async () => {
        try {
          const encodedIndicator = encodeURIComponent(indicator);
          const response = await axios.get(`/api/valuation/indicator/${encodedIndicator}`, { params: { startDate, endDate }});
          setIndicatorData(response.data);
          setHasLoaded(true);
          prevDatesRef.current = { startDate, endDate };
        } catch (error) {
          console.error('Error fetching indicator data:', error);
        }
      };
      fetchData();
    }
  }, [isVisible, indicator, startDate, endDate, hasLoaded]);

  const toggleFullscreen = () => {
    const element = plotRef.current;
    if (element) {
      if (!document.fullscreenElement) {
        element.requestFullscreen().catch((err: Error) => {
          console.error('Error attempting to enable full-screen mode:', err.message);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Return the placeholder if not loaded yet
  if (!indicatorData) {
    return (
      <div className='bg-zinc-900 border-zinc-700 border rounded-sm text-zinc-200 text-center divide-y divide-zinc-700 hover:shadow-md hover:shadow-zinc-700/25'>
      <div className='p-4 flex justify-between items-center'>
        <div className='h-6 w-6' />
        <h2 className='font-semibold underline underline-offset-4 text-blue-500 hover:text-blue-600'>{indicator}</h2>
        <ArrowsPointingOutIcon className='h-5 w-5 text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen()} />
      </div>
      <div className='w-full h-96 mb-3' ref={plotRef}>
        <div className='w-full h-full' />
      </div>
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
        <h2 className='font-semibold'><a href={indicatorData.url} target='_blank' referrerPolicy='no-referrer' className='underline underline-offset-4 text-blue-500 hover:text-blue-600'>{indicatorData.name}</a></h2>
        <ArrowsPointingOutIcon className='h-5 w-5 text-zinc-300 hover:text-white transition duration-200' onClick={() => toggleFullscreen()} />
      </div>
      <div className='w-full h-[60vh] mb-3' ref={plotRef}>
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