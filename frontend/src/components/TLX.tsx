import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Data, ScatterData } from 'plotly.js';

type TLXProps = {
  assets: Array<string>;
  name: string;
}

type AssetPoint = {
  timestamp: string;
  price: number;
}

type AssetData = {
  [key: string]: Array<AssetPoint>;
}

type RatioData = {
  [key: string]: number;
}

const TLX: React.FC<TLXProps> = ({ assets, name }) => {
  const [selectedAssets, setSelectedAssets] = useState(assets);
  const [assetData, setAssetData] = useState<AssetData>({});

  const [sharpeRatios, setSharpeRatios] = useState({});
  const [sortinoRatios, setSortinoRatios] = useState({});
  const [omegaRatios, setOmegaRatios] = useState({});

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedAssets((prevSelectedAssets) => 
      checked ? [...prevSelectedAssets, name] : prevSelectedAssets.filter(asset => asset !== name)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const data: { [key: string]: any } = {};
      for (const asset of selectedAssets) {
        try {
          const response = await axios.get(`/api/leverage/tlx/asset/${asset}`);
          data[asset] = response.data;
        } catch (error) {
          console.error(`Error fetching data for ${asset}:`, error);
        }
      }
      setAssetData(data);
    };

    if (selectedAssets.length > 0) {
      fetchData();
    }
  }, [selectedAssets]);

  useEffect(() =>  {
    const calculateRatios = () => {
      const sharpe: RatioData = {};
      const sortino: RatioData = {};
      const omega: RatioData = {};
      const threshold = 0;

      for (const asset in assetData) {
        const prices = assetData[asset].map(point => point.price);
        const returns = prices.slice(1).map((price, i) => price / prices[i] - 1);
        const meanReturn = returns.reduce((acc, ret) => acc + ret, 0) / returns.length;

        // i added the n - 1 factor in denominator for stddev
        const stdDev = Math.sqrt(returns.reduce((acc, ret) => acc + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1));
        const downsideDeviation = Math.sqrt(
          returns.filter(ret => ret < 0)
            .reduce((acc, ret) => acc + Math.pow(ret, 2), 0) / (returns.length - 1)
        );

        const num = returns.filter(ret => ret > threshold).reduce((acc, ret) => acc + ret, 0);
        const denom = Math.abs(returns.filter(ret => ret < threshold).reduce((acc, ret) => acc + ret, 0));
        omega[asset] = num / denom;

        sharpe[asset] = meanReturn / stdDev;
        sortino[asset] = meanReturn / downsideDeviation;
      }
      setSharpeRatios(sharpe);
      setSortinoRatios(sortino);
      setOmegaRatios(omega);
    };

    if (Object.keys(assetData).length > 0) {
      calculateRatios();
    }
  }, [assetData]);

  const plotData: Data[] = Object.keys(assetData).map(asset => ({
    x: assetData[asset].map(point => new Date(point.timestamp)),
    y: assetData[asset].map(point => point.price),
    type: 'scatter',
    mode: 'lines',
    name: asset,
  }));

  const sharpeRatioData: any = {
    x: Object.keys(sharpeRatios),
    y: Object.values(sharpeRatios),
    type: 'bar',
    name: 'Sharpe Ratios',
    marker: {
      color: 'd62728'
    }
  };

  const sortinoRatioData: any = {
    x: Object.keys(sortinoRatios),
    y: Object.values(sortinoRatios),
    type: 'bar',
    name: 'Sortino Ratios',
    marker: {
      color: '#ff7f0e'
    }
  };

  const omegaRatioData: any = {
    x: Object.keys(omegaRatios),
    y: Object.values(omegaRatios),
    type: 'bar',
    name: 'Omega Ratios',
    marker: {
      color: '#2ca02c'
    }
  };
  
  const chartLayout = {
    autosize: true,
    plot_bgcolor: '#1b1b1b',
    paper_bgcolor: '#1b1b1b',
    font: {
      color: '#ffffff'
    },
    
  };

  return (
    <div className='flex flex-col flex-grow p-4 mb-10 bg-darkestgray shadow-md rounded-xl'>
      <div className='flex flex-col md:flex-row justify-between items-center ps-3 mb-2'>
        <h1 className='text-gray-100 font-semibold text-xl'>TLX Levered {name}</h1>
        <div className='flex flex-wrap items-center justify-between bg-darkergray py-2 pl-4 rounded-md'>
          {assets.map(asset => (
            <div key={asset} className='mr-4 flex items-center'>
              <input
                type="checkbox"
                name={asset}
                checked={selectedAssets.includes(asset)}
                onChange={handleCheckboxChange}
                className='mr-1'
                />
              <label htmlFor={asset} className='text-md text-gray-100'>{asset}</label>
            </div>
          ))}
        </div>
      </div>

      <div className='flex-grow flex flex-col'>
        {selectedAssets.length > 0 && (
          <div className="my-2">
            <Plot
              data={plotData}
              layout={{ ...chartLayout, title: `TLX Levered ${name}` }}
              useResizeHandler
              className="w-full h-96"
            />
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow'>
          {Object.keys(sharpeRatios).length > 0 && (
            <div className="">
              <Plot
                data={[sharpeRatioData]}
                layout={{ ...chartLayout, title: 'Sharpe Ratios' }}
                useResizeHandler
                className="w-full h-96 lg:h-60"
              />
            </div>
          )}
          {Object.keys(sharpeRatios).length > 0 && (
            <div className="">
              <Plot
                data={[sortinoRatioData]}
                layout={{ ...chartLayout, title: 'Sortino Ratios' }}
                useResizeHandler
                className="w-full h-96 lg:h-60"
              />
            </div>
          )}
          {Object.keys(sharpeRatios).length > 0 && (
            <div className="">
              <Plot
                data={[omegaRatioData]}
                layout={{ ...chartLayout, title: 'Omega Ratios' }}
                useResizeHandler
                className="w-full h-96 lg:h-60"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TLX;