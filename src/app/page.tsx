// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [fng, setFng] = useState<string>('Loading...');
  const [marketCap, setMarketCap] = useState<string>('Loading...');
  const [btcPrice, setBtcPrice] = useState<string>('Loading...');
  const [ethPrice, setEthPrice] = useState<string>('Loading...');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fear / Greed
        const fngRes = await fetch('https://api.alternative.me/fng/');
        const fngData = await fngRes.json();
        setFng(fngData.data[0]?.value_classification ?? 'N/A');

        // Market cap
        const marketRes = await fetch('https://api.coingecko.com/api/v3/global');
        const marketData = await marketRes.json();
        setMarketCap(
          `$${(marketData.data.total_market_cap.usd / 1e9).toFixed(1)}B`,
        );

        // BTC & ETH prices
        const priceRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
        );
        const priceData = await priceRes.json();
        setBtcPrice(`$${priceData.bitcoin.usd.toLocaleString()}`);
        setEthPrice(`$${priceData.ethereum.usd.toLocaleString()}`);
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* ---- Stats cards ---- */}
      <div className="stats-grid">
        <div className="card">
          <h3>Fear / Greed</h3>
          <p>{fng}</p>
        </div>
        <div className="card">
          <h3>Market Cap</h3>
          <p>{marketCap}</p>
        </div>
        <div className="card">
          <h3>BTC Price</h3>
          <p>{btcPrice}</p>
        </div>
        <div className="card">
          <h3>ETH Price</h3>
          <p>{ethPrice}</p>
        </div>
      </div>
    </div>
  );
}
