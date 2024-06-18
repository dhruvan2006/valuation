import React, { useEffect, useState } from 'react';
import TLX from '../components/TLX';
import Toros from '../components/Toros';
import axios from 'axios';

const tlxBtc = ['BTC1L', 'BTC2L', 'BTC3L', 'BTC4L', 'BTC5L'];
const tlxEth = ['ETH1L', 'ETH2L', 'ETH3L', 'ETH4L', 'ETH5L'];
const tlxSol = ['SOL1L', 'SOL2L', 'SOL3L', 'SOL4L', 'SOL5L'];

const torosBtc = ['ARB:BTCBULL3X', 'MATIC:BTCBULL3X', 'OP:BTCBULL4x', 'OP:BTCBULL3X', 'OP:BTCBULL2X'];
const torosEth = ['ARB:ETHBULL3X', 'MATIC:ETHBULL3X', 'OP:ETHBULL3X', 'OP:ETHBULL2X'];
const torosSol = ['OP:SOLBULL3X', 'OP:SOLLBULL2X'];

const Leverage = () => {
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const response = await axios.get('api/lastUpdated');
        const date = new Date(response.data['lastUpdated']);
        setLastUpdated(date);
      } catch (error) {
        console.error('Error fetching last updated time');
      }
    }

    fetchLastUpdated();
  }, []);

  const timeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
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

  return (
    <div className='mx-16'>
      <div className='text-center mb-4'>
        <h1 className='text-white text-4xl font-semibold'>Leveraged Tokens Comparision</h1>
        <p className='text-zinc-300'>Last updated: <span className='font-semibold'>{lastUpdated ? timeAgo(lastUpdated) : 'Loading...'}</span></p>
      </div>

      <TLX assets={tlxBtc} name={'BTC'} />
      <TLX assets={tlxEth} name={'ETH'} />
      <TLX assets={tlxSol} name={'SOL'} />
      
      <Toros assets={torosBtc} name={'BTC'} />
      <Toros assets={torosEth} name={'ETH'} />
      <Toros assets={torosSol} name={'SOL'} />
    </div>
  );
}

export default Leverage;
