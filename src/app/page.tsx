"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [fng, setFng] = useState("Loading...");
  const [marketCap, setMarketCap] = useState("Loading...");
  const [btcPrice, setBtcPrice] = useState("Loading...");
  const [ethPrice, setEthPrice] = useState("Loading...");
  const [atomPrice, setAtomPrice] = useState("Loading...");
  const [aktPrice, setAktPrice] = useState("Loading...");
  const [croPrice, setCroPrice] = useState("Loading...");
  const [osmoPrice, setOsmoPrice] = useState("Loading...");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fear / Greed
        const fngRes = await fetch("https://api.alternative.me/fng/");
        const fngData = await fngRes.json();
        setFng(fngData.data[0]?.value_classification ?? "N/A");

        // Market cap
        const marketRes = await fetch("https://api.coingecko.com/api/v3/global");
        const marketData = await marketRes.json();
        setMarketCap(`$${(marketData.data.total_market_cap.usd / 1e9).toFixed(1)}B`);

        // Crypto prices
        const priceRes = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cosmos,akash-network,cronos,osmosis&vs_currencies=usd",
        );
        const priceData = await priceRes.json();
        setBtcPrice(`$${priceData.bitcoin.usd.toLocaleString()}`);
        setEthPrice(`$${priceData.ethereum.usd.toLocaleString()}`);
        setAtomPrice(`$${priceData.cosmos.usd.toLocaleString()}`);
        setAktPrice(`$${priceData["akash-network"].usd.toLocaleString()}`);
        setCroPrice(`$${priceData.cronos.usd.toLocaleString()}`);
        setOsmoPrice(`$${priceData.osmosis.usd.toLocaleString()}`);
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
      <section className="hero-section">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-white">
            Welcome to Mad Cosmos
          </h1>
          <p className="text-lg text-gray-300">
            Built by Mad Scientists
          </p>
          <a href="https://www.madscientists.io" target="_blank" rel="noopener noreferrer">
            <button className="btn">
              Are you Mad?
            </button>
          </a>
        </div>
      </section>
      <hr className="divider" />
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
        <div className="card">
          <h3>ATOM Price</h3>
          <p>{atomPrice}</p>
        </div>
        <div className="card">
          <h3>AKT Price</h3>
          <p>{aktPrice}</p>
        </div>
        <div className="card">
          <h3>CRO Price</h3>
          <p>{croPrice}</p>
        </div>
        <div className="card">
          <h3>OSMO Price</h3>
          <p>{osmoPrice}</p>
        </div>
      </div>
    </div>
  );
}
