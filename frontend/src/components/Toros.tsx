import axios from 'axios';
import { Axis, Data, Layout } from 'plotly.js';
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

type TorosProps = {
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

const Toros: React.FC<TorosProps> = ({ assets, name }) => {
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
      const data: AssetData = {};
      for (const asset of selectedAssets) {
        try {
          const response = await axios.get(`/api/leverage/toros/asset/${asset}`);
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

  const plotData: Data[] = Object.keys(assetData).map((asset, index) => {
    return {
      x: assetData[asset].map(point => new Date(point.timestamp)),
      y: assetData[asset].map(point => point.price),
      type: 'scatter',
      mode: 'lines',
      name: asset,
      yaxis: `y${index + 1}`
    };
  });

  const yAxes: any = Object.keys(assetData).map((asset, index) => {
    return {
      title: asset,
      overlaying: index === 0 ? undefined : 'y',
      side: index % 2 === 0 ? 'left' : 'right', // alternate the sides
      showline: true,
      tickfont: { color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})` } // random colours
    };
  });

  const layout: Layout = {
    title: `Toros Levered ${name}`,
    autosize: true,
    // margin: { l: 30, r: 100, t: 70, b: 20 },
    yaxis: yAxes[0], // primary yaxis
    ...yAxes.slice(1).reduce((acc: any, yaxis: any, index: any) => {
      (acc as { [key: string]: any })[`yaxis${index + 2}`] = yaxis; // yaxis2, yaxis3, ...
      return acc;
    }, {}),
    plot_bgcolor: '#1b1b1b',
    paper_bgcolor: '#1b1b1b',
    font: {
      color: '#ffffff'
    },
  };

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

  return (
    <div className='flex flex-col flex-grow p-4 mb-10 bg-darkestgray shadow-md rounded-xl'>
      <div className='flex flex-col md:flex-row justify-between items-center ps-3 mb-2'>
        <h1 className='text-gray-100 font-semibold text-xl'>Toros Levered {name}</h1>
        <div className='flex flex-wrap items-center justify-between bg-darkergray py-2 pl-4 rounded-md'>
          {assets.map(asset => (
            <div key={asset} className='mr-4 flexitems-center'>
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
              layout={layout}
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
                layout={{ title: 'Sharpe Ratios', autosize: true, 
                plot_bgcolor: '#1b1b1b',
                paper_bgcolor: '#1b1b1b',
                font: {
                  color: '#ffffff'
                }}}
                useResizeHandler
                className="w-full h-96 lg:h-60"
              />
            </div>
          )}
          {Object.keys(sharpeRatios).length > 0 && (
            <div className="">
              <Plot
                data={[sortinoRatioData]}
                layout={{ title: 'Sortino Ratios', autosize: true,
                plot_bgcolor: '#1b1b1b',
                paper_bgcolor: '#1b1b1b',
                font: {
                  color: '#ffffff'
                }}}
                useResizeHandler
                className="w-full h-96 lg:h-60"
              />
            </div>
          )}
          {Object.keys(sharpeRatios).length > 0 && (
            <div className="">
              <Plot
                data={[omegaRatioData]}
                layout={{ title: 'Omega Ratios', autosize: true, 
                plot_bgcolor: '#1b1b1b',
                paper_bgcolor: '#1b1b1b',
                font: {
                  color: '#ffffff'
                } }}
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

export default Toros;