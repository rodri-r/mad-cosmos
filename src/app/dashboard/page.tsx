// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";

type Status = "live" | "offline";

interface ChainData {
  name: string;
  latestBlock: number | string;
  blockTime: string;
  validators: number | string;
  proposals: number | string;
  status: Status;
}

interface Validator {
  moniker: string;
  commission: string;
  chain: string;
  link: string;
}

export default function Dashboard() {
  /* ------------------- chain table data ------------------- */
  const [chains, setChains] = useState<ChainData[]>([]);

  /* ------------------- validator of the minute ------------------- */
  const [validator, setValidator] = useState<Validator | null>(null);

  /* ------------------- fetch everything ------------------- */
  useEffect(() => {
    const fetchAll = async () => {
      const chainList = [
        {
          key: "cosmoshub",
          label: "Cosmos Hub",
          api: "https://rest.cosmos.directory/cosmoshub",
        },
        {
          key: "osmosis",
          label: "Osmosis",
          api: "https://rest.cosmos.directory/osmosis",
        },
        {
          key: "akash",
          label: "Akash",
          api: "https://rest.cosmos.directory/akash",
        },
        {
          key: "juno",
          label: "Juno",
          api: "https://rest.cosmos.directory/juno",
        },
        {
          key: "stargaze",
          label: "Stargaze",
          api: "https://rest.cosmos.directory/stargaze",
        },
      ];

      /* ---------- Chain table ---------- */
      const tableData = await Promise.all(
        chainList.map(async (c) => {
          try {
            /* latest block */
            const latestRes = await fetch(
              `${c.api}/cosmos/base/tendermint/v1beta1/blocks/latest`,
            );
            const latest = await latestRes.json();
            const height = Number(latest.block.header.height);
            const t2 = new Date(latest.block.header.time).getTime();

            /* block time (difference with previous block) */
            let blockTime = "-";
            if (height > 1) {
              const prevRes = await fetch(
                `${c.api}/cosmos/base/tendermint/v1beta1/blocks/${height - 1}`,
              );
              const prev = await prevRes.json();
              const t1 = new Date(prev.block.header.time).getTime();
              blockTime = ((t2 - t1) / 1000).toFixed(1) + "s";
            }

            /* validators */
            const valRes = await fetch(
              `${c.api}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=500`,
            );
            const valJson = await valRes.json();
            const validatorCount = valJson.validators?.length ?? 0;

            /* proposals (voting period = 2) */
            const propRes = await fetch(
              `${c.api}/cosmos/gov/v1beta1/proposals?proposal_status=2`,
            );
            const propJson = await propRes.json();
            const proposalCount = propJson.proposals?.length ?? 0;

            return {
              name: c.label,
              latestBlock: height,
              blockTime,
              validators: validatorCount,
              proposals: proposalCount,
              status: "live" as Status,
            };
          } catch (e) {
            console.error(`Error fetching ${c.label}`, e);
            return {
              name: c.label,
              latestBlock: "-",
              blockTime: "-",
              validators: "-",
              proposals: "-",
              status: "offline" as Status,
            };
          }
        }),
      );

      setChains(tableData);

      /* ---------- Random validator of the minute ---------- */
      const randomChain =
        chainList[Math.floor(Math.random() * chainList.length)];
      const valsRes = await fetch(
        `${randomChain.api}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=500`,
      );
      const valsJson = await valsRes.json();
      const randomVal =
        valsJson.validators[
          Math.floor(Math.random() * valsJson.validators.length)
        ];
      const commission = (
        parseFloat(randomVal.commission.commission_rates.rate) * 100
      ).toFixed(2);

      setValidator({
        moniker: randomVal.description.moniker,
        commission: `${commission}%`,
        chain: randomChain.label,
        link: `https://www.mintscan.io/${randomChain.key}/validators/${randomVal.operator_address}`,
      });
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------- Render ------------------- */
  return (
    <main className="container">
      <h1 className="text-3xl font-bold text-white mb-4">
        Live Cosmos Chain Dashboard
      </h1>

      {/* ----- Validator of the Minute ----- */}
      {validator && (
        <div className="card bg-glass text-white">
          <h2 className="text-2xl font-bold mb-4">Validator of the Minute</h2>

          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-teal-600">
            {validator.moniker[0]}
          </div>

          <p className="text-xl font-semibold">
            <a
              href={validator.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {validator.moniker}
            </a>{" "}
            ({validator.chain})
          </p>

          <p className="mt-2 text-lg opacity-90">
            Commission: {validator.commission}
          </p>
        </div>
      )}

      {/* ----- Chain status table ----- */}
      <div className="table-wrapper mt-8">
        <table>
          <thead>
            <tr>
              <th>Chain</th>
              <th className="text-right">Latest Block</th>
              <th className="text-right">Block Time</th>
              <th className="text-right">Validators</th>
              <th className="text-right">Proposals</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {chains.map((c, i) => (
              <tr key={i}>
                <td className="font-medium text-white">{c.name}</td>
                <td className="text-right text-gray-300">{c.latestBlock}</td>
                <td className="text-right text-gray-300">{c.blockTime}</td>
                <td className="text-right text-gray-300">{c.validators}</td>
                <td className="text-right text-gray-300">{c.proposals}</td>
                <td className="text-right">
                  <span
                    className={`status-badge ${
                      c.status === "live" ? "status-live" : "status-offline"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
